// src/components/Layout/MainLayout.jsx
import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { IoMdMenu } from "react-icons/io";

import MenuBar from "./MenuBar";
import Toolbar from "./Toolbar";
import StatusBar from "./StatusBar";
import TreeMenu from "../Navigation/TreeMenu";
import TransactionInput from "../Navigation/TransactionInput";
import ExitConfirmModal from "../Common/ExitConfirmModal";
import ImportExportModal from "../Common/ImportExportModal";
import UserProfileDropdown from "../Auth/UserProfileDropdown";
import { useConfirm } from "../../context/ConfirmContext";
import { useTransaction } from "../../context/TransactionContext";
import { useAuth } from "../../context/AuthContext";
import { createBackup } from "../../utils/fileSystem";

const MainLayout = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    return window.innerWidth >= 768;
  });
  const [showImportExport, setShowImportExport] = useState(false);

  const confirm = useConfirm();
  const isMobile = window.innerWidth <= 768

  const handlers = useSwipeable({
    onSwipedLeft: () => setSidebarVisible(false), // swipe left → close
    onSwipedRight: () => setSidebarVisible(true), // swipe right → open
    delta: 50, // minimum swipe distance
    preventDefaultTouchmoveEvent: true,
    // trackMouse: true, // allows testing on desktop
  });

  const {
    currentTransaction,
    isTransactionActive,
    statusMessage,
    statusType,
    showExitConfirm,
    confirmExit,
    cancelExit,
    updateStatus,
  } = useTransaction();

  const { user } = useAuth();

  const handleOpenImportExport = (action) => {
    if (action === "createBackup") {
      const result = createBackup();
      updateStatus(result.message, result.success ? "success" : "error");
    } else if (action === "restoreBackup") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const { restoreBackup } = await import("../../utils/fileSystem");
            const result = await restoreBackup(file);
            updateStatus(result.message, "success");
            const confirmed = await confirm(
              "Backup restored! Refresh the page to see changes?",
            );
            if (confirmed) {
              window.location.reload();
            }
          } catch (error) {
            updateStatus(error.message, "error");
          }
        }
      };
      input.click();
    } else {
      setShowImportExport(true);
    }
  };

  return (
    <div {...handlers} className="sap-window" >
      {/* Title Bar */}
      <div className="sap-title-bar">
        <div className="title">
          <div className="title-icon">📦</div>
          <span>SAP Easy Access</span>
          {currentTransaction && currentTransaction !== "HOME" && (
            <span
              style={{
                marginLeft: "16px",
                fontWeight: "normal",
                opacity: 0.9,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              • {currentTransaction}
              {!isMobile && isTransactionActive && (
                <span
                  style={{
                    background: "var(--sap-critical)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  🔒 ACTIVE
                </span>
              )}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <UserProfileDropdown />
        </div>
      </div>

      {/* Session Tabs */}
      {/* <SessionTabs /> */}

      {/* Menu Bar */}
      <MenuBar
        onNewSession={() => console.log("New session")}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        onOpenImportExport={handleOpenImportExport}
      />

      {/* Toolbar with Transaction Input */}
      <Toolbar>
        {/* {isMobile && <span onClick={() => setSidebarVisible(!sidebarVisible)}>{sidebarVisible ? "X" : <IoMdMenu />}</span>} */}
        <TransactionInput />
      </Toolbar>

      {/* Main Content */}
      <div className="sap-main-container" style={{ marginBottom: '2rem' }}>
        {sidebarVisible && (
          <div
            className="sap-sidebar-overlay"
            onClick={() => setSidebarVisible(false)}
          />
        )}
        <div className={`sap-sidebar ${sidebarVisible ? "open" : "collapsed"}`}>
          <TreeMenu />
        </div>
        <div className="sap-content">{children}</div>
      </div>

      {/* Status Bar */}
      <StatusBar message={statusMessage} type={statusType} user={user} />

      {/* Exit Confirmation Modal */}
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onStatusMessage={updateStatus}
      />
    </div>
  );
};

export default MainLayout;
