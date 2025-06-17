import React, { useState, useMemo } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { ChevronRightIcon, QuoteIcon } from "lucide-react";

const FRAMEWORK_COLORS = {
  Utilitarian: "#1e7ded",
  Deontological: "#7c3aed",
  "Virtue Ethics": "#059669",
  "Buddhist Ethics": "#dc2626",
  "Stoic Ethics": "#6b7280",
  "Care Ethics": "#ec4899",
  "Natural Law": "#f59e0b",
  "Confucian Ethics": "#3b82f6"
};

const OraclePanel = ({
  frameworks = [],
  structuredResponse = {},
  onExpandContext
}) => {
  const { activeFramework, setActiveFramework, sources, setIsDrawerOpen } =
    useAnalysis();
  const [openedTabs, setOpenedTabs] = useState(new Set());

  const activeData = useMemo(() => {
    if (!activeFramework || !structuredResponse.perspectives) return null;

    return structuredResponse.perspectives.find(
      (p) => p.framework === activeFramework
    );
  }, [activeFramework, structuredResponse.perspectives]);

  const handleTabClick = (framework) => {
    setActiveFramework(framework);
    setOpenedTabs((prev) => new Set([...prev, framework]));
  };

  const getTopQuotation = (perspective) => {
    if (!perspective?.supporting_passage_ids?.[0]) return null;

    const sourceId = perspective.supporting_passage_ids[0];
    return sources.get(sourceId);
  };

  const getFrameworkAlignment = (framework) => {
    // This would come from structured_response.framework_alignment_pct
    // For now, calculate from weight
    const fw = frameworks.find((f) => f.framework === framework);
    return fw ? Math.round(fw.weight * 100) : 0;
  };

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-1">Wisdom Oracle</h2>
        <p className="text-sm text-gray-400">
          Multi-framework ethical analysis
        </p>
      </div>

      {/* Tab Strip */}
      <div className="flex-shrink-0 p-2 border-b border-gray-700">
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {frameworks.map((fw) => (
            <button
              key={fw.framework}
              onClick={() => handleTabClick(fw.framework)}
              className={`w-full text-left p-2 rounded-md text-sm transition-all ${
                activeFramework === fw.framework
                  ? "bg-gray-800 text-white border-l-2"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              } ${
                !openedTabs.has(fw.framework) &&
                activeFramework !== fw.framework
                  ? "relative before:absolute before:right-2 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-cyan-400 before:rounded-full before:animate-pulse"
                  : ""
              }`}
              style={{
                borderLeftColor:
                  activeFramework === fw.framework
                    ? FRAMEWORK_COLORS[fw.framework]
                    : "transparent"
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{fw.framework}</span>
                <span className="text-xs opacity-75">
                  {Math.round(fw.weight * 100)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Framework Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeData ? (
          <>
            {/* Framework Alignment Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Framework Alignment</span>
                <span className="text-white font-medium">
                  {getFrameworkAlignment(activeFramework)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                  style={{
                    width: `${getFrameworkAlignment(activeFramework)}%`
                  }}
                />
              </div>
            </div>

            {/* Top Quotation */}
            {(() => {
              const topQuote = getTopQuotation(activeData);
              return topQuote ? (
                <div
                  className="bg-gray-800 rounded-lg p-4 border-l-4"
                  style={{ borderLeftColor: FRAMEWORK_COLORS[activeFramework] }}
                >
                  <div className="flex items-start space-x-3">
                    <QuoteIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-200 leading-relaxed italic">
                        "{topQuote.excerpt || topQuote.content}"
                      </p>
                      <div className="text-xs text-gray-400">
                        <span className="font-medium">{topQuote.author}</span>
                        {topQuote.source && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{topQuote.source}</span>
                          </>
                        )}
                        {topQuote.era && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{topQuote.era}</span>
                          </>
                        )}
                        <div className="mt-1">
                          <span className="inline-block bg-gray-700 px-2 py-1 rounded text-xs">
                            Relevance:{" "}
                            {(topQuote.relevance_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Key Insights */}
            {activeData.key_points && activeData.key_points.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">
                  Key Insights
                </h4>
                <ul className="space-y-2 list-disc list-inside text-sm text-gray-300">
                  {activeData.key_points.slice(0, 3).map((point, index) => (
                    <li key={index} className="leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Core Thesis */}
            {activeData.core_thesis && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">
                  Core Position
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {activeData.core_thesis}
                </p>
              </div>
            )}

            {/* Expand Context Link */}
            <button
              onClick={() => {
                setIsDrawerOpen(true);
                if (onExpandContext) onExpandContext();
              }}
              className="w-full mt-6 flex items-center justify-center space-x-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors text-sm text-cyan-400 hover:text-cyan-300"
            >
              <span>Explore Argument Flow</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Select a framework to view analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OraclePanel;
