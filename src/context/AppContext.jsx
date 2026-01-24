import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedMode, setSelectedMode] = useState("");

  // Load uploaded file info from localStorage on first render
  useEffect(() => {
    const storedFile = localStorage.getItem("uploadedFile");
    const storedMode = localStorage.getItem("selectedMode");  
    if (storedFile) {
      setUploadedFile(JSON.parse(storedFile));
    }
    if (storedMode) setSelectedMode(storedMode);
  }, []);

  // Whenever uploadedFile changes, store it in localStorage
  useEffect(() => {
    if (uploadedFile) {
      localStorage.setItem("uploadedFile", JSON.stringify(uploadedFile));
    } else {
      localStorage.removeItem("uploadedFile");
    }
  }, [uploadedFile]);

  useEffect(() => {
    if (selectedMode) {
      localStorage.setItem("selectedMode", selectedMode);
    } else {
      localStorage.removeItem("selectedMode");
    }
  }, [selectedMode]);

  return (
    <AppContext.Provider value={{ uploadedFile, setUploadedFile, selectedMode, setSelectedMode }}>
      {children}
    </AppContext.Provider>
  );
};
