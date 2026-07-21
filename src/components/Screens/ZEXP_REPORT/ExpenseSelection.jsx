import React, { useState } from "react";

import styles from "./ExpenseSelection.module.css";
import ExpenseQRScanner from "./ExpenseQRScanner";

import { getExpenseCategories } from "../../../utils/storage";

import SapInput from "../../Common/SapInput";
import SapSelect from "../../Common/SapSelect";
import SapButton from "../../Common/SapButton";
import SapModal from "../../Common/SapModal";
import NotificationModule from "../../Common/NotificationModule";

import { importExpenses } from "../../../utils/importExpense";

const ExpenseSelection = ({ onExecute }) => {
  const categories = getExpenseCategories();

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    category: "ALL",
    vendor: "",
  });
  const [showScanner, setShowScanner] = useState(false);

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQRScan = (decodedText) => {
    try {
      const payload = JSON.parse(atob(decodedText));

      if (
        payload.t !== "expense_report" ||
        !payload.c ||
        !payload.d
      ) {
        throw new Error("Invalid Expense QR.");
      }

      const expenses = payload.d.map(row => {
        const obj = {};
        payload.c.forEach((key, index) => {
          obj[key] = row[index];
        });
        return obj;
      });

      if (payload.type !== "expense_report") {
        throw new Error("Invalid Expense QR.");
      }

      importExpenses(payload.data);

      // Give html5-qrcode a moment to finish
      setTimeout(() => {
        setShowScanner(false);
      }, 200);

    } catch (err) {
      NotificationModule.notify(
        "error",
        err.message,
        { type: "error" }
      );
    }
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
            onChange={(val) => { handleChange("fromDate", val) }}
          />

          <SapInput
            label="Posting Date to"
            type="date"
            value={filters.toDate}
            onChange={(val) => { handleChange("toDate", val) }}
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
          <SapButton
            type="neo"
            onClick={() => onExecute(filters)}
          >
            ▶ Execute (F8)
          </SapButton>
          <SapButton
            type="neo-active"
            onClick={() => setShowScanner(true)}
          >
            📷 Scan QR
          </SapButton>
        </div>
      </div>

      <SapModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        title="Scan Expense QR"
      >
        <ExpenseQRScanner
          onScan={handleQRScan}
        />
      </SapModal>
    </div>
  );
};

export default ExpenseSelection;
