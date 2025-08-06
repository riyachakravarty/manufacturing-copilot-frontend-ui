<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState } from "react";
import DataVisualizationAndEngineering from "./DataVisualizationAndEngineering";
// import other components for future tabs as needed
>>>>>>> df3cb17b57275972a0c4d9ed734670efa6024a3d

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
<<<<<<< HEAD
    <div className="tabs-container" style={{ padding: '1.5rem' }}>
      {/* Tab Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab("dataViz")}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: activeTab === "dataViz" ? '2px solid black' : '1px solid gray',
            backgroundColor: activeTab === "dataViz" ? '#f0f0f0' : 'white',
            cursor: 'pointer'
=======
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
>>>>>>> df3cb17b57275972a0c4d9ed734670efa6024a3d
          }}
        >
          Data Visualization & Engineering
        </button>
        <button
          onClick={() => setActiveTab("eda")}
          style={{
<<<<<<< HEAD
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: activeTab === "eda" ? '2px solid black' : '1px solid gray',
            backgroundColor: activeTab === "eda" ? '#f0f0f0' : 'white',
            cursor: 'pointer'
=======
            marginRight: "8px",
            padding: "6px 12px",
            background: activeTab === "eda" ? "#007bff" : "#eee",
            color: activeTab === "eda" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
>>>>>>> df3cb17b57275972a0c4d9ed734670efa6024a3d
          }}
        >
          Exploratory Data Analysis
        </button>
        <button
          onClick={() => setActiveTab("featureEng")}
          style={{
<<<<<<< HEAD
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: activeTab === "featureEng" ? '2px solid black' : '1px solid gray',
            backgroundColor: activeTab === "featureEng" ? '#f0f0f0' : 'white',
            cursor: 'pointer'
=======
            marginRight: "8px",
            padding: "6px 12px",
            background: activeTab === "featureEng" ? "#007bff" : "#eee",
            color: activeTab === "featureEng" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
>>>>>>> df3cb17b57275972a0c4d9ed734670efa6024a3d
          }}
        >
          Feature Engineering
        </button>
        <button
          onClick={() => setActiveTab("mlDev")}
          style={{
<<<<<<< HEAD
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: activeTab === "mlDev" ? '2px solid black' : '1px solid gray',
            backgroundColor: activeTab === "mlDev" ? '#f0f0f0' : 'white',
            cursor: 'pointer'
=======
            padding: "6px 12px",
            background: activeTab === "mlDev" ? "#007bff" : "#eee",
            color: activeTab === "mlDev" ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
>>>>>>> df3cb17b57275972a0c4d9ed734670efa6024a3d
          }}
        >
          ML Model Development
        </button>
      </div>

      {/* Tab Content */}
<<<<<<< HEAD
      <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '5px' }}>
=======
      <div>
>>>>>>> df3cb17b57275972a0c4d9ed734670efa6024a3d
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Tabs;
