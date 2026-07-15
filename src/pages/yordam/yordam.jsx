import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
  FaPaperPlane,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./yordam.css";

const FAQS = [
  {
    question: "E'lon berish mutlaqo bepulmi?",
    answer:
      "Ha, AvtoSavdo platformasida e'lon berish mutlaqo bepul. Siz istalgan miqdordagi avtomobil e'lonlarini to'lovsiz joylashtirishingiz mumkin.",
  },
  {
    question: "E'lonim qancha vaqt saytda faol turadi?",
    answer:
      "Siz joylashtirgan e'lon avtomobilingiz sotilgunga qadar yoki siz o'chirmaguningizcha saytda faol holatda qoladi.",
  },
  {
    question: "Sotilgan avtomobil e'lonini qanday o'chirish mumkin?",
    answer:
      "E'lonlarni o'chirish juda oson. Agar siz o'zingiz joylashtirgan e'lonni o'chirmoqchi bo'lsangiz, sotuvchi bilan bog'lanish interfeysidagi telefon raqamidan foydalanib bizning qo'llab-quvvatlash tizimimizga murojaat qilishingiz mumkin.",
  },
  {
    question: "Avtokredit olish tartibi qanday?",
    answer:
      "Bizning kalkulyator orqali oylik to'lovlarni hisoblaganingizdan so'ng 'Kredit rasmiylashtirish' tugmasini bosib ariza qoldirasiz. Hamkor banklarimiz 24 soat ichida siz bilan bog'lanib, shartnomani rasmiylashtirishga ko'maklashadi.",
  },
  {
    question: "Firibgarlardan qanday himoyalanish mumkin?",
    answer:
      "Uchrashuvdan oldin hech qachon zakalat (oldindan to'lov) bermang. Mashinani albatta texnik ko'rikdan o'tkazib, hujjatlarini to'liq notarial rasmiylashtirgandan so'nggina pulini to'lang.",
  },
];

function Yordam() {
  const [openIndex, setOpenIndex] = useState(null);

  // Contact form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      toast.error("Iltimos barcha maydonlarni to'ldiring.");
      return;
    }
    setSubmitted(true);
    setName("");
    setPhone("");
    setMessage("");
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="yordam-container">
      <div className="yordam-header">
        <h1>Yordam va FAQ</h1>
        <p>Ko'p so'raladigan savollar va texnik yordam bo'limi</p>
      </div>

      <div className="yordam-content">
        {/* Accordion FAQ */}
        <section className="faq-section">
          <h2>
            <FaQuestionCircle /> Ko'p so'raladigan savollar
          </h2>
          <div className="faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className={`faq-card ${isOpen ? "open" : ""}`}>
                  <div
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                  >
                    <h3>{faq.question}</h3>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Support Request Form */}
        <section className="support-form-section">
          <h2>Qo'llab-quvvatlash tizimi</h2>
          <p>
            Savollaringiz yoki takliflaringiz bo'lsa, quyidagi forma orqali
            xabar yuboring
          </p>

          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label>Ismingiz</label>
              <input
                type="text"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Telefon raqamingiz</label>
              <input
                type="text"
                placeholder=" "
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Xabaringiz</label>
              <textarea
                rows="5"
                placeholder=" "
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-support-btn">
              <FaPaperPlane /> Xabar yuborish
            </button>
          </form>

          {submitted && (
            <div className="form-success-toast">
              🎉 Xabaringiz muvaffaqiyatli yuborildi! Tez orada
              mutaxassislarimiz aloqaga chiqishadi.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Yordam;
