import React, { useMemo, useState } from "react";
import styles from "./ExpenseALVGrid.module.css";

import SapButton from "../../Common/SapButton";
import SapModal from "../../Common/SapModal";

const DEFAULT_COLUMNS = [
  {
    key: "expenseNumber",
    label: "Expense No",
    visible: true,
  },

  {
    key: "date",
    label: "Posting Date",
    visible: true,
  },

  {
    key: "category",
    label: "Category",
    visible: true,
  },

  {
    key: "description",
    label: "Description",
    visible: true,
  },

  {
    key: "vendor",
    label: "Vendor",
    visible: true,
  },

  {
    key: "paymentMethod",
    label: "Payment",
    visible: true,
  },

  {
    key: "amount",
    label: "Amount",
    visible: true,
  },

  {
    key: "status",
    label: "Status",
    visible: true,
  },
];

const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB");
};

const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(Number(amount || 0));
};

const ExpenseALVGrid = ({ data = [] }) => {
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem("expenseALVLayout");

    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });

  const [sort, setSort] = useState({
    field: null,
    direction: "asc",
  });

  const [showChooser, setShowChooser] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);

  // SORT

  const sortedData = useMemo(() => {
    let result = [...data];

    if (sort.field) {
      result.sort((a, b) => {
        let x = a[sort.field] ?? "";
        let y = b[sort.field] ?? "";

        if (sort.field === "amount") {
          x = Number(x);
          y = Number(y);
        }

        if (x < y) return sort.direction === "asc" ? -1 : 1;

        if (x > y) return sort.direction === "asc" ? 1 : -1;

        return 0;
      });
    }

    return result;
  }, [data, sort]);

  // COLUMN SAVE

  const saveLayout = () => {
    localStorage.setItem("expenseALVLayout", JSON.stringify(columns));

    alert("Layout Variant Saved");
  };

  const toggleColumn = (key) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.key === key
          ? {
              ...c,
              visible: !c.visible,
            }
          : c,
      ),
    );
  };

  // SUBTOTAL

  const groupedData = useMemo(() => {
    if (!groupByCategory)
      return {
        "ALL DATA": sortedData,
      };

    return sortedData.reduce((acc, item) => {
      const cat = item.category || "Other";

      if (!acc[cat]) acc[cat] = [];

      acc[cat].push(item);

      return acc;
    }, {});
  }, [sortedData, groupByCategory]);

  const grandTotal = useMemo(() => {
    return sortedData.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  }, [sortedData]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.titleArea}>
          <h2>Expense ALV Report</h2>
          <span>{data.length} Records</span>
        </div>

        <div className={styles.toolbarActions}>
          <SapButton
            type="glass"
            onClick={() => {
              if (!selectedColumn) return;

              setSort({
                field: selectedColumn,
                direction: "asc",
              });
            }}
          >
            ↑ Asc
          </SapButton>

          <SapButton
            type="glass"
            onClick={() => {
              if (!selectedColumn) return;

              setSort({
                field: selectedColumn,
                direction: "desc",
              });
            }}
          >
            ↓ Desc
          </SapButton>

          <SapButton type="glass" onClick={() => setShowChooser(!showChooser)}>
            Columns
          </SapButton>

          <SapButton type="primary" onClick={saveLayout}>
            Save Layout
          </SapButton>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={groupByCategory}
              onChange={(e) => setGroupByCategory(e.target.checked)}
            />
            Group by Category
          </label>
        </div>
      </div>

      <SapModal
        isOpen={showChooser}
        onClose={() => setShowChooser(false)}
        title="Change Layout"
        width="520px"
        footer={
          <>
            <SapButton type="close" onClick={() => setShowChooser(false)}>
              Cancel
            </SapButton>

            <SapButton
              type="primary"
              onClick={() => {
                saveLayout();
                setShowChooser(false);
              }}
            >
              Apply
            </SapButton>
          </>
        }
      >
        <div className={styles.layoutChooser}>
          {columns.map((column) => (
            <div
              key={column.key}
              className={`${styles.layoutRow}
                    ${column.visible ? styles.layoutRowSelected : ""}`}
              onClick={() => toggleColumn(column.key)}
            >
              <span>{column.label}</span>
            </div>
          ))}
        </div>
      </SapModal>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns
                .filter((c) => c.visible)
                .map((col) => (
                  <th
                    key={col.key}
                    onClick={() =>
                      setSelectedColumn((prev) =>
                        prev === col.key ? null : col.key,
                      )
                    }
                    className={
                      selectedColumn === col.key ? styles.selectedHeader : ""
                    }
                  >
                    <div className={styles.headerCell}>
                      <span>{col.label}</span>

                      {sort.field === col.key && (
                        <span className={styles.sortArrow}>
                          {sort.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedData).map(([category, rows]) => (
              <React.Fragment key={category}>
                {groupByCategory && (
                  <tr className={styles.groupRow}>
                    <td colSpan={columns.filter((c) => c.visible).length}>
                      📂 {category}
                    </td>
                  </tr>
                )}

                {rows.map((item) => (
                  <tr className={styles.dataRow} key={item.expenseNumber}>
                    {columns
                      .filter((c) => c.visible)
                      .map((col) => (
                        <td
                          key={col.key}
                          className={
                            selectedColumn === col.key
                              ? styles.selectedColumn
                              : ""
                          }
                        >
                          {col.key === "date"
                            ? formatDate(item.date)
                            : col.key === "amount"
                              ? formatCurrency(item.amount, item.currency)
                              : item[col.key] || "-"}
                        </td>
                      ))}
                  </tr>
                ))}

                {groupByCategory && (
                  <tr className={styles.subtotal}>
                    <td>Subtotal</td>

                    <td colSpan={columns.filter((c) => c.visible).length - 2} />

                    <td className={styles.subtotalValue}>
                      {formatCurrency(
                        rows.reduce((sum, x) => sum + Number(x.amount || 0), 0),
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            <tr className={styles.totalRow}>
              {columns
                .filter((c) => c.visible)
                .map((col, index, visibleColumns) => {
                  if (index === 0) {
                    return (
                      <td key={col.key} className={styles.totalLabel}>
                        Total
                      </td>
                    );
                  }

                  if (col.key === "amount") {
                    return (
                      <td key={col.key} className={styles.totalValue}>
                        {formatCurrency(grandTotal)}
                      </td>
                    );
                  }

                  return <td key={col.key}></td>;
                })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseALVGrid;
