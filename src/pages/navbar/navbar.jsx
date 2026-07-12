import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FaRegBell, FaRegHeart, FaPlus } from "react-icons/fa";

import "./navbar.css";

function Navbar() {
  return (
    <div className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="" />
            <h3>AvtoSavto</h3>
          </Link>
        </div>
        <div className="navbar">
          <nav>
            <ul>
              <li>
                <NavLink to="/">Bosh sahifa</NavLink>
              </li>
              <li>
                <NavLink to="/elonlar">E'lonlar</NavLink>
              </li>
              <li>
                <NavLink to="/sevimli">Sevimlilar</NavLink>
              </li>
              <li>
                <NavLink to="/xizmatlar">Xizmatlar</NavLink>
              </li>
              <li>
                <NavLink to="/yordam">Yordam</NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <div className="home-header-actions">
          <div className="home-header-actions-link">
            <Link to="/">
              <FaRegHeart />
            </Link>
            <Link to="/">
              <FaRegBell />
            </Link>
          </div>
          <button>
            E'lon berish <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
