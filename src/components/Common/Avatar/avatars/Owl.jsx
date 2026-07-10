import React from "react";

const Owl = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className="mystical-owl-icon"
    style={{ filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.45))" }}
  >
    <defs>
      {/* Twilight Celestial Backdrop */}
      <radialGradient id="twilightSky" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="65%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>

      {/* Deep Shadow for Facial Discs */}
      <linearGradient id="featherShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#312E81" />
        <stop offset="100%" stopColor="#1E1B4B" />
      </linearGradient>

      {/* Cosmic/Magical Golden Eyes */}
      <radialGradient id="cosmicEye" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#CA8A04" />
        <stop offset="85%" stopColor="#854D0E" />
        <stop offset="100%" stopColor="#451A03" />
      </radialGradient>

      {/* Sleek Silver/White Plumage Gradients */}
      <linearGradient id="silverPlume" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
    </defs>
    {/* Background Circle (The Night Sky Aura) */}
    <circle
      cx="50"
      cy="50"
      r="48"
      fill="url(#twilightSky)"
      stroke="#3730A3"
      strokeWidth="1"
    />
    {/* ================= LAYERED WINGS / BODY BASES ================= */}
    {/* Outer Back Wings */}
    <path
      d="M12 45 C8 70, 20 90, 50 96 C80 90, 92 70, 88 45 C82 35, 18 35, 12 45 Z"
      fill="#312E81"
      opacity="0.6"
    />
    {/* Foreground Robe-like Chest Plume */}
    <path
      d="M22 60 Q50 45 78 60 L68 94 Q50 100 32 94 Z"
      fill="url(#silverPlume)"
    />
    {/* ================= ELONGATED EAR TUFTS (Horned Owl Look) ================= */}
    {/* Left Tuft */}
    <polygon points="26,30 10,4 38,20" fill="#1E1B4B" />
    <polygon points="26,30 14,8 34,20" fill="url(#silverPlume)" />
    {/* Right Tuft */}
    <polygon points="74,30 90,4 62,20" fill="#1E1B4B" />
    <polygon points="74,30 86,8 66,20" fill="url(#silverPlume)" />
    {/* ================= FACIAL DISCS (The Heart/Mask Structure) ================= */}
    {/* Outer Dark Mask Shadow */}
    <path
      d="M22 36 Q50 24 78 36 Q84 58 50 64 Q16 58 22 36 Z"
      fill="url(#featherShadow)"
    />
    {/* Left Face Disc Segment */}
    <path d="M24 37 Q42 28 50 46 Q34 60 24 37 Z" fill="#F8FAFC" />
    <path d="M26 38 Q42 30 48 46 Q34 56 26 38 Z" fill="#CBD5E1" opacity="0.5" />
    {/* Right Face Disc Segment */}
    <path d="M76 37 Q58 28 50 46 Q66 60 76 37 Z" fill="#F8FAFC" />
    <path d="M74 38 Q58 30 52 46 Q66 56 74 38 Z" fill="#CBD5E1" opacity="0.5" />
    {/* ================= RECESSED HYPNOTIC EYES ================= */}
    {/* Left Eye Framing (Stern Brow) */}
    <polygon points="28,32 50,44 46,46 32,38" fill="#020617" />
    <circle cx="36" cy="42" r="7.5" fill="url(#cosmicEye)" />
    <circle cx="37" cy="43" r="3.5" fill="#020617" /> {/* Deep Pupil */}
    <circle cx="35" cy="40.5" r="1" fill="#FFFFFF" /> {/* Catchlight */}
    {/* Right Eye Framing (Stern Brow) */}
    <polygon points="72,32 50,44 54,46 68,38" fill="#020617" />
    <circle cx="64" cy="42" r="7.5" fill="url(#cosmicEye)" />
    <circle cx="63" cy="43" r="3.5" fill="#020617" /> {/* Deep Pupil */}
    <circle cx="62" cy="40.5" r="1" fill="#FFFFFF" /> {/* Catchlight */}
    {/* Heavy Threatening Brow Shadow Overlay */}
    <path d="M26 34 Q50 46 74 34 Q50 38 26 34 Z" fill="#0F172A" />
    {/* ================= THE BEAK ================= */}
    {/* Sharp, curved predatory beak intersecting the face */}
    <path d="M46 44 Q50 42 54 44 L50 58 Z" fill="#D97706" />
    <path d="M46 44 Q50 42 50 58 Z" fill="#F59E0B" /> {/* Beak Highlight */}
    {/* ================= GEOMETRIC CHEST FEATHERS ================= */}
    <g stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
      {/* Tier 1 */}
      <path d="M42 66 L50 72 L58 66" fill="none" />
      {/* Tier 2 */}
      <path d="M36 74 L44 82 L50 77 L56 82 L64 74" fill="none" />
      {/* Tier 3 */}
      <path d="M40 86 L50 94 L60 86" fill="none" />
    </g>
    {/* Central Downward Feathers Line */}
    <line
      x1="50"
      y1="58"
      x2="50"
      y2="94"
      stroke="#94A3B8"
      strokeWidth="1"
      strokeDasharray="3 3"
      opacity="0.5"
    />
  </svg>
);

export default Owl;
