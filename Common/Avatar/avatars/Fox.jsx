import React from "react";

const Fox = ({ fill = "#FB923C" }) => (
  <>
    {/* Background */}
    <circle cx="50" cy="50" r="50" fill={fill} />

    {/* Ears */}
    <polygon points="25,38 25,10 45,30" fill="#EA580C" />

    <polygon points="75,38 75,10 55,30" fill="#EA580C" />

    {/* Inner ears */}
    <polygon points="27,27 28,17 37,29" fill="#FED7AA" />

    <polygon points="73,27 72,17 63,29" fill="#FED7AA" />

    {/* Face */}
    <path d="M25 50 Q50 30 75 50 L65 75 Q50 88 35 75Z" fill="#FFF7ED" />

    {/* Eyes */}
    <ellipse cx="40" cy="54" rx="4" ry="6" fill="#111827" />

    <ellipse cx="60" cy="54" rx="4" ry="6" fill="#111827" />

    {/* Nose */}
    <path d="M45 65 Q50 60 55 65 Q50 72 45 65" fill="#111827" />

    {/* Smile */}
    <path
      d="M43 72 Q50 78 57 72"
      stroke="#7C2D12"
      strokeWidth="2"
      fill="none"
    />
  </>
);

export default Fox;
