// src/components/Screens/ExpenseTrackerScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import SapButton from "../Common/SapButton";
import SapInput from "../Common/SapInput";
import SapSelect from "../Common/SapSelect";
import SapTabs from "../Common/SapTabs";
import SapModal from "../Common/SapModal";
import { useTransaction } from "../../context/TransactionContext";
import { useAuth } from "../../context/AuthContext";
import { useAction } from "../../context/ActionContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useSettings } from "../../context/SettingsContext"
import {
  getTableData,
  addRecord,
  updateRecord,
  findRecord,
  generateNextNumber,
  getExpenseCategories,
  getPaymentMethods,
} from "../../utils/storage";

import useTranslation from '../../hooks/useTranslation'

// =========================================================
//                📌📌📌 CONSTANTS 📌📌📌
// =========================================================
const isMobile = window.innerWidth <= 768;

const getInitialFormState = (user) => ({
  expenseNumber: "",
  date: new Date().toISOString().split("T")[0],
  category: "",
  description: "",
  amount: "",
  currency: "INR",
  paymentMethod: "",
  vendor: "",
  receiptNumber: "",
  notes: "",
  tags: "",
  isRecurring: false,
  recurringFrequency: "",
  status: "recorded",
  createdBy: user?.username || "SAPUSER",
});

// Helper functions
const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};

