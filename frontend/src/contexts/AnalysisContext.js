import React, { createContext, useContext, useState, useEffect } from "react";

const AnalysisContext = createContext();

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
};

export const AnalysisProvider = ({ children }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [traceData, setTraceData] = useState(null);
  const [activeFramework, setActiveFramework] = useState(null);
  const [sources, setSources] = useState(new Map());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Set analysis data and process it
  const setAnalysis = (data) => {
    setAnalysisData(data);

    // Process sources into a Map for O(1) lookup
    if (data.sources) {
      const sourcesMap = new Map();
      data.sources.forEach((source) => {
        sourcesMap.set(source.source_id, source);
      });
      setSources(sourcesMap);
    }

    // Set default active framework if frameworks exist
    if (data.structured_response?.frameworks?.length > 0) {
      setActiveFramework(data.structured_response.frameworks[0].framework);
    }
  };

  // Clear all analysis data
  const clearAnalysis = () => {
    setAnalysisData(null);
    setTraceData(null);
    setActiveFramework(null);
    setSources(new Map());
    setIsDrawerOpen(false);
    setFeedback(null);
  };

  const value = {
    analysisData,
    traceData,
    activeFramework,
    sources,
    isDrawerOpen,
    feedback,
    setAnalysis,
    setTraceData,
    setActiveFramework,
    setIsDrawerOpen,
    setFeedback,
    clearAnalysis
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};
