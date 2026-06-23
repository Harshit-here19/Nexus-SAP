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

export const CollectionScreen = ({
  mode = "create",
}) => {
  const { registerAction, clearAction } =
    useAction();

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

    const collections =
      getTableData("collections") || [];

    const search =
      value.toLowerCase().trim();

    const regex = new RegExp(
      search
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*"),
      "i"
    );

    const results = collections.filter(
      (collection) => {
        const fields = [
          collection.collectionNumber,
          collection.title,
          collection.description,
          collection.tags,
        ];

        return fields.some((field) => {
          if (!field) return false;

          const text =
            String(field).toLowerCase();

          return search.includes("*")
            ? regex.test(text)
            : text.includes(search);
        });
      }
    );

    setSuggestions(results.slice(0, 10));
    setShowSuggestions(results.length > 0);
  };

  const selectSuggestion = (collection) => {

    setCollectionId(
      collection.collectionNumber
    );

    setFormData(collection);

    setIsLoaded(true);


    setTransactionHistory((prev) => [
      ...prev,
      `COLLECTION_${collection.collectionNumber}`
    ]);


    setSuggestions([]);
    setShowSuggestions(false);

    updateStatus(
      `${collection.collectionNumber} loaded`,
      "success"
    );
  };

  const handleSearch = () => {
    let collections =
      getTableData("collections") || [];

    if (searchTerm) {
      const term =
        searchTerm.toLowerCase();

      collections =
        collections.filter(
          (collection) =>
            collection.collectionNumber
              ?.toLowerCase()
              .includes(term) ||
            collection.name
              ?.toLowerCase()
              .includes(term) ||
            collection.description
              ?.toLowerCase()
              .includes(term)
        );
    }

    setSearchResults(collections);

    setShowSearchModal(true);
  };

  const handleSelectCollection = (collection) => {

    setCollectionId(
      collection.collectionNumber
    );

    setFormData(collection);

    setIsLoaded(true);

    setShowSearchModal(false);

    setTransactionHistory((prev) => [
      ...prev,
      `COLLECTION_${collection.collectionNumber}`
    ]);

    updateStatus(
      `${collection.collectionNumber} loaded`,
      "success"
    );

  };

  /*
   * LOAD COLLECTION
   */

  const loadCollection = () => {
    const collections =
      getTableData("collections") || [];

    const collection =
      collections.find(
        (c) =>
          c.collectionNumber ===
          collectionId.trim()
      );

    if (!collection) {
      updateStatus(
        "Collection not found",
        "error"
      );
      return;
    }

    setFormData(collection);
    setIsLoaded(true);

    setTransactionHistory((prev) => [
      ...prev,
      `COLLECTION_${collection.collectionNumber}`
    ]);

    updateStatus(
      `Collection ${collection.collectionNumber} loaded`,
      "success"
    );
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
      const collectionNumber =
        generateNextNumber(
          "collections",
          "collectionNumber",
          "LC"
        );

      const newCollection = {
        ...formData,
        id: Date.now(),
        collectionNumber,
        createdAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString(),
      };

      allData.collections.push(
        newCollection
      );

      saveAllData(allData);

      handleChange(
        "collectionNumber",
        collectionNumber
      );

      updateStatus(
        `${collectionNumber} created`,
        "success"
      );
    } else {
      const index =
        allData.collections.findIndex(
          (c) => c.id === formData.id
        );

      if (index !== -1) {
        allData.collections[index] = {
          ...formData,
          updatedAt:
            new Date().toISOString(),
        };

        saveAllData(allData);

        updateStatus(
          `${formData.collectionNumber} updated`,
          "success"
        );
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
      allData.collections =
        allData.collections.filter(
          (c) => c.id !== formData.id
        );

      saveAllData(allData);

      clearRef.current();

      updateStatus(
        "Collection deleted",
        "success"
      );
    }
  };

  /*
   * ACTIONS
   */

  useEffect(() => {
    registerAction(
      "SAVE",
      () => saveRef.current?.()
    );

    registerAction(
      "CLEAR",
      () => clearRef.current?.()
    );

    registerAction(
      "DELETE",
      () => deleteRef.current?.()
    );

    return () => {
      clearAction("SAVE");
      clearAction("CLEAR");
      clearAction("DELETE");
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
            newHistory[newHistory.length - 1]
              ?.startsWith("COLLECTION_")
          ) {
            newHistory.pop();
          }

          return newHistory;
        });

        updateStatus(
          "Close the Opened Collection",
          "info"
        );

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

  const needsLoad =
    (mode === "change" ||
      mode === "display") &&
    !isLoaded;

  const tabs = [
    {
      label: "Collection",
      icon: "📚",
      content: (
        <CollectionEditor
          formData={formData}
          onChange={handleChange}
          isReadOnly={
            mode === "display"
          }
        />
      ),
    },
  ];

  return (
    <div className="sap-panel">

      <div className="sap-panel-header">

        <span>
          📚 Collection Manager
        </span>

        <div>

          <span
            className={`sap-badge ${mode === "create"
              ? "info"
              : mode === "change"
                ? "warning"
                : "success"
              }`}
          >
            {mode === "create"
              ? "NEW"
              : mode === "change"
                ? "EDIT"
                : "VIEW"}
          </span>

        </div>

      </div>

      <div className="sap-panel-content">

        {needsLoad ? (

          <div
            className="collection-load-box"
          >

            <div
              style={{
                position: "relative",
                width: "330px",
                overflow: "visible"
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

              {showSuggestions &&
                suggestions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      marginTop: "4px",
                      background: "#fff",
                      border:
                        "1px solid #ddd",
                      borderRadius: "8px",
                      zIndex: 9999,
                      maxHeight: "300px",
                      overflowY: "auto",
                      boxShadow:
                        "0 8px 20px rgba(0,0,0,.15)"
                    }}
                  >
                    {suggestions.map(
                      (collection) => (
                        <div
                          key={collection.id}
                          onClick={() =>
                            selectSuggestion(
                              collection
                            )
                          }
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderBottom:
                              "1px solid #eee"
                          }}
                        >
                          <div
                            style={{
                              fontWeight:
                                "bold",
                              color:
                                "#2563eb"
                            }}
                          >
                            {
                              collection.collectionNumber
                            }
                          </div>

                          <div>
                            {collection.title ||
                              "Unnamed Collection"}
                          </div>

                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#777"
                            }}
                          >
                            {
                              collection.description
                            }
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>

            <SapButton
              type="primary"
              onClick={loadCollection}
            >
              Load
            </SapButton>

            <SapButton
              type="search"
              icon="🔎"
              onClick={handleSearch}
            >
              Search
            </SapButton>

          </div>

        ) : (

          <>
            {formData.collectionNumber && (
              <div
                className="collection-info"
              >
                Collection:
                <strong>
                  {" "}
                  {
                    formData.collectionNumber
                  }
                </strong>
              </div>
            )}

            <SapTabs tabs={tabs} />
          </>

        )}

      </div>

      {/* ADD MODAL HERE */}
      <CollectionSearchModal
        isOpen={showSearchModal}

        onClose={() =>
          setShowSearchModal(false)
        }

        searchTerm={searchTerm}

        onSearchTermChange={
          setSearchTerm
        }

        searchResults={
          searchResults
        }

        onSearch={
          handleSearch
        }

        onSelectCollection={
          handleSelectCollection
        }
      />


    </div>
  );
};