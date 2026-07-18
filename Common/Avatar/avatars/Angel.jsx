import React from "react";

const Angel = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{ filter: "drop-shadow(0px 4px 14px rgba(14, 165, 233, 0.3))" }}
  >
    <defs>
      {/* Heavenly Astral Blue/Sky Backdrop */}
      <radialGradient id="heavenlyVoid" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="60%" stopColor="#0c4a6e" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>

      {/* Radiant, Ethereal White Feathers */}
      <linearGradient id="angelFeathers" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#BAE6FD" />
      </linearGradient>

      {/* Divine Golden Halo Glow */}
      <linearGradient id="haloGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#EAB308" />
        <stop offset="50%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>

      {/* Soft Ethereal Skin Tone */}
      <linearGradient id="angelSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF7ED" />
        <stop offset="100%" stopColor="#FFEDD5" />
      </linearGradient>
    </defs>

    {/* Background Circle (Astral Aura) */}
    <circle cx="50" cy="50" r="48" fill="url(#heavenlyVoid)" stroke="#38BDF8" strokeWidth="1" />

    {/* ================= DIVINE HALO (Floating Above Head) ================= */}
    <ellipse
      cx="50"
      cy="13"
      rx="16"
      ry="5"
      fill="none"
      stroke="url(#haloGlow)"
      strokeWidth="2.5"
      style={{ filter: "drop-shadow(0px 0px 4px #FDE047)" }}
    />

    {/* ================= EXPANSIVE FEATHERED WINGS ================= */}
    {/* Left Wing */}
    <path d="M34 52 C12 40, -2 16, 6 4 C10 24, 22 45, 36 60 Z" fill="url(#angelFeathers)" />
    <path d="M34 56 C16 52, 6 36, 12 20 C16 35, 26 48, 36 64 Z" fill="#E0F2FE" opacity="0.6" />

    {/* Right Wing */}
    <path d="M66 52 C88 40, 102 16, 94 4 C90 24, 78 45, 64 60 Z" fill="url(#angelFeathers)" />
    <path d="M66 56 C84 52, 94 36, 88 20 C84 35, 74 48, 64 64 Z" fill="#E0F2FE" opacity="0.6" />

    {/* ================= FLOWING BACK HAIR ================= */}
    <path 
      d="M32 35 C32 15, 68 15, 68 35 C68 55, 74 75, 72 88 H28 C26 75, 32 55, 32 35 Z" 
      fill="#F8FAFC" 
      stroke="#E2E8F0" 
      strokeWidth="0.5" 
    />

    {/* ================= EXPOSED SKIN & CHEST DESIGN ================= */}
    {/* Smooth, faceless head/jaw silhouette */}
    <path d="M36 34 Q50 24 64 34 L58 54 Q50 64 42 54 Z" fill="url(#angelSkin)" stroke="#FDBA74" strokeWidth="0.5" />

    {/* Slender neck */}
    <path d="M44 50 L44 65 L56 65 L56 50 Z" fill="url(#angelSkin)" />

    {/* Voluminous, Defined Chest / Hourglass Silhouette */}
    <path d="M30 76 C32 66, 36 62, 43 64 C47 65, 50 71, 50 71 C50 71, 53 65, 57 64 C64 62, 68 66, 70 76 L74 100 H26 Z" fill="url(#angelSkin)" stroke="#FDBA74" strokeWidth="0.5" />

    {/* Subtle cleavage / chest shadow contour lines */}
    <path d="M43 65 C47 67, 50 72, 50 76 C50 72, 53 67, 57 65" fill="none" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" />

    {/* ================= WHITE/GOLDEN ROBE NECKLINE ================= */}
    {/* Off-the-shoulder low gown layout starting at the bust base */}
    <path d="M26 84 C34 78, 42 78, 50 82 C58 78, 66 78, 74 84 L76 100 H24 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
    <path d="M26 84 C34 78, 42 78, 50 82 C58 78, 66 78, 74 84" fill="none" stroke="url(#haloGlow)" strokeWidth="1.5" />
  </svg>
);

export default Angel;