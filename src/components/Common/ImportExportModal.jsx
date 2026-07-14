// src/components/Common/ImportExportModal.jsx
import { useState, useRef, useEffect } from "react";
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
  createSelectionBackup,
  restoreSelectionBackup,
} from "../../utils/fileSystem";
import {
  getAllData,
  saveAllData,
  getTableData,
  saveTableData,
} from "../../utils/storage";

import { useConfirm } from "../../context/ConfirmContext";
import { useAuth } from "../../context/AuthContext";

const ImportExportModal = ({ isOpen, onClose, onStatusMessage, tab }) => {
  const [activeTab, setActiveTab] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedTables, setSelectedTables] = useState([]);
  const [exportFormat, setExportFormat] = useState("json");
  const [selectedFile, setSelectedFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const fileInputRef = useRef(null);

  const { confirm } = useConfirm();
  const { user } = useAuth();

  const tables = [
    { value: "all", label: "All Data (Full Backup)" },
    { value: "entertainment_wishlist", label: "Wishlist Items" },
    { value: "expenses", label: "Expenses (KONV)" },
    { value: "materials", label: "Materials (MARA)" },
    { value: "notes", label: "Notes (NT)" },
    { value: "collections", label: "List Collections (LC)" },
    { value: "calendar_events", label: "Calendar Events" },
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
    notes: [
      { key: "noteNumber", label: "Note ID" },
      { key: "category", label: "Category" },
      { key: "title", label: "Title" },
      { key: "content", label: "Content" },
      { key: "summary", label: "Summary" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "tags", label: "Tags" },
      { key: "color", label: "Color" },
      { key: "isPinned", label: "Pinned" },
      { key: "isFavorite", label: "Favorite" },
      { key: "isLocked", label: "Locked" },
      { key: "password", label: "Password" },
      { key: "reminder", label: "Reminder" },
      { key: "dueDate", label: "Due Date" },
      { key: "attachments", label: "Attachments" },
      { key: "linkedNotes", label: "Linked Notes" },
      { key: "wordCount", label: "Words" },
      { key: "charCount", label: "Chars" },
      { key: "createdBy", label: "Created By" },
    ],
    expenses: [
      { key: "expenseNumber", label: "Expense ID" },
      { key: "date", label: "Date" },
      { key: "category", label: "Category" },
      { key: "description", label: "Description" },
      { key: "amount", label: "Amount" },
      { key: "currency", label: "Curr" },
      { key: "paymentMethod", label: "Payment Method" },
      { key: "vendor", label: "Vendor" },
      { key: "receiptNumber", label: "Receipt No" },
      { key: "notes", label: "Notes" },
      { key: "tags", label: "Tags" },
      { key: "isRecurring", label: "Recurring" },
      { key: "recurringFrequency", label: "Frequency" },
      { key: "status", label: "Status" },
      { key: "createdBy", label: "Created By" },
    ],
    entertainment_wishlist: [
      { key: "itemNumber", label: "Item Number" },
      { key: "category", label: "Category" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      { key: "year", label: "Year", align: "center" },
      { key: "status", label: "Status", align: "center" },
      { key: "priority", label: "Priority", align: "center" },
      { key: "rating", label: "Rating", align: "center" },
      { key: "genres", label: "Genres" },
      { key: "platform", label: "Platform" },
      { key: "imageUrl", label: "Image URL" },
      { key: "episodes", label: "Episodes", align: "right" },
      { key: "currentEpisode", label: "Curr. Episode", align: "right" },
      { key: "chapters", label: "Chapters", align: "right" },
      { key: "currentChapter", label: "Curr. Chapter", align: "right" },
      { key: "seasons", label: "Seasons", align: "right" },
      { key: "currentSeason", label: "Curr. Season", align: "right" },
      { key: "duration", label: "Duration" },
      { key: "studio", label: "Studio" },
      { key: "developer", label: "Developer" },
      { key: "director", label: "Director" },
      { key: "cast", label: "Cast" },
      { key: "notes", label: "Notes" },
      { key: "tags", label: "Tags" },
      { key: "isNsfw", label: "NSFW", align: "center" },
      { key: "createdBy", label: "Created By" },
    ],
    collections: [
      { key: "collectionNumber", label: "collection ID" },
      { key: "title", label: "Title" },
      {
        key: "items",
        label: "Items",
        formatter: (value) => value?.map((x) => x.name).join(", "),
      },
      { key: "createdAt", label: "Created At" },
      { key: "updatedAt", label: "Updated At" },
    ],
    calendar_events: [
      { key: "calendarNumber", label: "Calendar Number" },
      { key: "title", label: "Title" },
      { key: "date", label: "Date" },
      { key: "description", label: "Description" },
      { key: "createdBy", label: "Created By" },
      { key: "createdOn", label: "Created On" },
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

  const tableConfig = {
    notes: {
      duplicateField: "title",
      existingKey: "noteNumber",
    },
    expenses: {
      duplicateField: ["description", "amount", "date"],
      existingKey: "expenseNumber",
    },
    entertainment_wishlist: {
      duplicateField: "title",
      existingKey: "itemNumber",
    },
    materials: {
      duplicateField: "description",
      existingKey: "materialNumber",
    },
    collections: {
      duplicateField: "title",
      existingKey: "collectionNumber",
    },
    calendar_events: {
      duplicateField: ["title", "date"],
      existingKey: "calendarNumber",
    },
  };

  // Handle Export
  const handleExport = async () => {
    setIsProcessing(true);

    try {
      let result;
      const timestamp = new Date().toISOString().split("T")[0];

      if (selectedTable === "all") {
        if (selectedTables.length === 0) {
          onStatusMessage("Please select at least one table.", "warning");
          return;
        }

        result = await createSelectionBackup(selectedTables);
      } else if (exportFormat === "json") {
        const data = getTableData(selectedTable);

        result = exportToJSON(
          {
            version: "1.0",
            type: "table",
            table: selectedTable,
            createdAt: new Date().toISOString(),
            application: "SAP GUI Clone",
            data: data,
          },
          `${selectedTable}-${timestamp}.json`,
        );
      } else {
        const data = getTableData(selectedTable);

        const columns =
          tableColumns[selectedTable] ||
          Object.keys(data[0] || {}).map((key) => ({
            key,
            label: key,
          }));

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

        const json = result.data;

        // New single table export
        if (json.type === "table" && json.table && Array.isArray(json.data)) {
          setSelectedTable(json.table);

          setImportPreview({
            type: "json",
            filename: file.name,
            size: formatFileSize(file.size),
            data: json.data,
            detectedTable: json.table,
            recordCount: json.data.length,
          });

          return;
        }

        // Selection backup
        if (json.type === "selection") {
          setImportPreview({
            type: "json",
            filename: file.name,
            size: formatFileSize(file.size),
            backupType: "selection",
            tables: json.tables || [],
            data: json.data,
          });

          return;
        }

        // Full backup
        if (json.version && json.data && !Array.isArray(json)) {
          setImportPreview({
            type: "json",
            filename: file.name,
            size: formatFileSize(file.size),
            data: json,
            recordCount: "Full Backup",
          });

          return;
        }

        // Old JSON export without metadata

        const data = Array.isArray(json) ? json : json.data;
        setImportPreview({
          type: "json",
          filename: file.name,
          size: formatFileSize(file.size),
          data: data,
          recordCount: Array.isArray(data) ? data.length : 0,
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
    if (!selectedFile || !importPreview) {
      onStatusMessage("Please select a file first", "warning");

      return;
    }

    setIsProcessing(true);

    try {
      const importData = importPreview.data;

      // Full backup

      if (importData.version && importData.data && !Array.isArray(importData)) {
        await restoreBackup(selectedFile);

        onStatusMessage(
          "Full backup restored successfully. Please refresh the page.",
          "success",
        );

        return;
      }

      // Selection backup

      if (importPreview.backupType === "selection") {
        await restoreSelectionBackup(selectedFile);

        onStatusMessage("Selected tables restored successfully.", "success");

        return;
      }

      // Require table only when detection failed

      if (!selectedTable || selectedTable === "all") {
        onStatusMessage(
          "Could not detect table. Please select a target table.",
          "warning",
        );

        return;
      }

      const existingData = getTableData(selectedTable) || [];

      const newData = importData;

      if (!Array.isArray(newData) || !newData.length) {
        throw new Error("Imported file is empty.");
      }

      const config = tableConfig[selectedTable];

      if (!config) {
        throw new Error("Import configuration missing for this table.");
      }

      const existingKey = config.existingKey;

      const duplicateField = config.duplicateField;

      const makeDuplicateKey = (record) => {
        if (Array.isArray(duplicateField)) {
          return duplicateField
            .map((field) => String(record[field] ?? "").trim())
            .join("||");
        }

        return String(record[duplicateField] ?? "").trim();
      };

      const existingRecords = new Set(existingData.map(makeDuplicateKey));

      const processedData = [];

      let counter = existingData.length + 100000000;

      newData.forEach((record) => {
        if (existingRecords.has(makeDuplicateKey(record))) {
          return;
        }

        counter++;

        processedData.push({
          ...record,

          [existingKey]: `${selectedTable.toUpperCase()}${counter}`,

          importedAt: new Date().toISOString(),
        });
      });

      saveTableData(selectedTable, [...existingData, ...processedData]);

      onStatusMessage(
        `Imported ${processedData.length} new records to ${selectedTable}. Skipped ${
          newData.length - processedData.length
        } duplicates.`,

        "success",
      );

      setSelectedFile(null);

      setImportPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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

        const tableLength = userData[tableName].length;

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
            {selectedTable === "all" && (
              <div style={{ marginTop: 20 }}>
                <strong>Select tables</strong>

                {tables
                  .filter((t) => t.value !== "all")
                  .map((table) => (
                    <label
                      key={table.value}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 8,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTables((prev) => [...prev, table.value]);
                          } else {
                            setSelectedTables((prev) =>
                              prev.filter((x) => x !== table.value),
                            );
                          }
                        }}
                      />

                      {table.label}
                    </label>
                  ))}
              </div>
            )}

            {selectedTable && selectedTable !== "all" && (
              <div className="sap-form-group">
                <label className="sap-form-label">Format</label>
                <div className="sap-form-field">
                  <div style={{ display: "flex", gap: "16px", width:"450px" }}>
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
            <SapButton type="close" onClick={handleClose}>
              Cancel
            </SapButton>
            <SapButton
              onClick={handleExport}
              type="neo-close"
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
              Importing data will automatically detect the target table when
              possible. For older files, you can manually select the target
              table.
            </span>
          </div>

          <div className="sap-form">
            {importPreview &&
              !importPreview.detectedTable &&
              importPreview.backupType !== "selection" &&
              importPreview.recordCount !== "Full Backup" && (
                <SapSelect
                  label="Target Table"
                  value={selectedTable}
                  onChange={(val) => {
                    setSelectedTable(val);
                  }}
                  options={tables.filter((t) => t.value !== "all")}
                  placeholder="Select where to import..."
                  width="100%"
                />
              )}

            <div className="sap-form-field" style={{ alignSelf: "center" }}>
              <label
                style={{
                  display: "flex",
                  flexDirection: importPreview ? "row" : "column",
                  alignItems: "center",
                  justifyContent: importPreview ? "flex-start" : "center",
                  gap: importPreview ? "12px" : "0",
                  padding: importPreview ? "12px 16px" : "24px 16px",
                  border: "2px dashed var(--sap-border-dark)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "center",
                  color: "#000",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  backgroundColor: "transparent",
                  transition: "all 0.2s ease",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const mockEvent = {
                      target: { files: e.dataTransfer.files },
                    };
                    handleFileSelect(mockEvent);
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                    clip: "rect(0,0,0,0)",
                  }}
                  // onLoad={console.log(importPreview)}
                />

                <div
                  style={{
                    fontSize: importPreview ? "24px" : "36px",
                    filter: "grayscale(1)",
                  }}
                >
                  📄
                </div>

                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {importPreview ? "Change file" : "Click to upload"}
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "500",
                      color: "#64748b",
                      marginTop: "4px",
                    }}
                  >
                    {importPreview
                      ? importPreview.filename
                      : "or drag & drop a file"}
                  </div>
                </div>

                {importPreview && (
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: "12px",
                      color: "var(--sap-text-secondary)",
                      textAlign: "right",
                    }}
                  >
                    <div>{importPreview.size}</div>
                    {importPreview.record && (
                      <div>{importPreview.recordCount} records</div>
                    )}
                  </div>
                )}
              </label>
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
                  {importPreview.detectedTable && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "8px",
                        background: "var(--sap-success-background)",
                        borderRadius: "4px",
                        fontSize: "13px",
                      }}
                    >
                      ✅ Detected Table:
                      <strong style={{ marginLeft: "5px" }}>
                        {tables.find(
                          (t) => t.value === importPreview.detectedTable,
                        )?.label || importPreview.detectedTable}
                      </strong>
                    </div>
                  )}

                  {importPreview.recordCount && (
                    <div>
                      <span style={{ color: "var(--sap-text-secondary)" }}>
                        Records:{" "}
                      </span>
                      <strong>{importPreview.recordCount}</strong>
                    </div>
                  )}

                  {importPreview.tables && (
                    <div>
                      <span style={{ color: "var(--sap-text-secondary)" }}>
                        Tables:{" "}
                      </span>
                      <strong>{importPreview.tables?.join(", ")}</strong>
                    </div>
                  )}
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
            <SapButton type="close" onClick={handleClose}>
              Cancel
            </SapButton>
            <SapButton
              onClick={handleImport}
              type="neo-close"
              // disabled={!importPreview || !selectedTable || isProcessing}
              disabled={
                !importPreview ||
                isProcessing ||
                (!selectedTable && importPreview?.backupType !== "selection")
              }
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
                Download a complete backup of your data
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
                type="neo-active"
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
                type="neo-active"
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
            <SapButton type="close" onClick={handleClose}>
              Close
            </SapButton>
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
            <SapButton type="close" onClick={handleClose}>
              Cancel
            </SapButton>
            <SapButton
              onClick={() => handleErase(selectedTable)}
              type="neo-danger"
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
