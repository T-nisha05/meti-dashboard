// src/components/TopNavbar.js
import React, { useState } from "react";
import { FaBell } from "react-icons/fa";

export default function TopNavbar({ reminders }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const sortedReminders =
    reminders?.sort((a, b) => a.daysLeft - b.daysLeft) || [];

  return (
    <header className="top-navbar shadow-sm" style={{ background: "#fff" }}>
      <div className="d-flex align-items-center justify-content-between px-4 py-1">
        {/* Left: Logo + App Name */}
        <div className="d-flex align-items-center gap-3">
          <img
            src="/Logo.png"
            alt="Internix Logo"
            style={{ width: 100, height: 100 }}
          />
          <div>
            <h5 className="mb-0 fw-bold" style={{ fontSize: "1.6rem" }}>
              Internix
            </h5>
            <small className="text-muted" style={{ fontSize: "1.0rem" }}>
              Manage Internships. Intelligently!
            </small>
          </div>
        </div>

        {/* Right: Notification Icon */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative p-2"
            onClick={toggleDropdown}
            style={{
              fontSize: "1.2rem",
              borderRadius: "200%",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0)",
            }}
          >
            <FaBell />
            {sortedReminders.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 10,
                  height: 10,
                  background: "red",
                  borderRadius: "100%",
                  border: "1px solid white",
                }}
              />
            )}
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "120%",
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "10px",
                width: "350px",
                maxHeight: "400px",
                overflowY: "auto",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                zIndex: 1000,
              }}
            >
              {sortedReminders.length === 0 ? (
                <div className="p-3 text-center text-muted">No reminders</div>
              ) : (
                sortedReminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 border-bottom"
                    style={{ cursor: "pointer", transition: "background 0.2s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    <strong>
                      {r.type === "OA" ? "🧪 OA" : "⏰ Interview"}
                    </strong>
                    <span style={{ float: "right", color: "gray" }}>
                      {r.daysLeft === 0
                        ? "TODAY"
                        : r.daysLeft > 0
                        ? `in ${r.daysLeft} day(s)`
                        : `${Math.abs(r.daysLeft)} day(s) ago`}
                    </span>
                    <div className="fw-semibold">{r.title}</div>
                    {(r.date || r.time) && (
                      <small className="text-muted">
                        {r.date || "Date not set"}
                        {r.time && ` • ${r.time}`}
                      </small>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
