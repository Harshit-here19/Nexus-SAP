import { useState } from "react";
import { useConfirm } from "../../../context/ConfirmContext";

const CollectionEditor = ({
  formData,
  onChange,
  isReadOnly,
}) => {
  const [itemText, setItemText] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const { confirm } = useConfirm();

  const addItem = () => {
    if (!itemText.trim()) return;

    onChange("items", [
      ...formData.items,
      {
        id: Date.now(),
        name: itemText,
      },
    ]);

    setItemText("");
  };

  const removeItem = (id) => {
    onChange(
      "items",
      formData.items.filter((x) => x.id !== id)
    );
  };

  return (
    <div
      style={{
        width: "100%",
        background: "#fff",
        borderRadius: "16px",
        padding: "24px",
        boxSizing: "border-box",
        border: "2px solid #111827",
        boxShadow: "3px 3px 0px #111827",
        fontFamily: 'jetBrains mono',
        fontWeight: 700,

      }}
    >
      {/* Title */}
      < div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: 600,
            color: "#374151",
            fontSize: "14px",
          }}
        >
          Collection Title
        </label>

        <div className="collection-title-wrapper">

          <div className="star-field">
            {[...Array(40)].map((_, i) => (
              <span
                key={i}
                className="star"
                style={{
                  left: `${Math.random() * 95}%`,
                  top: `${Math.random() * 80}%`,
                  animationDelay: `${i * 0.7}s`
                }}
              >
                ✦
              </span>
            ))}
          </div>

          <input
            value={formData.title}
            disabled={isReadOnly}
            onChange={(e) =>
              onChange("title", e.target.value)
            }
            style={{
              width: "100%",
              height: "44px",
              padding: "23px 14px",
              border: "2px solid #111827",
              boxShadow: "3px 3px 0px #111827",
              borderRadius: "10px",
              fontSize: "40px",
              fontFamily: "VT323,'jetBrains mono'",
              fontWeight: "bolder",
            }}
          />
        </div >
      </div >

      {/* Add Item */}
      {
        !isReadOnly && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            <input
              value={itemText}
              onChange={(e) =>
                setItemText(e.target.value)
              }
              placeholder="Add new item..."
              style={{
                width: "70%",
                height: "44px",
                padding: "0 14px",
                border: "2px solid #111827",
                boxShadow: "3px 3px 0px #111827",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />

            <button
              onClick={addItem}
              style={{
                padding: "0 31px",
                height: "42px",
                borderRadius: "8px",
                background: "#2563eb",
                border: "2px solid #111827",
                boxShadow: "3px 3px 0px #111827",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              Add
            </button>
          </div>
        )
      }

      {/* Items */}
      <div
        style={{
          width: "100%",
          columnCount: window.innerWidth < 768 ? 2 : 4,
          columnGap: "16px",
          marginTop: "24px",
        }}
      >
        {formData.items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px",
              color: "#9ca3af",
              border: "2px dashed #e5e7eb",
              borderRadius: "10px",
            }}
          >
            No items added yet
          </div>
        ) : (
          formData.items.map((item) => (
            <div
              key={item.id}
              className={`
                    collection-card
                    ${!isReadOnly ? "editable" : ""}
                    ${deleteCandidate === item.id ? "delete-selected" : ""}
                  `}
              onClick={async () => {
                if (isReadOnly) return;

                if (deleteCandidate !== item.id) {
                  setDeleteCandidate(item.id);
                  return;
                }

                const confirmed = await confirm(
                  "Delete this item?",
                  "danger"
                );

                if (confirmed) {
                  removeItem(item.id);
                }

                setDeleteCandidate(null);
              }}
            >
              <span
                style={{
                  fontFamily: "VT323",
                  fontSize: "20px",
                  color: "#222",
                  textShadow: "0 1px 3px rgba(0,0,0,.5)",
                  lineHeight: "1.6",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.name}
              </span>

            </div>
          ))
        )}
      </div>
    </div >
  );
};

export default CollectionEditor;