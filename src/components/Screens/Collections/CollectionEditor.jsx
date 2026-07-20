import { useMemo, useState } from "react";
import { useConfirm } from "../../../context/ConfirmContext";

import NotificationModule from "../../Common/NotificationModule";

const CollectionEditor = ({
  formData,
  onChange,
  onToggleCompleted,
  isReadOnly,
  filter,
  sortBy
}) => {
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

  const displayedItems = useMemo(() => {
    let items = [...formData.items];

    // Filter
    switch (filter) {
      case "completed":
        items = items.filter((item) => item.completed);
        break;

      case "pending":
        items = items.filter((item) => !item.completed);
        break;

      default:
        break;
    }

    // Sort
    switch (sortBy) {
      case "az":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "za":
        items.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "completed":
        items.sort((a, b) => b.completed - a.completed);
        break;

      case "pending":
        items.sort((a, b) => a.completed - b.completed);
        break;

      default:
        // Keep original order
        break;
    }

    return items;
  }, [formData.items, filter, sortBy]);

  const addItem = () => {
    if (!itemText.trim()) return;

    onChange("items", [
      ...formData.items,
      {
        id: Date.now(),
        name: itemText.trim(),
        completed: false,
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

  const handleCompleteClick = (id) => {
    onToggleCompleted(id);
  };

  const handleDeleteClick = async (id) => {
    if (deleteCandidate !== id) {
      setDeleteCandidate(id);
      return;
    }

    const confirmed = await confirm("Delete this item?", "danger");

    if (confirmed) {
      removeItem(id);
    }

    setDeleteCandidate(null);
  };

  const handleCardClick = async (event, item) => {
    if (isReadOnly) {
      await navigator.clipboard.writeText(item.name);
      console.log("Copied:", item.name);
      NotificationModule.notify("info", `${formData.collectionNumber} Copied!`, { type: 'info' });
      return;
    }

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    // click position inside card
    const clickPosition = event.clientY - rect.top;

    // upper 50%
    const isUpperPart = clickPosition < rect.height * 0.65;

    if (isUpperPart) {
      handleCompleteClick(item.id);
      return;
    }
    handleDeleteClick(item.id);
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addItem();
              }
            }}
            placeholder="Add new item..."
          />

          <button className="collection-add-button" onClick={addItem}>
            Add
          </button>
        </div>
      )}

      {/* ITEMS */}

      <div className="collection-grid">
        {displayedItems.length === 0 ? (
          <div className="collection-empty">No items added yet</div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className={`
                  collection-card
                  ${item.completed ? "completed" : ""}
                  ${!isReadOnly ? "editable" : ""}
                  ${deleteCandidate === item.id ? "delete-selected" : ""}
              `}
              onClick={(e) => handleCardClick(e, item)}
              onDoubleClick={(e) => {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection) selection.removeAllRanges();
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
