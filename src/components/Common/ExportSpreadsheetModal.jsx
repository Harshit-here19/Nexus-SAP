import React from "react";

const fieldLabels = {
  expenseNumber: "Expense Number",
  date: "Expense Date",
  category: "Category",
  description: "Description",
  vendor: "Vendor",
  amount: "Amount",
  currency: "Currency",
  paymentMethod: "Payment Method",
  status: "Status",
  notes: "Notes",
};

const ExportSpreadsheetModal = ({
  open,
  options,
  setOptions,
  onClose,
  onExport,
}) => {
  if (!open) return null;

  const updateField = (field) => {
    setOptions((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: !prev.fields[field],
      },
    }));
  };

  const selectAll = () => {
    const obj = {};

    Object.keys(options.fields).forEach((key) => {
      obj[key] = true;
    });

    setOptions((prev) => ({
      ...prev,
      fields: obj,
    }));
  };

  const clearAll = () => {
    const obj = {};

    Object.keys(options.fields).forEach((key) => {
      obj[key] = false;
    });

    setOptions((prev) => ({
      ...prev,
      fields: obj,
    }));
  };

  const selectedCount = Object.values(options.fields).filter(Boolean).length;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>📊 Export Spreadsheet</div>

            <div style={styles.subtitle}>
              Export expense data into Excel or CSV
            </div>
          </div>

          <button onClick={onClose} style={styles.close}>
            ✕
          </button>
        </div>

        {/* Filters */}

        <div style={styles.section}>
          <div style={styles.grid}>
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Posting Date Range</div>

              <div style={styles.grid}>
                <div>
                  <label style={styles.label}>From Date</label>

                  <input
                    type="date"
                    value={options.fromDate}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        fromDate: e.target.value,
                      }))
                    }
                    style={styles.select}
                  />
                </div>

                <div>
                  <label style={styles.label}>To Date</label>

                  <input
                    type="date"
                    value={options.toDate}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        toDate: e.target.value,
                      }))
                    }
                    style={styles.select}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fields */}

        <div style={styles.section}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={styles.sectionTitle}>Fields to Export</div>

            <div>
              <button onClick={selectAll} style={styles.smallButton}>
                Select All
              </button>

              <button onClick={clearAll} style={styles.smallButton}>
                Clear
              </button>
            </div>
          </div>

          <div style={styles.fieldGrid}>
            {Object.keys(options.fields).map((field) => (
              <label key={field} style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={options.fields[field]}
                  onChange={() => updateField(field)}
                />

                {fieldLabels[field]}
              </label>
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              color: "#666",
              fontSize: 13,
            }}
          >
            {selectedCount} fields selected
          </div>
        </div>

        {/* Format */}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Export Format</div>

          <div
            style={{
              display: "flex",
              gap: 30,
            }}
          >
            <label>
              <input
                type="radio"
                value="xlsx"
                checked={options.format === "xlsx"}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    format: e.target.value,
                  }))
                }
              />
              Excel (.xlsx)
            </label>

            <label>
              <input
                type="radio"
                value="csv"
                checked={options.format === "csv"}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    format: e.target.value,
                  }))
                }
              />
              CSV
            </label>
          </div>
        </div>

        {/* Footer */}

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancel}>
            Cancel
          </button>

          <button onClick={onExport} style={styles.export}>
            📥 Export Spreadsheet
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modal: {
    width: 560,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
    overflow: "hidden",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#4f46e5",
    color: "#fff",
  },

  title: {
    fontSize: 16,
    fontWeight: 600,
  },

  subtitle: {
    fontSize: 12,
    opacity: 0.85,
  },

  close: {
    background: "transparent",
    border: "none",
    fontSize: 18,
    color: "#fff",
    cursor: "pointer",
  },

  section: {
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
  },

  sectionTitle: {
    fontWeight: 600,
    marginBottom: 8,
    fontSize: 13,
    color: "#111827",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  label: {
    display: "block",
    marginBottom: 4,
    fontSize: 12,
    fontWeight: 500,
    color: "#374151",
  },

  select: {
    width: "100%",
    padding: "6px 8px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #d1d5db",
  },

  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 6,
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    padding: "6px 8px",
    borderRadius: 6,
    background: "#fafafa",
    border: "1px solid #f1f5f9",
  },

  smallButton: {
    marginLeft: 6,
    padding: "4px 8px",
    fontSize: 11,
    borderRadius: 5,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
  },

  footer: {
    padding: 10,
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    background: "#fafafa",
  },

  cancel: {
    padding: "6px 12px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
  },

  export: {
    padding: "6px 12px",
    fontSize: 13,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: 6,
  },
};

export default ExportSpreadsheetModal;
