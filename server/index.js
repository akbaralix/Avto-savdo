import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "./models/User.js";
import Product from "./models/Product.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Auth Middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Foydalanuvchi topilmadi" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(401)
      .json({ error: "Noto'g'ri yoki muddati o'tgan token" });
  }
};

// Telegram Verification Function
function verifyTelegramHash(authData, botToken) {
  const { hash, ...data } = authData;
  if (!hash) return false;

  // Alphabetically sort keys
  const dataCheckArr = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`);
  const dataCheckString = dataCheckArr.join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
}

// Pending login sessions
const pendingSessions = new Map();

// Periodically clean up expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of pendingSessions.entries()) {
    if (now > session.expiresAt) {
      pendingSessions.delete(token);
    }
  }
}, 60000);

async function getTelegramUserPhoto(userId, botToken) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${userId}&limit=1`,
    );
    if (!res.ok) return "";
    const data = await res.json();
    if (data.ok && data.result && data.result.total_count > 0) {
      const fileId = data.result.photos[0][0].file_id;
      const fileRes = await fetch(
        `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
      );
      if (!fileRes.ok) return "";
      const fileData = await fileRes.json();
      if (fileData.ok && fileData.result && fileData.result.file_path) {
        return `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
      }
    }
  } catch (err) {
    console.error("Error fetching telegram user photo:", err);
  }
  return "";
}

// Send message helper
async function sendTelegramMessage(chatId, text) {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      },
    );
  } catch (err) {
    console.error("Error sending Telegram message:", err);
  }
}

// Long polling loop for bot
let lastUpdateId = 0;
async function pollTelegramBot() {
  if (TELEGRAM_BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN" || !TELEGRAM_BOT_TOKEN) {
    console.log("Telegram Bot Token is not configured. Polling skipped.");
    return;
  }

  // Clear webhook in case it was set previously, to make sure getUpdates works
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
    );
  } catch (err) {
    console.error("Error deleting webhook:", err);
  }

  console.log("Telegram Bot Polling started...");

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`,
      );

      if (!res.ok) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      const data = await res.json();
      if (data.ok && data.result) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;

          if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || "";
            const from = update.message.from;

            if (text.startsWith("/start")) {
              const parts = text.split(" ");
              const startToken = parts[1]; // /start <token>

              if (startToken && pendingSessions.has(startToken)) {
                const session = pendingSessions.get(startToken);

                if (Date.now() > session.expiresAt) {
                  pendingSessions.delete(startToken);
                  await sendTelegramMessage(
                    chatId,
                    "⚠️ Ushbu kirish seansining muddati tugagan. Iltimos saytdan qayta urinib ko'ring.",
                  );
                  continue;
                }

                // Get or create user in MongoDB
                const telegramId = from.id.toString();
                let photo_url = await getTelegramUserPhoto(
                  from.id,
                  TELEGRAM_BOT_TOKEN,
                );

                let user = await User.findOne({ telegramId });
                if (!user) {
                  user = new User({
                    telegramId,
                    first_name: from.first_name || "",
                    last_name: from.last_name || "",
                    username: from.username || "",
                    photo_url: photo_url || "",
                  });
                  await user.save();
                } else {
                  user.first_name = from.first_name || user.first_name;
                  user.last_name = from.last_name || user.last_name;
                  user.username = from.username || user.username;
                  if (photo_url) {
                    user.photo_url = photo_url;
                  }
                  await user.save();
                }

                // Generate JWT token
                const token = jwt.sign(
                  { id: user._id, telegramId: user.telegramId },
                  JWT_SECRET,
                  {
                    expiresIn: "30d",
                  },
                );

                // Mark session as completed
                session.status = "completed";
                session.user = {
                  id: user._id,
                  telegramId: user.telegramId,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  username: user.username,
                  photo_url: user.photo_url,
                };
                session.jwtToken = token;
                pendingSessions.set(startToken, session);

                await sendTelegramMessage(
                  chatId,
                  `🎉 Muvaffaqiyatli tizimga kirdingiz!\n\nXush kelibsiz, ${user.first_name}! Saytga qaytib shaxsiy kabinetingizdan foydalanishingiz mumkin.`,
                );
              } else {
                await sendTelegramMessage(
                  chatId,
                  "👋 AvtoSavdo botiga xush kelibsiz!\n\nTizimga kirish uchun saytdagi kirish tugmasini bosing va ushbu botga o'ting.",
                );
              }
            } else {
              await sendTelegramMessage(
                chatId,
                "AvtoSavdo botidan faqat saytga kirish uchun foydalaniladi. Tizimga kirish uchun saytdagi kirish tugmasini bosing.",
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in Telegram bot polling loop:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Routes
// 1. Auth: Telegram Login / Session Login / Mock Login
app.post("/api/auth/telegram/session", (req, res) => {
  try {
    const loginToken = crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    pendingSessions.set(loginToken, {
      status: "pending",
      user: null,
      jwtToken: null,
      expiresAt,
    });

    const botUrl =
      process.env.TELEGRAM_BOT_USERNAME || "https://t.me/Avtosavdo1bot";
    let link = "";
    if (botUrl.startsWith("http")) {
      link = `${botUrl}?start=${loginToken}`;
    } else {
      const cleanUsername = botUrl.startsWith("@") ? botUrl.slice(1) : botUrl;
      link = `https://t.me/${cleanUsername}?start=${loginToken}`;
    }

    res.json({
      token: loginToken,
      url: link,
    });
  } catch (err) {
    console.error("Session creation error:", err);
    res.status(500).json({ error: "Sessiya yaratishda xatolik yuz berdi" });
  }
});

