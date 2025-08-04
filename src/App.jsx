// src/App.jsx
import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import ModeToggle from "./components/ModeToggle";
import Tabs from "./components/Tabs";

function App() {
  const [selectedMode, setSelectedMode] = useState("click");

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Manufacturing Co-Pilot</h2>
      <ModeToggle selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
      <FileUpload onUploadSuccess={() => console.log("Upload success callback")} />
      {selectedMode === "click" && <Tabs />}
      {selectedMode === "genai" && (
        <div>
          <h3>Gen-AI Prompt Interface</h3>
          <p>Coming soon: natural language input with backend integration</p>
        </div>
      )}
    </div>
  );
}

export default App;
