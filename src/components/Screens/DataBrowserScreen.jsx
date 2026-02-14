// src/components/Screens/DataBrowserScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import SapButton from '../Common/SapButton';
import SapSelect from '../Common/SapSelect';
import SapInput from '../Common/SapInput';
import SapModal from '../Common/SapModal';
import { useTransaction } from '../../context/TransactionContext';
import { getAllData } from '../../utils/storage';

// Define available tables
const availableTables = [
  { value: 'expenses', label: 'ZEXP - Expenses', icon: '💰' },
  { value: 'materials', label: 'MARA - Material Master', icon: '📦' },
  { value: 'salesOrders', label: 'VBAK - Sales Order Header', icon: '🛒' },
  { value: 'customers', label: 'KNA1 - Customer Master', icon: '👥' },
  { value: 'vendors', label: 'LFA1 - Vendor Master', icon: '🏭' },
  { value: 'plants', label: 'T001W - Plants', icon: '🏢' },
  { value: 'storageLocations', label: 'T001L - Storage Locations', icon: '📍' },
  { value: 'transactionHistory', label: 'CDHDR - Change History', icon: '📋' }
];

// Column definitions for each table
const tableColumns = {
  expenses: [
    { key: 'expenseNumber', label: 'Expense ID', width: '120px' },
    { key: 'date', label: 'Date', width: '100px' },
    { key: 'category', label: 'Category', width: '100px' },
    { key: 'description', label: 'Description', width: '200px' },
    { key: 'amount', label: 'Amount', width: '100px', align: 'right' },
    { key: 'currency', label: 'Curr', width: '60px' },
    { key: 'paymentMethod', label: 'Payment', width: '100px' },
    { key: 'vendor', label: 'Vendor', width: '150px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'createdAt', label: 'Created', width: '150px' }
  ],
  materials: [
    { key: 'materialNumber', label: 'Material', width: '120px' },
    { key: 'description', label: 'Description', width: '200px' },
    { key: 'materialType', label: 'Type', width: '80px' },
    { key: 'materialGroup', label: 'Mat. Group', width: '100px' },
    { key: 'baseUnit', label: 'Base UoM', width: '80px' },
    { key: 'plant', label: 'Plant', width: '80px' },
    { key: 'storageLocation', label: 'SLoc', width: '80px' },
    { key: 'salesPrice', label: 'Price', width: '100px', align: 'right' },
    { key: 'currency', label: 'Curr.', width: '60px' },
    { key: 'createdAt', label: 'Created On', width: '150px' }
  ],
  salesOrders: [
    { key: 'orderNumber', label: 'Sales Order', width: '120px' },
    { key: 'customer', label: 'Customer', width: '150px' },
    { key: 'orderDate', label: 'Order Date', width: '120px' },
    { key: 'netValue', label: 'Net Value', width: '120px', align: 'right' },
    { key: 'currency', label: 'Curr.', width: '60px' },
    { key: 'status', label: 'Status', width: '100px' }
  ],
  customers: [
    { key: 'customerNumber', label: 'Customer', width: '120px' },
    { key: 'name', label: 'Name', width: '200px' },
    { key: 'city', label: 'City', width: '150px' },
    { key: 'country', label: 'Country', width: '100px' },
    { key: 'phone', label: 'Phone', width: '120px' }
  ],
  vendors: [
    { key: 'vendorNumber', label: 'Vendor', width: '120px' },
    { key: 'name', label: 'Name', width: '200px' },
    { key: 'city', label: 'City', width: '150px' },
    { key: 'country', label: 'Country', width: '100px' }
  ],
  plants: [
    { key: 'plantCode', label: 'Plant', width: '80px' },
    { key: 'plantName', label: 'Plant Name', width: '200px' },
    { key: 'city', label: 'City', width: '150px' }
  ],
  storageLocations: [
    { key: 'sloc', label: 'SLoc', width: '80px' },
    { key: 'name', label: 'Description', width: '200px' },
    { key: 'plantCode', label: 'Plant', width: '80px' }
  ],
  transactionHistory: [
    { key: 'tcode', label: 'T-Code', width: '100px' },
    { key: 'timestamp', label: 'Date/Time', width: '180px' },
    { key: 'action', label: 'Action', width: '150px' }
  ]
};

const DataBrowserScreen = () => {
  const { updateStatus, registerBackHandler, clearBackHandler } = useTransaction();
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterColumn, setActiveFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');

useEffect(() => {
  const backHandler = () => {
    if (isTableLoaded) {
      setIsTableLoaded(false);
      setSelectedTable('');
      setTableData([]);
      setColumns([]);
      setSearchTerm('');
      setFilters({});
      setSelectedRows([]);
      setCurrentPage(1);
      updateStatus('Back to table selection', 'info');
      return true; // handled internally
    }

    return false; // let transaction handle it
  };

  registerBackHandler(backHandler);

  return () => clearBackHandler();
}, [isTableLoaded]);


  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Selection state
  const [selectedRows, setSelectedRows] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Detail view
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Load table data
  const handleLoadTable = () => {
    if (!selectedTable) {
      updateStatus('Please select a table', 'warning');
      return;
    }

    const allData = getAllData();
    const data = allData[selectedTable] || [];
    const cols = tableColumns[selectedTable] || [];

    setTableData(data);
    setColumns(cols);
    setIsTableLoaded(true);
    setCurrentPage(1);
    setSelectedRows([]);
    setFilters({});
    setSortConfig({ key: null, direction: 'asc' });

    updateStatus(`Table ${selectedTable.toUpperCase()} loaded: ${data.length} entries`, 'success');
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...tableData];

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(col =>
          String(row[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key] || '').toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Apply sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tableData, searchTerm, filters, sortConfig, columns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle row selection
  const handleRowClick = (index) => {
    setSelectedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Handle row double click (show details)
  const handleRowDoubleClick = (row) => {
    setSelectedRecord(row);
    setShowDetailModal(true);
  };

  // Add filter
  const handleAddFilter = () => {
    if (activeFilterColumn && filterValue) {
      setFilters(prev => ({
        ...prev,
        [activeFilterColumn]: filterValue
      }));
      setShowFilterModal(false);
      setActiveFilterColumn('');
      setFilterValue('');
      setCurrentPage(1);
    }
  };

  // Remove filter
  const handleRemoveFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (processedData.length === 0) {
      updateStatus('No data to export', 'warning');
      return;
    }

    const headers = columns.map(col => col.label).join(',');
    const rows = processedData.map(row =>
      columns.map(col => `"${row[col.key] || ''}"`).join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTable}_export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    updateStatus(`Exported ${processedData.length} records to CSV`, 'success');
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (processedData.length === 0) {
      updateStatus('No data to export', 'warning');
      return;
    }

    const json = JSON.stringify(processedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTable}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    updateStatus(`Exported ${processedData.length} records to JSON`, 'success');
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '⬆️' : '⬇️';
  };

  // Format cell value
  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return '';

    if (column.key.includes('createdAt') || column.key.includes('Date') || column.key.includes('timestamp')) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }

    if (column.align === 'right' && !isNaN(value)) {
      return Number(value).toLocaleString();
    }

    return String(value);
  };

  return (
    <div>
      {/* Header Panel */}
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">🔍</span>
            Data Browser - SE16
          </span>
          <span className="sap-badge info">DISPLAY</span>
        </div>
        <div className="sap-panel-content">
          {!isTableLoaded ? (
            /* Table Selection */
            <div>
              <div className="sap-message-strip info" style={{ marginBottom: '20px' }}>
                <span className="sap-message-strip-icon">ℹ️</span>
                <span>Select a table to view its contents. Data is stored locally in your browser.</span>
              </div>

              <div className="sap-form">
                <SapSelect
                  label="Table Name"
                  value={selectedTable}
                  onChange={setSelectedTable}
                  options={availableTables}
                  placeholder="Select a table..."
                  width="350px"
                />

                {selectedTable && (
                  <div className="sap-form-group">
                    <label className="sap-form-label"></label>
                    <div className="sap-form-field">
                      <div style={{
                        background: 'var(--sap-content-bg)',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        border: '1px solid var(--sap-border)'
                      }}>
                        <strong>Selected:</strong> {availableTables.find(t => t.value === selectedTable)?.label}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sap-form-group">
                  <label className="sap-form-label"></label>
                  <div className="sap-form-field">
                    <div className="sap-button-group">
                      <SapButton onClick={handleLoadTable} type="primary" icon="▶️">
                        Execute
                      </SapButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Data Grid */
            <div>
              {/* Toolbar */}
              <div className="sap-table-toolbar" style={{ marginBottom: '0', borderRadius: '8px 8px 0 0' }}>
                <div className="sap-table-toolbar-left">
                  <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {availableTables.find(t => t.value === selectedTable)?.icon}
                    {availableTables.find(t => t.value === selectedTable)?.label}
                  </span>
                  <span className="sap-badge info" style={{ marginLeft: '12px' }}>
                    {processedData.length} entries
                  </span>
                </div>
                <div className="sap-table-toolbar-right">
                  <input
                    type="text"
                    className="sap-table-search"
                    placeholder="🔍 Quick search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: '200px' }}
                  />
                  <SapButton onClick={() => setShowFilterModal(true)} icon="🔧">
                    Filter
                  </SapButton>
                  <div style={{ position: 'relative' }}>
                    <SapButton
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      icon="📤"
                    >
                      Export ▼
                    </SapButton>
                    {showExportDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'white',
                        border: '1px solid var(--sap-border)',
                        borderRadius: '4px',
                        boxShadow: 'var(--sap-shadow-medium)',
                        zIndex: 100,
                        minWidth: '150px'
                      }}>
                        <div
                          onClick={() => {
                            handleExportCSV();
                            setShowExportDropdown(false);
                          }}
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--sap-highlight)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          📄 Export to CSV
                        </div>
                        <div
                          onClick={() => {
                            handleExportJSON();
                            setShowExportDropdown(false);
                          }}
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--sap-highlight)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          📋 Export to JSON
                        </div>
                      </div>
                    )}
                  </div>
                  <SapButton onClick={() => {
                    setIsTableLoaded(false);
                    setSelectedTable('');
                  }} icon="🔄">
                    Change Table
                  </SapButton>
                </div>
              </div>

              {/* Active Filters */}
              {Object.keys(filters).length > 0 && (
                <div style={{
                  background: 'var(--sap-highlight)',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  borderBottom: '1px solid var(--sap-border)'
                }}>
                  <span style={{ fontWeight: '600', fontSize: '12px' }}>Active Filters:</span>
                  {Object.entries(filters).map(([key, value]) => (
                    <span
                      key={key}
                      style={{
                        background: 'var(--sap-brand)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {columns.find(c => c.key === key)?.label}: "{value}"
                      <span
                        onClick={() => handleRemoveFilter(key)}
                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ✕
                      </span>
                    </span>
                  ))}
                  <SapButton
                    onClick={() => setFilters({})}
                    style={{ height: '24px', padding: '0 8px', fontSize: '11px' }}
                  >
                    Clear All
                  </SapButton>
                </div>
              )}

              {/* Data Table */}
              <div className="sap-table-wrapper" style={{ maxHeight: '450px' }}>
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                      {columns.map((col, index) => (
                        <th
                          key={index}
                          onClick={() => handleSort(col.key)}
                          style={{ width: col.width, cursor: 'pointer' }}
                        >
                          {col.label}
                          <span className="sort-icon" style={{ marginLeft: '6px' }}>
                            {getSortIcon(col.key)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          style={{ textAlign: 'center', padding: '40px' }}
                        >
                          <div style={{ color: 'var(--sap-text-secondary)' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                            No data found
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((row, rowIndex) => {
                        const actualIndex = (currentPage - 1) * rowsPerPage + rowIndex;
                        return (
                          <tr
                            key={rowIndex}
                            className={selectedRows.includes(actualIndex) ? 'selected' : ''}
                            onClick={() => handleRowClick(actualIndex)}
                            onDoubleClick={() => handleRowDoubleClick(row)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td style={{ textAlign: 'center', color: 'var(--sap-text-secondary)' }}>
                              {actualIndex + 1}
                            </td>
                            {columns.map((col, colIndex) => (
                              <td
                                key={colIndex}
                                style={{ textAlign: col.align || 'left' }}
                              >
                                {formatCellValue(row[col.key], col)}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer / Pagination */}
              <div className="sap-table-footer">
                <span>
                  Showing {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, processedData.length)} of {processedData.length} entries
                  {selectedRows.length > 0 && (
                    <span style={{ marginLeft: '16px', color: 'var(--sap-brand)' }}>
                      ({selectedRows.length} selected)
                    </span>
                  )}
                </span>
                <div className="sap-table-pagination">
                  <select
                    className="sap-select"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{ width: '80px', height: '28px' }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <button
                    className="sap-button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={{ height: '28px', padding: '0 8px' }}
                  >
                    ⏮️
                  </button>
                  <button
                    className="sap-button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{ height: '28px', padding: '0 8px' }}
                  >
                    ◀️
                  </button>
                  <span style={{ padding: '0 12px', minWidth: '100px', textAlign: 'center' }}>
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    className="sap-button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{ height: '28px', padding: '0 8px' }}
                  >
                    ▶️
                  </button>
                  <button
                    className="sap-button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{ height: '28px', padding: '0 8px' }}
                  >
                    ⏭️
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <SapModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="🔧 Add Filter"
        width="400px"
        footer={
          <>
            <SapButton onClick={() => setShowFilterModal(false)}>
              Cancel
            </SapButton>
            <SapButton onClick={handleAddFilter} type="primary">
              Apply Filter
            </SapButton>
          </>
        }
      >
        <div className="sap-form">
          <SapSelect
            label="Column"
            value={activeFilterColumn}
            onChange={setActiveFilterColumn}
            options={columns.map(col => ({ value: col.key, label: col.label }))}
            placeholder="Select column..."
          />
          <SapInput
            label="Filter Value"
            value={filterValue}
            onChange={setFilterValue}
            placeholder="Enter filter value..."
          />
        </div>
      </SapModal>

      {/* Detail Modal */}
      <SapModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="📋 Record Details"
        width="600px"
        footer={
          <SapButton onClick={() => setShowDetailModal(false)}>
            Close
          </SapButton>
        }
      >
        {selectedRecord && (
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            <table className="sap-table" style={{ fontSize: '13px' }}>
              <tbody>
                {Object.entries(selectedRecord).map(([key, value], index) => (
                  <tr key={index}>
                    <td style={{
                      fontWeight: '600',
                      background: 'var(--sap-content-bg)',
                      width: '150px'
                    }}>
                      {key}
                    </td>
                    <td>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value ?? '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SapModal>
    </div >
  );
};

export default DataBrowserScreen;