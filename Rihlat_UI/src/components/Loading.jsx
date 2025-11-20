import React from "react";

function Dots({ className = "" }) {
  return (
    <span className={className} aria-hidden>
      <span className="dot">.</span>
      <span className="dot">.</span>
      <span className="dot">.</span>
    </span>
  );
}

export default function Loading({ message = "Thinking" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="loader-spinner" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeDasharray="40" />
        </svg>
      </div>
      <div style={{ color: "#0b1220", fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{message}</div>
    </div>
  );
}