const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const ExpenseTrackerScreen = ({ mode = "create" }) => {
  const {
    updateStatus,
    markAsChanged,
    markAsSaved,
    goBack,
    currentTransaction,
    setTransactionHistory,
    registerBackHandler,
    clearBackHandler,
  } = useTransaction();
  const { user } = useAuth();
  const { registerAction, clearAction } = useAction();
  const { confirm } = useConfirm();
  const { t } = useTranslation();

  const saveRef = useRef(null);
  const clearRef = useRef(null);
  const deleteRef = useRef(null);
  const printRef = useRef(null);

  const [expenseId, setExpenseId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const { settings } = useSettings();

  const lang = settings.language || "en";

  // Form data
  const [formData, setFormData] = useState(getInitialFormState(user));

  const [errors, setErrors] = useState({});
  const categories = getExpenseCategories();
  const paymentMethods = getPaymentMethods();

  // =========================================================
  //                🔹🔹🔹 FORM HANDLERS 🔹🔹🔹
  // =========================================================

  // Handle form field change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    markAsChanged();
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Date
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (isNaN(new Date(formData.date).getTime())) {
      newErrors.date = "Please enter a valid date";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Description
    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 3) {
      newErrors.description = "Description must be at least 3 characters long";
    } else if (formData.description.trim().length > 250) {
      newErrors.description = "Description cannot exceed 250 characters";
    }

    // Amount
    if (!formData.amount?.toString().trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = "Amount must be a valid number";
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (Number(formData.amount) > 999999999) {
      newErrors.amount = "Amount is too large";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear form
  clearRef.current = () => {
    setFormData(getInitialFormState(user));
    setExpenseId("");
    setIsLoaded(false);
    setErrors({});
    markAsSaved();
    updateStatus("Form cleared", "info");
  };

  // Save expense
  saveRef.current = () => {
    if (!validateForm()) {
      updateStatus("Please fill in all required fields", "error");
      return;
    }

    try {
      if (mode === "create") {
        const expNumber = generateNextNumber(
          "expenses",
          "expenseNumber",
          "EXP",
        );
        const newExpense = addRecord("expenses", {
          ...formData,
          expenseNumber: expNumber,
          amount: parseFloat(formData.amount).toFixed(2),
        });
        setFormData((prev) => ({ ...prev, expenseNumber: expNumber }));
        markAsSaved();
        clearRef.current?.();
        updateStatus(`Expense ${expNumber} created successfully`, "success");
      } else if (mode === "change") {
        updateRecord("expenses", formData.id, {
          ...formData,
          amount: parseFloat(formData.amount).toFixed(2),
        });
        markAsSaved();
        updateStatus(
          `Expense ${formData.expenseNumber} updated successfully`,
          "success",
        );
      }
    } catch (error) {
      updateStatus(`Error saving expense: ${error.message}`, "error");
    }
  };

  // =========================================================
  //                🔹🔹🔹 SEARCH HANDLERS 🔹🔹🔹
  // =========================================================

  // Search expenses
  const handleSearch = () => {
    let expenses = getTableData("expenses");

    // Apply filters
    if (searchTerm) {
      expenses = expenses.filter(
        (e) =>
          e.expenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.vendor?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterCategory !== "all") {
      expenses = expenses.filter((e) => e.category === filterCategory);
    }

    if (filterMonth !== "all") {
      const [year, month] = filterMonth.split("-");
      expenses = expenses.filter((e) => {
        const date = new Date(e.date);
        return (
          date.getFullYear() === parseInt(year) &&
          date.getMonth() === parseInt(month) - 1
        );
      });
    }

    // Sort by date descending
    // expenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    setSearchResults(expenses);
    setShowSearchModal(true);
  };

  // Select expense from search
  const handleSelectExpense = (expense) => {
    setExpenseId(expense.expenseNumber);
    setFormData(expense);
    setIsLoaded(true);
    setShowSearchModal(false);
    updateStatus(`Expense ${expense.expenseNumber} selected`, "success");
  };

  // =========================================================
  //                🔹🔹🔹 CRUD HANDLERS 🔹🔹🔹
  // =========================================================

  // Load expense for edit/view
  const loadExpense = () => {
    if (!expenseId.trim()) {
      updateStatus("Enter an expense ID", "warning");
      return;
    }

    const expense = findRecord("expenses", "expenseNumber", expenseId.trim());
    if (expense) {
      setFormData(expense);
      setIsLoaded(true);
      updateStatus(`Expense ${expenseId} loaded successfully`, "success");
    } else {
      updateStatus(`Expense ${expenseId} not found`, "error");
    }
  };

  // Delete expense
  deleteRef.current = async () => {
    if (!formData.id) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this expense?",
      "danger",
    );
    if (confirmed) {
      const expenses = getTableData("expenses");
      const filtered = expenses.filter((e) => e.id !== formData.id);
      const allData = getAllData();
      allData.expenses = filtered;
      saveAllData(allData);
      clearRef.current?.();
      goBack();
      updateStatus("Expense deleted successfully", "success");
    }
  };

  //Delete in search modal
  const DeleteInSearchModal = async (id) => {
    if (!id) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this Expense?",
      "danger",
    );
    if (confirmed) {
      const expenses = getTableData("expenses");
      const filtered = expenses.filter((e) => e.id !== id);
      const allData = getAllData();
      allData.expenses = filtered;
      saveAllData(allData);
      clearRef.current?.();
      updateStatus("Expense deleted successfully", "success");
      setSearchResults(filtered);
    }
    markAsSaved();
  };

  // Register a custom back handler that closes the editor first
  useEffect(() => {
    if (isLoaded) {
      registerBackHandler(() => {
        // Close the editor instead of leaving the transaction
        setIsLoaded(false);
        setExpenseId("");
        markAsSaved();

        // Pop the NOTE_ entry from history
        setTransactionHistory((prev) => {
          const newHistory = [...prev];
          if (
            newHistory.length > 0 &&
            newHistory[newHistory.length - 1]?.startsWith("NOTE_")
          ) {
            newHistory.pop();
          }
          return newHistory;
        });

        updateStatus("Close the Opened Note", "info");
        return true; // Signal that we handled the back — don't do default back
      });
    } else {
      // When not loaded (on the search/ID entry screen), clear the custom handler
      // so default back behavior (go to HOME) works normally
      clearBackHandler();
    }

    return () => {
      clearBackHandler();
    };
  }, [
    isLoaded,
    registerBackHandler,
    clearBackHandler,
    setTransactionHistory,
    markAsSaved,
    user?.username,
  ]);

  useEffect(() => {
    registerAction("SAVE", () => {
      saveRef.current?.();
    });
    registerAction("CLEAR", () => {
      clearRef.current?.();
    });
    registerAction("DELETE", () => {
      deleteRef.current?.();
    });
    registerAction("PRINT", () => {
      printRef.current?.();
    });

    return () => {
      clearAction("SAVE");
      clearAction("CLEAR");
      clearAction("DELETE");
      clearAction("PRINT");
    };
  }, [registerAction, clearAction]);

  // Print Expenses
  printRef.current = () => {
    const expenses = getTableData("expenses") || [];

    if (!expenses.length) {
      alert("No expenses to print!");
      return;
    }

    const html = generateExpenseReport(expenses);

    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // setTimeout(() => {
    //   printWindow.print();
    // }, 250);
  };

  const isReadOnly = mode === "display";
  const needsLoad = (mode === "change" || mode === "display") && !isLoaded;

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return (
      categories.find((c) => c.value === categoryValue) || {
        label: {
          en: categoryValue,
          hi: categoryValue,
        },
        color: "#9e9e9e",
      }
    );
  };

  // Generate month options for filter
  const getMonthOptions = () => {
    const options = [{ value: "all", label: "All Months" }];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return options;
  };

  const evaluateAmount = (value) => {
    if (!value || typeof value !== "string") return value;

    if (!value.startsWith("=")) return value;

    const expression = value.slice(1).trim();

    // Only allow digits, operators, decimal points, spaces and parentheses
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      return value;
    }

    try {
      const result = Function(`"use strict"; return (${expression})`)();

      if (typeof result === "number" && Number.isFinite(result)) {
        return result.toFixed(2);
      }
    } catch (e) {
      // Invalid expression
    }

    return value;
  };

  // =========================================================
  //                🔹🔹🔹 TAB HANDLERS 🔹🔹🔹
  // =========================================================

  // Details Tab
  const detailsTab = (
    <div className="sap-form">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Left Column */}
        <div>
          <h4
            style={{
              marginBottom: "14px",
              color: "var(--sap-brand)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span>📝</span> {t("expenseForm.expenseDetails")}
          </h4>

          <SapInput
            label={t("expenseForm.expenseId")}
            value={formData.expenseNumber}
            readOnly={true}
            placeholder="Auto-generated"
          />

          <SapInput
            label={t("expenseForm.date")}
            value={formData.date}
            onChange={(val) => handleChange("date", val)}
            type="date"
            required={true}
            disabled={isReadOnly}
            error={errors.date}
          />

          <SapSelect
            label={t("expenseForm.category")}
            value={formData.category}
            onChange={(val) => handleChange("category", val)}
            options={categories.map((c) => ({
              value: c.value,
              label: c.label[lang],
            }))}
            required={true}
            disabled={isReadOnly}
            placeholder={t("expenseForm.selectCategory")}
          />

          <SapInput
            label={t("expenseForm.description")}
            value={formData.description}
            onChange={(val) => handleChange("description", val)}
            required={true}
            disabled={isReadOnly}
            error={errors.description}
            placeholder={t("expenseForm.expenseDescriptionPlaceholder")}
          />

          <SapInput
            // label="Vendor/Merchant"
            label={t("expenseForm.vendor")}
            value={formData.vendor}
            onChange={(val) => handleChange("vendor", val)}
            disabled={isReadOnly}
            placeholder={t("expenseForm.vendorPlaceholder")}
          />
        </div>

        {/* Right Column */}
        <div>
          <h4
            style={{
              marginBottom: "14px",
              color: "var(--sap-brand)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span>💰</span> {t("expenseForm.paymentInformation")}
          </h4>

          <div className="sap-form-group">
            <div
              style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}
            >
              <SapSelect
                label={t("expenseForm.amount")}
                value={formData.currency}
                onChange={(val) => handleChange("currency", val)}
                options={[
                  { value: "INR", label: "INR" },
                  { value: "USD", label: "USD" },
                  { value: "JPY", label: "JPY" },
                ]}
                required
                disabled={isReadOnly}
                placeholder={t("expenseForm.currency")}
              />

              <SapInput
                type="text"
                value={formData.amount}
                onChange={(val) => handleChange("amount", val)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleChange("amount", evaluateAmount(formData.amount));
                  }
                }}
                /* 2. Tell the input itself to fill 100% width of this new wrapper */
                style={{ width: "100%" }}
              />
            </div>
            {errors.amount && (
              <div
                style={{
                  color: "var(--sap-negative)",
                  fontSize: "11px",
                  marginTop: "4px",
                  marginLeft: "162px",
                }}
              >
                {errors.amount}
              </div>
            )}
          </div>

          <SapSelect
            label={t("expenseForm.paymentMethod")}
            value={formData.paymentMethod}
            onChange={(val) => handleChange("paymentMethod", val)}
            options={paymentMethods.map((p) => ({
              value: p.value,
              label: p.label[lang],
            }))}
            required={true}
            disabled={isReadOnly}
            placeholder={t("expenseForm.paymentMethodPlaceholder")}
          />

          <SapInput
            label={t("expenseForm.receiptNumber")}
            value={formData.receiptNumber}
            onChange={(val) => handleChange("receiptNumber", val)}
            disabled={isReadOnly}
            placeholder={t("expenseForm.receiptPlaceholder")}
          />

          <SapSelect
            label={t("expenseForm.status")}
            value={formData.status}
            onChange={(val) => handleChange("status", val)}
            options={[
              { value: "recorded", label: t("expenseForm.recorded") },
              { value: "pending", label: t("expenseForm.pending") },
              { value: "approved", label: t("expenseForm.approved") },
              { value: "rejected", label: t("expenseForm.rejected") },
              { value: "reimbursed", label: t("expenseForm.reimbursed") },
            ]}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Category Preview */}
      {formData.category && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px 16px",
            background: `${getCategoryInfo(formData.category).color}15`,
            borderLeft: `4px solid ${getCategoryInfo(formData.category).color}`,
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "24px" }}>
            {getCategoryInfo(formData.category).label[lang].split(" ")[0]}
          </span>
          <div>
            <div style={{ fontWeight: "600", fontSize: "13px" }}>
              {getCategoryInfo(formData.category).label[lang]}
            </div>
            {formData.amount && (
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: getCategoryInfo(formData.category).color,
                }}
              >
                {formData.currency}{" "}
                {parseFloat(formData.amount || 0).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Notes Tab
  const notesTab = (
    <div className="sap-form">
      <div className="sap-form-group" style={{ alignItems: "flex-start" }}>
        <label className="sap-form-label">{t("expenseForm.notes")}</label>
        <div
          className="sap-form-field"
          style={{ width: isMobile ? "100%" : "70%" }}
        >
          <textarea
            className="sap-textarea"
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            disabled={isReadOnly}
            placeholder={t("expenseForm.notesPlaceholder")}
            rows={5}
            style={{ width: "100%", maxWidth: "500px" }}
          />
        </div>
      </div>

      <SapInput
        label={t("expenseForm.tags")}
        value={formData.tags}
        onChange={(val) => handleChange("tags", val)}
        disabled={isReadOnly}
        placeholder={t("expenseForm.tagsPlaceholder")}
      />

      <div style={{ marginTop: "16px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
            cursor: isReadOnly ? "default" : "pointer",
            width: "fit-content",
          }}
        >
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={(e) => handleChange("isRecurring", e.target.checked)}
            disabled={isReadOnly}
            style={{
              width: "18px",
              height: "18px",
              accentColor: "var(--sap-brand)",
            }}
          />
          <span style={{ fontSize: "13px" }}>
            {t("expenseForm.recurringExpense")}
          </span>
        </label>
      </div>

      {formData.isRecurring && (
        <SapSelect
          label={t("expenseForm.frequency")}
          value={formData.recurringFrequency}
          onChange={(val) => handleChange("recurringFrequency", val)}
          options={[
            { value: "daily", label: t("expenseForm.daily") },
            { value: "weekly", label: t("expenseForm.weekly") },
            { value: "monthly", label: t("expenseForm.monthly") },
            { value: "quarterly", label: t("expenseForm.quarterly") },
            { value: "yearly", label: t("expenseForm.yearly") },
          ]}
          disabled={isReadOnly}
        />
      )}
    </div>
  );

  // History Tab (only for existing expenses)
  const historyTab = (
    <div>
      <div className="sap-message-strip info" style={{ marginBottom: "16px" }}>
        <span className="sap-message-strip-icon">ℹ️</span>
        <span>{t("expenseForm.adminInfo")}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            {t("expenseForm.createdBy")}
          </div>
          <div style={{ fontWeight: "600", fontSize: "13px" }}>
            {formData.createdBy || "-"}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            {t("expenseForm.createdOn")}
          </div>
          <div style={{ fontWeight: "600", fontSize: "13px" }}>
            {formData.createdAt
              ? new Date(formData.createdAt).toLocaleString()
              : "-"}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            {t("expenseForm.lastUpdated")}
          </div>
          <div style={{ fontWeight: "600", fontSize: "13px" }}>
            {formData.updatedAt
              ? new Date(formData.updatedAt).toLocaleString()
              : "-"}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            {t("expenseForm.status")}
          </div>
          <div>
            <span
              className={`sap-badge ${formData.status === "approved"
                ? "success"
                : formData.status === "rejected"
                  ? "error"
                  : formData.status === "reimbursed"
                    ? "success"
                    : formData.status === "pending"
                      ? "warning"
                      : "info"
                }`}
            >
              {
                t(`expenseForm.${formData.status || "recorded"}`)
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { label: t("expenseForm.detailsTab"), icon: "📝", content: detailsTab },
    { label: t("expenseForm.notesTab"), icon: "🏷️", content: notesTab },
    ...(formData.id
      ? [{ label: t("expenseForm.historyTab"), icon: "📋", content: historyTab }]
      : []),
  ];

  const getModeTitle = () => {
    switch (mode) {
      case "create":
        return t("expenseForm.recordExpense");
      case "change":
        return t("expenseForm.editExpense");
      case "display":
        return t("expenseForm.viewExpense");
      default:
        return t("expenseForm.expense");
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "create":
        return "➕";
      case "change":
        return "✏️";
      case "display":
        return "👁️";
      default:
        return "💸";
    }
  };

  return (
    <div>
      <div className="sap-panel" style={{ marginBottom: "10px" }}>
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">{getModeIcon()}</span>
            {getModeTitle()} - VA0
            {mode === "create" ? "1" : mode === "change" ? "2" : "3"}
          </span>
          <div className="sap-panel-header-actions">
            <span
              className={`sap-badge ${mode === "create" ? "info" : mode === "change" ? "warning" : "success"}`}
            >
              {mode === "create" ? "NEW" : mode === "change" ? "EDIT" : "VIEW"}
            </span>
            {formData.amount && (
              <span
                className="sap-badge"
                style={{
                  marginLeft: "8px",
                  background: getCategoryInfo(formData.category).color,
                  color: "white",
                }}
              >
                {formData.currency} {parseFloat(formData.amount).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="sap-panel-content">
          {needsLoad ? (
            <div>
              <div
                className="sap-message-strip info"
                style={{ marginBottom: "16px" }}
              >
                <span className="sap-message-strip-icon">ℹ️</span>
                <span>
                  Enter an expense ID to load or search for existing expenses.
                </span>
              </div>

              <div
                className="sap-form-row"
                style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
              >
                <SapInput
                  label="Expense ID"
                  value={expenseId}
                  onChange={setExpenseId}
                  placeholder="EXP100000001"
                  icon="🔍"
                  onIconClick={() => {
                    setSearchResults(
                      getTableData("expenses").sort(
                        (a, b) => new Date(b.date) - new Date(a.date),
                      ),
                    );
                    setShowSearchModal(true);
                  }}
                />
                <SapButton onClick={loadExpense} type="primary" icon="📂">
                  Load
                </SapButton>
                <SapButton
                  type="search"
                  onClick={() => {
                    setSearchResults(
                      getTableData("expenses").sort(
                        (a, b) => new Date(b.date) - new Date(a.date),
                      ),
                    );
                    setShowSearchModal(true);
                  }}
                  icon="🔎"
                >
                  Search
                </SapButton>
              </div>
            </div>
          ) : (
            <>
              <SapTabs tabs={tabs} />
            </>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SapModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onConfirm={handleSearch}
        title="🔍 Search Expenses"
        width="800px"
        footer={
          <SapButton type="close" onClick={() => setShowSearchModal(false)}>
            Close
          </SapButton>
        }
      >
        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            className="sap-input"
            placeholder="🔍 Search by ID, description, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: "200px" }}
          />
          <select
            className="sap-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: isMobile ? "100%" : "180px" }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label[lang]}
              </option>
            ))}
          </select>
          <select
            className="sap-select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ width: isMobile ? "100%" : "180px" }}
          >
            {getMonthOptions().map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <SapButton onClick={handleSearch} type="close">
            Search
          </SapButton>
        </div>

        {/* Results */}
        <div className="sap-table-scroller">
          <table className="sap-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                {currentTransaction === "VA02" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "30px" }}
                  >
                    <div style={{ color: "var(--sap-text-secondary)" }}>
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                        📭
                      </div>
                      No expenses found
                    </div>
                  </td>
                </tr>
              ) : (
                searchResults.map((expense, index) => (
                  <tr
                    key={index}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleSelectExpense(expense);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ fontWeight: "600" }}>
                      {expense.expenseNumber}
                    </td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "2px 8px",
                          background: `${getCategoryInfo(expense.category).color}20`,
                          borderRadius: "4px",
                          fontSize: "11px",
                        }}
                      >
                        {getCategoryInfo(expense.category).label[lang]}
                      </span>
                    </td>
                    <td>{expense.description}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      {expense.currency} {parseFloat(expense.amount).toFixed(2)}
                    </td>

                    {currentTransaction === "VA02" && (
                      <td>
                        <span
                          style={{
                            marginLeft: "8px",
                            width: "4rem",
                            display: "inline-block",
                          }}
                        >
                          <SapButton
                            onClick={() => DeleteInSearchModal(expense.id)}
                            type="danger"
                          >
                            🗑️
                          </SapButton>
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {searchResults.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "var(--sap-content-bg)",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "12px", color: "var(--sap-text-secondary)" }}
            >
              {searchResults.length} expense(s) found
            </span>
            <span style={{ fontWeight: "600" }}>
              Total: ₹{" "}
              {searchResults
                .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
                .toFixed(2)}
            </span>
          </div>
        )}
      </SapModal>
    </div>
  );
};

// Need to import these for delete functionality
import { getAllData, saveAllData } from "../../utils/storage";

export default ExpenseTrackerScreen;

const generateExpenseReport = (expenses) => {
  // Calculate totals
  const totalAmount = expenses.reduce(
    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
    0,
  );
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + (parseFloat(exp.amount) || 0);
    return acc;
  }, {});

  // Summary table
  const tableRows = expenses
    .map(
      (expense, index) => `
      <tr>
        <td class="col-num">${expense.expenseNumber || `EXP-${index + 1}`}</td>
        <td class="col-date">${expense.date ? new Date(expense.date).toLocaleDateString() : "—"}</td>
        <td class="col-cat">${expense.category || "—"}</td>
        <td class="col-desc">${expense.description || "—"}</td>
        <td class="col-amount">${formatCurrency(expense.amount)}</td>
        <td class="col-status">${expense.status || "—"}</td>
      </tr>
    `,
    )
    .join("");

  // Category breakdown
  const categoryBreakdown = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([category, amount]) => `
      <div class="category-item">
        <span class="category-name">${capitalizeFirst(category)}</span>
        <span class="category-bar">
          <span class="bar-fill" style="width: ${(amount / totalAmount) * 100}%"></span>
        </span>
        <span class="category-amount">${formatCurrency(amount)}</span>
        <span class="category-percent">${((amount / totalAmount) * 100).toFixed(1)}%</span>
      </div>
    `,
    )
    .join("");

  // Detailed content
  const detailedContent = expenses
    .map(
      (expense, index) => `
      <div class="detail-section">
        <div class="detail-header">
          <span class="detail-num">${expense.expenseNumber || `EXP-${index + 1}`}</span>
          <span class="detail-status status-${(expense.status || "pending").toLowerCase()}">${expense.status || "Pending"}</span>
        </div>
        <div class="detail-row">
          <div class="detail-field">
            <span class="field-label">Date</span>
            <span class="field-value">${expense.date
          ? new Date(expense.date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          : "—"
        }</span>
          </div>
          <div class="detail-field">
            <span class="field-label">Category</span>
            <span class="field-value">${capitalizeFirst(expense.category) || "—"}</span>
          </div>
          <div class="detail-field">
            <span class="field-label">Amount</span>
            <span class="field-value amount">${formatCurrency(expense.amount)}</span>
          </div>
        </div>
        ${expense.description
          ? `
          <div class="detail-description">
            <span class="field-label">Description</span>
            <p>${expense.description}</p>
          </div>
        `
          : ""
        }
        ${expense.vendor
          ? `
          <div class="detail-extra">
            <span><strong>Vendor:</strong> ${expense.vendor}</span>
          </div>
        `
          : ""
        }
        ${expense.paymentMethod
          ? `
          <div class="detail-extra">
            <span><strong>Payment Method:</strong> ${expense.paymentMethod}</span>
          </div>
        `
          : ""
        }
        ${expense.receipt
          ? `
          <div class="detail-extra">
            <span><strong>Receipt:</strong> ✓ Attached</span>
          </div>
        `
          : ""
        }
        ${expense.notes
          ? `
          <div class="detail-notes">
            <span class="field-label">Notes</span>
            <p>${expense.notes}</p>
          </div>
        `
          : ""
        }
      </div>
    `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Expense Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            margin: 18mm;
            size: A4;
          }

          body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            padding: 30px;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.5;
          }

          /* Header */
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 3px solid #000000;
            margin-bottom: 24px;
          }

          .report-header h1 {
            font-size: 26px;
            font-weight: 700;
            color: #000000;
          }

          .report-header .subtitle {
            font-size: 12px;
            color: #666666;
            margin-top: 4px;
          }

          .report-header .info {
            text-align: right;
            font-size: 11px;
            color: #666666;
          }

          .report-header .info div {
            margin-bottom: 4px;
          }

          /* Stats Cards */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 30px;
          }

          .stat-card {
            background: #f8f8f8;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          }

          .stat-card.highlight {
            background: #000000;
            color: #ffffff;
            border-color: #000000;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 11px;
            color: #666666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .stat-card.highlight .stat-label {
            color: #cccccc;
          }

          /* Section Title */
          .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #333333;
            margin: 28px 0 14px;
            padding-bottom: 8px;
            border-bottom: 2px solid #000000;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          /* Category Breakdown */
          .category-breakdown {
            margin-bottom: 30px;
          }

          .category-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
          }

          .category-name {
            width: 120px;
            font-size: 13px;
            font-weight: 500;
          }

          .category-bar {
            flex: 1;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
          }

          .bar-fill {
            display: block;
            height: 100%;
            background: #000000;
            border-radius: 4px;
          }

          .category-amount {
            width: 100px;
            text-align: right;
            font-size: 13px;
            font-weight: 600;
          }

          .category-percent {
            width: 50px;
            text-align: right;
            font-size: 11px;
            color: #888888;
          }

          /* Summary Table */
          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
          }

          .summary-table th {
            background: #f5f5f5;
            padding: 12px 10px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #dddddd;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .summary-table td {
            padding: 10px;
            border: 1px solid #dddddd;
          }

          .summary-table tr:nth-child(even) {
            background: #fafafa;
          }

          .summary-table tr:hover {
            background: #f5f5f5;
          }

          .col-num { width: 120px; font-family: monospace; font-weight: 600; }
          .col-date { width: 100px; }
          .col-cat { width: 100px; text-transform: capitalize; }
          .col-desc { }
          .col-amount { width: 100px; text-align: right; font-weight: 600; font-family: monospace; }
          .col-status { width: 80px; text-align: center; text-transform: capitalize; }

          /* Table Total Row */
          .summary-table tfoot td {
            background: #000000;
            color: #ffffff;
            font-weight: 700;
            border-color: #000000;
          }

          /* Detail Sections */
          .detail-section {
            margin-bottom: 20px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            page-break-inside: avoid;
            background: #ffffff;
          }

          .detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #eeeeee;
          }

          .detail-num {
            background: #000000;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 6px;
            font-family: monospace;
            letter-spacing: 0.5px;
          }

          .detail-status {
            font-size: 11px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-pending { background: #fef3c7; color: #92400e; }
          .status-approved { background: #d1fae5; color: #065f46; }
          .status-rejected { background: #fee2e2; color: #991b1b; }
          .status-paid { background: #dbeafe; color: #1e40af; }

          .detail-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 16px;
          }

          .detail-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .field-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #888888;
            font-weight: 600;
          }

          .field-value {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: 500;
          }

          .field-value.amount {
            font-size: 18px;
            font-weight: 700;
            color: #000000;
            font-family: monospace;
          }

          .detail-description {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px dashed #e0e0e0;
          }

          .detail-description p {
            font-size: 13px;
            color: #444444;
            line-height: 1.6;
            margin-top: 6px;
          }

          .detail-extra {
            font-size: 12px;
            color: #666666;
            margin-top: 8px;
          }

          .detail-notes {
            margin-top: 12px;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 6px;
          }

          .detail-notes p {
            font-size: 12px;
            color: #555555;
            margin-top: 6px;
            font-style: italic;
          }

          /* Footer */
          .report-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #888888;
          }

          .signature-section {
            display: flex;
            gap: 60px;
            margin-top: 40px;
          }

          .signature-box {
            text-align: center;
          }

          .signature-line {
            width: 180px;
            border-top: 1px solid #000000;
            margin-bottom: 8px;
            padding-top: 8px;
          }

          .signature-label {
            font-size: 11px;
            color: #666666;
          }

          @media print {
            body { padding: 0; }
            .detail-section { break-inside: avoid; }
            .stats-grid { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div>
            <h1>💰 Expense Report</h1>
            <p class="subtitle">Financial Expense Summary & Details</p>
          </div>
          <div class="info">
            <div><strong>Report ID:</strong> RPT-${Date.now().toString().slice(-8)}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )}</div>
            <div><strong>Time:</strong> ${new Date().toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card highlight">
            <div class="stat-value">${formatCurrency(totalAmount)}</div>
            <div class="stat-label">Total Expenses</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${expenses.length}</div>
            <div class="stat-label">Total Entries</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Object.keys(categoryTotals).length}</div>
            <div class="stat-label">Categories</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(totalAmount / expenses.length)}</div>
            <div class="stat-label">Average</div>
          </div>
        </div>

        <h2 class="section-title">📊 Category Breakdown</h2>
        <div class="category-breakdown">
          ${categoryBreakdown}
        </div>

        <h2 class="section-title">📋 Summary Table</h2>
        <table class="summary-table">
          <thead>
            <tr>
              <th>Expense #</th>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right;">TOTAL</td>
              <td class="col-amount">${formatCurrency(totalAmount)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <h2 class="section-title">📝 Detailed Entries</h2>
        ${detailedContent}

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Submitted By</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Approved By</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Date</div>
          </div>
        </div>

        <div class="report-footer">
          <span>SAP GUI Expense Management System</span>
          <span>Confidential - For Internal Use Only</span>
          <span>— End of Report —</span>
        </div>
      </body>
    </html>
  `;

  return html;
};
