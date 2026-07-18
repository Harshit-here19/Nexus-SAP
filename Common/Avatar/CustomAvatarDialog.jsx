import React, { useRef, useState, useEffect } from "react";
import { resizeImage } from "../../../utils/imageUtils";
import SapButton from "../../Common/SapButton";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB

const CustomAvatarDialog = ({
  isOpen,
  onClose,
  onSave,
  currentImage = null,
}) => {
  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(currentImage);
  const [imageBlob, setImageBlob] = useState(null);

  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

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

  const readFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Maximum file size is 8 MB.");
      return;
    }

    if (file.type === "image/gif") {
      const url = URL.createObjectURL(file);

      setPreview(url);
      setImageBlob(file);

      return;
    }

    resizeImage(file)
      .then((blob) => {
        const url = URL.createObjectURL(blob);

        setPreview(url);
        setImageBlob(blob);
      })
      .catch(() => {
        alert("Unable to process image.");
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    readFile(file);
  };

  const handleBrowse = (e) => {
    const file = e.target.files[0];

    readFile(file);
  };

  const handleSave = () => {
    if (!imageBlob) return;

    onSave(imageBlob);
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setImageBlob(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <dialog
      ref={dialogRef}
      style={{
        border: "none",
        borderRadius: 20,
        padding: 0,
        background: "transparent",
        margin: "auto",
      }}
    >
      <div
        style={{
          padding: 24,
          background: "#fff",
          borderRadius: 20,
          width: "35rem",
        }}
      >
        <h2>Custom Avatar</h2>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            marginTop: 20,
            border: "2px dashed #CBD5E1",
            borderRadius: 20,
            height: "25rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => fileInputRef.current.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#64748B",
              }}
            >
              <div style={{ fontSize: 50 }}>📷</div>

              <div>Drop Image Here</div>

              <small>or click to browse</small>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={handleBrowse}
        />

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
          }}
        >
          <SapButton
            onClick={handleRemove}
            type="neo-dashed"
            style={{
              padding: "1rem 2rem",
              fontSize: 16,
            }}
          >
            🗑️ Remove
          </SapButton>

          <SapButton
            onClick={onClose}
            type="neo-danger"
            style={{
              padding: "1rem 2rem",
              fontSize: 16,
            }}
          >
            × Cancel
          </SapButton>

          <SapButton
            onClick={handleSave}
            type="neo-active"
            style={{
              marginLeft: "auto",
              padding: "1rem 2rem",
              fontSize: 16,
            }}
          >
            💾 Save
          </SapButton>
        </div>
      </div>
    </dialog>
  );
};

export default CustomAvatarDialog;
