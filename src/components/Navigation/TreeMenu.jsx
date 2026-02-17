// src/components/Navigation/TreeMenu.jsx
import React, { useState } from "react";
import { useTransaction } from "../../context/TransactionContext";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";

import { useConfirm } from "../../context/ConfirmContext";

// Transaction definitions - UPDATE THIS SECTION
const transactionDefinitions = {
  ZDASH: { label: "Dashboard", icon: "📊", description: "Expense Dashboard" },
  MM01: {
    label: "Create Material",
    icon: "➕",
    description: "Create Material Master",
  },
  MM02: {
    label: "Change Material",
    icon: "✏️",
    description: "Change Material Master",
  },
  MM03: {
    label: "Display Material",
    icon: "👁️",
    description: "Display Material Master",
  },
  NT01: {
    label: "Add Note",
    icon: "➕",
    description: "Create a new Note",
  },
  NT02: {
    label: "Edit Note",
    icon: "✏️",
    description: "Edit an existing Note",
  },
  NT03: {
    label: "View Notes",
    icon: "👁️",
    description: "Display existing Notes",
  },
  WS01: {
    label: "Add Wishlist Item",
    icon: "➕",
    description: "Create a new item in your Entertainment Wishlist",
  },
  WS02: {
    label: "Edit Wishlist Item",
    icon: "✏️",
    description: "Edit an existing item in your Entertainment Wishlist",
  },
  WS03: {
    label: "View Wishlist",
    icon: "👁️",
    description: "Display all items in your Entertainment Wishlist",
  },

  VA01: { label: "Add Expense", icon: "➕", description: "Record New Expense" },
  VA02: {
    label: "Edit Expense",
    icon: "✏️",
    description: "Edit Existing Expense",
  },
  VA03: {
    label: "View Expenses",
    icon: "👁️",
    description: "View All Expenses",
  },
  SE16: {
    label: "Data Browser",
    icon: "🔍",
    description: "General Table Display",
  },
  FB01: { label: "Post Document", icon: "📄", description: "Post Document" },
  FB03: {
    label: "Display Document",
    icon: "👁️",
    description: "Display Document",
  },
  SM37: {
    label: "Job Overview",
    icon: "📋",
    description: "Background Job Overview",
  },
  SU01: { label: "User Profile", icon: "👤", description: "User Maintenance" },
  ZADMIN: {
    label: "User Admin",
    icon: "👥",
    description: "User Administration",
    adminOnly: true,
  },
};

