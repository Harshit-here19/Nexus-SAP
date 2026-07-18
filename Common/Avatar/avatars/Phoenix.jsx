import React from "react";
import phoenixImage from "./phoenix.webp";

const Phoenix = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{
      filter: "drop-shadow(0 8px 18px rgba(255,120,0,.35))",
    }}
  >
    <defs>
      <clipPath id="phoenixClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>

      <filter id="phoenixGlow">
        <feDropShadow
          dx="0"
          dy="4"
          stdDeviation="5"
          floodColor="#FF7800"
          floodOpacity="0.45"
        />
      </filter>
    </defs>

    <image
      href={phoenixImage}
      x="0"
      y="0"
      width="100"
      height="100"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#phoenixClip)"
      filter="url(#phoenixGlow)"
    />
  </svg>
);

export default Phoenix;