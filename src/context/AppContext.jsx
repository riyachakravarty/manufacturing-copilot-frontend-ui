import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedMode, setSelectedMode] = useState("");

  return (
    <AppContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
        selectedMode,
        setSelectedMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
