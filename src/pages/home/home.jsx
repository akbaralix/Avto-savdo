import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CarDetailModal from "../../components/CarDetailModal/CarDetailModal";
import CarCard from "../../components/CarCard/CarCard";
import {
  FaPlus,
  FaSearch,
  FaCar,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaThumbsUp,
  FaCheckCircle,
  FaTelegram,
  FaInstagram,
} from "react-icons/fa";
import "./home.css";

function Home() {
  const { cars, favorites, toggleFavorite } = useContext(AppContext);
  const navigate = useNavigate();

  // Search filter states
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Selected car for modal view
  const [selectedCar, setSelectedCar] = useState(null);

  // Extract unique brands, categories, and cities
  const brands = [...new Set(cars.map((c) => c.brand))];
  const categories = [...new Set(cars.map((c) => c.category))];
  const cities = [...new Set(cars.map((c) => c.city))];

  const handleSearch = (e) => {
    e.preventDefault();
    let url = "/elonlar?";
    if (selectedBrand) url += `brand=${encodeURIComponent(selectedBrand)}&`;
    if (selectedCategory)
      url += `category=${encodeURIComponent(selectedCategory)}&`;
    if (selectedCity) url += `city=${encodeURIComponent(selectedCity)}&`;
    navigate(url.slice(0, -1)); // remove trailing & or ?
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/elonlar?category=${encodeURIComponent(categoryName)}`);
  };

  // Get 4 most recent cars for Featured Section
  const featuredCars = cars.slice(0, 4);

  return (
    <div className="home-container">
      {/* Promo Banner Section */}
      <div className="promo-banner">
        <div className="promo-banner-content">
          <div className="hero__promo-badge">
            <span>⚡ Avtomobil sotish va sotib olish endi oson!</span>
          </div>
          <div className="hero__promo-content">
            <h2>
              Avtomobilingizni oson{" "}
              <span className="accent-soting">soting</span> yoki
              sotib <span className="accent-oling">oling</span>
            </h2>
            <p>
              AvtoSavdo - Ishonchli va qulay avtomobil e'lonlari platformasi.
              Yaxshi avtomobil toping yoki o'zingiznikini tez soting.
            </p>
          </div>

          <div className="promo-banner-button">
            <Link to="/elon-berish" className="btn-primary">
              E'lon berish <FaPlus />
            </Link>
            <Link to="/yordam" className="btn-secondary">
              Qanday ishlaydi ▶
            </Link>
          </div>
        </div>

        <div className="promo-banner-img">
          <img
            src="https://pngimg.com/uploads/porsche/porsche_PNG102850.png"
            alt="Porsche"
          />
        </div>
      </div>

      {/* Advanced Search Form Section */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="filter-group">
            <label>
              <FaCar /> Marka
            </label>
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

          <div className="filter-group">
            <label>
              <FaCar /> Kuzov turi
            </label>
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

          <div className="filter-group">
            <label>
              <FaMapMarkerAlt /> Shahar
            </label>
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

          <button type="submit" className="search-btn">
            <FaSearch /> Qidirish
          </button>
        </form>
      </div>

      {/* Popular Categories */}
      <section className="home-section categories-section">
        <div className="section-header">
          <h2>Kuzov turlari bo'yicha saralash</h2>
          <p>O'zingizga ma'qul bo'lgan turdagi avtomobillarni tanlang</p>
        </div>
        <div className="categories-grid">
          {["Sedan", "Krossover", "Elektromobil", "Xetchbek"].map((cat) => (
            <div
              key={cat}
              className="category-card"
              onClick={() => handleCategoryClick(cat)}
            >
              <div className="category-icon-wrapper">
                <FaCar className="category-icon" />
              </div>
              <h3>{cat}</h3>
              <span>Ko'rish →</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="home-section featured-section">
        <div className="section-header">
          <h2>Yangi e'lonlar</h2>
          <p>Oxirgi qo'shilgan va eng ommabop takliflar</p>
        </div>

        <div className="cars-grid">
          {featuredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              isFavorite={favorites.includes(car.id)}
              onToggleFavorite={toggleFavorite}
              onViewDetails={setSelectedCar}
            />
          ))}
        </div>

        <div className="view-all-wrapper">
          <Link to="/elonlar" className="view-all-btn">
            Barcha e'lonlarni ko'rish
          </Link>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="home-section advantages-section">
        <div className="section-header">
          <h2>Nima uchun aynan AvtoSavdo?</h2>
          <p>Bizning platformamiz orqali savdo qilish qulay va tezroq</p>
        </div>

        <div className="advantages-grid">
          <div className="advantage-card">
            <FaShieldAlt className="adv-icon" />
            <h3>Xavfsiz Xarid</h3>
            <p>
              Barcha e'lonlar va sotuvchilar foydalanuvchilar xavfsizligi uchun
              tekshiriladi.
            </p>
          </div>
          <div className="advantage-card">
            <FaThumbsUp className="adv-icon" />
            <h3>Oson va Tezkor</h3>
            <p>
              E'lon joylashtirish va avtomobil qidirish atigi bir necha daqiqani
              oladi.
            </p>
          </div>
          <div className="advantage-card">
            <FaCheckCircle className="adv-icon" />
            <h3>Keng Tanlov</h3>
            <p>
              Mamlakatimiz bo'yicha minglab yangi va foydalanilgan mashinalar
              ro'yxati.
            </p>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedCar.id)}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>AvtoSavdo</h3>
            <p>O'zbekistondagi eng yirik va qulay avtomobil e'lonlari sayti.</p>
          </div>
          <div className="footer-links">
            <h4>Sahifalar</h4>
            <ul>
              <li>
                <Link to="/">Bosh sahifa</Link>
              </li>
              <li>
                <Link to="/elonlar">E'lonlar</Link>
              </li>
              <li>
                <Link to="/sevimli">Sevimlilar</Link>
              </li>
              <li>
                <Link to="/xizmatlar">Xizmatlar</Link>
              </li>
              <li>
                <Link to="/yordam">Yordam</Link>
              </li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Aloqa</h4>
            <p>Telefon: +998 (71) 123-45-67</p>
            <p>Email: support@avtosavdo.uz</p>
          </div>
          <div className="footer-social">
            <h4>Ijtimoiy tarmoqlarimiz</h4>
            <Link to={"https://t.me/avtosavdotg"}>
              <p>Telegram</p>
              <span>
                <FaTelegram />
              </span>
            </Link>
            <Link to={"https://instagram.com/avtosavtotg"}>
              <p>Instagram</p>
              <span>
                <FaInstagram />
              </span>
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} AvtoSavdo. Barcha huquqlar
            himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
