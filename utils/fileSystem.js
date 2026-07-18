// src/utils/fileSystem.js

import {
  initializeDB,
  getAllData,
  saveAllData,
  imageBlobToBase64,
  base64ToImageBlob,
} from "./storage";

// ========== INDEXEDDB HELPERS (local to this file) ==========

const DB_NAME = "nexus_db";
const DB_VERSION = 1;
const STORE_NAME = "keyvalue";

// Reuse the same DB connection used by storage.js
let _db = null;

const getDB = () => {
  return new Promise((resolve, reject) => {
    if (_db) {
      resolve(_db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      _db = event.target.result;
      resolve(_db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

/**
 * Get ALL key-value pairs from IndexedDB that start with "sap_"
 * Returns a plain object: { [key]: value, ... }
 */
const getAllSapEntries = async () => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const entries = {};

    // Collect all keys first
    const keyRequest = store.getAllKeys();

    keyRequest.onsuccess = (e) => {
      // console.log(e.target.result);
      const allKeys = e.target.result.filter((k) =>
        String(k).startsWith("sap_"),
      );

      if (allKeys.length === 0) {
        resolve(entries);
        return;
      }

      let pending = allKeys.length;

      allKeys.forEach((key) => {
        const getRequest = store.get(key);

        getRequest.onsuccess = (ev) => {
          entries[key] = ev.target.result;
          pending--;
          if (pending === 0) resolve(entries);
        };

        getRequest.onerror = (ev) => {
          // Skip failed keys rather than rejecting everything
          pending--;
          if (pending === 0) resolve(entries);
        };
      });
    };

    keyRequest.onerror = (e) => reject(e.target.error);
  });
};

/**
 * Write a single key-value pair into IndexedDB.
 */
const idbSetItem = async (key, value) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
};

/**
 * Read a single key from IndexedDB.
 */
const idbGetItem = async (key) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = (e) => {
      resolve(e.target.result !== undefined ? e.target.result : null);
    };
    request.onerror = (e) => reject(e.target.error);
  });
};

// ========== EXPORT / IMPORT ==========

/**
 * Export data to JSON file and download
 */
export const exportToJSON = (data, filename = "sap-data-export.json") => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: `Exported to ${filename}` };
  } catch (error) {
    return { success: false, message: `Export failed: ${error.message}` };
  }
};

/**
 * Import data from JSON file
 */
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve({ success: true, data, message: "Import successful" });
      } catch (error) {
        reject({
          success: false,
          message: `Invalid JSON file: ${error.message}`,
        });
      }
    };

    reader.onerror = () => {
      reject({ success: false, message: "Failed to read file" });
    };

    reader.readAsText(file);
  });
};

/**
 * Export array data to CSV file
 */
export const exportToCSV = (data, columns, filename = "export.csv") => {
  try {
    if (!data || data.length === 0) {
      return { success: false, message: "No data to export" };
    }

    // Create header row
    const headers = columns.map((col) => `"${col.label || col.key}"`).join(",");

    // Create data rows
    const rows = data
      .map((row) => {
        return columns
          .map((col) => {
            let value = row[col.key];
            if (value === null || value === undefined) value = "";
            // Escape quotes and wrap in quotes
            value = String(value).replace(/"/g, '""');
            return `"${value}"`;
          })
          .join(",");
      })
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: `Exported ${data.length} records to ${filename}`,
    };
  } catch (error) {
    return { success: false, message: `Export failed: ${error.message}` };
  }
};

/**
 * Import data from CSV file
 */
