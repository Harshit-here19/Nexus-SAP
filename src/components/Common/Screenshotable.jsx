import React, { useRef, useState, useEffect } from "react";
import {
  downloadScreenshot,
  copyScreenshot,
} from "../../utils/screenshotUtils";

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

    setMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
    });
  };

  const LONG_PRESS_DURATION = 600;

  const startLongPress = (e) => {
    const touch = e.touches[0];

    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      setMenu({
        visible: true,
        x: touch.clientX,
        y: touch.clientY,
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
            position: "absolute",
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
