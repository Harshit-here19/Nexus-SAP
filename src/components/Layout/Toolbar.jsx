// src/components/Layout/Toolbar.jsx
import React, { useEffect } from "react";
import { useTransaction } from "../../context/TransactionContext";
import { useFavorites } from "../../context/FavoritesContext";
import QuickExport from "../Common/QuickExport";
import { useAction } from "../../context/ActionContext";
import styles from "./ToolBar.module.css";

const Toolbar = ({ children }) => {
  const {
    currentTransaction,
    isTransactionActive,
    goBack,
    exitTransaction,
    navigateToTransaction,
  } = useTransaction();
  
  const { triggerAction } = useAction();
  const { isFavorite, toggleFavorite } = useFavorites();

  const currentIsFavorite =
    currentTransaction !== "HOME" && isFavorite(currentTransaction);

  const handleToggleFavorite = () => {
    if (currentTransaction === "HOME") return;

    toggleFavorite({
      tcode: currentTransaction,
      label: currentTransaction,
    });
  };

  const toolbarButtons = [
    {
      icon: "💾",
      title: "Save (Ctrl+S)",
      action: "save",
      highlight:
        isTransactionActive &&
        ["MM01", "VA01", "WS01", "NT01", "MM02", "VA02", "WS02", "NT02"].includes(
          currentTransaction,
        ),
    },
    { separator: true },
    {
      icon: "⬅️",
      title: "Back (F3)",
      action: "back",
      highlight: isTransactionActive,
      disabled: currentTransaction === "HOME",
    },
    {
      icon: "🚪",
      title: "Exit (Shift+F3)",
      action: "exit",
      highlight: isTransactionActive,
    },
    {
      icon: "❌",
      title: "Clear (F12)",
      action: "clear",
      highlight:
        isTransactionActive &&
        ["MM01", "VA01", "WS01", "NT01", "MM02", "VA02", "WS02", "NT02"].includes(
          currentTransaction,
        ),
    },
    { separator: true },
    { icon: "🖨️", title: "Print (Ctrl+P)", action: "print" },
    { icon: "🔍", title: "Find (Ctrl+F)", action: "find" },
    { separator: true },
    {
      icon: "♻️",
      title: "Delete (Shift+F2)",
      action: "delete",
      highlight:
        isTransactionActive &&
        ["VA02", "WS02", "NT02"].includes(currentTransaction),
      disabled: !isTransactionActive,
    },
    { separator: true },
    {
      icon: currentIsFavorite ? "⭐" : "☆",
      title: currentIsFavorite ? "Remove from Favorites" : "Add to Favorites",
      action: "toggleFavorite",
      disabled: currentTransaction === "HOME",
      highlight: currentIsFavorite,
    },
    { component: "quickExport" },
    { separator: true },
    {
      icon: "🏠",
      title: "Home",
      action: "home",
      disabled: isTransactionActive,
    },
  ];

  const handleButtonClick = (action) => {
    switch (action) {
      case "back":
        goBack();
        break;
      case "exit":
        exitTransaction();
        break;
      case "clear":
        triggerAction("CLEAR");
        break;
      case "home":
        if (!isTransactionActive) {
          navigateToTransaction("HOME");
        }
        break;
      case "toggleFavorite":
        handleToggleFavorite();
        break;
      case "save":
        triggerAction("SAVE");
        break;
      case "delete":
        triggerAction("DELETE");
        break;
      case "print":
        triggerAction("PRINT");
        break;
      default:
        console.log("Toolbar action:", action);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F3" && !e.shiftKey) {
        e.preventDefault();
        goBack();
      } else if (e.shiftKey && e.key === "F3") {
        e.preventDefault();
        exitTransaction();
      } else if (e.key === "F12") {
        e.preventDefault();
        triggerAction("CLEAR");
      } else if (e.key === "F2" && e.shiftKey) {
        e.preventDefault();
        triggerAction("DELETE");
      } else if (e.key === "s" && e.ctrlKey) {
        e.preventDefault();
        triggerAction("SAVE");
      } else if (e.key === "p" && e.ctrlKey) {
        e.preventDefault();
        triggerAction("PRINT");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goBack, exitTransaction, triggerAction, isTransactionActive]);

  return (
    <div className={styles.sapToolbar}>
      {children && <div className={styles.toolbarChildren}>{children}</div>}

      {children && <div className={styles.sapToolbarSeparator} />}

      <div className={styles.toolbarActionsGroup}>
        {toolbarButtons.map((btn, index) => {
          if (btn.separator) {
            return <div key={index} className={styles.sapToolbarSeparator} />;
          }

          if (btn.component === "quickExport") {
            return (
              <div key={index} className={styles.exportWrapper}>
                <QuickExport />
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              className={`${styles.sapToolbarButton} ${
                btn.highlight ? styles.highlighted : ""
              }`}
              title={btn.title}
              onClick={() => handleButtonClick(btn.action)}
              disabled={btn.disabled}
            >
              <span className={styles.buttonIcon}>{btn.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;