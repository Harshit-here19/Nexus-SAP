// src/components/Screens/Notes/NotesSearchModal.jsx

import React from 'react';
import SapModal from '../../Common/SapModal';
import SapButton from '../../Common/SapButton';
import { NOTE_CATEGORIES, STATUS_OPTIONS } from './NotesConstants';
import { getCategoryInfo, getStatusInfo, getStatusBadgeClass } from './NotesUtils';
import { useTransaction } from '../../../context/TransactionContext';
import './NotesStyles.css';

const NotesSearchModal = ({
  isOpen,
  onClose,
  searchTerm,
  onSearchTermChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  searchResults,
  onSearch,
  onSelectNote,
  deleteInSearchModal
}) => {

  const { currentTransaction } = useTransaction();

  return (
    <SapModal
      isOpen={isOpen}
      onClose={onClose}
      title="🔍 Search Notes"
      width="900px"
      footer={
        <SapButton onClick={onClose}>Close</SapButton>
      }
    >
      {/* Filters */}
      <div className="notes-search-filters">
        <input
          type="text"
          className="sap-input"
          placeholder="🔍 Search by ID, title, content, tags..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          className="sap-select"
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          style={{ width: '140px' }}
        >
          <option value="all">All Categories</option>
          {NOTE_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label.replace(/^[^\s]+\s/, '')}
            </option>
          ))}
        </select>
        <select
          className="sap-select"
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          style={{ width: '120px' }}
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <SapButton onClick={onSearch} type="primary">
          Search
        </SapButton>
      </div>

      {/* Results Table */}
      <div className="notes-search-results">
        <table className="sap-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}></th>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Words</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.length === 0 ? (
              <tr>
                <td colSpan={8} className="notes-search-empty">
                  <div>
                    <div className="notes-search-empty-icon">📭</div>
                    <div>No notes found</div>
                    <div className="notes-search-empty-hint">
                      Try adjusting your filters or create a new note
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              searchResults.map((note, index) => (
                <tr key={index}>
                  <td>
                    {note.isPinned && '📌'}
                    {note.isFavorite && '⭐'}
                    {note.isLocked && '🔒'}
                  </td>
                  <td className="notes-search-id">
                    {note.noteNumber}
                  </td>
                  <td>
                    <div 
                      className="notes-search-title"
                      style={{
                        borderLeft: note.color ? `3px solid ${note.color}` : 'none',
                        paddingLeft: note.color ? '8px' : '0'
                      }}
                    >
                      {note.title}
                    </div>
                    {note.summary && (
                      <div className="notes-search-summary">
                        {note.summary.substring(0, 50)}...
                      </div>
                    )}
                  </td>
                  <td>
                    <span 
                      className="notes-category-badge"
                      style={{
                        background: `${getCategoryInfo(note.category).color}20`,
                        color: getCategoryInfo(note.category).color
                      }}
                    >
                      {getCategoryInfo(note.category).icon}
                    </span>
                  </td>
                  <td>
                    <span className={`sap-badge ${getStatusBadgeClass(note.status)}`} style={{ fontSize: '10px' }}>
                      {getStatusInfo(note.status).label}
                    </span>
                  </td>
                  <td className="notes-search-meta">
                    {note.wordCount || 0}
                  </td>
                  <td className="notes-search-date">
                    {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : '-'}
                  </td>
                  
                  <td>
                      <span style={{ marginRight: "8px" }}>
                      <SapButton
                        onClick={() => onSelectNote(note)}
                        type="primary"
                      >
                        👁️
                      </SapButton>
                      </span>
                      {currentTransaction === "NT02" && (<span style={{ marginLeft: "8px" }}>
                        <SapButton
                        onClick={() => deleteInSearchModal(note.id)}
                        type="danger"
                      >
                        🗑️
                      </SapButton>
                      </span>)}
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {searchResults.length > 0 && (
        <div className="notes-search-summary-bar">
          <span className="notes-search-count">
            {searchResults.length} note(s) found
          </span>
          <div className="notes-search-stats">
            <span>📌 Pinned: <strong>{searchResults.filter(n => n.isPinned).length}</strong></span>
            <span>✅ Active: <strong>{searchResults.filter(n => n.status === 'active').length}</strong></span>
            <span>📦 Archived: <strong>{searchResults.filter(n => n.status === 'archived').length}</strong></span>
          </div>
        </div>
      )}
    </SapModal>
  );
};

export default NotesSearchModal;