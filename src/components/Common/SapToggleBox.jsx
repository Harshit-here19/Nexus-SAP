import React from "react";
import styles from "./SapToggleBox.module.css";

const SapToggleBox = ({
  value = false,
  onChange,
  disabled = false,
  // Minimalist, clean ribbon text (repeated for a seamless infinite loop)
  safeText = "SAFE FOR WORK ★ SAFE FOR WORK ★ SAFE FOR WORK",
  unsafeText = "🔞 NSFW CONTENT 🔞 NSFW CONTENT ",
  // Customizable Styles
  width = "100%",
  height = "80px",
  safeBg = "#10b981",
  unsafeBg = "#ef4444",
  borderColor = "#000000",
  shadowColor = "#000000",
  animationSpeed = "20s", // Slower, smoother crawl
  rainTextCount = 7,
}) => {
  const toggle = () => {
    if (!disabled && onChange) {
      onChange(!value);
    }
  };

  const customContainerStyle = {
    width,
    height,
    backgroundColor: value ? unsafeBg : safeBg,
    border: `3px solid ${borderColor}`,
    boxShadow: `5px 5px 0px ${shadowColor}`,
  };

  const customRainStyle = {
    animationDuration: animationSpeed,
  };

  return (
    <div
      className={`${styles.container} ${disabled ? styles.disabled : ""}`}
      style={customContainerStyle}
      onClick={toggle}
    >
      {/* Clean ribbon tracks */}
      <div className={styles.rain}>
        {[...Array(rainTextCount)].map((_, i) => (
          <div 
            key={i} 
            className={styles.rainText} 
            style={customRainStyle}
          >
            {/* Doubled text strings ensure no gaps in the infinite marquee crawl */}
            <span>{value ? unsafeText : safeText}</span>
            <span>{value ? unsafeText : safeText}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SapToggleBox;