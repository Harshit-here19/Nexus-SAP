// src/components/Common/ImportExportModal.jsx
import { useState, useRef } from "react";
import SapModal from "./SapModal";
import SapButton from "./SapButton";
import SapSelect from "./SapSelect";
import {
  exportToJSON,
  importFromJSON,
  exportToCSV,
  importFromCSV,
  createBackup,
  restoreBackup,
  formatFileSize,
  validateFileType,
} from "../../utils/fileSystem";
import {
  getAllData,
  saveAllData,
  getTableData,
  saveTableData,
} from "../../utils/storage";

import { useConfirm } from "../../context/ConfirmContext";
import { useAuth } from "../../context/AuthContext";

const ImportExportModal = ({ isOpen, onClose, onStatusMessage }) => {
  const [activeTab, setActiveTab] = useState("export");
  const [selectedTable, setSelectedTable] = useState("");
  const [exportFormat, setExportFormat] = useState("json");
  const [selectedFile, setSelectedFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

  const confirm = useConfirm();
  const { user } = useAuth();

  const tables = [
    { value: "all", label: "All Data (Full Backup)" },
    { value: "entertainment_wishlist", label: "Wishlist Items" },
    { value: "materials", label: "Materials (MARA)" },
    { value: "expenses", label: "Expenses (KONV)" },
    { value: "notes", label: "Notes (NT)" },
    { value: "customers", label: "Customers (KNA1)" },
    { value: "vendors", label: "Vendors (LFA1)" },
    { value: "plants", label: "Plants (T001W)" },
    { value: "storageLocations", label: "Storage Locations (T001L)" },
  ];

  const tableColumns = {
    materials: [
      { key: "materialNumber", label: "Material Number" },
      { key: "description", label: "Description" },
      { key: "materialType", label: "Material Type" },
      { key: "materialGroup", label: "Material Group" },
      { key: "baseUnit", label: "Base Unit" },
      { key: "plant", label: "Plant" },
      { key: "storageLocation", label: "Storage Location" },
      { key: "salesPrice", label: "Sales Price" },
      { key: "currency", label: "Currency" },
    ],
    plants: [
      { key: "plantCode", label: "Plant Code" },
      { key: "plantName", label: "Plant Name" },
      { key: "city", label: "City" },
    ],
    storageLocations: [
      { key: "sloc", label: "Storage Location" },
      { key: "name", label: "Name" },
      { key: "plantCode", label: "Plant Code" },
    ],
  };

  // Handle Export
  const handleExport = () => {
    setIsProcessing(true);

    try {
      let result;
      const timestamp = new Date().toISOString().split("T")[0];

      if (selectedTable === "all") {
        // Full backup
        result = createBackup();
      } else if (exportFormat === "json") {
        // Export single table as JSON
        const data = getTableData(selectedTable);
        result = exportToJSON(data, `${selectedTable}-${timestamp}.json`);
      } else {
        // Export as CSV
        const data = getTableData(selectedTable);
        const columns =
          tableColumns[selectedTable] ||
          Object.keys(data[0] || {}).map((key) => ({ key, label: key }));
        result = exportToCSV(
          data,
          columns,
          `${selectedTable}-${timestamp}.csv`,
        );
      }

      if (result.success) {
        onStatusMessage(result.message, "success");
        onClose();
      } else {
        onStatusMessage(result.message, "error");
      }
    } catch (error) {
      onStatusMessage(`Export failed: ${error.message}`, "error");
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

    const extension = file.name.split(".").pop().toLowerCase();

    try {
      if (extension === "json") {
        const result = await importFromJSON(file);
        setImportPreview({
          type: "json",
          filename: file.name,
          size: formatFileSize(file.size),
          data: result.data,
          recordCount: Array.isArray(result.data)
            ? result.data.length
            : result.data.data
              ? "Full Backup"
              : Object.keys(result.data).length,
        });
      } else if (extension === "csv") {
        const columns = tableColumns[selectedTable] || [];
        const result = await importFromCSV(file, columns);
        setImportPreview({
          type: "csv",
          filename: file.name,
          size: formatFileSize(file.size),
          data: result.data,
          headers: result.headers,
          recordCount: result.data.length,
        });
      } else {
        onStatusMessage(
          "Unsupported file type. Please use JSON or CSV.",
          "error",
        );
      }
    } catch (error) {
      onStatusMessage(error.message, "error");
      setSelectedFile(null);
    }
  };

  // Handle Import
  const handleImport = async () => {
    // 1️⃣ Check if a file is selected and preview exists
    if (!selectedFile || !importPreview) {
      onStatusMessage("Please select a file first", "warning");
      return;
    }
  
    setIsProcessing(true);
  
    try {
      const importData = importPreview.data;
  
      // 2️⃣ Full backup file
      if (importData.version && importData.data) {
        await restoreBackup(selectedFile);
        onStatusMessage(
          "Full backup restored successfully. Please refresh the page.",
          "success"
        );
        return;
      }
  
      // 3️⃣ Ensure a target table is selected
      if (!selectedTable || selectedTable === "all") {
        onStatusMessage("Please select a target table for import", "warning");
        return;
      }
  
      const existingData = getTableData(selectedTable);
      const newData = importData;
  
      // 4️⃣ If table has existing data, validate structure
      if (existingData.length > 0) {
        const existingKey = Object.keys(existingData[0])[0];
        const newKey = Object.keys(newData[0])[0];
  
        if (existingKey !== newKey) {
          throw new Error("The imported file structure does not match the table.");
        }
  
        // 5️⃣ Prepare ID sequence and find missing numbers
        const numbers = existingData
          .map((row) => {
            const value = Object.values(row)[0] || "";
            const prefix = value.slice(0, value.length - 9);
            const numericPart = value.replace(/^\D+/, "");
            return { prefix, number: parseInt(numericPart, 10) };
          })
          .filter((n) => !isNaN(n.number));
  
        const existingNumbers = numbers.map((n) => n.number);
        const prefix = numbers[0]?.prefix || "";
  
        // Find missing numbers in sequence
        const minNumber = Math.min(...existingNumbers);
        const maxNumber = Math.max(...existingNumbers);
        const missingNumbers = [];
        for (let i = minNumber; i <= maxNumber; i++) {
          if (!existingNumbers.includes(i)) missingNumbers.push(i);
        }
  
        const existingTitles = new Set(existingData.map((r) => r.title));
  
        // 6️⃣ Process imported records, skip duplicates by title
        const processedData = [];
        let nextNumber = maxNumber;
  
        newData
          .filter((record) => !existingTitles.has(record.title))
          .forEach((record) => {
            // Use a missing number first if available
            const numberToUse = missingNumbers.length
              ? missingNumbers.shift()
              : ++nextNumber;
  
            const numberPart = String(numberToUse).padStart(9, "0");
  
            processedData.push({
              ...record,
              [existingKey]: prefix + numberPart,
              importedAt: new Date().toISOString(),
            });
          });
  
        // 7️⃣ Merge new data
        const mergedData = [...existingData, ...processedData];
        saveTableData(selectedTable, mergedData);
  
        onStatusMessage(
          `Imported ${processedData.length} new records to ${selectedTable}. Skipped ${
            newData.length - processedData.length
          } duplicates.`,
          "success"
        );
      } else {
        // 8️⃣ If table is empty, just save new data
        const existingKey = Object.keys(newData[0])[0];
        let nextNumber = 100000000;
        const processedData = newData.map((record) => {
          nextNumber += 1;
          const numberPart = String(nextNumber).padStart(9, "0");
          return {
            ...record,
            [existingKey]: numberPart,
            importedAt: new Date().toISOString(),
          };
        });
  
        saveTableData(selectedTable, processedData);
        onStatusMessage(
          `Imported ${processedData.length} records to ${selectedTable}`,
          "success"
        );
      }
  
      // 9️⃣ Reset state and clear file input
      setSelectedFile(null);
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } catch (error) {
      onStatusMessage(`Import failed: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedFile(null);
    setImportPreview(null);
    setSelectedTable("");
    setExportFormat("json");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  // Erase all the Table Data
  const handleErase = async (tableName) => {
    setIsProcessing(true);
    // 1. Read the stored data
    try {
      const userKey = `sap_user_data_${user.userId}`;
      const rawData = localStorage.getItem(userKey);

      const confirmed = await confirm(
        "Do you want to proceed with the Erase ?",
        "danger",
      );

      if (rawData && confirmed) {
        // 2. Parse it into an object
        const userData = JSON.parse(rawData);

        const tableLength = userData[tableName].length

        // 3. Delete the 'Selected' key
        delete userData[tableName];

        // 4. Save it back to localStorage
        localStorage.setItem(userKey, JSON.stringify(userData));

        onStatusMessage(
          `Erased ${tableLength} records of ${selectedTable}`,
          "success",
        );
      } else {
        onStatusMessage("The Selected Table is Empty", "warning");
        setIsProcessing(false);
        return;
      }
      onClose();
    } catch (error) {
      onStatusMessage(`Import failed: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SapModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={activeTab === "export" ? handleExport : handleImport}
      title="📁 Import / Export Data"
      width="650px"
    >
      {/* Tab Headers */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--sap-border)",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("export")}
          style={{
            padding: "12px 24px",
            border: "none",
            background:
              activeTab === "export" ? "var(--sap-brand)" : "transparent",
            color: activeTab === "export" ? "white" : "var(--sap-text-primary)",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: "4px 4px 0 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📤 Export
        </button>
        <button
          onClick={() => setActiveTab("import")}
          style={{
            padding: "12px 24px",
            border: "none",
            background:
              activeTab === "import" ? "var(--sap-brand)" : "transparent",
            color: activeTab === "import" ? "white" : "var(--sap-text-primary)",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: "4px 4px 0 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📥 Import
        </button>
        <button
          onClick={() => setActiveTab("backup")}
          style={{
            padding: "12px 24px",
            border: "none",
            background:
              activeTab === "backup" ? "var(--sap-brand)" : "transparent",
            color: activeTab === "backup" ? "white" : "var(--sap-text-primary)",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: "4px 4px 0 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          💾 Backup
        </button>
        <button
          onClick={() => setActiveTab("erase")}
          style={{
            padding: "12px 24px",
            border: "none",
            background:
              activeTab === "erase" ? "var(--sap-brand)" : "transparent",
            color: activeTab === "erase" ? "white" : "var(--sap-text-primary)",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: "4px 4px 0 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🧹 Erase the Data
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === "export" && (
        <div>
          <div
            className="sap-message-strip info"
            style={{ marginBottom: "20px" }}
          >
            <span className="sap-message-strip-icon">ℹ️</span>
            <span>
              Export your data to a file that can be saved and shared.
            </span>
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

            {selectedTable && selectedTable !== "all" && (
              <div className="sap-form-group">
                <label className="sap-form-label">Format</label>
                <div className="sap-form-field">
                  <div style={{ display: "flex", gap: "16px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="format"
                        value="json"
                        checked={exportFormat === "json"}
                        onChange={() => setExportFormat("json")}
                        style={{ accentColor: "var(--sap-brand)" }}
                      />
                      JSON (Recommended)
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={exportFormat === "csv"}
                        onChange={() => setExportFormat("csv")}
                        style={{ accentColor: "var(--sap-brand)" }}
                      />
                      CSV (Excel compatible)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {selectedTable && (
              <div
                style={{
                  background: "var(--sap-content-bg)",
                  padding: "16px",
                  borderRadius: "8px",
                  marginTop: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>Export Preview</span>
                  <span className="sap-badge info">
                    {selectedTable === "all"
                      ? "Full Backup"
                      : `${getTableData(selectedTable).length} records`}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--sap-text-secondary)",
                  }}
                >
                  {selectedTable === "all"
                    ? "All application data will be exported including materials, orders, and settings."
                    : `Table: ${tables.find((t) => t.value === selectedTable)?.label}`}
                </div>
              </div>
            )}          
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <SapButton type="close" onClick={handleClose}>Cancel</SapButton>
            <SapButton
              onClick={handleExport}
              type="primary"
              disabled={!selectedTable || isProcessing}
              icon={isProcessing ? "⏳" : "📤"}
            >
              {isProcessing ? "Exporting..." : "Export"}
            </SapButton>
            
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === "import" && (
        <div>
          <div
            className="sap-message-strip warning"
            style={{ marginBottom: "20px" }}
          >
            <span className="sap-message-strip-icon">⚠️</span>
            <span>
              Importing data will add records to existing data. Duplicates may
              occur.
            </span>
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
              options={tables.filter((t) => t.value !== "all")}
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
                    padding: "8px",
                    border: "1px dashed var(--sap-border-dark)",
                    borderRadius: "4px",
                    width: "100%",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>

            {importPreview && (
              <div
                style={{
                  background: "var(--sap-content-bg)",
                  padding: "16px",
                  borderRadius: "8px",
                  marginTop: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>
                    📄 {importPreview.filename}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--sap-text-secondary)",
                    }}
                  >
                    {importPreview.size}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--sap-text-secondary)" }}>
                      Type:{" "}
                    </span>
                    <strong>{importPreview.type.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--sap-text-secondary)" }}>
                      Records:{" "}
                    </span>
                    <strong>{importPreview.recordCount}</strong>
                  </div>
                </div>

                {importPreview.type === "csv" && importPreview.headers && (
                  <div style={{ marginTop: "12px" }}>
                    <span
                      style={{
                        color: "var(--sap-text-secondary)",
                        fontSize: "12px",
                      }}
                    >
                      Columns: {importPreview.headers.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <SapButton type="close" onClick={handleClose}>Cancel</SapButton>
            <SapButton
              onClick={handleImport}
              type="primary"
              disabled={!importPreview || !selectedTable || isProcessing}
              icon={isProcessing ? "⏳" : "📥"}
            >
              {isProcessing ? "Importing..." : "Import"}
            </SapButton>
            </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === "backup" && (
        <div>
          <div
            className="sap-message-strip info"
            style={{ marginBottom: "20px" }}
          >
            <span className="sap-message-strip-icon">💡</span>
            <span>
              Create a complete backup of all your data or restore from a
              previous backup.
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Create Backup */}
            <div
              style={{
                background: "var(--sap-content-bg)",
                padding: "24px",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px solid var(--sap-border)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>💾</div>
              <h4 style={{ marginBottom: "8px" }}>Create Backup</h4>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--sap-text-secondary)",
                  marginBottom: "16px",
                }}
              >
                Download a complete backup of all your data
              </p>
              <SapButton
                onClick={() => {
                  const result = createBackup();
                  if (result.success) {
                    onStatusMessage("Backup created successfully", "success");
                  } else {
                    onStatusMessage(result.message, "error");
                  }
                }}
                type="primary"
                icon="📥"
              >
                Create Backup
              </SapButton>
            </div>

            {/* Restore Backup */}
            <div
              style={{
                background: "var(--sap-content-bg)",
                padding: "24px",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px solid var(--sap-border)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📂</div>
              <h4 style={{ marginBottom: "8px" }}>Restore Backup</h4>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--sap-text-secondary)",
                  marginBottom: "16px",
                }}
              >
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
                      onStatusMessage(result.message, "success");
                      onClose();
                      // Suggest page refresh
                      const confirmed = await confirm(
                        "Backup restored! Refresh the page to see changes?",
                        "success",
                      );
                      if (confirmed) {
                        window.location.reload();
                      }
                    } catch (error) {
                      onStatusMessage(error.message, "error");
                    }
                  }
                }}
                style={{ display: "none" }}
                id="restore-backup-input"
              />
              <SapButton
                onClick={() =>
                  document.getElementById("restore-backup-input").click()
                }
                icon="📤"
              >
                Select Backup File
              </SapButton>
            </div>
          </div>

          <div
            className="sap-message-strip warning"
            style={{ marginTop: "20px" }}
          >
            <span className="sap-message-strip-icon">⚠️</span>
            <span>
              <strong>Warning:</strong> Restoring a backup will overwrite all
              existing data. Make sure to create a backup first if needed.
            </span>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <SapButton type="close" onClick={handleClose}>Close</SapButton>
          </div>
        </div>
      )}

      {/* Erase Tab */}
      {activeTab === "erase" && (
        <div>
          <div
            className="sap-message-strip warning"
            style={{ marginBottom: "20px" }}
          >
            <span className="sap-message-strip-icon">⚠️</span>
            <span>All of your Data from Selected table will be Deleted.</span>
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
              options={tables.filter((t) => t.value !== "all")}
              placeholder="Select the Table you want to Erase..."
              width="100%"
            />
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <SapButton type="close" onClick={handleClose}>Cancel</SapButton>
            <SapButton
              onClick={() => handleErase(selectedTable)}
              type="primary"
              disabled={!selectedTable || isProcessing}
              icon={isProcessing ? "⏳" : "🧹"}
            >
              {isProcessing ? "Erasing..." : "Erase"}
            </SapButton>
          </div>
        </div>
      )}

    </SapModal>
  );
};

export default ImportExportModal;