export const importFromCSV = (file, expectedColumns = []) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          reject({
            success: false,
            message: "CSV file is empty or has no data rows",
          });
          return;
        }

        // Parse header
        const headers = parseCSVLine(lines[0]);

        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row = {};

          headers.forEach((header, index) => {
            // Try to match with expected column keys
            const matchingCol = expectedColumns.find(
              (col) => col.label === header || col.key === header,
            );
            const key = matchingCol ? matchingCol.key : header;
            row[key] = values[index] || "";
          });

          data.push(row);
        }

        resolve({
          success: true,
          data,
          headers,
          message: `Imported ${data.length} records`,
        });
      } catch (error) {
        reject({
          success: false,
          message: `CSV parse error: ${error.message}`,
        });
      }
    };

    reader.onerror = () => {
      reject({ success: false, message: "Failed to read file" });
    };

    reader.readAsText(file);
  });
};

/**
 * Parse a single CSV line handling quoted values
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
};

// ========== BACKUP & RESTORE (NOW ASYNC / IDB-BASED) ==========

/**
 * Create a backup of all IndexedDB data that belongs to this app.
 *
 * Previously read from localStorage synchronously.
 * Now reads asynchronously from IndexedDB and then triggers download.
 *
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const createBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `sap-backup-${timestamp}.json`;

    // Fetch every sap_ key from IndexedDB
    const sapEntries = await getAllSapEntries();

    const backupData = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      application: "SAP GUI Clone",
      // Values are already plain JS objects (IDB structured-clone),
      // so no JSON.parse needed here unlike the old localStorage version.
      data: sapEntries,
      success: true,
    };

    // exportToJSON is still synchronous (just triggers a download)
    return exportToJSON(backupData, filename);
  } catch (error) {
    return { success: false, message: `Backup failed: ${error.message}` };
  }
};

/**
 * Restore data from a backup file into IndexedDB.
 *
 * Previously wrote to localStorage synchronously.
 * Now merges/overwrites each key asynchronously in IndexedDB AND
 * updates the in-memory cache in storage.js by calling initializeDB()
 * at the end so the rest of the app sees fresh data immediately.
 *
 * @param {File} file - The .json backup file selected by the user
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const restoreBackup = (file) => {
  return new Promise((resolve, reject) => {
    importFromJSON(file)
      .then(async (result) => {
        const backupData = result.data;

        // Validate backup structure
        if (!backupData.version || !backupData.data) {
          reject({
            success: false,
            message: "Invalid backup file format",
          });
          return;
        }

        try {
          // Replace all existing data with backup data
          for (const [key, value] of Object.entries(backupData.data)) {
            await idbSetItem(key, value);
          }

          // Refresh in-memory cache
          await initializeDB();

          resolve({
            success: true,
            message: `Backup restored successfully (Created: ${backupData.createdAt})`,
          });
        } catch (writeError) {
          reject({
            success: false,
            message: `Restore failed while writing to IndexedDB: ${writeError.message}`,
          });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const createSelectionBackup = async (selectedTables) => {
  try {
    // Get all current user's data
    const allData = getAllData();

    const selectedData = {};

    selectedTables.forEach((table) => {
      if (allData.hasOwnProperty(table)) {
        selectedData[table] = allData[table];
      }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    return exportToJSON(
      {
        version: "1.0",
        type: "selection",
        createdAt: new Date().toISOString(),
        application: "SAP GUI Clone",
        tables: selectedTables,
        data: selectedData,
      },
      `sap-selection-backup-${timestamp}.json`,
    );
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const restoreSelectionBackup = async (file) => {
  const result = await importFromJSON(file);

  const backup = result.data;

  if (!backup.version || !backup.data) {
    throw new Error("Invalid backup file.");
  }

  // Get existing data
  const currentData = getAllData();

  // Replace only the selected tables
  Object.entries(backup.data).forEach(([table, value]) => {
    currentData[table] = value;
  });

  // Save everything back
  saveAllData(currentData);

  await initializeDB();

  return {
    success: true,
    message: `${backup.tables.length} table(s) restored successfully.`,
  };
};

// ========== UTILITIES (unchanged) ==========

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes = []) => {
  const extension = file.name.split(".").pop().toLowerCase();
  return allowedTypes.includes(extension);
};
