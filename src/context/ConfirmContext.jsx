import React, { createContext, useContext, useState, useRef } from "react";
import "./ConfirmDialog.css";

const ConfirmContext = createContext();

export const useConfirm = () => {
  return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
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
  };

  return (
    <ConfirmContext.Provider value={{ confirm, prompt }}>
      {children}

      {dialogState.open && (
        <div className="confirm-overlay">
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