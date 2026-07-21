import React from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaRoad,
  FaCogs,
  FaGasPump,
} from "react-icons/fa";
import "./CarCard.css";

function CarCard({ car, isFavorite, onToggleFavorite, onViewDetails }) {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(car.id);
  };

  const handleDetailsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(car);
    }
  };

  return (
    <Link to={`/elon/${car._id}`} className="car-card-link">
      <div className="car-card">
        <div className="car-card-image">
          <img src={car.image} alt={`${car.brand} ${car.model}`} />
          <button
            className={`favorite-btn ${isFavorite ? "active" : ""}`}
            onClick={handleFavoriteClick}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
          <span className="car-category-tag">{car.category}</span>
        </div>

        <div className="car-card-body">
          <div className="car-title-row">
            <h3>
              {car.brand} {car.model}
            </h3>
            <span className="car-card-year">{car.year}-yil</span>
          </div>

          <div className="car-city">
            <FaMapMarkerAlt /> {car.city}
          </div>

          <div className="car-specs">
            <span title="Yurgani">
              <FaRoad /> {car.mileage.toLocaleString()} km
            </span>
            <span title="KPP">
              <FaCogs /> {car.transmission}
            </span>
            <span title="Yoqilg'i">
              <FaGasPump /> {car.fuel}
            </span>
          </div>

          <div className="car-card-footer">
            <div className="car-price">
              ${car.price.toLocaleString()}
            </div>
            <button
              className="view-details-btn"
              onClick={handleDetailsClick}
            >
              Batafsil
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CarCard;
