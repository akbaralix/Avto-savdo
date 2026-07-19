import React, { useContext, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CarDetailModal from "../../components/CarDetailModal/CarDetailModal";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaRoad,
  FaCogs,
  FaGasPump,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./elonlar.css";

function Elonlar() {
  const { cars, favorites, toggleFavorite } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Sidebar yoki filtrlar qismini yopib-ochish holati
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Search parameters or home page query params
  const paramBrand = searchParams.get("brand") || "";
  const paramCategory = searchParams.get("category") || "";
  const paramCity = searchParams.get("city") || "";

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(paramBrand);
  const [selectedCategory, setSelectedCategory] = useState(paramCategory);
  const [selectedCity, setSelectedCity] = useState(paramCity);
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [selectedCar, setSelectedCar] = useState(null);

  // Sync state if URL params change
  useEffect(() => {
    setSelectedBrand(searchParams.get("brand") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedCity(searchParams.get("city") || "");
  }, [searchParams]);

  // Unique options for dropdowns
  const brands = [...new Set(cars.map((c) => c.brand))];
  const categories = [...new Set(cars.map((c) => c.category))];
  const cities = [...new Set(cars.map((c) => c.city))];

  // Filtering logic
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand ? car.brand === selectedBrand : true;
    const matchesCategory = selectedCategory
      ? car.category === selectedCategory
      : true;
    const matchesCity = selectedCity ? car.city === selectedCity : true;
    const matchesTransmission = selectedTransmission
      ? car.transmission === selectedTransmission
      : true;
    const matchesFuel = selectedFuel ? car.fuel.includes(selectedFuel) : true;
    const matchesPrice = maxPrice ? car.price <= parseInt(maxPrice) : true;

    return (
      matchesSearch &&
      matchesBrand &&
      matchesCategory &&
      matchesCity &&
      matchesTransmission &&
      matchesFuel &&
      matchesPrice
    );
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedCity("");
    setSelectedTransmission("");
    setSelectedFuel("");
    setMaxPrice("");
    setSearchParams({});
  };

  return (
    <div className="elonlar-container">
      <div className="elonlar-header">
        <h1>Avtomobil e'lonlari</h1>
        <p>
          Jami topildi: <strong>{filteredCars.length} ta</strong> avtomobil
        </p>
      </div>{" "}
      <div className="filter-item">
        <label>Qidiruv</label>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Model yoki marka..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>
      </div>
      <div className="elonlar-content">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h3>
              <FaFilter /> Filtrlar
            </h3>
            <div className="sidebar-header-btns">
              <button
                className="reset-filters-btn"
                onClick={handleResetFilters}
              >
                Tozalash
              </button>
              {/* Yopib-ochuvchi tugma */}
              <button
                className="toggle-filters-btn"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-label="Filtrlarni ko'rsatish yoki yashirish"
              >
                {isFilterOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>

          <div
            className={`filters-collapsible ${isFilterOpen ? "is-open" : ""}`}
          >
            <div className="filter-item">
              <label>Marka</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">Barchasi</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Kuzov turi</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Barchasi</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Shahar</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Barchasi</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Uzatish qutisi (KPP)</label>
              <select
                value={selectedTransmission}
                onChange={(e) => setSelectedTransmission(e.target.value)}
              >
                <option value="">Barchasi</option>
                <option value="Avtomat">Avtomat</option>
                <option value="Mexanika">Mexanika</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Yoqilg'i turi</label>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
              >
                <option value="">Barchasi</option>
                <option value="Benzin">Benzin</option>
                <option value="Gaz">Gaz</option>
                <option value="Elektro">Elektro</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Maksimal narx ($)</label>
              <input
                type="number"
                placeholder="Masalan: 20000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="listings-main">
          {filteredCars.length > 0 ? (
            <div className="elonlar-grid">
              {filteredCars.map((car) => {
                const isFav = favorites.includes(car.id);
                return (
                  <Link to={`/elon/${car._id}`}>
                    <div key={car.id} className="car-card">
                      <div className="car-card-image">
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                        />
                        <button
                          className={`favorite-btn ${isFav ? "active" : ""}`}
                          onClick={() => toggleFavorite(car.id)}
                        >
                          {isFav ? <FaHeart /> : <FaRegHeart />}
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
                            onClick={() => setSelectedCar(car)}
                          >
                            Batafsil
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="no-cars-found">
              <h2>Afsuski, hech qanday avtomobil topilmadi.</h2>
              <p>
                Iltimos, filtrlash parametrlarini o'zgartirib qayta urinib
                ko'ring.
              </p>
              <button className="clear-btn" onClick={handleResetFilters}>
                Filtrlarni tozalash
              </button>
            </div>
          )}
        </main>
      </div>
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

export default Elonlar;
