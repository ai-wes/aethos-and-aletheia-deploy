import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { exportStressTestResults } from "../utils/exportUtils";

const StressTestResult = ({ result }) => {
  const [expandedLoopholes, setExpandedLoopholes] = useState(new Set());
  const [expandedMitigations, setExpandedMitigations] = useState(new Set());
  const [expandedHistorical, setExpandedHistorical] = useState(new Set());
  const [expandedPhilosophical, setExpandedPhilosophical] = useState(new Set());
  const [expandedScenarios, setExpandedScenarios] = useState(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);

  const toggleExpanded = (section, index) => {
    const setters = {
      loopholes: setExpandedLoopholes,
      mitigations: setExpandedMitigations,
      historical: setExpandedHistorical,
      philosophical: setExpandedPhilosophical,
      scenarios: setExpandedScenarios,
    };
    const currentSet =
      section === "loopholes"
        ? expandedLoopholes
        : section === "mitigations"
        ? expandedMitigations
        : section === "philosophical"
        ? expandedPhilosophical
        : section === "scenarios"
        ? expandedScenarios
        : expandedHistorical;

    const newSet = new Set(currentSet);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setters[section](newSet);
  };
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "#ef4444"; // red
      case "High":
        return "#f97316"; // orange
      default:
        return "#eab308"; // yellow
    }
  };

  // Circular Risk Meter Component
  const RiskMeter = ({ score }) => {
    const radius = 80;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${(score / 10) * circumference} ${circumference}`;

    const getRiskColor = (score) => {
      if (score >= 8) return "#ef4444"; // Critical - red
      if (score >= 5) return "#f97316"; // High - orange
      if (score >= 3) return "#eab308"; // Medium - yellow
      return "#22c55e"; // Low - green
    };

    const getRiskLabel = (score) => {
      if (score >= 8) return "CRITICAL RISK";
      if (score >= 5) return "HIGH RISK";
      if (score >= 3) return "MEDIUM RISK";
      return "LOW RISK";
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "32px 0 40px 0",
          padding: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Background circle */}
          <svg
            height={radius * 2}
            width={radius * 2}
            style={{ position: "absolute", transform: "rotate(-90deg)" }}
          >
            <circle
              stroke="rgba(75, 85, 99, 0.3)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={getRiskColor(score)}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              style={{
                transition: "stroke-dasharray 1s ease-in-out",
                filter: `drop-shadow(0 0 8px ${getRiskColor(score)}40)`,
              }}
            />
          </svg>

          {/* Center content */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: getRiskColor(score),
                textShadow: `0 0 10px ${getRiskColor(score)}60`,
                marginBottom: "4px",
              }}
            >
              {score}/10
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                fontWeight: "600",
                letterSpacing: "0.5px",
              }}
            >
              {getRiskLabel(score)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Misinterpretation":
        return "❓";
      case "Ethical Blindspot":
        return "⚖️";
      case "Exploitation":
        return "⚠️";
      case "Loophole":
        return "🕳️";
      default:
        return "⚠️";
    }
  };

  // Function to render text with source citations as tooltips
  const renderTextWithSourceTooltips = (text) => {
    if (!text || !result.sources || result.sources.length === 0) {
      return text;
    }

    // Parse source citations like (Source 1), (Source 2), etc.
    const sourcePattern = /\(Source (\d+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = sourcePattern.exec(text)) !== null) {
      // Add text before the citation
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const sourceNumber = parseInt(match[1]) - 1; // Convert to 0-based index
      const source = result.sources[sourceNumber];

      if (source) {
        // Add the citation with tooltip
        parts.push(
          <span
            key={`source-${sourceNumber}-${match.index}`}
            style={styles.sourceCitation}
            title={`${source.author} - ${source.source} (${
              source.framework
            })\n\nRelevance: ${(source.relevance_score * 100).toFixed(0)}%\n\n${
              source.excerpt || "No excerpt available"
            }`}
          >
            {match[0]}
          </span>
        );
      } else {
        // If source not found, just add the citation text
        parts.push(match[0]);
      }

      lastIndex = sourcePattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const styles = {
    resultsContainer: {
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "0",
    },
    header: {
      marginBottom: "24px",
      textAlign: "left",
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "12px",
    },
    exportContainer: {
      position: "relative",
    },
    exportButton: {
      backgroundColor: "rgba(35, 217, 217, 0.1)",
      color: "#23d9d9",
      border: "1px solid rgba(35, 217, 217, 0.3)",
      borderRadius: "6px",
      padding: "8px 16px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    exportMenu: {
      position: "absolute",
      top: "100%",
      right: "0",
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      border: "1px solid rgba(35, 217, 217, 0.3)",
      borderRadius: "8px",
      padding: "8px",
      minWidth: "150px",
      zIndex: 1000,
      marginTop: "4px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    },
    exportOption: {
      display: "block",
      width: "100%",
      backgroundColor: "transparent",
      color: "#d1d5db",
      border: "none",
      borderRadius: "4px",
      padding: "8px 12px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "pointer",
      textAlign: "left",
      transition: "background-color 0.2s ease",
      marginBottom: "2px",
    },
    title: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: "8px",
      margin: "0 0 8px 0",
    },
    principleText: {
      color: "#e2e8f0",
      fontStyle: "italic",
      background: "rgba(31, 41, 55, 0.6)",
      border: "1px solid rgba(75, 85, 99, 0.3)",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      lineHeight: "1.4",
      margin: "0",
      width: "80%",
    },
    riskScoreContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      marginTop: "16px",
    },
    riskScoreLabel: {
      fontSize: "14px",
      color: "#9ca3af",
      fontWeight: "500",
    },
    resultCard: {
      backgroundColor: "rgba(26, 31, 37, 0.8)",
      border: "1px solid rgba(35, 217, 217, 0.2)",
      borderRadius: "12px",
      marginBottom: "16px",
      transition: "all 0.3s ease",
      overflow: "hidden",
    },
    cardContent: {
      padding: "24px",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "16px",
    },
    cardTitle: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#23d9d9",
      fontWeight: "600",
      fontSize: "18px",
      flex: 1,
    },
    categoryIcon: {
      fontSize: "18px",
      color: "#9ca3af",
    },
    cardDescription: {
      color: "#d1d5db",
      lineHeight: "1.7",
      fontSize: "14px",
      wordWrap: "break-word",
      overflowWrap: "break-word",
    },
    severityBadge: {
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "12px",
      padding: "4px 12px",
      borderRadius: "6px",
      flexShrink: 0,
    },
    sourceCitation: {
      color: "#23d9d9",
      fontWeight: "500",
      cursor: "help",
      textDecoration: "underline",
      textDecorationStyle: "dotted",
      borderRadius: "2px",
      padding: "1px 2px",
      background: "rgba(35, 217, 217, 0.1)",
      transition: "background-color 0.2s ease",
      "&:hover": {
        background: "rgba(35, 217, 217, 0.2)",
      },
    },
    summaryText: {
      color: "#fbbf24",
      fontStyle: "italic",
      background: "rgba(251, 191, 36, 0.1)",
      border: "1px solid rgba(251, 191, 36, 0.3)",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      lineHeight: "1.4",
      marginTop: "12px",
      fontWeight: "500",
    },
    riskAssessmentContainer: {
      display: "flex",
      gap: "24px",
      marginBottom: "32px",
      alignItems: "stretch",
    },
    vulnerabilitiesPanel: {
      flex: 1,
      minWidth: "200px",
    },
    meterContainer: {
      flex: "0 0 200px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    revisedPrinciplePanel: {
      flex: 1,
      minWidth: "200px",
    },
    panelHeader: {
      background: "rgba(35, 217, 217, 0.2)",
      color: "#23d9d9",
      padding: "12px 16px",
      borderRadius: "8px 8px 0 0",
      fontWeight: "600",
      fontSize: "14px",
      border: "1px solid rgba(35, 217, 217, 0.3)",
      borderBottom: "none",
    },
    vulnerabilitiesList: {
      background: "rgba(17, 24, 39, 0.6)",
      border: "1px solid rgba(35, 217, 217, 0.3)",
      borderTop: "none",
      borderRadius: "0 0 8px 8px",
      padding: "16px",
      minHeight: "120px",
    },
    vulnerabilityItem: {
      color: "#ef4444",
      fontSize: "13px",
      lineHeight: "1.5",
      marginBottom: "8px",
      padding: "6px 0",
      borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
    },
    revisedPrincipleText: {
      background: "rgba(17, 24, 39, 0.6)",
      border: "1px solid rgba(35, 217, 217, 0.3)",
      borderTop: "none",
      borderRadius: "0 0 8px 8px",
      padding: "16px",
      color: "#d1d5db",
      fontSize: "13px",
      lineHeight: "1.5",
      minHeight: "120px",
      fontStyle: "italic",
    },
  };

  // Check if the result indicates a parsing failure
  const isParsingError = result?.analysis?.rationale === 'Analysis parsing failed' || 
                        (result?.detailed_risk_analysis && 
                         result.detailed_risk_analysis.length > 1000 &&
                         result.detailed_risk_analysis.includes("truthfulness"));

  if (!result || (!result.failure_modes && !isParsingError)) {
    return (
      <div style={styles.resultsContainer}>
        <div style={styles.header}>
          <h3 style={styles.title}>No results to display</h3>
        </div>
      </div>
    );
  }

  if (isParsingError) {
    return (
      <div style={styles.resultsContainer}>
        <Card style={{ backgroundColor: '#1a1f25', border: '1px solid #ef4444' }}>
          <CardContent style={{ padding: '32px' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '16px',
              textAlign: 'center' 
            }}>
              <div style={{ 
                fontSize: '48px',
                color: '#ef4444'
              }}>⚠️</div>
              <h3 style={{ 
                color: '#ef4444',
                fontSize: '20px',
                fontWeight: '600',
                margin: '0'
              }}>
                Analysis Failed
              </h3>
              <p style={{ 
                color: '#9ca3af',
                fontSize: '14px',
                maxWidth: '500px',
                margin: '0'
              }}>
                The AI response could not be parsed properly. This may happen with complex principles or when the AI generates an unexpected response format.
              </p>
              <p style={{ 
                color: '#6b7280',
                fontSize: '13px',
                margin: '0'
              }}>
                Please try rephrasing your principle or testing a simpler version.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.resultsContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h3 style={styles.title}>AI Principle to Test:</h3>
          <div style={styles.exportContainer}>
            <button
              style={styles.exportButton}
              onClick={() => setShowExportMenu(!showExportMenu)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(35, 217, 217, 0.2)";
                e.target.style.borderColor = "#23d9d9";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
                e.target.style.borderColor = "rgba(35, 217, 217, 0.3)";
              }}
            >
              📥 Export Results
            </button>
            {showExportMenu && (
              <div style={styles.exportMenu}>
                <button
                  style={styles.exportOption}
                  onClick={() => {
                    exportStressTestResults(result, 'json');
                    setShowExportMenu(false);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  📄 JSON Format
                </button>
                <button
                  style={styles.exportOption}
                  onClick={() => {
                    exportStressTestResults(result, 'csv');
                    setShowExportMenu(false);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  📊 CSV Format
                </button>
                <button
                  style={styles.exportOption}
                  onClick={() => {
                    exportStressTestResults(result, 'text');
                    setShowExportMenu(false);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  📝 Text Format
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={styles.principleText}>"{result.principle}"</div>
        {result.stress_test_summary && (
          <div style={styles.summaryText}>
            {/* Check if it's raw unparsed text and handle appropriately */}
            {result.stress_test_summary.length > 500 && 
             result.stress_test_summary.includes("Water comes") ? (
              <div style={{color: '#ef4444', fontStyle: 'italic'}}>
                Error: Failed to parse AI response. The analysis is unavailable.
              </div>
            ) : (
              result.stress_test_summary
            )}
          </div>
        )}
      </div>

      {/* Risk Assessment Layout */}
      <div style={styles.riskAssessmentContainer}>
        {/* Left: Critical Vulnerabilities */}
        <div style={styles.vulnerabilitiesPanel}>
          <div style={styles.panelHeader}>🚨 Critical Vulnerabilities</div>
          <div style={styles.vulnerabilitiesList}>
            {(result.critical_vulnerabilities || []).map((vuln, index) => (
              <div key={index} style={styles.vulnerabilityItem}>
                {typeof vuln === "string"
                  ? vuln
                  : vuln.description || JSON.stringify(vuln)}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Risk Meter */}
        <div style={styles.meterContainer}>
          <RiskMeter score={result.risk_score || 0} />
        </div>

        {/* Right: Revised Principle */}
        <div style={styles.revisedPrinciplePanel}>
          <div style={styles.panelHeader}>✨ Revised Principle</div>
          <div style={styles.revisedPrincipleText}>
            {result.revised_principle_suggestion || "No revision suggested"}
          </div>
        </div>
      </div>

      {/* Loopholes Section */}
      {result.failure_modes && result.failure_modes.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              background: "#dc2626",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px 8px 0 0",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔍 High Risk Loopholes
          </div>

          {result.failure_modes.map((mode, index) => (
            <div
              key={index}
              style={{
                border: "1px solid rgba(75, 85, 99, 0.3)",
                borderTop:
                  index === 0 ? "none" : "1px solid rgba(75, 85, 99, 0.3)",
                borderRadius:
                  index === result.failure_modes.length - 1
                    ? "0 0 8px 8px"
                    : "0",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => toggleExpanded("loopholes", index)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(31, 41, 55, 0.8)",
                  border: "none",
                  color: "#ffffff",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(55, 65, 81, 0.8)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "rgba(31, 41, 55, 0.8)")
                }
              >
                <span style={{ flex: 1, marginRight: "12px" }}>
                  Loophole {index + 1}: {mode.title || `Loophole ${index + 1}`}
                </span>
                {expandedLoopholes.has(index) ? (
                  <ChevronUpIcon
                    style={{ width: "14px", height: "14px", flexShrink: 0 }}
                  />
                ) : (
                  <ChevronDownIcon
                    style={{ width: "14px", height: "14px", flexShrink: 0 }}
                  />
                )}
              </button>

              {expandedLoopholes.has(index) && (
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(17, 24, 39, 0.6)",
                    color: "#d1d5db",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    borderTop: "1px solid rgba(75, 85, 99, 0.3)",
                  }}
                >
                  {renderTextWithSourceTooltips(mode.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Philosophical Objections Section */}
      {result.philosophical_objections &&
        result.philosophical_objections.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                background: "#7c3aed",
                color: "white",
                padding: "10px 16px",
                borderRadius: "8px 8px 0 0",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🎭 Philosophical Objections
            </div>

            {result.philosophical_objections.map((objection, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid rgba(75, 85, 99, 0.3)",
                  borderTop:
                    index === 0 ? "none" : "1px solid rgba(75, 85, 99, 0.3)",
                  borderRadius:
                    index === result.philosophical_objections.length - 1
                      ? "0 0 8px 8px"
                      : "0",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleExpanded("philosophical", index)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(31, 41, 55, 0.8)",
                    border: "none",
                    color: "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.background = "rgba(55, 65, 81, 0.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background = "rgba(31, 41, 55, 0.8)")
                  }
                >
                  <div style={{ flex: 1, marginRight: "12px" }}>
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                      {objection.framework} ({objection.era})
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {objection.author} • Severity:{" "}
                      {Math.round(objection.severity_score * 100)}%
                    </div>
                  </div>
                  {expandedPhilosophical.has(index) ? (
                    <ChevronUpIcon
                      style={{ width: "14px", height: "14px", flexShrink: 0 }}
                    />
                  ) : (
                    <ChevronDownIcon
                      style={{ width: "14px", height: "14px", flexShrink: 0 }}
                    />
                  )}
                </button>

                {expandedPhilosophical.has(index) && (
                  <div
                    style={{
                      padding: "16px",
                      background: "rgba(17, 24, 39, 0.6)",
                      color: "#d1d5db",
                      fontSize: "13px",
                      lineHeight: "1.8",
                      borderTop: "1px solid rgba(75, 85, 99, 0.3)",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "12px",
                        fontWeight: "500",
                        color: "#fbbf24",
                      }}
                    >
                      Critical Thesis:
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      {objection.critical_thesis}
                    </div>
                    <div
                      style={{
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#ef4444",
                      }}
                    >
                      Predicted Failure Mode:
                    </div>
                    <div>{objection.failure_mode}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Detailed Risk Analysis */}
      {result.detailed_risk_analysis && result.detailed_risk_analysis !== 'Analysis parsing failed' && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              background: "#dc2626",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px 8px 0 0",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔍 Detailed Risk Analysis
          </div>
          <div
            style={{
              border: "1px solid rgba(75, 85, 99, 0.3)",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "16px",
              background: "rgba(17, 24, 39, 0.6)",
              color: "#d1d5db",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            {/* Check if this looks like unparsed AI response */}
            {result.detailed_risk_analysis.length > 1000 && 
             (result.detailed_risk_analysis.includes("Water comes") ||
              result.detailed_risk_analysis.includes("truthfulness is paramount") ||
              result.detailed_risk_analysis.includes("loopholes surface")) ? (
              <div style={{color: '#ef4444', fontStyle: 'italic'}}>
                Error: The AI response could not be parsed properly. Please try again.
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: result.detailed_risk_analysis,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Failure Scenarios */}
      {result.failure_scenarios && result.failure_scenarios.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              background: "#ea580c",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px 8px 0 0",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ⚠️ Failure Scenarios
          </div>

          {result.failure_scenarios.map((scenario, index) => (
            <div
              key={index}
              style={{
                border: "1px solid rgba(75, 85, 99, 0.3)",
                borderTop:
                  index === 0 ? "none" : "1px solid rgba(75, 85, 99, 0.3)",
                borderRadius:
                  index === result.failure_scenarios.length - 1
                    ? "0 0 8px 8px"
                    : "0",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => toggleExpanded("scenarios", index)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(31, 41, 55, 0.8)",
                  border: "none",
                  color: "#ffffff",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(55, 65, 81, 0.8)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "rgba(31, 41, 55, 0.8)")
                }
              >
                <div style={{ flex: 1, marginRight: "12px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    {scenario.scenario_name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    Harm: {scenario.harm_potential} • Likelihood:{" "}
                    {scenario.likelihood}
                  </div>
                </div>
                {expandedScenarios.has(index) ? (
                  <ChevronUpIcon
                    style={{ width: "14px", height: "14px", flexShrink: 0 }}
                  />
                ) : (
                  <ChevronDownIcon
                    style={{ width: "14px", height: "14px", flexShrink: 0 }}
                  />
                )}
              </button>

              {expandedScenarios.has(index) && (
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(17, 24, 39, 0.6)",
                    color: "#d1d5db",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    borderTop: "1px solid rgba(75, 85, 99, 0.3)",
                  }}
                >
                  {scenario.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mitigation Gaps */}
      {result.mitigation_gaps && result.mitigation_gaps.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              background: "#9333ea",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px 8px 0 0",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔒 Mitigation Gaps
          </div>
          <div
            style={{
              border: "1px solid rgba(75, 85, 99, 0.3)",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "16px",
              background: "rgba(17, 24, 39, 0.6)",
            }}
          >
            {result.mitigation_gaps.map((gap, index) => (
              <div
                key={index}
                style={{
                  color: "#fbbf24",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  marginBottom: "8px",
                  padding: "6px 0",
                  borderBottom:
                    index < result.mitigation_gaps.length - 1
                      ? "1px solid rgba(251, 191, 36, 0.2)"
                      : "none",
                }}
              >
                {gap}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Philosophical Mitigations Section */}
      {result.mitigations && result.mitigations.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              background: "#059669",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px 8px 0 0",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔒 Philosophical Mitigations
          </div>

          {result.mitigations.map((mitigation, index) => (
            <div
              key={index}
              style={{
                border: "1px solid rgba(75, 85, 99, 0.3)",
                borderTop:
                  index === 0 ? "none" : "1px solid rgba(75, 85, 99, 0.3)",
                borderRadius:
                  index === result.mitigations.length - 1 ? "0 0 8px 8px" : "0",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => toggleExpanded("mitigations", index)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(31, 41, 55, 0.8)",
                  border: "none",
                  color: "#ffffff",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(55, 65, 81, 0.8)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "rgba(31, 41, 55, 0.8)")
                }
              >
                <span style={{ flex: 1, marginRight: "12px" }}>
                  Mitigation {index + 1}
                </span>
                {expandedMitigations.has(index) ? (
                  <ChevronUpIcon
                    style={{ width: "14px", height: "14px", flexShrink: 0 }}
                  />
                ) : (
                  <ChevronDownIcon
                    style={{ width: "14px", height: "14px", flexShrink: 0 }}
                  />
                )}
              </button>

              {expandedMitigations.has(index) && (
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(17, 24, 39, 0.6)",
                    color: "#d1d5db",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    borderTop: "1px solid rgba(75, 85, 99, 0.3)",
                  }}
                >
                  {renderTextWithSourceTooltips(
                    (typeof mitigation === "string"
                      ? mitigation
                      : mitigation.strategy ||
                        mitigation.description ||
                        JSON.stringify(mitigation)
                    ).replace(/^\*\*([^:]+):\*\*\s*/, "")
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Historical Failure Cases Section */}
      {result.historical_analogues &&
        result.historical_analogues.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                background: "#2563eb",
                color: "white",
                padding: "10px 16px",
                borderRadius: "8px 8px 0 0",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📚 Historical Failure Cases
            </div>

            {result.historical_analogues.map((historical, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid rgba(75, 85, 99, 0.3)",
                  borderTop:
                    index === 0 ? "none" : "1px solid rgba(75, 85, 99, 0.3)",
                  borderRadius:
                    index === result.historical_analogues.length - 1
                      ? "0 0 8px 8px"
                      : "0",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleExpanded("historical", index)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(31, 41, 55, 0.8)",
                    border: "none",
                    color: "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.background = "rgba(55, 65, 81, 0.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background = "rgba(31, 41, 55, 0.8)")
                  }
                >
                  <span style={{ flex: 1, marginRight: "12px" }}>
                    Historical Case {index + 1}
                  </span>
                  {expandedHistorical.has(index) ? (
                    <ChevronUpIcon
                      style={{ width: "14px", height: "14px", flexShrink: 0 }}
                    />
                  ) : (
                    <ChevronDownIcon
                      style={{ width: "14px", height: "14px", flexShrink: 0 }}
                    />
                  )}
                </button>

                {expandedHistorical.has(index) && (
                  <div
                    style={{
                      padding: "16px",
                      background: "rgba(17, 24, 39, 0.6)",
                      color: "#d1d5db",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      borderTop: "1px solid rgba(75, 85, 99, 0.3)",
                    }}
                  >
                    {renderTextWithSourceTooltips(
                      (typeof historical === "string"
                        ? historical
                        : historical.case ||
                          historical.description ||
                          JSON.stringify(historical)
                      ).replace(/^\*\*([^:]+):\*\*\s*/, "")
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default StressTestResult;
