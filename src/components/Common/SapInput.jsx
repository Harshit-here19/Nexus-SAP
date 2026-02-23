import React from "react";
import styles from "./SapInput.module.css";

const SapInput = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  readOnly = false,
  error = "",
  placeholder = "",
  maxLength,
  width = "100%",
  icon,
  onIconClick,
  className = ""
}) => {
  const isMobile = window.innerWidth <= 768;

  return (
    <div
      className={styles.formGroup}
      style={{ width: isMobile ? "100%" : "auto" }}
    >
      {label && (
        <label
          className={`${styles.formLabel} ${
            required ? styles.formLabelRequired : ""
          }`}
        >
          {label}
        </label>
      )}
      <div className={styles.formField}>
        <div
          className={styles.inputIconWrapper}
          style={{ width }}
        >
          <input
            type={type}
            className={`${className ? className : styles.input} ${
              error ? styles.inputError : ""
            } ${readOnly ? styles.inputReadOnly : ""}`}
            value={value || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            maxLength={maxLength}
            style={{ width: "100%" }}
          />
          {icon && (
            <span className={styles.icon} onClick={onIconClick}>
              {icon}
            </span>
          )}
        </div>
        {error && <div className={styles.errorText}>{error}</div>}
      </div>
    </div>
  );
};

export default SapInput;

// Simple reusable input
export const SimpleInput = ({
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = "",
  error = "",
  disabled = false,
  readOnly = false,
  maxLength,
  width = "100%"
}) => {
  return (
    <input
      type={type}
      className={`${className ? className : styles.input} ${
        error ? styles.inputError : ""
      } ${readOnly ? styles.inputReadOnly : ""}`}
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{ width }}
    />
  );
};