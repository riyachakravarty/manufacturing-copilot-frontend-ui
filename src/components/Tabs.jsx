import React, { useState } from 'react';

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
          }}
        >
          Data Visualization & Engineering
        </button>
        <button
          onClick={() => setActiveTab("eda")}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: activeTab === "eda" ? '2px solid black' : '1px solid gray',
            backgroundColor: activeTab === "eda" ? '#f0f0f0' : 'white',
            cursor: 'pointer'
          }}
        >
          Exploratory Data Analysis
        </button>
        <button
          onClick={() => setActiveTab("featureEng")}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: activeTab === "featureEng" ? '2px solid black' : '1px solid gray',
            backgroundColor: activeTab === "featureEng" ? '#f0f0f0' : 'white',
            cursor: 'pointer'
          }}
        >
          Feature Engineering
        </button>
        <button
          onClick={() => setActiveTab("mlDev")}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            border: activeTab === "mlDev" ? '2px solid black' : '1px solid gray',
            backgroundColor: activeTab === "mlDev" ? '#f0f0f0' : 'white',
            cursor: 'pointer'
          }}
        >
          ML Model Development
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '5px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Tabs;
