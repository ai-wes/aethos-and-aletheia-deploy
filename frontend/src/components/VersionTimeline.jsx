import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import ReactDiffViewer from "react-diff-viewer";
import { ClockIcon, GitBranchIcon, TrendingUpIcon, XIcon } from "lucide-react";

const VersionTimeline = ({ agentId, history = [] }) => {
  const [selectedDiff, setSelectedDiff] = useState(null);

  // Process history data for chart
  const chartData = history.map((version, index) => ({
    version: `v${version.version || index + 1}`,
    score: version.score || Math.random() * 100, // Placeholder score
    timestamp: new Date(version.timestamp).getTime(),
    constitution: version.constitution_after_reflection
  }));

  const handleVersionClick = (version, index) => {
    if (index === 0) return; // Can't diff first version

    const previousVersion = history[index - 1];
    setSelectedDiff({
      old: previousVersion.constitution_after_reflection || "",
      new: version.constitution_after_reflection || "",
      oldTitle: `v${previousVersion.version || index} Constitution`,
      newTitle: `v${version.version || index + 1} Constitution`
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          Agent Evolution Timeline
        </h3>
        <p className="text-gray-400">
          Constitutional development and performance over time
        </p>
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">
            Performance Trajectory
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="version" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#06b6d4", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline Metro Stops */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">
          Version History
        </h4>

        <div className="space-y-4">
          {history.map((version, index) => (
            <div key={index} className="flex items-center space-x-4">
              {/* Metro Stop */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    index === history.length - 1
                      ? "bg-cyan-400 border-cyan-400"
                      : "bg-gray-600 border-gray-500"
                  }`}
                />
                {index < history.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-600 mt-1" />
                )}
              </div>

              {/* Version Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h5 className="text-white font-medium">
                      Version {version.version || index + 1}
                    </h5>
                    <span
                      className={`text-sm font-medium ${getScoreColor(
                        version.score || 0
                      )}`}
                    >
                      Score: {(version.score || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <ClockIcon className="w-3 h-3" />
                    <span>{formatTimestamp(version.timestamp)}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mt-1">
                  {version.summary ||
                    "Constitutional refinement and learning cycle completed"}
                </p>

                {index > 0 && (
                  <button
                    onClick={() => handleVersionClick(version, index)}
                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <GitBranchIcon className="w-3 h-3" />
                    <span>View Constitution Diff</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <ClockIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No version history available</p>
            <p className="text-sm mt-1">
              Run a learning cycle to start tracking evolution
            </p>
          </div>
        )}
      </div>

      {/* Constitution Diff Modal */}
      {selectedDiff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-5/6 flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Constitution Changes
              </h3>
              <button
                onClick={() => setSelectedDiff(null)}
                className="text-gray-400 hover:text-white"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ReactDiffViewer
                oldValue={selectedDiff.old}
                newValue={selectedDiff.new}
                splitView={true}
                leftTitle={selectedDiff.oldTitle}
                rightTitle={selectedDiff.newTitle}
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground: "#1f2937",
                      diffViewerColor: "#f9fafb",
                      addedBackground: "#065f46",
                      addedColor: "#f9fafb",
                      removedBackground: "#7f1d1d",
                      removedColor: "#f9fafb",
                      wordAddedBackground: "#10b981",
                      wordRemovedBackground: "#ef4444",
                      addedGutterBackground: "#065f46",
                      removedGutterBackground: "#7f1d1d",
                      gutterBackground: "#374151",
                      gutterBackgroundDark: "#1f2937",
                      highlightBackground: "#374151",
                      highlightGutterBackground: "#4b5563",
                      codeFoldGutterBackground: "#374151",
                      codeFoldBackground: "#4b5563"
                    }
                  }
                }}
                useDarkTheme={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionTimeline;
