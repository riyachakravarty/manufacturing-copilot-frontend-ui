import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedMode, setSelectedMode] = useState("");
  const [contextFiles, setContextFiles] = useState([]); // NEW

  // Load uploaded file info from localStorage on first render
  useEffect(() => {
    const storedFile = localStorage.getItem("uploadedFile");
    const storedMode = localStorage.getItem("selectedMode"); 
    const storedContextFiles = localStorage.getItem("contextFiles"); 
    if (storedFile) {
      setUploadedFile(JSON.parse(storedFile));
    }
    if (storedMode) setSelectedMode(storedMode);
    if (storedContextFiles) {
      setContextFiles(JSON.parse(storedContextFiles));
    }
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

  // Persist context file metadata (NOT file objects)
  useEffect(() => {
    if (contextFiles.length > 0) {
      localStorage.setItem("contextFiles", JSON.stringify(contextFiles));
    } else {
      localStorage.removeItem("contextFiles");
    }
  }, [contextFiles]);


  return (
    <AppContext.Provider value={{ uploadedFile, setUploadedFile, selectedMode, setSelectedMode, contextFiles, setContextFiles}}>
      {children}
    </AppContext.Provider>
  );
};
