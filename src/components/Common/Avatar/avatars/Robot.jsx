import React from "react";

const Robot = ({ fill = "#475569", size = 100 }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className="robot-icon"
  >
    {/* Background Circle */}
    <circle cx="50" cy="50" r="48" fill={fill} />

    {/* Robot Antenna */}
    <line x1="50" y1="22" x2="50" y2="12" stroke="#94A3B8" strokeWidth="3" />
    <circle cx="50" cy="10" r="4" fill="#22D3EE" />

    {/* Side Bolts / Ears */}
    <rect x="20" y="44" width="6" height="12" rx="2" fill="#64748B" />
    <rect x="74" y="44" width="6" height="12" rx="2" fill="#64748B" />

    {/* Head */}
    <rect x="24" y="26" width="52" height="50" rx="12" fill="#E2E8F0" />
    {/* Faceplate shading for depth */}
    <rect x="28" y="30" width="44" height="42" rx="8" fill="#F1F5F9" />

    {/* Eyes (Digital Screen Look) */}
    <rect x="34" y="40" width="12" height="10" rx="3" fill="#06B6D4" />
    <rect x="54" y="40" width="12" height="10" rx="3" fill="#06B6D4" />
    
    {/* Eye Glow Highlights */}
    <rect x="36" y="42" width="3" height="3" rx="1" fill="#FFFFFF" opacity="0.8" />
    <rect x="56" y="42" width="3" height="3" rx="1" fill="#FFFFFF" opacity="0.8" />

    {/* Mouth Grille */}
    <rect x="36" y="58" width="28" height="8" rx="4" fill="#334155" />
    
    {/* Mouth Grille Teeth/Lines */}
    <line x1="43" y1="58" x2="43" y2="66" stroke="#64748B" strokeWidth="1.5" />
    <line x1="50" y1="58" x2="50" y2="66" stroke="#64748B" strokeWidth="1.5" />
    <line x1="57" y1="58" x2="57" y2="66" stroke="#64748B" strokeWidth="1.5" />
  </svg>
);

export default Robot;