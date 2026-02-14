// src/components/Screens/Notes/NotesEditor.jsx

import React, { forwardRef } from 'react';
import SapInput from '../../Common/SapInput';
import NotesToolbar from './NotesToolbar';
import { parseMarkdown } from './NotesUtils';
import './NotesStyles.css';

const NotesEditor = forwardRef(({
  formData,
  errors,
  isReadOnly,
  showPreview,
  onShowPreviewChange,
  onTitleChange,
  onContentChange,
  onFormat
}, ref) => {

  const handleKeyDown = (e) => {
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          onFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          onFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          onFormat('underline');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="notes-editor-container">
      {/* Formatting Toolbar */}
      {!isReadOnly && (
        <NotesToolbar
          onFormat={onFormat}
          showPreview={showPreview}
          onTogglePreview={() => onShowPreviewChange(!showPreview)}
        />
      )}

      {/* Title */}
      <SapInput
        label="Title"
        value={formData.title}
        onChange={onTitleChange}
        required={true}
        disabled={isReadOnly}
        error={errors.title}
        placeholder="Enter note title..."
      />

      {/* Content Area */}
      <div className="sap-form-group" style={{ alignItems: 'flex-start' }}>
        <label className="sap-form-label">Content</label>
        <div className="sap-form-field notes-editor-wrapper">
          {showPreview || isReadOnly ? (
            <div
              className="notes-preview"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.content) }}
            />
          ) : (
            <textarea
              ref={ref}
              value={formData.content}
              onChange={(e) => onContentChange(e.target.value)}
              disabled={isReadOnly}
              placeholder={`Start writing your note...

Use the toolbar above for formatting:
• **bold** or *italic*
• # Heading 1, ## Heading 2
• • Bullet points
• 1. Numbered lists
• > Quotes
• \`\`\` Code blocks \`\`\`
• --- Horizontal rule`}
              className="notes-editor"
              onKeyDown={handleKeyDown}
            />
          )}
          
          {/* Stats */}
          <div className="notes-stats">
            <span className="notes-stats-item">
              📝 <span>{formData.wordCount || 0}</span> words
            </span>
            <span className="notes-stats-item">
              🔤 <span>{formData.charCount || 0}</span> characters
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

NotesEditor.displayName = 'NotesEditor';

export default NotesEditor;