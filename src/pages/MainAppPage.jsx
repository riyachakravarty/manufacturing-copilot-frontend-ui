import React from "react";
import { useLocation } from "react-router-dom";
import Tabs from "../components/Tabs"; // or TabNavigation if renamed

export default function MainAppPage() {
  const loc = useLocation();
  const { mode, fileName } = loc.state || {};

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Manufacturing Co-Pilot</h2>
      <p><strong>Mode:</strong> {mode === "genai" ? "Gen‑AI Led Prompt" : "Click of a Button"}</p>
      <p><strong>File:</strong> {fileName}</p>
      <Tabs />
    </div>
  );
}
