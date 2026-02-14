// src/components/Screens/Notes/NotesUtils.js

import { NOTE_CATEGORIES, PRIORITY_OPTIONS, STATUS_OPTIONS } from './NotesConstants';
import { getTableData } from '../../../utils/storage';

// Generate next note ID
export const generateNextId = () => {
  const data = getTableData('notes') || [];
  let maxNum = 0;
  data.forEach(note => {
    const num = parseInt(note.noteNumber?.replace('NT', ''), 10);
    if (num > maxNum) maxNum = num;
  });
  return `NT${String(maxNum + 1).padStart(9, '0')}`;
};

// Get category info
export const getCategoryInfo = (categoryValue) => {
  return NOTE_CATEGORIES.find(c => c.value === categoryValue) || 
    { label: categoryValue, color: '#9e9e9e', icon: '📁' };
};

// Get status info
export const getStatusInfo = (statusValue) => {
  return STATUS_OPTIONS.find(s => s.value === statusValue) || 
    { label: statusValue, color: '#9e9e9e' };
};

// Get priority info
export const getPriorityInfo = (priorityValue) => {
  return PRIORITY_OPTIONS.find(p => p.value === priorityValue) || 
    { label: priorityValue, color: '#9e9e9e' };
};

// Parse markdown to HTML
export const parseMarkdown = (text) => {
  if (!text) return '';
  
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Underline and Strikethrough
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Highlight
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    .replace(/^___$/gm, '<hr>')
    .replace(/^\*\*\*$/gm, '<hr>')
    // Bullet lists
    .replace(/^• (.+)$/gm, '<li class="bullet">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="number">$1</li>')
    // Checklist
    .replace(/^☑ (.+)$/gm, '<li class="checked">✅ $1</li>')
    .replace(/^☐ (.+)$/gm, '<li class="unchecked">⬜ $1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 4px;">')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  return html;
};

// Calculate word and character count
export const calculateCounts = (content) => {
  return {
    wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
    charCount: content.length
  };
};

// Get mode title
export const getModeTitle = (mode) => {
  switch (mode) {
    case 'create': return 'Create Note';
    case 'change': return 'Edit Note';
    case 'display': return 'View Note';
    default: return 'Notes';
  }
};

// Get mode icon
export const getModeIcon = (mode) => {
  switch (mode) {
    case 'create': return '➕';
    case 'change': return '✏️';
    case 'display': return '👁️';
    default: return '📝';
  }
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'archived': return 'warning';
    case 'pinned': return 'error';
    default: return '';
  }
};