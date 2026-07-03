export const generateDashboardReport = (
  stats,
  user = null,
  theme = "color",
) => {
  /* -------------------------------------------------------------------------- */
  /*                               Helper Methods                               */
  /* -------------------------------------------------------------------------- */

  const formatCurrency = (value, compact = false) => {
    const amount = Number(value || 0);

    if (compact && amount >= 1000) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(amount);
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value || 0));

  const capitalizeFirst = (text) => {
    if (!text) return "—";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const safePercentage = (value) => Number(value || 0).toFixed(1);

  const reportId = `DBR-${Date.now().toString().slice(-8)}`;

  /* -------------------------------------------------------------------------- */
  /*                                Theme Setup                                 */
  /* -------------------------------------------------------------------------- */

  const themes = {
    mono: {
      primary: "#000000",
      secondary: "#444444",
      accent: "#666666",
      background: "#ffffff",
      card: "#f7f7f7",
      border: "#dddddd",
      text: "#1a1a1a",
      muted: "#777777",
    },

    color: {
      primary: "#4f46e5",
      secondary: "#2563eb",
      accent: "#10b981",
      background: "#ffffff",
      card: "#f8fafc",
      border: "#e5e7eb",
      text: "#111827",
      muted: "#6b7280",
    },
  };

  const colors = themes[theme] || themes.color;

  /* -------------------------------------------------------------------------- */
  /*                             Dashboard Metrics                              */
  /* -------------------------------------------------------------------------- */

  const dashboard = {
    totalThisMonth: stats?.totalThisMonth || 0,

    totalLastMonth: stats?.totalLastMonth || 0,

    totalThisYear: stats?.totalThisYear || 0,

    totalAllTime: stats?.totalAllTime || 0,

    averageExpense: stats?.averageExpense || 0,

    averageDailySpend: stats?.averageDailySpend || 0,

    expenseCount: stats?.expenseCount || 0,

    monthChange: stats?.monthChange || 0,

    thisMonthCount: stats?.thisMonthCount || 0,

    topCategory: stats?.topCategory || {
      name: "—",
      amount: 0,
    },
  };

  /* -------------------------------------------------------------------------- */
  /*                               Report Arrays                                */
  /* -------------------------------------------------------------------------- */

  const categoryBreakdown = stats?.categoryBreakdown || [];

  const monthlyTrend = stats?.monthlyTrend || [];

  const paymentBreakdown = stats?.paymentBreakdown || [];

  const recentExpenses = stats?.recentExpenses || [];

  /* -------------------------------------------------------------------------- */
  /*                              Executive Cards                               */
  /* -------------------------------------------------------------------------- */

  const executiveCards = [
    {
      title: "This Month",
      value: formatCurrency(dashboard.totalThisMonth),
      icon: "📅",
    },

    {
      title: "Last Month",
      value: formatCurrency(dashboard.totalLastMonth),
      icon: "📆",
    },

    {
      title: "This Year",
      value: formatCurrency(dashboard.totalThisYear, true),
      icon: "📈",
    },

    {
      title: "All Time",
      value: formatCurrency(dashboard.totalAllTime, true),
      icon: "💰",
    },

    {
      title: "Average Expense",
      value: formatCurrency(dashboard.averageExpense),
      icon: "🧾",
    },

    {
      title: "Average Daily",
      value: formatCurrency(dashboard.averageDailySpend),
      icon: "📉",
    },

    {
      title: "Total Entries",
      value: formatNumber(dashboard.expenseCount),
      icon: "📋",
    },

    {
      title: "Top Category",
      value: capitalizeFirst(dashboard.topCategory.name),
      icon: "🏷️",
    },
  ];

  /* -------------------------------------------------------------------------- */
  /*                              Financial Summary                             */
  /* -------------------------------------------------------------------------- */

  const financialSummary = [
    {
      label: "This Month",
      value: formatCurrency(dashboard.totalThisMonth),
    },

    {
      label: "Last Month",
      value: formatCurrency(dashboard.totalLastMonth),
    },

    {
      label: "Year To Date",
      value: formatCurrency(dashboard.totalThisYear),
    },

    {
      label: "All Time Spending",
      value: formatCurrency(dashboard.totalAllTime),
    },

    {
      label: "Average Expense",
      value: formatCurrency(dashboard.averageExpense),
    },

    {
      label: "Average Daily Spend",
      value: formatCurrency(dashboard.averageDailySpend),
    },

    {
      label: "Total Transactions",
      value: formatNumber(dashboard.expenseCount),
    },

    {
      label: "Monthly Change",
      value: `${dashboard.monthChange >= 0 ? "+" : ""}${safePercentage(
        dashboard.monthChange,
      )}%`,
    },
  ];

  /* -------------------------------------------------------------------------- */
  /*                           Category Breakdown HTML                          */
  /* -------------------------------------------------------------------------- */

  const categoryHTML = categoryBreakdown
    .map(
      (cat) => `
      <div class="category-item">
          <div class="category-left">
              <span class="category-name">${cat.label}</span>

              <div class="category-progress">
                  <div
                      class="category-progress-fill"
                      style="
                          width:${cat.percentage}%;
                          background:${theme === "mono" ? "#000" : cat.color};
                      ">
                  </div>
              </div>
          </div>

          <div class="category-right">
              <div>${formatCurrency(cat.total)}</div>
              <small>${cat.percentage}%</small>
          </div>
      </div>
`,
    )
    .join("");

  /* -------------------------------------------------------------------------- */
  /*                           Monthly Trend Table                              */
  /* -------------------------------------------------------------------------- */

  const monthlyTrendHTML = monthlyTrend
    .map(
      (month) => `
<tr>
    <td>${month.month}</td>
    <td class="text-right">${formatCurrency(month.total)}</td>
</tr>
`,
    )
    .join("");

  /* -------------------------------------------------------------------------- */
  /*                          Payment Method Table                              */
  /* -------------------------------------------------------------------------- */

  const paymentHTML = paymentBreakdown
    .map(
      (method) => `
<tr>
    <td>${method.label}</td>
    <td class="text-center">${method.count}</td>
    <td class="text-right">${formatCurrency(method.total)}</td>
</tr>
`,
    )
    .join("");

  /* -------------------------------------------------------------------------- */
  /*                          Recent Expenses Table                             */
  /* -------------------------------------------------------------------------- */

  const recentExpenseHTML = recentExpenses
    .map(
      (expense) => `
<tr>
    <td>${new Date(expense.date).toLocaleDateString()}</td>

    <td>${capitalizeFirst(expense.category)}</td>

    <td>${expense.description || "—"}</td>

    <td class="text-right">
        ${expense.currency || "INR"} ${Number(expense.amount).toFixed(2)}
    </td>
</tr>
`,
    )
    .join("");

  /* -------------------------------------------------------------------------- */
  /*                              Report Insights                               */
  /* -------------------------------------------------------------------------- */

  const insights = [
    `Highest spending category is ${capitalizeFirst(
      dashboard.topCategory.name,
    )}.`,

    `Total expenses recorded: ${formatNumber(dashboard.expenseCount)}.`,

    `Average expense per transaction is ${formatCurrency(
      dashboard.averageExpense,
    )}.`,

    `Average daily spend is ${formatCurrency(
      dashboard.averageDailySpend,
    )}.`,

    `Monthly spending changed by ${dashboard.monthChange >= 0 ? "▲" : "▼"
    } ${Math.abs(dashboard.monthChange).toFixed(1)}%.`,
  ];

  /* -------------------------------------------------------------------------- */
  /*                         HTML Starts In Part 2                              */
  /* -------------------------------------------------------------------------- */

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <title>Expense Dashboard Report</title>
  <style>

  :root{
    --primary:${colors.primary};
    --secondary:${colors.secondary};
    --accent:${colors.accent};

    --background:${colors.background};
    --card:${colors.card};
    --border:${colors.border};

    --text:${colors.text};
    --muted:${colors.muted};
  }

  *{
    margin:0;
    padding:0;
    box-sizing:border-box;
  }

  @page{
    size:A4;
    margin:18mm;
  }

  body{
    font-family:'Segoe UI',Tahoma,sans-serif;
    background:var(--background);
    color:var(--text);
    font-size:13px;
    line-height:1.5;
    padding: 20px;
  }

  .report-header{

  display:flex;

  justify-content:space-between;

  align-items:flex-start;

  padding-bottom:20px;

  margin-bottom:24px;

  border-bottom:3px solid var(--primary);

  }

  .header-left h1{

  font-size:28px;

  font-weight:700;

  margin-bottom:6px;

  color:var(--primary);

  }

  .header-left p{

  font-size:12px;

  color:var(--muted);

  }

  .header-right{

  text-align:right;

  font-size:11px;

  color:var(--muted);

  }

  .header-right div{

  margin-bottom:5px;

  }

  .executive-summary{

  margin-top:15px;

  margin-bottom:25px;

  padding:18px;

  background:var(--card);

  border:1px solid var(--border);

  border-radius:10px;

  }

  .executive-summary h2{

  font-size:16px;

  margin-bottom:8px;

  color:var(--primary);

  }

  .executive-summary p{

  font-size:12px;

  color:var(--muted);

  }

  .stats-grid{

  display:grid;

  grid-template-columns:repeat(4,1fr);

  gap:15px;

  margin-top:25px;

  margin-bottom:30px;

  }

  .stat-card{

  background:var(--card);

  border:1px solid var(--border);

  border-radius:10px;

  padding:18px;

  text-align:center;

  page-break-inside:avoid;

  }

  .stat-card.highlight{

  background:var(--primary);

  color:white;

  }

  .stat-icon{

  font-size:26px;

  margin-bottom:10px;

  }

  .stat-title{

  font-size:11px;

  text-transform:uppercase;

  letter-spacing:.5px;

  margin-bottom:8px;

  color:inherit;

  opacity:.8;

  }

  .stat-value{

  font-size:23px;

  font-weight:700;

  word-break:break-word;

  }

  .section-title{

  margin-top:32px;

  margin-bottom:16px;

  padding-bottom:8px;

  border-bottom:2px solid var(--primary);

  font-size:16px;

  font-weight:700;

  color:var(--primary);

  text-transform:uppercase;

  letter-spacing:.8px;

  }

  table{

  width:100%;

  border-collapse:collapse;

  font-size:12px;

  }

  thead{

  background:var(--primary);

  color:white;

  }

  th{

  padding:10px;

  text-align:left;

  }

  td{

  padding:9px;

  border:1px solid var(--border);

  }

  tbody tr:nth-child(even){

  background:#fafafa;

  }

  .text-right{

  text-align:right;

  }

  .text-center{

  text-align:center;

  }

  .category-breakdown{
    display:flex;
    flex-direction:column;
    gap:14px;
    margin-bottom:25px;
    }

    .category-item{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:20px;
    padding:12px 0;
    border-bottom:1px solid var(--border);
    }

    .category-left{
    flex:1;
    }

    .category-name{
    font-weight:600;
    margin-bottom:6px;
    display:block;
    }

    .category-progress{
    height:10px;
    background:#ececec;
    border-radius:20px;
    overflow:hidden;
    }

    .category-progress-fill{
    height:100%;
    border-radius:20px;
    }

    .category-right{
    width:140px;
    text-align:right;
    font-weight:600;
    }

    .empty-state{
    padding:30px;
    text-align:center;
    border:1px dashed var(--border);
    background:var(--card);
    border-radius:8px;
    color:var(--muted);
    }

  </style>

  </head>

  <body>

  <div class="report-header">

  <div class="header-left">

  <h1>📊 Expense Dashboard Report</h1>

  <p>
  Executive Financial Analytics & Dashboard Summary
  </p>

  </div>

  <div class="header-right">

  <div>
  <strong>Report ID :</strong>
  ${reportId}
  </div>

  <div>
  <strong>Generated :</strong>
  ${new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })}
  </div>

  <div>
  <strong>Time :</strong>
  ${new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    })}
  </div>

  <div>
  <strong>User :</strong>
  ${user?.name || user?.username || "System"}
  </div>

  </div>

  </div>


  <div class="executive-summary">

  <h2>Executive Summary</h2>

  <p>

  This report provides a consolidated overview of expense performance,
  spending trends, category distribution, payment analysis,
  and recent financial activity generated from the SAP Expense
  Management Dashboard.

  </p>

  </div>


  <div class="stats-grid">

  ${executiveCards.map((card, index) => `

  <div class="stat-card ${index === 0 ? "highlight" : ""}">

  <div class="stat-icon">

  ${card.icon}

  </div>

  <div class="stat-title">

  ${card.title}

  </div>

  <div class="stat-value">

  ${card.value}

  </div>

  </div>

  `).join("")}

  </div>


  <h2 class="section-title">

  Financial Overview

  </h2>

  <table>

  <thead>

  <tr>

  <th style="width:65%">
  Metric</th>

  <th class="text-right">

  Value

  </th>

  </tr>

  </thead>

  <tbody>

  ${financialSummary.map(item => `
  <tr>
  <td>
  ${item.label}
  </td>
  <td class="text-right">
  ${item.value}
  </td>
  </tr>`).join("")}

  </tbody>

  </table>
  <!-- ====================================================================== -->
