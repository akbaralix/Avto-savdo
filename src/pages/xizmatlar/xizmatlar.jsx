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
        <p>AvtoSavdo platformasidagi qo'shimcha imkoniyatlar va moliyaviy xizmatlar</p>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon-wrapper">
            <FaCalculator />
          </div>
          <h3>Avtokredit</h3>
          <p>Hamkor banklarimizdan eng maqbul shartlarda avtokredit rasmiylashtiring. Kalkulyatordan foydalanib o'z to'lovingizni hisoblang.</p>
        </div>

        <div className="service-card">
          <div className="service-icon-wrapper">
            <FaShieldAlt />
          </div>
          <h3>Sug'urta (KASKO / O'SAGo)</h3>
          <p>Avtomobilingizni bir necha daqiqada sug'urta qiling. Yetakchi sug'urta kompaniyalaridan eng yaxshi takliflarni solishtiring.</p>
        </div>

        <div className="service-card">
          <div className="service-icon-wrapper">
            <FaCar />
          </div>
          <h3>Avto Baholash</h3>
          <p>Sotmoqchi bo'lgan mashinangizning bozor qiymatini bepul va tezkor baholab oling. Sun'iy intellekt orqali to'g'ri narx belgilash.</p>
        </div>

        <div className="service-card">
          <div className="service-icon-wrapper">
            <FaWrench />
          </div>
          <h3>Texnik Ko'rik</h3>
          <p>Sotib olishdan oldin mashinani to'liq diagnostika qildiring. Professional ustalarimiz tomonidan batafsil tekshiruv hisoboti.</p>
        </div>
      </div>

      {/* Loan Calculator Section */}
      <section className="calculator-section">
        <div className="calculator-title">
          <h2><FaCalculator /> Avtokredit Kalkulyatori</h2>
          <p>O'zingizga mos bo'lgan to'lov shartlarini hisoblang</p>
        </div>

        <div className="calculator-wrapper">
          <div className="calculator-controls">
            <div className="control-group">
              <label>Avtomobil narxi ($): <strong>{carPrice.toLocaleString()}</strong></label>
              <input 
                type="range" 
                min="5000" 
                max="100000" 
                step="500" 
                value={carPrice} 
                onChange={(e) => setCarPrice(parseInt(e.target.value))}
              />
              <div className="range-labels">
                <span>$5,000</span>
                <span>$100,000</span>
              </div>
            </div>

            <div className="control-group">
              <label>Boshlang'ich to'lov (%): <strong>{initialPaymentPercent}%</strong> (${initialPaymentAmount.toLocaleString()})</label>
              <input 
                type="range" 
                min="10" 
                max="80" 
                step="5" 
                value={initialPaymentPercent} 
                onChange={(e) => setInitialPaymentPercent(parseInt(e.target.value))}
              />
              <div className="range-labels">
                <span>10%</span>
                <span>80%</span>
              </div>
            </div>

            <div className="control-group">
              <label>Kredit muddati: <strong>{loanTerm} oy</strong> ({Math.round(loanTerm / 12)} yil)</label>
              <input 
                type="range" 
                min="12" 
                max="60" 
                step="12" 
                value={loanTerm} 
                onChange={(e) => setLoanTerm(parseInt(e.target.value))}
              />
              <div className="range-labels">
                <span>12 oy</span>
                <span>60 oy</span>
              </div>
            </div>

            <div className="control-group">
              <label>Yillik foiz stavkasi (%): <strong>{interestRate}%</strong></label>
              <input 
                type="range" 
                min="10" 
                max="30" 
                step="1" 
                value={interestRate} 
                onChange={(e) => setInterestRate(parseInt(e.target.value))}
              />
              <div className="range-labels">
                <span>10%</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          <div className="calculator-results">
            <h3>Hisob-kitob natijasi</h3>
            
            <div className="result-row">
              <span>Kredit miqdori:</span>
              <strong>${loanAmount.toLocaleString()}</strong>
            </div>

            <div className="result-row">
              <span>Boshlang'ich to'lov:</span>
              <strong>${initialPaymentAmount.toLocaleString()}</strong>
            </div>

            <div className="result-row">
              <span>Jami foiz to'lovlari:</span>
              <strong>${Math.round(totalInterest).toLocaleString()}</strong>
            </div>

            <div className="result-row total">
              <span>Oylik to'lov:</span>
              <strong>${Math.round(monthlyPayment).toLocaleString()} / oy</strong>
            </div>

            <button className="apply-loan-btn" onClick={() => toast.success("Kredit arizangiz qabul qilindi. Tez orada hamkor banklarimiz vakillari bog'lanishadi.")}>
              Kredit rasmiylashtirish
            </button>
            
            <p className="disclaimer">*Hisob-kitoblar taxminiy hisoblanib, aniq shartnomaviy foizlar bank tomonidan belgilangan tartibda rasmiylashtiriladi.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Xizmatlar;
