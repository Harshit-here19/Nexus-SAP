// src/components/Common/SapSelect.jsx
import React from 'react';

const SapSelect = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  placeholder = 'Select...',
   error = ''
}) => {
const isMobile = window.innerWidth <= 768; // Simple mobile check

  return (
    <div className="sap-form-group"  >
      {label && (
        <label
        style={{
          width: 130,
          minWidth: 90,
          textAlign: "right",
          paddingRight: 10,
          fontSize: 11,
          fontWeight: 600,
          color: "#4a5568",
          lineHeight: "26px",
          flexShrink: 0,
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}
      >
        {label}
      </label>
      )}
      <div className="sap-form-field" style={{minWidth: "160px"}}>
        <select
          className={`sap-select ${error ? 'sap-select-error' : ''}`}
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          style={{ width: '100%' }}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <div className="sap-error-text">
            {error}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default SapSelect;