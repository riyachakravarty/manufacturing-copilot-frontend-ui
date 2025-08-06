import React from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "../components/Tabs";
import { useAppContext } from "../context/AppContext";

const MainAppPage = () => {
  const navigate = useNavigate();
  const { uploadedFileName, mode } = useAppContext();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manufacturing Co-Pilot</h1>
        <button
          onClick={handleBack}
          className="text-sm text-blue-600 border border-blue-600 px-4 py-1 rounded hover:bg-blue-50"
        >
          ⬅ Back
        </button>
      </div>

      {/* Optional: Show file name & mode */}
      {/* <p className="text-gray-500 mb-4">File: {uploadedFileName} | Mode: {mode}</p> */}

      <Tabs />
    </div>
  );
};

export default MainAppPage;
