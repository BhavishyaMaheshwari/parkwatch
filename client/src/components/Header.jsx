import React, { useState, useEffect } from 'react';

export default function Header() {
  const [clock, setClock] = useState(formatTime());

  useEffect(() => {
    const id = setInterval(() => setClock(formatTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="app-header" id="app-header">
      <div className="header-left">
        {/* Inline SVG location pin logo */}
        <svg className="header-logo-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32 4C21.5 4 13 12.5 13 23c0 14.25 19 37 19 37s19-22.75 19-37C51 12.5 42.5 4 32 4z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          <circle cx="32" cy="22" r="8" fill="#C0392B" />
        </svg>
        <div className="header-text">
          <h1>ParkWatch AI</h1>
          <p>Parking Enforcement Intelligence System</p>
        </div>
      </div>
      <div className="header-clock" id="live-clock">{clock}</div>
    </header>
  );
}

function formatTime() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
