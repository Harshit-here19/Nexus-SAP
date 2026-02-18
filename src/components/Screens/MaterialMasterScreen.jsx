// src/components/Screens/MaterialMasterScreen.jsx
import { useState, useEffect, useRef } from "react";
import SapInput from "../Common/SapInput";
import SapSelect from "../Common/SapSelect";
import SapButton from "../Common/SapButton";
import SapTabs from "../Common/SapTabs";
import SapModal from "../Common/SapModal";
import { useTransaction } from "../../context/TransactionContext";
import { useAction } from "../../context/ActionContext";
import { useConfirm } from "../../context/ConfirmContext";

import {
  getTableData,
  addRecord,
  updateRecord,
  findRecord,
  generateNextNumber,
  getAllData,
  saveAllData,
} from "../../utils/storage";

const MaterialMasterScreen = ({ mode = "create" }) => {
  const isMobile = window.innerWidth <= 768;
  
  const { updateStatus, markAsChanged, markAsSaved, goBack, currentTransaction } = useTransaction();
  const { registerAction, clearAction } = useAction();

  const confirm = useConfirm();

  const saveRef = useRef(null);
  const clearRef = useRef(null);
  const deleteRef = useRef(null);

  const [materialNumber, setMaterialNumber] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    materialNumber: "",
    description: "",
    materialType: "",
    materialGroup: "",
    baseUnit: "",
    purchasingGroup: "",
    plannedDeliveryTime: "",
    salesOrg: "",
    distributionChannel: "",
    division: "",
    salesPrice: "",
    currency: "INR",
    plant: "",
    storageLocation: "",
    mrpType: "",
    reorderPoint: "",
    safetyStock: "",
    lotSize: "",
    valuationClass: "",
    standardPrice: "",
    movingAveragePrice: "",
    priceControl: "S",
  });

  const [errors, setErrors] = useState({});
  const [masterData, setMasterData] = useState({
    materialTypes: [],
    materialGroups: [],
    baseUnits: [],
    plants: [],
    storageLocations: [],
  });

  useEffect(() => {
    setMasterData({
      materialTypes: getTableData("materialTypes"),
      materialGroups: getTableData("materialGroups"),
      baseUnits: getTableData("baseUnits"),
      plants: getTableData("plants"),
      storageLocations: getTableData("storageLocations"),
    });
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    markAsChanged();
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const loadMaterial = () => {
    if (!materialNumber.trim()) {
      updateStatus("Enter a material number", "warning");
      return;
    }

    const material = findRecord(
      "materials",
      "materialNumber",
      materialNumber.trim(),
    );
    if (material) {
      setFormData(material);
      setIsLoaded(true);
      updateStatus(`Material ${materialNumber} loaded successfully`, "success");
    } else {
      updateStatus(`Material ${materialNumber} not found`, "error");
    }
  };

  const handleSearch = () => {
    const materials = getTableData("materials");
    const results = materials.filter(
      (m) =>
        m.materialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setSearchResults(results);
    setShowSearchModal(true);
  };

  const handleSelectMaterial = (material) => {
    setMaterialNumber(material.materialNumber);
    setFormData(material);
    setIsLoaded(true);
    setShowSearchModal(false);
    updateStatus(`Material ${material.materialNumber} selected`, "success");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.materialType) {
      newErrors.materialType = "Material Type is required";
    }
    if (!formData.baseUnit) {
      newErrors.baseUnit = "Base Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  saveRef.current = () => {
    if (!validateForm()) {
      updateStatus("Please fill in all required fields", "error");
      return;
    }

    try {
      if (mode === "create") {
        const matNumber = generateNextNumber("materials", "materialNumber", "");
        addRecord("materials", {
          ...formData,
          materialNumber: matNumber,
        });
        setFormData((prev) => ({ ...prev, materialNumber: matNumber }));
        markAsSaved();
        goBack(false);
        updateStatus(`Material ${matNumber} created successfully`, "success");
      } else if (mode === "change") {
        updateRecord("materials", formData.id, formData);
        markAsSaved();
        updateStatus(
          `Material ${formData.materialNumber} updated successfully`,
          "success",
        );
      }
    } catch (error) {
      updateStatus("Error saving material: " + error.message, "error");
    }
  };

  clearRef.current = () => {
    setFormData({
      materialNumber: "",
      description: "",
      materialType: "",
      materialGroup: "",
      baseUnit: "",
      purchasingGroup: "",
      plannedDeliveryTime: "",
      salesOrg: "",
      distributionChannel: "",
      division: "",
      salesPrice: "",
      currency: "USD",
      plant: "",
      storageLocation: "",
      mrpType: "",
      reorderPoint: "",
      safetyStock: "",
      lotSize: "",
      valuationClass: "",
      standardPrice: "",
      movingAveragePrice: "",
      priceControl: "S",
    });
    setMaterialNumber("");
    setIsLoaded(false);
    setErrors({});
    markAsSaved();
    updateStatus("Form cleared", "info");
  };

  // Delete Material
  deleteRef.current = async () => {
    if (!formData.id) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this Material?",
      "danger",
    );
    if (confirmed) {
      const Materials = getTableData("materials");
      const filtered = Materials.filter((e) => e.id !== formData.id);
      const allData = getAllData();
      allData.materials = filtered;
      saveAllData(allData);
      clearRef.current?.();
      goBack();
      updateStatus("Material deleted successfully", "success");
    }
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

    return () => {
      clearAction("SAVE");
      clearAction("CLEAR");
      clearAction("DELETE");
    };
  }, []);

  const isReadOnly = mode === "display";
  const needsLoad = (mode === "change" || mode === "display") && !isLoaded;

  const basicDataTab = (
    <div className="sap-form">
      <SapInput
        label="Material Number"
        value={formData.materialNumber}
        readOnly={true}
        placeholder="Auto-generated"
      />
      <SapInput
        label="Description"
        value={formData.description}
        onChange={(val) => handleChange("description", val)}
        required={true}
        disabled={isReadOnly}
        error={errors.description}
      />
      <SapSelect
        label="Material Type"
        value={formData.materialType}
        onChange={(val) => handleChange("materialType", val)}
        options={masterData.materialTypes}
        required={true}
        disabled={isReadOnly}
      />
      <SapSelect
        label="Material Group"
        value={formData.materialGroup}
        onChange={(val) => handleChange("materialGroup", val)}
        options={masterData.materialGroups}
        disabled={isReadOnly}
      />
      <SapSelect
        label="Base Unit of Measure"
        value={formData.baseUnit}
        onChange={(val) => handleChange("baseUnit", val)}
        options={masterData.baseUnits}
        required={true}
        disabled={isReadOnly}
      />
    </div>
  );

  const purchasingTab = (
    <div className="sap-form">
      <SapInput
        label="Purchasing Group"
        value={formData.purchasingGroup}
        onChange={(val) => handleChange("purchasingGroup", val)}
        disabled={isReadOnly}
      />
      <SapInput
        label="Planned Delivery Time"
        value={formData.plannedDeliveryTime}
        onChange={(val) => handleChange("plannedDeliveryTime", val)}
        type="number"
        placeholder="Days"
        disabled={isReadOnly}
      />
    </div>
  );

  const salesTab = (
    <div className="sap-form">
      <SapInput
        label="Sales Organization"
        value={formData.salesOrg}
        onChange={(val) => handleChange("salesOrg", val)}
        disabled={isReadOnly}
      />
      <SapInput
        label="Distribution Channel"
        value={formData.distributionChannel}
        onChange={(val) => handleChange("distributionChannel", val)}
        disabled={isReadOnly}
      />
      <SapInput
        label="Division"
        value={formData.division}
        onChange={(val) => handleChange("division", val)}
        disabled={isReadOnly}
      />

      <div
        style={{
          borderTop: "1px solid var(--sap-border)",
          margin: "20px 0",
          paddingTop: "20px",
        }}
      >
        <h4 style={{ marginBottom: "16px", color: "var(--sap-brand)" }}>
          💰 Pricing
        </h4>
      </div>

      <div className="sap-form-row" style={{ display: "flex", gap: "20px" }}>
        <SapInput
          label="Sales Price"
          value={formData.salesPrice}
          onChange={(val) => handleChange("salesPrice", val)}
          type="number"
          disabled={isReadOnly}
          width="150px"
        />
        <SapSelect
          label="Currency"
          value={formData.currency}
          onChange={(val) => handleChange("currency", val)}
          options={[
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
            { value: "INR", label: "INR" },
          ]}
          disabled={isReadOnly}
        />
      </div>
    </div>
  );

  const plantDataTab = (
    <div className="sap-form">
      <SapSelect
        label="Plant"
        value={formData.plant}
        onChange={(val) => handleChange("plant", val)}
        options={masterData.plants.map((p) => ({
          value: p.plantCode,
          label: `${p.plantCode} - ${p.plantName}`,
        }))}
        disabled={isReadOnly}
      />
      <SapSelect
        label="Storage Location"
        value={formData.storageLocation}
        onChange={(val) => handleChange("storageLocation", val)}
        options={masterData.storageLocations.map((s) => ({
          value: s.sloc,
          label: `${s.sloc} - ${s.name}`,
        }))}
        disabled={isReadOnly}
      />

      <div
        style={{
          borderTop: "1px solid var(--sap-border)",
          margin: "20px 0",
          paddingTop: "20px",
        }}
      >
        <h4 style={{ marginBottom: "16px", color: "var(--sap-brand)" }}>
          📊 MRP Data
        </h4>
      </div>

      <SapSelect
        label="MRP Type"
        value={formData.mrpType}
        onChange={(val) => handleChange("mrpType", val)}
        options={[
          { value: "PD", label: "PD - MRP" },
          { value: "VB", label: "VB - Manual Reorder Point" },
          { value: "ND", label: "ND - No Planning" },
        ]}
        disabled={isReadOnly}
      />
      <SapInput
        label="Reorder Point"
        value={formData.reorderPoint}
        onChange={(val) => handleChange("reorderPoint", val)}
        type="number"
        disabled={isReadOnly}
      />
      <SapInput
        label="Safety Stock"
        value={formData.safetyStock}
        onChange={(val) => handleChange("safetyStock", val)}
        type="number"
        disabled={isReadOnly}
      />
      <SapInput
        label="Lot Size"
        value={formData.lotSize}
        onChange={(val) => handleChange("lotSize", val)}
        type="number"
        disabled={isReadOnly}
      />
    </div>
  );

  const accountingTab = (
    <div className="sap-form">
      <SapInput
        label="Valuation Class"
        value={formData.valuationClass}
        onChange={(val) => handleChange("valuationClass", val)}
        disabled={isReadOnly}
      />
      <SapSelect
        label="Price Control"
        value={formData.priceControl}
        onChange={(val) => handleChange("priceControl", val)}
        options={[
          { value: "S", label: "S - Standard Price" },
          { value: "V", label: "V - Moving Average Price" },
        ]}
        disabled={isReadOnly}
      />
      <SapInput
        label="Standard Price"
        value={formData.standardPrice}
        onChange={(val) => handleChange("standardPrice", val)}
        type="number"
        disabled={isReadOnly}
      />
      <SapInput
        label="Moving Average Price"
        value={formData.movingAveragePrice}
        onChange={(val) => handleChange("movingAveragePrice", val)}
        type="number"
        disabled={isReadOnly}
      />
    </div>
  );

  const tabs = [
    { label: "Basic Data", icon: "📋", content: basicDataTab },
    { label: "Purchasing", icon: "🛒", content: purchasingTab },
    { label: "Sales", icon: "💼", content: salesTab },
    { label: "Plant Data/MRP", icon: "🏭", content: plantDataTab },
    { label: "Accounting", icon: "💰", content: accountingTab },
  ];

  const getModeTitle = () => {
    switch (mode) {
      case "create":
        return "Create Material";
      case "change":
        return "Change Material";
      case "display":
        return "Display Material";
      default:
        return "Material Master";
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
        return "📦";
    }
  };

  const DeleteInSearchModal = async (id) => {
    if (!id) return;

    const confirmed = await confirm(
      "Are you sure you want to delete this Material?",
      "danger",
    );
    if (confirmed) {
      const Materials = getTableData("materials");
      const filtered = Materials.filter((e) => e.id !== id);
      const allData = getAllData();
      allData.materials = filtered;
      saveAllData(allData);
      clearRef.current?.();
      updateStatus("Material deleted successfully", "success");
      setSearchResults(filtered);
    }
    markAsSaved();
  };

  return (
    <div>
      <div className="sap-panel">
        <div className="sap-panel-header">
          <span>
            <span className="sap-panel-header-icon">{getModeIcon()}</span>
            {getModeTitle()} - MM0
            {mode === "create" ? "1" : mode === "change" ? "2" : "3"}
          </span>
          <div className="sap-panel-header-actions">
            <span
              className={`sap-badge ${mode === "create" ? "info" : mode === "change" ? "warning" : "success"}`}
            >
              {mode.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="sap-panel-content">
          {needsLoad ? (
            <div>
              <div
                className="sap-message-strip info"
                style={{ marginBottom: "20px" }}
              >
                <span className="sap-message-strip-icon">ℹ️</span>
                <span>
                  Enter a material number to load or search for existing
                  materials.
                </span>
              </div>

              <div
                className="sap-form-row"
                style={{ display: "flex", alignItems: isMobile ? "center" : "flex-end", gap: "12px" }}
              >
                <SapInput
                  label="Material Number"
                  value={materialNumber}
                  onChange={setMaterialNumber}
                  placeholder="Enter material number"
                  icon="🔍"
                  onIconClick={handleSearch}
                />
                <SapButton onClick={loadMaterial} type="primary" icon="📂">
                  Load
                </SapButton>
                <SapButton type="search" onClick={() => setShowSearchModal(true)} icon="🔎">
                  Search
                </SapButton>
              </div>
            </div>
          ) : (
            <>
              <SapTabs tabs={tabs} />
            </>
          )}
        </div>
      </div>

      <SapModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="🔍 Search Materials"
        width="700px"
        footer={
          <SapButton type="close" onClick={() => setShowSearchModal(false)}>Close</SapButton>
        }
      >
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            className="sap-input"
            placeholder="Search by material number or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const materials = getTableData("materials");
              const results = materials.filter(
                (m) =>
                  m.materialNumber
                    ?.toLowerCase()
                    .includes(e.target.value.toLowerCase()) ||
                  m.description
                    ?.toLowerCase()
                    .includes(e.target.value.toLowerCase()),
              );
              setSearchResults(results);
            }}
            style={{ width: "100%" }}
          />
        </div>

        <div className="sap-table-scroller">
          <table className="sap-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Description</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>
                    No materials found
                  </td>
                </tr>
              ) : (
                searchResults.map((material, index) => (
                  <tr key={index}>
                    <td>{material.materialNumber}</td>
                    <td>{material.description}</td>
                    <td>{material.materialType}</td>
                    <td>
                      <span style={{ marginRight: "8px",width: "4rem", display: "inline-block" }}>
                      <SapButton
                        onClick={() => handleSelectMaterial(material)}
                        type="primary"
                      >
                        👁️
                      </SapButton>
                      </span>
                      {currentTransaction === "MM02" && (<span style={{ marginLeft: "8px",width: "4rem", display: "inline-block" }}>
                        <SapButton
                        onClick={() => DeleteInSearchModal(material.id)}
                        type="danger"
                      >
                        🗑️
                      </SapButton>
                      </span>)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SapModal>
    </div>
  );
};

export default MaterialMasterScreen;
