import { useEffect, useRef, useState } from "react";

export default function CenterModal({
  show,
  message,
  queueText,
  accent = "yellow",
  onClose,
  onDismissAll,
  title,
}) {
  const [clicked, setClicked] = useState(false);

  if (!show) return null;

  const handleOk = (e) => {
    e.stopPropagation();

    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    const rect = btn.getBoundingClientRect();

    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    setClicked(true);
    setTimeout(() => setClicked(false), 180);

    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "1.7rem",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "420px",
          position: "relative",
          boxShadow: "0 25px 40px rgba(0,0,0,0.15)",
          borderLeft: `6px solid ${
            accent === "yellow" ? "#fa1915ff" : "#efea4aff"
          }`,
          transform: clicked ? "scale(0.98)" : "scale(1)",
          transition: "transform 180ms ease",
        }}
      >
        <button
          onClick={onDismissAll}
          title="Dismiss all reminders"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 26,
            height: 26,
            borderRadius: 7,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{title}</div>

        <div
          style={{
            fontSize: "1.05rem",
            fontWeight: 600,
            marginTop: "0.25rem",
          }}
        >
          {message}
        </div>

        {queueText && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#9ca3af",
              marginTop: "0.4rem",
            }}
          >
            {queueText}
          </div>
        )}

        <button
          onClick={handleOk}
          className="ok-btn"
          style={{
            marginTop: "1.2rem",
            padding: "0.45rem 1rem",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          OK
        </button>

        <style>{`
          .ok-btn span {
            position: absolute;
            width: 12px;
            height: 12px;
            background: rgba(255,255,255,0.6);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms linear;
            pointer-events: none;
          }

          @keyframes ripple {
            to {
              transform: scale(15);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
