// src/components/Screens/Notes/NotesTableModal.jsx

import React from 'react';
import SapModal from '../../Common/SapModal';
import SapButton from '../../Common/SapButton';
import SapInput from '../../Common/SapInput';

const NotesTableModal = ({
  isOpen,
  onClose,
  tableRows,
  onTableRowsChange,
  tableCols,
  onTableColsChange,
  onInsert
}) => {
  return (
    <SapModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onInsert}
      title="▦ Insert Table"
      width="350px"
      footer={
        <>
          <SapButton onClick={onClose}>Cancel</SapButton>
          <SapButton onClick={onInsert} type="primary">
            Insert
          </SapButton>
        </>
      }
    >
      <SapInput
        label="Rows"
        value={tableRows}
        onChange={(val) => onTableRowsChange(parseInt(val) || 3)}
        type="number"
        min="2"
        max="20"
      />
      <SapInput
        label="Columns"
        value={tableCols}
        onChange={(val) => onTableColsChange(parseInt(val) || 3)}
        type="number"
        min="2"
        max="10"
      />
      <div className="notes-table-preview-info">
        Preview: {tableRows} rows × {tableCols} columns
      </div>
    </SapModal>
  );
};

export default NotesTableModal;