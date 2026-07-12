import React, { useEffect, useRef } from "react";

function TelegramLoginButton({ botName, onAuth, buttonSize = "large" }) {
  const containerRef = useRef(null);
  const cleanBotName = botName ? (botName.trim().startsWith("@") ? botName.trim().slice(1) : botName.trim()) : "";
  const isDefaultOrEmpty = !cleanBotName || cleanBotName === "YOUR_TELEGRAM_BOT_USERNAME";

  useEffect(() => {
    if (isDefaultOrEmpty) {
      return;
    }

    // Set up global callback function that Telegram widget will call
    window.onTelegramAuth = (user) => {
      onAuth(user);
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", cleanBotName);
    script.setAttribute("data-size", buttonSize);
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    const container = containerRef.current;

    // Append script to container
    if (container) {
      container.appendChild(script);
    }

    // Cleanup script on unmount
    return () => {
      if (container) {
        container.innerHTML = "";
      }
      delete window.onTelegramAuth;
    };
  }, [cleanBotName, onAuth, buttonSize, isDefaultOrEmpty]);

  if (isDefaultOrEmpty) {
    return (
      <div className="telegram-widget-unconfigured" style={{
        backgroundColor: "#fff5f5",
        border: "1px solid #feb2b2",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "left",
        color: "#2d3748"
      }}>
        <p className="tg-unconfigured-warning" style={{
          color: "#c53030",
          fontWeight: "700",
          fontSize: "16px",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          ⚠️ Telegram Login faollashtirilmagan
        </p>
        <p className="tg-unconfigured-details" style={{ fontSize: "14px", color: "#4a5568", marginBottom: "12px" }}>
          Tizimga kirish uchun ildiz katalogdagi <code>.env</code> fayliga o'zingizning Telegram botingiz foydalanuvchi nomini yozing:
        </p>
        <pre className="tg-unconfigured-code" style={{
          backgroundColor: "#edf2f7",
          padding: "10px 14px",
          borderRadius: "6px",
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#2d3748",
          marginBottom: "12px",
          overflowX: "auto"
        }}>VITE_TELEGRAM_BOT_USERNAME=SizningBotNominingiz</pre>
        <p className="tg-unconfigured-note" style={{ fontSize: "12px", color: "#718096", lineHeight: "1.5" }}>
          Bot yaratish uchun Telegram'da <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" style={{ color: "#3182ce", textDecoration: "underline" }}>@BotFather</a> orqali bot oching va unga domen bog'lang (masalan, <code>/setdomain</code> buyrug'i orqali).
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="telegram-widget-container" />;
}

export default TelegramLoginButton;
