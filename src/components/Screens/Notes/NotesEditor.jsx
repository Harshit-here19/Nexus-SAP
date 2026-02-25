// src/components/Screens/Notes/NotesEditor.jsx

import { forwardRef, useState, useEffect, useRef } from "react";
import { SimpleInput } from "../../Common/SapInput";
import NotesToolbar from "./NotesToolbar";
import { parseMarkdown } from "./NotesUtils";
import styles from "./NotesEditor.module.css";
import NotesVerticalToolbar from "./NotesVerticalToolbar";

const isMobile = window.innerWidth <= 768;

const NotesEditor = forwardRef(
  (
    {
      formData,
      errors,
      isReadOnly,
      showPreview,
      onShowPreviewChange,
      onTitleChange,
      onSummaryChange, // New prop
      onContentChange,
      onFormat,
      loadDemoNote,
      mode,
    },
    ref,
  ) => {
    // State to track if user has proceeded to content step
    const [hasProceeded, setHasProceeded] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
    
    const summaryRef = useRef(null);
    const titleInputRef = useRef(null);

    // Check if title and summary are valid
    const isTitleValid = formData.title && formData.title.trim().length >= 3;
    const isSummaryValid = formData.summary && formData.summary.trim().length >= 10;
    const canProceed = isTitleValid && isSummaryValid && !errors.title && !errors.summary;

    // Auto-focus title input on mount in create mode
    useEffect(() => {
      if (mode === 'create' && titleInputRef.current && !hasProceeded) {
        titleInputRef.current.focus();
      }
    }, [mode, hasProceeded]);

    // If in edit/view mode with existing content, show content directly
    useEffect(() => {
      if (mode !== 'create' && formData.content) {
        setHasProceeded(true);
      }
    }, [mode, formData.content]);

    // Handle proceed to content
    const handleProceed = () => {
      if (canProceed) {
        setIsTransitioning(true);
        setTimeout(() => {
          setHasProceeded(true);
          setIsTransitioning(false);
          // Focus the textarea after transition
          setTimeout(() => {
            if (ref?.current) {
              ref.current.focus();
            }
          }, 100);
        }, 300);
      }
    };

    // Handle going back to edit title/summary
    const handleGoBack = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setHasProceeded(false);
        setIsTransitioning(false);
      }, 300);
    };

    // Handle Enter key to proceed
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && canProceed && !hasProceeded) {
        e.preventDefault();
        handleProceed();
      }
    };

    // Handle keyboard shortcuts in content area
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

    // Render the initial step (Title + Summary)
    const renderInitialStep = () => (
      <div className={`${styles['notes-initial-step']} ${isTransitioning ? styles['fade-out'] : styles['fade-in']}`}>
        {/* Hero Section */}
        <div className={styles['notes-hero-section']}>
          <div className={styles['notes-hero-icon']}>
            {mode === 'create' ? '✨' : '📝'}
          </div>
          <h2 className={styles['notes-hero-title']}>
            {mode === 'create' ? 'Create a New Note' : 'Edit Note Details'}
          </h2>
          <p className={styles['notes-hero-subtitle']}>
            Start by giving your note a title and brief summary
          </p>
        </div>

        {/* Form Card */}
        <div className={styles['notes-form-card']}>
          {/* Title Field */}
          <div className={styles['notes-field-group']}>
            <label className={styles['notes-field-label']}>
              <span className={styles['field-icon']}>📌</span>
              Note Title
              <span className={styles['field-required']}>*</span>
            </label>
            <div className={styles['notes-field-wrapper']}>
              <input
                ref={titleInputRef}
                type="text"
                value={formData.title || ''}
                onChange={(e) => onTitleChange(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isReadOnly}
                placeholder="Enter a descriptive title..."
                className={`${styles['notes-field-input']} ${errors.title ? styles['has-error'] : ''} ${isTitleValid ? styles['is-valid'] : ''}`}
                maxLength={100}
              />
              {isTitleValid && (
                <span className={styles['field-valid-icon']}>✓</span>
              )}
            </div>
            <div className={styles['notes-field-footer']}>
              {errors.title ? (
                <span className={styles['notes-field-error']}>{errors.title}</span>
              ) : (
                <span className={styles['notes-field-hint']}>
                  {formData.title?.length || 0}/100 characters (min 3)
                </span>
              )}
            </div>
          </div>

          {/* Summary Field */}
          <div className={styles['notes-field-group']}>
            <label className={styles['notes-field-label']}>
              <span className={styles['field-icon']}>📋</span>
              Summary
              <span className={styles['field-required']}>*</span>
            </label>
            <div className={styles['notes-field-wrapper']}>
              <textarea
                ref={summaryRef}
                value={formData.summary || ''}
                onChange={(e) => onSummaryChange(e.target.value)}
                onKeyPress={(e) => {
                  // Allow Enter for new lines, but Ctrl+Enter to proceed
                  if (e.key === 'Enter' && e.ctrlKey && canProceed) {
                    e.preventDefault();
                    handleProceed();
                  }
                }}
                disabled={isReadOnly}
                placeholder="Write a brief summary of what this note is about..."
                className={`${styles['notes-field-textarea']} ${errors.summary ? styles['has-error'] : ''} ${isSummaryValid ? styles['is-valid'] : ''}`}
                rows={3}
                maxLength={300}
              />
              {isSummaryValid && (
                <span className={styles['field-valid-icon']}>✓</span>
              )}
            </div>
            <div className={styles['notes-field-footer']}>
              {errors.summary ? (
                <span className={styles['notes-field-error']}>{errors.summary}</span>
              ) : (
                <span className={styles['notes-field-hint']}>
                  {formData.summary?.length || 0}/300 characters (min 10)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles['notes-form-actions']}>
            <button
              type="button"
              onClick={handleProceed}
              disabled={!canProceed || isReadOnly}
              className={`${styles['notes-proceed-button']} ${canProceed ? styles['active'] : ''}`}
            >
              <span className={styles['button-text']}>
                Continue to Write
              </span>
              <span className={styles['button-icon']}>→</span>
            </button>
            
            {!canProceed && (
              <p className={styles['notes-proceed-hint']}>
                {!isTitleValid && !isSummaryValid 
                  ? 'Please enter both title and summary to continue'
                  : !isTitleValid 
                    ? 'Title must be at least 3 characters'
                    : 'Summary must be at least 10 characters'
                }
              </p>
            )}

            {canProceed && (
              <p className={styles['notes-proceed-hint']}>
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to continue
              </p>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className={styles['notes-tips-section']}>
          <h4 className={styles['tips-title']}>💡 Writing Tips</h4>
          <ul className={styles['tips-list']}>
            <li>Use a clear, descriptive title that reflects the content</li>
            <li>Keep the summary concise - it helps you find notes later</li>
            <li>You can use Markdown formatting in the content area</li>
          </ul>
        </div>
      </div>
    );

    // Render the content step (Editor)
    const renderContentStep = () => (
      <div className={`${styles['notes-content-step']} ${isTransitioning ? styles['fade-out'] : styles['fade-in']}`}>
        
        {/* Header with Title & Summary Preview */}
        <div className={styles['notes-content-header-bar']}>
          {!(mode === "display") && <button
            type="button"
            onClick={handleGoBack}
            className={styles['notes-back-button']}
            disabled={isReadOnly}
            title="Edit title & summary"
          >
            <span className={styles['back-icon']}>←</span>
            <span className={styles['back-text']}>Edit Details</span>
          </button>}

          <div className={styles['notes-header-info']}>
            <h3 className={styles['notes-header-title']}>
              {formData.title}
            </h3>
            <p className={styles['notes-header-summary']}>
              {formData.summary}
            </p>
          </div>

          {mode === "create" && !formData.content && (
            <button
              onClick={loadDemoNote}
              className={styles["load-demo-button"]}
            >
              📋 Load demo
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className={styles["notes-content-section"]}>
          <div className={styles["notes-content-header"]}>
            <label className={styles["notes-content-label"]}>
              <span className={styles['content-icon']}>📝</span>
              Content
              {!isReadOnly && (
                <span className={styles["notes-content-hint"]}>
                  Markdown supported
                </span>
              )}
            </label>
          </div>

          <div className={styles['notes-editor-layout']} style={{ flexDirection: isMobile ? "column-reverse" : "row" }}>
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

            {/* Vertical Toolbar */}
            {!isReadOnly && (
              <NotesVerticalToolbar
                onFormat={onFormat}
                showPreview={showPreview}
                onTogglePreview={() => onShowPreviewChange(!showPreview)}
                collapsed={toolbarCollapsed}
                onToggleCollapse={() => setToolbarCollapsed(!toolbarCollapsed)}
                position="right"
                theme="glass"
              />
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className={styles["notes-editor-container"]}>
        {/* Progress Indicator */}
        <div className={styles['notes-progress']}>
          <div className={styles['progress-steps']}>
            <div className={`${styles['progress-step']} ${styles['completed']}`}>
              <span className={styles['step-number']}>1</span>
              <span className={styles['step-label']}>Details</span>
            </div>
            <div className={`${styles['progress-line']} ${hasProceeded ? styles['active'] : ''}`} />
            <div className={`${styles['progress-step']} ${hasProceeded ? styles['active'] : ''}`}>
              <span className={styles['step-number']}>2</span>
              <span className={styles['step-label']}>Content</span>
            </div>
          </div>
        </div>

        {/* Conditional Rendering based on step */}
        {hasProceeded ? renderContentStep() : renderInitialStep()}
      </div>
    );
  },
);

NotesEditor.displayName = "NotesEditor";

export default NotesEditor;