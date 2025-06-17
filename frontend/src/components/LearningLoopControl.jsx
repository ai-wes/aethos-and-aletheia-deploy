import React, { useState } from "react";
import {
  PlayIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from "lucide-react";

const LearningLoopControl = ({ agentId, onCycleComplete, onError }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunSimulation = async () => {
    if (!agentId) {
      const errorMsg = "No agent selected";
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    try {
      setIsRunning(true);
      setError(null);
      setLastResult(null);

      // Make API call to start learning cycle
      const response = await fetch("/api/aletheia/start_cycle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ agent_id: agentId })
      });

      if (!response.ok) {
        if (response.status === 405) {
          throw new Error("Learning cycle endpoint not available");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      setLastResult({
        version: result.new_version || "Unknown",
        success: true,
        message: `Agent evolved to v${result.new_version || "X"}`
      });

      // Show success toast
      showToast(`v${result.new_version || "X"} created`, "success");

      if (onCycleComplete) {
        onCycleComplete(result);
      }
    } catch (err) {
      console.error("Learning cycle failed:", err);
      setError(err.message);
      setLastResult({
        success: false,
        message: err.message
      });

      if (onError) {
        onError(err.message);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const showToast = (message, type = "info") => {
    // Create a simple toast notification
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      type === "success"
        ? "bg-green-600"
        : type === "error"
        ? "bg-red-600"
        : "bg-blue-600"
    } text-white`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
      toast.style.opacity = "1";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      toast.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Learning Loop Control
        </h3>

        {lastResult && (
          <div className="flex items-center space-x-2">
            {lastResult.success ? (
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircleIcon className="w-5 h-5 text-red-400" />
            )}
            <span
              className={`text-sm ${
                lastResult.success ? "text-green-400" : "text-red-400"
              }`}
            >
              {lastResult.message}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">
              Run a complete learning cycle for the selected agent
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This will evaluate scenarios, gather feedback, and refine the
              constitution
            </p>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isRunning || !agentId}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isRunning || !agentId
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-cyan-500/25"
            }`}
          >
            {isRunning ? (
              <>
                <LoaderIcon className="w-4 h-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-600/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircleIcon className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Error</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
            {error.includes("405") && (
              <p className="text-red-200 text-xs mt-2">
                Make sure the backend server is running and the learning loop
                endpoint is available.
              </p>
            )}
          </div>
        )}

        {!agentId && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircleIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">
                No Agent Selected
              </span>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              Please select an agent from the sidebar to run a learning cycle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningLoopControl;
