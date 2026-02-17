// src/components/Screens/Notes/NotesScreen.jsx

import { useState, useEffect, useRef } from "react";
import SapButton from "../../Common/SapButton";
import SapInput from "../../Common/SapInput";
import SapTabs from "../../Common/SapTabs";
import { useTransaction } from "../../../context/TransactionContext";
import { useAuth } from "../../../context/AuthContext";
import { useAction } from "../../../context/ActionContext";
import { useConfirm } from "../../../context/ConfirmContext";
import { getTableData, getAllData, saveAllData } from "../../../utils/storage";

// Components
import NotesEditor from "./NotesEditor";
import NotesProperties from "./NotesProperties";
import NotesHistory from "./NotesHistory";
import NotesSearchModal from "./NotesSearchModal";
import NotesLinkModal from "./NotesLinkModal";
import NotesImageModal from "./NotesImageModal";
import NotesTableModal from "./NotesTableModal";

// Utils & Constants
import {
  NOTE_CATEGORIES,
  INITIAL_FORM_DATA,
  DEMO_NOTE_CONTENT,
} from "./NotesConstants";
import {
  generateNextId,
  getCategoryInfo,
  getModeTitle,
  getModeIcon,
  calculateCounts,
} from "./NotesUtils";

import { generateNextNumber } from "../../../utils/storage";

import "./NotesStyles.css";

