import React, { useState } from "react";
import DataVisualizationAndEngineering from "./DataVisualizationAndEngineering";
// import other components for future tabs as needed

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("dataViz");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dataViz":
        return <DataVisualizationAndEngineering />;
      case "eda":
        return <div>Exploratory Data Analysis content (coming soon)</div>;
      case "featureEng":
        return <div>Feature Engineering content (coming soon)</div>;
      case "mlDev":
        return <div>ML Model Development content (coming soon)</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Buttons */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("dataViz")}
          style={{
            marginRight: "8px",
            padding: "6px 12px",
            background: activeTab === "dataViz" ? "#007bff" : "#eee",
            color: activeTab === "dataViz" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Data Visualization & Engineering
        </button>
        <button
          onClick={() => setActiveTab("eda")}
          style={{
            marginRight: "8px",
            padding: "6px 12px",
            background: activeTab === "eda" ? "#007bff" : "#eee",
            color: activeTab === "eda" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Exploratory Data Analysis
        </button>
        <button
          onClick={() => setActiveTab("featureEng")}
          style={{
            marginRight: "8px",
            padding: "6px 12px",
            background: activeTab === "featureEng" ? "#007bff" : "#eee",
            color: activeTab === "featureEng" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Feature Engineering
        </button>
        <button
          onClick={() => setActiveTab("mlDev")}
          style={{
            padding: "6px 12px",
            background: activeTab === "mlDev" ? "#007bff" : "#eee",
            color: activeTab === "mlDev" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
          }}
        >
          ML Model Development
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Tabs;
