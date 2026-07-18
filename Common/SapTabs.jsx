// src/components/Common/SapTabs.jsx
import React, { useState } from 'react';

const SapTabs = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="sap-tabs">
      <div className="sap-tabs-header">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`sap-tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.icon && <span className="sap-tab-icon">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="sap-tab-content">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default SapTabs;