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
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/avtosavdo";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkeyforavtosavdo";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";

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
    return res.status(401).json({ error: "Noto'g'ri yoki muddati o'tgan token" });
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
  const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return hmac === hash;
}

// Routes
// 1. Auth: Telegram Login / Mock Login
app.post("/api/auth/telegram", async (req, res) => {
  try {
    const authData = req.body;
    const { id, first_name, last_name, username, photo_url } = authData;

    if (!id) {
      return res.status(400).json({ error: "Foydalanuvchi IDsi talab etiladi" });
    }

    // Check if Bot Token is configured on the server
    if (TELEGRAM_BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN") {
      return res.status(500).json({ error: "Server sozlamalarida Telegram Bot Token ko'rsatilmagan (.env faylini tekshiring)" });
    }

    // Perform cryptographic verification
    const isValid = verifyTelegramHash(authData, TELEGRAM_BOT_TOKEN);
    if (!isValid) {
      return res.status(400).json({ error: "Telegram ma'lumotlari haqiqiyligi tasdiqlanmadi" });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ telegramId: id.toString() });
    if (!user) {
      user = new User({
        telegramId: id.toString(),
        first_name: first_name || "",
        last_name: last_name || "",
        username: username || "",
        photo_url: photo_url || ""
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
    const token = jwt.sign({ id: user._id, telegramId: user.telegramId }, JWT_SECRET, {
      expiresIn: "30d"
    });

    res.json({
      token,
      user: {
        id: user._id,
        telegramId: user.telegramId,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url
      }
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
      photo_url: req.user.photo_url
    }
  });
});

// 2. Products (Car Ads)
// Get all ads
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().populate("user", "first_name last_name username photo_url").sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ error: "E'lonlarni yuklashda xatolik yuz berdi" });
  }
});

// Get current user's ads
app.get("/api/products/my", authenticateUser, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Fetch user products error:", error);
    res.status(500).json({ error: "Sizning e'lonlaringizni yuklashda xatolik yuz berdi" });
  }
});

// Get single ad by MongoDB ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("user", "first_name last_name username photo_url");
    if (!product) {
      return res.status(404).json({ error: "E'lon topilmadi" });
    }
    res.json(product);
  } catch (error) {
    console.error("Fetch single product error:", error);
    res.status(500).json({ error: "E'lon ma'lumotlarini yuklashda xatolik yuz berdi" });
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
      city
    } = req.body;

    if (!brand || !model || !year || !price || !mileage || !ownerPhone || !city) {
      return res.status(400).json({ error: "Barcha majburiy maydonlarni to'ldiring" });
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
      user: req.user._id
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "E'lon yaratishda xatolik yuz berdi: " + error.message });
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
      return res.status(403).json({ error: "Sizda ushbu e'lonni o'chirish huquqi yo'q" });
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
});
