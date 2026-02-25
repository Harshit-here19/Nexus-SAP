// src/components/Screens/DataBrowserScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import SapButton from '../Common/SapButton';
import SapSelect from '../Common/SapSelect';
import SapInput from '../Common/SapInput';
import SapModal from '../Common/SapModal';
import { useTransaction } from '../../context/TransactionContext';
import { getAllData } from '../../utils/storage';

import { ENTERTAINMENT_CATEGORIES } from "./EntertainmentWishlistScreen";
import { getExpenseCategories } from "../../utils/storage"
import { NOTE_CATEGORIES } from "./Notes/NotesConstants"

import styles from "./DataBrowserScreen.module.css"

const isMobile = window.innerWidth <= 768;

const CATEGORY_MAP_ENTERTAINMENT = Object.fromEntries(
  ENTERTAINMENT_CATEGORIES.map(cat => [cat.value, cat])
);

const CATEGORY_MAP_EXPENSES = Object.fromEntries(
  getExpenseCategories().map(cat => [cat.value, cat])
);

const CATEGORY_MAP_NOTES = Object.fromEntries(
  NOTE_CATEGORIES.map(cat => [cat.value, cat])
);

// Define available tables
const availableTables = [
  { value: 'expenses', label: 'ZEXP - Expenses', icon: '💰' },
  { value: 'materials', label: 'MARA - Material Master', icon: '📦' },
  { value: 'entertainment_wishlist', label: 'ENTW - Entertainment Wishlist', icon: '🎬' },
  { value: 'notes', label: 'NOTE - Notes', icon: '📝' },
  { value: 'vendors', label: 'LFA1 - Vendor Master', icon: '🏭' },
  { value: 'plants', label: 'T001W - Plants', icon: '🏢' },
  { value: 'storageLocations', label: 'T001L - Storage Locations', icon: '📍' },
  { value: 'transactionHistory', label: 'CDHDR - Change History', icon: '📋' }
];

