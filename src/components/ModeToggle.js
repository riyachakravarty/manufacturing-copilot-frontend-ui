import React from "react";

const ModeToggle = ({ selectedMode, setSelectedMode }) => {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ marginRight: "1rem" }}>
        <input
          type="radio"
          value="click"
          checked={selectedMode === "click"}
          onChange={() => setSelectedMode("click")}
        />
        Click of a Button
      </label>
      <label>
        <input
          type="radio"
          value="genai"
          checked={selectedMode === "genai"}
          onChange={() => setSelectedMode("genai")}
        />
        Gen-AI Led Prompt
      </label>
    </div>
  );
};

export default ModeToggle;
