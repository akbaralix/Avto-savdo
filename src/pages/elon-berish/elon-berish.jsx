import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { 
  FaPlusCircle, FaCar, FaMapMarkerAlt, FaCalendarAlt, FaRoad, 
  FaMoneyBillWave, FaPhoneAlt, FaCloudUploadAlt, FaTrash, FaSpinner 
} from "react-icons/fa";
import { uploadImageToSupabase } from "../../utils/supabase";
import TelegramLoginButton from "../../components/TelegramLoginButton/TelegramLoginButton";
import "./elon-berish.css";

function ElonBerish() {
  const { addCar, user, login } = useContext(AppContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form states
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [transmission, setTransmission] = useState("Avtomat");
  const [fuel, setFuel] = useState("Benzin");
  const [category, setCategory] = useState("Sedan");
  const [engineVolume, setEngineVolume] = useState("");
  const [color, setColor] = useState("");
  const [city, setCity] = useState("Toshkent");
  const [description, setDescription] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  // Image Upload states
  const [uploadedImages, setUploadedImages] = useState([]);
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

  const handleFiles = async (files) => {
    const fileList = Array.from(files);
    
    // Check if adding files exceeds the limit
    if (uploadedImages.length + fileList.length > 10) {
      alert("Ko'pi bilan 10 ta rasm yuklash mumkin.");
      return;
    }

    setUploading(true);
    const uploadPromises = fileList.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} - rasm fayli emas!`);
        return null;
      }
      try {
        const url = await uploadImageToSupabase(file);
        return url;
      } catch (err) {
        console.error("Fayl yuklashda xatolik:", err);
        alert(`${file.name} rasmini yuklashda xatolik yuz berdi.`);
        return null;
      }
    });

    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter((url) => url !== null);
    setUploadedImages((prev) => [...prev, ...validUrls]);
    setUploading(false);
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleTelegramAuth = async (authData) => {
    try {
      setAuthError(null);
      setAuthLoading(true);
      await login(authData);
      setShowLoginModal(false);
      // Wait a tiny moment and show confirmation dialog
      setShowConfirmModal(true);
    } catch (err) {
      setAuthError(err.message || "Avtorizatsiyadan o'tishda xatolik yuz berdi");
    } finally {
      setAuthLoading(false);
    }
  };

  const submitAdData = async () => {
    const defaultImage = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";

    const newCar = {
      brand,
      model,
      year: parseInt(year),
      price: parseFloat(price),
      mileage: parseFloat(mileage),
      transmission,
      fuel,
      category,
      engineVolume: engineVolume || "1.5 L",
      color: color || "Oq",
      city,
      image: uploadedImages[0] || defaultImage,
      images: uploadedImages,
      description: description || "Avtomobil yaxshi holatda, barcha texnik ko'riklardan o'tgan.",
      ownerPhone
    };

    try {
      await addCar(newCar);
      alert("E'loningiz muvaffaqiyatli joylashtirildi!");
      setShowConfirmModal(false);
      navigate("/elonlar");
    } catch (error) {
      alert("E'lonni saqlashda xatolik yuz berdi: " + error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!brand || !model || !year || !price || !mileage || !ownerPhone) {
      alert("Iltimos, yulduzcha (*) belgilangan barcha maydonlarni to'ldiring.");
      return;
    }

    // Min 1 image validation
    if (uploadedImages.length < 1) {
      alert("Iltimos, kamida 1 ta avtomobil rasmini yuklang.");
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

  return (
    <div className="elon-berish-container">
      <div className="elon-berish-header">
        <h1>Yangi e'lon joylashtirish</h1>
        <p>Avtomobilingiz haqida ma'lumotlarni kiriting va tez fursatda soting</p>
      </div>

      <form onSubmit={handleSubmit} className="elon-berish-form">
        <div className="form-section-title">
          <h2><FaCar /> Umumiy ma'lumotlar</h2>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Markasi *</label>
            <input 
              type="text" 
              placeholder="Masalan: Chevrolet, BYD, Kia" 
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Modeli *</label>
            <input 
              type="text" 
              placeholder="Masalan: Gentra, Song Plus, K5" 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><FaCalendarAlt /> Ishlab chiqarilgan yili *</label>
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
            <label><FaMoneyBillWave /> Narxi ($) *</label>
            <input 
              type="number" 
              placeholder="Masalan: 12500" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label><FaRoad /> Yurgan masofasi (km) *</label>
            <input 
              type="number" 
              placeholder="Masalan: 45000" 
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Kuzov turi</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Sedan">Sedan</option>
              <option value="Krossover">Krossover</option>
              <option value="Elektromobil">Elektromobil</option>
              <option value="Xetchbek">Xetchbek</option>
              <option value="Yuk mashinasi">Yuk mashinasi</option>
            </select>
          </div>
        </div>

        <div className="form-section-title">
          <h2>Texnik xususiyatlari</h2>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Uzatish qutisi (KPP)</label>
            <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
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

          <div className="form-group">
            <label><FaMapMarkerAlt /> Shahar</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="Toshkent">Toshkent</option>
              <option value="Samarqand">Samarqand</option>
              <option value="Buxoro">Buxoro</option>
              <option value="Andijon">Andijon</option>
              <option value="Farg'ona">Farg'ona</option>
              <option value="Namangan">Namangan</option>
              <option value="Qarshi">Qarshi</option>
            </select>
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
              <p>Rasmlarni bu yerga sudrab olib keling yoki tanlash uchun bosing</p>
              <span>Kamida 1 ta, ko'pi bilan 10 ta rasm (JPG, PNG). Birinchi rasm asosiy rasm bo'ladi.</span>
            </div>
          </div>

          {uploading && (
            <div className="upload-loader">
              <FaSpinner className="spinner-icon spinning" />
              <span>Rasmlar yuklanmoqda...</span>
            </div>
          )}

          {uploadedImages.length > 0 && (
            <div className="uploaded-previews-container">
              <h4>Yuklangan rasmlar ({uploadedImages.length}/10):</h4>
              <div className="previews-grid">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="preview-card">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    {index === 0 && <span className="main-tag">Asosiy rasm</span>}
                    <button 
                      type="button" 
                      className="delete-preview-btn" 
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
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
            <label><FaPhoneAlt /> Sotuvchi telefon raqami *</label>
            <input 
              type="text" 
              placeholder="Masalan: +998 90 123 45 67" 
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-ad-btn">
          <FaPlusCircle /> E'lonni joylashtirish
        </button>
      </form>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="eb-modal-overlay">
          <div className="eb-modal-card">
            <h3>Tizimga kirish</h3>
            <p>E'loningizni saqlab qolish va platformada e'lon berish uchun iltimos, Telegram orqali profilingizga kiring.</p>
            
            {authError && <div className="eb-auth-error">{authError}</div>}
            
            <div className="eb-login-btn-container">
              {authLoading ? (
                <div className="eb-auth-spinner">
                  <FaSpinner className="spinner-icon spinning" />
                  <span>Tekshirilmoqda, iltimos kuting...</span>
                </div>
              ) : (
                <TelegramLoginButton
                  botName={import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "YOUR_TELEGRAM_BOT_USERNAME"}
                  onAuth={handleTelegramAuth}
                />
              )}
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
        <div className="eb-modal-overlay">
          <div className="eb-modal-card confirm-card">
            <h3>E'lonni tasdiqlash</h3>
            <p>Kiritilgan ma'lumotlar bilan yangi avtomobil e'loni yaratilsinmi?</p>
            
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
          </div>
        </div>
      )}
    </div>
  );
}

export default ElonBerish;