const TreeMenu = () => {
  const { navigateToTransaction, isTransactionActive } = useTransaction();
  const { user, checkIsAdmin } = useAuth();
  const { favorites, history, removeFromFavorites, clearHistory } =
    useFavorites();
  const [expandedNodes, setExpandedNodes] = useState([
    "sap-menu",
    "favorites",
    "history",
  ]);

  const isAdmin = checkIsAdmin();
  const confirm = useConfirm();

  const treeData = [
    {
      id: "favorites",
      label: "Favorites",
      icon: "⭐",
      children: favorites.map((fav) => ({
        id: `fav_${fav.tcode}`,
        label: `${fav.tcode} - ${transactionDefinitions[fav.tcode]?.label || fav.tcode}`,
        icon: transactionDefinitions[fav.tcode]?.icon || "📄",
        tcode: fav.tcode,
        isFavorite: true,
      })),
    },
    {
      id: "history",
      label: "History",
      icon: "🕐",
      children: history.slice(0, 10).map((h) => ({
        id: `hist_${h.tcode}_${h.accessedAt}`,
        label: `${h.tcode} - ${transactionDefinitions[h.tcode]?.label || h.description || h.tcode}`,
        icon: transactionDefinitions[h.tcode]?.icon || "📄",
        tcode: h.tcode,
        accessedAt: h.accessedAt,
      })),
    },
    {
      id: "sap-menu",
      label: "SAP Menu",
      icon: "📁",
      children: [
        { id: "zdash", label: "ZDASH - Dashboard", icon: "📊", tcode: "ZDASH" },
        {
          id: "logistics",
          label: "Logistics",
          icon: "📦",
          children: [
            {
              id: "mm",
              label: "Materials Management",
              icon: "🏭",
              children: [
                {
                  id: "mm01",
                  label: "MM01 - Create Material",
                  icon: "➕",
                  tcode: "MM01",
                },
                {
                  id: "mm02",
                  label: "MM02 - Change Material",
                  icon: "✏️",
                  tcode: "MM02",
                },
                {
                  id: "mm03",
                  label: "MM03 - Display Material",
                  icon: "👁️",
                  tcode: "MM03",
                },
              ],
            },
            {
              id: "sd",
              label: "Expense Tracker",
              icon: "💰",
              children: [
                {
                  id: "va01",
                  label: "VA01 - Add Expense",
                  icon: "➕",
                  tcode: "VA01",
                },
                {
                  id: "va02",
                  label: "VA02 - Edit Expense",
                  icon: "✏️",
                  tcode: "VA02",
                },
                {
                  id: "va03",
                  label: "VA03 - View Expenses",
                  icon: "👁️",
                  tcode: "VA03",
                },
              ],
            },
            {
              id: "notes",
              label: "Notes",
              icon: "📝",
              children: [
                {
                  id: "nt01",
                  label: "NT01 - Create Note",
                  icon: "➕",
                  tcode: "NT01",
                },
                {
                  id: "nt02",
                  label: "NT02 - Edit Note",
                  icon: "✏️",
                  tcode: "NT02",
                },
                {
                  id: "nt03",
                  label: "NT03 - View Notes",
                  icon: "👁️",
                  tcode: "NT03",
                },
              ],
            },
          ],
        },
        {
          id: "wishlist",
          label: "Entertainment Wishlist",
          icon: "🎬",
          children: [
            {
              id: "ws01",
              label: "WS01 - Add to Wishlist",
              icon: "➕",
              tcode: "WS01",
            },
            {
              id: "ws02",
              label: "WS02 - Change Wishlist Item",
              icon: "✏️",
              tcode: "WS02",
            },
            {
              id: "ws03",
              label: "WS03 - Display Wishlist Item",
              icon: "👁️",
              tcode: "WS03",
            },
          ],
        },
        {
          id: "basis",
          label: "Basis / Tools",
          icon: "🔧",
          children: [
            {
              id: "se16",
              label: "SE16 - Data Browser",
              icon: "🔍",
              tcode: "SE16",
            },
            {
              id: "sm37",
              label: "SM37 - Job Overview",
              icon: "📋",
              tcode: "SM37",
            },
            {
              id: "su01",
              label: "SU01 - User Maintenance",
              icon: "👤",
              tcode: "SU01",
            },
          ],
        },
        // Admin section - only show for admin users
        ...(isAdmin
          ? [
              {
                id: "admin",
                label: "Administration",
                icon: "🔐",
                children: [
                  {
                    id: "zadmin",
                    label: "ZADMIN - User Admin",
                    icon: "👥",
                    tcode: "ZADMIN",
                    adminOnly: true,
                  },
                ],
              },
            ]
          : []),
      ],
    },
  ];

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId],
    );
  };

  const TreeNode = ({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.includes(node.id);

    const handleClick = () => {
      if (hasChildren) {
        toggleNode(node.id);
      } else if (node.tcode) {
        navigateToTransaction(node.tcode);
      }
    };

    const handleRemoveFavorite = (e) => {
      e.stopPropagation();
      removeFromFavorites(node.tcode);
    };

    return (
      <div>
        <div
          className={`sap-tree-item ${isTransactionActive ? "disabled" : ""}`}
          style={{
            paddingLeft: `${level * 16 + 8}px`,
            opacity: isTransactionActive && node.tcode ? 0.5 : 1,
            cursor:
              isTransactionActive && node.tcode ? "not-allowed" : "pointer",
            background: node.adminOnly
              ? "linear-gradient(90deg, rgba(233,115,12,0.1) 0%, transparent 100%)"
              : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onClick={handleClick}
        >
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <span className="sap-tree-toggle">
              {hasChildren ? (isExpanded ? "▼" : "▶") : ""}
            </span>
            <span className="sap-tree-icon">{node.icon}</span>
            <span style={{ flex: 1 }}>{node.label}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {node.adminOnly && (
              <span
                style={{
                  fontSize: "10px",
                  background: "var(--sap-critical)",
                  color: "white",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                ADMIN
              </span>
            )}
            {node.isFavorite && (
              <button
                onClick={handleRemoveFavorite}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  opacity: 0.6,
                }}
                title="Remove from favorites"
                onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "0.6")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="sap-tree-children">
            {/* Show empty message for empty folders */}
            {node.children.length === 0 && (
              <div
                style={{
                  paddingLeft: `${(level + 1) * 16 + 8}px`,
                  padding: "8px",
                  paddingLeft: `${(level + 1) * 16 + 8}px`,
                  color: "var(--sap-text-secondary)",
                  fontSize: "12px",
                  fontStyle: "italic",
                }}
              >
                {node.id === "favorites" && "No favorites yet"}
                {node.id === "history" && "No recent transactions"}
              </div>
            )}
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
            {/* Clear history button */}
            {node.id === "history" && node.children.length > 0 && (
              <div
                style={{
                  paddingLeft: `${(level + 1) * 16 + 8}px`,
                  padding: "8px",
                }}
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const confirmed = await confirm(
                      "Clear all transaction history?",
                    );
                    if (confirmed) {
                      clearHistory();
                    }
                  }}
                  style={{
                    background: "none",
                    border: "1px solid var(--sap-border)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    cursor: "pointer",
                    color: "var(--sap-text-secondary)",
                  }}
                >
                  🗑️ Clear History
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sap-tree">
      {isTransactionActive && (
        <div
          style={{
            padding: "8px 12px",
            background: "var(--sap-highlight)",
            borderRadius: "6px",
            marginBottom: "12px",
            fontSize: "11px",
            color: "var(--sap-critical)",
          }}
        >
          🔒 Navigation locked. Press F3 to go back.
        </div>
      )}

      {treeData.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
};

export default TreeMenu;
