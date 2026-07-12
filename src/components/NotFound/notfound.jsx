import React from "react";
import { Link } from "react-router-dom";
import "./notfonud.css";

function Notfonud() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Afsuski bunday sahifa topilmadi.</h2>
      <p>Kiritilgan havola notog'ri, yoki bunday sahifa mavjud emas.</p>

      <Link to="/">Bosh sahifaga qaytish</Link>
    </div>
  );
}

export default Notfonud;
