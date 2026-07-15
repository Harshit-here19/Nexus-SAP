// src/components/Screens/Notes/NotesTableModal.jsx
import React, { useState, useEffect } from "react";
import styles from "./NotesTableModal.module.css";
import SapModal from "../../Common/SapModal";

const NotesTableModal = ({
  isOpen,
  onClose,
  onInsert,
  onThemeChange,
  selectedTheme,
}) => {
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [headers, setHeaders] = useState(Array(3).fill(""));
  const [cells, setCells] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill("")),
  );
  const [activeTab, setActiveTab] = useState("size");

  useEffect(() => {
    if (isOpen) {
      setTableRows(3);
      setTableCols(3);
      setHeaders(Array(3).fill(""));
      setCells(
        Array(3)
          .fill(null)
          .map(() => Array(3).fill("")),
      );
      setActiveTab("size");
    }
  }, [isOpen]);

  const handleColsChange = (val) => {
    const cols = Math.max(1, Math.min(10, parseInt(val) || 1));
    setTableCols(cols);

    setHeaders((prev) => {
      const newHeaders = [...prev];
      newHeaders.length = cols;
      return Array.from(newHeaders, (h) => h || "");
    });

    setCells((prev) =>
      prev.map((row) => {
        const safeRow = row || [];
        const newRow = [...safeRow];
        newRow.length = cols;
        return Array.from(newRow, (c) => c || "");
      }),
    );
  };

  const handleRowsChange = (val) => {
    const rows = Math.max(1, Math.min(20, parseInt(val) || 1));
    setTableRows(rows);

    setCells((prev) => {
      const newCells = [...prev];
      if (rows > newCells.length) {
        while (newCells.length < rows) {
          newCells.push(Array(tableCols).fill(""));
        }
      } else {
        newCells.length = rows;
      }
      return newCells;
    });
  };

  const handleInsert = () => {
    let tableStr = "@table\n\n";
    tableStr += "@head\n";
    tableStr += headers.map((h) => h || "Header").join(" || ");
    tableStr += "\n@/head\n\n";

    cells.forEach((row) => {
      tableStr += "@data\n";
      tableStr += row.map((c) => c || "").join(" || ");
      tableStr += "\n@/data\n";
    });

    tableStr += "\n@/table\n";
    onInsert(tableStr);
    onClose();
  };

  const handleQuickSize = (rows, cols) => {
    setTableRows(rows);
    setTableCols(cols);
    setHeaders(Array(cols).fill(""));
    setCells(
      Array(rows)
        .fill(null)
        .map(() => Array(cols).fill("")),
    );
  };

  return (
    <SapModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      width="540px" // Slightly slimmer standard footprint
      footer={null}
    >
      <div className={styles.container}>
        {/* Header Section */}
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
          {[
            { id: "size", label: "Size", icon: "📐" },
            { id: "headers", label: "Headers", icon: "📝" },
            { id: "data", label: "Data", icon: "📊" },
            { id: "theme", label: "Theme", icon: "🎨" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Tab Body */}
        <div className={styles.tabContent}>
          {/* Layout Configuration Panel */}
          {activeTab === "size" && (
            <div className={styles.sizeTab}>
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Quick Select</label>
                <div className={styles.quickSizes}>
                  {[
                    { rows: 2, cols: 2, label: "2×2" },
                    { rows: 3, cols: 3, label: "3×3" },
                    { rows: 4, cols: 4, label: "4×4" },
                    { rows: 5, cols: 3, label: "5×3" },
                    { rows: 3, cols: 5, label: "3×5" },
                    { rows: 6, cols: 4, label: "6×4" },
                  ].map((size) => (
                    <button
                      key={size.label}
                      className={`${styles.quickSizeBtn} ${tableRows === size.rows && tableCols === size.cols ? styles.selected : ""}`}
                      onClick={() => handleQuickSize(size.rows, size.cols)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <label className={styles.sectionLabel}>Custom Matrix</label>
                <div className={styles.sizeInputs}>
                  <div className={styles.sizeInputGroup}>
                    <span className={styles.inputLabel}>Rows</span>
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
                    <span className={styles.inputLabel}>Columns</span>
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

              <div className={`${styles.section} ${styles.previewSection}`}>
                <label className={styles.sectionLabel}>Blueprint Preview</label>
                <div className={styles.gridPreview}>
                  {Array(Math.min(tableRows, 5))
                    .fill(null)
                    .map((_, rowIdx) => (
                      <div key={rowIdx} className={styles.gridRow}>
                        {Array(Math.min(tableCols, 6))
                          .fill(null)
                          .map((_, colIdx) => (
                            <div
                              key={colIdx}
                              className={`${styles.gridCell} ${rowIdx === 0 ? styles.headerCell : ""}`}
                            />
                          ))}
                        {tableCols > 6 && (
                          <div className={styles.gridMore}>
                            +{tableCols - 6}
                          </div>
                        )}
                      </div>
                    ))}
                  {tableRows > 5 && (
                    <div className={styles.gridMoreRows}>
                      +{tableRows - 5} more rows
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Header Assignment Panel */}
          {activeTab === "headers" && (
            <div className={styles.headersTab}>
              <div className={styles.section}>
                <label className={styles.sectionLabel}>
                  Labels{" "}
                  <span className={styles.sectionHint}>
                    {tableCols} Columns
                  </span>
                </label>
                <div className={styles.headerInputs}>
                  {headers.map((h, idx) => (
                    <div key={idx} className={styles.headerInputGroup}>
                      <span className={styles.headerIndex}>{idx + 1}</span>
                      <input
                        type="text"
                        className={styles.headerInput}
                        value={h}
                        placeholder={`Column ${idx + 1}`}
                        onChange={(e) =>
                          setHeaders((prev) => {
                            const newH = [...prev];
                            newH[idx] = e.target.value;
                            return newH;
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.quickFill}>
                <button
                  className={styles.quickFillBtn}
                  onClick={() =>
                    setHeaders(
                      Array(tableCols)
                        .fill("")
                        .map((_, i) => `Col ${i + 1}`),
                    )
                  }
                >
                  1, 2, 3...
                </button>
                <button
                  className={styles.quickFillBtn}
                  onClick={() =>
                    setHeaders(
                      Array(tableCols)
                        .fill("")
                        .map((_, i) => String.fromCharCode(65 + i)),
                    )
                  }
                >
                  A, B, C...
                </button>
                <button
                  className={`${styles.quickFillBtn} ${styles.clear}`}
                  onClick={() => setHeaders(Array(tableCols).fill(""))}
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Data Inputs Panel */}
          {activeTab === "data" && (
            <div className={styles.dataTab}>
              <div className={styles.section}>
                <div className={styles.dataTableWrapper}>
                  <div className={styles.dataTable}>
                    <div className={styles.dataRow}>
                      <div className={styles.rowIndex}>#</div>
                      {headers.map((h, idx) => (
                        <div key={idx} className={styles.dataHeaderCell}>
                          {h || `Col ${idx + 1}`}
                        </div>
                      ))}
                    </div>

                    {cells.map((row, rIdx) => (
                      <div key={rIdx} className={styles.dataRow}>
                        <div className={styles.rowIndex}>{rIdx + 1}</div>
                        {row.map((cell, cIdx) => (
                          <input
                            key={cIdx}
                            type="text"
                            className={styles.dataCell}
                            value={cell}
                            placeholder={`R${rIdx + 1} C${cIdx + 1}`}
                            onChange={(e) =>
                              setCells((prev) => {
                                const newCells = prev.map((r) => [...r]);
                                newCells[rIdx][cIdx] = e.target.value;
                                return newCells;
                              })
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.dataActions}>
                <button
                  className={styles.dataActionBtn}
                  onClick={() =>
                    setCells((prev) =>
                      prev.map((row, rIdx) =>
                        row.map((_, cIdx) => `R${rIdx + 1}C${cIdx + 1}`),
                      ),
                    )
                  }
                >
                  📋 Auto Fill
                </button>
                <button
                  className={`${styles.dataActionBtn} ${styles.clear}`}
                  onClick={() =>
                    setCells(
                      Array(tableRows)
                        .fill(null)
                        .map(() => Array(tableCols).fill("")),
                    )
                  }
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}

          {/* Theme Setup Panel */}
          {activeTab === "theme" && (
            <div className={styles.themeTab}>
              <div className={styles.section}>
                <label className={styles.sectionLabel}>Selected Preset</label>
                <div className={styles.themeOptions}>
                  {["Nord", "Material", "CyberPunk", "ElevatedCard"].map(
                    (theme) => (
                      <button
                        key={theme}
                        className={`${styles.themeBtn} ${selectedTheme === theme ? styles.active : ""}`}
                        onClick={() => onThemeChange(theme)}
                      >
                        {theme}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.insertBtn} onClick={handleInsert}>
            <span>▦</span> Insert
          </button>
        </div>
      </div>
    </SapModal>
  );
};

export default NotesTableModal;
