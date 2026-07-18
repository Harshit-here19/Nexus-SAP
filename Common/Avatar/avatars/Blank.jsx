import React from "react";

const Blank = ({ size = 100 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <defs>
      <linearGradient id="blankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
    </defs>

    <circle
      cx="50"
      cy="50"
      r="48"
      fill="url(#blankGradient)"
      stroke="#94A3B8"
      strokeWidth="2"
    />

    <circle cx="50" cy="38" r="14" fill="#94A3B8" opacity=".4" />

    <path
      d="M28 74
         C32 60 68 60 72 74"
      fill="#94A3B8"
      opacity=".4"
    />

    <circle cx="70" cy="72" r="13" fill="#3B82F6" />

    <path
      d="M70 66
         V78"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
    />

    <path
      d="M64 72
         H76"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default Blank;