<!-- Category Breakdown -->
<!-- ====================================================================== -->

<h2 class="section-title">
📊 Category Breakdown
</h2>

<div class="category-breakdown">

${categoryHTML || `
<div class="empty-state">
No category data available.
</div>
`}

</div>


<!-- ====================================================================== -->
<!-- Monthly Trend -->
<!-- ====================================================================== -->

<h2 class="section-title">
📈 Monthly Spending Trend
</h2>

<table>

<thead>

<tr>

<th>Month</th>

<th class="text-right">
Amount
</th>

</tr>

</thead>

<tbody>

${monthlyTrendHTML || `
<tr>
<td colspan="2" class="text-center">
No monthly trend available.
</td>
</tr>
`}

</tbody>

</table>


<!-- ====================================================================== -->
<!-- Payment Method Breakdown -->
<!-- ====================================================================== -->

<h2 class="section-title">
💳 Payment Method Analysis
</h2>

<table>

<thead>

<tr>

<th>Payment Method</th>

<th class="text-center">
Transactions
</th>

<th class="text-right">
Amount
</th>

</tr>

</thead>

<tbody>

${paymentHTML || `
<tr>
<td colspan="3" class="text-center">
No payment information available.
</td>
</tr>
`}

</tbody>

</table>


<!-- ====================================================================== -->
<!-- Top Categories -->
<!-- ====================================================================== -->

