import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CarDetailModal from "../../components/CarDetailModal/CarDetailModal";
import { FaHeart, FaMapMarkerAlt, FaRoad, FaCogs, FaGasPump } from "react-icons/fa";
import "./sevimli.css";

function Sevimli() {
  const { cars, favorites, toggleFavorite } = useContext(AppContext);
  const [selectedCar, setSelectedCar] = useState(null);

  // Filter cars that are in favorites
  const favoriteCars = cars.filter((car) => favorites.includes(car.id));

  return (
    <div className="sevimli-container">
      <div className="sevimli-header">
        <h1>Tanlangan e'lonlar</h1>
        <p>Sizga ma'qul kelgan avtomobillar ro'yxati (Jami: {favoriteCars.length} ta)</p>
      </div>

      {favoriteCars.length > 0 ? (
        <div className="cars-grid">
          {favoriteCars.map((car) => {
            const isFav = favorites.includes(car.id);
            return (
              <div key={car.id} className="car-card">
                <div className="car-card-image">
                  <img src={car.image} alt={`${car.brand} ${car.model}`} />
                  <button
                    className={`favorite-btn ${isFav ? "active" : ""}`}
                    onClick={() => toggleFavorite(car.id)}
                  >
                    <FaHeart />
                  </button>
                  <span className="car-category-tag">{car.category}</span>
                </div>

                <div className="car-card-body">
                  <div className="car-title-row">
                    <h3>{car.brand} {car.model}</h3>
                    <span className="car-card-year">{car.year}-yil</span>
                  </div>
                  
                  <div className="car-city"><FaMapMarkerAlt /> {car.city}</div>

                  <div className="car-specs">
                    <span title="Yurgani"><FaRoad /> {car.mileage.toLocaleString()} km</span>
                    <span title="KPP"><FaCogs /> {car.transmission}</span>
                    <span title="Yoqilg'i"><FaGasPump /> {car.fuel}</span>
                  </div>

                  <div className="car-card-footer">
                    <div className="car-price">${car.price.toLocaleString()}</div>
                    <button className="view-details-btn" onClick={() => setSelectedCar(car)}>
                      Batafsil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-favorites">
          <div className="empty-icon">❤️</div>
          <h2>Sevimlilar ro'yxati bo'sh</h2>
          <p>Hozircha hech qanday e'lonni tanlanganlar ro'yxatiga qo'shmagansiz.</p>
          <Link to="/elonlar" className="explore-btn">
            E'lonlarni ko'rish
          </Link>
        </div>
      )}

      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedCar.id)}
        />
      )}
    </div>
  );
}

export default Sevimli;
