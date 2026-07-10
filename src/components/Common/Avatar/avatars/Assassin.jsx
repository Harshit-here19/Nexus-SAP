import React from "react";
import assassinImage from "./assassin.jpg";

const Assassin = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className="assassin-icon"
    style={{
      filter: "drop-shadow(0px 6px 18px rgba(153, 27, 27, 0.4))",
    }}
  >
    <defs>
      <clipPath id="assassinClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>

      <filter id="assassinShadow">
        <feDropShadow
          dx="0"
          dy="5"
          stdDeviation="5"
          floodColor="#991B1B"
          floodOpacity="0.45"
        />
      </filter>
    </defs>

    <image
      href={assassinImage}
      x="-10"
      y="-10"
      width="120"
      height="120"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#assassinClip)"
      filter="url(#assassinShadow)"
    />
  </svg>
);

export default Assassin;