<h2 class="section-title">
🏷 Top Categories
</h2>

<table>

<thead>

<tr>

<th>Category</th>

<th class="text-right">
Amount
</th>

<th class="text-right">
Share
</th>

</tr>

</thead>

<tbody>

${categoryBreakdown.length
? categoryBreakdown.map(cat => `
<tr>

<td>

${cat.label}

</td>

<td class="text-right">

${formatCurrency(cat.total)}

</td>

<td class="text-right">

${cat.percentage}%

</td>

</tr>
`).join("")
: `
<tr>

<td colspan="3" class="text-center">

No category data available.

</td>

</tr>
`}

</tbody>

</table>


<!-- ====================================================================== -->
<!-- Spending Highlights -->
<!-- ====================================================================== -->

<h2 class="section-title">
⭐ Spending Highlights
</h2>

<table>

<tbody>

<tr>

<td style="width:40%">
Highest Spending Category
</td>

<td>

<strong>

${capitalizeFirst(dashboard.topCategory.name)}

</strong>

</td>

</tr>

<tr>

<td>

Category Spend

</td>

<td>

${formatCurrency(dashboard.topCategory.amount)}

</td>

</tr>

<tr>

<td>

Average Expense

</td>

<td>

${formatCurrency(dashboard.averageExpense)}