// Column definitions for each table
const tableColumns = {
  expenses: [
    { key: 'expenseNumber', label: 'Expense ID', width: '120px' },
    { key: 'date', label: '🗓️ Date', width: '120px' },
    { key: 'category', label: 'Category', width: '150px' },
    { key: 'description', label: 'Description', width: '200px' },
    { key: 'amount', label: 'Amount', width: '100px' },
    { key: 'paymentMethod', label: 'Payment', width: '100px' },
    { key: 'vendor', label: 'Vendor', width: '150px' },
  ],
  entertainment_wishlist: [
    { key: 'itemNumber', label: 'Item ID', width: '120px' },
    { key: 'title', label: 'Title', width: '220px' },
    { key: 'category', label: 'Category', width: '120px' },
    { key: 'priority', label: 'Priority', width: '100px' },
    { key: 'seasons', label: 'Season', width: '120px' },
    { key: 'platform', label: 'Platform', width: '140px' },
    { key: 'year', label: 'Year', width: '80px' },
    { key: 'genres', label: 'Genres', width: '100px' },
  ],
  notes: [
    { key: 'noteNumber', label: 'Note ID', width: '120px' },
    { key: 'title', label: 'Title', width: '220px' },
    { key: 'category', label: 'Category', width: '120px' },
    { key: 'summary', label: 'Summary', width: '300px' },
    { key: 'wordCount', label: 'Words', width: '100px' },
    { key: 'createdAt', label: 'Created On', width: '150px' }
  ],
  materials: [
    { key: 'materialNumber', label: 'Material', width: '120px' },
    { key: 'description', label: 'Description', width: '200px' },
    { key: 'materialType', label: 'Type', width: '80px' },
    { key: 'materialGroup', label: 'Mat. Group', width: '100px' },
    { key: 'baseUnit', label: 'Base UoM', width: '80px' },
    { key: 'plant', label: 'Plant', width: '80px' },
    { key: 'storageLocation', label: 'SLoc', width: '80px' },
    { key: 'salesPrice', label: 'Price', width: '100px' },
    { key: 'currency', label: 'Curr.', width: '60px' },
    { key: 'createdAt', label: 'Created On', width: '150px' }
  ],
  salesOrders: [
    { key: 'orderNumber', label: 'Sales Order', width: '120px' },
    { key: 'customer', label: 'Customer', width: '150px' },
    { key: 'orderDate', label: 'Order Date', width: '120px' },
    { key: 'netValue', label: 'Net Value', width: '120px' },
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
    let data = allData[selectedTable] || [];
    const cols = tableColumns[selectedTable] || [];

    if (selectedTable === 'entertainment_wishlist') {
      data = data.map(item => {
        const categoryObj = CATEGORY_MAP_ENTERTAINMENT[item.category];

        return {
          ...item,
          originalCategory: item.category,
          category: categoryObj?.label || item.category,
          categoryColor: hexToRGBA(categoryObj?.color, 0.08),
        };
      });
    }

    if (selectedTable === 'expenses') {
      data = data.map((item, index) => {
        // console.log(`Item ${index}:`, item.amount, typeof item.amount);
        const categoryObj = CATEGORY_MAP_EXPENSES[item.category];
        return {
          ...item,
          originalCategory: item.category, // preserve key
          categoryColor: hexToRGBA(categoryObj?.color, 0.08),
          date: new Date(item.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).replace(/(\w{3}) (\d{4})/, '$1, $2'),
          amount: item?.amount
            ? "₹ " + parseFloat(item.amount).toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : "₹ 0.0",
          category: categoryObj?.label || item.category
        }
      });
    }

    if(selectedTable ==='notes') {
      data = data.map((item, index) => {
        console.log(`Item ${index}:`, item.createdAt, typeof item.createdAt);
        const categoryObj = CATEGORY_MAP_NOTES[item.category];
        return {
          ...item,
          originalCategory: item.category, // preserve key
          categoryColor: hexToRGBA(categoryObj?.color, 0.08),
          createdAt: new Date(item.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).replace(/(\w{3}) (\d{4})/, '$1, $2'),
          category: categoryObj?.label || item.category
        }
      });
    }


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

    const key = column.key.toLowerCase();

    // 1️⃣ Skip formatting for ID / Number / Code fields
    if (
      key.includes('id') ||
      key.includes('number') ||
      key.includes('code') ||
      key.includes('category')
    ) {
      return String(value); // return as-is
    }

    // 3️⃣ Format numbers (right aligned)
    if (column.align === 'right' && !isNaN(value)) {
      return Number(value).toLocaleString();
    }

    // 4️⃣ Apply Title Case to normal text
    return String(value)
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div>
      {/* Header Panel */}
      <div className={styles.panel}>

        <div className={styles.panelHeader} style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
          <span>
            <span className={styles.panelHeaderIcon}>🔍</span>
            Data Browser - SE16
          </span>
          <span className={`${styles['sap-badge']} ${styles.info}`}>DISPLAY</span>
        </div>
        <div className={styles.panelContent}>
          {!isTableLoaded ? (
            /* Table Selection */
            <div>
              <div className={`${styles['sap-message-strip']} ${styles.info}`} style={{ marginBottom: '20px' }}>
                <span className={styles['sap-message-strip-icon']}>ℹ️</span>
                <span>Select a table to view its contents. Data is stored locally in your browser.</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'flex-end',
                  gap: '16px'
                }}
              >
                <div style={{ minWidth: '250px', flex: '1 1 250px' }}>
                  <SapSelect
                    label="Table Name"
                    value={selectedTable}
                    onChange={setSelectedTable}
                    options={availableTables}
                    placeholder="Select a table..."
                  />
                </div>

                {selectedTable && (
                  <div
                    style={{
                      background: 'var(--sap-content-bg)',
                      padding: '5px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--sap-border)',
                      minWidth: '200px',
                      flex: '1 1 200px'
                    }}
                  >
                    <strong>Selected:</strong>{' '}
                    {availableTables.find(t => t.value === selectedTable)?.label}
                  </div>
                )}

                <div style={{ flex: '0 0 auto' }}>
                  <SapButton
                    onClick={handleLoadTable}
                    type="primary"
                    icon="▶️"
                  >
                    Execute
                  </SapButton>
                </div>
              </div>
            </div>
          ) : (
            /* Data Grid */
            <div>
              {/* Toolbar */}
              <div className={styles["sap-table-toolbar"]} style={{ marginBottom: '0', borderRadius: '8px 8px 0 0' }}>
                <div className={styles["sap-table-toolbar-left"]}>
                  <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {availableTables.find(t => t.value === selectedTable)?.icon}
                    {availableTables.find(t => t.value === selectedTable)?.label}
                  </span>
                  <span className={`${styles['sap-badge']} ${styles.info}`} style={{ marginLeft: '12px' }}>
                    {processedData.length} entries
                  </span>
                </div>
                <div className={styles["sap-table-toolbar-right"]}>
                  <input
                    type="text"
                    className={styles["sap-table-search"]}
                    placeholder="🔍 Quick search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: isMobile ? "100%" : '200px' }}
                  />
                  <SapButton type='glass' onClick={() => setShowFilterModal(true)} icon="🔧">
                    Filter
                  </SapButton>
                  <div style={{ position: 'relative', width: isMobile ? "100%" : "" }}>
                    <SapButton
                      type='glass'
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      icon="📤"
                    >
                      Export ▼
                    </SapButton>
                    {showExportDropdown && (
                      <div className={styles['export-dropdown']}>
                        <div
                          className={styles['export-dropdown-item']}
                          onClick={() => {
                            handleExportCSV();
                            setShowExportDropdown(false);
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
                          className={styles['export-dropdown-item']}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--sap-highlight)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          📋 Export to JSON
                        </div>
                      </div>
                    )}
                  </div>
                  <SapButton type='glass' onClick={() => {
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
                  <span className={styles['active-filter-bar']}>Active Filters:</span>
                  {Object.entries(filters).map(([key, value]) => (
                    <span
                      key={key}
                      className={styles['filter-chip']}
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
              <div className={styles["sap-table-wrapper"]} style={{ maxHeight: '450px' }}>
                <table className={styles["sap-table"]}>
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
                          <span className={styles["sort-icon"]} style={{ marginLeft: '6px' }}>
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
                            className={selectedRows.includes(actualIndex) ? styles.selected : ''}
                            onClick={() => handleRowClick(actualIndex)}
                            onDoubleClick={() => handleRowDoubleClick(row)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: selectedRows.includes(actualIndex)
                                ? undefined
                                : row.categoryColor || undefined
                            }}
                          >
                            <td style={{ textAlign: 'center', color: 'var(--sap-text-secondary)' }}>
                              {actualIndex + 1}
                            </td>
                            {columns.map((col, colIndex) => (
                              <td
                                data-label={col.label}
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
              <div className={styles.panelFooter}>
                <span>
                  Showing {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, processedData.length)} of {processedData.length} entries
                  {selectedRows.length > 0 && (
                    <span style={{ marginLeft: '16px', color: 'var(--sap-brand)' }}>
                      ({selectedRows.length} selected)
                    </span>
                  )}
                </span>
                <div className={styles["sap-table-pagination"]}>
                  <select
                    className={styles["sap-select"]}
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
                    className={styles["sap-button"]}
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    style={{ height: '28px', padding: '0 8px' }}
                  >
                    ⏮️
                  </button>
                  <button
                    className={styles["sap-button"]}
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
                    className={styles["sap-button"]}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{ height: '28px', padding: '0 8px' }}
                  >
                    ▶️
                  </button>
                  <button
                    className={styles["sap-button"]}
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
                      {toTitleCase(key)}
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

// Helper Function
const toTitleCase = (text) => {
  return String(text)
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};

// Convert HEX to rgba with custom opacity
const hexToRGBA = (hex, alpha = 0.08) => {
  if (!hex) return undefined;

  let cleaned = hex.replace('#', '');

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map(c => c + c)
      .join('');
  }

  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};