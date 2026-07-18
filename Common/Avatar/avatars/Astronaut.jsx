import React from "react";

const Astronaut = ({ fill = "#0F172A" }) => (
  <>
    {/* Space background */}
    <circle cx="50" cy="50" r="50" fill={fill} />

    {/* Stars */}
    <circle cx="18" cy="22" r="2" fill="#FFFFFF" />
    <circle cx="82" cy="30" r="2" fill="#FFFFFF" />
    <circle cx="75" cy="75" r="1.5" fill="#FFFFFF" />

    {/* Helmet outer */}
    <circle cx="50" cy="48" r="30" fill="#CBD5E1" />

    {/* Helmet shadow */}
    <circle cx="50" cy="50" r="24" fill="#334155" />

    {/* Glass visor */}
    <ellipse cx="50" cy="48" rx="20" ry="17" fill="#0EA5E9" />

    {/* Visor reflection */}
    <path
      d="
      M35 42
      Q45 30 60 35"
      stroke="#E0F2FE"
      strokeWidth="4"
      opacity=".8"
      fill="none"
    />

    {/* Face inside helmet */}
    <circle cx="50" cy="53" r="12" fill="#F6D2B5" />

    {/* Eyes */}
    <circle cx="45" cy="51" r="2" fill="#111827" />

    <circle cx="55" cy="51" r="2" fill="#111827" />

    {/* Suit */}
    <path
      d="
      M25 78
      Q50 65 75 78
      L82 100
      H18Z"
      fill="#E2E8F0"
    />

    {/* Suit lines */}
    <rect x="42" y="80" width="16" height="10" rx="2" fill="#64748B" />

    <circle cx="50" cy="85" r="3" fill="#22D3EE" />

    {/* Shoulder patches */}
    <rect x="25" y="82" width="10" height="6" fill="#2563EB" />

    <rect x="65" y="82" width="10" height="6" fill="#2563EB" />
  </>
);

export default Astronaut;