</td>

</tr>

<tr>

<td>

Average Daily Spend

</td>

<td>

${formatCurrency(dashboard.averageDailySpend)}

</td>

</tr>

<tr>

<td>

Total Expenses Recorded

</td>

<td>

${formatNumber(dashboard.expenseCount)}

</td>

</tr>

<tr>

<td>

Month-over-Month Change

</td>

<td>

${dashboard.monthChange >= 0 ? "▲ Increase" : "▼ Decrease"}
&nbsp;
<strong>

${Math.abs(dashboard.monthChange).toFixed(1)}%

</strong>

</td>

</tr>

</tbody>

</table>

<!-- ====================================================================== -->
<!-- Recent Expenses -->
<!-- ====================================================================== -->

<h2 class="section-title">
🧾 Recent Expenses
</h2>

<table>

<thead>

<tr>

<th>Date</th>
<th>Category</th>
<th>Description</th>
<th class="text-right">
Amount
</th>

</tr>

</thead>

<tbody>

${recentExpenseHTML || `
<tr>
<td colspan="4" class="text-center">
No recent expenses available.
</td>
</tr>
`}

</tbody>

</table>


<!-- ====================================================================== -->
<!-- Insights Section -->
<!-- ====================================================================== -->

<h2 class="section-title">
📌 Key Insights
</h2>

