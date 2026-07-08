import React, { useState } from "react";
import styles from "./ExpenseSelection.module.css";

import { getExpenseCategories } from "../../../utils/storage";
import SapInput from "../../Common/SapInput";
import SapSelect from "../../Common/SapSelect";

const ExpenseSelection = ({ onExecute }) => {
  const categories = getExpenseCategories();

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    category: "ALL",
    vendor: "",
  });

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={styles.selectionScreen}>
      <div className={styles.header}>
        <h2>Expense Report</h2>
        <span>Selection Screen</span>
      </div>

      <div className={styles.content}>
        <div className={styles.formGrid}>
          <SapInput
            label="Posting Date From"
            type="date"
            value={filters.fromDate}
            onChange={(val) => {handleChange("fromDate", val)}}
          />

          <SapInput
            label="Posting Date to"
            type="date"
            value={filters.toDate}
            onChange={(val) => {handleChange("toDate", val)}}
          />

          <SapSelect
            label="Category"
            value={filters.category}
            onChange={(val) => handleChange("category", val)}
            options={[
              { value: "ALL", label: "ALL" }, // 1. Prepend the "All" option here
              ...categories.map((c) => ({
                value: c.value,
                label: c.label?.en || c.value,
              })),
            ]}
            required={true}
          />

          <SapInput
            label="Vendor"
            type="text"
            value={filters.vendor}
            onChange={(val) => handleChange("vendor", val)}
          />
        </div>

        <div className={styles.footer}>
          <button
            className={styles.executeButton}
            onClick={() => onExecute(filters)}
          >
            ▶ Execute (F8)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSelection;
