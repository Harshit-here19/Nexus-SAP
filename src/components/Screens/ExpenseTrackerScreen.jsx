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
import {
  getTableData,
  addRecord,
  updateRecord,
  findRecord,
  generateNextNumber,
  getExpenseCategories,
  getPaymentMethods,
} from "../../utils/storage";

const ExpenseTrackerScreen = ({ mode = "create" }) => {
  const { updateStatus, markAsChanged, markAsSaved, goBack, currentTransaction } = useTransaction();
  const { user } = useAuth();
  const { registerAction, clearAction } = useAction();
  const confirm = useConfirm();

  const saveRef = useRef(null);
  const clearRef = useRef(null);
  const deleteRef = useRef(null);

  const [expenseId, setExpenseId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  // Form data
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});
  const categories = getExpenseCategories();
  const paymentMethods = getPaymentMethods();

  // Handle form field change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    markAsChanged();
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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
    expenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  // Clear form
  clearRef.current = () => {
    setFormData({
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
    setExpenseId("");
    setIsLoaded(false);
    setErrors({});
    markAsSaved();
    updateStatus("Form cleared", "info");
  };

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

    return () => {
      clearAction("SAVE");
      clearAction("CLEAR");
      clearAction("DELETE");
    };
  }, []);

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

  const isReadOnly = mode === "display";
  const needsLoad = (mode === "change" || mode === "display") && !isLoaded;

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return (
      categories.find((c) => c.value === categoryValue) || {
        label: categoryValue,
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

  // Details Tab
  const detailsTab = (
    <div className="sap-form">
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
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
            <span>📝</span> Expense Details
          </h4>

          <SapInput
            label="Expense ID"
            value={formData.expenseNumber}
            readOnly={true}
            placeholder="Auto-generated"
          />

          <SapInput
            label="Date"
            value={formData.date}
            onChange={(val) => handleChange("date", val)}
            type="date"
            required={true}
            disabled={isReadOnly}
            error={errors.date}
          />

          <SapSelect
            label="Category"
            value={formData.category}
            onChange={(val) => handleChange("category", val)}
            options={categories.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            required={true}
            disabled={isReadOnly}
            placeholder="Select category..."
          />

          <SapInput
            label="Description"
            value={formData.description}
            onChange={(val) => handleChange("description", val)}
            required={true}
            disabled={isReadOnly}
            error={errors.description}
            placeholder="What was this expense for?"
          />

          <SapInput
            label="Vendor/Merchant"
            value={formData.vendor}
            onChange={(val) => handleChange("vendor", val)}
            disabled={isReadOnly}
            placeholder="Where did you spend?"
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
            <span>💰</span> Payment Information
          </h4>

          <div className="sap-form-group">
            <label className="sap-form-label required">Amount</label>
            <div
              className="sap-form-field"
              style={{ display: "flex", gap: "8px" }}
            >
              <select
                className="sap-select"
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                disabled={isReadOnly}
                style={{ width: "80px" }}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="JPY">JPY</option>
              </select>
              <input
                type="number"
                className={`sap-input ${errors.amount ? "error" : ""}`}
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                disabled={isReadOnly}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{ flex: 1 }}
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
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(val) => handleChange("paymentMethod", val)}
            options={paymentMethods.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
            required={true}
            disabled={isReadOnly}
            placeholder="How did you pay?"
          />

          <SapInput
            label="Receipt Number"
            value={formData.receiptNumber}
            onChange={(val) => handleChange("receiptNumber", val)}
            disabled={isReadOnly}
            placeholder="Optional receipt/invoice number"
          />

          <SapSelect
            label="Status"
            value={formData.status}
            onChange={(val) => handleChange("status", val)}
            options={[
              { value: "recorded", label: "📝 Recorded" },
              { value: "pending", label: "⏳ Pending Review" },
              { value: "approved", label: "✅ Approved" },
              { value: "rejected", label: "❌ Rejected" },
              { value: "reimbursed", label: "💰 Reimbursed" },
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
            {getCategoryInfo(formData.category).label.split(" ")[0]}
          </span>
          <div>
            <div style={{ fontWeight: "600", fontSize: "13px" }}>
              {getCategoryInfo(formData.category).label}
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
        <label className="sap-form-label">Notes</label>
        <div className="sap-form-field">
          <textarea
            className="sap-textarea"
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            disabled={isReadOnly}
            placeholder="Add any additional notes about this expense..."
            rows={5}
            style={{ width: "100%", maxWidth: "500px" }}
          />
        </div>
      </div>

      <SapInput
        label="Tags"
        value={formData.tags}
        onChange={(val) => handleChange("tags", val)}
        disabled={isReadOnly}
        placeholder="Comma-separated tags (e.g., business, trip, client)"
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
          <span style={{ fontSize: "13px" }}>This is a recurring expense</span>
        </label>
      </div>

      {formData.isRecurring && (
        <SapSelect
          label="Frequency"
          value={formData.recurringFrequency}
          onChange={(val) => handleChange("recurringFrequency", val)}
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "yearly", label: "Yearly" },
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
        <span>Administrative information about this expense record.</span>
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
            Created By
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
            Created On
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
            Last Updated
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
            Status
          </div>
          <div>
            <span
              className={`sap-badge ${
                formData.status === "approved"
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
              {formData.status || "recorded"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { label: "Details", icon: "📝", content: detailsTab },
    { label: "Notes & Tags", icon: "🏷️", content: notesTab },
    ...(formData.id
      ? [{ label: "History", icon: "📋", content: historyTab }]
      : []),
  ];

  const getModeTitle = () => {
    switch (mode) {
      case "create":
        return "Record Expense";
      case "change":
        return "Edit Expense";
      case "display":
        return "View Expense";
      default:
        return "Expense";
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
      <div className="sap-panel">
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
        title="🔍 Search Expenses"
        width="800px"
        footer={
          <SapButton onClick={() => setShowSearchModal(false)}>Close</SapButton>
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
            style={{ width: "180px" }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            className="sap-select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ width: "180px" }}
          >
            {getMonthOptions().map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <SapButton onClick={handleSearch} type="primary">
            Search
          </SapButton>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "400px", overflow: "auto" }}>
          <table className="sap-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Action</th>
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
                  <tr key={index}>
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
                        {getCategoryInfo(expense.category).label}
                      </span>
                    </td>
                    <td>{expense.description}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      {expense.currency} {parseFloat(expense.amount).toFixed(2)}
                    </td>
                    
                    <td>
                      <span style={{ marginRight: "8px" }}>
                      <SapButton
                        onClick={() => handleSelectExpense(expense)}
                        type="primary"
                      >
                        👁️
                      </SapButton>
                      </span>
                      {currentTransaction === "VA02" && (<span style={{ marginLeft: "8px" }}>
                        <SapButton
                        onClick={() => DeleteInSearchModal(expense.id)}
                        type="danger"
                      >
                        🗑️
                      </SapButton>
                      </span>)}
                    </td>
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
              Total: INR{" "}
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
