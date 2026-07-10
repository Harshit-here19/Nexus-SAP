import { useEffect, useRef, useState } from "react";
import { useAction } from "../../../context/ActionContext";
import { useTransaction } from "../../../context/TransactionContext";
import { useConfirm } from "../../../context/ConfirmContext";

import SapButton from "../../Common/SapButton";
import SapInput from "../../Common/SapInput";
import SapTabs from "../../Common/SapTabs";

import CollectionEditor from "./CollectionEditor";
import CollectionSearchModal from "./CollectionSearchModal";

import {
  getAllData,
  saveAllData,
  getTableData,
  generateNextNumber,
} from "../../../utils/storage";

import { INITIAL_COLLECTION } from "./CollectionConstants";

import "./CollectionStyles.css";

export const CollectionScreen = ({ mode = "create" }) => {
  const { registerAction, clearAction } = useAction();

  const {
    updateStatus,
    registerBackHandler,
    clearBackHandler,
    markAsSaved,
    setTransactionHistory,
  } = useTransaction();

  const [collectionId, setCollectionId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState(INITIAL_COLLECTION);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const saveRef = useRef();
  const clearRef = useRef();
  const deleteRef = useRef();
  const printRef = useRef();

  const { confirm } = useConfirm();
  const { prompt } = useConfirm();

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
    Handle Suggestion
  */

  const handleAutoSearch = (value) => {
    setCollectionId(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const collections = getTableData("collections") || [];

    const search = value.toLowerCase().trim();

    const regex = new RegExp(
      search.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*"),
      "i",
    );

    const results = collections.filter((collection) => {
      const fields = [
        collection.collectionNumber,
        collection.title,
        collection.description,
        collection.tags,
      ];

      return fields.some((field) => {
        if (!field) return false;

        const text = String(field).toLowerCase();

        return search.includes("*") ? regex.test(text) : text.includes(search);
      });
    });

    setSuggestions(results.slice(0, 10));
    setShowSuggestions(results.length > 0);
  };

  const selectSuggestion = (collection) => {
    setCollectionId(collection.collectionNumber);

    setFormData(collection);

    setIsLoaded(true);

    setTransactionHistory((prev) => [
      ...prev,
      `COLLECTION_${collection.collectionNumber}`,
    ]);

    setSuggestions([]);
    setShowSuggestions(false);

    updateStatus(`${collection.collectionNumber} loaded`, "success");
  };

  const handleSearch = () => {
    let collections = getTableData("collections") || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      collections = collections.filter(
        (collection) =>
          collection.collectionNumber?.toLowerCase().includes(term) ||
          collection.name?.toLowerCase().includes(term) ||
          collection.description?.toLowerCase().includes(term),
      );
    }

    setSearchResults(collections);

    setShowSearchModal(true);
  };

  const handleSelectCollection = (collection) => {
    setCollectionId(collection.collectionNumber);

    setFormData(collection);

    setIsLoaded(true);

    setShowSearchModal(false);

    setTransactionHistory((prev) => [
      ...prev,
      `COLLECTION_${collection.collectionNumber}`,
    ]);

    updateStatus(`${collection.collectionNumber} loaded`, "success");
  };

  /*
   * LOAD COLLECTION
   */

  const loadCollection = () => {
    const collections = getTableData("collections") || [];

    const collection = collections.find(
      (c) => c.collectionNumber === collectionId.trim(),
    );

    if (!collection) {
      updateStatus("Collection not found", "error");
      return;
    }

    setFormData(collection);
    setIsLoaded(true);

    setTransactionHistory((prev) => [
      ...prev,
      `COLLECTION_${collection.collectionNumber}`,
    ]);

    updateStatus(`Collection ${collection.collectionNumber} loaded`, "success");
  };

  /*
   * SAVE
   */

  saveRef.current = () => {
    const allData = getAllData();

    if (!allData.collections) {
      allData.collections = [];
    }

    if (mode === "create") {
      const collectionNumber = generateNextNumber(
        "collections",
        "collectionNumber",
        "LC",
      );

      const newCollection = {
        ...formData,
        id: Date.now(),
        collectionNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      allData.collections.push(newCollection);

      saveAllData(allData);

      updateStatus(`${collectionNumber} created`, "success");

      // Reset form after successful save
      setFormData(INITIAL_COLLECTION);

      setCollectionId("");

      setIsLoaded(false);
    } else {
      const index = allData.collections.findIndex((c) => c.id === formData.id);

      if (index !== -1) {
        allData.collections[index] = {
          ...formData,
          updatedAt: new Date().toISOString(),
        };

        saveAllData(allData);

        updateStatus(`${formData.collectionNumber} updated`, "success");
      }
    }
  };

  /*
   * CLEAR
   */

  clearRef.current = () => {
    setFormData(INITIAL_COLLECTION);
    setCollectionId("");
    setIsLoaded(false);
  };

  /*
   * DELETE
   */

  deleteRef.current = async () => {
    const allData = getAllData();

    const confirmed = await confirm(
      "Are you sure you want to delete this note?",
      "danger",
    );

    if (confirmed) {
      allData.collections = allData.collections.filter(
        (c) => c.id !== formData.id,
      );

      saveAllData(allData);

      clearRef.current();

      updateStatus("Collection deleted", "success");
    }
  };

  /*
   * PRINT
   */

  printRef.current = () => {
    let collections = [];

    // If a collection is opened, print only that
    if (isLoaded && formData.collectionNumber) {
      collections = [formData];
    } else {
      collections = getTableData("collections") || [];
    }

    if (!collections.length) {
      alert("No collections to print!");
      return;
    }

    const tableRows = collections
      .map(
        (item, index) => `
      <tr>
        <td class="col-num">${index + 1}</td>
        <td class="col-name">${item.title || "Unnamed Item"}</td>
        <td class="col-date">
          ${
            item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"
          }
        </td>
      </tr>
    `,
      )
      .join("");

    const detailedContent = collections
      .map(
        (item, index) => `
      <div class="detail-section">

        <div class="detail-header">

          <span class="detail-num">
            ${index + 1}
          </span>

          <span class="detail-title">
            ${item.title || "Untitled Item"}
          </span>

        </div>

        <div class="detail-meta">
          <span>
            ID:
            <strong>${item.collectionNumber}</strong>
          </span>

          <span>
            Created:
            <strong>
            ${
              item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "Unknown"
            }
            </strong>
          </span>

        </div>

        <div class="detail-content">

          ${
            item.items
              ? item.items
                  .map(
                    (row, rowNo) => `
                <div class="collectionRow">
                  <span class="rowNo">${rowNo + 1}</span>
                  <span class="rowName">${row.name}</span>
                </div>
              `,
                  )
                  .join("")
              : "No content"
          }
        </div>

      </div>
    `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>

      <html>
      <head>
      <title>Collection Report</title>

      <style>
      body {
        font-family:'JetBrains Mono','Segoe UI',sans-serif;
        padding:30px;
        color:#111827;
        line-height:1.6;
      }

      h1 {
        font-size:26px;
      }

      .summary-table {
        width:100%;
        border-collapse:collapse;
        margin-bottom:30px;
        font-size:13px;
      }

      .summary-table th,
      .summary-table td {
        border:2px solid #111827;
        padding:10px;
      }

      .summary-table th {
        background:#111827;
        color:white;
      }

      .summary-table tr:nth-child(even){
        background:#f3f4f6;
      }

      .detail-section {
        margin-bottom:24px;
        padding:18px;
        border:3px solid #111827;
        border-radius:12px;
        background:
        repeating-linear-gradient(
          0deg,
          #ffffff,
          #ffffff 4px,
          #f4f4f5 4px,
          #f4f4f5 8px
        );

        box-shadow:5px 5px 0 #111827;
        page-break-inside:avoid;
      }

      .detail-header {
        display:flex;
        align-items:center;
        gap:12px;
        margin-bottom:12px;
      }

      .detail-num {
        background:#000;
        color:white;
        padding:4px 10px;
        border-radius:4px;
        font-size:12px;
      }

      .detail-title {
        font-size:18px;
        font-weight:bold;
        flex:1;
      }

      .pin-badge {
        background:#ffd43b;
        border:2px solid #111827;
        padding:4px 8px;
        border-radius:6px;
        font-size:12px;
      }

      .detail-meta {
        font-size:12px;
        color:#555;
        border-bottom:1px dashed #aaa;
        padding-bottom:10px;
        margin-bottom:12px;
        display:flex;
        gap:20px;
      }

      .detail-content {
        font-size:15px;
        // white-space:pre-wrap;
      }

      .collectionRow {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 10px 14px;
      border-bottom: 1px solid #d1d5db;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      transition: background 0.2s ease;
      margin : 1rem 0;
    }

    .collectionRow:last-child {
      border-bottom: none;
    }

    .rowNo {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #111827;
      color: white;
      border-radius: 6px;
      font-weight: bold;
      box-shadow: 2px 2px 0 #374151;
    }

    .rowName {
      flex: 1;
      color: #1f2937;
      font-weight: 600;
      word-break: break-word;
    }

    .collectionRow:nth-child(even) {
      background: #f9fafb;
    }

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

      @media print {

        body {
          padding:0;
        }
        .detail-section {
          break-inside:avoid;
        }

      }
      </style>
      </head>
      <body>

      <h1>📚 Collection Report</h1>

      <h2>📊 Summary</h2>

      <table class="summary-table">
      <thead>
      <tr>
        <th>No</th>
        <th>Item</th>
        <th>Date</th>
      </tr>

      </thead>
      <tbody>
      ${tableRows}
      </tbody>
      </table>
      <h2>📝 Collection Items</h2>
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
            a.download="${collections[0]?.title || "Collection"}_Report.html";

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

    // printWindow.print();

    // // Save as HTML file
    // const blob = new Blob([html], {
    //   type: "text/html;charset=utf-8",
    // });

    // const url = URL.createObjectURL(blob);

    // const link = document.createElement("a");
    // link.href = url;
    // link.download = `${collections[0]?.title || "Collection"}_Report.html`;

    // document.body.appendChild(link);
    // link.click();

    // document.body.removeChild(link);

    // URL.revokeObjectURL(url);
  };

  /*
   * ACTIONS
   */

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
  }, []);

  // Back handler: close opened collection and return to search/load screen
  useEffect(() => {
    if (isLoaded) {
      registerBackHandler(() => {
        // Close opened collection
        setIsLoaded(false);
        setCollectionId("");

        markAsSaved();

        // Remove collection history entry if exists
        setTransactionHistory((prev) => {
          const newHistory = [...prev];

          if (
            newHistory.length > 0 &&
            newHistory[newHistory.length - 1]?.startsWith("COLLECTION_")
          ) {
            newHistory.pop();
          }

          return newHistory;
        });

        updateStatus("Close the Opened Collection", "info");

        return true; // stop default back
      });
    } else {
      // on search/load screen allow normal back
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
  ]);

  /*
   * LOAD SCREEN
   */

  const needsLoad = (mode === "change" || mode === "display") && !isLoaded;

  const tabs = [
    {
      label: "Collection",
      icon: "📚",
      content: (
        <CollectionEditor
          formData={formData}
          onChange={handleChange}
          isReadOnly={mode === "display"}
        />
      ),
    },
  ];

  return (
    <div className="sap-panel">
      <div className="sap-panel-header">
        <span>📚 Collection Manager</span>

        <div>
          <span
            className={`sap-badge ${
              mode === "create"
                ? "info"
                : mode === "change"
                  ? "warning"
                  : "success"
            }`}
          >
            {mode === "create" ? "NEW" : mode === "change" ? "EDIT" : "VIEW"}
          </span>
        </div>
      </div>

      <div className="sap-panel-content">
        {needsLoad ? (
          <div className="collection-load-box">
            <div
              style={{
                position: "relative",
                width: "330px",
                overflow: "visible",
              }}
            >
              <SapInput
                label="Collec. ID / Search"
                value={collectionId}
                onChange={handleAutoSearch}
                placeholder="LC100000001"
                icon="🔍"
                onIconClick={handleSearch}
              />

              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    marginTop: "4px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    zIndex: 9999,
                    maxHeight: "300px",
                    overflowY: "auto",
                    boxShadow: "0 8px 20px rgba(0,0,0,.15)",
                  }}
                >
                  {suggestions.map((collection) => (
                    <div
                      key={collection.id}
                      onClick={() => selectSuggestion(collection)}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#2563eb",
                        }}
                      >
                        {collection.collectionNumber}
                      </div>

                      <div>{collection.title || "Unnamed Collection"}</div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#777",
                        }}
                      >
                        {collection.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <SapButton type="neo" onClick={loadCollection}>
              Load
            </SapButton>

            <SapButton type="search" icon="🔎" onClick={handleSearch}>
              Search
            </SapButton>
          </div>
        ) : (
          <>
            {formData.collectionNumber && (
              <div className="collection-info">
                Collection:
                <strong> {formData.collectionNumber}</strong>
              </div>
            )}

            <SapTabs tabs={tabs} />
          </>
        )}
      </div>

      {/* ADD MODAL HERE */}
      <CollectionSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchResults={searchResults}
        onSearch={handleSearch}
        onSelectCollection={handleSelectCollection}
      />
    </div>
  );
};
