import React from "react";
import demonImage from "./demon.jpg";

const Demon = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{
      filter: "drop-shadow(0px 6px 20px rgba(219, 39, 119, 0.45))",
    }}
  >
    <defs>

      {/* Circular avatar crop */}
      <clipPath id="demonClip">
        <circle cx="50" cy="50" r="48" />
      </clipPath>


      {/* Demon pink/violet glow */}
      <filter id="demonGlow">

        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="5"
          floodColor="#DB2777"
          floodOpacity="0.55"
        />

      </filter>


    </defs>



    {/* Demon WebP Image */}

    <image
      href={demonImage}
      x="0"
      y="0"
      width="100"
      height="100"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#demonClip)"
      filter="url(#demonGlow)"
    />


  </svg>
);


export default Demon;