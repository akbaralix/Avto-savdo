import React, { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { FaRegBell, FaRegHeart, FaHeart, FaPlus, FaBars, FaTimes, FaRegUser, FaUser } from "react-icons/fa";

import "./navbar.css";

function Navbar() {
  const { favorites, user } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  const handlePostAd = () => {
    handleCloseMenu();
    navigate("/elon-berish");
  };

  return (
    <div className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={handleCloseMenu}>
            <img src="/logo.png" alt="AvtoSavdo Logo" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=32&q=80" }} />
            <h3>AvtoSavdo</h3>
          </Link>
        </div>

        {/* Hamburger Menu Icon for Mobile */}
        <button className="menu-toggle-btn" onClick={handleToggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Menu */}
        <div className={`navbar ${menuOpen ? "open" : ""}`}>
          <nav>
            <ul>
              <li>
                <NavLink to="/" onClick={handleCloseMenu}>Bosh sahifa</NavLink>
              </li>
              <li>
                <NavLink to="/elonlar" onClick={handleCloseMenu}>E'lonlar</NavLink>
              </li>
              <li>
                <NavLink to="/sevimli" onClick={handleCloseMenu}>Sevimlilar</NavLink>
              </li>
              <li>
                <NavLink to="/xizmatlar" onClick={handleCloseMenu}>Xizmatlar</NavLink>
              </li>
              <li>
                <NavLink to="/yordam" onClick={handleCloseMenu}>Yordam</NavLink>
              </li>
              {/* Profile Link in Mobile Menu */}
              <li className="mobile-only-profile">
                <NavLink to="/profile" onClick={handleCloseMenu}>
                  {user ? `Profil (${user.first_name})` : "Kirish"}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        {/* Actions (Heart, Bell, User Profile, Post Ad) */}
        <div className="home-header-actions">
          <div className="home-header-actions-link">
            <Link to="/sevimli" className="fav-action-link" title="Sevimlilar">
              {favorites.length > 0 ? <FaHeart style={{ color: "#ff3b30" }} /> : <FaRegHeart />}
              {favorites.length > 0 && (
                <span className="badge">{favorites.length}</span>
              )}
            </Link>
            <Link to="/yordam" title="Yordam / Bildirishnomalar">
              <FaRegBell />
            </Link>
            
            {/* User Profile Link */}
            <Link to="/profile" className="profile-action-link" title={user ? "Profil" : "Kirish"}>
              {user ? (
                user.photo_url ? (
                  <img src={user.photo_url} alt="Profile" className="navbar-avatar-img" />
                ) : (
                  <FaUser />
                )
              ) : (
                <FaRegUser />
              )}
            </Link>
          </div>
          <button className="post-ad-btn" onClick={handlePostAd}>
            E'lon berish <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
