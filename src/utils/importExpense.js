import {
    getTableData,
    saveTableData,
} from "./storage"

import NotificationModule from "../components/Common/NotificationModule";

export const importExpenses = (newData) => {
    const tableName = "expenses";

    // console.log(newData)

    if (!Array.isArray(newData) || !newData.length) {
        throw new Error("Imported QR contains no expense records.");
    }

    const existingData = getTableData(tableName) || [];

    const config = {
        duplicateField: ["description", "amount", "date"],
        existingKey: "expenseNumber",
        prefix: "EXP",
    };

    if (!config) {
        throw new Error("Import configuration missing for expenses.");
    }

    const { existingKey, duplicateField, prefix } = config;

    const makeDuplicateKey = (record) => {
        if (Array.isArray(duplicateField)) {
            return duplicateField
                .map((field) => String(record[field] ?? "").trim())
                .join("||");
        }

        return String(record[duplicateField] ?? "").trim();
    };

    const existingRecords = new Set(existingData.map(makeDuplicateKey));

    const processedData = [];

    const maxExistingNumber = existingData.reduce((max, item) => {
        const id = item[existingKey];

        if (!id || typeof id !== "string") return max;

        const number = parseInt(
            id.replace(prefix.toUpperCase(), ""),
            10
        );

        return !isNaN(number) && number > max ? number : max;
    }, 100000000);

    let counter = maxExistingNumber;

    newData.forEach((record) => {
        if (existingRecords.has(makeDuplicateKey(record))) {
            return;
        }

        counter++;

        processedData.push({
            ...record,
            [existingKey]: `${prefix.toUpperCase()}${counter}`,
            importedAt: new Date().toISOString(),
        });
    });

    saveTableData(tableName, [...existingData, ...processedData]);

    NotificationModule.notify(
        "success",
        `Imported ${processedData.length} new records. Skipped ${newData.length - processedData.length
        } duplicates.`,
        { type: "success" }
    );

    return processedData;
};