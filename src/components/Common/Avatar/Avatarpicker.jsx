import React, { useMemo, useState, useEffect } from "react";
import { avatarThemes, avatarStyles } from "./avatarThemes";
import { avatarRegistry } from "./avatarRegistry";
import CustomAvatarDialog from "./CustomAvatarDialog";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AvatarSVG = ({ initials, style = "cyber", avatar }) => {
  if (style === "custom" && avatar?.image) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <clipPath id="customAvatarClip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>

          <filter id="customAvatarGlow">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4"
              floodColor="#60A5FA"
              floodOpacity="0.35"
            />
          </filter>
        </defs>

        <image
          href={avatar.image}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#customAvatarClip)"
          filter="url(#customAvatarGlow)"
        />
      </svg>
    );
  }

  const theme = avatarThemes[style] || avatarThemes.cyber;

  const Avatar = avatarRegistry[style] || avatarRegistry.cyber;

  const gradientId = React.useId();

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{
        display: "block",
      }}
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop offset="0%" stopColor={theme.colors[0]} />
          <stop offset="100%" stopColor={theme.colors[1]} />
        </linearGradient>
      </defs>

      <Avatar fill={`url(#${gradientId})`} initials={initials} />
    </svg>
  );
};

const AvatarPicker = ({ name, value, onChange, isOpen, onClose }) => {
  const initials = useMemo(() => getInitials(name), [name]);

  const [selected, setSelected] = useState(value?.style || "cyber");
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const dialogRef = React.useRef(null);

  useEffect(() => {
    if (value?.style) {
      setSelected(value.style);
    }
  }, [value]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const selectAvatar = (style) => {
    // Custom avatar opens another dialog
    if (style === "blank") {
      onClose();
      setShowCustomDialog(true);
      return;
    }

    setSelected(style);
    onChange({
      style,
    });
    onClose();
  };

  const handleCustomAvatarSave = (blob) => {
    const imageUrl = URL.createObjectURL(blob);

    setSelected("custom");

    onChange({
      style: "custom",
      image: imageUrl,
      blob,
    });

    setShowCustomDialog(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      if (value?.image?.startsWith("blob:")) {
        URL.revokeObjectURL(value.image);
      }
    };
  }, [value?.image]);

  return (
    <>
      <dialog
        ref={dialogRef}
        onClick={handleOutsideClick}
        style={{
          border: "none",
          borderRadius: "18px",
          padding: "0",
          background: "transparent",
          margin: "auto",
        }}
      >
        <div
          style={{
            width: "70vw",
            maxWidth: "92vw",
            padding: "22px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "18px",
            boxShadow: "0 25px 60px rgba(0,0,0,.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#084b83",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              🎨 Choose Profile Avatar
            </h3>

            <button
              onClick={onClose}
              style={{
                border: "none",
                background: "#f1f5f9",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "18px",
                color: "#475569",
                transition: "all .2s ease",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(80px,1fr))",
              gap: 18,
              justifyItems: "center",
            }}
          >
            {avatarStyles.map((styleKey) => {
              const theme = avatarThemes[styleKey];

              return (
                <div
                  key={styleKey}
                  onClick={() => selectAvatar(styleKey)}
                  style={{
                    width: 74,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border:
                        selected === styleKey
                          ? "3px solid #3b82f6"
                          : "2px solid #e2e8f0",

                      transition: ".25s",

                      boxShadow:
                        selected === styleKey
                          ? "0 8px 20px rgba(59,130,246,.3)"
                          : "0 2px 8px rgba(0,0,0,.08)",
                    }}
                  >
                    <AvatarSVG
                      initials={initials}
                      style={styleKey}
                      avatar={value}
                    />
                  </div>

                  <small
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  >
                    {theme.name}
                  </small>
                </div>
              );
            })}
          </div>
        </div>
      </dialog>

      <CustomAvatarDialog
        isOpen={showCustomDialog}
        currentImage={value?.style === "custom" ? value.image : null}
        onClose={() => setShowCustomDialog(false)}
        onSave={handleCustomAvatarSave}
      />
    </>
  );
};

export { AvatarPicker, AvatarSVG };
