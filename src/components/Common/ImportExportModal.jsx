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
  idbGetItem,
  idbSetItem,
  getImageBlob,
  saveImageBlob,
  deleteImageBlob,
  imageBlobToBase64,
  base64ToImageBlob,
} from "../../utils/storage";
import {
  exportFullBackupZip,
  restoreFullBackupZip,
} from "../../utils/zipBackup";

import { useConfirm } from "../../context/ConfirmContext";
import { useAuth } from "../../context/AuthContext";

const ImportExportModal = ({ isOpen, onClose, onStatusMessage, tab }) => {
  const [activeTab, setActiveTab] = useState("");
  const [selectedTable, setSelectedTable] = useState("all");
  const [selectedTables, setSelectedTables] = useState([
    "entertainment_wishlist",
    "notes",
    "expenses",
    "collections",
  ]);
  const [exportFormat, setExportFormat] = useState("json");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [importPreviews, setImportPreviews] = useState([]);
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
    { value: "entertainment_wishlist", label: "Entertainment Wishlist" },
    { value: "expenses", label: "Expenses (KONV)" },
    { value: "materials", label: "Materials (MARA)" },
    { value: "notes", label: "Notes (NT)" },
    { value: "collections", label: "List Collections (LC)" },
    { value: "calendar_events", label: "Calendar Events" },
    // { value: "customers", label: "Customers (KNA1)" },
    // { value: "vendors", label: "Vendors (LFA1)" },
    // { value: "plants", label: "Plants (T001W)" },
    // { value: "storageLocations", label: "Storage Locations (T001L)" },
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
      prefix: "NT",
    },
    expenses: {
      duplicateField: ["description", "amount", "date"],
      existingKey: "expenseNumber",
      prefix: "EXP",
    },
    entertainment_wishlist: {
      duplicateField: "title",
      existingKey: "itemNumber",
      prefix: "WS",
    },
    materials: {
      duplicateField: "description",
      existingKey: "materialNumber",
      prefix: "MM",
    },
    collections: {
      duplicateField: "title",
      existingKey: "collectionNumber",
      prefix: "LC",
    },
    calendar_events: {
      duplicateField: ["title", "date"],
      existingKey: "calendarNumber",
      prefix: "CA",
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

        // ==============================
        // ZIP EXPORT FOR MULTIPLE TABLES
        // If wishlist is included export as ZIP
        // ==============================

        if (selectedTables.includes("entertainment_wishlist")) {
          await exportFullBackupZip({
            userId: user.userId,
            tables: selectedTables,
            getTableData,
          });

          onStatusMessage("ZIP backup exported successfully", "success");

          onClose();
          return;
        }

        // Existing multi table export logic continues
        for (const table of selectedTables) {
          let data = getTableData(table);

          if (table === "collection") {
            data = data.filter((item) => item.id !== "system_collection");
          }

          const columns =
            tableColumns[table] ||
            Object.keys(data[0] || {}).map((key) => ({
              key,
              label: key,
            }));

          if (exportFormat === "json") {
            exportToJSON(
              {
                version: "1.0",
                type: "table",
                table,
                createdAt: new Date().toISOString(),
                application: "SAP GUI Clone",
                data,
              },
              `${table}-${timestamp}.json`,
            );
          } else {
            exportToCSV(data, columns, `${table}-${timestamp}.csv`);
          }
        }

        onStatusMessage(
          `${selectedTables.length} table(s) exported successfully.`,
          "success",
        );

        onClose();
        return;
      } else if (exportFormat === "json") {
        let data = getTableData(selectedTable);

        if (selectedTable === "collection") {
          data = data.filter((item) => item.id !== "system_collection");
        }

        let exportPayload = {
          version: "1.0",
          type: "table",
          table: selectedTable,
          createdAt: new Date().toISOString(),
          application: "SAP GUI Clone",
          data: data,
        };

        // Only wishlist has images
        if (selectedTable === "entertainment_wishlist") {
          const images = [];

          for (const item of data) {
            if (!item.imageId) continue;

            const blob = await getImageBlob(user.userId, item.imageId);

            if (!blob) continue;

            images.push({
              id: item.imageId,
              base64: await imageBlobToBase64(blob),
            });
          }

          exportPayload.images = images;
        }

        result = exportToJSON(
          exportPayload,
          `${selectedTable}-${timestamp}.json`,
        );
      } else {
        let data = getTableData(selectedTable);

        if (selectedTable === "collection") {
          data = data.filter((item) => item.id !== "system_collection");
        }

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
    const files = [...e.target.files];

    if (!files.length) return;

    setSelectedFiles(files);

    const previews = [];

    try {
      for (const file of files) {
        const extension = file.name.split(".").pop().toLowerCase();

        if (extension === "zip") {
          previews.push({
            file,
            type: "zip",
            filename: file.name,
            size: formatFileSize(file.size),
            recordCount: "ZIP Backup",
            backupType: "zip",
          });

          continue;
        }

        if (extension === "json") {
          const result = await importFromJSON(file);

          const json = result.data;

          // Table Export
          if (json.type === "table" && json.table && Array.isArray(json.data)) {
            previews.push({
              file,
              type: "json",
              filename: file.name,
              size: formatFileSize(file.size),
              data: json.data,
              images: json.images || [],
              detectedTable: json.table,
              recordCount: json.data.length,
            });

            continue;
          }

          // Selection Backup
          if (json.type === "selection") {
            previews.push({
              file,
              type: "json",
              filename: file.name,
              size: formatFileSize(file.size),
              backupType: "selection",
              tables: json.tables || [],
              data: json.data,
            });

            continue;
          }

          // Full Backup
          if (json.version && json.data && !Array.isArray(json)) {
            previews.push({
              file,
              type: "json",
              filename: file.name,
              size: formatFileSize(file.size),
              data: json,
              recordCount: "Full Backup",
            });

            continue;
          }

          const data = Array.isArray(json) ? json : json.data;

          previews.push({
            file,
            type: "json",
            filename: file.name,
            size: formatFileSize(file.size),
            data,
            recordCount: data.length,
          });
        } else if (extension === "csv") {
          const columns = tableColumns[selectedTable] || [];

          const result = await importFromCSV(file, columns);

          previews.push({
            file,
            type: "csv",
            filename: file.name,
            size: formatFileSize(file.size),
            data: result.data,
            headers: result.headers,
            recordCount: result.data.length,
          });
        }
      }

      setImportPreviews(previews);
    } catch (err) {
      onStatusMessage(err.message, "error");
    }
  };

  // Handle Import
  const handleImport = async () => {
    if (!selectedFiles.length || !importPreviews.length) {
      onStatusMessage("Please select a file first", "warning");

      return;
    }

    setIsProcessing(true);

    try {
      for (const preview of importPreviews) {
        const tableName = preview.detectedTable || selectedTable;
        const importData = preview.data;
        const importImages = preview?.images || [];

        // Full backup
        if (preview.backupType === "zip") {
          await restoreFullBackupZip({
            userId: user.userId,
            file: preview.file,
            saveTableData,
            saveImageBlob
          });

          onStatusMessage("ZIP backup restored successfully", "success");

          return;
        }
        if (
          importData.version &&
          importData.data &&
          !Array.isArray(importData)
        ) {
          await restoreBackup(preview.file);
          onStatusMessage(
            "Full backup restored successfully. Please refresh the page.",
            "success",
          );
          return;
        }

        // Selection backup

        if (preview.backupType === "selection") {
          await restoreSelectionBackup(selectedFiles);
          onStatusMessage("Selected tables restored successfully.", "success");
          return;
        }

        // Require table only when detection failed

        if (!tableName || tableName === "all") {
          onStatusMessage(
            "Could not detect table. Please select a target table.",
            "warning",
          );
          return;
        }

        const existingData = getTableData(tableName) || [];
        const newData = importData;

        if (!Array.isArray(newData) || !newData.length) {
          throw new Error("Imported file is empty.");
        }

        const config = tableConfig[tableName];

        if (!config) {
          throw new Error("Import configuration missing for this table.");
        }

        // const existingKey = config.existingKey;
        // const duplicateField = config.duplicateField;
        const { existingKey, duplicateField, prefix } = config;
        // console.log(existingKey, duplicateField, prefix);

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

        // Find the highest existing number for this prefix
        const maxExistingNumber = existingData.reduce((max, item) => {
          const id = item[existingKey];

          if (!id || typeof id !== "string") return max;

          // Remove prefix and convert remaining part to number
          const number = parseInt(id.replace(prefix.toUpperCase(), ""), 10);

          return !isNaN(number) && number > max ? number : max;
        }, 100000000); // Starts from 100000001 if no records exist

        let counter = maxExistingNumber;

        newData.forEach((record) => {
          if (existingRecords.has(makeDuplicateKey(record))) {
            return;
          }
          counter++;

          processedData.push({
            ...record,
            [existingKey]: `${prefix.toUpperCase()}${counter}`,
            importedAt: new Date().toISOString(),
          });
        });

        saveTableData(tableName, [...existingData, ...processedData]);

        // Restore images if this file contains them
        if (tableName === "entertainment_wishlist" && importImages) {
          for (const image of importImages) {
            const blob = await base64ToImageBlob(image.base64);

            await saveImageBlob(user.userId, image.id, blob);
          }
        }

        onStatusMessage(
          `Imported ${processedData.length} new records to ${tableName}. Skipped ${
            newData.length - processedData.length
          } duplicates.`,
          "success",
        );

        setSelectedFiles([]);
        setImportPreviews([]);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        onClose();
      }
    } catch (error) {
      onStatusMessage(`Import failed: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedFiles([]);
    setImportPreviews([]);

    setSelectedTable("all");
    setSelectedTables([
      "entertainment_wishlist",
      "notes",
      "expenses",
      "collections",
    ]);

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
      const rawData = await idbGetItem(userKey);

      const confirmed = await confirm(
        "Do you want to proceed with the Erase ?",
        "danger",
      );

      // console.log(rawData)

      if (rawData[tableName] && confirmed) {
        const tableLength = rawData[tableName].length;
        const tableData = rawData[tableName];
        // 3. Delete the 'Selected' key
        delete rawData[tableName];
        // 4. Save it back to localStorage
        idbSetItem(userKey, rawData);

        // delete images

        if (tableName === "entertainment_wishlist") {
          for (const item of tableData) {
            if (item.imageId) {
              await deleteImageBlob(user.userId, item.imageId);
            }
          }
        }

        onStatusMessage(
          `Erased ${tableLength} records of ${selectedTable}`,
          "success",
        );
      } else {
        onStatusMessage(`The ${tableName} Table is Empty`, "warning");
        setIsProcessing(false);
        return;
      }
      onClose();
    } catch (error) {
      onStatusMessage(`Erase failed: ${error.message}`, "error");
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
                  <div style={{ display: "flex", gap: "16px", width: "450px" }}>
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
            {importPreviews.length > 0 &&
              importPreviews.map((preview, index) => (
                <div
                  key={index}
                  style={{
                    background: "var(--sap-content-bg)",
                    padding: "16px",
                    borderRadius: "8px",
                    marginTop: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <strong>📄 {preview.filename}</strong>

                    <span>{preview.size}</span>
                  </div>

                  {preview.detectedTable && (
                    <div style={{ marginTop: 10 }}>
                      Table :
                      <strong>
                        {" "}
                        {
                          tables.find((t) => t.value === preview.detectedTable)
                            ?.label
                        }
                      </strong>
                    </div>
                  )}

                  <div style={{ marginTop: 5 }}>
                    Records : {preview.recordCount}
                  </div>

                  {preview.type === "csv" && preview.headers && (
                    <div style={{ marginTop: 5 }}>
                      Columns : {preview.headers.join(", ")}
                    </div>
                  )}
                </div>
              ))}

            <div className="sap-form-field" style={{ alignSelf: "center" }}>
              <label
                style={{
                  display: "flex",
                  flexDirection: importPreviews ? "row" : "column",
                  alignItems: "center",
                  justifyContent: importPreviews ? "flex-start" : "center",
                  gap: importPreviews ? "12px" : "0",
                  padding: importPreviews ? "12px 16px" : "24px 16px",
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
                  // onLoad={console.log(importPreviews)}
                  multiple
                />

                <div
                  style={{
                    fontSize: importPreviews.length ? "24px" : "36px",
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
                    {importPreviews ? "Change file" : "Click to upload"}
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "500",
                      color: "#64748b",
                      marginTop: "4px",
                    }}
                  >
                    {importPreviews.length
                      ? `${importPreviews.length} file(s) selected`
                      : "or drag & drop files"}
                  </div>
                </div>

                {importPreviews && (
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: "12px",
                      color: "var(--sap-text-secondary)",
                      textAlign: "right",
                    }}
                  >
                    <div>{importPreviews.size}</div>
                    {importPreviews.record && (
                      <div>{importPreviews.recordCount} records</div>
                    )}
                  </div>
                )}
              </label>
            </div>

            {importPreviews && (
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
                    📄 {importPreviews.filename}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--sap-text-secondary)",
                    }}
                  >
                    {importPreviews.size}
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
                  {importPreviews.detectedTable && (
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
                          (t) => t.value === importPreviews.detectedTable,
                        )?.label || importPreviews.detectedTable}
                      </strong>
                    </div>
                  )}

                  {importPreviews.recordCount && (
                    <div>
                      <span style={{ color: "var(--sap-text-secondary)" }}>
                        Records:{" "}
                      </span>
                      <strong>{importPreviews.recordCount}</strong>
                    </div>
                  )}

                  {importPreviews.tables && (
                    <div>
                      <span style={{ color: "var(--sap-text-secondary)" }}>
                        Tables:{" "}
                      </span>
                      <strong>{importPreviews.tables?.join(", ")}</strong>
                    </div>
                  )}
                </div>

                {importPreviews.type === "csv" && importPreviews.headers && (
                  <div style={{ marginTop: "12px" }}>
                    <span
                      style={{
                        color: "var(--sap-text-secondary)",
                        fontSize: "12px",
                      }}
                    >
                      Columns: {importPreviews.headers.join(", ")}
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
              // disabled={!importPreviews || !selectedTable || isProcessing}
              disabled={importPreviews.length === 0 || isProcessing}
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
                      await restoreBackup(preview.file);
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
                setSelectedFiles([]);
                setImportPreviews([]);
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
