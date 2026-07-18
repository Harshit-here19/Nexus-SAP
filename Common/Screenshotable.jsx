import React, { useRef, useState, useEffect } from "react";
import {
  downloadScreenshot,
  copyScreenshot,
} from "../../utils/screenshotUtils";

const MENU_WIDTH = 180;
const MENU_HEIGHT = 90;
const LONG_PRESS_DURATION = 600;

const Screenshotable = ({ children, filename = "capture.png" }) => {
  const captureRef = useRef(null);
  const longPressTimer = useRef(null);

  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  const handleContextMenu = (e) => {
    e.preventDefault();

    const x = Math.min(e.clientX, window.innerWidth - MENU_WIDTH - 10);

    const y = Math.min(e.clientY, window.innerHeight - MENU_HEIGHT - 10);

    setMenu({
      visible: true,
      x,
      y,
    });
  };

  const startLongPress = (e) => {
    const touch = e.touches[0];

    const clientX = touch.clientX;
    const clientY = touch.clientY;

    longPressTimer.current = setTimeout(() => {
      navigator.vibrate?.(30);

      const x = Math.min(clientX, window.innerWidth - MENU_WIDTH - 10);

      const y = Math.min(clientY, window.innerHeight - MENU_HEIGHT - 10);

      setMenu({
        visible: true,
        x,
        y,
      });
    }, LONG_PRESS_DURATION);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimer.current);
  };

  useEffect(() => {
    const hide = () =>
      setMenu((m) => ({
        ...m,
        visible: false,
      }));

    window.addEventListener("click", hide);

    return () => window.removeEventListener("click", hide);
  }, []);

  useEffect(() => {
    const hide = () => setMenu((m) => ({ ...m, visible: false }));

    window.addEventListener("click", hide);
    window.addEventListener("scroll", hide);
    window.addEventListener("resize", hide);

    return () => {
      window.removeEventListener("click", hide);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("resize", hide);
    };
  }, []);

  return (
    <>
      <div
        ref={captureRef}
        onContextMenu={handleContextMenu}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        onTouchCancel={cancelLongPress}
        style={{
          WebkitTouchCallout: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>

      {menu.visible && (
        <div
          style={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            width: 180,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,.2)",
            zIndex: 999999,
          }}
        >
          <div
            style={itemStyle}
            onClick={() => downloadScreenshot(captureRef.current, filename)}
          >
            📸 Save as PNG
          </div>

          <div
            style={itemStyle}
            onClick={() => copyScreenshot(captureRef.current)}
          >
            📋 Copy Image
          </div>
        </div>
      )}
    </>
  );
};

const itemStyle = {
  padding: "12px 14px",
  cursor: "pointer",
  borderBottom: "1px solid #eee",
};

export default Screenshotable;
