import React, { useState } from "react";
import { FaCalculator, FaShieldAlt, FaCar, FaWrench } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./xizmatlar.css";

function Xizmatlar() {
  // Calculator states
  const [carPrice, setCarPrice] = useState(15000);
  const [initialPaymentPercent, setInitialPaymentPercent] = useState(30);
  const [loanTerm, setLoanTerm] = useState(36); // months
  const [interestRate, setInterestRate] = useState(22); // annual %

  // Calculations
  const initialPaymentAmount = (carPrice * initialPaymentPercent) / 100;
  const loanAmount = carPrice - initialPaymentAmount;
  const monthlyRate = interestRate / 12 / 100;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1)
      : loanAmount / loanTerm;

  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="xizmatlar-container">
      <div className="xizmatlar-header">
        <h1>Bizning Xizmatlar</h1>
        <p>
          AvtoSavdo platformasidagi qo'shimcha imkoniyatlar va moliyaviy
          xizmatlar
        </p>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon-wrapper">
            <FaCalculator />
          </div>
          <h3>Avtokredit</h3>
          <p>
            Hamkor banklarimizdan eng maqbul shartlarda avtokredit
            rasmiylashtiring. Kalkulyatordan foydalanib o'z to'lovingizni
            hisoblang.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon-wrapper">
            <FaShieldAlt />
          </div>
          <h3>Sug'urta (KASKO / O'SAGo)</h3>
          <p>
            Avtomobilingizni bir necha daqiqada sug'urta qiling. Yetakchi
            sug'urta kompaniyalaridan eng yaxshi takliflarni solishtiring.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon-wrapper">
            <FaCar />
          </div>
          <h3>Avto Baholash</h3>
          <p>
            Sotmoqchi bo'lgan mashinangizning bozor qiymatini bepul va tezkor
            baholab oling. Sun'iy intellekt orqali to'g'ri narx belgilash.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon-wrapper">
            <FaWrench />
          </div>
          <h3>Texnik Ko'rik</h3>
          <p>
            Sotib olishdan oldin mashinani to'liq diagnostika qildiring.
            Professional ustalarimiz tomonidan batafsil tekshiruv hisoboti.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Xizmatlar;
