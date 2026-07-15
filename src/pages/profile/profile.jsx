import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import TelegramLoginButton from "../../components/TelegramLoginButton/TelegramLoginButton";
import {
  FaUser,
  FaPlus,
  FaTrash,
  FaSignOutAlt,
  FaCar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaHourglassHalf,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./profile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
  const { user, token, login, logout, deleteCar } = useContext(AppContext);

  const [myCars, setMyCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Fetch current user's ads if logged in
  const fetchMyCars = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingCars(true);
      const res = await fetch(`${API_URL}/api/products/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const normalized = data.map((car) => {
          const id = car._id || car.id;
          const images =
            car.images && car.images.length > 0
              ? car.images
              : [car.image || "/assets/devault-avatar.jpg"];
          return {
            ...car,
            id,
            _id: id,
            images,
            image: images[0],
          };
        });
        setMyCars(normalized);
      } else {
        console.error("Failed to fetch my cars");
      }
    } catch (err) {
      console.error("Error fetching my cars:", err);
    } finally {
      setLoadingCars(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMyCars();
    }
  }, [token, fetchMyCars]);

  const handleTelegramAuth = () => {
    // Login completes automatically inside TelegramLoginButton
  };

  const handleDeleteAd = async (carId) => {
    if (
      window.confirm("Haqiqatan ham ushbu e'lonni o'chirib tashlamoqchimisiz?")
    ) {
      try {
        await deleteCar(carId);
        setMyCars((prev) => prev.filter((c) => c._id !== carId));
        toast.success("E'lon muvaffaqiyatli o'chirildi!");
      } catch (err) {
        toast.error(err.message || "E'lonni o'chirishda xatolik yuz berdi");
      }
    }
  };

  const getBotUsername = () => {
    return (
      import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "YOUR_TELEGRAM_BOT_USERNAME"
    );
  };

  // 1. Not Logged In View
  if (!user) {
    return (
      <div className="profile-container logged-out">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon-wrapper">
              <FaUser className="login-icon" />
            </div>
            <h2>Shaxsiy profil</h2>
            <p>
              E'lonlarni boshqarish va yangilarini joylashtirish uchun
              hisobingizga kiring
            </p>
          </div>

          <div className="login-action-container">
            <TelegramLoginButton onAuth={handleTelegramAuth} />
          </div>

          <div className="login-footer">
            <p>Telegram orqali xavfsiz va tezkor kirish tizimi</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged In View
  return (
    <div className="profile-container logged-in">
      <div className="profile-layout">
        {/* Profile Card Sidebar */}
        <aside className="profile-sidebar">
          <div className="user-details-card">
            <div className="avatar-wrapper">
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt="Profile"
                  className="user-avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  <img src="/src/assets/devault-avatar.jpg" alt="" />
                </div>
              )}
            </div>

            <h2 className="user-fullname">
              {user.first_name} {user.last_name}
            </h2>

            {user.username && <p className="user-username">@{user.username}</p>}

            <div className="user-meta">
              <span className="meta-label">Telegram ID:</span>
              <span className="meta-value">{user.telegramId}</span>
            </div>

            <button className="logout-btn" onClick={logout}>
              <FaSignOutAlt /> Chiqish
            </button>
          </div>
        </aside>

        {/* Profile Main Content */}
        <main className="profile-main">
          <div className="section-header">
            <div className="title-area">
              <h2>Mening e'lonlarim</h2>
              <span className="ads-count">{myCars.length} ta e'lon</span>
            </div>
            <Link to="/elon-berish" className="add-new-ad-btn">
              <FaPlus /> Yangi e'lon
            </Link>
          </div>

          {loadingCars ? (
            <div className="profile-loading">
              <div className="spinner-icon spinning" />
              <p>E'lonlaringiz yuklanmoqda...</p>
            </div>
          ) : myCars.length > 0 ? (
            <div className="my-cars-list">
              {myCars.map((car) => (
                <div key={car._id} className="my-car-row">
                  <div className="my-car-img-wrapper">
                    <img
                      src={
                        car.images && car.images.length > 0
                          ? car.images[0]
                          : car.image ||
                            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80"
                      }
                      alt={`${car.brand} ${car.model}`}
                    />
                  </div>

                  <div className="my-car-info">
                    <h3>
                      {car.brand} {car.model}
                    </h3>
                    <div className="my-car-details">
                      <span>
                        <FaCalendarAlt /> {car.year}-yil
                      </span>
                      <span>
                        <FaMapMarkerAlt /> {car.city}
                      </span>
                    </div>
                    <div className="my-car-price">
                      ${car.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="my-car-actions">
                    <Link
                      to={`/elon/${car._id}`}
                      target="_blank"
                      className="action-view-btn"
                      title="Sahifani ko'rish"
                    >
                      <FaExternalLinkAlt /> Ko'rish
                    </Link>
                    <button
                      className="action-delete-btn"
                      onClick={() => handleDeleteAd(car._id)}
                      title="O'chirish"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-ads-card">
              <div className="no-ads-icon-wrapper">
                <FaCar className="no-ads-icon" />
              </div>
              <h3>Hozircha hech qanday e'loningiz yo'q</h3>
              <p>
                Sotiladigan avtomobilingiz bormi? Birinchi e'loningizni hoziroq
                joylashtiring!
              </p>
              <Link to="/elon-berish" className="create-first-ad-btn">
                E'lon berishni boshlash
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;
