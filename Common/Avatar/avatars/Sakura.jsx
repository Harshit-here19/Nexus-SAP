import React from "react";
import sakuraImage from "./sakura.avif";

const Sakura = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{
      filter: "drop-shadow(0px 6px 18px rgba(236, 72, 153, 0.35))",
    }}
  >
    <defs>
      <clipPath id="sakuraClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>

      <filter id="sakuraGlow">
        <feDropShadow
          dx="0"
          dy="4"
          stdDeviation="5"
          floodColor="#EC4899"
          floodOpacity="0.35"
        />
      </filter>
    </defs>

    <image
      href={sakuraImage}
      x="-10"
      y="-10"
      width="120"
      height="120"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#sakuraClip)"
      filter="url(#sakuraGlow)"
    />
  </svg>
);

export default Sakura;