const NotesScreen = ({ mode = "create" }) => {
  const { updateStatus, markAsChanged, markAsSaved, goBack } = useTransaction();
  const { user } = useAuth();
  const { registerAction, clearAction } = useAction();
  const confirm = useConfirm();

  const saveRef = useRef(null);
  const clearRef = useRef(null);
  const deleteRef = useRef(null);
  const editorRef = useRef(null);

  // State
  const [noteId, setNoteId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

  // Search
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal inputs
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Form data
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    createdBy: user?.username || "SAPUSER",
  });
  const [errors, setErrors] = useState({});

  // Handle form field change
  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "content") {
        const counts = calculateCounts(value);
        updated.wordCount = counts.wordCount;
        updated.charCount = counts.charCount;
      }

      return updated;
    });
    markAsChanged();
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Insert text at cursor position
  const insertAtCursor = (before, after = "", placeholder = "") => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end) || placeholder;
    const newText =
      formData.content.substring(0, start) +
      before +
      selectedText +
      after +
      formData.content.substring(end);

    handleChange("content", newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition =
        start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Handle formatting
  const handleFormat = (action) => {
    switch (action) {
      case "bold":
        insertAtCursor("**", "**", "bold text");
        break;
      case "italic":
        insertAtCursor("*", "*", "italic text");
        break;
      case "underline":
        insertAtCursor("__", "__", "underlined text");
        break;
      case "strikethrough":
        insertAtCursor("~~", "~~", "strikethrough text");
        break;
      case "h1":
        insertAtCursor("\n# ", "\n", "Heading 1");
        break;
      case "h2":
        insertAtCursor("\n## ", "\n", "Heading 2");
        break;
      case "h3":
        insertAtCursor("\n### ", "\n", "Heading 3");
        break;
      case "bullet":
        insertAtCursor("\n• ", "", "List item");
        break;
      case "number":
        insertAtCursor("\n1. ", "", "List item");
        break;
      case "checklist":
        insertAtCursor("\n☐ ", "", "Task item");
        break;
      case "checkdone":
        insertAtCursor("\n☑ ", "", "Completed task");
        break;
      case "quote":
        insertAtCursor("\n> ", "\n", "Quote text");
        break;
      case "code":
        insertAtCursor("\n```\n", "\n```\n", "code here");
        break;
      case "hr":
        insertAtCursor("\n\n---\n\n", "", "");
        break;
      case "link":
        setShowLinkModal(true);
        break;
      case "image":
        setShowImageModal(true);
        break;
      case "table":
        setShowTableModal(true);
        break;
      default:
        break;
    }
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl) {
      const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`;
      insertAtCursor(linkMarkdown, "", "");
      setShowLinkModal(false);
      setLinkUrl("");
      setLinkText("");
    }
  };

  // Insert image
  const insertImage = () => {
    if (imageUrl) {
      const imageMarkdown = `![${imageAlt || "Image"}](${imageUrl})`;
      insertAtCursor("\n" + imageMarkdown + "\n", "", "");
      setShowImageModal(false);
      setImageUrl("");
      setImageAlt("");
    }
  };

  // Insert table
  const insertTable = () => {
    let table = "\n";

    table += "|";
    for (let i = 0; i < tableCols; i++) {
      table += ` Header ${i + 1} |`;
    }
    table += "\n|";
    for (let i = 0; i < tableCols; i++) {
      table += "----------|";
    }
    table += "\n";

    for (let r = 0; r < tableRows - 1; r++) {
      table += "|";
      for (let c = 0; c < tableCols; c++) {
        table += ` Cell ${r + 1}-${c + 1} |`;
      }
      table += "\n";
    }

    insertAtCursor(table, "", "");
    setShowTableModal(false);
    setTableRows(3);
    setTableCols(3);
  };

  // Load note
  const loadNote = () => {
    if (!noteId.trim()) {
      updateStatus("Enter a note ID", "warning");
      return;
    }

    const data = getTableData("notes") || [];
    const note = data.find((n) => n.noteNumber === noteId.trim());

    if (note) {
      setFormData(note);
      setIsLoaded(true);
      updateStatus(`Note ${noteId} loaded successfully`, "success");
    } else {
      updateStatus(`Note ${noteId} not found`, "error");
    }
  };

  // Search notes
  const handleSearch = () => {
    let notes = getTableData("notes") || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.noteNumber?.toLowerCase().includes(term) ||
          n.title?.toLowerCase().includes(term) ||
          n.content?.toLowerCase().includes(term) ||
          n.tags?.toLowerCase().includes(term),
      );
    }

    if (filterCategory !== "all") {
      notes = notes.filter((n) => n.category === filterCategory);
    }

    if (filterStatus !== "all") {
      notes = notes.filter((n) => n.status === filterStatus);
    }

    notes = notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    setSearchResults(notes);
    setShowSearchModal(true);
  };

  // Select note from search
  const handleSelectNote = (note) => {
    setNoteId(note.noteNumber);
    setFormData(note);
    setIsLoaded(true);
    setShowSearchModal(false);
    updateStatus(`Note ${note.noteNumber} selected`, "success");
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save note
  saveRef.current = () => {
    if (!validateForm()) {
      updateStatus("Please fill in all required fields", "error");
      return;
    }

    try {
      const allData = getAllData();
      if (!allData.notes) allData.notes = [];

      if (mode === "create") {
        // const noteNumber = formData.noteNumber || generateNextId();
        const noteNumber = generateNextNumber("notes", "noteNumber", "NT");
        const newNote = {
          ...formData,
          id: Date.now(),
          noteNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        allData.notes.push(newNote);
        saveAllData(allData);
        setFormData((prev) => ({ ...prev, noteNumber, id: newNote.id }));
        markAsSaved();
        clearRef.current?.();
        updateStatus(`Note ${noteNumber} created successfully`, "success");
      } else if (mode === "change") {
        const index = allData.notes.findIndex((n) => n.id === formData.id);
        if (index !== -1) {
          allData.notes[index] = {
            ...formData,
            updatedAt: new Date().toISOString(),
          };
          saveAllData(allData);
          markAsSaved();
          updateStatus(
            `Note ${formData.noteNumber} updated successfully`,
            "success",
          );
        }
      }
    } catch (error) {
      updateStatus(`Error saving note: ${error.message}`, "error");
    }
  };

  // Clear form
  clearRef.current = () => {
    setFormData({
      ...INITIAL_FORM_DATA,
      createdBy: user?.username || "SAPUSER",
    });
    setNoteId("");
    setIsLoaded(false);
    setErrors({});
    setShowPreview(false);
    markAsSaved();
    updateStatus("Form cleared", "info");
  };

  // Delete note
  deleteRef.current = async () => {
    if (!formData.id) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this note?",
      "danger",
    );
    if (confirmed) {
      const allData = getAllData();
      allData.notes = (allData.notes || []).filter((n) => n.id !== formData.id);
      saveAllData(allData);
      clearRef.current?.();
      goBack();
      updateStatus("Note deleted successfully", "success");
    }
  };

  //Delete in search modal
  const DeleteInSearchModal = async (id) => {
    if (!id) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this Note?",
      "danger",
    );
    if (confirmed) {
      const expenses = getTableData("notes");
      const filtered = expenses.filter((e) => e.id !== id);
      const allData = getAllData();
      allData.notes = filtered;
      saveAllData(allData);
      clearRef.current?.();
      updateStatus("Note deleted successfully", "success");
      setSearchResults(filtered);
    }
    markAsSaved();
  };

  // Load demo note
  const loadDemoNote = () => {
    const counts = calculateCounts(DEMO_NOTE_CONTENT);
    setFormData((prev) => ({
      ...prev,
      title: "📝 Feature Demo Note",
      content: DEMO_NOTE_CONTENT,
      category: "reference",
      status: "active",
      priority: "medium",
      tags: "demo, features, tutorial, help",
      isPinned: true,
      ...counts,
    }));
    updateStatus("Demo note loaded! Explore all the features.", "success");
  };

  // Register actions
  useEffect(() => {
    registerAction("SAVE", () => saveRef.current?.());
    registerAction("CLEAR", () => clearRef.current?.());
    registerAction("DELETE", () => deleteRef.current?.());

    return () => {
      clearAction("SAVE");
      clearAction("CLEAR");
      clearAction("DELETE");
    };
  }, [registerAction, clearAction]);

  const isReadOnly = mode === "display";
  const needsLoad = (mode === "change" || mode === "display") && !isLoaded;

  // Tabs
  const tabs = [
    {
      label: "Editor",
      icon: "✏️",
      content: (
        <NotesEditor
          ref={editorRef}
          formData={formData}
          errors={errors}
          isReadOnly={isReadOnly}
          showPreview={showPreview}
          onShowPreviewChange={setShowPreview}
          onTitleChange={(val) => handleChange("title", val)}
          onContentChange={(val) => handleChange("content", val)}
          onFormat={handleFormat}
          loadDemoNote={loadDemoNote}
          mode={mode}
        />
      ),
    },
    {
      label: "Properties",
      icon: "⚙️",
      content: (
        <NotesProperties
          formData={formData}
          isReadOnly={isReadOnly}
          onChange={handleChange}
        />
      ),
    },
    ...(formData.id
      ? [
          {
            label: "History",
            icon: "🕐",
            content: <NotesHistory formData={formData} />,
          },
        ]
      : []),
  ];

  

  return (
    <div>
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">{getModeIcon(mode)}</span>
            {getModeTitle(mode)} - NT0
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
            {formData.isPinned && (
              <span className="sap-badge error" style={{ marginLeft: "8px" }}>
                📌 Pinned
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
                  Enter a note ID to load or search for existing notes.
                </span>
              </div>

              <div
                className="sap-form-row"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <SapInput
                  label="Note ID"
                  value={noteId}
                  onChange={setNoteId}
                  placeholder="e.g., NT000000001"
                  icon="🔍"
                  onIconClick={() => {
                    setSearchResults(getTableData("notes") || []);
                    setShowSearchModal(true);
                  }}
                />
                <SapButton onClick={loadNote} type="primary" icon="📂">
                  Load
                </SapButton>
                <SapButton
                  onClick={() => {
                    setSearchResults(getTableData("notes") || []);
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
                  {NOTE_CATEGORIES.map((cat) => (
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

      {/* Modals */}
      <NotesSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterCategory={filterCategory}
        onFilterCategoryChange={setFilterCategory}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        searchResults={searchResults}
        onSearch={handleSearch}
        onSelectNote={handleSelectNote}
        DeleteInSearchModal={DeleteInSearchModal}
      />

      <NotesLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        linkUrl={linkUrl}
        onLinkUrlChange={setLinkUrl}
        linkText={linkText}
        onLinkTextChange={setLinkText}
        onInsert={insertLink}
      />

      <NotesImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={imageUrl}
        onImageUrlChange={setImageUrl}
        imageAlt={imageAlt}
        onImageAltChange={setImageAlt}
        onInsert={insertImage}
      />

      <NotesTableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        tableRows={tableRows}
        onTableRowsChange={setTableRows}
        tableCols={tableCols}
        onTableColsChange={setTableCols}
        onInsert={insertTable}
      />
    </div>
  );
};

export default NotesScreen;
