import React from "react";
import { FaTimes, FaMapMarkerAlt, FaPhoneAlt, FaCalendarAlt, FaRoad, FaCogs, FaGasPump, FaPalette } from "react-icons/fa";
import "./CarDetailModal.css";

function CarDetailModal({ car, onClose, onToggleFavorite, isFavorite }) {
  if (!car) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-body">
          <div className="modal-gallery">
            <img src={car.image} alt={`${car.brand} ${car.model}`} />
            <button 
              className={`modal-favorite-btn ${isFavorite ? "active" : ""}`} 
              onClick={() => onToggleFavorite(car.id)}
            >
              ★ {isFavorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
            </button>
          </div>

          <div className="modal-info">
            <div className="modal-header-info">
              <span className="modal-category">{car.category}</span>
              <h2>{car.brand} {car.model}</h2>
              <div className="modal-price">${car.price.toLocaleString()}</div>
            </div>

            <div className="modal-city-box">
              <FaMapMarkerAlt /> <span>{car.city} shahri</span>
            </div>

            <div className="modal-specs-grid">
              <div className="spec-item">
                <FaCalendarAlt className="spec-icon" />
                <div className="spec-details">
                  <span className="spec-label">Yili</span>
                  <span className="spec-value">{car.year}-yil</span>
                </div>
              </div>

              <div className="spec-item">
                <FaRoad className="spec-icon" />
                <div className="spec-details">
                  <span className="spec-label">Yurgani</span>
                  <span className="spec-value">{car.mileage.toLocaleString()} km</span>
                </div>
              </div>

              <div className="spec-item">
                <FaCogs className="spec-icon" />
                <div className="spec-details">
                  <span className="spec-label">Uzatish qutisi</span>
                  <span className="spec-value">{car.transmission}</span>
                </div>
              </div>

              <div className="spec-item">
                <FaGasPump className="spec-icon" />
                <div className="spec-details">
                  <span className="spec-label">Yoqilg'i</span>
                  <span className="spec-value">{car.fuel}</span>
                </div>
              </div>

              <div className="spec-item">
                <span className="spec-icon-text">V</span>
                <div className="spec-details">
                  <span className="spec-label">Dvigatel hajmi</span>
                  <span className="spec-value">{car.engineVolume || "Noma'lum"}</span>
                </div>
              </div>

              <div className="spec-item">
                <FaPalette className="spec-icon" />
                <div className="spec-details">
                  <span className="spec-label">Rangi</span>
                  <span className="spec-value">{car.color || "Noma'lum"}</span>
                </div>
              </div>
            </div>

            <div className="modal-description">
              <h3>Tavsif</h3>
              <p>{car.description}</p>
            </div>

            <div className="modal-contact">
              <div className="contact-label">Sotuvchi bilan bog'lanish:</div>
              <a href={`tel:${car.ownerPhone}`} className="contact-phone-btn">
                <FaPhoneAlt /> {car.ownerPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetailModal;
