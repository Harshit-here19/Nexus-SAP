import React from "react";

const Galaxy = ({ fill = "#1E1B4B", size = 100 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className="galaxy-icon">
    {/* Deep Space Background */}
    <circle cx="50" cy="50" r="48" fill={fill} />

    {/* Nebula Core Glow */}
    <circle cx="50" cy="50" r="32" fill="#6366F1" opacity="0.25" />
    <circle cx="50" cy="50" r="22" fill="#A78BFA" opacity="0.4" />

    {/* Outer Spiral Arm 1 */}
    <path
      d="M20 65 C 10 45, 30 15, 60 20 C 85 25, 90 55, 70 75 C 55 90, 35 80, 35 65 C 35 55, 45 45, 55 50"
      stroke="#C4B5FD"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.85"
    />

    {/* Inner Spiral Arm 2 */}
    <path
      d="M80 35 C 90 55, 70 85, 40 80 C 15 75, 10 45, 30 25 C 45 10, 65 20, 65 35 C 65 45, 55 55, 45 50"
      stroke="#F472B6"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity="0.7"
    />

    {/* Background Dust / Distant Stars */}
    <circle cx="22" cy="30" r="1.5" fill="#FFFFFF" opacity="0.8" />
    <circle cx="78" cy="25" r="1" fill="#FFFFFF" opacity="0.6" />
    <circle cx="75" cy="72" r="1.5" fill="#FFFFFF" opacity="0.9" />
    <circle cx="28" cy="78" r="1" fill="#FFFFFF" opacity="0.5" />

    {/* Cosmic Celestial Head */}
    <circle cx="50" cy="50" r="18" fill="#DDD6FE" />

    {/* Deep Space Eyes */}
    <circle cx="43" cy="48" r="4" fill="#4C1D95" />
    <circle cx="57" cy="48" r="4" fill="#4C1D95" />

    {/* Stellar Pupil Highlights */}
    <circle cx="42" cy="47" r="1.5" fill="#FFFFFF" />
    <circle cx="56" cy="47" r="1.5" fill="#FFFFFF" />

    {/* 4-Point Star Flares (Sparkles) */}
    {/* Top Right Star */}
    <path
      d="M72 34 Q75 35 75 38 Q75 35 78 34 Q75 35 75 32 Q75 35 72 34 Z"
      fill="#FFFFFF"
    />
    {/* Top Left Star */}
    <path
      d="M28 20 Q30 21 30 24 Q30 21 32 20 Q30 21 30 18 Q30 21 28 20 Z"
      fill="#F472B6"
    />

    {/* Cosmic Smile / Horizon line */}
    <path
      d="M45 58 Q50 63 55 58"
      stroke="#4C1D95"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export default Galaxy;
