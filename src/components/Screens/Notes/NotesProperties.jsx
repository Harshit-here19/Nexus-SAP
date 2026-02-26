// src/components/Screens/Notes/NotesProperties.jsx

import React, { useState, useRef, useEffect } from 'react';
import { NOTE_CATEGORIES, PRIORITY_OPTIONS, STATUS_OPTIONS, COLOR_OPTIONS } from './NotesConstants';
import styles from './NotesProperties.module.css';

import { useConfirm } from '../../../context/ConfirmContext';

const NotesProperties = ({
  formData,
  isReadOnly,
  onChange,
  errors
}) => {
  const { prompt } = useConfirm();

  // Password section state
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
    hint: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const passwordSectionRef = useRef(null);

  // Handle lock toggle
  const handleLockToggle = async (checked) => {
    if (formData.isLocked) {
      const enteredPassword = await prompt("This note is locked. Enter password:", 
        { type: 'warning', placeholder: 'Enter Password...' }
      );

      // Replace this with your real password validation logic
      if (enteredPassword !== formData.password) {
        setPasswordErrors(prev => ({
          ...prev,
          password: 'Wrong Password'
        }));
        return;
      }
    }

    onChange('isLocked', checked);
    if (checked) {
      // Show password section with animation
      setTimeout(() => {
        passwordSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    } else {
      // Clear password data when unlocking
      setPasswordData({ password: '', confirmPassword: '', hint: '' });
      setPasswordErrors({});
      onChange('password', '');
      onChange('passwordHint', '');
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  // Get strength label and color
  const getStrengthInfo = (strength) => {
    if (strength < 30) return { label: 'Weak', color: 'var(--notes-error)', icon: '🔴' };
    if (strength < 60) return { label: 'Fair', color: 'var(--notes-warning)', icon: '🟡' };
    if (strength < 80) return { label: 'Good', color: 'var(--notes-info)', icon: '🔵' };
    return { label: 'Strong', color: 'var(--notes-success)', icon: '🟢' };
  };

  // Handle password change
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
      onChange('password', value);

      // Validate
      if (value && value.length < 6) {
        setPasswordErrors(prev => ({
          ...prev,
          password: 'Password must be at least 6 characters'
        }));
      } else {
        setPasswordErrors(prev => ({ ...prev, password: '' }));
      }

      // Check confirm password match
      if (passwordData.confirmPassword && value !== passwordData.confirmPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      } else if (passwordData.confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }

    if (field === 'confirmPassword') {
      if (value !== passwordData.password) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      } else {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }

    if (field === 'hint') {
      onChange('passwordHint', value);
    }
  };

  // Toggle password visibility
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [showConfirmText, setShowConfirmText] = useState(false);

  const strengthInfo = getStrengthInfo(passwordStrength);

  return (
    <div className={styles.propertiesContainer}>
      {/* Header */}
      <div className={styles.propertiesHeader}>
        <h3 className={styles.headerTitle}>
          <span className={styles.headerIcon}>⚙️</span>
          Note Properties
        </h3>
        <p className={styles.headerSubtitle}>
          Configure your note settings and metadata
        </p>
      </div>

      {/* Main Grid */}
      <div className={styles.propertiesGrid}>
        {/* Left Column - Basic Properties */}
        <div className={styles.propertiesColumn}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📋</span>
              <h4 className={styles.sectionTitle}>Basic Information</h4>
            </div>

            <div className={styles.sectionContent}>
              {/* Note ID */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span className={styles.labelIcon}>🔢</span>
                  Note ID
                </label>
                <div className={styles.fieldWrapper}>
                  <input
                    type="text"
                    value={formData.noteNumber || 'Auto-generated'}
                    readOnly
                    className={`${styles.fieldInput} ${styles.readOnly}`}
                  />
                  <span className={styles.fieldBadge}>Auto</span>
                </div>
              </div>

              {/* Category */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span className={styles.labelIcon}>📁</span>
                  Category
                  <span className={styles.fieldRequired}>*</span>
                </label>
                <div className={styles.fieldWrapper}>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => onChange('category', e.target.value)}
                    disabled={isReadOnly}
                    className={styles.fieldSelect}
                  >
                    <option value="">Select category...</option>
                    {NOTE_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                  <span className={styles.selectArrow}>▼</span>
                </div>
              </div>

              {/* Status */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span className={styles.labelIcon}>📊</span>
                  Status
                </label>
                <div className={styles.statusOptions}>
                  {STATUS_OPTIONS.map(status => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => !isReadOnly && onChange('status', status.value)}
                      disabled={isReadOnly}
                      className={`${styles.statusOption} ${formData.status === status.value ? styles.active : ''
                        } ${styles[`status-${status.value}`]}`}
                    >
                      <span className={styles.statusIcon}>{status.icon || '○'}</span>
                      <span className={styles.statusLabel}>{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span className={styles.labelIcon}>🚦</span>
                  Priority
                </label>
                <div className={styles.priorityOptions}>
                  {PRIORITY_OPTIONS.map(priority => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => !isReadOnly && onChange('priority', priority.value)}
                      disabled={isReadOnly}
                      className={`${styles.priorityOption} ${formData.priority === priority.value ? styles.active : ''
                        } ${styles[`priority-${priority.value}`]}`}
                      title={priority.label}
                    >
                      <span className={styles.priorityDot} />
                      <span className={styles.priorityLabel}>{priority.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span className={styles.labelIcon}>📝</span>
                  Summary
                  <span className={styles.fieldRequired}>*</span>
                </label>
                <div className={styles.fieldWrapper}>
                  <textarea
                    value={formData.summary || ''}
                    onChange={(e) => onChange('summary', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Brief summary of the note..."
                    className={`${styles.fieldTextarea} ${errors?.summary ? styles.hasError : ''}`}
                    rows={3}
                    maxLength={200}
                  />
                </div>
                <div className={styles.fieldFooter}>
                  {errors?.summary ? (
                    <span className={styles.fieldError}>{errors.summary}</span>
                  ) : (
                    <span className={styles.fieldHint}>
                      {formData.summary?.length || 0}/200 characters
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className={styles.propertiesColumn}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🔧</span>
              <h4 className={styles.sectionTitle}>Settings & Options</h4>
            </div>

            <div className={styles.sectionContent}>
              {/* Quick Toggles */}
              <div className={styles.toggleGroup}>
                {/* Pin Toggle */}
                <label className={`${styles.toggleItem} ${formData.isPinned ? styles.active : ''}`}>
                  <div className={styles.toggleContent}>
                    <span className={styles.toggleIcon}>📌</span>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Pin Note</span>
                      <span className={styles.toggleDescription}>Keep at top of list</span>
                    </div>
                  </div>
                  <div className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.isPinned || false}
                      onChange={(e) => onChange('isPinned', e.target.checked)}
                      disabled={isReadOnly}
                      className={styles.toggleCheckbox}
                    />
                    <span className={styles.toggleSlider} />
                  </div>
                </label>

                {/* Favorite Toggle */}
                <label className={`${styles.toggleItem} ${formData.isFavorite ? styles.active : ''}`}>
                  <div className={styles.toggleContent}>
                    <span className={styles.toggleIcon}>⭐</span>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Favorite</span>
                      <span className={styles.toggleDescription}>Add to favorites</span>
                    </div>
                  </div>
                  <div className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.isFavorite || false}
                      onChange={(e) => onChange('isFavorite', e.target.checked)}
                      disabled={isReadOnly}
                      className={styles.toggleCheckbox}
                    />
                    <span className={styles.toggleSlider} />
                  </div>
                </label>

                {/* Lock Toggle */}
                <label className={`${styles.toggleItem} ${styles.lockToggle} ${formData.isLocked ? styles.active : ''}`}>
                  <div className={styles.toggleContent}>
                    <span className={styles.toggleIcon}>{formData.isLocked ? '🔒' : '🔓'}</span>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Password Protect</span>
                      <span className={styles.toggleDescription}>Secure with password</span>
                    </div>
                  </div>
                  <div className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.isLocked || false}
                      onChange={(e) => handleLockToggle(e.target.checked)}
                      disabled={isReadOnly}
                      className={styles.toggleCheckbox}
                    />
                    <span className={styles.toggleSlider} />
                  </div>
                </label>

                {/* Archive Toggle */}
                <label className={`${styles.toggleItem} ${formData.isArchived ? styles.active : ''}`}>
                  <div className={styles.toggleContent}>
                    <span className={styles.toggleIcon}>📦</span>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Archive</span>
                      <span className={styles.toggleDescription}>Move to archive</span>
                    </div>
                  </div>
                  <div className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={formData.isArchived || false}
                      onChange={(e) => onChange('isArchived', e.target.checked)}
                      disabled={isReadOnly}
                      className={styles.toggleCheckbox}
                    />
                    <span className={styles.toggleSlider} />
                  </div>
                </label>
              </div>

              {/* Due Date */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span className={styles.labelIcon}>📅</span>
                  Due Date
                </label>
                <div className={styles.fieldWrapper}>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => onChange('dueDate', e.target.value)}
                    disabled={isReadOnly}
                    className={styles.fieldInput}
                  />
                  <span className={styles.inputIcon}>📅</span>
                </div>
              </div>

              {/* Reminder */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span className={styles.labelIcon}>⏰</span>
                  Reminder
                </label>
                <div className={styles.fieldWrapper}>
                  <input
                    type="datetime-local"
                    value={formData.reminder || ''}
                    onChange={(e) => onChange('reminder', e.target.value)}
                    disabled={isReadOnly}
                    className={styles.fieldInput}
                  />
                  <span className={styles.inputIcon}>⏰</span>
                </div>
              </div>

              {/* Tags */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span className={styles.labelIcon}>🏷️</span>
                  Tags
                </label>
                <div className={styles.fieldWrapper}>
                  <input
                    type="text"
                    value={formData.tags || ''}
                    onChange={(e) => onChange('tags', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Enter tags, separated by commas..."
                    className={styles.fieldInput}
                  />
                </div>
                {formData.tags && (
                  <div className={styles.tagsContainer}>
                    {formData.tags.split(',').filter(t => t.trim()).map((tag, i) => (
                      <span key={i} className={styles.tag}>
                        <span className={styles.tagHash}>#</span>
                        {tag.trim()}
                        {!isReadOnly && (
                          <button
                            type="button"
                            className={styles.tagRemove}
                            onClick={() => {
                              const newTags = formData.tags
                                .split(',')
                                .filter((_, idx) => idx !== i)
                                .join(',');
                              onChange('tags', newTags);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Section - Conditional */}
      {formData.isLocked && (
        <div
          ref={passwordSectionRef}
          className={`${styles.passwordSection} ${formData.isLocked ? styles.visible : ''}`}
        >
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🔐</span>
              <h4 className={styles.sectionTitle}>Password Protection</h4>
              <span className={styles.sectionBadge}>Required</span>
            </div>

            <div className={styles.passwordContent}>
              <div className={styles.passwordInfo}>
                <div className={styles.infoIcon}>🛡️</div>
                <div className={styles.infoText}>
                  <p className={styles.infoTitle}>Secure Your Note</p>
                  <p className={styles.infoDescription}>
                    Set a password to protect this note. You'll need to enter this password to view or edit the note.
                  </p>
                </div>
              </div>

              <div className={styles.passwordGrid}>
                {/* Password Field */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.labelIcon}>🔑</span>
                    Password
                    <span className={styles.fieldRequired}>*</span>
                  </label>
                  <div className={styles.fieldWrapper}>
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={passwordData.password}
                      onChange={(e) => handlePasswordChange('password', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Enter password..."
                      className={`${styles.fieldInput} ${styles.passwordInput} ${passwordErrors.password ? styles.hasError : ''
                        }`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      title={showPasswordText ? 'Hide password' : 'Show password'}
                    >
                      {showPasswordText ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordData.password && (
                    <div className={styles.strengthIndicator}>
                      <div className={styles.strengthBar}>
                        <div
                          className={styles.strengthFill}
                          style={{
                            width: `${passwordStrength}%`,
                            background: strengthInfo.color
                          }}
                        />
                      </div>
                      <span
                        className={styles.strengthLabel}
                        style={{ color: strengthInfo.color }}
                      >
                        {strengthInfo.icon} {strengthInfo.label}
                      </span>
                    </div>
                  )}

                  {passwordErrors.password && (
                    <span className={styles.fieldError}>{passwordErrors.password}</span>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.labelIcon}>🔑</span>
                    Confirm Password
                    <span className={styles.fieldRequired}>*</span>
                  </label>
                  <div className={styles.fieldWrapper}>
                    <input
                      type={showConfirmText ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Confirm password..."
                      className={`${styles.fieldInput} ${styles.passwordInput} ${passwordErrors.confirmPassword ? styles.hasError : ''
                        } ${passwordData.confirmPassword &&
                          passwordData.confirmPassword === passwordData.password ?
                          styles.isValid : ''
                        }`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowConfirmText(!showConfirmText)}
                      title={showConfirmText ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmText ? '🙈' : '👁️'}
                    </button>
                    {passwordData.confirmPassword &&
                      passwordData.confirmPassword === passwordData.password && (
                        <span className={styles.matchIcon}>✓</span>
                      )}
                  </div>
                  {passwordErrors.confirmPassword && (
                    <span className={styles.fieldError}>{passwordErrors.confirmPassword}</span>
                  )}
                </div>

                {/* Password Hint */}
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.fieldLabel}>
                    <span className={styles.labelIcon}>💡</span>
                    Password Hint
                    <span className={styles.fieldOptional}>(Optional)</span>
                  </label>
                  <div className={styles.fieldWrapper}>
                    <input
                      type="text"
                      value={passwordData.hint}
                      onChange={(e) => handlePasswordChange('hint', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Enter a hint to help remember your password..."
                      className={styles.fieldInput}
                      maxLength={100}
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    This hint will be shown if you forget your password
                  </span>
                </div>
              </div>

              {/* Password Requirements */}
              <div className={styles.passwordRequirements}>
                <h5 className={styles.requirementsTitle}>Password Requirements:</h5>
                <ul className={styles.requirementsList}>
                  <li className={passwordData.password.length >= 6 ? styles.met : ''}>
                    <span className={styles.checkIcon}>
                      {passwordData.password.length >= 6 ? '✓' : '○'}
                    </span>
                    At least 6 characters
                  </li>
                  <li className={passwordData.password.length >= 8 ? styles.met : ''}>
                    <span className={styles.checkIcon}>
                      {passwordData.password.length >= 8 ? '✓' : '○'}
                    </span>
                    8+ characters recommended
                  </li>
                  <li className={/[A-Z]/.test(passwordData.password) ? styles.met : ''}>
                    <span className={styles.checkIcon}>
                      {/[A-Z]/.test(passwordData.password) ? '✓' : '○'}
                    </span>
                    Contains uppercase letter
                  </li>
                  <li className={/[0-9]/.test(passwordData.password) ? styles.met : ''}>
                    <span className={styles.checkIcon}>
                      {/[0-9]/.test(passwordData.password) ? '✓' : '○'}
                    </span>
                    Contains number
                  </li>
                  <li className={/[^a-zA-Z0-9]/.test(passwordData.password) ? styles.met : ''}>
                    <span className={styles.checkIcon}>
                      {/[^a-zA-Z0-9]/.test(passwordData.password) ? '✓' : '○'}
                    </span>
                    Contains special character
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color Selection */}
      <div className={styles.colorSection}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎨</span>
            <h4 className={styles.sectionTitle}>Note Color</h4>
          </div>

          <div className={styles.colorContent}>
            <p className={styles.colorDescription}>
              Choose a color to organize and identify your note quickly
            </p>
            <div className={styles.colorPicker}>
              {/* No Color Option */}
              <button
                type="button"
                onClick={() => !isReadOnly && onChange('color', '')}
                disabled={isReadOnly}
                className={`${styles.colorSwatch} ${styles.noColor} ${!formData.color ? styles.selected : ''
                  }`}
                title="No color"
              >
                <span className={styles.noColorIcon}>✕</span>
              </button>

              {/* Color Options */}
              {COLOR_OPTIONS.filter(c => c).map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => !isReadOnly && onChange('color', color)}
                  disabled={isReadOnly}
                  className={`${styles.colorSwatch} ${formData.color === color ? styles.selected : ''
                    }`}
                  style={{ '--swatch-color': color }}
                  title={color}
                >
                  {formData.color === color && (
                    <span className={styles.colorCheck}>✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Color Preview */}
            {formData.color && (
              <div
                className={styles.colorPreview}
                style={{ '--preview-color': formData.color }}
              >
                <span className={styles.previewLabel}>Preview:</span>
                <div className={styles.previewCard}>
                  <div className={styles.previewAccent} />
                  <div className={styles.previewContent}>
                    <span className={styles.previewTitle}>Note Title</span>
                    <span className={styles.previewText}>This is how your note will appear...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Info */}
      <div className={styles.metadataSection}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>ℹ️</span>
            <h4 className={styles.sectionTitle}>Metadata</h4>
          </div>

          <div className={styles.metadataGrid}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataIcon}>📅</span>
              <div className={styles.metadataInfo}>
                <span className={styles.metadataLabel}>Created</span>
                <span className={styles.metadataValue}>
                  {formData.createdAt
                    ? new Date(formData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : 'Not yet saved'
                  }
                </span>
              </div>
            </div>

            <div className={styles.metadataItem}>
              <span className={styles.metadataIcon}>✏️</span>
              <div className={styles.metadataInfo}>
                <span className={styles.metadataLabel}>Last Modified</span>
                <span className={styles.metadataValue}>
                  {formData.updatedAt
                    ? new Date(formData.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : 'Never'
                  }
                </span>
              </div>
            </div>

            <div className={styles.metadataItem}>
              <span className={styles.metadataIcon}>👤</span>
              <div className={styles.metadataInfo}>
                <span className={styles.metadataLabel}>Author</span>
                <span className={styles.metadataValue}>
                  {formData.author || 'Current User'}
                </span>
              </div>
            </div>

            <div className={styles.metadataItem}>
              <span className={styles.metadataIcon}>📊</span>
              <div className={styles.metadataInfo}>
                <span className={styles.metadataLabel}>Version</span>
                <span className={styles.metadataValue}>
                  {formData.version || '1.0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesProperties;