// src/components/Layout/Toolbar.jsx
import React from "react";
import { useTransaction } from "../../context/TransactionContext";
import { useFavorites } from "../../context/FavoritesContext";
import QuickExport from "../Common/QuickExport";
import { useAction } from "../../context/ActionContext";

const Toolbar = ({ children }) => {
  const {
    currentTransaction,
    isTransactionActive,
    goBack,
    exitTransaction,
    cancelOperation,
    navigateToTransaction,
  } = useTransaction();
  const { triggerAction } = useAction();

  const { isFavorite, toggleFavorite } = useFavorites();

  const currentIsFavorite =
    currentTransaction !== "HOME" && isFavorite(currentTransaction);

  const handleToggleFavorite = () => {
    if (currentTransaction === "HOME") return;

    const result = toggleFavorite({
      tcode: currentTransaction,
      label: currentTransaction,
    });

    console.log("Toggle favorite result:", result);
  };

  const toolbarButtons = [
    { icon: "✓", title: "Enter (Enter)", action: "enter", always: true },
    {
      icon: "💾",
      title: "Save (Ctrl+S)",
      action: "save",
      always: true,
      highlight:
        isTransactionActive &&
        ["MM01", "VA01", "WS01", "MM02", "VA02", "WS02"].includes(
          currentTransaction,
        ),
    },
    { separator: true },
    {
      icon: "⬅️",
      title: "Back (F3)",
      action: "back",
      highlight: isTransactionActive,
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
        ["MM01", "VA01", "WS01", "MM02", "VA02", "WS02"].includes(
          currentTransaction,
        ),
    },
    { separator: true },
    { icon: "🖨️", title: "Print (Ctrl+P)", action: "print" },
    { icon: "🔍", title: "Find (Ctrl+F)", action: "find" },
    { separator: true },
    // { icon: '⏮️', title: 'First Page', action: 'firstPage' },
    // { icon: '◀️', title: 'Previous Page', action: 'prevPage' },
    // { icon: '▶️', title: 'Next Page', action: 'nextPage' },
    // { icon: '⏭️', title: 'Last Page', action: 'lastPage' },
    // { separator: true },
    { icon: "🆕", title: "Create (F5)", action: "create" },
    { icon: "✏️", title: "Change (F6)", action: "change" },
    { icon: "👁️", title: "Display (F7)", action: "display" },
    {
      icon: "🗑️",
      title: "Delete (Shift+F2)",
      action: "delete",
      highlight:
        isTransactionActive &&
        ["VA02", "WS02"].includes(currentTransaction),
      disabled: !isTransactionActive,
    },
    { separator: true },
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
      default:
        console.log("Toolbar action:", action);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F3" && !e.shiftKey) {
        e.preventDefault();
        goBack();
      } else if (e.shiftKey && e.key === "F3") {
        e.preventDefault();
        exitTransaction();
      } else if (e.key === "F12") {
        e.preventDefault();
        cancelOperation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goBack, exitTransaction, cancelOperation]);

  return (
    <>
      <div className="sap-toolbar">
        {children}
        <div className="sap-toolbar-separator" />

        {toolbarButtons.map((btn, index) => {
          if (btn.separator) {
            return <div key={index} className="sap-toolbar-separator" />;
          }

          if (btn.component === "quickExport") {
            return <QuickExport key={index} />;
          }

          return (
            <button
              key={index}
              className={`sap-toolbar-button ${btn.highlight ? "highlighted" : ""} ${btn.disabled ? "disabled" : ""}`}
              title={btn.title}
              onClick={() => handleButtonClick(btn.action)}
              disabled={btn.disabled}
            >
              <span className="button-icon">{btn.icon}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .sap-toolbar {
          display: flex;
          align-items: center;
          height: 28px;
          background: linear-gradient(
            to bottom,
            #f0f4f7 0%,
            #d9e4ec 45%,
            #c7d9e8 50%,
            #b5cedf 100%
          );
          border-top: 1px solid #ffffff;
          border-bottom: 1px solid #7b9bc3;
          padding: 0 2px;
          font-family: "Segoe UI", "Microsoft Sans Serif", Tahoma, sans-serif;
          font-size: 11px;
        }

        .sap-toolbar-separator {
          width: 1px;
          height: 22px;
          margin: 0 3px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            #8fa7c0 20%,
            #8fa7c0 80%,
            transparent 100%
          );
          box-shadow: 1px 0 0 rgba(255, 255, 255, 0.8);
        }

        .sap-toolbar-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          margin: 0 1px;
          padding: 0 4px;
          background: linear-gradient(
            to bottom,
            #ffffff 0%,
            #f4f7fa 40%,
            #e8eff5 60%,
            #d6e3ed 100%
          );
          border: 1px solid;
          border-color: #c5d7e8 #8fa7c0 #8fa7c0 #c5d7e8;
          border-radius: 2px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.1s ease;
          position: relative;
        }

        .sap-toolbar-button:hover:not(:disabled) {
          background: linear-gradient(
            to bottom,
            #ffffff 0%,
            #e8f4ff 40%,
            #c9e3fb 60%,
            #a8ceed 100%
          );
          border-color: #5b9bd5 #4a84c1 #4a84c1 #5b9bd5;
          box-shadow: 0 0 3px rgba(91, 155, 213, 0.3);
        }

        .sap-toolbar-button:active:not(:disabled) {
          background: linear-gradient(
            to bottom,
            #b5cedf 0%,
            #c7d9e8 40%,
            #d9e4ec 60%,
            #f0f4f7 100%
          );
          border-color: #4a84c1 #c5d7e8 #c5d7e8 #4a84c1;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
          padding-top: 1px;
        }

        .sap-toolbar-button:focus {
          outline: 2px solid #4a84c1;
          outline-offset: -2px;
        }

        .sap-toolbar-button.disabled {
          opacity: 0.4;
          cursor: default;
          background: linear-gradient(
            to bottom,
            #f8f9fa 0%,
            #e8ebf0 50%,
            #d8dce3 100%
          );
          border-color: #c0c8d0 #a0a8b0 #a0a8b0 #c0c8d0;
        }

        .sap-toolbar-button.highlighted {
          background: linear-gradient(
            to bottom,
            #fff4e6 0%,
            #ffe0b2 40%,
            #ffcc80 60%,
            #ffb74d 100%
          );
          border-color: #ffa726 #f57c00 #f57c00 #ffa726;
          box-shadow: 0 0 4px rgba(255, 152, 0, 0.4);
        }

        .sap-toolbar-button.highlighted:hover:not(:disabled) {
          background: linear-gradient(
            to bottom,
            #fff8e1 0%,
            #ffe0b2 40%,
            #ffd54f 60%,
            #ffc107 100%
          );
          border-color: #ffb300 #ff8f00 #ff8f00 #ffb300;
          box-shadow: 0 0 5px rgba(255, 152, 0, 0.6);
        }

        .button-icon {
          display: inline-block;
          font-size: 14px;
          line-height: 1;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        /* SAP Blue theme tooltip style */
        .sap-toolbar-button[title]:hover::after {
          content: attr(title);
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          background: linear-gradient(to bottom, #f8f9fa 0%, #e8ebf0 100%);
          border: 1px solid #8fa7c0;
          border-radius: 2px;
          font-size: 11px;
          font-family: "Segoe UI", Tahoma, sans-serif;
          color: #1e3a5f;
          white-space: nowrap;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        /* Specific button colors for Blue theme */
        .sap-toolbar-button[title*="Enter"] .button-icon,
        .sap-toolbar-button[title*="Save"] .button-icon {
          color: #0f7938;
          filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.8));
        }

        .sap-toolbar-button[title*="Back"] .button-icon,
        .sap-toolbar-button[title*="Exit"] .button-icon {
          color: #1565c0;
        }

        .sap-toolbar-button[title*="Cancel"] .button-icon,
        .sap-toolbar-button[title*="Delete"] .button-icon {
          color: #c62828;
        }

        .sap-toolbar-button[title*="Create"] .button-icon {
          color: #2e7d32;
        }

        .sap-toolbar-button[title*="Change"] .button-icon {
          color: #e65100;
        }

        .sap-toolbar-button[title*="Display"] .button-icon {
          color: #0277bd;
        }

        .sap-toolbar-button[title*="Print"] .button-icon,
        .sap-toolbar-button[title*="Find"] .button-icon {
          color: #424242;
        }

        .sap-toolbar-button[title*="Page"] .button-icon {
          color: #1976d2;
        }

        .sap-toolbar-button[title*="Favorite"] .button-icon {
          color: #ffa000;
          filter: drop-shadow(0 0 2px rgba(255, 193, 7, 0.5));
        }

        .sap-toolbar-button[title="Home"] .button-icon {
          color: #1565c0;
          font-size: 15px;
        }

        /* Animation for highlighted buttons */
        @keyframes sap-glow {
          0%,
          100% {
            box-shadow: 0 0 4px rgba(255, 152, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 8px rgba(255, 152, 0, 0.6);
          }
        }

        .sap-toolbar-button.highlighted {
          animation: sap-glow 1.5s ease-in-out infinite;
        }

        /* Group styling for navigation buttons */
        .sap-toolbar-button[title*="Page"] {
          min-width: 22px;
          padding: 0 2px;
        }

        /* Active transaction indicator */
        .sap-toolbar-button.highlighted:not([title*="Favorite"]) {
          background: linear-gradient(
            to bottom,
            #e3f2fd 0%,
            #bbdefb 40%,
            #90caf9 60%,
            #64b5f6 100%
          );
          border-color: #42a5f5 #1e88e5 #1e88e5 #42a5f5;
        }

        /* Pressed effect */
        .sap-toolbar-button:active:not(:disabled) .button-icon {
          transform: translateY(1px);
        }

        /* Home button special styling */
        .sap-toolbar-button[title="Home"]:not(:disabled):hover {
          background: linear-gradient(
            to bottom,
            #e8f5e9 0%,
            #c8e6c9 40%,
            #a5d6a7 60%,
            #81c784 100%
          );
          border-color: #66bb6a #43a047 #43a047 #66bb6a;
        }
      `}</style>
    </>
  );
};

export default Toolbar;
