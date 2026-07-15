// src/components/Screens/HomeScreen.jsx
import { useTransaction } from "../../context/TransactionContext";
import { useAuth } from "../../context/AuthContext";
import QuickTips from "../Layout/QuickTips";
import SapButton from "../Common/SapButton";

const HomeScreen = () => {
  const { navigateToTransaction, openTable } = useTransaction();
  const { user, checkIsAdmin } = useAuth();

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ padding: "12px" }}>
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>📦 SAP Easy Access - Expense Tracker</span>
        </div>
        <div className="sap-panel-content">
          <h2
            style={{
              marginBottom: "16px",
              color: "var(--sap-brand)",
              fontSize: "16px",
            }}
          >
            Welcome, {user?.firstName}! 👋
          </h2>
          <div>
            <p
              style={{
                marginBottom: "12px",
                fontSize: "12px",
                lineHeight: "1.6",
                color: "inherit" /* Adapts to your theme */,
              }}
            >
              This is an SAP-inspired Personal ERP Application built with React.
              It provides specialized transaction workflows for financial
              tracking (VA01-03), inventory and material logs (MM01-03),
              entertainment wishlists (WS01-03), personal notes (NT01-03),
              structural list collections (LC01-03), and calendar management
              (CS01-03). The system features administrative utilities like the
              SE16 Data Browser, SU01 User Settings, an analytics cockpit
              (ZDASH), and dedicated financial intelligence engines
              (ZEXP_REPORT).
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "20px",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "100%",
              marginTop: "1rem",
            }}
          >
            {/* Available Transactions Card */}
            <div
              style={{
                fontFamily: `'JetBrains Mono','Arial', 'Verdana', sans-serif`,
                background: "linear-gradient(145deg, #f8fbff, #e8f3ff)",
                border: "1px solid #b8d8f5",
                borderRadius: "14px",
                padding: "16px",
                width: "100%",
                maxWidth: "520px",
                color: "#003366",
                boxShadow: "0 6px 16px rgba(0,80,160,0.15)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#ffffff",
                  background: "linear-gradient(90deg, #0a5ea8, #1683d8)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                }}
              >
                📋 Available Transactions
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr 1fr"
                    : "repeat(3, minmax(120px, 1fr))",
                  gap: "8px",
                }}
              >
                {[
                  {
                    code: "VA01-03",
                    name: "Expense Management",
                    icon: "💰",
                    color: "linear-gradient(135deg,#ffd54f,#ff9800)",
                    action: "VA03",
                  },
                  {
                    code: "MM01-03",
                    name: "Material Management",
                    icon: "📦",
                    color: "linear-gradient(135deg,#42a5f5,#1565c0)",
                    action: "MM03",
                  },
                  {
                    code: "WS01-03",
                    name: "Wishlist Management",
                    icon: "⭐",
                    color: "linear-gradient(135deg,#ab47bc,#6a1b9a)",
                    action: "WS03",
                  },
                  {
                    code: "NT01-03",
                    name: "Notes Management",
                    icon: "📝",
                    color: "linear-gradient(135deg,#66bb6a,#2e7d32)",
                    action: "NT03",
                  },
                  {
                    code: "LC01-03",
                    name: "List Collection",
                    icon: "📋",
                    color: "linear-gradient(135deg,#26c6da,#00838f)",
                    action: "LC03",
                  },
                  {
                    code: "SE16",
                    name: "Data Browser",
                    icon: "🔍",
                    color: "linear-gradient(135deg,#78909c,#37474f)",
                    action: "SE16",
                  },
                  {
                    code: "SU01",
                    name: "User Settings",
                    icon: "⚙️",
                    color: "linear-gradient(135deg,#ef5350,#b71c1c)",
                    action: "SU01",
                  },
                  {
                    code: "ZDASH",
                    name: "Dashboard",
                    icon: "📊",
                    color: "linear-gradient(135deg,#5c6bc0,#283593)",
                    action: "ZDASH",
                  },
                  {
                    code: "ZEXP_REPORT",
                    name: "Expense Reports",
                    icon: "📈",
                    color: "linear-gradient(135deg,#26a69a,#00695c)",
                    action: "ZEXP_REPORT",
                  },
                  {
                    code: "CS01-03",
                    name: "Calendar Management",
                    icon: "📅",
                    color: "linear-gradient(135deg,#ff7043,#d84315)",
                    action: "CS03",
                  },
                ].map((item) => (
                  <div
                    key={item.code}
                    onClick={() => navigateToTransaction(item.action)}
                    style={{
                      background: item.color,
                      borderRadius: "10px",
                      padding: "8px",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "700",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      minHeight: "50px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 18px rgba(0,0,0,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 10px rgba(0,0,0,0.15)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      {item.icon} {item.code}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        marginTop: "5px",
                        opacity: 0.95,
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                ))}

                {checkIsAdmin() && (
                  <div
                    style={{
                      background: "linear-gradient(135deg,#ff7043,#d84315)",
                      borderRadius: "12px",
                      padding: "12px",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "700",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                      minHeight: "65px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: "14px" }}>🔐 ZADMIN</div>

                    <div
                      style={{
                        fontSize: "11px",
                        marginTop: "5px",
                        opacity: 0.95,
                      }}
                    >
                      User Administration
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tables Card */}
            <div
              style={{
                fontFamily: `'JetBrains Mono','Arial', 'Verdana', sans-serif`,
                background: "linear-gradient(145deg, #fffaf0, #fff3d6)",
                border: "1px solid #ffd27a",
                borderRadius: "14px",
                padding: "16px",
                width: "100%",
                maxWidth: isMobile ? "" : "300px",
                boxShadow: "0 6px 16px rgba(255,170,0,0.18)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#ffffff",
                  background: "linear-gradient(90deg, #ff9800, #ffb74d)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                }}
              >
                ⚡ Quick Access Tables
              </h3>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {[
                  {
                    icon: "💰",
                    name: "Expenses",
                    desc: "Expense Records",
                    color: "linear-gradient(135deg,#ffd54f,#ff9800)",
                    action: "expenses",
                  },
                  {
                    icon: "📦",
                    name: "Wishlist",
                    desc: "Entertainment Requests",
                    color: "linear-gradient(135deg,#42a5f5,#1565c0)",
                    action: "entertainment_wishlist",
                  },
                  {
                    icon: "📝",
                    name: "Notes",
                    desc: "Personal Notes",
                    color: "linear-gradient(135deg,#66bb6a,#2e7d32)",
                    action: "notes",
                  },
                  {
                    icon: "📅",
                    name: "List Collection",
                    desc: "List of Collections",
                    color: "linear-gradient(135deg, #4f46e5, #1e3a8a)", // Sleek Indigo to Deep Navy ERP Gradient
                    action: "collections",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    onClick={() => openTable(item.action)}
                    style={{
                      background: item.color,
                      borderRadius: "10px",
                      padding: "10px",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "700",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                      minHeight: "55px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-4px) scale(1.03)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(255,152,0,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 10px rgba(0,0,0,0.15)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      {item.icon} {item.name}
                    </div>

                    <div
                      style={{
                        fontSize: "10px",
                        marginTop: "4px",
                        opacity: 0.9,
                        fontWeight: "500",
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!isMobile && <QuickTips />}
        </div>
      </div>

      {/* Quick Access to Dashboard */}
      <div
        onClick={() => navigateToTransaction("ZDASH")}
        style={{
          background: "var(--sap-panel-bg)",
          border: "1px solid var(--sap-border)",
          borderLeft: "3px solid var(--sap-brand)",
          borderRadius: "3px",
          padding: "12px 14px",
          marginBottom: "12px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background 0.2s, border-color 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "var(--sap-highlight)";
          e.currentTarget.style.borderLeftColor = "var(--sap-brand-dark)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "var(--sap-panel-bg)";
          e.currentTarget.style.borderLeftColor = "var(--sap-brand)";
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--sap-text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "2px",
            }}
          >
            <span>📊</span> Expense Dashboard
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
            }}
          >
            View analytics and track your spending
          </div>
        </div>
        <div
          style={{
            fontSize: "16px",
            color: "var(--sap-brand)",
          }}
        >
          →
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
