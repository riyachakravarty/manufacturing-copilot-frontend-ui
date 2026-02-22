import React, { createContext, useState } from "react";

export const PlotContext = createContext();

export const PlotProvider = ({ children }) => {
  const [lastPlot, setLastPlot] = useState(null);
  const [lastAnalysisType, setLastAnalysisType] = useState(null);

  return (
    <PlotContext.Provider
      value={{
        lastPlot,
        setLastPlot,
        lastAnalysisType,
        setLastAnalysisType,
      }}
    >
      {children}
    </PlotContext.Provider>
  );
};
