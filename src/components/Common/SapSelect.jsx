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
  width = '200px'
}) => {
  return (
    <div className="sap-form-group">
      {label && (
        <label className={`sap-form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <div className="sap-form-field">
        <select
          className="sap-select"
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          style={{ width }}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SapSelect;