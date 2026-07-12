import React from "react";
import { FaPlus } from "react-icons/fa";

import "./home.css";
function Home() {
  return (
    <div>
      <div className="promo-banner">
        <div className="promo-banner-content">
          <div class="hero__promo-badge">
            <span>⚡ Avtomobil sotish va sotib olish endi oson!</span>
          </div>
          <div className="hero__promo-content">
            <h2>
              Avtomabilingizni oson{" "}
              <span style={{ color: "rgb(46, 49, 211)" }}>soting</span> yoki
              sotib <span style={{ color: "rgb(46, 49, 211)" }}>oling</span>
            </h2>
            <p>
              AvtoSavdo - Ishonchlik va qulay avtomabil e'lonlar platformasi.
              Yaxshi avtomabil toping yoki o'zingiznikini tez soting.
            </p>
          </div>

          <div className="promo-banner-button">
            <button className="btn-primary">
              Elon berish <FaPlus />
            </button>
            <button className="btn-secondary">Qanday ishlaydi ▶</button>
          </div>
        </div>

        <div className="promo-banner-img">
          <img
            src="https://parkers-images.bauersecure.com/wp-images/287037/cut-out/1200x800/040-bmw-m5-review.jpg?mode=max&quality=90&scale=down"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
