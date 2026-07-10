import React from "react";

const Demon = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{ filter: "drop-shadow(0px 4px 14px rgba(219, 39, 119, 0.35))" }}
  >
    <defs>
      {/* Abyssal Violet Backdrop */}
      <radialGradient id="abyssVoid" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#4c1d95" />
        <stop offset="60%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#090514" />
      </radialGradient>

      {/* Lustrous Midnight Violet Hair */}
      <linearGradient id="hairFlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#311042" />
        <stop offset="50%" stopColor="#1e072b" />
        <stop offset="100%" stopColor="#0b0112" />
      </linearGradient>

      {/* Sleek, Fair Demonic Skin */}
      <linearGradient id="demonSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF1F2" />
        <stop offset="60%" stopColor="#FFE4E6" />
        <stop offset="100%" stopColor="#FDA4AF" />
      </linearGradient>

      {/* Deep Leather / Accent tone */}
      <linearGradient id="darkLeather" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#090514" />
      </linearGradient>
    </defs>

    {/* Background Circle */}
    <circle cx="50" cy="50" r="48" fill="url(#abyssVoid)" stroke="#DB2777" strokeWidth="1" />

    {/* ================= 1. THE BLADED TAIL ================= */}
    {/* Elegant sweeping tail framing the lower left leg */}
    <path 
      d="M48 78 Q30 75 22 88 Q18 96 28 95 Q38 94 36 84" 
      fill="none" 
      stroke="#1e1b4b" 
      strokeWidth="1.5" 
    />
    {/* Spade/Heart Tail Tip */}
    <path d="M35 82 L31 77 L38 75 Z" fill="#DB2777" />

    {/* ================= 2. LONG FLOWING HAIR (BACK) ================= */}
    <path d="M34 32 C26 45, 24 65, 30 82 H70 C76 65, 74 45, 66 32 Z" fill="#0b0112" />

    {/* ================= 3. CURVING ACCENT HORNS ================= */}
    <path d="M42 22 C34 14, 32 4, 26 10 C30 8, 36 15, 40 26 Z" fill="#1e1b4b" />
    <path d="M42 22 C34 14, 32 4, 26 10 Z" fill="#4c1d95" opacity="0.4" />
    
    <path d="M58 22 C66 14, 68 4, 74 10 C70 8, 64 15, 60 26 Z" fill="#1e1b4b" />
    <path d="M58 22 C66 14, 68 4, 74 10 Z" fill="#4c1d95" opacity="0.4" />

    {/* ================= 4. FACELESS HEAD & NECK ================= */}
    <path d="M40 24 Q50 16 60 24 L56 38 Q50 45 44 38 Z" fill="url(#demonSkin)" stroke="#FDA4AF" strokeWidth="0.5" />
    <path d="M46 36 L46 46 L54 46 L54 36 Z" fill="url(#demonSkin)" />

    {/* ================= 5. FULL BODY ANATOMY (HOURGLASS) ================= */}
    {/* Exposed Torso, Hips and Thighs */}
    <path 
      d="M38 54 C38 46, 42 44, 50 46 C58 44, 62 46, 62 54 C62 60, 56 64, 56 68 C59 74, 63 80, 61 95 H39 C37 80, 41 74, 44 68 C44 64, 38 60, 38 54 Z" 
      fill="url(#demonSkin)" 
      stroke="#FDA4AF" 
      strokeWidth="0.5" 
    />

    {/* Elegant Chest/Bust Contours */}
    <path d="M39 52 C43 54, 47 57, 50 57 C53 57, 57 54, 61 52" fill="none" stroke="#FDA4AF" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M43 53 C46 55, 50 55, 50 62 C50 55, 54 55, 57 53" fill="none" stroke="#FDA4AF" strokeWidth="1" opacity="0.8" />

    {/* Hip/Leg separation crease lines */}
    <path d="M44 76 Q50 78 42 85 M56 76 Q50 78 58 85" fill="none" stroke="#FDA4AF" strokeWidth="0.8" opacity="0.7" />

    {/* ================= 6. MINIMALIST STRAP CLOTHING ================= */}
    {/* Ultra-minimalist dark chest wrap bindings */}
    <path d="M38 54 Q50 50 62 54 L61 56 Q50 52 39 56 Z" fill="url(#darkLeather)" />
    <path d="M44 46 L50 52 L56 46 L55 47 L50 53 L45 47 Z" fill="url(#darkLeather)" />

    {/* Sleek string waist/pelvic binding */}
    <path d="M44 69 Q50 74 56 69 L55 72 Q50 76 45 72 Z" fill="url(#darkLeather)" />
    <path d="M42 66 Q50 67 58 66 L57 67.5 Q50 68.5 43 67.5 Z" fill="url(#darkLeather)" />

    {/* Thigh-High Stocking Tops (Adds to the alluring aesthetic base) */}
    <path d="M39 82 Q44 80 44 85" fill="none" stroke="url(#darkLeather)" strokeWidth="1.5" />
    <path d="M61 82 Q56 80 56 85" fill="none" stroke="url(#darkLeather)" strokeWidth="1.5" />

    {/* ================= 7. FOREHEAD HAIR OVERLAYS ================= */}
    {/* Framing side locks that scale down dynamically with the body */}
    <path d="M38 24 Q48 14 50 24 Q52 14 62 24 L59 34 Q50 28 41 34 Z" fill="url(#hairFlow)" />
  </svg>
);

export default Demon;