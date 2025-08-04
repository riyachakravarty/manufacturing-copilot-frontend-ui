import React, { useState } from "react";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const renderTabContent = () => {
    switch (activeTab) {
      case "tab1":
        return <div>Data Visualization and Engineering Content</div>;
      case "tab2":
        return <div>Exploratory Data Analysis Content</div>;
      case "tab3":
        return <div>Feature Engineering Content</div>;
      case "tab4":
        return <div>ML Model Development Content</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setActiveTab("tab1")}>Data Visualization and Engineering</button>
        <button onClick={() => setActiveTab("tab2")}>Exploratory Data Analysis</button>
        <button onClick={() => setActiveTab("tab3")}>Feature Engineering</button>
        <button onClick={() => setActiveTab("tab4")}>ML Model Development</button>
      </div>
      <div style={{ padding: "1rem", border: "1px solid #ccc" }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Tabs;
