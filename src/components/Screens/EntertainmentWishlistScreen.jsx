// src/components/Screens/EntertainmentWishlistScreen.jsx
import { useState, useEffect, useRef } from "react";
import SapButton from "../Common/SapButton";
import SapInput from "../Common/SapInput";
import SapSelect from "../Common/SapSelect";
import SapTabs from "../Common/SapTabs";
import SapModal from "../Common/SapModal";
import { useTransaction } from "../../context/TransactionContext";
import { useAuth } from "../../context/AuthContext";
import { useAction } from "../../context/ActionContext";
import { useConfirm } from "../../context/ConfirmContext";
import {
  getTableData,
  addRecord,
  updateRecord,
  findRecord,
  getAllData,
  saveAllData,
} from "../../utils/storage";

// =======================================
//          📌📌📌 CONSTANTS 📌📌📌
// =======================================

// Entertainment Categories with prefixes
export const ENTERTAINMENT_CATEGORIES = [
  { value: "MO", label: "🎬 Movies", color: "#e91e63", icon: "🎬" },
  { value: "SE", label: "📺 Series", color: "#9c27b0", icon: "📺" },
  { value: "AN", label: "🎌 Anime", color: "#2196f3", icon: "🎌" },
  { value: "WE", label: "📖 Webtoon/Manhwa", color: "#4caf50", icon: "📖" },
  { value: "HE", label: "🔞 Hentai", color: "#f44336", icon: "🔞" },
  { value: "GA", label: "🎮 Games", color: "#ff9800", icon: "🎮" },
  { value: "PO", label: "🎥 Adult Films", color: "#795548", icon: "🎥" },
];

// Watch/Read/Play Status
const STATUS_OPTIONS = [
  { value: "planned", label: "📋 Planned", color: "#9e9e9e" },
  { value: "in_progress", label: "▶️ In Progress", color: "#2196f3" },
  { value: "completed", label: "✅ Completed", color: "#4caf50" },
  { value: "on_hold", label: "⏸️ On Hold", color: "#ff9800" },
  { value: "dropped", label: "❌ Dropped", color: "#f44336" },
  { value: "rewatching", label: "🔄 Re-watching", color: "#9c27b0" },
];

// Priority Levels
const PRIORITY_OPTIONS = [
  { value: "low", label: "🟢 Low", color: "#4caf50" },
  { value: "medium", label: "🟡 Medium", color: "#ff9800" },
  { value: "high", label: "🔴 High", color: "#f44336" },
  { value: "must_watch", label: "⭐ Must Watch/Play", color: "#e91e63" },
];

// Genres
const GENRE_OPTIONS = [
  // ========== MAIN GENRES ==========
  { value: "action", label: "Action" },
  { value: "adventure", label: "Adventure" },
  { value: "comedy", label: "Comedy" },
  { value: "drama", label: "Drama" },
  { value: "fantasy", label: "Fantasy" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "sci_fi", label: "Sci-Fi" },
  { value: "slice_of_life", label: "Slice of Life" },
  { value: "thriller", label: "Thriller" },

  // ========== ANIME/GAME SPECIFIC ==========
  { value: "isekai", label: "Isekai" },
  { value: "harem", label: "Harem" },
  { value: "reverse_harem", label: "Reverse Harem" },
  { value: "school", label: "School Life" },
  { value: "supernatural", label: "Supernatural" },

  // ========== ADULT THEMES ==========
  { value: "vanilla", label: "Vanilla" },
  { value: "ntr", label: "NTR (Netorare)" },
  { value: "netori", label: "Netori" },
  { value: "cuckold", label: "Cuckold" },
  { value: "corruption", label: "Corruption" },
  { value: "milf", label: "MILF" },
  { value: "incest", label: "Incest" },
  { value: "cheating", label: "Cheating" },
  { value: "femdom", label: "Femdom" },
  { value: "bdsm", label: "BDSM" },
  { value: "mind_control", label: "Mind Control" },
  { value: "blackmail", label: "Blackmail" },

  // ========== OTHER ==========
  { value: "other", label: "Other" },
];

// Platform options
const PLATFORM_OPTIONS = [
  { value: "netflix", label: "📺 Netflix" },
  { value: "amazon_prime", label: "📦 Amazon Prime" },
  { value: "disney_plus", label: "🏰 Disney+" },
  { value: "hbo_max", label: "🎬 HBO Max" },
  { value: "hulu", label: "📗 Hulu" },
  { value: "crunchyroll", label: "🍥 Crunchyroll" },
  { value: "funimation", label: "🎌 Funimation" },
  { value: "youtube", label: "▶️ YouTube" },
  { value: "webtoon", label: "📖 Webtoon" },
  { value: "tapas", label: "📚 Tapas" },
  { value: "mangadex", label: "📕 MangaDex" },
  { value: "torrent", label: "🏴‍☠️ Torrent" },
  { value: "physical", label: "💿 Physical" },
  { value: "hotstar", label: "✨🎬 Disney+ Hotstar" },
  { value: "other", label: "📁 Other" },
];

const initialFormState = (user) => ({
  itemNumber: "",
  category: "",
  title: "",
  description: "",
  year: "",
  status: "planned",
  priority: "medium",
  rating: "",
  genres: [],
  platform: "",
  imageUrl: "",
  episodes: "",
  currentEpisode: "",
  chapters: "",
  currentChapter: "",
  seasons: "",
  currentSeason: "",
  duration: "",
  studio: "",
  developer: "",
  director: "",
  cast: "",
  notes: "",
  tags: "",
  isNsfw: false,
  createdBy: user?.username || "SAPUSER",
})

