// src/components/Screens/Notes/NotesLinkModal.jsx

import React from 'react';
import SapModal from '../../Common/SapModal';
import SapButton from '../../Common/SapButton';
import SapInput from '../../Common/SapInput';

const NotesLinkModal = ({
  isOpen,
  onClose,
  linkUrl,
  onLinkUrlChange,
  linkText,
  onLinkTextChange,
  onInsert
}) => {
  return (
    <SapModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onInsert}
      title="🔗 Insert Link"
      width="400px"
      footer={
        <>
          <SapButton onClick={onClose}>Cancel</SapButton>
          <SapButton onClick={onInsert} type="primary" disabled={!linkUrl}>
            Insert
          </SapButton>
        </>
      }
    >
      <SapInput
        label="URL"
        value={linkUrl}
        onChange={onLinkUrlChange}
        placeholder="https://example.com"
        required
      />
      <SapInput
        label="Display Text"
        value={linkText}
        onChange={onLinkTextChange}
        placeholder="Click here (optional)"
      />
    </SapModal>
  );
};

export default NotesLinkModal;