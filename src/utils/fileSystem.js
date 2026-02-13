// src/utils/fileSystem.js

/**
 * Export data to JSON file and download
 */
export const exportToJSON = (data, filename = 'sap-data-export.json') => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
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
        resolve({ success: true, data, message: 'Import successful' });
      } catch (error) {
        reject({ success: false, message: `Invalid JSON file: ${error.message}` });
      }
    };
    
    reader.onerror = () => {
      reject({ success: false, message: 'Failed to read file' });
    };
    
    reader.readAsText(file);
  });
};

/**
 * Export array data to CSV file
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
  try {
    if (!data || data.length === 0) {
      return { success: false, message: 'No data to export' };
    }

    // Create header row
    const headers = columns.map(col => `"${col.label || col.key}"`).join(',');
    
    // Create data rows
    const rows = data.map(row => {
      return columns.map(col => {
        let value = row[col.key];
        if (value === null || value === undefined) value = '';
        // Escape quotes and wrap in quotes
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      }).join(',');
    }).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, message: `Exported ${data.length} records to ${filename}` };
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
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject({ success: false, message: 'CSV file is empty or has no data rows' });
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
              col => col.label === header || col.key === header
            );
            const key = matchingCol ? matchingCol.key : header;
            row[key] = values[index] || '';
          });
          
          data.push(row);
        }
        
        resolve({ 
          success: true, 
          data, 
          headers,
          message: `Imported ${data.length} records` 
        });
      } catch (error) {
        reject({ success: false, message: `CSV parse error: ${error.message}` });
      }
    };
    
    reader.onerror = () => {
      reject({ success: false, message: 'Failed to read file' });
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parse a single CSV line handling quoted values
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
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
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  result.push(current.trim());
  return result;
};

/**
 * Create a backup of all localStorage data
 */
export const createBackup = () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sap-backup-${timestamp}.json`;
    
    const backupData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      application: 'SAP GUI Clone',
      data: {}
    };
    
    // Get all localStorage keys that belong to our app
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('sap_')) {
        try {
          backupData.data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          backupData.data[key] = localStorage.getItem(key);
        }
      }
    }
    
    return exportToJSON(backupData, filename);
  } catch (error) {
    return { success: false, message: `Backup failed: ${error.message}` };
  }
};

/**
 * Restore data from backup file
 */
export const restoreBackup = (file) => {
  return new Promise((resolve, reject) => {
    importFromJSON(file)
      .then(result => {
        const backupData = result.data;
        
        // Validate backup structure
        if (!backupData.version || !backupData.data) {
          reject({ success: false, message: 'Invalid backup file format' });
          return;
        }
        
        // Restore each key to localStorage
        Object.entries(backupData.data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        
        resolve({ 
          success: true, 
          message: `Backup restored successfully (Created: ${backupData.createdAt})` 
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes = []) => {
  const extension = file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};