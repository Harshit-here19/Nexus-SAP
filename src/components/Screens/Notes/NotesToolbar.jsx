// src/components/Screens/Notes/NotesToolbar.jsx

import React from 'react';
import { FORMATTING_OPTIONS } from './NotesConstants';
import styles from "./NotesToolbar.module.css"

const NotesToolbar = ({
  onFormat,
  showPreview,
  onTogglePreview,
  disabled = false
}) => {
  return (
    <div className={styles["notes-toolbar"]}>
      <div className={styles["notes-toolbar-formatting"]}>
        {FORMATTING_OPTIONS.map((opt, idx) => {
          if (opt.action === 'separator') {
            return (
              <div
                key={`sep-${idx}`}
                className={styles["notes-toolbar-separator"]}
              />
            );
          }
          return (
            <button
              key={opt.action}
              onClick={() => onFormat(opt.action)}
              title={opt.title}
              className={styles["notes-toolbar-button"]}
              disabled={disabled}
              style={{
                fontWeight: opt.style?.fontWeight || 'normal',
                fontStyle: opt.style?.fontStyle || 'normal',
                textDecoration: opt.style?.textDecoration || 'none'
              }}
            >
              {opt.icon}
            </button>
          );
        })}
      </div>

      <div className={styles["notes-toolbar-actions"]}>
        <button
          onClick={onTogglePreview}
          className={`${styles["notes-toolbar-preview"]} ${showPreview ? styles.active : ''}`}
          disabled={disabled}
        >
          {showPreview ? '✏️ Edit' : '👁️ Preview'}
        </button>
      </div>
    </div>
  );
};

export default NotesToolbar;