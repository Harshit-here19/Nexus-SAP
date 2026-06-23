// src/components/Screens/Notes/NotesTableModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './NotesTableModal.module.css';
import SapModal from '../../Common/SapModal';

const NotesTableModal = ({
  isOpen,
  onClose,
  onInsert,
  onThemeChange,
  selectedTheme
}) => {
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [headers, setHeaders] = useState(Array(3).fill(''));
  const [cells, setCells] = useState(
    Array(3).fill(null).map(() => Array(3).fill(''))
  );
  const [activeTab, setActiveTab] = useState('size'); // 'size', 'headers', 'data', 'theme'

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTableRows(3);
      setTableCols(3);
      setHeaders(Array(3).fill(''));
      setCells(Array(3).fill(null).map(() => Array(3).fill('')));
      setActiveTab('size');
    }
  }, [isOpen]);

  // Update headers and cell widths when number of columns changes
  const handleColsChange = (val) => {
    const cols = Math.max(1, Math.min(10, parseInt(val) || 1));
    setTableCols(cols);

    setHeaders((prev) => {
      const newHeaders = [...prev];
      newHeaders.length = cols;
      return Array.from(newHeaders, (h) => h || '');
    });

    setCells((prev) =>
      prev.map((row) => {
        const safeRow = row || [];
        const newRow = [...safeRow];
        newRow.length = cols;
        return Array.from(newRow, (c) => c || '');
      })
    );
  };

  // Update rows when number of rows changes
  const handleRowsChange = (val) => {
    const rows = Math.max(1, Math.min(20, parseInt(val) || 1));
    setTableRows(rows);

    setCells((prev) => {
      const newCells = [...prev];

      if (rows > newCells.length) {
        while (newCells.length < rows) {
          newCells.push(Array(tableCols).fill(''));
        }
      } else {
        newCells.length = rows;
      }

      return newCells;
    });
  };

  const handleInsert = () => {
    let tableStr = '@table\n\n';

    tableStr += '@head\n';
    tableStr += headers
      .map(h => h || 'Header')
      .join(' || ');
    tableStr += '\n@/head\n\n';

    cells.forEach((row) => {
      tableStr += '@data\n';
      tableStr += row
        .map(c => c || '')
        .join(' || ');
      tableStr += '\n@/data\n';
    });

    tableStr += '\n@/table\n';

    onInsert(tableStr);
    onClose();
  };

  const handleQuickSize = (rows, cols) => {
    setTableRows(rows);
    setTableCols(cols);
    setHeaders(Array(cols).fill(''));
    setCells(Array(rows).fill(null).map(() => Array(cols).fill('')));
  };

  return (
    <SapModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      width="600px"
      footer={null}
    >
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>▦</div>
          <div className={styles.headerContent}>
            <h2 className={styles.headerTitle}>Insert Table</h2>
            <p className={styles.headerSubtitle}>
              Create a {tableRows}×{tableCols} table
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'size' ? styles.active : ''}`}
            onClick={() => setActiveTab('size')}
          >
            <span className={styles.tabIcon}>📐</span>
            <span className={styles.tabLabel}>Size</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'headers' ? styles.active : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            <span className={styles.tabIcon}>📝</span>
            <span className={styles.tabLabel}>Headers</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'data' ? styles.active : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <span className={styles.tabIcon}>📊</span>
            <span className={styles.tabLabel}>Data</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'theme' ? styles.active : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            <span className={styles.tabIcon}>🎨</span>
            <span className={styles.tabLabel}>Theme</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Size Tab */}
          {activeTab === 'size' && (
            <div className={styles.sizeTab}>
              {/* Quick Size Selection */}
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Quick Select</label>
                <div className={styles.quickSizes}>
                  {[
                    { rows: 2, cols: 2, label: '2×2' },
                    { rows: 3, cols: 3, label: '3×3' },
                    { rows: 4, cols: 4, label: '4×4' },
                    { rows: 5, cols: 3, label: '5×3' },
                    { rows: 3, cols: 5, label: '3×5' },
                    { rows: 6, cols: 4, label: '6×4' },
                  ].map((size) => (
                    <button
                      key={size.label}
                      className={`${styles.quickSizeBtn} ${tableRows === size.rows && tableCols === size.cols ? styles.selected : ''
                        }`}
                      onClick={() => handleQuickSize(size.rows, size.cols)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Size */}
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Custom Size</label>
                <div className={styles.sizeInputs}>
                  <div className={styles.sizeInputGroup}>
                    <label className={styles.inputLabel}>Rows</label>
                    <div className={styles.numberInput}>
                      <button
                        className={styles.numberBtn}
                        onClick={() => handleRowsChange(tableRows - 1)}
                        disabled={tableRows <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className={styles.numberField}
                        value={tableRows}
                        onChange={(e) => handleRowsChange(e.target.value)}
                        min="1"
                        max="20"
                      />
                      <button
                        className={styles.numberBtn}
                        onClick={() => handleRowsChange(tableRows + 1)}
                        disabled={tableRows >= 20}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className={styles.sizeDivider}>×</div>

                  <div className={styles.sizeInputGroup}>
                    <label className={styles.inputLabel}>Columns</label>
                    <div className={styles.numberInput}>
                      <button
                        className={styles.numberBtn}
                        onClick={() => handleColsChange(tableCols - 1)}
                        disabled={tableCols <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className={styles.numberField}
                        value={tableCols}
                        onChange={(e) => handleColsChange(e.target.value)}
                        min="1"
                        max="10"
                      />
                      <button
                        className={styles.numberBtn}
                        onClick={() => handleColsChange(tableCols + 1)}
                        disabled={tableCols >= 10}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Grid Preview */}
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Preview</label>
                <div className={styles.gridPreview}>
                  {Array(Math.min(tableRows, 6)).fill(null).map((_, rowIdx) => (
                    <div key={rowIdx} className={styles.gridRow}>
                      {Array(Math.min(tableCols, 8)).fill(null).map((_, colIdx) => (
                        <div
                          key={colIdx}
                          className={`${styles.gridCell} ${rowIdx === 0 ? styles.headerCell : ''}`}
                        />
                      ))}
                      {tableCols > 8 && <div className={styles.gridMore}>+{tableCols - 8}</div>}
                    </div>
                  ))}
                  {tableRows > 6 && (
                    <div className={styles.gridMoreRows}>+{tableRows - 6} more rows</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Headers Tab */}
          {activeTab === 'headers' && (
            <div className={styles.headersTab}>
              <div className={styles.section}>
                <label className={styles.sectionLabel}>
                  Column Headers
                  <span className={styles.sectionHint}>{tableCols} columns</span>
                </label>
                <div className={styles.headerInputs}>
                  {headers.map((h, idx) => (
                    <div key={idx} className={styles.headerInputGroup}>
                      <span className={styles.headerIndex}>{idx + 1}</span>
                      <input
                        type="text"
                        className={styles.headerInput}
                        value={h}
                        placeholder={`Header ${idx + 1}`}
                        onChange={(e) => setHeaders((prev) => {
                          const newH = [...prev];
                          newH[idx] = e.target.value;
                          return newH;
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Fill */}
              <div className={styles.quickFill}>
                <span className={styles.quickFillLabel}>Quick Fill:</span>
                <button
                  className={styles.quickFillBtn}
                  onClick={() => setHeaders(Array(tableCols).fill('').map((_, i) => `Column ${i + 1}`))}
                >
                  Column 1, 2, 3...
                </button>
                <button
                  className={styles.quickFillBtn}
                  onClick={() => setHeaders(Array(tableCols).fill('').map((_, i) => String.fromCharCode(65 + i)))}
                >
                  A, B, C...
                </button>
                <button
                  className={styles.quickFillBtn}
                  onClick={() => setHeaders(Array(tableCols).fill(''))}
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className={styles.dataTab}>
              <div className={styles.section}>
                <label className={styles.sectionLabel}>
                  Cell Values
                  <span className={styles.sectionHint}>{tableRows} rows × {tableCols} columns</span>
                </label>

                <div className={styles.dataTableWrapper}>
                  <div className={styles.dataTable}>
                    {/* Header Row */}
                    <div className={styles.dataRow}>
                      <div className={styles.rowIndex}>#</div>
                      {headers.map((h, idx) => (
                        <div key={idx} className={styles.dataHeaderCell}>
                          {h || `Col ${idx + 1}`}
                        </div>
                      ))}
                    </div>

                    {/* Data Rows */}
                    {cells.map((row, rIdx) => (
                      <div key={rIdx} className={styles.dataRow}>
                        <div className={styles.rowIndex}>{rIdx + 1}</div>
                        {row.map((cell, cIdx) => (
                          <input
                            key={cIdx}
                            type="text"
                            className={styles.dataCell}
                            value={cell}
                            placeholder={`R${rIdx + 1}C${cIdx + 1}`}
                            onChange={(e) => setCells((prev) => {
                              const newCells = prev.map(r => [...r]);
                              newCells[rIdx][cIdx] = e.target.value;
                              return newCells;
                            })}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Actions */}
              <div className={styles.dataActions}>
                <button
                  className={styles.dataActionBtn}
                  onClick={() => setCells(Array(tableRows).fill(null).map(() => Array(tableCols).fill('')))}
                >
                  <span>🗑️</span>
                  Clear All
                </button>
                <button
                  className={styles.dataActionBtn}
                  onClick={() => {
                    setCells(prev => prev.map((row, rIdx) =>
                      row.map((_, cIdx) => `R${rIdx + 1}C${cIdx + 1}`)
                    ));
                  }}
                >
                  <span>📋</span>
                  Fill Sample
                </button>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className={styles.themeTab}>
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Select Theme</label>
                <div className={styles.themeOptions}>
                  {['Nord Theme', 'Material', 'CyberPunk', 'ElevatedCard'].map((theme) => (
                    <button
                      key={theme}
                      className={`${styles.themeBtn} ${selectedTheme === theme ? styles.active : ''}`}
                      onClick={() => onThemeChange(theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className={styles.livePreview}>
          <div className={styles.previewLabel}>
            <span className={styles.previewIcon}>👁️</span>
            Live Preview
          </div>
          <div className={styles.previewTable}>
            <table>
              <thead>
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx}>{h || `Header ${idx + 1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cells.slice(0, 3).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell || '—'}</td>
                    ))}
                  </tr>
                ))}
                {cells.length > 3 && (
                  <tr className={styles.moreRow}>
                    <td colSpan={tableCols}>
                      +{cells.length - 3} more row{cells.length - 3 > 1 ? 's' : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.insertBtn} onClick={handleInsert}>
            <span className={styles.insertIcon}>▦</span>
            Insert Table
          </button>
        </div>
      </div>
    </SapModal>
  );
};

export default NotesTableModal;