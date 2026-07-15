// src/components/Screens/Notes/NotesScreen.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import SapButton from "../../Common/SapButton";
import SapInput from "../../Common/SapInput";
import SapTabs from "../../Common/SapTabs";
import { useTransaction } from "../../../context/TransactionContext";
import { useAuth } from "../../../context/AuthContext";
import { useAction } from "../../../context/ActionContext";
import { useConfirm } from "../../../context/ConfirmContext";
import { useSettings } from "../../../context/SettingsContext";
import { getTableData, getAllData, saveAllData } from "../../../utils/storage";
import { parseMarkdown } from "../../Common/MarkdownPreview";

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

import SapModal from "../../Common/SapModal";
import Autocomplete from "../../Common/Autocomplete";

import "./NotesStyles.css";

const NotesScreen = ({ mode = "create" }) => {
  const { settings } = useSettings();

  const isMobile = window.innerWidth <= 768;

  const {
    updateStatus,
    markAsChanged,
    markAsSaved,
    goBack,
    transactionHistory,
    setTransactionHistory,
    registerBackHandler,
    clearBackHandler,
  } = useTransaction();
  const { user } = useAuth();
  const { registerAction, clearAction } = useAction();

  const { confirm } = useConfirm();
  const { prompt } = useConfirm();

  const saveRef = useRef(null);
  const clearRef = useRef(null);
  const deleteRef = useRef(null);
  const editorRef = useRef(null);
  const printRef = useRef(null);

  // Form data
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    createdBy: user?.username || "SAPUSER",
  });

  // State
  const [noteId, setNoteId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [summary, setSummary] = useState("");
  const [tableTheme, setTableTheme] = useState(formData.tableTheme);
  const [activeSearch, setActiveSearch] = useState("");

  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
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

  const [errors, setErrors] = useState({});

  // Handle Table Theme Change
  const handleTableThemeChange = (theme) => {
    handleChange("tableTheme", theme);
  };

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

  const selectSuggestion = (note) => {
    setNoteId(note.noteNumber);
    setFormData(note);
    setIsLoaded(true);

    updateStatus(`Note ${note.noteNumber} loaded`, "success");
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
      case "arrow":
        insertAtCursor("\n- ", "", "List item");
        break;
      case "quote":
        insertAtCursor("\n> ", "\n", "Quote text");
        break;
      case "code":
        insertAtCursor("\n@code\n", "\n@/code\n", "code here");
      case "codeinline":
        insertAtCursor("\n@codeinline ", " @/codeinline\n", "Inline Code here");
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
  const insertTable = (tableMarkdown) => {
    // Directly insert the string generated by the Modal
    insertAtCursor(tableMarkdown, "", "");
    setShowTableModal(false);
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
  const handleSearch = (filter = filterCategory) => {
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

    if (filter !== "all") {
      notes = notes.filter((n) => n.category === filter);
    }

    if (filterStatus !== "all") {
      notes = notes.filter((n) => n.status === filterStatus);
    }

    // ✅ Sort: Pinned notes first
    notes = notes.sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });

    setSearchResults(notes);
    setShowSearchModal(true);
  };

  // Select note from search
  const handleSelectNote = async (note) => {
    if (note.isLocked) {
      const enteredPassword = await prompt(
        "This note is locked. Enter password:",
        { type: "warning", placeholder: "Enter Password..." },
      );

      // Replace this with your real password validation logic
      if (enteredPassword !== note.password) {
        updateStatus("Incorrect password", "error");
        return;
      }
    }

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

    if (!formData.summary?.trim()) {
      newErrors.summary = "Summary is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Summary
  const handleSummaryChange = (value) => {
    setFormData((prev) => ({ ...prev, summary: value }));

    // Validation
    if (!value || value.trim().length < 10) {
      setErrors((prev) => ({
        ...prev,
        summary: "Summary must be at least 10 characters",
      }));
    } else if (value.length > 300) {
      setErrors((prev) => ({
        ...prev,
        summary: "Summary cannot exceed 300 characters",
      }));
    } else {
      setErrors((prev) => ({ ...prev, summary: "" }));
    }
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
  const deleteInSearchModal = async (noteNumber) => {
    if (!noteNumber) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this Note?",
      "danger",
    );
    if (confirmed) {
      const note = getTableData("notes");
      const filtered = note.filter((e) => e.noteNumber !== noteNumber);
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

  // Print Function
  printRef.current = () => {
    let notes = [];

    // If a collection is opened, print only that
    if (isLoaded && formData.noteNumber) {
      notes = [formData];
    } else {
      notes = getTableData("notes") || [];
    }

    if (!notes.length) {
      alert("No notes to print!");
      return;
    }

    // Summary table
    const tableRows = notes
      .map(
        (note, index) => `
        <tr>
          <td class="col-num">${note.noteNumber || index + 1}</td>
          <td class="col-cat">${note.category || "—"}</td>
          <td class="col-title">${note.title || "Untitled"}</td>
          <td class="col-date">${note.importedAt ? new Date(note.importedAt).toLocaleDateString() : new Date(note.createdAt).toLocaleDateString()}</td>
        </tr>
      `,
      )
      .join("");

    // Detailed content using your parseMarkdown function
    const detailedContent = notes
      .map(
        (note, index) => `
        <div class="detail-section">
          <div class="detail-header">
            <span class="detail-num">${note.noteNumber || index + 1}</span>
            <span class="detail-title">${note.title || "Untitled Note"}</span>
          </div>
          <div class="detail-meta">
            <span>Category: <strong>${note.category || "—"}</strong></span>
            <span>Date: <strong>${note.importedAt ? new Date(note.importedAt).toLocaleString() : new Date(note.createdAt).toLocaleString()}</strong></span>
          </div>
          <div class="detail-content">
            ${parseMarkdown(note.content, settings.codeTheme)}
          </div>
        </div>
      `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Notes Report</title>
          <style>
            body { font-family: 'JetBrains Mono','Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1a1a1a; line-height: 1.5; }
            h1 { font-size: 24px; }
            .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
            .summary-table th, .summary-table td { border: 1px solid #ddd; padding: 8px; }
            .summary-table tr:nth-child(even) { background: #fafafa; }
            .detail-section { margin-bottom: 24px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px; page-break-inside: avoid; }
            .detail-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
            .detail-num { background: #000; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; font-family: monospace; }
            .detail-title { font-size: 16px; font-weight: 600; }
            .detail-meta { display: flex; gap: 24px; font-size: 11px; color: #666; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed #e0e0e0; }
            .detail-meta strong { color: #333; }
            .detail-content { font-size: 13px; color: #444; line-height: 1.7; }
            code { font-family: monospace; background: #000000; color: #f472b6; padding: 2px 4px; border-radius: 4px; }
            pre code { display: block; padding: 12px; background: #000000; color: #f472b6; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
            img { max-width: 100%; border-radius: 4px; }
            a { color: #1a73e8; text-decoration: none; }
            @media print { body { padding: 0; } .detail-section { break-inside: avoid; } }

            .save-container {
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 9999;
            }

            #saveHtmlBtn {

              background:#111827;
              color:white;

              border:3px solid #000;
              border-radius:10px;

              padding:12px 20px;

              font-family:'JetBrains Mono',monospace;
              font-weight:bold;

              cursor:pointer;

              box-shadow:
                4px 4px 0 #555;

              transition:.2s;
            }

            #saveHtmlBtn:hover {

              transform:translate(-2px,-2px);

              box-shadow:
                6px 6px 0 #000;
            }
          </style>
        </head>
        <body>
          <h1>📑 Notes Report</h1>
          <h2>📊 Summary</h2>
          <table class="summary-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Title</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <h2>📝 Detailed Content</h2>
          ${detailedContent}
        </body>
      </html>
    `;

    const previewHtml = html.replace(
      "</body>",
      `
      <div class="save-container">
        <button id="saveHtmlBtn">
          💾 Save HTML Report
        </button>
      </div>

      <script>
        document
          .getElementById("saveHtmlBtn")
          .onclick = function(){

            const blob = new Blob(
              [document.documentElement.outerHTML],
              {
                type:"text/html;charset=utf-8"
              }
            );

            const url = URL.createObjectURL(blob);

            const a=document.createElement("a");
            a.href=url;
            a.download="${notes[0]?.title || "Notes"}_Report.html";

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);

            URL.revokeObjectURL(url);
          }
      </script>

      </body>`,
    );

    const printWindow = window.open("", "_blank", "width=900,height=700");

    printWindow.document.write(previewHtml);

    printWindow.document.close();

    printWindow.focus();
    // setTimeout(() => printWindow.print(), 250);
  };

  // Register a custom back handler that closes the editor first
  useEffect(() => {
    if (isLoaded) {
      registerBackHandler(() => {
        // Close the editor instead of leaving the transaction
        setIsLoaded(false);
        setNoteId("");
        setShowPreview(false);
        markAsSaved();

        // Pop the NOTE_ entry from history
        setTransactionHistory((prev) => {
          const newHistory = [...prev];
          if (
            newHistory.length > 0 &&
            newHistory[newHistory.length - 1]?.startsWith("NOTE_")
          ) {
            newHistory.pop();
          }
          return newHistory;
        });

        updateStatus("Close the Opened Note", "info");
        return true; // Signal that we handled the back — don't do default back
      });
    } else {
      // When not loaded (on the search/ID entry screen), clear the custom handler
      // so default back behavior (go to HOME) works normally
      clearBackHandler();
    }

    return () => {
      clearBackHandler();
    };
  }, [
    isLoaded,
    registerBackHandler,
    clearBackHandler,
    setTransactionHistory,
    markAsSaved,
    updateStatus,
    user?.username,
  ]);

  // Register actions
  useEffect(() => {
    registerAction("SAVE", () => saveRef.current?.());
    registerAction("CLEAR", () => clearRef.current?.());
    registerAction("DELETE", () => deleteRef.current?.());
    registerAction("PRINT", () => printRef.current?.());

    return () => {
      clearAction("SAVE");
      clearAction("CLEAR");
      clearAction("DELETE");
      clearAction("PRINT");
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
          summary={summary}
          onSummaryChange={handleSummaryChange}
          codeTheme={settings.codeTheme}
          tableTheme={formData.tableTheme}
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
          errors={errors}
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
                <div style={{ width: isMobile ? "100%" : "330px" }}>
                  <Autocomplete
                    label="Note ID / Search"
                    value={noteId}
                    onChange={setNoteId}
                    placeholder="NT100000001"
                    icon="🔍"
                    data={getTableData("notes") || []}
                    searchFields={["noteNumber", "title", "summary", "content"]}
                    onSelect={(note) => {
                      setNoteId(note.noteNumber);
                      selectSuggestion(note);
                    }}
                    getSuggestionValue={(note) => note.noteNumber}
                    renderSuggestion={(note) => (
                      <>
                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#2563eb",
                          }}
                        >
                          {note.noteNumber}
                        </div>

                        <div>{note.title || "Untitled"}</div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#777",
                          }}
                        >
                          {note.summary}
                        </div>
                      </>
                    )}
                  />
                </div>
                <SapButton onClick={loadNote} type="neo" icon="📂">
                  Load
                </SapButton>
                <SapButton
                  type="search"
                  onClick={() => {
                    // setSearchResults(getTableData("notes") || []);
                    handleSearch();
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
                        handleSearch(cat.value);
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
        deleteInSearchModal={deleteInSearchModal}
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
        onThemeChange={handleTableThemeChange}
        selectedTheme={formData.tableTheme}
      />

      <SapModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="🔍 Search Entertainment Wishlist"
        width="900px"
        footer={
          <SapButton type="close" onClick={() => setShowPrintModal(false)}>
            Close
          </SapButton>
        }
      >
        <div style={{ padding: "20px" }}>
          <h2>Print Note</h2>
          <p>
            This feature is coming soon! In the meantime, you can copy the
            content and paste it into your preferred text editor for printing.
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(formData.content)}
          >
            Copy Content
          </button>
        </div>
      </SapModal>
    </div>
  );
};

export default NotesScreen;
