// src/components/Common/SapModal.jsx
import { useRef, useEffect } from "react";
import styles from "./SapModal.module.css";

const SapModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  footer,
  width = "500px",
}) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if(isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  },[isOpen]);

  if (!isOpen) return null;

  const handleKeydown = (e) => {
    // ESC → close
    if (e.key === "Escape") {
      e.preventDefault();
      onClose?.();
    }

    // ENTER → confirm
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirm?.();
    }
  };

  return (
    <div className={styles["sap-modal-overlay"]} onClick={onClose}>
      <div
        className={styles["sap-modal"]}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeydown}
        tabIndex={0}
        ref={modalRef}
      >
        <div className={styles["sap-modal-header"]}>
          <span className={styles["sap-modal-title"]}>{title}</span>
          <button className={styles["sap-modal-close"]} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles["sap-modal-body"]}>{children}</div>
        {footer && <div className={styles["sap-modal-footer"]}>{footer}</div>}
      </div>
    </div>
  );
};

export default SapModal;
