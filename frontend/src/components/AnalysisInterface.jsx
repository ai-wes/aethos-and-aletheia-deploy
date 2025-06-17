import React, { useState } from "react";
import { AnalysisProvider, useAnalysis } from "../contexts/AnalysisContext";
import CompassWheel from "./CompassWheel";
import OraclePanel from "./OraclePanel";
import ReasonGraph from "./ReasonGraph";
import ReasonChain from "./ReasonChain";
import VersionTimeline from "./VersionTimeline";
import LearningLoopControl from "./LearningLoopControl";
import FeedbackSheet, { QuickThumbsRating } from "./FeedbackSheet";
import { XIcon } from "lucide-react";

// Hook for using query analysis
export const useQueryAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAnalysis } = useAnalysis();

  const executeQuery = async (query, mode = "explore") => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, mode, use_cache: true })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Set the analysis data in context
      setAnalysis(data);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeQuery, isLoading, error };
};

// Main Analysis Interface Component
const AnalysisInterfaceContent = ({ agentId, onAgentEvolution }) => {
  const {
    analysisData,
    traceData,
    activeFramework,
    isDrawerOpen,
    setIsDrawerOpen,
    setTraceData
  } = useAnalysis();

  const [showFeedback, setShowFeedback] = useState(false);
  const [agentHistory, setAgentHistory] = useState([]);

  // Extract framework data from analysis
  const frameworks = analysisData?.structured_response?.frameworks || [];
  const structuredResponse = analysisData?.structured_response || {};

  const handleExpandContext = async () => {
    if (!analysisData?.trace_id) return;

    try {
      const response = await fetch(`/api/trace/${analysisData.trace_id}`);
      if (response.ok) {
        const data = await response.json();
        setTraceData(data);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch trace data:", error);
    }
  };

  const handleFeedbackSubmit = (feedbackData) => {
    console.log("Feedback submitted:", feedbackData);
    // Handle feedback submission result
    setShowFeedback(false);
  };

  const handleLearningCycleComplete = (result) => {
    console.log("Learning cycle completed:", result);
    if (onAgentEvolution) {
      onAgentEvolution(result);
    }
    // Refresh agent history if needed
  };

  const handleLearningCycleError = (error) => {
    console.error("Learning cycle error:", error);
    // Handle error (could show toast notification)
  };

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No analysis data available</p>
          <p className="text-sm">
            Submit a query to see the analysis interface
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Main Analysis View */}
      <div className="flex-1 flex">
        {/* Left Side - Compass and Controls */}
        <div className="w-80 p-6 space-y-6 border-r border-gray-700">
          {/* Moral Compass */}
          <CompassWheel frameworks={frameworks} />

          {/* Learning Loop Control */}
          <LearningLoopControl
            agentId={agentId}
            onCycleComplete={handleLearningCycleComplete}
            onError={handleLearningCycleError}
          />

          {/* Version Timeline */}
          <VersionTimeline agentId={agentId} history={agentHistory} />
        </div>

        {/* Center - Analysis Content */}
        <div className="flex-1 flex flex-col">
          {/* TL;DR Bar with Quick Rating */}
          {structuredResponse.tldr && (
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Summary</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {structuredResponse.tldr}
                  </p>
                </div>
                <div className="ml-4 flex items-center space-x-4">
                  <QuickThumbsRating
                    traceId={analysisData.trace_id}
                    onRating={(rating) => console.log("Quick rating:", rating)}
                  />
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Detailed Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reasoning Chain */}
          <div className="flex-1 overflow-y-auto">
            <ReasonChain
              analysisData={structuredResponse}
              onFeedback={(feedbackData) => {
                console.log("Reason chain feedback:", feedbackData);
                setShowFeedback(true);
              }}
            />
          </div>
        </div>

        {/* Right Side - Oracle Panel */}
        <OraclePanel
          frameworks={frameworks}
          structuredResponse={structuredResponse}
          onExpandContext={handleExpandContext}
        />
      </div>

      {/* Argument Flow Graph Drawer */}
      {isDrawerOpen && traceData && (
        <ReasonGraph
          traceData={traceData}
          onClose={() => setIsDrawerOpen(false)}
          sentenceMap={analysisData.sentence_map || {}}
        />
      )}

      {/* Feedback Sheet Modal */}
      <FeedbackSheet
        traceId={analysisData?.trace_id}
        isVisible={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
        isCached={analysisData?.is_cached || false}
      />
    </div>
  );
};

// Wrapped component with provider
const AnalysisInterface = ({ agentId, onAgentEvolution }) => {
  return (
    <AnalysisProvider>
      <AnalysisInterfaceContent
        agentId={agentId}
        onAgentEvolution={onAgentEvolution}
      />
    </AnalysisProvider>
  );
};

export default AnalysisInterface;
