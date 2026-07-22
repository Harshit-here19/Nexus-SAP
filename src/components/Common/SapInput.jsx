import React, { useState, useEffect, useRef } from "react";
import styles from "./SapInput.module.css";

// Helper function to validate custom user date strings
const isValidDate = (dateStr) => {
  if (!dateStr) return true; // Empty string is allowed unless required

  // 1. Standard ISO Format: YYYY-MM-DD
  let match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  // 2. SAP Standard / European Formats: DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  match = dateStr.match(/^(\d{2})[. \/-](\d{2})[. \/-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  // 3. Compact SAP Format: YYYYMMDD
  match = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (match) {
    const [, year, month, day] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  return false;
};

// Helper to format any supported string format to standard ISO (YYYY-MM-DD)
const normalizeToISO = (dateStr) => {
  let match = dateStr.match(/^(\d{2})[. \/-](\d{2})[. \/-](\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;

  match = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  return dateStr;
};

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
  step = "any",
  labelWidth,
  ...rest
}) => {
  const isMobile = window.innerWidth <= 768;
  const datePickerRef = useRef(null);

  // Date-specific state
  const [internalError, setInternalError] = useState("");
  const [dateText, setDateText] = useState("");

  useEffect(() => {
    if (type === "date") {
      if (value) {
        const iso = normalizeToISO(value);

        if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          const [year, month, day] = iso.split("-");
          setDateText(`${day}.${month}.${year}`);
        }
      } else {
        setDateText("");
      }
    }
  }, [value, type]);

  const validateDate = () => {
    if (type !== "date") return true;

    if (!value) {
      setInternalError("");
      return true;
    }

    if (isValidDate(String(value))) {
      setInternalError("");

      return true;
    }

    setInternalError("Invalid Date");

    return false;
  };

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
    } else if (type === "date") {
      const val = e.target.value;

      setDateText(val);

      if (isValidDate(val)) {
        onChange(normalizeToISO(val));
      }
    } else {
      onChange(e.target.value);
    }
  };

  const handleOpenCalendar = () => {
    if (disabled || readOnly) return;
    if (datePickerRef.current) {
      if (typeof datePickerRef.current.showPicker === "function") {
        datePickerRef.current.showPicker();
      } else {
        datePickerRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      validateDate();
    }

    // Standard SAP shortcut: Press F4 in date fields to open calendar
    if (type === "date" && e.key === "F4") {
      e.preventDefault();
      handleOpenCalendar();
    }
    if (rest.onKeyDown) {
      rest.onKeyDown(e);
    }
  };

  const hasError = Boolean(error || internalError);
  const activeErrorText = error || internalError;

  return (
    <div
      className={styles.formGroup}
      style={{ width: isMobile ? "100%" : "auto" }}
    >
      {label && (
        <label
          className={`${styles.formLabel} ${required ? styles.formLabelRequired : ""
            }`}
          style={{ "--label-width": labelWidth }}
        >
          {label}
        </label>
      )}

      <div className={styles.formField}>
        <div className={styles.inputIconWrapper} style={{ width }}>
          <input
            type={type === "date" ? "text" : type}
            className={`${className ? className : styles.input} ${hasError ? styles.inputError : ""
              } ${readOnly ? styles.inputReadOnly : ""}`}
            value={
              type === "date"
                ? dateText
                : value ?? ""
            }
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={validateDate}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={
              placeholder || (type === "date" ? "DD.MM.YYYY" : "")
            }
            maxLength={type !== "number" ? maxLength : undefined}
            min={type === "number" ? min : undefined}
            max={type === "number" ? max : undefined}
            step={type === "number" ? step : undefined}
            style={{ width: "100%" }}
            {...rest}
          />

          {/* Special Calendar Trigger for Date Inputs */}
          {type === "date" && (
            <>
              <span
                className={`${styles.icon} ${styles.dateIcon}`}
                onClick={handleOpenCalendar}
                title="Select Date (F4)"
              >
                📅
              </span>
              <input
                ref={datePickerRef}
                type="date"
                tabIndex={-1}
                className={styles.hiddenNativeDatePicker}
                value={value ?? ""}
                onChange={(e) => {
                  const iso = e.target.value;
                  onChange(iso);
                  const [year, month, day] = iso.split("-");
                  setDateText(`${day}.${month}.${year}`);
                  setInternalError("");
                }}
                onBlur={validateDate}
                disabled={disabled}
                readOnly={readOnly}
              />
            </>
          )}

          {/* Standard Icon Support */}
          {type !== "date" && icon && (
            <span className={styles.icon} onClick={onIconClick}>
              {icon}
            </span>
          )}
        </div>

        {hasError && <div className={styles.errorText}>{activeErrorText}</div>}
      </div>
    </div>
  );
};

export default SapInput;

// Simple reusable input
export const SimpleInput = ({
  value,
  onChange,
  onKeyDown,
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
  step = "any",
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
      className={`${className ? className : styles.input} ${error ? styles.inputError : ""
        } ${readOnly ? styles.inputReadOnly : ""}`}
      value={value ?? ""}
      onChange={handleChange}
      onKeyDown={onKeyDown}
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