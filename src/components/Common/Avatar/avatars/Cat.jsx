import React from "react";
import catImage from "./cat.avif";

const Cat = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{
      filter: "drop-shadow(0px 6px 18px rgba(251, 191, 36, 0.35))",
    }}
  >
    <defs>
      <clipPath id="catClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>

      <filter id="catShadow">
        <feDropShadow
          dx="0"
          dy="5"
          stdDeviation="5"
          floodColor="#F59E0B"
          floodOpacity="0.4"
        />
      </filter>
    </defs>

    <image
      href={catImage}
      x="-10"
      y="-10"
      width="120"
      height="120"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#catClip)"
      filter="url(#catShadow)"
    />
  </svg>
);

export default Cat;