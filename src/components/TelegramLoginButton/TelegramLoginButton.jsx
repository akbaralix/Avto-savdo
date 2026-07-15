import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { FaTelegramPlane, FaSpinner } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function TelegramLoginButton({ onAuth }) {
  const { loginWithUserData } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [botUrl, setBotUrl] = useState(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);

  const startLoginFlow = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/auth/telegram/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Sessiya yaratishda xatolik yuz berdi");
      }

      const data = await res.json();
      setSessionToken(data.token);
      setBotUrl(data.url);
      setPolling(true);

      // Open the telegram bot in a new window/tab
      window.open(data.url, "_blank");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Ulanishda xatolik yuz berdi. Iltimos qaytadan urining.",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    if (polling && sessionToken) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(
            `${API_URL}/api/auth/telegram/status?token=${sessionToken}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === "completed") {
              setPolling(false);
              setLoading(false);
              // Save user in AppContext
              loginWithUserData(data.user, data.token);
              // Trigger callback if defined
              if (onAuth) {
                onAuth(data.user);
              }
            } else if (data.status === "expired") {
              setPolling(false);
              setLoading(false);
              setError(
                "Kirish seansi muddati tugadi. Iltimos qaytadan urinib ko'ring.",
              );
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [polling, sessionToken, loginWithUserData, onAuth]);

  const handleCancel = () => {
    setPolling(false);
    setLoading(false);
    setSessionToken(null);
    setBotUrl(null);
  };

  if (polling) {
    return (
      <div
        className="tg-login-status-card"
        style={{
          backgroundColor: "#f7fafc",
          border: "1px solid #edf2f7",
          borderRadius: "14px",
          padding: "24px",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "12px",
            borderRadius: "50%",
            backgroundColor: "#ebf8ff",
            marginBottom: "16px",
          }}
        >
          <FaTelegramPlane style={{ fontSize: "28px", color: "#3182ce" }} />
        </div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "10px",
            color: "#2d3748",
          }}
        >
          Telegram bot ochildi! 🚀
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#4a5568",
            marginBottom: "20px",
            lineHeight: "1.5",
          }}
        >
          Iltimos, ochilgan Telegram botda pastdagi <b>START</b> (Boshlash)
          tugmasini bosing.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#3182ce",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            <FaSpinner
              className="spinning"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span>Tasdiqlash kutilmoqda...</span>
          </div>

          <button
            onClick={() => window.open(botUrl, "_blank")}
            style={{
              padding: "10px 18px",
              backgroundColor: "#3182ce",
              color: "white",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#2b6cb0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#3182ce")
            }
          >
            Botni qayta ochish
          </button>

          <button
            onClick={handleCancel}
            style={{
              backgroundColor: "transparent",
              color: "#a0aec0",
              border: "none",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline",
              marginTop: "4px",
            }}
          >
            Bekor qilish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
      }}
    >
      {error && (
        <div
          style={{
            backgroundColor: "#fff5f5",
            border: "1px solid #feb2b2",
            color: "#c53030",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "13px",
            width: "100%",
            textAlign: "left",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={startLoginFlow}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px 20px",
          backgroundColor: "#0088cc",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          boxShadow: "0 4px 12px rgba(0, 136, 204, 0.25)",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = "#0077b3";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(0, 136, 204, 0.35)";
          }
        }}
        onMouseOut={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = "#0088cc";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0, 136, 204, 0.25)";
          }
        }}
      >
        {loading ? (
          <>
            <FaSpinner
              className="spinning"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span>Bog'lanmoqda...</span>
          </>
        ) : (
          <>
            <FaTelegramPlane style={{ fontSize: "20px" }} />
            <span>Telegram orqali kirish</span>
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default TelegramLoginButton;
