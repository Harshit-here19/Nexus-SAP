// src/components/Screens/DashboardScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTransaction } from "../../context/TransactionContext";
import { useAuth } from "../../context/AuthContext";
import { useAction } from "../../context/ActionContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useSettings } from "../../context/SettingsContext";
import SapButton from "../Common/SapButton";
import {
  getTableData,
  getUsers,
  getExpenseCategories,
  getExpenseStats,
} from "../../utils/storage";

import useTranslation from "../../hooks/useTranslation";

import ExportSpreadsheetModal from "../Common/ExportSpreadsheetModal";
import SpendingLineChart from "./Charts/SpendingLineChart";
import SpendingPieChart from "./Charts/SpendingPieChart";
import SpendingBarChart from "./Charts/SpendingBarChart";

import { exportExpenseSpreadsheet } from "../../utils/exportExcel";

import { generateDashboardReport } from "./GenerateDashboardReport";
import Screenshotable from "../Common/Screenshotable";

const isMobile = window.innerWidth <= 786;

const DashboardScreen = () => {
  const { navigateToTransaction, updateStatus } = useTransaction();
  const { user, checkIsAdmin } = useAuth();
  const { history, favorites } = useFavorites();
  const { registerAction, clearAction } = useAction();
  const { t } = useTranslation();

  const { settings } = useSettings();

  const lang = settings.language || "en";

  const printRef = useRef(null);
  const moreDialogRef = useRef(null);

  const openMoreFilters = () => {
    moreDialogRef.current?.showModal();
  };

  const closeMoreFilters = () => {
    moreDialogRef.current?.close();
  };

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showExportModal, setShowExportModal] = useState(false);

  const [pieData, setPieData] = useState([]);
  const [pieFilter, setPieFilter] = useState("month");

  const pieFilterOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "month", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "Full Report" },
  ];

  const [visibleFilters, setVisibleFilters] = useState(
    pieFilterOptions.slice(0, 3),
  );

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [lineData, setLineData] = useState([]);
  const [lineRange, setLineRange] = useState("10days");

  const hiddenFilters = pieFilterOptions.filter(
    (option) =>
      !visibleFilters.some((visible) => visible.value === option.value),
  );

  // SWAP LOGIC
  const selectHiddenFilter = (option) => {
    setPieFilter(option.value);

    setVisibleFilters((prev) => {
      const selectedIndex = prev.findIndex((item) => item.value === pieFilter);

      // If selected filter exists, replace it
      if (selectedIndex !== -1) {
        return prev.map((item, index) =>
          index === selectedIndex ? option : item,
        );
      }

      // Fallback: replace first item if current selection is not found
      return prev.map((item, index) => (index === 0 ? option : item));
    });

    closeMoreFilters();
  };

  const currentDate = new Date();

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  const [exportOptions, setExportOptions] = useState({
    fromDate: formatLocalDate(firstDayOfMonth),
    toDate: formatLocalDate(currentDate),
    format: "xlsx",

    fields: {
      expenseNumber: true,
      date: true,
      category: true,
      description: true,
      vendor: true,
      amount: true,
      currency: true,
      paymentMethod: true,
      status: true,
      notes: false,
    },
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    try {
      const expenseStats = getExpenseStats();
      setStats(expenseStats);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      updateStatus("Error loading dashboard data", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPieChartData();
    loadLineChartData();
  }, [pieFilter, lineRange]);

  const topCategoryDetails = getExpenseCategories().find(
    (cat) => cat.value === stats?.topCategory.name,
  );

  const loadPieChartData = () => {
    const expenses = getTableData("expenses");

    const today = new Date();
    let filtered = [...expenses];

    switch (pieFilter) {
      case "7days": {
        const from = new Date();
        from.setDate(today.getDate() - 7);

        filtered = expenses.filter(
          (e) => new Date(e.date) >= from && new Date(e.date) <= today,
        );
        break;
      }

      case "30days": {
        const from = new Date();
        from.setDate(today.getDate() - 29);

        filtered = expenses.filter(
          (e) => new Date(e.date) >= from && new Date(e.date) <= today,
        );
        break;
      }

      case "month":
        filtered = expenses.filter((e) => {
          const d = new Date(e.date);

          return (
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          );
        });
        break;

      case "lastMonth":
        filtered = expenses.filter((e) => {
          const d = new Date(e.date);

          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);

          return (
            d.getMonth() === lastMonth.getMonth() &&
            d.getFullYear() === lastMonth.getFullYear()
          );
        });
        break;

      case "year":
        filtered = expenses.filter((e) => {
          return new Date(e.date).getFullYear() === today.getFullYear();
        });
        break;

      case "all":
      default:
        filtered = expenses;
    }

    const categories = getExpenseCategories();

    const totalAmount = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

    const breakdown = categories
      .map((category) => {
        const categoryExpenses = filtered.filter(
          (e) => e.category === category.value,
        );

        const total = categoryExpenses.reduce(
          (sum, e) => sum + Number(e.amount),
          0,
        );

        return {
          ...category,
          total,
          percentage:
            totalAmount > 0 ? ((total / totalAmount) * 100).toFixed(1) : 0,
        };
      })
      .filter((c) => c.total > 0);

    setPieData(breakdown);
  };

  const loadLineChartData = () => {
    const expenses = getTableData("expenses");
    const today = new Date();

    const daysCount =
      {
        "7days": 7,
        "10days": 10,
        "30days": 30,
      }[lineRange] || 10;

    const chartData = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);

      date.setDate(today.getDate() - i);

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      const total = expenses
        .filter((e) => e.date === dateKey)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      chartData.push({
        date: dateKey,

        label: date.toLocaleDateString("en", {
          day: "numeric",
          month: "short",
        }),

        total,
      });
    }

    setLineData(chartData);
  };

  useEffect(() => {
    registerAction("PRINT", () => {
      printRef.current?.();
    });

    return () => {
      clearAction("PRINT");
    };
  }, [registerAction, clearAction]);

  // Print Dashboard Report
  printRef.current = () => {
    try {
      const stats = getExpenseStats();

      if (!stats) {
        alert("No dashboard data available!");
        return;
      }

      const user = {
        name: "System User", // replace with useAuth() user if needed
      };

      const html = generateDashboardReport(stats, user, "color"); // or "mono"

      const printWindow = window.open("", "_blank", "width=900,height=700");

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      // Optional auto-print (recommended for production)
      // setTimeout(() => {
      //   printWindow.print();
      // }, 300);
    } catch (error) {
      console.error("Print dashboard error:", error);
      alert("Failed to generate dashboard report");
    }
  };

  // Quick action handler
  const handleQuickAction = (tcode) => {
    navigateToTransaction(tcode, true);
  };

  // Format currency
  const formatCurrency = (value, compact = false) => {
    if (compact && value >= 1000) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <div className="sap-spinner"></div>
      </div>
    );
  }

  const handleExport = () => {
    const expenses = getTableData("expenses");

    try {
      if (!exportOptions.fromDate || !exportOptions.toDate) {
        // updateStatus("Please select posting date range", "error");
        throw new Error("Please select posting date range");
      }

      if (new Date(exportOptions.fromDate) > new Date(exportOptions.toDate)) {
        // updateStatus("From date cannot be greater than To date", "error");
        throw new Error("From date cannot be greater than To date");
      }

      exportExpenseSpreadsheet(expenses, exportOptions);

      setShowExportModal(false);

      updateStatus("Spreadsheet exported successfully", "success");
    } catch (err) {
      console.log(err.message);
      updateStatus(err.message, "error");
    }
  };

  // 1. Calculate the total from pieData
  const pieTotal = pieData.reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "6px",
          padding: "16px 20px",
          marginBottom: "12px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ marginBottom: isMobile ? "10px" : "0px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            💰 {t("dashboard.title")}
          </h2>
          <p style={{ margin: "4px 0 0", opacity: 0.9, fontSize: "12px" }}>
            {t("dashboard.subtitle")} •{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <SapButton
            onClick={() => handleQuickAction("VA01")}
            type="gold"
            icon="➕"
          >
            {t("dashboard.addExpense")}
          </SapButton>
          <SapButton onClick={loadDashboardData} icon="🔄" type="search">
            {t("dashboard.refresh")}
          </SapButton>
          <SapButton
            icon="📊"
            onClick={() => setShowExportModal(true)}
            type="success"
            style={{ backgroundColor: "green" }}
          >
            {t("dashboard.exportSpreadsheet")}
          </SapButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        {/* This Month */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">This Month</span>
            <div
              className="dashboard-card-icon"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              📅
            </div>
          </div>
          <div className="dashboard-card-value">
            {formatCurrency(stats?.totalThisMonth || 0)}
          </div>
          <div
            className={`dashboard-card-change ${stats?.monthChange >= 0 ? "negative" : "positive"}`}
          >
            <span>{stats?.monthChange >= 0 ? "↗" : "↘"}</span>
            {Math.abs(stats?.monthChange || 0)}% vs {t("dashboard.lastMonth")}
          </div>
        </div>

        {/* Last Month */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              {t("dashboard.lastMonth")}
            </span>
            <div
              className="dashboard-card-icon"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              📆
            </div>
          </div>
          <div className="dashboard-card-value">
            {formatCurrency(stats?.totalLastMonth || 0)}
          </div>
          <div className="dashboard-card-change">
            <span>📊</span> {t("dashboard.comparisonBaseline")}
          </div>
        </div>

        {/* This Year */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              {t("dashboard.thisYear")}
            </span>
            <div
              className="dashboard-card-icon"
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
              }}
            >
              📈
            </div>
          </div>
          <div className="dashboard-card-value">
            {formatCurrency(stats?.totalThisYear || 0, true)}
          </div>
          <div className="dashboard-card-change">
            <span>🗓️</span> {t("dashboard.yearToDate")}
          </div>
        </div>

        {/* Average */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              {t("dashboard.projectedMonthEnd")}
            </span>
            <div
              className="dashboard-card-icon"
              style={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
              }}
            >
              📉
            </div>
          </div>
          <div className="dashboard-card-value">
            {formatCurrency(stats?.projectedMonthEnd || 0)}
          </div>
          <div className="dashboard-card-change">
            <span>📝</span> {t("dashboard.perTransaction")}
          </div>
        </div>

        {/* Total Expenses Count */}
        <div
          className="dashboard-card"
          onClick={() => handleQuickAction("VA03")}
          style={{ cursor: "pointer" }}
        >
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              {t("dashboard.totalEntries")}
            </span>
            <div
              className="dashboard-card-icon"
              style={{
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                color: "white",
              }}
            >
              🧾
            </div>
          </div>
          <div className="dashboard-card-value">{stats?.expenseCount || 0}</div>
          <div className="dashboard-card-change">
            <span>📋</span> {stats?.thisMonthCount || 0}{" "}
            {t("dashboard.thisMonth")}
          </div>
        </div>

        {/* All Time */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              {t("dashboard.allTime")}
            </span>
            <div
              className="dashboard-card-icon"
              style={{
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                color: "#333",
              }}
            >
              💵
            </div>
          </div>
          <div className="dashboard-card-value">
            {formatCurrency(stats?.totalAllTime || 0, true)}
          </div>
          <div className="dashboard-card-change">
            <span>∞</span> {t("dashboard.lifetimeSpending")}
          </div>
        </div>

        {/* Top Category Spend */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              {t("dashboard.topCategory")}
            </span>
            <div
              className="dashboard-card-icon"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              💳
            </div>
          </div>

          <div
            className="dashboard-card-value"
            style={{ textTransform: "capitalize" }}
          >
            {topCategoryDetails?.label?.[lang] ||
              stats?.topCategory?.name ||
              "-"}
          </div>

          <div className="dashboard-card-change">
            <span>💰</span> {formatCurrency(stats?.topCategory?.amount || 0)}{" "}
            {t("dashboard.spent")}
          </div>
        </div>

        {/* Average Daily Spend */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              {t("dashboard.avgDailySpend")}
            </span>
            <div
              className="dashboard-card-icon"
              style={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "#333",
              }}
            >
              🧾
            </div>
          </div>

          <div className="dashboard-card-value">
            {formatCurrency(stats?.averageDailySpend || 0)}
          </div>

          <div className="dashboard-card-change">
            <span>📅</span> {t("dashboard.perDayAverage")}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "18px",
          marginBottom: "18px",
          alignItems: "stretch",
        }}
      >
        {/* Expenses by Category */}
        <div className="chart-container">
          <div className="chart-title">
            <span>📊</span> {t("dashboard.expensesByCategory")} (
            {t("dashboard.thisMonth")})
          </div>
          {pieData.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                  padding: "4px",
                  background: "rgba(255,255,255,0.45)",
                  borderRadius: "12px",
                  backdropFilter: "blur(8px)",
                }}
              >
                {visibleFilters.map((option) => (
                  <SapButton
                    key={option.value}
                    type={pieFilter === option.value ? "glass-active" : "glass"}
                    onClick={() => setPieFilter(option.value)}
                  >
                    {option.label}
                  </SapButton>
                ))}

                <SapButton type="glass" onClick={openMoreFilters}>
                  ⋯ More
                </SapButton>
              </div>

              <dialog
                ref={moreDialogRef}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeMoreFilters();
                  }
                }}
                style={{
                  margin: "auto",
                  border: "none",
                  borderRadius: "18px",
                  padding: "22px",
                  width: "320px",
                  maxWidth: "90vw",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,.96), rgba(248,250,252,.92))",
                  boxShadow:
                    "0 25px 80px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.8)",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "14px",
                    color: "#111827",
                  }}
                >
                  More Filters
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {hiddenFilters.map((option) => (
                    <SapButton
                      className="filter-option"
                      key={option.value}
                      type="glass"
                      onClick={() => selectHiddenFilter(option)}
                    >
                      {option.label}
                    </SapButton>
                  ))}
                </div>

                <SapButton
                  type="glass"
                  style={{
                    marginTop: "14px",
                    width: "100%",
                  }}
                  onClick={closeMoreFilters}
                >
                  Close
                </SapButton>
              </dialog>

              <Screenshotable filename="pie-chart.png">
                <div className="pie-chart-container">
                  <SpendingPieChart
                    data={pieData}
                    total={pieTotal}
                    formatCurrency={formatCurrency}
                    lang={lang}
                  />
                </div>
              </Screenshotable>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "var(--sap-text-secondary)",
                borderRadius: "16px",
                background:
                  "linear-gradient(180deg, rgba(248,250,252,.9), rgba(241,245,249,.8))",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "14px",
                }}
              >
                📭
              </div>

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  marginBottom: "18px",
                }}
              >
                {t("dashboard.noExpensesThisMonth")}
              </div>

              <SapButton
                onClick={() => handleQuickAction("VA01")}
                type="glass-active"
              >
                {t("dashboard.recordFirstExpense")}
              </SapButton>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        {stats?.monthlyTrend?.length > 0 ? (
          <Screenshotable filename="bar-chart.png">
            <SpendingBarChart
              data={stats.monthlyTrend}
              title={<>📈 {t("dashboard.monthlyTrend")}</>}
              subtitle={t("dashboard.lastSixMonths")}
              formatCurrency={formatCurrency}
            />
          </Screenshotable>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              color: "var(--sap-text-secondary)",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "8px",
              }}
            >
              📊
            </div>

            <div>{t("dashboard.noTrendData")}</div>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "12px",
        }}
      >
        {/* Recent Expenses */}
        <div className="chart-container">
          <div className="chart-title">
            <span>🧾</span> {t("dashboard.recentExpenses")}
          </div>
          {stats?.recentExpenses?.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table className="sap-table" style={{ fontSize: "11px" }}>
                <thead>
                  <tr>
                    <th>{t("dashboard.date")}</th>
                    <th>{t("dashboard.category")}</th>
                    <th>{t("dashboard.description")}</th>
                    <th style={{ textAlign: "right" }}>
                      {t("dashboard.amount")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentExpenses.slice(0, 8).map((expense, index) => {
                    const category = getExpenseCategories().find(
                      (c) => c.value === expense.category,
                    );
                    return (
                      <tr key={index}>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 6px",
                              background: `${category?.color || "#9e9e9e"}20`,
                              borderRadius: "3px",
                              fontSize: "10px",
                            }}
                          >
                            {category?.label[lang]?.split(" ")[0]}{" "}
                            {expense.category}
                          </span>
                        </td>
                        <td
                          style={{
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {expense.description}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: "600",
                            color: category?.color,
                          }}
                        >
                          {expense.currency}{" "}
                          {parseFloat(expense.amount).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "var(--sap-text-secondary)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
              <div>{t("dashboard.noExpensesRecorded")}</div>
            </div>
          )}
          {stats?.recentExpenses?.length > 0 && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <SapButton
                onClick={() => handleQuickAction("VA03")}
                icon="👁️"
                type="glass"
              >
                {t("dashboard.viewAllExpenses")}
              </SapButton>
            </div>
          )}
        </div>

        {/* Quick Actions & Payment Methods */}
        <div className="chart-container">
          <div className="chart-title">
            <span>⚡</span> {t("dashboard.quickActions")}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <SapButton
              onClick={() => handleQuickAction("VA01")}
              type="glass-active"
              icon="➕"
              style={{ justifyContent: "flex-start" }}
            >
              {t("dashboard.addExpense")}
            </SapButton>
            <SapButton
              onClick={() => handleQuickAction("VA02")}
              type="glass"
              icon="✏️"
              style={{ justifyContent: "flex-start" }}
            >
              {t("dashboard.editExpense")}
            </SapButton>
            <SapButton
              onClick={() => handleQuickAction("VA03")}
              type="glass"
              icon="👁️"
              style={{ justifyContent: "flex-start" }}
            >
              {t("dashboard.viewExpenses")}
            </SapButton>
            <SapButton
              onClick={() => handleQuickAction("SE16")}
              type="glass"
              icon="🔍"
              style={{ justifyContent: "flex-start" }}
            >
              {t("dashboard.dataBrowser")}
            </SapButton>
          </div>

          {/* Payment Methods Breakdown */}
          {stats?.paymentBreakdown?.length > 0 && (
            <>
              <div className="chart-title" style={{ marginTop: "16px" }}>
                <span>💳</span> {t("dashboard.paymentMethods")} (
                {t("dashboard.thisMonth")})
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {stats.paymentBreakdown.slice(0, 5).map((method, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      background: "var(--sap-content-bg)",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <span>{method.label[lang]}</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--sap-text-secondary)",
                          fontSize: "11px",
                        }}
                      >
                        {method.count} {t("dashboard.transactions")}
                      </span>
                      <span style={{ fontWeight: "600" }}>
                        {formatCurrency(method.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Category Quick Stats */}
          <div className="chart-title" style={{ marginTop: "16px" }}>
            <span>🏷️</span> {t("dashboard.topCategories")}
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {pieData.slice(0, 5).map((cat, index) => (
                <span
                  key={index}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}40`,
                    borderRadius: "16px",
                    fontSize: "11px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: cat.color,
                    }}
                  />
                  {cat.label[lang].split(" ").slice(1).join(" ")}:{" "}
                  {formatCurrency(cat.total, true)}
                </span>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "16px",
                color: "var(--sap-text-secondary)",
                fontSize: "12px",
              }}
            >
              {t("dashboard.noCategoryData")}
            </div>
          )}
        </div>
      </div>

      <Screenshotable filename="line-chart.png">
        <SpendingLineChart
          data={lineData}
          title="Spending Trend"
          range={lineRange}
          setRange={setLineRange}
          height={window.innerWidth < 600 ? 360 : 300}
        />
      </Screenshotable>

      {/* Admin Section */}
      {checkIsAdmin() && (
        <div className="chart-container" style={{ marginTop: "12px" }}>
          <div className="chart-title">
            <span>🔐</span> {t("dashboard.adminQuickAccess")}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <SapButton onClick={() => handleQuickAction("ZADMIN")} icon="👥">
              {t("dashboard.userManagement")}
            </SapButton>
            <SapButton onClick={() => handleQuickAction("SE16")} icon="🗄️">
              {t("dashboard.dataBrowser")}
            </SapButton>
            <SapButton onClick={() => handleQuickAction("SU01")} icon="⚙️">
              {t("dashboard.settings")}
            </SapButton>
          </div>
        </div>
      )}

      <ExportSpreadsheetModal
        open={showExportModal}
        options={exportOptions}
        setOptions={setExportOptions}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default DashboardScreen;
