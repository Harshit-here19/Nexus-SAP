import { downloadFile } from "./downloadFile";

/* ---------------------------------------------------------- */
/* Helpers                                                    */
/* ---------------------------------------------------------- */

const formatDate = (value) => {
    if (!value) return "";

    const d = new Date(value);

    if (isNaN(d)) return String(value);

    return d.toLocaleDateString("en-GB").replace(/\//g, ".");
};

const formatValue = (value) => {
    if (value === null || value === undefined) return "";

    if (typeof value === "number") {
        return value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return String(value);
};

const padRight = (text, width) => {
    return String(text).padEnd(width, " ");
};

const padLeft = (text, width) => {
    return String(text).padStart(width, " ");
};

/* ---------------------------------------------------------- */
/* Determine column widths                                    */
/* ---------------------------------------------------------- */

const calculateColumnWidths = (data, columns) => {
    return columns.map((column) => {
        let width = column.label.length;

        data.forEach((row) => {
            let value = row[column.key];

            if (column.key.toLowerCase().includes("date")) {
                value = formatDate(value);
            } else {
                value = formatValue(value);
            }

            width = Math.max(width, value.length);
        });

        // little padding like SAP
        return width + 2;
    });
};

/* ---------------------------------------------------------- */
/* Horizontal line                                            */
/* ---------------------------------------------------------- */

const makeBorder = (widths) => {
    const total =
        widths.reduce((sum, w) => sum + w, 0) +
        widths.length +
        1;

    return "-".repeat(total);
};

/* ---------------------------------------------------------- */
/* Header row                                                 */
/* ---------------------------------------------------------- */

const makeHeader = (columns, widths) => {
    let line = "|";

    columns.forEach((column, i) => {
        line += padRight(column.label, widths[i]) + "|";
    });

    return line;
};

/* ---------------------------------------------------------- */
/* Data rows                                                  */
/* ---------------------------------------------------------- */

const makeRows = (data, columns, widths) => {
    return data
        .map((row) => {
            let line = "|";

            columns.forEach((column, i) => {
                let value = row[column.key];

                if (column.key.toLowerCase().includes("date")) {
                    value = formatDate(value);
                } else {
                    value = formatValue(value);
                }

                if (typeof row[column.key] === "number") {
                    line += padLeft(value, widths[i]) + "|";
                } else {
                    line += padRight(value, widths[i]) + "|";
                }
            });

            return line;
        })
        .join("\n");
};

/* ---------------------------------------------------------- */
/* Total                                                      */
/* ---------------------------------------------------------- */

const makeTotalRow = (data, columns, widths) => {
    const amountColumn = columns.findIndex(
        (c) => c.key === "amount"
    );

    if (amountColumn === -1) return "";

    const total = data.reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0
    );

    let line = "|";

    columns.forEach((column, i) => {
        if (i === 0) {
            line += padRight("TOTAL", widths[i]) + "|";
        } else if (i === amountColumn) {
            line += padLeft(
                total.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                }),
                widths[i]
            ) + "|";
        } else {
            line += padRight("", widths[i]) + "|";
        }
    });

    return line;
};

/* ---------------------------------------------------------- */
/* Main SAP TXT                                               */
/* ---------------------------------------------------------- */

const generateSAPText = ({
    title,
    data,
    columns,
}) => {
    const widths = calculateColumnWidths(data, columns);

    const border = makeBorder(widths);

    const today = new Date()
        .toLocaleDateString("en-GB")
        .replace(/\//g, ".");

    const reportHeader =
        today +
        "    " +
        title +
        "    " +
        data.length;

    return [
        reportHeader,
        border,
        border,
        makeHeader(columns, widths),
        border,
        makeRows(data, columns, widths),
        border,
        makeTotalRow(data, columns, widths),
        border,
    ].join("\n");
};

/* ---------------------------------------------------------- */
/* CSV                                                        */
/* ---------------------------------------------------------- */

const generateCSV = ({ data, columns }) => {
    const escapeCSV = (value) => {
        if (value === null || value === undefined) return "";

        let formatted = value;

        if (typeof value === "number") {
            formatted = value.toString();
        } else if (String(value).match(/date/i)) {
            formatted = formatDate(value);
        }

        formatted = String(formatted);

        if (
            formatted.includes(",") ||
            formatted.includes('"') ||
            formatted.includes("\n")
        ) {
            formatted = `"${formatted.replace(/"/g, '""')}"`;
        }

        return formatted;
    };

    const header = columns.map((c) => c.label).join(",");

    const rows = data.map((row) =>
        columns
            .map((column) => {
                let value = row[column.key];

                if (column.key.toLowerCase().includes("date")) {
                    value = formatDate(value);
                }

                return escapeCSV(value);
            })
            .join(",")
    );

    return [header, ...rows].join("\n");
};

/* ---------------------------------------------------------- */
/* Public Export Function                                     */
/* ---------------------------------------------------------- */

export const exportALV = ({
    title = "ALV Report",
    data = [],
    columns = [],
    format = "txt",
}) => {

    if (format === "txt") {
        const text = generateSAPText({
            title,
            data,
            columns,
        });

        downloadFile(
            `${title}.txt`,
            text,
            "text/plain;charset=utf-8"
        );

        return;
    }

    if (format === "csv") {
        const csv = generateCSV({
            data,
            columns,
        });

        downloadFile(
            `${title}.csv`,
            csv,
            "text/csv;charset=utf-8"
        );
    }
};