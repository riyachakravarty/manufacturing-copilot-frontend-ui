import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [modeSelection, setModeSelection] = useState("");
  const navigate = useNavigate();
  const { setUploadedFileName, setMode } = useAppContext();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleModeChange = (e) => {
    setModeSelection(e.target.value);
  };

  const handleStart = async () => {
    if (!file || !modeSelection) {
      alert("Please upload a file and select a mode to continue.");
      return;
    }

    // Upload file to backend
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://manufacturing-copilot-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      // Store globally
      setUploadedFileName(file.name);
      setMode(modeSelection);

      // Navigate to main page
      navigate("/main");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold mb-4">Manufacturing Co-Pilot</h1>
      <p className="mb-6 text-gray-600">Upload your dataset and choose how you’d like to proceed.</p>

      <input type="file" onChange={handleFileChange} className="mb-4" />

      <div className="mb-6">
        <label className="mr-4">
          <input
            type="radio"
            name="mode"
            value="click"
            checked={modeSelection === "click"}
            onChange={handleModeChange}
            className="mr-2"
          />
          Click of a button
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="prompt"
            checked={modeSelection === "prompt"}
            onChange={handleModeChange}
            className="mr-2"
          />
          Gen-AI led prompt
        </label>
      </div>

      <button
        onClick={handleStart}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Start Exploring
      </button>
    </div>
  );
};

export default HomePage;
