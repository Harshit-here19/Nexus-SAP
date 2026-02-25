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
  className = "",
  min,
  max,
  step = "any"
}) => {
  const isMobile = window.innerWidth <= 768;

  const handleChange = (e) => {
    if (!onChange) return;

    if (type === "number") {
      const val = e.target.value;

      // Allow empty
      if (val === "") {
        onChange("");
        return;
      }

      const parsed = Number(val);

      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    } else {
      onChange(e.target.value);
    }
  };

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
            value={value ?? ""}
            onChange={handleChange}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            maxLength={type !== "number" ? maxLength : undefined}
            min={type === "number" ? min : undefined}
            max={type === "number" ? max : undefined}
            step={type === "number" ? step : undefined}
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
  width = "100%",
  min,
  max,
  step = "any"
}) => {

  const handleChange = (e) => {
    if (!onChange) return;

    if (type === "number") {
      const val = e.target.value;

      if (val === "") {
        onChange("");
        return;
      }

      const parsed = Number(val);

      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <input
      type={type}
      className={`${className ? className : styles.input} ${
        error ? styles.inputError : ""
      } ${readOnly ? styles.inputReadOnly : ""}`}
      value={value ?? ""}
      onChange={handleChange}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      maxLength={type !== "number" ? maxLength : undefined}
      min={type === "number" ? min : undefined}
      max={type === "number" ? max : undefined}
      step={type === "number" ? step : undefined}
      style={{ width }}
    />
  );
};