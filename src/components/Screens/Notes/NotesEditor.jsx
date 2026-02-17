// src/components/Screens/Notes/NotesEditor.jsx

import { forwardRef } from "react";
import { SimpleInput } from "../../Common/SapInput";
import NotesToolbar from "./NotesToolbar";
import { parseMarkdown } from "./NotesUtils";
import styles from "./NotesEditor.module.css";

const NotesEditor = forwardRef(
  (
    {
      formData,
      errors,
      isReadOnly,
      showPreview,
      onShowPreviewChange,
      onTitleChange,
      onContentChange,
      onFormat,
      loadDemoNote,
      mode,
    },
    ref,
  ) => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            onFormat("bold");
            break;
          case "i":
            e.preventDefault();
            onFormat("italic");
            break;
          case "u":
            e.preventDefault();
            onFormat("underline");
            break;
          default:
            break;
        }
      }
    };

    return (
      <div className={styles["notes-editor-container"]}>
        {/* Header Section */}
        <div className={styles["notes-editor-header"]}>
          {/* Formatting Toolbar */}
          {!isReadOnly && (
            <NotesToolbar
              onFormat={onFormat}
              showPreview={showPreview}
              onTogglePreview={() => onShowPreviewChange(!showPreview)}
            />
          )}
        </div>

        {/* Title Section */}
        <div className={styles['notes-title-hero']}>
          <div className={`${styles['notes-title-hero-wrapper']} ${errors.title ? styles['has-error'] : ''}`}>

            <SimpleInput
              value={formData.title}
              onChange={onTitleChange}
              required={true}
              disabled={isReadOnly}
              error={errors.title}
              placeholder="Enter note title..."
              className={`${styles['notes-title-hero-input']} ${errors.title ? styles['has-error'] : ''}`}
            />
            {formData.title && !isReadOnly && (
              <button
                type="button"
                className={styles['notes-title-clear']}
                onClick={() => onTitleChange('')}
                title="Clear title"
                aria-label="Clear title"
              >
                <span className={styles['clear-icon']}>×</span>
              </button>
            )}
          </div>
          {errors.title && (
            <span className={styles['notes-title-error']}>{errors.title}</span>
          )}
        </div>

        {/* Content Area */}
        <div className={styles["notes-content-section"]}>
          <div className={styles["notes-content-header"]}>
            <label className={styles["notes-content-label"]}>
              Content
              {!isReadOnly && (
                <span className={styles["notes-content-hint"]}>
                  Markdown supported
                </span>
              )}
            </label>

            {mode === "create" && !formData.content && (
              <button
                onClick={loadDemoNote}
                className={styles["load-demo-button"]}
              >
                📋 Load demo
              </button>
            )}
          </div>

          <div className={styles["notes-editor-wrapper"]}>
            <div className={styles["notes-editor-inner"]}>
              {showPreview || isReadOnly ? (
                <div className={styles["notes-preview-wrapper"]}>
                  <div
                    className={styles["notes-preview"]}
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdown(formData.content),
                    }}
                  />
                </div>
              ) : (
                <div className={styles["notes-textarea-wrapper"]}>
                  <textarea
                    ref={ref}
                    value={formData.content}
                    onChange={(e) => onContentChange(e.target.value)}
                    disabled={isReadOnly}
                    placeholder={`Start writing your note...

📝 Formatting tips:
──────────────────
• **bold** or *italic* or __underline__
• # Heading 1, ## Heading 2, ### Heading 3
• • Bullet points (unordered list)
• 1. Numbered lists (ordered list)
• > Blockquote
• \`inline code\` or \`\`\` code blocks \`\`\`
• [Link text](url)
• --- Horizontal rule`}
                    className={styles["notes-editor"]}
                    onKeyDown={handleKeyDown}
                    spellCheck="true"
                  />

                  {/* Keyboard Shortcuts Hint */}
                  <div className={styles["notes-shortcuts-hint"]}>
                    <span className={styles["shortcut-item"]}>
                      <kbd>Ctrl</kbd> + <kbd>B</kbd> Bold
                    </span>
                    <span className={styles["shortcut-item"]}>
                      <kbd>Ctrl</kbd> + <kbd>I</kbd> Italic
                    </span>
                    <span className={styles["shortcut-item"]}>
                      <kbd>Ctrl</kbd> + <kbd>U</kbd> Underline
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Footer */}
            <div className={styles["notes-stats-footer"]}>
              <div className={styles["notes-stats"]}>
                <span className={styles["notes-stats-item"]}>
                  <span className={styles["stats-icon"]}>📝</span>
                  <span className={styles["stats-value"]}>
                    {formData.wordCount || 0}
                  </span>
                  <span className={styles["stats-label"]}>words</span>
                </span>
                <span className={styles["notes-stats-divider"]}>•</span>
                <span className={styles["notes-stats-item"]}>
                  <span className={styles["stats-icon"]}>🔤</span>
                  <span className={styles["stats-value"]}>
                    {formData.charCount || 0}
                  </span>
                  <span className={styles["stats-label"]}>characters</span>
                </span>
                <span className={styles["notes-stats-divider"]}>•</span>
                <span className={styles["notes-stats-item"]}>
                  <span className={styles["stats-icon"]}>📄</span>
                  <span className={styles["stats-value"]}>
                    {formData.content
                      ? Math.ceil(formData.content.split("\n").length / 10)
                      : 0}
                  </span>
                  <span className={styles["stats-label"]}>pages</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

NotesEditor.displayName = "NotesEditor";

export default NotesEditor;
