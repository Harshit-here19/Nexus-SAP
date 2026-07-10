import React from "react";

const Panda = ({ fill = "#FFFFFF" }) => (
  <>
    {/* Background */}
    <circle cx="50" cy="50" r="50" fill={fill} />

    {/* Ears */}
    <circle cx="28" cy="25" r="10" fill="#111827" />
    <circle cx="72" cy="25" r="10" fill="#111827" />

    {/* Head */}
    <circle cx="50" cy="55" r="30" fill="#F8FAFC" />

    {/* Eye patches */}
    <ellipse
      cx="38"
      cy="52"
      rx="8"
      ry="12"
      fill="#111827"
      transform="rotate(-25 38 52)"
    />

    <ellipse
      cx="62"
      cy="52"
      rx="8"
      ry="12"
      fill="#111827"
      transform="rotate(25 62 52)"
    />

    {/* Eyes */}
    <circle cx="39" cy="52" r="3" fill="white" />
    <circle cx="61" cy="52" r="3" fill="white" />

    {/* Nose */}
    <circle cx="50" cy="62" r="4" fill="#111827" />

    {/* Mouth */}
    <path
      d="M44 68 Q50 74 56 68"
      stroke="#111827"
      strokeWidth="2"
      fill="none"
    />

    {/* Cheeks */}
    <circle cx="30" cy="65" r="4" fill="#FDA4AF" opacity=".6" />

    <circle cx="70" cy="65" r="4" fill="#FDA4AF" opacity=".6" />
  </>
);

export default Panda;
