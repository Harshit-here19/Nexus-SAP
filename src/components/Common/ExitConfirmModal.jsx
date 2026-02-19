// src/components/Common/ExitConfirmModal.jsx
import React from 'react';
import SapModal from './SapModal';
import SapButton from './SapButton';

const ExitConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <SapModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="⚠️ Unsaved Changes"
      width="450px"
      footer={
        <>
          <SapButton onClick={onCancel}>
            No, Stay
          </SapButton>
          <SapButton onClick={onConfirm} type="danger">
            Yes, Discard Changes
          </SapButton>
        </>
      }
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ marginBottom: '12px', color: 'var(--sap-critical)' }}>
          You have unsaved changes!
        </h3>
        <p style={{ color: 'var(--sap-text-secondary)' }}>
          Are you sure you want to leave? All unsaved changes will be lost.
        </p>
      </div>
    </SapModal>
  );
};

export default ExitConfirmModal;