import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CarDetailModal from "../../components/CarDetailModal/CarDetailModal";
import CarCard from "../../components/CarCard/CarCard";
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
          {favoriteCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
              onViewDetails={setSelectedCar}
            />
          ))}
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
