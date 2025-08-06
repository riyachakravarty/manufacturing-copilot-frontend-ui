import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [mode, setMode] = useState("click");
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!fileName) return alert("Please upload a file");
    navigate("/app", { state: { mode, fileName } });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Manufacturing Co‑Pilot</h1>
      <div>
        <label>
          <input type="radio" value="click" checked={mode === "click"} onChange={() => setMode("click")} />
          Click of a Button
        </label>
        <label style={{ marginLeft: "1.5rem" }}>
          <input type="radio" value="genai" checked={mode === "genai"} onChange={() => setMode("genai")} />
          Gen‑AI Led Prompt
        </label>
      </div>
      <br />
      <input type="file" onChange={(e) => e.target.files[0] && setFileName(e.target.files[0].name)} />
      <button onClick={handleNext} style={{ marginLeft: "1rem" }}>
        Continue
      </button>
    </div>
  );
}
