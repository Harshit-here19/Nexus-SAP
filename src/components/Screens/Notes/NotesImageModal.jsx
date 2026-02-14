// src/components/Screens/Notes/NotesImageModal.jsx

import React from 'react';
import SapModal from '../../Common/SapModal';
import SapButton from '../../Common/SapButton';
import SapInput from '../../Common/SapInput';

const NotesImageModal = ({
  isOpen,
  onClose,
  imageUrl,
  onImageUrlChange,
  imageAlt,
  onImageAltChange,
  onInsert
}) => {
  return (
    <SapModal
      isOpen={isOpen}
      onClose={onClose}
      title="🖼️ Insert Image"
      width="400px"
      footer={
        <>
          <SapButton onClick={onClose}>Cancel</SapButton>
          <SapButton onClick={onInsert} type="primary" disabled={!imageUrl}>
            Insert
          </SapButton>
        </>
      }
    >
      <SapInput
        label="Image URL"
        value={imageUrl}
        onChange={onImageUrlChange}
        placeholder="https://example.com/image.png"
        required
      />
      <SapInput
        label="Alt Text"
        value={imageAlt}
        onChange={onImageAltChange}
        placeholder="Image description (optional)"
      />
      {imageUrl && (
        <div className="notes-image-preview">
          <img 
            src={imageUrl} 
            alt="Preview" 
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
    </SapModal>
  );
};

export default NotesImageModal;