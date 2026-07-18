// src/components/Auth/UserProfileDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTransaction } from "../../context/TransactionContext";
import { useSettings } from "../../context/SettingsContext";
import { useConfirm } from "../../context/ConfirmContext";
import { getUsers, loadUserAvatar } from "../../utils/storage";
import "./UserProfileDropdown.css";

import { AvatarSVG } from "../Common/Avatar/Avatarpicker";

const UserProfileDropdown = () => {
  const { user, logout } = useAuth();

  const { navigateToTransaction, isTransactionActive, currentTransaction } =
    useTransaction();
  const { settings, updateSetting } = useSettings();

  const [showDropdown, setShowDropdown] = useState(false);
  const [userAvatar, setUserAvatar] = useState({ style: "cyber" });

  const dropdownRef = useRef(null);

  const { confirm } = useConfirm();

  const isMobile = window.innerWidth <= 786;
  const isProfile = currentTransaction === "SU01";

  useEffect(() => {
    const loadAvatar = async () => {
      if (!user?.userId) return;

      const users = getUsers();
      const currentUser = users.find((u) => u.id === user.userId);

      if (currentUser?.avatar) {
        setUserAvatar(await loadUserAvatar(currentUser.avatar));
      }
    };

    loadAvatar();

    const handler = () => {
      console.log("Event received");
      loadAvatar();
    };

    window.addEventListener("user-profile-updated", handler);

    return () => window.removeEventListener("user-profile-updated", handler);
  }, [user?.userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const confirmed = await confirm(
      "Are you sure you want to log out?",
      "danger",
    );
    if (confirmed) {
      logout();
    }
  };

  const handleNavigateToProfile = async () => {
    setShowDropdown(false);
    if (isTransactionActive) {
      await confirm(
        "Please exit current transaction before navigating",
        "danger",
      );
      return;
    }
    navigateToTransaction("SU01");
  };

  const handleThemeToggle = () => {
    const newTheme = settings.theme === "light" ? "dark" : "light";
    updateSetting("theme", newTheme);
  };

  const handleLanguageToggle = () => {
    const newLang = settings.language === "en" ? "hi" : "en";
    updateSetting("language", newLang);
  };

  const getInitials = () => {
    if (user) {
      return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
    }
    return "U";
  };

  // console.log(settings);

  const formatName = (name = "") => {
    if (name.length > 10) {
      return name.slice(0, 8) + "..";
    }
    return name;
  };

  return (
    <div className="sap-user-menu" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="sap-user-button"
        disabled={isProfile}
      >
        <div className="sap-user-avatar">
          <AvatarSVG
            initials={getInitials()}
            style={userAvatar?.style || "cyber"}
            avatar={userAvatar}
          />
        </div>

        {!isMobile && (
          <>
            <span className="sap-user-name" title={user?.firstName}>
              {formatName(user?.firstName)}
            </span>
            <span className="sap-user-caret">▾</span>
          </>
        )}
      </button>

      {showDropdown && (
        <div className="sap-user-dropdown">
          {/* Blue Accent Bar */}
          <div className="sap-user-accent-bar" />

          {/* Header */}
          <div className="sap-user-header">
            <div className="sap-user-avatar-large">
              <AvatarSVG
                initials={getInitials()}
                style={userAvatar?.style || "cyber"}
                avatar={userAvatar}
              />
            </div>

            <div className="sap-user-info">
              <div className="sap-user-fullname">{user?.fullName}</div>
              <div className="sap-user-email">{user?.email}</div>

              <div className="sap-user-meta">
                <span className={`sap-badge ${user?.isAdmin ? "admin" : ""}`}>
                  {user?.isAdmin ? "🔐 " : ""}
                  {user?.role}
                </span>
                <span className="sap-badge">{user?.department}</span>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          {/* <div className="sap-user-quick-settings">
            <span>Quick Settings</span>

            <button
              onClick={handleThemeToggle}
              className="theme-switch"
              aria-label={`Switch to ${settings.theme === "dark" ? "Light" : "Dark"} mode`}
            >
              <span className="theme-switch-track">
                <span className="theme-switch-thumb">
                  {settings.theme === "dark" ? "🌙" : "☀️"}
                </span>
              </span>
            </button>
          </div> */}

          <div
            className="sap-user-quick-settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--sap-content-label-color, #666)",
              }}
            >
              Quick Settings:
            </span>

            <select
              value={settings.language || "en"}
              onChange={(e) => updateSetting("language", e.target.value)}
              aria-label="Select language"
              style={{
                padding: "4px 24px 4px 8px", // Extra right padding for custom/default arrow spacing
                borderRadius: "6px", // Modern subtle curve instead of pill shape
                height: "35px",
                border: "1px solid rgba(0, 0, 0, 0.15)",
                background: "var(--sap-content-bg, #fff)",
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--sap-content-text-color, #333)",
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor =
                  "var(--sap-content-focus-color, #0a6ed1)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0, 0, 0, 0.15)")
              }
            >
              <option value="en">🇺🇸 English</option>
              <option value="hi">🇮🇳 हिन्दी</option>
            </select>
          </div>

          {/* Menu */}
          <div className="sap-user-menu-items">
            <div
              onClick={handleNavigateToProfile}
              className={`sap-user-item ${isTransactionActive ? "disabled" : ""}`}
            >
              <span className="sap-item-icon">👤</span>
              My Profile
            </div>

            <div
              onClick={() => {
                setShowDropdown(false);
                if (!isTransactionActive) navigateToTransaction("SU01");
              }}
              className={`sap-user-item ${isTransactionActive ? "disabled" : ""}`}
            >
              <span className="sap-item-icon">⚙️</span>
              Settings
            </div>

            <div className="sap-user-divider" />

            <div onClick={handleLogout} className="sap-user-item logout">
              <span className="sap-item-icon">🚪</span>
              Log Out
            </div>
          </div>

          <div className="sap-user-footer">
            Client {user?.client} • Session{" "}
            {new Date(user?.loginTime).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
