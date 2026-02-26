import React, { createContext, useContext, useState, useRef } from "react";
import "./ConfirmDialog.css";

const ConfirmContext = createContext();

export const useConfirm = () => {
  return useContext(ConfirmContext);
};


export const ConfirmProvider = ({ children }) => {
  const previousFocus = useRef(null);

  const [dialogState, setDialogState] = useState({
    open: false,
    mode: "confirm", // "confirm" | "prompt"
    message: "",
    type: "normal",
    inputValue: "",
    placeholder: ""
  });

  const resolver = useRef(null);

  // ✅ CONFIRM FUNCTION
  const confirm = (message, type = "normal") => {
    // Capture the element that has focus right now (the button or input in your modal)
    previousFocus.current = document.activeElement;
    // console.log(previousFocus?.current);

    setDialogState({
      open: true,
      mode: "confirm",
      message,
      type,
      inputValue: "",
      placeholder: ""
    });

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  // ✅ PROMPT FUNCTION
  const prompt = (
    message,
    { type = "normal", defaultValue = "", placeholder = "" } = {}
  ) => {
    // Capture the element that has focus right now (the button or input in your modal)
    previousFocus.current = document.activeElement;
    // console.log(previousFocus?.current);

    setDialogState({
      open: true,
      mode: "prompt",
      message,
      type,
      inputValue: defaultValue,
      placeholder
    });

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  const handleClose = (result) => {
    setDialogState({
      open: false,
      mode: "confirm",
      message: "",
      type: "normal",
      inputValue: "",
      placeholder: ""
    });

    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }

    // RETURN FOCUS: Wait for the next tick to ensure the DOM has hidden the modal
    setTimeout(() => {
      if (previousFocus.current && previousFocus.current.focus) {
        previousFocus.current.focus();
      }
    }, 0);

  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation(); // ✋ Stops the event from hitting the background modal
      handleClose(dialogState.mode === "prompt" ? dialogState.inputValue : true);
    }
    if (e.key === "Escape") {
      handleClose(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, prompt }}>
      {children}

      {dialogState.open && (
        <div
          className="confirm-overlay"
          onKeyDown={handleKeyDown} // Listen here
          tabIndex="-1" // Makes the div focusable
          ref={(el) => el && el.focus()} // Auto-focus when it opens
        >
          <div className={`confirm-box ${dialogState.type}`}>
            <div className="confirm-message">
              {dialogState.message}
            </div>

            {/* ✅ Prompt Input Field */}
            {dialogState.mode === "prompt" && (
              <input
                className="confirm-input"
                type="text"
                value={dialogState.inputValue}
                placeholder={dialogState.placeholder}
                onChange={(e) =>
                  setDialogState((prev) => ({
                    ...prev,
                    inputValue: e.target.value
                  }))
                }
              />
            )}

            <div className="confirm-actions">
              <button
                className="btn cancel"
                onClick={() => handleClose(null)}
              >
                Cancel
              </button>

              <button
                autoFocus
                className={`btn confirm ${dialogState.type}`}
                onClick={() =>
                  handleClose(
                    dialogState.mode === "prompt"
                      ? dialogState.inputValue
                      : true
                  )
                }
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};