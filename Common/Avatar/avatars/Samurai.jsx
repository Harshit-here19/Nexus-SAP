import React from "react";
import samuraiImage from "./samurai.jpg";

const Samurai = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className="demon-slayer-icon"
    style={{
      filter: "drop-shadow(0px 6px 18px rgba(185, 28, 28, 0.4))",
    }}
  >
    <defs>
      <clipPath id="samuraiClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>

      <filter id="samuraiShadow">
        <feDropShadow
          dx="0"
          dy="5"
          stdDeviation="5"
          floodColor="#B91C1C"
          floodOpacity="0.45"
        />
      </filter>
    </defs>

    <image
      href={samuraiImage}
      x="-10"
      y="-10"
      width="120"
      height="120"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#samuraiClip)"
      filter="url(#samuraiShadow)"
    />
  </svg>
);

export default Samurai;
