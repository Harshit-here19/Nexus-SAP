// src/components/Screens/EntertainmentWishlistScreen.jsx
import { useState, useEffect } from 'react';
import SapButton from '../Common/SapButton';
import SapInput from '../Common/SapInput';
import SapSelect from '../Common/SapSelect';
import SapTabs from '../Common/SapTabs';
import SapModal from '../Common/SapModal';
import { useTransaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import {
  getTableData,
  addRecord,
  updateRecord,
  findRecord,
  getAllData,
  saveAllData
} from '../../utils/storage';

// Entertainment Categories with prefixes
const ENTERTAINMENT_CATEGORIES = [
  { value: 'MO', label: '🎬 Movies', color: '#e91e63', icon: '🎬' },
  { value: 'SE', label: '📺 Series', color: '#9c27b0', icon: '📺' },
  { value: 'AN', label: '🎌 Anime', color: '#2196f3', icon: '🎌' },
  { value: 'WE', label: '📖 Webtoon/Manhwa', color: '#4caf50', icon: '📖' },
  { value: 'HE', label: '🔞 Hentai', color: '#f44336', icon: '🔞' },
  { value: 'GA', label: '🎮 Games', color: '#ff9800', icon: '🎮' },
  { value: 'PO', label: '🎥 Adult Films', color: '#795548', icon: '🎥' }
];

// Watch/Read/Play Status
const STATUS_OPTIONS = [
  { value: 'planned', label: '📋 Planned', color: '#9e9e9e' },
  { value: 'in_progress', label: '▶️ In Progress', color: '#2196f3' },
  { value: 'completed', label: '✅ Completed', color: '#4caf50' },
  { value: 'on_hold', label: '⏸️ On Hold', color: '#ff9800' },
  { value: 'dropped', label: '❌ Dropped', color: '#f44336' },
  { value: 'rewatching', label: '🔄 Re-watching', color: '#9c27b0' }
];

// Priority Levels
const PRIORITY_OPTIONS = [
  { value: 'low', label: '🟢 Low', color: '#4caf50' },
  { value: 'medium', label: '🟡 Medium', color: '#ff9800' },
  { value: 'high', label: '🔴 High', color: '#f44336' },
  { value: 'must_watch', label: '⭐ Must Watch/Play', color: '#e91e63' }
];

// Genres
const GENRE_OPTIONS = [
  { value: 'action', label: 'Action' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'isekai', label: 'Isekai' },
  { value: 'visual_novel', label: 'Visual Novel' },
  { value: 'ntr', label: 'NTR (Netorare)' },
  { value: 'cuckold', label: 'Cuckold' },
  { value: 'other', label: 'Other' }
];

// Platform options
const PLATFORM_OPTIONS = [
  { value: 'netflix', label: '📺 Netflix' },
  { value: 'amazon_prime', label: '📦 Amazon Prime' },
  { value: 'disney_plus', label: '🏰 Disney+' },
  { value: 'hbo_max', label: '🎬 HBO Max' },
  { value: 'hulu', label: '📗 Hulu' },
  { value: 'crunchyroll', label: '🍥 Crunchyroll' },
  { value: 'funimation', label: '🎌 Funimation' },
  { value: 'youtube', label: '▶️ YouTube' },
  { value: 'webtoon', label: '📖 Webtoon' },
  { value: 'tapas', label: '📚 Tapas' },
  { value: 'mangadex', label: '📕 MangaDex' },
  { value: 'steam', label: '🎮 Steam' },
  { value: 'epic_games', label: '🎯 Epic Games' },
  { value: 'playstation', label: '🎮 PlayStation' },
  { value: 'xbox', label: '🎮 Xbox' },
  { value: 'nintendo', label: '🎮 Nintendo' },
  { value: 'torrent', label: '🏴‍☠️ Torrent' },
  { value: 'physical', label: '💿 Physical' },
  { value: 'other', label: '📁 Other' }
];

const EntertainmentWishlistScreen = ({ mode = 'create' }) => {
  const { updateStatus, markAsChanged, markAsSaved } = useTransaction();
  const { user } = useAuth();
  
  const [itemId, setItemId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Form data
  const [formData, setFormData] = useState({
    itemNumber: '',
    category: '',
    title: '',
    originalTitle: '',
    description: '',
    year: '',
    status: 'planned',
    priority: 'medium',
    rating: '',
    genres: [],
    platform: '',
    url: '',
    imageUrl: '',
    episodes: '',
    currentEpisode: '',
    chapters: '',
    currentChapter: '',
    seasons: '',
    currentSeason: '',
    duration: '',
    studio: '',
    developer: '',
    director: '',
    cast: '',
    startDate: '',
    endDate: '',
    notes: '',
    tags: '',
    isNsfw: false,
    createdBy: user?.username || 'SAPUSER'
  });

  const [errors, setErrors] = useState({});

  // Generate next ID based on category
  const generateNextId = (category) => {
    const data = getTableData('entertainment_wishlist') || [];
    const categoryItems = data.filter(item => item.itemNumber?.startsWith(category));
    
    let maxNum = 0;
    categoryItems.forEach(item => {
      const num = parseInt(item.itemNumber.replace(category, ''), 10);
      if (num > maxNum) maxNum = num;
    });
    
    return `${category}${String(maxNum + 1).padStart(9, '0')}`;
  };

  // Handle form field change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markAsChanged();
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle category change (updates ID prefix)
  const handleCategoryChange = (category) => {
    handleChange('category', category);
    if (mode === 'create') {
      const newId = generateNextId(category);
      setFormData(prev => ({ ...prev, category, itemNumber: newId }));
    }
  };

  // Handle genre multi-select
  const handleGenreToggle = (genre) => {
    const currentGenres = formData.genres || [];
    if (currentGenres.includes(genre)) {
      handleChange('genres', currentGenres.filter(g => g !== genre));
    } else {
      handleChange('genres', [...currentGenres, genre]);
    }
  };

  // Load item for edit/view
  const loadItem = () => {
    if (!itemId.trim()) {
      updateStatus('Enter an item ID', 'warning');
      return;
    }

    const data = getTableData('entertainment_wishlist') || [];
    const item = data.find(i => i.itemNumber === itemId.trim());
    
    if (item) {
      setFormData(item);
      setIsLoaded(true);
      updateStatus(`Item ${itemId} loaded successfully`, 'success');
    } else {
      updateStatus(`Item ${itemId} not found`, 'error');
    }
  };

  // Search items
  const handleSearch = () => {
    let items = getTableData('entertainment_wishlist') || [];
    
    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(i =>
        i.itemNumber?.toLowerCase().includes(term) ||
        i.title?.toLowerCase().includes(term) ||
        i.originalTitle?.toLowerCase().includes(term) ||
        i.description?.toLowerCase().includes(term) ||
        i.tags?.toLowerCase().includes(term)
      );
    }
    
    if (filterCategory !== 'all') {
      items = items.filter(i => i.category === filterCategory);
    }
    
    if (filterStatus !== 'all') {
      items = items.filter(i => i.status === filterStatus);
    }
    
    if (filterPriority !== 'all') {
      items = items.filter(i => i.priority === filterPriority);
    }
    
    // Sort by priority and then by date
    const priorityOrder = { 'must_watch': 0, 'high': 1, 'medium': 2, 'low': 3 };
    items = items.sort((a, b) => {
      const pA = priorityOrder[a.priority] ?? 2;
      const pB = priorityOrder[b.priority] ?? 2;
      if (pA !== pB) return pA - pB;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    setSearchResults(items);
    setShowSearchModal(true);
  };

  // Select item from search
  const handleSelectItem = (item) => {
    setItemId(item.itemNumber);
    setFormData(item);
    setIsLoaded(true);
    setShowSearchModal(false);
    updateStatus(`Item ${item.itemNumber} selected`, 'success');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save item
  const handleSave = () => {
    if (!validateForm()) {
      updateStatus('Please fill in all required fields', 'error');
      return;
    }

    try {
      const allData = getAllData();
      if (!allData.entertainment_wishlist) {
        allData.entertainment_wishlist = [];
      }

      if (mode === 'create') {
        const itemNumber = formData.itemNumber || generateNextId(formData.category);
        const newItem = {
          ...formData,
          id: Date.now(),
          itemNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        allData.entertainment_wishlist.push(newItem);
        saveAllData(allData);
        setFormData(prev => ({ ...prev, itemNumber, id: newItem.id }));
        markAsSaved();
        updateStatus(`Item ${itemNumber} created successfully`, 'success');
      } else if (mode === 'change') {
        const index = allData.entertainment_wishlist.findIndex(i => i.id === formData.id);
        if (index !== -1) {
          allData.entertainment_wishlist[index] = {
            ...formData,
            updatedAt: new Date().toISOString()
          };
          saveAllData(allData);
          markAsSaved();
          updateStatus(`Item ${formData.itemNumber} updated successfully`, 'success');
        }
      }
    } catch (error) {
      updateStatus(`Error saving item: ${error.message}`, 'error');
    }
  };

  // Clear form
  const handleClear = () => {
    setFormData({
      itemNumber: '',
      category: '',
      title: '',
      originalTitle: '',
      description: '',
      year: '',
      status: 'planned',
      priority: 'medium',
      rating: '',
      genres: [],
      platform: '',
      url: '',
      imageUrl: '',
      episodes: '',
      currentEpisode: '',
      chapters: '',
      currentChapter: '',
      seasons: '',
      currentSeason: '',
      duration: '',
      studio: '',
      developer: '',
      director: '',
      cast: '',
      startDate: '',
      endDate: '',
      notes: '',
      tags: '',
      isNsfw: false,
      createdBy: user?.username || 'SAPUSER'
    });
    setItemId('');
    setIsLoaded(false);
    setErrors({});
    markAsSaved();
    updateStatus('Form cleared', 'info');
  };

  // Delete item
  const handleDelete = () => {
    if (!formData.id) return;
    
    if (window.confirm('Are you sure you want to delete this item from your wishlist?')) {
      const allData = getAllData();
      allData.entertainment_wishlist = (allData.entertainment_wishlist || []).filter(
        i => i.id !== formData.id
      );
      saveAllData(allData);
      handleClear();
      updateStatus('Item deleted successfully', 'success');
    }
  };

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return ENTERTAINMENT_CATEGORIES.find(c => c.value === categoryValue) || 
      { label: categoryValue, color: '#9e9e9e', icon: '📁' };
  };

  // Get status info
  const getStatusInfo = (statusValue) => {
    return STATUS_OPTIONS.find(s => s.value === statusValue) || 
      { label: statusValue, color: '#9e9e9e' };
  };

  // Get priority info
  const getPriorityInfo = (priorityValue) => {
    return PRIORITY_OPTIONS.find(p => p.value === priorityValue) || 
      { label: priorityValue, color: '#9e9e9e' };
  };

  // Calculate progress
  const getProgress = () => {
    if (formData.episodes && formData.currentEpisode) {
      return Math.round((parseInt(formData.currentEpisode) / parseInt(formData.episodes)) * 100);
    }
    if (formData.chapters && formData.currentChapter) {
      return Math.round((parseInt(formData.currentChapter) / parseInt(formData.chapters)) * 100);
    }
    return null;
  };

  // Render rating stars
  const renderRating = (rating, editable = false) => {
    const maxRating = 10;
    const currentRating = parseInt(rating) || 0;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[...Array(maxRating)].map((_, i) => (
          <span
            key={i}
            onClick={() => editable && handleChange('rating', i + 1)}
            style={{
              cursor: editable ? 'pointer' : 'default',
              fontSize: '18px',
              color: i < currentRating ? '#ffc107' : '#e0e0e0',
              transition: 'transform 0.1s'
            }}
            onMouseEnter={(e) => editable && (e.target.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => editable && (e.target.style.transform = 'scale(1)')}
          >
            ★
          </span>
        ))}
        {currentRating > 0 && (
          <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: '600' }}>
            {currentRating}/10
          </span>
        )}
      </div>
    );
  };

  const isReadOnly = mode === 'display';
  const needsLoad = (mode === 'change' || mode === 'display') && !isLoaded;

  // Get relevant fields based on category
  const showEpisodeFields = ['SE', 'AN', 'HE'].includes(formData.category);
  const showChapterFields = ['WE'].includes(formData.category);
  const showSeasonFields = ['SE'].includes(formData.category);
  const showDeveloperField = ['GA'].includes(formData.category);
  const showStudioField = ['AN', 'MO', 'SE', 'HE'].includes(formData.category);
  const showDirectorField = ['MO', 'PO'].includes(formData.category);

  // Details Tab
  const detailsTab = (
    <div className="sap-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column */}
        <div>
          <h4 style={{ 
            marginBottom: '14px', 
            color: formData.category ? getCategoryInfo(formData.category).color : 'var(--sap-brand)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '13px' 
          }}>
            <span>{formData.category ? getCategoryInfo(formData.category).icon : '🎬'}</span> 
            Basic Information
          </h4>
          
          <SapInput
            label="Item ID"
            value={formData.itemNumber}
            readOnly={true}
            placeholder="Select category first"
          />
          
          <SapSelect
            label="Category"
            value={formData.category}
            onChange={handleCategoryChange}
            options={ENTERTAINMENT_CATEGORIES.map(c => ({ 
              value: c.value, 
              label: `${c.icon} ${c.label.replace(/^[^\s]+\s/, '')}` 
            }))}
            required={true}
            disabled={isReadOnly || mode === 'change'}
            placeholder="Select category..."
            error={errors.category}
          />
          
          <SapInput
            label="Title"
            value={formData.title}
            onChange={(val) => handleChange('title', val)}
            required={true}
            disabled={isReadOnly}
            error={errors.title}
            placeholder="Enter title..."
          />
          
          <SapInput
            label="Original Title"
            value={formData.originalTitle}
            onChange={(val) => handleChange('originalTitle', val)}
            disabled={isReadOnly}
            placeholder="Original/Japanese/Korean title..."
          />
          
          <SapInput
            label="Year"
            value={formData.year}
            onChange={(val) => handleChange('year', val)}
            disabled={isReadOnly}
            placeholder="Release year"
            type="number"
            min="1900"
            max="2099"
          />

          <SapInput
            label="Image URL"
            value={formData.imageUrl}
            onChange={(val) => handleChange('imageUrl', val)}
            disabled={isReadOnly}
            placeholder="Poster/cover image URL"
          />
        </div>

        {/* Right Column */}
        <div>
          <h4 style={{ 
            marginBottom: '14px', 
            color: 'var(--sap-brand)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '13px' 
          }}>
            <span>📊</span> Status & Priority
          </h4>
          
          <SapSelect
            label="Status"
            value={formData.status}
            onChange={(val) => handleChange('status', val)}
            options={STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
            required={true}
            disabled={isReadOnly}
          />
          
          <SapSelect
            label="Priority"
            value={formData.priority}
            onChange={(val) => handleChange('priority', val)}
            options={PRIORITY_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
            disabled={isReadOnly}
          />

          <div className="sap-form-group">
            <label className="sap-form-label">Rating</label>
            <div className="sap-form-field">
              {renderRating(formData.rating, !isReadOnly)}
              {!isReadOnly && formData.rating && (
                <button
                  onClick={() => handleChange('rating', '')}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--sap-negative)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <SapSelect
            label="Platform"
            value={formData.platform}
            onChange={(val) => handleChange('platform', val)}
            options={PLATFORM_OPTIONS}
            disabled={isReadOnly}
            placeholder="Where to watch/play..."
          />

          <SapInput
            label="URL/Link"
            value={formData.url}
            onChange={(val) => handleChange('url', val)}
            disabled={isReadOnly}
            placeholder="Link to content..."
          />

          <div style={{ marginTop: '12px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '10px 12px',
              background: formData.isNsfw ? '#ffebee' : 'var(--sap-content-bg)',
              borderRadius: '6px',
              cursor: isReadOnly ? 'default' : 'pointer',
              width: 'fit-content',
              border: formData.isNsfw ? '1px solid #f44336' : '1px solid transparent'
            }}>
              <input
                type="checkbox"
                checked={formData.isNsfw}
                onChange={(e) => handleChange('isNsfw', e.target.checked)}
                disabled={isReadOnly}
                style={{ width: '18px', height: '18px', accentColor: '#f44336' }}
              />
              <span style={{ fontSize: '13px', color: formData.isNsfw ? '#f44336' : 'inherit' }}>
                🔞 NSFW Content
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      {formData.title && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: `linear-gradient(135deg, ${getCategoryInfo(formData.category).color}15 0%, ${getCategoryInfo(formData.category).color}05 100%)`,
          borderLeft: `4px solid ${getCategoryInfo(formData.category).color}`,
          borderRadius: '6px',
          display: 'flex',
          gap: '16px'
        }}>
          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt={formData.title}
              style={{
                width: '80px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ 
                fontSize: '11px', 
                padding: '2px 8px', 
                background: getCategoryInfo(formData.category).color,
                color: 'white',
                borderRadius: '4px'
              }}>
                {formData.itemNumber || getCategoryInfo(formData.category).value}
              </span>
              {formData.isNsfw && (
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 6px', 
                  background: '#f44336',
                  color: 'white',
                  borderRadius: '4px'
                }}>
                  NSFW
                </span>
              )}
            </div>
            <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
              {formData.title}
            </div>
            {formData.originalTitle && (
              <div style={{ fontSize: '12px', color: 'var(--sap-text-secondary)', marginBottom: '8px' }}>
                {formData.originalTitle}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`sap-badge ${
                formData.status === 'completed' ? 'success' :
                formData.status === 'in_progress' ? 'info' :
                formData.status === 'dropped' ? 'error' :
                formData.status === 'on_hold' ? 'warning' : ''
              }`}>
                {getStatusInfo(formData.status).label}
              </span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: getPriorityInfo(formData.priority).color,
                color: 'white',
                borderRadius: '10px'
              }}>
                {formData.priority?.replace('_', ' ').toUpperCase()}
              </span>
              {formData.year && (
                <span style={{ fontSize: '12px', color: 'var(--sap-text-secondary)' }}>
                  📅 {formData.year}
                </span>
              )}
              {formData.rating && (
                <span style={{ fontSize: '12px', color: '#ffc107' }}>
                  ⭐ {formData.rating}/10
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Progress Tab
  const progressTab = (
    <div className="sap-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4 style={{ marginBottom: '14px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span>📈</span> Progress Tracking
          </h4>

          {showEpisodeFields && (
            <>
              <div className="sap-form-group">
                <label className="sap-form-label">Episodes</label>
                <div className="sap-form-field" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="sap-input"
                    value={formData.currentEpisode}
                    onChange={(e) => handleChange('currentEpisode', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Current"
                    min="0"
                    style={{ width: '80px' }}
                  />
                  <span style={{ color: 'var(--sap-text-secondary)' }}>/</span>
                  <input
                    type="number"
                    className="sap-input"
                    value={formData.episodes}
                    onChange={(e) => handleChange('episodes', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Total"
                    min="0"
                    style={{ width: '80px' }}
                  />
                </div>
              </div>
            </>
          )}

          {showSeasonFields && (
            <div className="sap-form-group">
              <label className="sap-form-label">Seasons</label>
              <div className="sap-form-field" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  className="sap-input"
                  value={formData.currentSeason}
                  onChange={(e) => handleChange('currentSeason', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Current"
                  min="0"
                  style={{ width: '80px' }}
                />
                <span style={{ color: 'var(--sap-text-secondary)' }}>/</span>
                <input
                  type="number"
                  className="sap-input"
                  value={formData.seasons}
                  onChange={(e) => handleChange('seasons', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Total"
                  min="0"
                  style={{ width: '80px' }}
                />
              </div>
            </div>
          )}

          {showChapterFields && (
            <div className="sap-form-group">
              <label className="sap-form-label">Chapters</label>
              <div className="sap-form-field" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  className="sap-input"
                  value={formData.currentChapter}
                  onChange={(e) => handleChange('currentChapter', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Current"
                  min="0"
                  style={{ width: '80px' }}
                />
                <span style={{ color: 'var(--sap-text-secondary)' }}>/</span>
                <input
                  type="number"
                  className="sap-input"
                  value={formData.chapters}
                  onChange={(e) => handleChange('chapters', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Total"
                  min="0"
                  style={{ width: '80px' }}
                />
              </div>
            </div>
          )}

          <SapInput
            label="Duration"
            value={formData.duration}
            onChange={(val) => handleChange('duration', val)}
            disabled={isReadOnly}
            placeholder="e.g., 2h 30m, 24 min/ep"
          />

          {/* Progress Bar */}
          {getProgress() !== null && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--sap-text-secondary)' }}>Progress</span>
                <span style={{ fontSize: '12px', fontWeight: '600' }}>{getProgress()}%</span>
              </div>
              <div style={{
                height: '8px',
                background: 'var(--sap-border)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${getProgress()}%`,
                  background: getProgress() === 100 ? 'var(--sap-positive)' : 'var(--sap-brand)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 style={{ marginBottom: '14px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span>📅</span> Dates
          </h4>

          <SapInput
            label="Start Date"
            value={formData.startDate}
            onChange={(val) => handleChange('startDate', val)}
            type="date"
            disabled={isReadOnly}
          />

          <SapInput
            label="End Date"
            value={formData.endDate}
            onChange={(val) => handleChange('endDate', val)}
            type="date"
            disabled={isReadOnly}
          />

          {formData.startDate && formData.endDate && (
            <div style={{
              marginTop: '12px',
              padding: '10px',
              background: 'var(--sap-content-bg)',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <span style={{ color: 'var(--sap-text-secondary)' }}>Duration: </span>
              <span style={{ fontWeight: '600' }}>
                {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Details/Credits Tab
  const creditsTab = (
    <div className="sap-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4 style={{ marginBottom: '14px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span>🎭</span> Credits & Details
          </h4>

          {showStudioField && (
            <SapInput
              label="Studio"
              value={formData.studio}
              onChange={(val) => handleChange('studio', val)}
              disabled={isReadOnly}
              placeholder="Animation/Production studio"
            />
          )}

          {showDeveloperField && (
            <SapInput
              label="Developer"
              value={formData.developer}
              onChange={(val) => handleChange('developer', val)}
              disabled={isReadOnly}
              placeholder="Game developer"
            />
          )}

          {showDirectorField && (
            <SapInput
              label="Director"
              value={formData.director}
              onChange={(val) => handleChange('director', val)}
              disabled={isReadOnly}
              placeholder="Director name"
            />
          )}

          <SapInput
            label="Cast/Actors"
            value={formData.cast}
            onChange={(val) => handleChange('cast', val)}
            disabled={isReadOnly}
            placeholder="Main cast, voice actors..."
          />
        </div>

        <div>
          <h4 style={{ marginBottom: '14px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span>🏷️</span> Genres
          </h4>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '8px',
            background: 'var(--sap-content-bg)',
            borderRadius: '6px'
          }}>
            {GENRE_OPTIONS.map(genre => (
              <button
                key={genre.value}
                onClick={() => !isReadOnly && handleGenreToggle(genre.value)}
                disabled={isReadOnly}
                style={{
                  padding: '6px 12px',
                  border: '1px solid',
                  borderColor: (formData.genres || []).includes(genre.value) ? 'var(--sap-brand)' : 'var(--sap-border)',
                  background: (formData.genres || []).includes(genre.value) ? 'var(--sap-brand)' : 'white',
                  color: (formData.genres || []).includes(genre.value) ? 'white' : 'var(--sap-text-primary)',
                  borderRadius: '16px',
                  cursor: isReadOnly ? 'default' : 'pointer',
                  fontSize: '11px',
                  transition: 'all 0.2s'
                }}
              >
                {genre.label}
              </button>
            ))}
          </div>

          {(formData.genres || []).length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--sap-text-secondary)' }}>
              Selected: {(formData.genres || []).map(g => 
                GENRE_OPTIONS.find(go => go.value === g)?.label
              ).join(', ')}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '14px', color: 'var(--sap-brand)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span>📝</span> Description
        </h4>
        <textarea
          className="sap-textarea"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isReadOnly}
          placeholder="Synopsis, description, or your thoughts..."
          rows={4}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );

  // Notes Tab
  const notesTab = (
    <div className="sap-form">
      <div className="sap-form-group" style={{ alignItems: 'flex-start' }}>
        <label className="sap-form-label">Personal Notes</label>
        <div className="sap-form-field">
          <textarea
            className="sap-textarea"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={isReadOnly}
            placeholder="Your personal notes, review, thoughts..."
            rows={6}
            style={{ width: '100%', maxWidth: '600px' }}
          />
        </div>
      </div>
      
      <SapInput
        label="Tags"
        value={formData.tags}
        onChange={(val) => handleChange('tags', val)}
        disabled={isReadOnly}
        placeholder="Comma-separated tags (e.g., masterpiece, comfort, rewatch)"
      />

      {formData.tags && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: '162px' }}>
          {formData.tags.split(',').map((tag, i) => (
            <span key={i} style={{
              padding: '4px 10px',
              background: 'var(--sap-brand-lighter)',
              color: 'var(--sap-brand-dark)',
              borderRadius: '12px',
              fontSize: '11px'
            }}>
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // History Tab
  const historyTab = (
    <div>
      <div className="sap-message-strip info" style={{ marginBottom: '16px' }}>
        <span className="sap-message-strip-icon">ℹ️</span>
        <span>Record information and history.</span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        <div style={{
          padding: '16px',
          background: 'var(--sap-content-bg)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--sap-text-secondary)', marginBottom: '4px' }}>
            Item ID
          </div>
          <div style={{ fontWeight: '600', fontSize: '13px', fontFamily: 'monospace' }}>
            {formData.itemNumber || '-'}
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: 'var(--sap-content-bg)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--sap-text-secondary)', marginBottom: '4px' }}>
            Category
          </div>
          <div style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{getCategoryInfo(formData.category).icon}</span>
            {getCategoryInfo(formData.category).label.replace(/^[^\s]+\s/, '')}
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'var(--sap-content-bg)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--sap-text-secondary)', marginBottom: '4px' }}>
            Created By
          </div>
          <div style={{ fontWeight: '600', fontSize: '13px' }}>{formData.createdBy || '-'}</div>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'var(--sap-content-bg)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--sap-text-secondary)', marginBottom: '4px' }}>
            Created On
          </div>
          <div style={{ fontWeight: '600', fontSize: '13px' }}>
            {formData.createdAt ? new Date(formData.createdAt).toLocaleString() : '-'}
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'var(--sap-content-bg)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--sap-text-secondary)', marginBottom: '4px' }}>
            Last Updated
          </div>
          <div style={{ fontWeight: '600', fontSize: '13px' }}>
            {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : '-'}
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'var(--sap-content-bg)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--sap-text-secondary)', marginBottom: '4px' }}>
            Status
          </div>
          <div>
            <span className={`sap-badge ${
              formData.status === 'completed' ? 'success' :
              formData.status === 'dropped' ? 'error' :
              formData.status === 'in_progress' ? 'info' :
              formData.status === 'on_hold' ? 'warning' : ''
            }`}>
              {getStatusInfo(formData.status).label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { label: 'Details', icon: '📋', content: detailsTab },
    { label: 'Progress', icon: '📈', content: progressTab },
    { label: 'Credits', icon: '🎭', content: creditsTab },
    { label: 'Notes', icon: '📝', content: notesTab },
    ...(formData.id ? [{ label: 'History', icon: '🕐', content: historyTab }] : [])
  ];

  const getModeTitle = () => {
    switch (mode) {
      case 'create': return 'Add to Wishlist';
      case 'change': return 'Edit Wishlist Item';
      case 'display': return 'View Wishlist Item';
      default: return 'Entertainment Wishlist';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'create': return '➕';
      case 'change': return '✏️';
      case 'display': return '👁️';
      default: return '🎬';
    }
  };

  return (
    <div>
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">{getModeIcon()}</span>
            {getModeTitle()} - EW0{mode === 'create' ? '1' : mode === 'change' ? '2' : '3'}
          </span>
          <div className="sap-panel-header-actions">
            <span className={`sap-badge ${mode === 'create' ? 'info' : mode === 'change' ? 'warning' : 'success'}`}>
              {mode === 'create' ? 'NEW' : mode === 'change' ? 'EDIT' : 'VIEW'}
            </span>
            {formData.category && (
              <span className="sap-badge" style={{ 
                marginLeft: '8px',
                background: getCategoryInfo(formData.category).color,
                color: 'white'
              }}>
                {getCategoryInfo(formData.category).icon} {formData.category}
              </span>
            )}
            {formData.isNsfw && (
              <span className="sap-badge error" style={{ marginLeft: '8px' }}>
                🔞 NSFW
              </span>
            )}
          </div>
        </div>
        <div className="sap-panel-content">
          {needsLoad ? (
            <div>
              <div className="sap-message-strip info" style={{ marginBottom: '16px' }}>
                <span className="sap-message-strip-icon">ℹ️</span>
                <span>Enter an item ID to load or search for existing items in your wishlist.</span>
              </div>
              
              <div className="sap-form-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <SapInput
                  label="Item ID"
                  value={itemId}
                  onChange={setItemId}
                  placeholder="e.g., MO000000001, AN000000001"
                />
                <SapButton onClick={loadItem} type="primary" icon="📂">
                  Load
                </SapButton>
                <SapButton onClick={() => {
                  setSearchResults(getTableData('entertainment_wishlist') || []);
                  setShowSearchModal(true);
                }} icon="🔎">
                  Search
                </SapButton>
              </div>

              {/* Category Quick Filters */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--sap-text-secondary)', marginBottom: '8px' }}>
                  Quick filter by category:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ENTERTAINMENT_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setFilterCategory(cat.value);
                        handleSearch();
                      }}
                      style={{
                        padding: '8px 16px',
                        background: `${cat.color}15`,
                        border: `1px solid ${cat.color}`,
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {cat.icon} {cat.label.replace(/^[^\s]+\s/, '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="sap-button-group" style={{ marginBottom: '16px' }}>
                {!isReadOnly && (
                  <>
                    <SapButton onClick={handleSave} type="primary" icon="💾">
                      Save
                    </SapButton>
                    {mode === 'change' && formData.id && (
                      <SapButton onClick={handleDelete} type="danger" icon="🗑️">
                        Delete
                      </SapButton>
                    )}
                  </>
                )}
                <SapButton onClick={handleClear} icon="🔄">
                  {mode === 'create' ? 'Clear' : 'New Item'}
                </SapButton>
              </div>

              <SapTabs tabs={tabs} />
            </>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SapModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="🔍 Search Entertainment Wishlist"
        width="900px"
        footer={
          <SapButton onClick={() => setShowSearchModal(false)}>
            Close
          </SapButton>
        }
      >
        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            className="sap-input"
            placeholder="🔍 Search by ID, title, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select
            className="sap-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="all">All Categories</option>
            {ENTERTAINMENT_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label.replace(/^[^\s]+\s/, '')}</option>
            ))}
          </select>
          <select
            className="sap-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            className="sap-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ width: '130px' }}
          >
            <option value="all">All Priority</option>
            {PRIORITY_OPTIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <SapButton onClick={handleSearch} type="primary">
            Search
          </SapButton>
        </div>

        {/* Category Summary */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '16px',
          flexWrap: 'wrap' 
        }}>
          {ENTERTAINMENT_CATEGORIES.map(cat => {
            const count = searchResults.filter(i => i.category === cat.value).length;
            return (
              <div
                key={cat.value}
                onClick={() => {
                  setFilterCategory(cat.value);
                  handleSearch();
                }}
                style={{
                  padding: '4px 10px',
                  background: `${cat.color}15`,
                  borderRadius: '12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {cat.icon}
                <span style={{ fontWeight: '600' }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          <table className="sap-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: 'var(--sap-text-secondary)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                      <div>No items found in your wishlist</div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>
                        Try adjusting your filters or add new items
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                searchResults.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          style={{
                            width: '32px',
                            height: '45px',
                            objectFit: 'cover',
                            borderRadius: '2px'
                          }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '45px',
                          background: getCategoryInfo(item.category).color,
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '16px'
                        }}>
                          {getCategoryInfo(item.category).icon}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '11px' }}>
                      {item.itemNumber}
                      {item.isNsfw && (
                        <span style={{
                          marginLeft: '4px',
                          fontSize: '9px',
                          padding: '1px 4px',
                          background: '#f44336',
                          color: 'white',
                          borderRadius: '2px'
                        }}>18+</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{item.title}</div>
                      {item.year && (
                        <div style={{ fontSize: '10px', color: 'var(--sap-text-secondary)' }}>
                          {item.year}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        background: `${getCategoryInfo(item.category).color}20`,
                        color: getCategoryInfo(item.category).color,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {getCategoryInfo(item.category).icon} {item.category}
                      </span>
                    </td>
                    <td>
                      <span className={`sap-badge ${
                        item.status === 'completed' ? 'success' :
                        item.status === 'in_progress' ? 'info' :
                        item.status === 'dropped' ? 'error' :
                        item.status === 'on_hold' ? 'warning' : ''
                      }`} style={{ fontSize: '10px' }}>
                        {getStatusInfo(item.status).label}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 6px',
                        background: getPriorityInfo(item.priority).color,
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '10px'
                      }}>
                        {item.priority?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {item.rating ? (
                        <span style={{ color: '#ffc107' }}>
                          ⭐ {item.rating}/10
                        </span>
                      ) : (
                        <span style={{ color: 'var(--sap-text-placeholder)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <SapButton onClick={() => handleSelectItem(item)} type="primary">
                        Select
                      </SapButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {searchResults.length > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'var(--sap-content-bg)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--sap-text-secondary)' }}>
              {searchResults.length} item(s) found
            </span>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span>
                ✅ Completed: <strong>{searchResults.filter(i => i.status === 'completed').length}</strong>
              </span>
              <span>
                ▶️ In Progress: <strong>{searchResults.filter(i => i.status === 'in_progress').length}</strong>
              </span>
              <span>
                📋 Planned: <strong>{searchResults.filter(i => i.status === 'planned').length}</strong>
              </span>
            </div>
          </div>
        )}
      </SapModal>
    </div>
  );
};

export default EntertainmentWishlistScreen;