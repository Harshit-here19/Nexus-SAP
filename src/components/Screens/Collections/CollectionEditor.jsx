import { useState } from "react";
import { useConfirm } from "../../../context/ConfirmContext";

const CollectionEditor = ({
  formData,
  onChange,
  isReadOnly,
}) => {
  const [itemText, setItemText] = useState("");
  const {confirm } = useConfirm();

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
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: "24px" }}>
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

        <input
          value={formData.title}
          disabled={isReadOnly}
          onChange={(e) =>
            onChange("title", e.target.value)
          }
          style={{
            width: "70%",
            minWidth: "300px",
            height: "44px",
            padding: "0 14px",
            border: "2px solid #111827",
            boxShadow: "3px 3px 0px #111827",
            borderRadius: "10px",
            fontSize: "15px",
          }}
        />
      </div>

      {/* Add Item */}
      {!isReadOnly && (
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
              width: "60%",
              minWidth: "300px",
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
      )}

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
              style={{
                breakInside: "avoid",
                WebkitColumnBreakInside: "avoid",

                marginBottom: "16px",

                minHeight: "90px",

                padding: "16px",

                background: "#fafafa",

                border: "2px solid #1f2937",

                borderRadius: "12px",

                boxShadow: "4px 4px 0px #1f2937",

                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s ease-in-out",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "-4px -4px 0 #1f2937" }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "4px 4px 0 #1f2937" }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#111827",
                  lineHeight: "1.6",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.name}
              </span>

              {!isReadOnly && (
                <button
                  onClick={async () => {
                    const confirmed = await confirm(
                      "Are you sure you want to delete this note?",
                      "danger",
                    );
                    if (confirmed) removeItem(item.id)
                  }
                  }
                  style={{
                    alignSelf: "flex-end",
                    marginTop: "12px",

                    background: "#ef4444",
                    border: "2px solid #111827",
                    boxShadow: "3px 3px 0px #111827",
                    color: "#fff",

                    padding: "6px 12px",

                    borderRadius: "6px",

                    fontSize: "13px",

                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollectionEditor;