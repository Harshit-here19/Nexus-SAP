// src/components/Common/ImportExportModal.jsx
import React, { useState, useRef } from 'react';
import SapModal from './SapModal';
import SapButton from './SapButton';
import SapSelect from './SapSelect';
import { 
  exportToJSON, 
  importFromJSON, 
  exportToCSV,
  importFromCSV,
  createBackup,
  restoreBackup,
  formatFileSize,
  validateFileType
} from '../../utils/fileSystem';
import { getAllData, saveAllData, getTableData, saveTableData } from '../../utils/storage';

const ImportExportModal = ({ isOpen, onClose, onStatusMessage }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [selectedTable, setSelectedTable] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const tables = [
    { value: 'all', label: 'All Data (Full Backup)' },
    { value: 'materials', label: 'Materials (MARA)' },
    { value: 'salesOrders', label: 'Sales Orders (VBAK)' },
    { value: 'customers', label: 'Customers (KNA1)' },
    { value: 'vendors', label: 'Vendors (LFA1)' },
    { value: 'plants', label: 'Plants (T001W)' },
    { value: 'storageLocations', label: 'Storage Locations (T001L)' }
  ];

  const tableColumns = {
    materials: [
      { key: 'materialNumber', label: 'Material Number' },
      { key: 'description', label: 'Description' },
      { key: 'materialType', label: 'Material Type' },
      { key: 'materialGroup', label: 'Material Group' },
      { key: 'baseUnit', label: 'Base Unit' },
      { key: 'plant', label: 'Plant' },
      { key: 'storageLocation', label: 'Storage Location' },
      { key: 'salesPrice', label: 'Sales Price' },
      { key: 'currency', label: 'Currency' }
    ],
    plants: [
      { key: 'plantCode', label: 'Plant Code' },
      { key: 'plantName', label: 'Plant Name' },
      { key: 'city', label: 'City' }
    ],
    storageLocations: [
      { key: 'sloc', label: 'Storage Location' },
      { key: 'name', label: 'Name' },
      { key: 'plantCode', label: 'Plant Code' }
    ]
  };

  // Handle Export
  const handleExport = () => {
    setIsProcessing(true);
    
    try {
      let result;
      const timestamp = new Date().toISOString().split('T')[0];

      if (selectedTable === 'all') {
        // Full backup
        result = createBackup();
      } else if (exportFormat === 'json') {
        // Export single table as JSON
        const data = getTableData(selectedTable);
        result = exportToJSON(data, `${selectedTable}-${timestamp}.json`);
      } else {
        // Export as CSV
        const data = getTableData(selectedTable);
        const columns = tableColumns[selectedTable] || 
          Object.keys(data[0] || {}).map(key => ({ key, label: key }));
        result = exportToCSV(data, columns, `${selectedTable}-${timestamp}.csv`);
      }

      if (result.success) {
        onStatusMessage(result.message, 'success');
        onClose();
      } else {
        onStatusMessage(result.message, 'error');
      }
    } catch (error) {
      onStatusMessage(`Export failed: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setImportPreview(null);

    const extension = file.name.split('.').pop().toLowerCase();

    try {
      if (extension === 'json') {
        const result = await importFromJSON(file);
        setImportPreview({
          type: 'json',
          filename: file.name,
          size: formatFileSize(file.size),
          data: result.data,
          recordCount: Array.isArray(result.data) ? result.data.length : 
            (result.data.data ? 'Full Backup' : Object.keys(result.data).length)
        });
      } else if (extension === 'csv') {
        const columns = tableColumns[selectedTable] || [];
        const result = await importFromCSV(file, columns);
        setImportPreview({
          type: 'csv',
          filename: file.name,
          size: formatFileSize(file.size),
          data: result.data,
          headers: result.headers,
          recordCount: result.data.length
        });
      } else {
        onStatusMessage('Unsupported file type. Please use JSON or CSV.', 'error');
      }
    } catch (error) {
      onStatusMessage(error.message, 'error');
      setSelectedFile(null);
    }
  };

  // Handle Import
  const handleImport = async () => {
    if (!selectedFile || !importPreview) {
      onStatusMessage('Please select a file first', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      if (importPreview.data.version && importPreview.data.data) {
        // This is a full backup file
        await restoreBackup(selectedFile);
        onStatusMessage('Full backup restored successfully. Please refresh the page.', 'success');
      } else if (selectedTable && selectedTable !== 'all') {
        // Import to specific table
        const existingData = getTableData(selectedTable);
        const newData = importPreview.data;
        
        // Add IDs to imported records
        const processedData = newData.map((record, index) => ({
          ...record,
          id: record.id || `imported_${Date.now()}_${index}`,
          importedAt: new Date().toISOString()
        }));

        // Merge or replace
        const mergedData = [...existingData, ...processedData];
        saveTableData(selectedTable, mergedData);
        
        onStatusMessage(`Imported ${processedData.length} records to ${selectedTable}`, 'success');
      } else {
        onStatusMessage('Please select a target table for import', 'warning');
        setIsProcessing(false);
        return;
      }

      // Reset state
      setSelectedFile(null);
      setImportPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (error) {
      onStatusMessage(`Import failed: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedFile(null);
    setImportPreview(null);
    setSelectedTable('');
    setExportFormat('json');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <SapModal
      isOpen={isOpen}
      onClose={handleClose}
      title="📁 Import / Export Data"
      width="650px"
    >
      {/* Tab Headers */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--sap-border)',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('export')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'export' ? 'var(--sap-brand)' : 'transparent',
            color: activeTab === 'export' ? 'white' : 'var(--sap-text-primary)',
            cursor: 'pointer',
            fontWeight: '600',
            borderRadius: '4px 4px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📤 Export
        </button>
        <button
          onClick={() => setActiveTab('import')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'import' ? 'var(--sap-brand)' : 'transparent',
            color: activeTab === 'import' ? 'white' : 'var(--sap-text-primary)',
            cursor: 'pointer',
            fontWeight: '600',
            borderRadius: '4px 4px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📥 Import
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: activeTab === 'backup' ? 'var(--sap-brand)' : 'transparent',
            color: activeTab === 'backup' ? 'white' : 'var(--sap-text-primary)',
            cursor: 'pointer',
            fontWeight: '600',
            borderRadius: '4px 4px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          💾 Backup
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div>
          <div className="sap-message-strip info" style={{ marginBottom: '20px' }}>
            <span className="sap-message-strip-icon">ℹ️</span>
            <span>Export your data to a file that can be saved and shared.</span>
          </div>

          <div className="sap-form">
            <SapSelect
              label="Select Data"
              value={selectedTable}
              onChange={setSelectedTable}
              options={tables}
              placeholder="Choose what to export..."
              width="100%"
            />

            {selectedTable && selectedTable !== 'all' && (
              <div className="sap-form-group">
                <label className="sap-form-label">Format</label>
                <div className="sap-form-field">
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="format"
                        value="json"
                        checked={exportFormat === 'json'}
                        onChange={() => setExportFormat('json')}
                        style={{ accentColor: 'var(--sap-brand)' }}
                      />
                      JSON (Recommended)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={exportFormat === 'csv'}
                        onChange={() => setExportFormat('csv')}
                        style={{ accentColor: 'var(--sap-brand)' }}
                      />
                      CSV (Excel compatible)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {selectedTable && (
              <div style={{
                background: 'var(--sap-content-bg)',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>Export Preview</span>
                  <span className="sap-badge info">
                    {selectedTable === 'all' ? 'Full Backup' : 
                      `${getTableData(selectedTable).length} records`}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--sap-text-secondary)' }}>
                  {selectedTable === 'all' 
                    ? 'All application data will be exported including materials, orders, and settings.'
                    : `Table: ${tables.find(t => t.value === selectedTable)?.label}`}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <SapButton onClick={handleClose}>
              Cancel
            </SapButton>
            <SapButton 
              onClick={handleExport} 
              type="primary"
              disabled={!selectedTable || isProcessing}
              icon={isProcessing ? '⏳' : '📤'}
            >
              {isProcessing ? 'Exporting...' : 'Export'}
            </SapButton>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div>
          <div className="sap-message-strip warning" style={{ marginBottom: '20px' }}>
            <span className="sap-message-strip-icon">⚠️</span>
            <span>Importing data will add records to existing data. Duplicates may occur.</span>
          </div>

          <div className="sap-form">
            <SapSelect
              label="Target Table"
              value={selectedTable}
              onChange={(val) => {
                setSelectedTable(val);
                setSelectedFile(null);
                setImportPreview(null);
              }}
              options={tables.filter(t => t.value !== 'all')}
              placeholder="Select where to import..."
              width="100%"
            />

            <div className="sap-form-group">
              <label className="sap-form-label">Select File</label>
              <div className="sap-form-field">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  style={{
                    padding: '8px',
                    border: '1px dashed var(--sap-border-dark)',
                    borderRadius: '4px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {importPreview && (
              <div style={{
                background: 'var(--sap-content-bg)',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px' 
                }}>
                  <span style={{ fontWeight: '600' }}>📄 {importPreview.filename}</span>
                  <span style={{ fontSize: '12px', color: 'var(--sap-text-secondary)' }}>
                    {importPreview.size}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  <div>
                    <span style={{ color: 'var(--sap-text-secondary)' }}>Type: </span>
                    <strong>{importPreview.type.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--sap-text-secondary)' }}>Records: </span>
                    <strong>{importPreview.recordCount}</strong>
                  </div>
                </div>

                {importPreview.type === 'csv' && importPreview.headers && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ color: 'var(--sap-text-secondary)', fontSize: '12px' }}>
                      Columns: {importPreview.headers.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <SapButton onClick={handleClose}>
              Cancel
            </SapButton>
            <SapButton 
              onClick={handleImport} 
              type="primary"
              disabled={!importPreview || !selectedTable || isProcessing}
              icon={isProcessing ? '⏳' : '📥'}
            >
              {isProcessing ? 'Importing...' : 'Import'}
            </SapButton>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div>
          <div className="sap-message-strip info" style={{ marginBottom: '20px' }}>
            <span className="sap-message-strip-icon">💡</span>
            <span>Create a complete backup of all your data or restore from a previous backup.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Create Backup */}
            <div style={{
              background: 'var(--sap-content-bg)',
              padding: '24px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid var(--sap-border)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💾</div>
              <h4 style={{ marginBottom: '8px' }}>Create Backup</h4>
              <p style={{ fontSize: '13px', color: 'var(--sap-text-secondary)', marginBottom: '16px' }}>
                Download a complete backup of all your data
              </p>
              <SapButton 
                onClick={() => {
                  const result = createBackup();
                  if (result.success) {
                    onStatusMessage('Backup created successfully', 'success');
                  } else {
                    onStatusMessage(result.message, 'error');
                  }
                }}
                type="primary"
                icon="📥"
              >
                Create Backup
              </SapButton>
            </div>

            {/* Restore Backup */}
            <div style={{
              background: 'var(--sap-content-bg)',
              padding: '24px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid var(--sap-border)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
              <h4 style={{ marginBottom: '8px' }}>Restore Backup</h4>
              <p style={{ fontSize: '13px', color: 'var(--sap-text-secondary)', marginBottom: '16px' }}>
                Restore data from a backup file
              </p>
              <input
                type="file"
                accept=".json"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const result = await restoreBackup(file);
                      onStatusMessage(result.message, 'success');
                      onClose();
                      // Suggest page refresh
                      if (window.confirm('Backup restored! Refresh the page to see changes?')) {
                        window.location.reload();
                      }
                    } catch (error) {
                      onStatusMessage(error.message, 'error');
                    }
                  }
                }}
                style={{ display: 'none' }}
                id="restore-backup-input"
              />
              <SapButton 
                onClick={() => document.getElementById('restore-backup-input').click()}
                icon="📤"
              >
                Select Backup File
              </SapButton>
            </div>
          </div>

          <div className="sap-message-strip warning" style={{ marginTop: '20px' }}>
            <span className="sap-message-strip-icon">⚠️</span>
            <span>
              <strong>Warning:</strong> Restoring a backup will overwrite all existing data. 
              Make sure to create a backup first if needed.
            </span>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <SapButton onClick={handleClose}>
              Close
            </SapButton>
          </div>
        </div>
      )}
    </SapModal>
  );
};

export default ImportExportModal;