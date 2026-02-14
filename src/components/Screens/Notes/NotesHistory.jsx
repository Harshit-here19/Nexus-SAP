// src/components/Screens/Notes/NotesHistory.jsx

import React from 'react';
import { getCategoryInfo, getStatusInfo, getPriorityInfo, getStatusBadgeClass } from './NotesUtils';
import './NotesStyles.css';

const NotesHistory = ({ formData }) => {
  return (
    <div className="notes-history">
      <div className="sap-message-strip info" style={{ marginBottom: '16px' }}>
        <span className="sap-message-strip-icon">ℹ️</span>
        <span>Note information and metadata.</span>
      </div>

      <div className="notes-history-grid">
        <div className="notes-history-card">
          <div className="notes-history-label">Note ID</div>
          <div className="notes-history-value mono">
            {formData.noteNumber || '-'}
          </div>
        </div>

        <div className="notes-history-card">
          <div className="notes-history-label">Category</div>
          <div className="notes-history-value">
            <span>{getCategoryInfo(formData.category).icon}</span>
            {' '}
            {getCategoryInfo(formData.category).label.replace(/^[^\s]+\s/, '')}
          </div>
        </div>
        
        <div className="notes-history-card">
          <div className="notes-history-label">Status</div>
          <div>
            <span className={`sap-badge ${getStatusBadgeClass(formData.status)}`}>
              {getStatusInfo(formData.status).label}
            </span>
          </div>
        </div>
        
        <div className="notes-history-card">
          <div className="notes-history-label">Priority</div>
          <div style={{ 
            display: 'inline-block',
            padding: '2px 8px',
            background: getPriorityInfo(formData.priority).color,
            color: 'white',
            borderRadius: '10px',
            fontSize: '11px'
          }}>
            {formData.priority?.toUpperCase()}
          </div>
        </div>
        
        <div className="notes-history-card">
          <div className="notes-history-label">Word Count</div>
          <div className="notes-history-value">{formData.wordCount || 0}</div>
        </div>
        
        <div className="notes-history-card">
          <div className="notes-history-label">Character Count</div>
          <div className="notes-history-value">{formData.charCount || 0}</div>
        </div>
        
        <div className="notes-history-card">
          <div className="notes-history-label">Created By</div>
          <div className="notes-history-value">{formData.createdBy || '-'}</div>
        </div>
        
        <div className="notes-history-card">
          <div className="notes-history-label">Created On</div>
          <div className="notes-history-value">
            {formData.createdAt ? new Date(formData.createdAt).toLocaleString() : '-'}
          </div>
        </div>
        
        <div className="notes-history-card">
          <div className="notes-history-label">Last Updated</div>
          <div className="notes-history-value">
            {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : '-'}
          </div>
        </div>
        
        {formData.dueDate && (
          <div className="notes-history-card">
            <div className="notes-history-label">Due Date</div>
            <div className="notes-history-value">
              {new Date(formData.dueDate).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="notes-history-flags">
        {formData.isPinned && (
          <span className="sap-badge error">📌 Pinned</span>
        )}
        {formData.isFavorite && (
          <span className="sap-badge warning">⭐ Favorite</span>
        )}
        {formData.isLocked && (
          <span className="sap-badge">🔒 Locked</span>
        )}
      </div>
    </div>
  );
};

export default NotesHistory;