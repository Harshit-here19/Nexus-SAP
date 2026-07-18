import React from "react";
import dragonImage from "./dragon.jpg";

const Dragon = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className="dragon-silhouette-icon"
  >
    <defs>
      <clipPath id="dragonClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>

      <filter id="dragonShadow">
        <feDropShadow
          dx="0"
          dy="5"
          stdDeviation="5"
          floodColor="#0F172A"
          floodOpacity="0.45"
        />
      </filter>
    </defs>

    <image
      href={dragonImage}
      x="0"
      y="0"
      width="100"
      height="100"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#dragonClip)"
      filter="url(#dragonShadow)"
    />
  </svg>
);

export default Dragon;