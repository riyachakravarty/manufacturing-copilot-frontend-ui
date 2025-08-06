import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [mode, setMode] = useState("");

  return (
    <AppContext.Provider
      value={{ uploadedFileName, setUploadedFileName, mode, setMode }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
