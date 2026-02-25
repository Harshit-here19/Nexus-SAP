import React from "react";
import styles from "./SapSelect.module.css";

const SapSelect = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  placeholder = "Select...",
  error = ""
}) => {

  return (
    <div className={styles.sapFormGroup}>
      {label && (
        <label
          className={`${styles.sapSelectLabel} ${
            required ? styles.sapSelectLabelRequired : ""
          }`}
        >
          {label}
        </label>
      )}

      <div className={styles.sapFormField}>
        <select
          className={`${styles.sapSelect} ${
            error ? styles.sapSelectError : ""
          }`}
          value={value || ""}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <div className={styles.sapErrorText}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SapSelect;