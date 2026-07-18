import React from "react";

const Cyber = ({ fill = "#00C6FF" }) => (
  <>
    {/* Background */}
    <circle cx="50" cy="50" r="50" fill={fill} />

    {/* Glow */}
    <circle
      cx="50"
      cy="50"
      r="42"
      fill="none"
      stroke="#67E8F9"
      strokeWidth="2"
      opacity=".5"
    />

    {/* Hair / cyber hood */}
    <path
      d="M22 48 Q25 18 50 18 Q75 18 78 48 L70 35 Q50 28 30 35Z"
      fill="#0F172A"
    />

    {/* Face */}
    <path d="M30 45 Q50 35 70 45 V68 Q50 88 30 68Z" fill="#F8FAFC" />

    {/* Cyber visor */}
    <rect x="32" y="48" width="36" height="14" rx="7" fill="#020617" />

    {/* Eyes */}
    <rect x="38" y="52" width="8" height="4" rx="2" fill="#00E5FF" />

    <rect x="54" y="52" width="8" height="4" rx="2" fill="#00E5FF" />

    {/* Face details */}
    <path
      d="M40 68 Q50 73 60 68"
      stroke="#64748B"
      strokeWidth="2"
      fill="none"
    />

    {/* Tech lines */}
    <path d="M22 55 L15 55 M78 55 L85 55" stroke="#E0F2FE" strokeWidth="2" />

    <circle cx="18" cy="55" r="2" fill="#FFFFFF" />
    <circle cx="82" cy="55" r="2" fill="#FFFFFF" />
  </>
);

export default Cyber;
