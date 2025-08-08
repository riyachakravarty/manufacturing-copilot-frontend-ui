import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  // Load uploaded file info from localStorage on first render
  useEffect(() => {
    const storedFile = localStorage.getItem("uploadedFile");
    if (storedFile) {
      setUploadedFile(JSON.parse(storedFile));
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

  return (
    <AppContext.Provider value={{ uploadedFile, setUploadedFile }}>
      {children}
    </AppContext.Provider>
  );
};