<table>

<tbody>

${insights.map(item => `
<tr>

<td>

${item}

</td>

</tr>
`).join("")}

</tbody>

</table>


<!-- ====================================================================== -->
<!-- Executive Observations -->
<!-- ====================================================================== -->

<h2 class="section-title">
🔍 Observations
</h2>

<table>

<tbody>

<tr>

<td>

Spending pattern analysis shows the highest expenditure concentrated in

<strong>${capitalizeFirst(dashboard.topCategory.name)}</strong>

category.

</td>

</tr>

<tr>

<td>

The system recorded

<strong>${formatNumber(dashboard.expenseCount)}</strong>

transactions overall with an average transaction value of

<strong>${formatCurrency(dashboard.averageExpense)}</strong>.

</td>

</tr>

<tr>

<td>

Month-over-month change indicates a

<strong>

${dashboard.monthChange >= 0 ? "growth" : "reduction"}

</strong>

trend of

<strong>

${Math.abs(dashboard.monthChange).toFixed(1)}%

</strong>.

</td>

</tr>

<tr>

<td>

Daily average spending stands at

<strong>${formatCurrency(dashboard.averageDailySpend)}</strong>,

reflecting current financial activity levels.

</td>

</tr>

</tbody>

</table>


<!-- ====================================================================== -->
<!-- Signature Section -->
<!-- ====================================================================== -->

<div style="
margin-top:40px;
display:flex;
justify-content:space-between;
gap:30px;
">

<div style="text-align:center; flex:1;">

<div style="
border-top:1px solid var(--text);
margin-top:40px;
padding-top:8px;
">

Submitted By

</div>

</div>

<div style="text-align:center; flex:1;">

<div style="
border-top:1px solid var(--text);
margin-top:40px;
padding-top:8px;
">

Reviewed By

</div>

</div>

<div style="text-align:center; flex:1;">

<div style="
border-top:1px solid var(--text);
margin-top:40px;
padding-top:8px;
">

Approved By

</div>

</div>

</div>


<!-- ====================================================================== -->
<!-- Footer -->
<!-- ====================================================================== -->

<div style="
margin-top:40px;
padding-top:15px;
border-top:2px solid var(--primary);
display:flex;
justify-content:space-between;
font-size:11px;
color:var(--muted);
">

<div>
SAP Expense Management System
</div>

<div>
Confidential Financial Report
</div>

<div>
Generated automatically
</div>

</div>

</body>

</html>`

return html;
};