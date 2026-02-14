import React, { createContext, useContext, useState, useRef } from "react";
import "./ConfirmDialog.css";

const ConfirmContext = createContext();

export const useConfirm = () => {
  return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    open: false,
    message: "",
    type: "normal", // default type is "normal", can be "danger", "warning", "success"
  });

  const resolver = useRef(null);

  const confirm = (message, type = "normal") => {
    setConfirmState({ open: true, message, type });

    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  const handleClose = (result) => {
    setConfirmState({ open: false, message: "", type: "normal" });

    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {confirmState.open && (
        <div className="confirm-overlay">
          <div className={`confirm-box ${confirmState.type}`}>
            <div className="confirm-message">
              {confirmState.message}
            </div>

            <div className="confirm-actions">
              <button
                className="btn cancel"
                onClick={() => handleClose(false)}
              >
                Cancel
              </button>
              <button
                className={`btn confirm ${confirmState.type}`}
                onClick={() => handleClose(true)}
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
