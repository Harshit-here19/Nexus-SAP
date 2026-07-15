import React from "react";
import SapModal from "../../Common/SapModal";
import SapButton from "../../Common/SapButton";
import { useTransaction } from "../../../context/TransactionContext";

const CollectionSearchModal = ({
  isOpen,
  onClose,
  searchTerm,
  onSearchTermChange,
  searchResults,
  onSearch,
  onSelectCollection,
  DeleteInSearchModal,
}) => {
  const {currentTransaction} = useTransaction();
  
  return (
    <SapModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onSearch}
      title="🔍 Search Collections"
      width="800px"
      footer={
        <SapButton type="close" onClick={onClose}>
          Close
        </SapButton>
      }
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        <input
          className="sap-input"
          placeholder="Search collection..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          style={{
            flex: 1,
          }}
        />

        <SapButton type="primary" onClick={onSearch}>
          Search
        </SapButton>
      </div>

      {/* Result Table */}
      <div className="sap-table-scroller">
        <table className="sap-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              {currentTransaction === "LC02" && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {searchResults.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  📭 No collections found
                </td>
              </tr>
            ) : (
              searchResults.map((collection,index) => (
                <tr
                  key={index}
                  onDoubleClick={() => onSelectCollection(collection)}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <td>{collection.collectionNumber}</td>

                  <td>{collection.title || "Unnamed"}</td>

                  {currentTransaction === "LC02" && (
                    <td>
                      <span
                        style={{
                          marginLeft: "8px",
                          width: "4rem",
                          display: "inline-block",
                        }}
                      >
                        <SapButton
                          onClick={() => DeleteInSearchModal(collection.id)}
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

      {searchResults.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            color: "#666",
          }}
        >
          {searchResults.length} collection(s) found
        </div>
      )}
    </SapModal>
  );
};

export default CollectionSearchModal;
