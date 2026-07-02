import * as XLSX from "xlsx";

const columnMap = {
  expenseNumber: "Expense Number",
  date: "Date",
  category: "Category",
  description: "Description",
  vendor: "Vendor",
  amount: "Amount",
  currency: "Currency",
  paymentMethod: "Payment Method",
  status: "Status",
  notes: "Notes",
};

const capitalize = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);

export const exportExpenseSpreadsheet = (expenses, options) => {
  const { fromDate, toDate, fields, format } = options;

  // Filter by month/year

  const from = new Date(fromDate);
  const to = new Date(toDate);

  // normalize time to avoid edge issues
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const filtered = expenses.filter((exp) => {
    if (!exp.date) return false;

    const d = new Date(exp.date);
    return d >= from && d <= to;
  });

  if (!filtered.length) {
    throw new Error("No Expenses Found.")
  }

  const selectedFields = Object.keys(fields).filter((f) => fields[f]);

  const rows = filtered.map((exp) => {
    const obj = {};

    selectedFields.forEach((field) => {
      switch (field) {
        case "date":
          obj[columnMap[field]] = exp.date
            ? new Date(exp.date).toLocaleDateString()
            : "";
          break;

        case "category":
          obj[columnMap[field]] = capitalize(exp.category);
          break;

        case "amount":
          obj[columnMap[field]] = Number(exp.amount);
          break;

        default:
          obj[columnMap[field]] = exp[field] ?? "";
      }
    });

    return obj;
  });

  createWorkbook(rows, selectedFields, fromDate, toDate, format);
};

function createWorkbook(rows, fields, fromDate, toDate, format) {
  const workbook = XLSX.utils.book_new();

  const title = [
    ["Expense Report"],
    [
      `Posting Date : ${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`,
    ],
    [`Generated : ${new Date().toLocaleString()}`],
    [],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(title);

  XLSX.utils.sheet_add_json(worksheet, rows, {
    origin: "A5",
    skipHeader: false,
  });

  worksheet["!cols"] = autoWidth(rows, fields);

  worksheet["!views"] = [
    {
      state: "frozen",
      ySplit: 5,
    },
  ];

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: fields.length - 1 } }, // Expense Report
    { s: { r: 1, c: 0 }, e: { r: 1, c: fields.length - 1 } }, // Period
    { s: { r: 2, c: 0 }, e: { r: 2, c: fields.length - 1 } }, // Generated
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  const filename = `Expense_Report_${new Date(fromDate).toISOString().split("T")[0]}_to_${new Date(toDate).toISOString().split("T")[0]}`;

  if (format === "csv") {
    XLSX.writeFile(workbook, filename + ".csv");
  } else {
    XLSX.writeFile(workbook, filename + ".xlsx");
  }
}

function autoWidth(rows, fields) {
  const cols = [];

  fields.forEach((field) => {
    const header = columnMap[field];

    let max = header.length;

    rows.forEach((row) => {
      const value = row[header];

      if (value) {
        max = Math.max(max, value.toString().length);
      }
    });

    cols.push({
      wch: max + 4,
    });
  });

  return cols;
}
