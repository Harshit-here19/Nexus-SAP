import { useMemo, useState } from "react";
import { useConfirm } from "../../../context/ConfirmContext";

const CollectionEditor = ({ formData, onChange, isReadOnly }) => {
  const [itemText, setItemText] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const { confirm } = useConfirm();

  const stars = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 95}%`,
      top: `${Math.random() * 80}%`,
      delay: `${i * 0.7}s`,
    }));
  }, []);

  const addItem = () => {
    if (!itemText.trim()) return;

    onChange("items", [
      ...formData.items,
      {
        id: Date.now(),
        name: itemText.trim(),
      },
    ]);

    setItemText("");
  };

  const removeItem = (id) => {
    onChange(
      "items",
      formData.items.filter((item) => item.id !== id),
    );
  };

  return (
    <div className="collection-editor">
      {/* TITLE */}

      <div className="collection-title-section">
        <label className="collection-label">Collection Title</label>

        <div className="collection-title-wrapper">
          <div className="star-field">
            {stars.map((star) => (
              <span
                key={star.id}
                className="star"
                style={{
                  left: star.left,
                  top: star.top,
                  animationDelay: star.delay,
                }}
              >
                ✦
              </span>
            ))}
          </div>

          <input
            className="collection-title-input"
            value={formData.title}
            disabled={isReadOnly}
            onChange={(e) => onChange("title", e.target.value)}
          />
        </div>
      </div>

      {/* ADD ITEM */}

      {!isReadOnly && (
        <div className="collection-add-box">
          <input
            className="collection-add-input"
            value={itemText}
            onChange={(e) => setItemText(e.target.value)}
            placeholder="Add new item..."
          />

          <button className="collection-add-button" onClick={addItem}>
            Add
          </button>
        </div>
      )}

      {/* ITEMS */}

      <div className="collection-grid">
        {formData.items.length === 0 ? (
          <div className="collection-empty">No items added yet</div>
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

                const confirmed = await confirm("Delete this item?", "danger");

                if (confirmed) {
                  removeItem(item.id);
                }

                setDeleteCandidate(null);
              }}
            >
              <span className="collection-card-text">{item.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollectionEditor;
