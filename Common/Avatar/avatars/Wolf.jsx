import React from "react";

const Wolf = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className="stark-direwolf-icon"
    style={{ filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.4))" }}
  >
    <defs>
      {/* The Cold, Looming Winter Backdrop */}
      <radialGradient id="winterSky" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="75%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </radialGradient>

      {/* Piercing Amber Eye Glow */}
      <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="70%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </radialGradient>
    </defs>
    {/* Background Circle (The North Backdrop) */}
    <circle
      cx="50"
      cy="50"
      r="48"
      fill="url(#winterSky)"
      stroke="#475569"
      strokeWidth="1"
    />
    {/* ================= BACKGROUND FUR REAR L/R ================= */}
    {/* Outer Cheek Fluff */}
    <polygon points="12,58 26,45 32,64" fill="#334155" />
    <polygon points="88,58 74,45 68,64" fill="#334155" />
    {/* ================= EARS (Sharp, Alert) ================= */}
    {/* Left Ear */}
    <polygon points="22,35 14,8 38,24" fill="#1E293B" />
    <polygon points="25,32 18,14 34,25" fill="#475569" /> {/* Inner Shadow */}
    <polygon points="27,30 22,18 32,25" fill="#94A3B8" />{" "}
    {/* Inner Highlight */}
    {/* Right Ear */}
    <polygon points="78,35 86,8 62,24" fill="#1E293B" />
    <polygon points="75,32 82,14 66,25" fill="#475569" /> {/* Inner Shadow */}
    <polygon points="73,30 78,18 68,25" fill="#94A3B8" />{" "}
    {/* Inner Highlight */}
    {/* ================= MAIN HEAD SHAPE (Geometric) ================= */}
    {/* Lower Jaw & Neck Base */}
    <polygon points="30,68 50,92 70,68 50,78" fill="#475569" />
    {/* Main Crown & Cheeks */}
    <polygon points="26,45 50,22 74,45 68,68 50,78 32,68" fill="#E2E8F0" />
    {/* Dark Winter Overcoat (Forehead & Brows) */}
    <polygon points="32,32 50,22 68,32 50,44" fill="#1E293B" />
    <polygon points="32,32 50,44 38,48" fill="#334155" />
    <polygon points="68,32 50,44 62,48" fill="#334155" />
    {/* Cheek Highlights / Silver Fur Contours */}
    <polygon points="26,45 38,48 32,68" fill="#CBD5E1" />
    <polygon points="74,45 62,48 68,68" fill="#CBD5E1" />
    <polygon points="38,48 50,56 32,68" fill="#94A3B8" />
    <polygon points="62,48 50,56 68,68" fill="#94A3B8" />
    {/* ================= SNOUT & JAW ================= */}
    {/* Bridge of Muzzle */}
    <polygon points="50,44 42,66 50,74 58,66" fill="#F1F5F9" />
    <polygon points="50,44 42,66 50,60" fill="#CBD5E1" />{" "}
    {/* Muzzle Shadowing */}
    {/* Nose Bridge Sides */}
    <polygon points="38,48 42,66 50,56" fill="#64748B" />
    <polygon points="62,48 48,66 50,56" fill="#64748B" />
    {/* Sharp Stark Direwolf Nose */}
    <polygon points="45,66 55,66 50,75" fill="#0F172A" />
    {/* Snarl/Mouth Lines */}
    <polyline
      points="40,72 50,78 60,72"
      fill="none"
      stroke="#0F172A"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* ================= FIERCE AMBER EYES ================= */}
    {/* Left Eye (Angry Angled Polygons) */}
    <polygon points="34,44 44,46 41,50 35,47" fill="url(#amberGlow)" />
    <polygon points="33,43 45,45 42,43" fill="#0F172A" />{" "}
    {/* Top Angry Brow Shadow */}
    <circle cx="39" cy="46.5" r="0.75" fill="#FFFFFF" /> {/* Glint */}
    {/* Right Eye */}
    <polygon points="66,44 56,46 59,50 65,47" fill="url(#amberGlow)" />
    <polygon points="67,43 55,45 58,43" fill="#0F172A" />{" "}
    {/* Top Angry Brow Shadow */}
    <circle cx="61" cy="46.5" r="0.75" fill="#FFFFFF" /> {/* Glint */}
  </svg>
);

export default Wolf;