const EntertainmentWishlistScreen = ({ mode = "create" }) => {
  const isMobile = window.innerWidth <= 768;

  const { updateStatus, markAsChanged, markAsSaved, goBack, currentTransaction } = useTransaction();
  const { user } = useAuth();
  const { registerAction, clearAction } = useAction();
  const { confirm } = useConfirm();

  const saveRef = useRef(null);
  const clearRef = useRef(null);
  const deleteRef = useRef(null);
  const printRef = useRef(null);

  const [itemId, setItemId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Form data
  const [formData, setFormData] = useState(initialFormState(user));

  const [errors, setErrors] = useState({});

  // Generate next ID based on category
  const generateNextId = (category) => {
    const data = getTableData("entertainment_wishlist") || [];
    const categoryItems = data.filter((item) =>
      item.itemNumber?.startsWith(category),
    );

    let maxNum = 0;
    categoryItems.forEach((item) => {
      const num = parseInt(item.itemNumber.replace(category, ""), 10);
      if (num > maxNum) maxNum = num;
    });

    return `${category}${String(maxNum + 1).padStart(9, "0")}`;
  };

  // Handle form field change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    markAsChanged();
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle category change (updates ID prefix)
  const handleCategoryChange = (category) => {
    handleChange("category", category);
    if (mode === "create") {
      const newId = generateNextId(category);
      setFormData((prev) => ({ ...prev, category, itemNumber: newId }));
    }
  };

  // Handle genre multi-select
  const handleGenreToggle = (genre) => {
    const currentGenres = formData.genres || [];
    if (currentGenres.includes(genre)) {
      handleChange(
        "genres",
        currentGenres.filter((g) => g !== genre),
      );
    } else {
      handleChange("genres", [...currentGenres, genre]);
    }
  };

  // Load item for edit/view
  const loadItem = () => {
    if (!itemId.trim()) {
      updateStatus("Enter an item ID", "warning");
      return;
    }

    const data = getTableData("entertainment_wishlist") || [];
    const item = data.find((i) => i.itemNumber === itemId.trim());

    if (item) {
      setFormData(item);
      setIsLoaded(true);
      updateStatus(`Item ${itemId} loaded successfully`, "success");
    } else {
      updateStatus(`Item ${itemId} not found`, "error");
    }
  };

  // Search items
  const handleSearch = () => {
    let items = getTableData("entertainment_wishlist") || [];

    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (i) =>
          i.itemNumber?.toLowerCase().includes(term) ||
          i.title?.toLowerCase().includes(term) ||
          i.description?.toLowerCase().includes(term) ||
          i.tags?.toLowerCase().includes(term),
      );
    }

    if (filterCategory !== "all") {
      items = items.filter((i) => i.category === filterCategory);
    }

    if (filterStatus !== "all") {
      items = items.filter((i) => i.status === filterStatus);
    }

    if (filterPriority !== "all") {
      items = items.filter((i) => i.priority === filterPriority);
    }

    // Sort by priority and then by date
    const priorityOrder = { must_watch: 0, high: 1, medium: 2, low: 3 };
    items = items.sort((a, b) => {
      const pA = priorityOrder[a.priority] ?? 2;
      const pB = priorityOrder[b.priority] ?? 2;
      if (pA !== pB) return pA - pB;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    setSearchResults(items);
    setShowSearchModal(true);
  };

  // Select item from search
  const handleSelectItem = (item) => {
    setItemId(item.itemNumber);
    setFormData(item);
    setIsLoaded(true);
    setShowSearchModal(false);
    updateStatus(`Item ${item.itemNumber} selected`, "success");
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save item
  saveRef.current = () => {
    if (!validateForm()) {
      updateStatus("Please fill in all required fields", "error");
      return;
    }

    try {
      const allData = getAllData();
      if (!allData.entertainment_wishlist) {
        allData.entertainment_wishlist = [];
      }

      if (mode === "create") {
        const itemNumber =
          formData.itemNumber || generateNextId(formData.category);
        const newItem = {
          ...formData,
          id: Date.now(),
          itemNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        allData.entertainment_wishlist.push(newItem);
        saveAllData(allData);
        setFormData((prev) => ({ ...prev, itemNumber, id: newItem.id }));
        markAsSaved();
        clearRef.current?.();
        updateStatus(`Item ${itemNumber} created successfully`, "success");
      } else if (mode === "change") {
        const index = allData.entertainment_wishlist.findIndex(
          (i) => i.id === formData.id,
        );
        if (index !== -1) {
          allData.entertainment_wishlist[index] = {
            ...formData,
            updatedAt: new Date().toISOString(),
          };
          saveAllData(allData);
          markAsSaved();
          updateStatus(
            `Item ${formData.itemNumber} updated successfully`,
            "success",
          );
        }
      }
    } catch (error) {
      updateStatus(`Error saving item: ${error.message}`, "error");
    }
  };

  // Clear form
  clearRef.current = () => {
    setFormData(initialFormState(user));
    setItemId("");
    setIsLoaded(false);
    setErrors({});
    markAsSaved();
    updateStatus("Form cleared", "info");
  };

  useEffect(() => {
    registerAction("SAVE", () => {
      saveRef.current?.();
    });
    registerAction("CLEAR", () => {
      clearRef.current?.();
    });
    registerAction("DELETE", () => {
      deleteRef.current?.();
    });
    registerAction("PRINT", () => {
      printRef.current?.();
    });

    return () => {
      clearAction("SAVE");
      clearAction("CLEAR");
      clearAction("DELETE");
      clearAction("PRINT");
    };
  }, []);

  // Delete item
  deleteRef.current = async () => {
    if (!formData.id) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this item from your wishlist?",
      "danger",
    );
    if (confirmed) {
      const allData = getAllData();
      allData.entertainment_wishlist = (
        allData.entertainment_wishlist || []
      ).filter((i) => i.id !== formData.id);
      saveAllData(allData);
      clearRef.current?.();
      goBack();
      updateStatus("Item deleted successfully", "success");
    }
  };

  //Delete in search modal
  const DeleteInSearchModal = async (id) => {
    if (!id) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this wishlist item?",
      "danger",
    );
    if (confirmed) {
      const expenses = getTableData("entertainment_wishlist");
      const filtered = expenses.filter((e) => e.id !== id);
      const allData = getAllData();
      allData.entertainment_wishlist = filtered;
      saveAllData(allData);
      clearRef.current?.();
      updateStatus("Item deleted successfully", "success");
      setSearchResults(filtered);
    }
    markAsSaved();
  };

  // Print function
  printRef.current = () => {
    const mediaItems = getTableData("entertainment_wishlist") || []; // Adjust key as needed
    const html = generateMediaReport(mediaItems);

    if (!html) return;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // setTimeout(() => {
    //   printWindow.print();
    // }, 500);
  };

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return (
      ENTERTAINMENT_CATEGORIES.find((c) => c.value === categoryValue) || {
        label: categoryValue,
        color: "#9e9e9e",
        icon: "📁",
      }
    );
  };

  // Get status info
  const getStatusInfo = (statusValue) => {
    return (
      STATUS_OPTIONS.find((s) => s.value === statusValue) || {
        label: statusValue,
        color: "#9e9e9e",
      }
    );
  };

  // Get priority info
  const getPriorityInfo = (priorityValue) => {
    return (
      PRIORITY_OPTIONS.find((p) => p.value === priorityValue) || {
        label: priorityValue,
        color: "#9e9e9e",
      }
    );
  };

  // Calculate progress
  const getProgress = () => {
    if (formData.episodes && formData.currentEpisode) {
      return Math.round(
        (parseInt(formData.currentEpisode) / parseInt(formData.episodes)) * 100,
      );
    }
    if (formData.chapters && formData.currentChapter) {
      return Math.round(
        (parseInt(formData.currentChapter) / parseInt(formData.chapters)) * 100,
      );
    }
    return null;
  };

  // Render rating stars
  const renderRating = (rating, editable = false) => {
    const maxRating = 10;
    const currentRating = parseInt(rating) || 0;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "space-around" }}>
        {[...Array(maxRating)].map((_, i) => (
          <span
            key={i}
            onClick={() => editable && handleChange("rating", i + 1)}
            style={{
              cursor: editable ? "pointer" : "default",
              fontSize: "22px",
              color: i < currentRating ? "#ffc107" : "#e0e0e0",
              transition: "transform 0.1s",
            }}
            onMouseEnter={(e) =>
              editable && (e.target.style.transform = "scale(1.2)")
            }
            onMouseLeave={(e) =>
              editable && (e.target.style.transform = "scale(1)")
            }
          >
            ★
          </span>
        ))}
        {currentRating > 0 && (
          <span
            style={{ marginLeft: "8px", fontSize: "13px", fontWeight: "600" }}
          >
            {currentRating}/10
          </span>
        )}
      </div>
    );
  };

  const isReadOnly = mode === "display";
  const needsLoad = (mode === "change" || mode === "display") && !isLoaded;

  // Get relevant fields based on category
  const showEpisodeFields = ["SE", "AN", "HE"].includes(formData.category);
  const showChapterFields = ["WE"].includes(formData.category);
  const showSeasonFields = ["SE"].includes(formData.category);
  const showDeveloperField = ["GA"].includes(formData.category);
  const showStudioField = ["AN", "MO", "SE", "HE"].includes(formData.category);
  const showDirectorField = ["MO", "PO"].includes(formData.category);

  // Details Tab
  const detailsTab = (
    <div className="sap-form">
      <div
        style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}
      >
        {/* Left Column */}
        <div>
          <h4
            style={{
              marginBottom: "14px",
              color: formData.category
                ? getCategoryInfo(formData.category).color
                : "var(--sap-brand)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span>
              {formData.category
                ? getCategoryInfo(formData.category).icon
                : "🎬"}
            </span>
            Basic Information
          </h4>

          <SapInput
            label="Item ID"
            value={formData.itemNumber}
            readOnly={true}
            placeholder="Select category first"
          />

          <SapSelect
            label="Category"
            value={formData.category}
            onChange={handleCategoryChange}
            options={ENTERTAINMENT_CATEGORIES.map((c) => ({
              value: c.value,
              label: `${c.icon} ${c.label.replace(/^[^\s]+\s/, "")}`,
            }))}
            required={true}
            disabled={isReadOnly || mode === "change"}
            placeholder="Select category..."
            error={errors.category}
          />

          <SapInput
            label="Title"
            value={formData.title}
            onChange={(val) => handleChange("title", val)}
            required={true}
            disabled={isReadOnly}
            error={errors.title}
            placeholder="Enter title..."
          />

          <SapInput
            label="Year"
            value={formData.year}
            onChange={(val) => handleChange("year", val)}
            disabled={isReadOnly}
            placeholder="Release year"
            type="number"
            min="1900"
            max="2099"
          />

          <SapInput
            label="Image URL"
            value={formData.imageUrl}
            onChange={(val) => handleChange("imageUrl", val)}
            disabled={isReadOnly}
            placeholder="Poster/cover image URL"
          />
        </div>

        {/* Right Column */}
        <div>
          <h4
            style={{
              marginBottom: "14px",
              color: "var(--sap-brand)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span>📊</span> Status & Priority
          </h4>

          <SapSelect
            label="Status"
            value={formData.status}
            onChange={(val) => handleChange("status", val)}
            options={STATUS_OPTIONS.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
            required={true}
            disabled={isReadOnly}
          />

          <SapSelect
            label="Priority"
            value={formData.priority}
            onChange={(val) => handleChange("priority", val)}
            options={PRIORITY_OPTIONS.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
            disabled={isReadOnly}
          />

          <div className="sap-form-group">
            <label className="sap-form-label" style={{ width: "130px" }}>Rating</label>
            <div className="sap-form-field">
              {renderRating(formData.rating, !isReadOnly)}
              {!isReadOnly && formData.rating && (
                <button
                  onClick={() => handleChange("rating", "")}
                  style={{
                    marginLeft: "8px",
                    background: "none",
                    border: "none",
                    color: "var(--sap-negative)",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <SapSelect
            label="Platform"
            value={formData.platform}
            onChange={(val) => handleChange("platform", val)}
            options={PLATFORM_OPTIONS}
            disabled={isReadOnly}
            placeholder="Where to watch/play..."
          />

          <div style={{ marginTop: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                background: formData.isNsfw
                  ? "#ffebee"
                  : "var(--sap-content-bg)",
                borderRadius: "6px",
                cursor: isReadOnly ? "default" : "pointer",
                width: "fit-content",
                border: formData.isNsfw
                  ? "1px solid #f44336"
                  : "1px solid transparent",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isNsfw}
                onChange={(e) => handleChange("isNsfw", e.target.checked)}
                disabled={isReadOnly}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#f44336",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  color: formData.isNsfw ? "#f44336" : "inherit",
                }}
              >
                🔞 NSFW Content
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      {formData.title && (
        <div
          style={{
            marginTop: "20px",
            padding: isMobile ? "12px" : "16px",
            background: `linear-gradient(135deg, ${getCategoryInfo(formData.category).color}15 0%, ${getCategoryInfo(formData.category).color}05 100%)`,
            borderLeft: `4px solid ${getCategoryInfo(formData.category).color}`,
            borderRadius: "6px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "12px" : "16px",
          }}
        >
          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt={formData.title}
              style={{
                width: isMobile ? "100%" : "80px",
                height: isMobile ? "180px" : "120px",
                objectFit: "cover",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  background: getCategoryInfo(formData.category).color,
                  color: "white",
                  borderRadius: "4px",
                }}
              >
                {formData.itemNumber ||
                  getCategoryInfo(formData.category).value}
              </span>
              {formData.isNsfw && (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    background: "#f44336",
                    color: "white",
                    borderRadius: "4px",
                  }}
                >
                  NSFW
                </span>
              )}
            </div>
            <div
              style={{
                fontWeight: "700",
                fontSize: isMobile ? "15px" : "16px",
                marginBottom: "4px",
              }}
            >
              {formData.title}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
                rowGap: "6px",
              }}
            >
              <span
                className={`sap-badge ${formData.status === "completed"
                  ? "success"
                  : formData.status === "in_progress"
                    ? "info"
                    : formData.status === "dropped"
                      ? "error"
                      : formData.status === "on_hold"
                        ? "warning"
                        : ""
                  }`}
              >
                {getStatusInfo(formData.status).label}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  background: getPriorityInfo(formData.priority).color,
                  color: "white",
                  borderRadius: "10px",
                }}
              >
                {formData.priority?.replace("_", " ").toUpperCase()}
              </span>
              {formData.year && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--sap-text-secondary)",
                  }}
                >
                  📅 {formData.year}
                </span>
              )}
              {formData.rating && (
                <span style={{ fontSize: "12px", color: "#ffc107" }}>
                  ⭐ {formData.rating}/10
                </span>
              )}
            </div>
            <div
              style={{
                marginTop: "10px",
                fontSize: isMobile ? "14px" : "13px",
                fontWeight: "500",
                lineHeight: "1.6",
                color: "#6b7280",
                maxHeight: isMobile ? "none" : "90px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: isMobile ? 5 : 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {formData.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Progress Tab
  const progressTab = (
    <div className="sap-form">
      <div
        style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}
      >
        <div>
          <h4
            style={{
              marginBottom: "14px",
              color: "var(--sap-brand)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span>📈</span> Progress Tracking
          </h4>

          {showEpisodeFields && (
            <SapInput
              label='Episodes'
              type="number"
              value={formData.episodes}
              onChange={(val) => handleChange("episodes", val)}
              disabled={isReadOnly}
              placeholder="Total"
              min="0"
            />
          )}

          {showSeasonFields && (
            <SapInput
              label="Seasons"
              type="number"
              value={formData.seasons}
              onChange={(val) => handleChange("seasons", val)}
              disabled={isReadOnly}
              placeholder="Total"
              min="0"
            />
          )}

          {showChapterFields && (
            <SapInput
              label='Chapters'
              type="number"
              value={formData.chapters}
              onChange={(val) => handleChange("chapters", val)}
              disabled={isReadOnly}
              placeholder="Total"
              min={0}
            />
          )}

          <SapInput
            label="Duration"
            value={formData.duration}
            onChange={(val) => handleChange("duration", val)}
            disabled={isReadOnly}
            placeholder="e.g., 2h 30m, 24 min/ep"
          />

          {/* Progress Bar */}
          {getProgress() !== null && (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--sap-text-secondary)",
                  }}
                >
                  Progress
                </span>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>
                  {getProgress()}%
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "var(--sap-border)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${getProgress()}%`,
                    background:
                      getProgress() === 100
                        ? "var(--sap-positive)"
                        : "var(--sap-brand)",
                    borderRadius: "4px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Details/Credits Tab
  const creditsTab = (
    <div className="sap-form">
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}
      >
        <div>
          <h4
            style={{
              marginBottom: "14px",
              color: "var(--sap-brand)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span>🎭</span> Credits & Details
          </h4>

          {showStudioField && (
            <SapInput
              label="Studio"
              value={formData.studio}
              onChange={(val) => handleChange("studio", val)}
              disabled={isReadOnly}
              placeholder="Animation/Production studio"
            />
          )}

          {showDeveloperField && (
            <SapInput
              label="Developer"
              value={formData.developer}
              onChange={(val) => handleChange("developer", val)}
              disabled={isReadOnly}
              placeholder="Game developer"
            />
          )}

          {showDirectorField && (
            <SapInput
              label="Director"
              value={formData.director}
              onChange={(val) => handleChange("director", val)}
              disabled={isReadOnly}
              placeholder="Director name"
            />
          )}

          <SapInput
            label="Cast/Actors"
            value={formData.cast}
            onChange={(val) => handleChange("cast", val)}
            disabled={isReadOnly}
            placeholder="Main cast, voice actors..."
          />
        </div>

        <div>
          <h4
            style={{
              marginBottom: "14px",
              color: "var(--sap-brand)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span>🏷️</span> Genres
          </h4>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              maxHeight: "200px",
              overflowY: "auto",
              padding: "8px",
              background: "var(--sap-content-bg)",
              borderRadius: "6px",
            }}
          >
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre.value}
                onClick={() => !isReadOnly && handleGenreToggle(genre.value)}
                disabled={isReadOnly}
                style={{
                  padding: "6px 12px",
                  border: "1px solid",
                  borderColor: (formData.genres || []).includes(genre.value)
                    ? "var(--sap-brand)"
                    : "var(--sap-border)",
                  background: (formData.genres || []).includes(genre.value)
                    ? "var(--sap-brand)"
                    : "white",
                  color: (formData.genres || []).includes(genre.value)
                    ? "white"
                    : "var(--sap-text-primary)",
                  borderRadius: "16px",
                  cursor: isReadOnly ? "default" : "pointer",
                  fontSize: "11px",
                  transition: "all 0.2s",
                }}
              >
                {genre.label}
              </button>
            ))}
          </div>

          {(formData.genres || []).length > 0 && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "11px",
                color: "var(--sap-text-secondary)",
              }}
            >
              Selected:{" "}
              {(formData.genres || [])
                .map((g) => GENRE_OPTIONS.find((go) => go.value === g)?.label)
                .join(", ")}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4
          style={{
            marginBottom: "14px",
            color: "var(--sap-brand)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
          }}
        >
          <span>📝</span> Description
        </h4>
        <textarea
          className="sap-textarea"
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          disabled={isReadOnly}
          placeholder="Synopsis, description, or your thoughts..."
          rows={4}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );

  // Notes Tab
  const notesTab = (
    <div className="sap-form">
      <div className="sap-form-group" style={{ alignItems: "flex-start" }}>
        <label className="sap-form-label">Personal Notes</label>
        <div className="sap-form-field">
          <textarea
            className="sap-textarea"
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            disabled={isReadOnly}
            placeholder="Your personal notes, review, thoughts..."
            rows={6}
            style={{ width: "100%", maxWidth: isMobile ? "100%" : "600px" }}
          />
        </div>
      </div>

      <SapInput
        label="Tags"
        value={formData.tags}
        onChange={(val) => handleChange("tags", val)}
        disabled={isReadOnly}
        placeholder="Comma-separated tags (e.g., masterpiece, comfort, rewatch)"
      />

      {formData.tags && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginLeft: "162px",
          }}
        >
          {formData.tags.split(",").map((tag, i) => (
            <span
              key={i}
              style={{
                padding: "4px 10px",
                background: "var(--sap-brand-lighter)",
                color: "var(--sap-brand-dark)",
                borderRadius: "12px",
                fontSize: "11px",
              }}
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // History Tab
  const historyTab = (
    <div>
      <div className="sap-message-strip info" style={{ marginBottom: "16px" }}>
        <span className="sap-message-strip-icon">ℹ️</span>
        <span>Record information and history.</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            Item ID
          </div>
          <div
            style={{
              fontWeight: "600",
              fontSize: "13px",
              fontFamily: "monospace",
            }}
          >
            {formData.itemNumber || "-"}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            Category
          </div>
          <div
            style={{
              fontWeight: "600",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{getCategoryInfo(formData.category).icon}</span>
            {getCategoryInfo(formData.category).label.replace(/^[^\s]+\s/, "")}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            Created By
          </div>
          <div style={{ fontWeight: "600", fontSize: "13px" }}>
            {formData.createdBy || "-"}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            Created On
          </div>
          <div style={{ fontWeight: "600", fontSize: "13px" }}>
            {formData.createdAt
              ? new Date(formData.createdAt).toLocaleString()
              : "-"}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            Last Updated
          </div>
          <div style={{ fontWeight: "600", fontSize: "13px" }}>
            {formData.updatedAt
              ? new Date(formData.updatedAt).toLocaleString()
              : "-"}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            background: "var(--sap-content-bg)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--sap-text-secondary)",
              marginBottom: "4px",
            }}
          >
            Status
          </div>
          <div>
            <span
              className={`sap-badge ${formData.status === "completed"
                ? "success"
                : formData.status === "dropped"
                  ? "error"
                  : formData.status === "in_progress"
                    ? "info"
                    : formData.status === "on_hold"
                      ? "warning"
                      : ""
                }`}
            >
              {getStatusInfo(formData.status).label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { label: "Details", icon: "📋", content: detailsTab },
    { label: "Progress", icon: "📈", content: progressTab },
    { label: "Credits", icon: "🎭", content: creditsTab },
    { label: "Notes", icon: "📝", content: notesTab },
    ...(formData.id
      ? [{ label: "History", icon: "🕐", content: historyTab }]
      : []),
  ];

  const getModeTitle = () => {
    switch (mode) {
      case "create":
        return "Add to Wishlist";
      case "change":
        return "Edit Wishlist Item";
      case "display":
        return "View Wishlist Item";
      default:
        return "Entertainment Wishlist";
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "create":
        return "➕";
      case "change":
        return "✏️";
      case "display":
        return "👁️";
      default:
        return "🎬";
    }
  };

  return (
    <div>
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">{getModeIcon()}</span>
            {getModeTitle()} - WS0
            {mode === "create" ? "1" : mode === "change" ? "2" : "3"}
          </span>
          <div className="sap-panel-header-actions">
            <span
              className={`sap-badge ${mode === "create" ? "info" : mode === "change" ? "warning" : "success"}`}
            >
              {mode === "create" ? "NEW" : mode === "change" ? "EDIT" : "VIEW"}
            </span>
            {formData.category && (
              <span
                className="sap-badge"
                style={{
                  marginLeft: "8px",
                  background: getCategoryInfo(formData.category).color,
                  color: "white",
                }}
              >
                {getCategoryInfo(formData.category).icon} {formData.category}
              </span>
            )}
            {formData.isNsfw && (
              <span className="sap-badge error" style={{ marginLeft: "8px" }}>
                🔞 NSFW
              </span>
            )}
          </div>
        </div>
        <div className="sap-panel-content">
          {needsLoad ? (
            <div>
              <div
                className="sap-message-strip info"
                style={{ marginBottom: "16px" }}
              >
                <span className="sap-message-strip-icon">ℹ️</span>
                <span>
                  Enter an item ID to load or search for existing items in your
                  wishlist.
                </span>
              </div>

              <div
                className="sap-form-row"
                style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
              >
                <SapInput
                  label="Item ID"
                  value={itemId}
                  onChange={setItemId}
                  placeholder="e.g., MO000000001, AN000000001"
                  icon="🔍"
                  onIconClick={() => {
                    setSearchResults(
                      getTableData("entertainment_wishlist") || [],
                    );
                    setShowSearchModal(true);
                  }}
                />
                <SapButton onClick={loadItem} type="primary" icon="📂">
                  Load
                </SapButton>
                <SapButton
                  type="search"
                  onClick={() => {
                    setSearchResults(
                      getTableData("entertainment_wishlist") || [],
                    );
                    setShowSearchModal(true);
                  }}
                  icon="🔎"
                >
                  Search
                </SapButton>
              </div>

              {/* Category Quick Filters */}
              <div style={{ marginTop: "20px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--sap-text-secondary)",
                    marginBottom: "8px",
                  }}
                >
                  Quick filter by category:
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {ENTERTAINMENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setFilterCategory(cat.value);
                        handleSearch();
                      }}
                      style={{
                        padding: "8px 16px",
                        background: `${cat.color}15`,
                        border: `1px solid ${cat.color}`,
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: cat.color,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                    >
                      {cat.icon} {cat.label.replace(/^[^\s]+\s/, "")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <SapTabs tabs={tabs} />
            </>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SapModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onConfirm={handleSearch}
        title="🔍 Search Entertainment Wishlist"
        width="900px"
        footer={
          <SapButton type="close" onClick={() => setShowSearchModal(false)}>Close</SapButton>
        }
      >
        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            className="sap-input"
            placeholder="🔍 Search by ID, title, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: "200px" }}
          />
          <select
            className="sap-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: isMobile ? "100%" : "160px" }}
          >
            <option value="all">All Categories</option>
            {ENTERTAINMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label.replace(/^[^\s]+\s/, "")}
              </option>
            ))}
          </select>
          <select
            className="sap-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: isMobile ? "50%" : "130px" }}
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            className="sap-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ width: isMobile ? "45%" : "130px" }}
          >
            <option value="all">All Priority</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <SapButton onClick={handleSearch} type="close">
            Search
          </SapButton>
        </div>

        {/* Category Summary */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          {ENTERTAINMENT_CATEGORIES.map((cat) => {
            const count = searchResults.filter(
              (i) => i.category === cat.value,
            ).length;
            return (
              <div
                key={cat.value}
                onClick={() => {
                  setFilterCategory(cat.value);
                  handleSearch();
                }}
                style={{
                  padding: "4px 10px",
                  background: `${cat.color}15`,
                  borderRadius: "12px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {cat.icon}
                <span style={{ fontWeight: "600" }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Results */}
        <div className="sap-table-scroller">
          <table className="sap-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}></th>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Rating</th>
                {currentTransaction === "WS02" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <div style={{ color: "var(--sap-text-secondary)" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                        📭
                      </div>
                      <div>No items found in your wishlist</div>
                      <div style={{ fontSize: "12px", marginTop: "4px" }}>
                        Try adjusting your filters or add new items
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                searchResults.map((item, index) => (
                  <tr key={index}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleSelectItem(item)
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          style={{
                            width: "32px",
                            height: "45px",
                            objectFit: "cover",
                            borderRadius: "2px",
                          }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div
                          style={{
                            width: "32px",
                            height: "45px",
                            background: getCategoryInfo(item.category).color,
                            borderRadius: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "16px",
                          }}
                        >
                          {getCategoryInfo(item.category).icon}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        fontWeight: "600",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    >
                      {item.itemNumber}
                      {item.isNsfw && (
                        <span
                          style={{
                            marginLeft: "4px",
                            fontSize: "9px",
                            padding: "1px 4px",
                            background: "#f44336",
                            color: "white",
                            borderRadius: "2px",
                          }}
                        >
                          18+
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: "500" }}>{item.title}</div>
                      {item.year && (
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--sap-text-secondary)",
                          }}
                        >
                          {item.year}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          background: `${getCategoryInfo(item.category).color}20`,
                          color: getCategoryInfo(item.category).color,
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "600",
                        }}
                      >
                        {getCategoryInfo(item.category).icon} {item.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`sap-badge ${item.status === "completed"
                          ? "success"
                          : item.status === "in_progress"
                            ? "info"
                            : item.status === "dropped"
                              ? "error"
                              : item.status === "on_hold"
                                ? "warning"
                                : ""
                          }`}
                        style={{ fontSize: "10px" }}
                      >
                        {getStatusInfo(item.status).label}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "2px 6px",
                          background: getPriorityInfo(item.priority).color,
                          color: "white",
                          borderRadius: "8px",
                          fontSize: "10px",
                        }}
                      >
                        {item.priority?.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {item.rating ? (
                        <span style={{ color: "#ffc107" }}>
                          ⭐ {item.rating}/10
                        </span>
                      ) : (
                        <span style={{ color: "var(--sap-text-placeholder)" }}>
                          -
                        </span>
                      )}
                    </td>
                    {currentTransaction === "WS02" && (
                      <td>
                        <span style={{ marginLeft: "8px", width: "4rem", display: "inline-block" }}>
                          <SapButton
                            onClick={() => DeleteInSearchModal(item.id)}
                            type="danger"
                          >
                            🗑️
                          </SapButton>
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {searchResults.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "var(--sap-content-bg)",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span
              style={{ fontSize: "12px", color: "var(--sap-text-secondary)" }}
            >
              {searchResults.length} item(s) found
            </span>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
              <span>
                ✅ Completed:{" "}
                <strong>
                  {searchResults.filter((i) => i.status === "completed").length}
                </strong>
              </span>
              <span>
                ▶️ In Progress:{" "}
                <strong>
                  {
                    searchResults.filter((i) => i.status === "in_progress")
                      .length
                  }
                </strong>
              </span>
              <span>
                📋 Planned:{" "}
                <strong>
                  {searchResults.filter((i) => i.status === "planned").length}
                </strong>
              </span>
            </div>
          </div>
        )}
      </SapModal>
    </div>
  );
};

export default EntertainmentWishlistScreen;

const generateMediaReport = (mediaItems) => {
  if (!mediaItems || mediaItems.length === 0) {
    alert("No media items to print!");
    return "";
  }

  // Calculate stats
  const totalItems = mediaItems.length;
  const categoryCount = [...new Set(mediaItems.map(item => item.category))].length;
  const watchedCount = mediaItems.filter(item => item.status === "completed").length;
  const plannedCount = mediaItems.filter(item => item.status === "planned").length;
  const watchingCount = mediaItems.filter(item => item.status === "watching").length;
  const totalDuration = mediaItems.reduce((sum, item) => {
    const duration = item.duration || "0h 0m";
    const match = duration.match(/(\d+)h?\s*(\d*)m?/);
    if (match) {
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      return sum + (hours * 60 + minutes);
    }
    return sum;
  }, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMinutes = totalDuration % 60;

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      completed: { bg: "#d1fae5", color: "#065f46" },
      watching: { bg: "#dbeafe", color: "#1e40af" },
      planned: { bg: "#fef3c7", color: "#92400e" },
      dropped: { bg: "#fee2e2", color: "#991b1b" },
      default: { bg: "#f3f4f6", color: "#374151" }
    };
    return colors[status] || colors.default;
  };

  // Priority badge
  const getPriorityBadge = (priority) => {
    const badges = {
      high: { bg: "#fee2e2", color: "#991b1b" },
      medium: { bg: "#fef3c7", color: "#92400e" },
      low: { bg: "#f3f4f6", color: "#374151" }
    };
    const style = badges[priority] || badges.low;
    return `<span class="priority-badge" style="background:${style.bg}; color:${style.color};">
      ${priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "—"}
    </span>`;
  };

  // Rating stars
  const getRatingStars = (rating) => {
    if (!rating) return "—";
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 === 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    //IoIosStar, IoIosStarHalf, IoIosStarOutline

    return `
    ${'<span style="color: gold;font-size: 1rem;">★</span>'.repeat(fullStars)}
    ${halfStar ? `
      <span style="
        background: linear-gradient(90deg, gold 50%, #ccc 50%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 1rem;
      ">★</span>
    ` : ''}
    ${'<span style="color: #ccc;font-size: 1rem;">★</span>'.repeat(emptyStars)}
  `;
  };

  // Category icon
  const getCategoryIcon = (category) => {
    const icons = {
      MO: "🎬",
      TV: "📺",
      AN: "🎌",
      GA: "🎮",
      BO: "📚",
      MU: "🎵",
      default: "🎬"
    };
    return icons[category] || icons.default;
  };

  // Media items HTML
  const mediaContent = mediaItems
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .map((item, index) => {
      const statusStyle = getStatusColor(item.status || "planned");
      const imageUrl = item.imageUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";

      return `
        <div class="media-card">
          <div class="media-poster">
            <img src="${imageUrl}" alt="${item.title || "Unknown Title"}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='" />
            <div class="rating-badge">${getRatingStars(item.rating)}</div>
          </div>
          
          <div class="media-info">
            <div class="media-header">
              <div class="title-section">
                <span class="category-icon">${getCategoryIcon(item.category)}</span>
                <h3 class="media-title">${item.title || "Untitled"}</h3>
              </div>
              <div class="media-badges">
                ${getPriorityBadge(item.priority)}
                <span class="status-badge" style="background:${statusStyle.bg}; color:${statusStyle.color};">
                  ${item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Planned"}
                </span>
              </div>
            </div>
            
            <div class="media-meta">
              <span class="meta-item"><strong>Year:</strong> ${item.year || "—"}</span>
              <span class="meta-item"><strong>Duration:</strong> ${item.duration || "—"}</span>
              <span class="meta-item"><strong>Platform:</strong> ${item.platform || "—"}</span>
            </div>
            
            ${item.genres && item.genres.length > 0 ? `
              <div class="genres">
                ${item.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join("")}
              </div>
            ` : ''}
            
            <div class="info-row">
              ${item.cast ? `<div class="info-item"><strong>Cast:</strong> ${item.cast}</div>` : ''}
              ${item.director ? `<div class="info-item"><strong>Director:</strong> ${item.director}</div>` : ''}
              ${item.studio ? `<div class="info-item"><strong>Studio:</strong> ${item.studio}</div>` : ''}
            </div>
            
            ${item.description ? `
              <div class="description">
                <p>${item.description}</p>
              </div>
            ` : ''}
            
            ${item.notes ? `
              <div class="notes">
                <strong>Notes:</strong>
                <p>${item.notes}</p>
              </div>
            ` : ''}
            
            <div class="media-footer">
              <span class="item-number">${item.itemNumber || `#${index + 1}`}</span>
              <span class="added-info">Added by ${item.createdBy || "Unknown"} on ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Media Collection</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            margin: 15mm;
            size: A4;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 25px;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.5;
          }

          /* Header */
          .report-header {
            text-align: center;
            padding-bottom: 25px;
            border-bottom: 3px solid #000000;
            margin-bottom: 30px;
          }

          .report-header h1 {
            font-size: 32px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 8px;
          }

          .report-header .subtitle {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
          }

          .report-header .generated {
            font-size: 11px;
            color: #888888;
            font-style: italic;
          }

          /* Stats Grid */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }

          .stat-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
          }

          .stat-card.main {
            background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
            color: white;
            border: none;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.8;
          }

          /* Section Title */
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #000000;
            margin: 30px 0 20px;
            padding-bottom: 8px;
            border-bottom: 2px solid #000000;
            display: inline-block;
          }

          /* Media Card - Horizontal Layout */
          .media-card {
            display: flex;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.06);
            page-break-inside: avoid;
            background: white;
          }

          /* Poster - Left Side */
          .media-poster {
            min-width: 120px;
            position: relative;
            flex-shrink: 0;
          }

          .media-poster img {
            width: 14rem;
            height: 100%;
            object-fit: cover;
          }

          .rating-badge {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.9));
            padding: 8px 6px 6px;
            color: #fbbf24;
            font-size: 12px;
            text-align: center;
            letter-spacing: 1px;
          }

          /* Media Info - Right Side */
          .media-info {
            flex: 1;
            padding: 16px;
            display: flex;
            flex-direction: column;
          }

          .media-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            gap: 10px;
          }

          .title-section {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
          }

          .category-icon {
            font-size: 20px;
          }

          .media-title {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1.3;
          }

          .media-badges {
            display: flex;
            gap: 6px;
            flex-shrink: 0;
          }

          .priority-badge, .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .media-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            flex-wrap: wrap;
          }

          .meta-item {
            font-size: 11px;
            color: #555555;
          }

          .meta-item strong {
            color: #000000;
          }

          .genres {
            margin-bottom: 10px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .genre-tag {
            background: #e9ecef;
            color: #495057;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: 500;
          }

          .info-row {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 8px;
          }

          .info-item {
            font-size: 11px;
            color: #555555;
          }

          .info-item strong {
            color: #000000;
          }

          .description {
            margin: 8px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #667eea;
          }

          .description p {
            font-size: 11px;
            line-height: 1.6;
            color: #444444;
          }

          .notes {
            margin: 8px 0;
            padding: 10px;
            background: #fff8dc;
            border-radius: 6px;
            border-left: 3px solid #ffc107;
          }

          .notes strong {
            font-size: 10px;
            color: #856404;
          }

          .notes p {
            font-size: 11px;
            font-style: italic;
            color: #665c00;
            margin-top: 4px;
          }

          .media-footer {
            margin-top: auto;
            padding-top: 10px;
            border-top: 1px dashed #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #888888;
          }

          .item-number {
            font-family: monospace;
            font-weight: 600;
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 4px;
          }

          /* Report Footer */
          .report-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000000;
            text-align: center;
            color: #666666;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>🎬 My Media Collection</h1>
          <p class="subtitle">Movies • TV Shows • Anime • Games • Books</p>
          <p class="generated">Generated on ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card main">
            <div class="stat-value">${totalItems}</div>
            <div class="stat-label">Total Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${watchedCount}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${watchingCount}</div>
            <div class="stat-label">Watching</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${plannedCount}</div>
            <div class="stat-label">Planned</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totalHours}h ${totalMinutes}m</div>
            <div class="stat-label">Watch Time</div>
          </div>
        </div>

        <h2 class="section-title">📋 Collection Details</h2>
        
        <div class="media-list">
          ${mediaContent}
        </div>

        <div class="report-footer">
          <p>SAP GUI Media Collection • ${totalItems} titles in your library</p>
          <p>Printed on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;

  return html;
};
