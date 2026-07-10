import React from "react";

const Pirate = ({ size = 100 }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{ filter: "drop-shadow(0px 4px 14px rgba(15, 23, 42, 0.4))" }}
  >
    <defs>
      {/* Caribbean Teal Sea Backdrop */}
      <radialGradient id="oceanVoid" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0d9488" />
        <stop offset="60%" stopColor="#115e59" />
        <stop offset="100%" stopColor="#042f2e" />
      </radialGradient>

      {/* Weathered Tricorn Leather */}
      <linearGradient id="tricornLeather" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#291a10" />
        <stop offset="100%" stopColor="#130b05" />
      </linearGradient>

      {/* Sun-Baked Rogue Skin */}
      <linearGradient id="pirateSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffedd5" />
        <stop offset="60%" stopColor="#fed7aa" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>

      {/* Crimson Captain Bandana */}
      <linearGradient id="bandanaRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#991b1b" />
        <stop offset="50%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
    </defs>

    {/* Background Circle (Deep Waters) */}
    <circle
      cx="50"
      cy="50"
      r="48"
      fill="url(#oceanVoid)"
      stroke="#0d9488"
      strokeWidth="1"
    />

    {/* ================= 1. DREADLOCKS & BEADS (BACKGROUND LAYER) ================= */}
    {/* Loose messy dreadlocks hanging past shoulders */}
    <path
      d="M22 55 C14 68, 12 85, 24 100 H76 C88 85, 86 68, 78 55 Z"
      fill="#1c120c"
    />
    {/* Jack's iconic dangling silver trinket and piece-of-eight beads on the right side */}
    <circle cx="76" cy="62" r="1.5" fill="#f59e0b" />
    <circle cx="75" cy="66" r="1.2" fill="#ef4444" />
    <circle cx="76" cy="70" r="1.5" fill="#94a3b8" />
    <polygon points="74,73 78,73 76,80" fill="#cbd5e1" />

    {/* ================= 2. SUN-BAKED FACE STRUCTURE ================= */}
    <path
      d="M30 46 Q50 36 70 46 L65 68 Q50 82 35 68 Z"
      fill="url(#pirateSkin)"
      stroke="#d97706"
      strokeWidth="0.5"
    />

    {/* ================= 3. PIRATE BANDANA & SLUNG FABRIC ================= */}
    {/* The legendary red bandana wrapped low across his forehead */}
    <path
      d="M28 44 Q50 36 72 44 L71 50 Q50 42 29 50 Z"
      fill="url(#bandanaRed)"
    />
    {/* Left side bandana knot tail peeking out */}
    <path d="M28 46 Q20 50 24 58 Q28 54 29 48 Z" fill="#7f1d1d" />

    {/* ================= 4. KOHL-LINED SMOKY EYES ================= */}
    {/* Thick black eyeliner/kohl frames to mimic Johnny Depp's look */}
    <ellipse cx="40" cy="53" rx="5" ry="3" fill="#1c1917" />
    <ellipse cx="60" cy="53" rx="5" ry="3" fill="#1c1917" />
    {/* Dark brown irises */}
    <circle cx="40" cy="53" r="2" fill="#451a03" />
    <circle cx="60" cy="53" r="2" fill="#451a03" />
    {/* Pupils and small white glance highlights */}
    <circle cx="40" cy="53" r="0.8" fill="#000000" />
    <circle cx="60" cy="53" r="0.8" fill="#000000" />
    <circle cx="39" cy="52" r="0.5" fill="#ffffff" />
    <circle cx="59" cy="52" r="0.5" fill="#ffffff" />
    {/* Expressive, cocked dark eyebrows */}
    <path
      d="M34 49 Q40 46 46 51"
      fill="none"
      stroke="#0a0503"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M66 48 Q60 46 54 51"
      fill="none"
      stroke="#0a0503"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* ================= 5. FACIAL HAIR (THE JACK SPARROW SPECIAL) ================= */}
    {/* Thin mustache splitting down and framing the lip corners */}
    <path d="M41 64 Q45 61 50 63 Q55 61 59 64 Q50 66 41 64 Z" fill="#0a0503" />
    <path
      d="M41 64 Q38 69 39 71 M59 64 Q62 69 61 71"
      fill="none"
      stroke="#0a0503"
      strokeWidth="1"
    />
    {/* Soul patch under lower lip */}
    <polygon points="47,68 53,68 50,73" fill="#0a0503" />
    {/* Iconic twin-braided goatee dangling off the chin */}
    <path d="M44 76 L43 88 L46 88 L47 77 Z" fill="#0a0503" />
    <path d="M56 76 L57 88 L54 88 L53 77 Z" fill="#0a0503" />
    {/* Colorful tie beads on the braids */}
    <circle cx="44.5" cy="83" r="1.2" fill="#38bdf8" />
    <circle cx="55.5" cy="83" r="1.2" fill="#ef4444" />

    {/* Smirking lip line hidden under the stache */}
    <path
      d="M44 67 Q50 70 56 67"
      fill="none"
      stroke="#451a03"
      strokeWidth="1"
    />

    {/* ================= 6. THE TRICORN HAT (FOREGROUND LAYER) ================= */}
    {/* The massive triangular-swept leather hat sitting high and proudly askew */}
    <path
      d="M14 36 C22 36, 32 20, 50 24 C68 20, 78 36, 86 36 C74 44, 62 44, 50 40 C38 44, 26 44, 14 36 Z"
      fill="url(#tricornLeather)"
      stroke="#0a0503"
      strokeWidth="0.5"
    />
    {/* Internal crease lines defining the turned-up tricorn brim flaps */}
    <path
      d="M26 36 Q50 31 74 36"
      fill="none"
      stroke="#130b05"
      strokeWidth="1.5"
      opacity="0.6"
    />
  </svg>
);

export default Pirate;
