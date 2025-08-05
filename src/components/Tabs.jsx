import React, { useState } from 'react';
import ModeToggle from './ModeToggle';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("dataViz");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dataViz":
        return <div>Data visualization and engineering content goes here.</div>;
      case "eda":
        return <div>Exploratory data analysis content goes here.</div>;
      case "featureEng":
        return <div>Feature engineering content goes here.</div>;
      case "mlDev":
        return <div>ML model development content goes here.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="tabs-container" style={{ padding: '1rem' }}>
      {/* Mode Toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <ModeToggle />
      </div>

      {/* Tab Buttons */}
      <div className="tab-buttons" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab("dataViz")}
          className={activeTab === "dataViz" ? "active" : ""}
        >
          Data visualization and engineering
        </button>
        <button
          onClick={() => setActiveTab("eda")}
          className={activeTab === "eda" ? "active" : ""}
        >
          Exploratory data analysis
        </button>
        <button
          onClick={() => setActiveTab("featureEng")}
          className={activeTab === "featureEng" ? "active" : ""}
        >
          Feature engineering
        </button>
        <button
          onClick={() => setActiveTab("mlDev")}
          className={activeTab === "mlDev" ? "active" : ""}
        >
          ML model development
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Tabs;
