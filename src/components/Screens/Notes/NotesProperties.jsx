// src/components/Screens/Notes/NotesProperties.jsx

import React from 'react';
import SapInput from '../../Common/SapInput';
import SapSelect from '../../Common/SapSelect';
import { NOTE_CATEGORIES, PRIORITY_OPTIONS, STATUS_OPTIONS, COLOR_OPTIONS } from './NotesConstants';
import './NotesStyles.css';

const NotesProperties = ({
  formData,
  isReadOnly,
  onChange
}) => {
  return (
    <div className="sap-form">
      <div className="notes-properties-grid">
        {/* Left Column */}
        <div className="notes-properties-column">
          <h4 className="notes-section-title">
            <span>📋</span> Note Properties
          </h4>
          
          <SapInput
            label="Note ID"
            value={formData.noteNumber}
            readOnly={true}
            placeholder="Auto-generated"
          />
          
          <SapSelect
            label="Category"
            value={formData.category}
            onChange={(val) => onChange('category', val)}
            options={NOTE_CATEGORIES.map(c => ({ 
              value: c.value, 
              label: `${c.icon} ${c.label.replace(/^[^\s]+\s/, '')}` 
            }))}
            disabled={isReadOnly}
          />
          
          <SapSelect
            label="Status"
            value={formData.status}
            onChange={(val) => onChange('status', val)}
            options={STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
            disabled={isReadOnly}
          />
          
          <SapSelect
            label="Priority"
            value={formData.priority}
            onChange={(val) => onChange('priority', val)}
            options={PRIORITY_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
            disabled={isReadOnly}
          />
          
          <SapInput
            label="Summary"
            value={formData.summary}
            onChange={(val) => onChange('summary', val)}
            disabled={isReadOnly}
            placeholder="Brief summary of the note..."
          />
        </div>

        {/* Right Column */}
        <div className="notes-properties-column">
          <h4 className="notes-section-title">
            <span>⚙️</span> Settings & Options
          </h4>
          
          {/* Quick Toggles */}
          <div className="notes-toggle-group">
            <label className={`notes-toggle-item ${formData.isPinned ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => onChange('isPinned', e.target.checked)}
                disabled={isReadOnly}
                className="notes-toggle-checkbox"
              />
              <span className="notes-toggle-label">
                <span className="icon">📌</span> Pin this note
              </span>
            </label>
            
            <label className={`notes-toggle-item ${formData.isFavorite ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => onChange('isFavorite', e.target.checked)}
                disabled={isReadOnly}
                className="notes-toggle-checkbox"
              />
              <span className="notes-toggle-label">
                <span className="icon">⭐</span> Add to favorites
              </span>
            </label>
            
            <label className={`notes-toggle-item ${formData.isLocked ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) => onChange('isLocked', e.target.checked)}
                disabled={isReadOnly}
                className="notes-toggle-checkbox"
              />
              <span className="notes-toggle-label">
                <span className="icon">🔒</span> Lock note
              </span>
            </label>
          </div>
          
          <SapInput
            label="Due Date"
            value={formData.dueDate}
            onChange={(val) => onChange('dueDate', val)}
            type="date"
            disabled={isReadOnly}
          />
          
          <SapInput
            label="Reminder"
            value={formData.reminder}
            onChange={(val) => onChange('reminder', val)}
            type="datetime-local"
            disabled={isReadOnly}
          />
          
          <SapInput
            label="Tags"
            value={formData.tags}
            onChange={(val) => onChange('tags', val)}
            disabled={isReadOnly}
            placeholder="Comma-separated tags..."
          />
          
          {/* Tags Display */}
          {formData.tags && (
            <div className="notes-tags-container">
              {formData.tags.split(',').map((tag, i) => (
                <span key={i} className="notes-tag">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Color Selection */}
      <div className="notes-color-section">
        <h4 className="notes-section-title">
          <span>🎨</span> Note Color
        </h4>
        <div className="notes-color-picker">
          {COLOR_OPTIONS.map(color => (
            <button
              key={color || 'none'}
              onClick={() => onChange('color', color)}
              disabled={isReadOnly}
              className={`notes-color-swatch ${formData.color === color ? 'selected' : ''} ${!color ? 'none' : ''}`}
              style={{ background: color || undefined }}
              title={color || 'No color'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesProperties;