import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCalendarAlt,
  FaRoad,
  FaCogs,
  FaGasPump,
  FaPalette,
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import "./elon-details.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ElonDetails() {
  const { id } = useParams();
  const { favorites, toggleFavorite } = useContext(AppContext);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery slider state
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) {
          throw new Error(
            "Avtomobil ma'lumotlarini yuklashda xatolik yuz berdi yoki e'lon o'chirilgan.",
          );
        }
        const data = await res.json();
        setCar(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="details-loading-container">
        <div className="details-spinner" />
        <p>Avtomobil ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="details-error-container">
        <h2>Xatolik yuz berdi</h2>
        <p>{error || "E'lon topilmadi."}</p>
        <Link to="/elonlar" className="back-to-ads-btn">
          E'lonlar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  // Handle images normalisation (support legacy single image or array)
  const images =
    car.images && car.images.length > 0
      ? car.images
      : [
          car.image ||
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        ];

  const isFavorite = favorites.includes(car._id);

  // Carousel handlers
  const handlePrevImg = () => {
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomScale(1); // reset zoom if sliding inside lightbox
  };

  const handleNextImg = () => {
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomScale(1); // reset zoom if sliding inside lightbox
  };

  // Lightbox zoom handlers
  const zoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  };

  const resetZoom = () => {
    setZoomScale(1);
  };

  const handleImageClick = () => {
    setIsLightboxOpen(true);
    setZoomScale(1);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setZoomScale(1);
  };

  return (
    <div className="details-page-wrapper">
      <div className="details-container">
        {/* Navigation Breadcrumb */}
        <div className="details-breadcrumb">
          <Link to="/">Bosh sahifa</Link> <span>/</span>
          <Link to="/elonlar">E'lonlar</Link> <span>/</span>
          <span className="current-crumb">
            {car.brand} {car.model}
          </span>
        </div>

        <div className="details-grid">
          {/* Left Column: Media Gallery */}
          <div className="details-media-column">
            <div className="main-carousel">
              <div className="main-image-wrapper" onClick={handleImageClick}>
                <img
                  src={images[currentImgIndex]}
                  alt={`${car.brand} ${car.model} - ${currentImgIndex + 1}`}
                  className="carousel-main-image"
                />
                <div className="image-zoom-overlay">
                  <FaSearchPlus /> Kattalashtirish uchun bosing
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    className="carousel-nav-btn prev"
                    onClick={handlePrevImg}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="carousel-nav-btn next"
                    onClick={handleNextImg}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="thumbnails-grid">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${index === currentImgIndex ? "active" : ""}`}
                    onClick={() => setCurrentImgIndex(index)}
                  >
                    <img src={img} alt={`thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Car Information */}
          <div className="details-info-column">
            <div className="info-header-card">
              <div className="tag-row">
                <span className="category-badge">{car.category}</span>
                <button
                  className={`fav-button ${isFavorite ? "active" : ""}`}
                  onClick={() => toggleFavorite(car._id)}
                  title={
                    isFavorite
                      ? "Sevimlilardan o'chirish"
                      : "Sevimlilarga qo'shish"
                  }
                >
                  {isFavorite ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              <h1 className="car-fullname-title">
                {car.brand} {car.model}
              </h1>
              <div className="price-display">${car.price.toLocaleString()}</div>

              <div className="location-row">
                <FaMapMarkerAlt /> <span>{car.city} shahri</span>
              </div>
            </div>

            {/* Core Specifications */}
            <div className="specs-card">
              <h3>Texnik parametrlari</h3>
              <div className="specs-detail-grid">
                <div className="spec-detail-item">
                  <FaCalendarAlt className="spec-detail-icon" />
                  <div className="spec-text">
                    <span className="label">Yili</span>
                    <span className="value">{car.year}-yil</span>
                  </div>
                </div>

                <div className="spec-detail-item">
                  <FaRoad className="spec-detail-icon" />
                  <div className="spec-text">
                    <span className="label">Yurgani</span>
                    <span className="value">
                      {car.mileage.toLocaleString()} km
                    </span>
                  </div>
                </div>

                <div className="spec-detail-item">
                  <FaCogs className="spec-detail-icon" />
                  <div className="spec-text">
                    <span className="label">KPP (Uzatish qutisi)</span>
                    <span className="value">{car.transmission}</span>
                  </div>
                </div>

                <div className="spec-detail-item">
                  <FaGasPump className="spec-detail-icon" />
                  <div className="spec-text">
                    <span className="label">Yoqilg'i turi</span>
                    <span className="value">{car.fuel}</span>
                  </div>
                </div>

                <div className="spec-detail-item">
                  <span className="spec-detail-icon-text">V</span>
                  <div className="spec-text">
                    <span className="label">Dvigatel hajmi</span>
                    <span className="value">{car.engineVolume || "1.5 L"}</span>
                  </div>
                </div>

                <div className="spec-detail-item">
                  <FaPalette className="spec-detail-icon" />
                  <div className="spec-text">
                    <span className="label">Tashqi rangi</span>
                    <span className="value">{car.color || "Oq"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="description-card">
              <h3>Qo'shimcha ma'lumot (Tavsif)</h3>
              <p className="description-text">
                {car.description ||
                  "Avtomobil haqida qo'shimcha ma'lumotlar kiritilmagan."}
              </p>
            </div>

            {/* Owner Contact */}
            <div className="contact-card">
              <div className="owner-profile-row">
                <div className="owner-avatar-circle">
                  {car.user && car.user.photo_url ? (
                    <img src={car.user.photo_url} alt="Owner" />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div className="owner-meta-text">
                  <span className="role-tag">Sotuvchi</span>
                  <h4>
                    {car.user
                      ? `${car.user.first_name} ${car.user.last_name || ""}`
                      : "Jismoniy shaxs"}
                  </h4>
                  {car.user && car.user.username && (
                    <Link to={`https://t.me/${car.user.username}`}>
                      <span className="tg-username">@{car.user.username}</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="phone-action-area">
                <p>Telefon raqami orqali bog'lanish:</p>
                <a href={`tel:${car.ownerPhone}`} className="owner-phone-link">
                  <FaPhoneAlt /> {car.ownerPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom & Navigation Modal */}
      {isLightboxOpen && (
        <div className="lightbox-modal">
          <div className="lightbox-overlay" onClick={handleCloseLightbox} />

          {/* Lightbox Controls Header */}
          <div className="lightbox-controls">
            <span className="lightbox-indicator">
              {currentImgIndex + 1} / {images.length}
            </span>
            <div className="lightbox-zoom-buttons">
              <button onClick={zoomIn} title="Yaqinlashtirish">
                <FaSearchPlus />
              </button>
              <button onClick={zoomOut} title="Uzoqlashtirish">
                <FaSearchMinus />
              </button>
              {zoomScale !== 1 && (
                <button
                  onClick={resetZoom}
                  className="btn-reset-zoom"
                  title="Asliga qaytarish"
                >
                  1:1
                </button>
              )}
            </div>
            <button
              className="lightbox-close-btn"
              onClick={handleCloseLightbox}
              title="Yopish"
            >
              <FaTimes />
            </button>
          </div>

          {/* Lightbox Gallery Content */}
          <div className="lightbox-content">
            {images.length > 1 && (
              <button
                className="lightbox-arrow-btn left"
                onClick={handlePrevImg}
              >
                <FaChevronLeft />
              </button>
            )}

            <div className="lightbox-image-container">
              <img
                src={images[currentImgIndex]}
                alt="Enlarged view"
                style={{
                  transform: `scale(${zoomScale})`,
                  transition: zoomScale === 1 ? "transform 0.2s ease" : "none",
                }}
                className="lightbox-img"
              />
            </div>

            {images.length > 1 && (
              <button
                className="lightbox-arrow-btn right"
                onClick={handleNextImg}
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ElonDetails;
