import React from "react";
import crystalImage from "./crystal.webp";

const Crystal = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{
      filter: "drop-shadow(0px 6px 20px rgba(56, 189, 248, 0.4))"
    }}
  >
    <defs>
      <clipPath id="crystalClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>

      <filter id="crystalGlow">
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="5"
          floodColor="#38BDF8"
          floodOpacity="0.5"
        />
      </filter>
    </defs>

    {/* Crystal WebP image */}
    <image
      href={crystalImage}
      x="0"
      y="0"
      width="100"
      height="100"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#crystalClip)"
      filter="url(#crystalGlow)"
    />
  </svg>
);

export default Crystal;