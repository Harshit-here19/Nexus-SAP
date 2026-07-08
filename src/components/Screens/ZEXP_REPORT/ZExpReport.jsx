import React, { useState, useEffect } from "react";

import ExpenseSelection from "./ExpenseSelection";
import ExpenseALVGrid from "./ExpenseALVGrid";

import { getTableData } from "../../../utils/storage";
import { useTransaction } from "../../../context/TransactionContext";

const ZExpReport = () => {
  const [screen, setScreen] = useState("selection");
  const [data, setData] = useState([]);

  const { registerBackHandler, clearBackHandler, updateStatus, markAsSaved } =
    useTransaction();

  useEffect(() => {
    if (screen === "alv") {
      registerBackHandler(() => {
        // Return to selection screen
        setScreen("selection");

        // Optional: clear previous results
        setData([]);

        markAsSaved();

        updateStatus("Returned to Selection Screen", "info");

        return true;
      });
    } else {
      clearBackHandler();
    }

    return () => clearBackHandler();
  }, [
    screen,
    registerBackHandler,
    clearBackHandler,
    markAsSaved,
    updateStatus,
  ]);

  const executeReport = (filters) => {
    let expenses = getTableData("expenses") || [];

    if (filters.fromDate) {
      expenses = expenses.filter(
        (e) => new Date(e.date) >= new Date(filters.fromDate),
      );
    }

    if (filters.toDate) {
      const endDate = new Date(filters.toDate);

      endDate.setHours(23, 59, 59, 999);

      expenses = expenses.filter((e) => new Date(e.date) <= endDate);
    }

    if (filters.category && filters.category !== "ALL") {
      expenses = expenses.filter((e) => e.category === filters.category);
    }

    if (filters.vendor.trim()) {
      expenses = expenses.filter((e) =>
        e.vendor?.toLowerCase().includes(filters.vendor.toLowerCase()),
      );
    }

    setData(expenses);
    setScreen("alv");
  };

  return (
    <>
      {screen === "alv" ? (
        <ExpenseALVGrid data={data} />
      ) : (
        <ExpenseSelection onExecute={executeReport} />
      )}
    </>
  );
};

export default ZExpReport;
