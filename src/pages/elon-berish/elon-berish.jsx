import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import {
  FaPlusCircle,
  FaCar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRoad,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaCloudUploadAlt,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import { uploadImageToSupabase } from "../../utils/supabase";
import TelegramLoginButton from "../../components/TelegramLoginButton/TelegramLoginButton";
import { toast } from "react-hot-toast";
import "./elon-berish.css";

const BRANDS_AND_MODELS = {
  Chevrolet: [
    "Spark",
    "Nexia 3",
    "Cobalt",
    "Gentra",
    "Lacetti",
    "Damas",
    "Malibu",
    "Tracker",
    "Captiva",
    "Equinox",
    "Traverse",
    "Tahoe",
    "Onix",
    "Boshqa",
  ],
  BYD: [
    "Song Plus",
    "Chazor",
    "Han",
    "Tang",
    "Destroyer 05",
    "Yuan Plus",
    "Boshqa",
  ],
  Kia: [
    "K5",
    "Sportage",
    "Sorento",
    "Carnival",
    "Cerato",
    "Pegas",
    "Sonet",
    "Boshqa",
  ],
  Hyundai: [
    "Accent",
    "Elantra",
    "Sonata",
    "Tucson",
    "Santa Fe",
    "Palisade",
    "Creta",
    "Boshqa",
  ],
  Lada: ["Vesta", "Granta", "Niva", "Largus", "XRAY", "Boshqa"],
  Toyota: [
    "Camry",
    "Corolla",
    "RAV4",
    "Land Cruiser",
    "Prado",
    "Highlander",
    "Boshqa",
  ],
  Daewoo: ["Nexia 1", "Nexia 2", "Matiz", "Damas", "Tico", "Gentra", "Boshqa"],
  Chery: ["Tiggo 7 Pro", "Tiggo 8 Pro", "Arrizo 6 Pro", "Boshqa"],
  Geely: ["Monjaro", "Coolray", "Tugella", "Emgrand", "Boshqa"],
  "Mercedes-Benz": [
    "C-Class",
    "E-Class",
    "S-Class",
    "G-Class",
    "GLE",
    "GLS",
    "Boshqa",
  ],
  BMW: ["3 Series", "5 Series", "7 Series", "X5", "X6", "X7", "M5", "Boshqa"],
  Boshqa: [],
};

const UZS_TO_USD_RATE = 12800;

const formatNumberWithSpaces = (value) => {
  if (!value && value !== 0) return "";
  const clean = value.toString().replace(/\D/g, "");
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

function ElonBerish() {
  const { addCar, user, login } = useContext(AppContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form states
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("USD");
  const [mileage, setMileage] = useState("");
  const [transmission, setTransmission] = useState("Avtomat");
  const [fuel, setFuel] = useState("Benzin");
  const [category, setCategory] = useState("Sedan");
  const [engineVolume, setEngineVolume] = useState("");
  const [color, setColor] = useState("");
  const [city, setCity] = useState("Toshkent");
  const [description, setDescription] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("+998");

  // Image Upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Authentication & Confirmation Overlay states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
    }
  };

  const handleBrandChange = (e) => {
    const selected = e.target.value;
    setBrand(selected);
    setModel("");
    setCustomModel("");
    if (selected !== "Boshqa") {
      setCustomBrand("");
    }
  };

  const handleModelChange = (e) => {
    const selected = e.target.value;
    setModel(selected);
    if (selected !== "Boshqa") {
      setCustomModel("");
    }
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;

    // If they try to clear or make it shorter than the prefix
    if (!val.startsWith("+998")) {
      val = "+998";
    }

    // Extract only digits after +998
    const suffix = val.substring(4).replace(/\D/g, "");

    // Format the suffix: max 9 digits
    let digits = suffix.substring(0, 9);

    let formatted = "+998 ";
    if (digits.length > 0) {
      formatted += " (" + digits.substring(0, 2);
    }
    if (digits.length > 2) {
      formatted += ") " + digits.substring(2, 5);
    }
    if (digits.length > 5) {
      formatted += "-" + digits.substring(5, 7);
    }
    if (digits.length > 7) {
      formatted += "-" + digits.substring(7, 9);
    }

    setOwnerPhone(formatted);
  };

  const handlePriceChange = (e) => {
    setPrice(formatNumberWithSpaces(e.target.value));
  };

  const handleMileageChange = (e) => {
    setMileage(formatNumberWithSpaces(e.target.value));
  };

  const handleFiles = (files) => {
    const fileList = Array.from(files);

    // Check if adding files exceeds the limit
    if (selectedFiles.length + fileList.length > 10) {
      toast.error("Ko'pi bilan 10 ta rasm yuklash mumkin.");
      return;
    }

    const newFiles = [];
    for (const file of fileList) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} - rasm fayli emas!`);
        continue;
      }
      newFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (indexToRemove) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev[indexToRemove];
      if (fileToRemove && fileToRemove.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleTelegramAuth = () => {
    setShowLoginModal(false);
    setShowConfirmModal(true);
  };

  const submitAdData = async () => {
    setUploading(true);
    let urls = [];
    try {
      const uploadPromises = selectedFiles.map(async (item) => {
        try {
          const url = await uploadImageToSupabase(item.file);
          return url;
        } catch (err) {
          console.error("Fayl yuklashda xatolik:", err);
          throw new Error(`${item.file.name} rasmini yuklashda xatolik yuz berdi.`);
        }
      });
      urls = await Promise.all(uploadPromises);
    } catch (err) {
      setUploading(false);
      toast.error(err.message);
      return;
    }

    const defaultImage =
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";

    const cleanPrice = parseFloat(price.toString().replace(/\s+/g, "")) || 0;
    const finalPrice =
      priceCurrency === "UZS"
        ? Math.round(cleanPrice / UZS_TO_USD_RATE)
        : cleanPrice;

    const finalPhone = "+998" + ownerPhone.substring(4).replace(/\D/g, "");
    const finalBrand = brand === "Boshqa" ? customBrand : brand;
    const finalModel =
      model === "Boshqa" || brand === "Boshqa" ? customModel : model;

    const newCar = {
      brand: finalBrand,
      model: finalModel,
      year: parseInt(year),
      price: finalPrice,
      mileage: parseFloat(mileage.toString().replace(/\s+/g, "")) || 0,
      transmission,
      fuel,
      category,
      engineVolume: engineVolume || "0",
      color: color || "Belgilanmagan",
      city,
      image: urls[0] || defaultImage,
      images: urls,
      description:
        description ||
        "Avtomobil yaxshi holatda, barcha texnik ko'riklardan o'tgan.",
      ownerPhone: finalPhone,
    };

    try {
      await addCar(newCar);
      toast.success("E'loningiz muvaffaqiyatli joylashtirildi!");
      setShowConfirmModal(false);
      navigate("/elonlar");
    } catch (error) {
      toast.error("E'lonni saqlashda xatolik yuz berdi: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalBrand = brand === "Boshqa" ? customBrand : brand;
    const finalModel =
      model === "Boshqa" || brand === "Boshqa" ? customModel : model;
    const digitsOnly = ownerPhone.substring(4).replace(/\D/g, "");

    if (
      !finalBrand ||
      !finalModel ||
      !year ||
      !price ||
      !mileage ||
      !ownerPhone ||
      !description
    ) {
      toast.error("Iltimos berilgan barcha maydonlarni to'ldiring.");
      return;
    }

    if (digitsOnly.length !== 9) {
      toast.error("Sotuvchi telefon raqamini to'liq kiriting.");
      return;
    }

    const priceNum = parseFloat(price.toString().replace(/\s+/g, "")) || 0;
    if (priceCurrency === "USD" && priceNum < 100) {
      toast.error("Minimal narx 100$ bo'lishi kerak.");
      return;
    }
    if (priceCurrency === "UZS" && priceNum < 1000000) {
      toast.error("Minimal narx 1,000,000 so'm bo'lishi kerak.");
      return;
    }

    // Min 1 image validation
    if (selectedFiles.length < 1) {
      toast.error("Iltimos, kamida 1 ta avtomobil rasmini yuklang.");
      return;
    }

    if (!user) {
      // If user is not logged in, request login
      setShowLoginModal(true);
    } else {
      // If user is logged in, show confirmation modal
      setShowConfirmModal(true);
    }
  };

  const cityCategory = [
    { id: 1, citiyName: "Toshkent" },
    { id: 2, citiyName: "Andijon" },
    { id: 3, citiyName: "Namangan" },
    { id: 4, citiyName: "Samarqand" },
    { id: 5, citiyName: "Qashqadaryo" },
    { id: 10, citiyName: "Surxandaryo" },
    { id: 9, citiyName: "Sirdaryo" },
    { id: 6, citiyName: "Jizzax" },
    { id: 7, citiyName: "Termiz" },
    { id: 8, citiyName: "Navoiy" },
    { id: 11, citiyName: "Fargona" },
    { id: 12, citiyName: "Xorazim" },
  ];

  return (
    <div className="elon-berish-container">
      <div className="elon-berish-header">
        <h1>Yangi e'lon joylashtirish</h1>
        <p>
          Avtomobilingiz haqida ma'lumotlarni kiriting va tez fursatda soting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="elon-berish-form">
        <div className="elon-block">
          <div className="form-section-title">
            <h2>
              <FaCar /> Umumiy ma'lumotlar
            </h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Markasi *</label>
              <select value={brand} onChange={handleBrandChange} required>
                <option value="">Markani tanlang</option>
                {Object.keys(BRANDS_AND_MODELS).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {brand === "Boshqa" && (
              <div className="form-group">
                <label>Boshqa marka nomi *</label>
                <input
                  type="text"
                  placeholder="Markani yozing (masalan: BYD)"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Modeli *</label>
              {brand && brand !== "Boshqa" ? (
                <select value={model} onChange={handleModelChange} required>
                  <option value="">Modelni tanlang</option>
                  {BRANDS_AND_MODELS[brand].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={
                    brand === "Boshqa"
                      ? "Modelni yozing"
                      : "Avval markani tanlang"
                  }
                  value={brand === "Boshqa" ? customModel : ""}
                  onChange={(e) => setCustomModel(e.target.value)}
                  disabled={brand !== "Boshqa"}
                  required
                />
              )}
            </div>

            {model === "Boshqa" && brand !== "Boshqa" && (
              <div className="form-group">
                <label>Boshqa model nomi *</label>
                <input
                  type="text"
                  placeholder="Modelni yozing (masalan: Equinox)"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>
                <FaCalendarAlt /> Ishlab chiqarilgan yili *
              </label>
              <input
                type="number"
                min="1950"
                max="2027"
                placeholder="Masalan: 2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FaMoneyBillWave /> Narxi *
              </label>
              <div
                className="price-input-container"
                style={{ display: "flex", gap: "8px" }}
              >
                <input
                  type="text"
                  placeholder={
                    priceCurrency === "USD"
                      ? "Masalan: 12 500 (min 100$)"
                      : "Masalan: 13 000 000 (min 1 mln)"
                  }
                  value={price}
                  onChange={handlePriceChange}
                  style={{ flex: 1 }}
                  required
                />
                <select
                  value={priceCurrency}
                  onChange={(e) => {
                    setPriceCurrency(e.target.value);
                    setPrice("");
                  }}
                  style={{
                    width: "90px",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #edf2f7",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="UZS">UZS (so'm)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              <FaRoad /> Yurgan masofasi (km) *
            </label>
            <input
              type="text"
              placeholder="Masalan: 45 000"
              value={mileage}
              onChange={handleMileageChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Kuzov turi</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Sedan">Sedan</option>
              <option value="Krossover">Krossover</option>
              <option value="Elektromobil">Elektromobil</option>
              <option value="Xetchbek">Xetchbek</option>
              <option value="Yuk mashinasi">Yuk mashinasi</option>
            </select>
          </div>
        </div>

        <div className="elon-block">
          <div className="form-section-title">
            <h2>Texnik xususiyatlari</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Uzatish qutisi (KPP)</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="Avtomat">Avtomat</option>
                <option value="Mexanika">Mexanika</option>
              </select>
            </div>

            <div className="form-group">
              <label>Yoqilg'i turi</label>
              <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option value="Benzin">Benzin</option>
                <option value="Benzin / Gaz">Benzin / Gaz</option>
                <option value="Elektro">Elektro</option>
                <option value="Elektro / Gibrid">Elektro / Gibrid</option>
              </select>
            </div>

            <div className="form-group">
              <label>Dvigatel hajmi</label>
              <input
                type="text"
                placeholder="Masalan: 1.5 L, 2.0 L"
                value={engineVolume}
                onChange={(e) => setEngineVolume(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Rangi</label>
              <input
                type="text"
                placeholder="Masalan: Oq, Qora, Kulrang"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            {/* TUZATILGAN JOY: Shahar dropdown ro'yxati to'g'rilandi */}
            <div className="form-group">
              <label>
                <FaMapMarkerAlt /> Shahar
              </label>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {cityCategory.map((cityObj) => (
                  <option key={cityObj.id} value={cityObj.citiyName}>
                    {cityObj.citiyName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Custom Image Upload Section */}
        <div className="form-section-title">
          <h2>Avtomobil rasmlari *</h2>
        </div>
        <div className="image-uploader-wrapper">
          <div
            className={`drag-drop-zone ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden-file-input"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <div className="upload-instructions">
              <FaCloudUploadAlt className="upload-icon" />
              <h3>Rasmlarni yuklang</h3>
              <p>
                Rasmlarni bu yerga sudrab olib keling yoki tanlash uchun bosing
              </p>
              <span>
                Kamida 1 ta, ko'pi bilan 10 ta rasm (JPG, PNG). Birinchi rasm
                asosiy rasm bo'ladi.
              </span>
            </div>
          </div>

          {uploading && (
            <div className="upload-loader">
              <FaSpinner className="spinner-icon spinning" />
              <span>Rasmlar yuklanmoqda...</span>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="uploaded-previews-container">
              <h4>Yuklangan rasmlar ({selectedFiles.length}/10):</h4>
              <div className="previews-grid">
                {selectedFiles.map((item, index) => (
                  <div key={index} className="preview-card">
                    <img src={item.previewUrl} alt={`Preview ${index + 1}`} />
                    {index === 0 && (
                      <span className="main-tag">Asosiy rasm</span>
                    )}
                    <button
                      type="button"
                      className="delete-preview-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      title="O'chirish"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="elon-block">
          <div className="form-section-title">
            <h2>Qo'shimcha ma'lumotlar</h2>
          </div>
          <div className="form-full">
            <div className="form-group">
              <label>Tavsif</label>
              <textarea
                rows="4"
                placeholder="Avtomobil holati, qo'shimcha jihozlari va boshqa ma'lumotlar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label>
                <FaPhoneAlt /> Sotuvchi telefon raqami *
              </label>
              <input
                type="text"
                placeholder="+998 (90) 123-45-67"
                value={ownerPhone}
                onChange={handlePhoneChange}
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-ad-btn">
          <FaPlusCircle /> E'lonni joylashtirish
        </button>
      </form>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div
          className="eb-modal-overlay"
          onClick={() => setShowLoginModal(false)}
        >
          <div className="eb-modal-card">
            <h3>Tizimga kirish</h3>
            <p>
              E'loningizni saqlab qolish va platformada e'lon berish uchun
              iltimos, Telegram orqali profilingizga kiring.
            </p>
            <div className="eb-login-btn-container">
              <TelegramLoginButton onAuth={handleTelegramAuth} />
            </div>

            <button
              type="button"
              className="eb-close-modal-btn"
              onClick={() => setShowLoginModal(false)}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {showConfirmModal && (
        <div
          className="eb-modal-overlay"
          onClick={() => !uploading && setShowConfirmModal(false)}
        >
          <div className="eb-modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3>E'lonni tasdiqlash</h3>
            {uploading ? (
              <div className="eb-upload-progress" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
                <FaSpinner className="spinner-icon spinning" style={{ fontSize: "2.5rem", color: "#3b82f6" }} />
                <p style={{ marginTop: "15px", color: "#4b5563", fontSize: "1rem", textAlign: "center" }}>
                  Rasmlar Supabase-ga yuklanmoqda va e'lon saqlanmoqda...
                </p>
              </div>
            ) : (
              <>
                <p>
                  Kiritilgan ma'lumotlar bilan yangi avtomobil e'loni yaratilsinmi?
                </p>

                <div className="eb-confirm-buttons">
                  <button
                    type="button"
                    className="eb-btn-yes"
                    onClick={submitAdData}
                  >
                    Ha
                  </button>
                  <button
                    type="button"
                    className="eb-btn-no"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Yo'q
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ElonBerish;
