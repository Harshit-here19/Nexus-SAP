import React from "react";
import kitsuneImage from "./kitsune.jpg";

const Kitsune = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{
      filter: "drop-shadow(0px 6px 18px rgba(249, 115, 22, 0.35))",
    }}
  >
    <defs>
      <clipPath id="kitsuneClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>

      <filter id="kitsuneShadow">
        <feDropShadow
          dx="0"
          dy="5"
          stdDeviation="5"
          floodColor="#F97316"
          floodOpacity="0.4"
        />
      </filter>
    </defs>

    <image
      href={kitsuneImage}
      x="-10"
      y="-10"
      width="120"
      height="120"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#kitsuneClip)"
      filter="url(#kitsuneShadow)"
    />
  </svg>
);

export default Kitsune;