// src/components/Screens/Notes/NotesVerticalToolbar.jsx

import React, { useState } from 'react';
import { VERTICAL_FORMATTING_OPTIONS } from './NotesConstants';
import styles from "./NotesVerticalToolbar.module.css";

const NotesVerticalToolbar = ({
  onFormat,
  showPreview,
  onTogglePreview,
  disabled = false,
  position = 'left', // 'left' or 'right'
  collapsed = false,
  onToggleCollapse,
  theme = 'glass' // 'glass', 'solid', 'minimal', 'dark'
}) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);

  // Group formatting options by category
  const groupedOptions = VERTICAL_FORMATTING_OPTIONS.reduce((acc, opt, idx) => {
    if (opt.action === 'separator') {
      acc.push({ type: 'separator', id: `sep-${idx}` });
    } else {
      const lastGroup = acc[acc.length - 1];
      if (lastGroup && lastGroup.type === 'group') {
        lastGroup.items.push(opt);
      } else {
        acc.push({ type: 'group', items: [opt] });
      }
    }
    return acc;
  }, []);

  const handleMouseEnter = (action) => {
    setActiveTooltip(action);
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <div 
      className={`
        ${styles.toolbar} 
        ${styles[position]} 
        ${styles[theme]}
        ${collapsed ? styles.collapsed : ''}
        ${disabled ? styles.disabled : ''}
      `}
    >
      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          className={styles.collapseToggle}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand toolbar' : 'Collapse toolbar'}
        >
          <span className={styles.collapseIcon}>
            {collapsed 
              ? (position === 'left' ? '»' : '«') 
              : (position === 'left' ? '«' : '»')
            }
          </span>
        </button>
      )}

      {/* Main Toolbar Content */}
      <div className={styles.toolbarContent}>
        {/* Preview Toggle */}
        <div 
            className={styles.buttonWrapper}
            onMouseEnter={() => handleMouseEnter('preview')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={onTogglePreview}
              className={`${styles.toolbarButton} ${styles.previewButton} ${showPreview ? styles.active : ''}`}
              disabled={disabled}
              aria-label={showPreview ? 'Edit mode' : 'Preview mode'}
            >
              <span className={styles.buttonIcon}>
                {showPreview ? '✏️' : '👁️'}
              </span>
              {!collapsed && (
                <span className={styles.buttonLabel}>
                  {showPreview ? 'Edit' : 'Preview'}
                </span>
              )}
            </button>

            {activeTooltip === 'preview' && collapsed && (
              <div className={`${styles.tooltip} ${styles[position]}`}>
                {showPreview ? 'Switch to Edit' : 'Switch to Preview'}
              </div>
            )}
          </div>

        {/* Formatting Buttons */}
        <div className={styles.formattingSection}>
          {VERTICAL_FORMATTING_OPTIONS.map((opt, idx) => {
            if (opt.action === 'separator') {
              return (
                <div
                  key={`sep-${idx}`}
                  className={styles.separator}
                />
              );
            }

            return (
              <div 
                key={opt.action} 
                className={styles.buttonWrapper}
                onMouseEnter={() => handleMouseEnter(opt.action)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => onFormat(opt.action)}
                  title={opt.title}
                  className={styles.toolbarButton}
                  disabled={disabled}
                  aria-label={opt.title}
                  style={{
                    fontWeight: opt.style?.fontWeight || 'normal',
                    fontStyle: opt.style?.fontStyle || 'normal',
                    textDecoration: opt.style?.textDecoration || 'none'
                  }}
                >
                  <span className={styles.buttonIcon}>{opt.icon}</span>
                  {!collapsed && (
                    <span className={styles.buttonLabel}>{opt.label}</span>
                  )}
                </button>

                {/* Tooltip */}
                {activeTooltip === opt.action && collapsed && (
                  <div className={`${styles.tooltip} ${styles[position]}`}>
                    {opt.title}
                    {opt.shortcut && (
                      <span className={styles.shortcut}>{opt.shortcut}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Spacer */}
        <div className={styles.spacer} />

        {/* Action Buttons */}
        <div className={styles.actionsSection}>

          <button
            className={styles.toolbarButton}
            onClick={() => onFormat('undo')}
            disabled={disabled}
            title="Undo"
          >
            <span className={styles.buttonIcon}>↩️</span>
            {!collapsed && <span className={styles.buttonLabel}>Undo</span>}
          </button>

          <button
            className={styles.toolbarButton}
            onClick={() => onFormat('redo')}
            disabled={disabled}
            title="Redo"
          >
            <span className={styles.buttonIcon}>↪️</span>
            {!collapsed && <span className={styles.buttonLabel}>Redo</span>}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      {!collapsed && (
        <div className={styles.shortcutHint}>
          <span className={styles.hintIcon}>⌨️</span>
          <span className={styles.hintText}>Press ? for shortcuts</span>
        </div>
      )}
    </div>
  );
};

export default NotesVerticalToolbar;