// src/components/Common/SapInput.jsx
import React from 'react';

const SapInput = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  readOnly = false,
  error = '',
  placeholder = '',
  maxLength,
  width = '100%',
  icon,
  onIconClick,
  className=''
}) => {
  return (
    <div className="sap-form-group">
      {label && (
        <label className={`sap-form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <div className="sap-form-field">
        <div className={`sap-input-icon`} style={{ width }}>
          <input
            type={type}
            className={className ? className : `sap-input ${error ? 'error' : ''}`}
            value={value || ''}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            maxLength={maxLength}
            style={{ width: '100%' }}
          />
          {icon && (
            <span className="icon" onClick={onIconClick}>
              {icon}
            </span>
          )}
        </div>
        {error && (
          <div style={{ color: 'var(--sap-negative)', fontSize: '12px', marginTop: '4px' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SapInput;

// 1️SimpleInput: minimal reusable input
export const SimpleInput = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
  error = '',
  disabled = false,
  readOnly = false,
  maxLength,
  width = '100%',
}) => {
  return (
    <input
      type={type}
      className={className ? className : `sap-input ${error ? 'error' : ''}`}
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{ width }}
    />
  );
};