app.get("/api/auth/telegram/status", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Token taqdim etilishi shart" });
  }

  const session = pendingSessions.get(token);
  if (!session) {
    return res.json({ status: "expired" });
  }

  if (Date.now() > session.expiresAt) {
    pendingSessions.delete(token);
    return res.json({ status: "expired" });
  }

  if (session.status === "completed") {
    pendingSessions.delete(token);
    return res.json({
      status: "completed",
      token: session.jwtToken,
      user: session.user,
    });
  }

  res.json({ status: "pending" });
});

app.post("/api/auth/telegram", async (req, res) => {
  try {
    const authData = req.body;
    const { id, first_name, last_name, username, photo_url } = authData;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Foydalanuvchi IDsi talab etiladi" });
    }

    // Check if Bot Token is configured on the server
    if (TELEGRAM_BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN") {
      return res.status(500).json({
        error:
          "Server sozlamalarida Telegram Bot Token ko'rsatilmagan (.env faylini tekshiring)",
      });
    }

    // Perform cryptographic verification
    const isValid = verifyTelegramHash(authData, TELEGRAM_BOT_TOKEN);
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Telegram ma'lumotlari haqiqiyligi tasdiqlanmadi" });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ telegramId: id.toString() });
    if (!user) {
      user = new User({
        telegramId: id.toString(),
        first_name: first_name || "",
        last_name: last_name || "",
        username: username || "",
        photo_url: photo_url || "",
      });
      await user.save();
    } else {
      // Update fields if changed
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
      user.username = username || user.username;
      user.photo_url = photo_url || user.photo_url;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, telegramId: user.telegramId },
      JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );

    res.json({
      token,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Tizimga kirishda xatolik yuz berdi" });
  }
});

// Get Current User Profile
app.get("/api/auth/me", authenticateUser, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      telegramId: req.user.telegramId,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      username: req.user.username,
      photo_url: req.user.photo_url,
    },
  });
});

// 2. Products (Car Ads)
// Get all ads
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("user", "first_name last_name username photo_url")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ error: "E'lonlarni yuklashda xatolik yuz berdi" });
  }
});

// Get current user's ads
app.get("/api/products/my", authenticateUser, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    console.error("Fetch user products error:", error);
    res
      .status(500)
      .json({ error: "Sizning e'lonlaringizni yuklashda xatolik yuz berdi" });
  }
});

// Get single ad by MongoDB ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "first_name last_name username photo_url",
    );
    if (!product) {
      return res.status(404).json({ error: "E'lon topilmadi" });
    }
    res.json(product);
  } catch (error) {
    console.error("Fetch single product error:", error);
    res
      .status(500)
      .json({ error: "E'lon ma'lumotlarini yuklashda xatolik yuz berdi" });
  }
});

// Create new ad
app.post("/api/products", authenticateUser, async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      price,
      mileage,
      transmission,
      fuel,
      category,
      images,
      engineVolume,
      color,
      description,
      ownerPhone,
      city,
    } = req.body;

    if (
      !brand ||
      !model ||
      !year ||
      !price ||
      !mileage ||
      !ownerPhone ||
      !city
    ) {
      return res
        .status(400)
        .json({ error: "Barcha majburiy maydonlarni to'ldiring" });
    }

    const newProduct = new Product({
      brand,
      model,
      year: parseInt(year),
      price: parseFloat(price),
      mileage: parseFloat(mileage),
      transmission,
      fuel,
      category,
      images: Array.isArray(images) ? images.slice(0, 10) : [],
      engineVolume: engineVolume || "1.5 L",
      color: color || "Oq",
      description: description || "",
      ownerPhone,
      city,
      user: req.user._id,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Create product error:", error);
    res
      .status(500)
      .json({ error: "E'lon yaratishda xatolik yuz berdi: " + error.message });
  }
});

// Delete ad
app.delete("/api/products/:id", authenticateUser, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "E'lon topilmadi" });
    }

    // Check ownership
    if (product.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Sizda ushbu e'lonni o'chirish huquqi yo'q" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "E'lon muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "E'lonni o'chirishda xatolik yuz berdi" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  pollTelegramBot().catch((err) => {
    console.error("Failed to start Telegram Bot Polling:", err);
  });
});
