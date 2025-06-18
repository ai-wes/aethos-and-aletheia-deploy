import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Play,
  Copy,
  Download,
  AlertTriangle,
  Shield,
  BookOpen,
  Zap,
  CheckCircle,
  AlertCircle,
  FileText,
  GitBranch,
  ExternalLink,
  Loader2,
} from "lucide-react";
import apiService from "../services/api";
import StressTestResult from "./StressTestResult";
import MoralColliderSpinner from "./MoralColliderSpinner";

const AlignmentCrashTestPlayground = () => {
  const [principle, setPrinciple] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const textareaRef = useRef(null);
  const [expandedLoopholes, setExpandedLoopholes] = useState(new Set());
  const [expandedMitigations, setExpandedMitigations] = useState(new Set());
  const [expandedHistorical, setExpandedHistorical] = useState(new Set());

  const toggleExpanded = (section, index) => {
    const setters = {
      loopholes: setExpandedLoopholes,
      mitigations: setExpandedMitigations,
      historical: setExpandedHistorical,
    };
    const currentSet =
      section === "loopholes"
        ? expandedLoopholes
        : section === "mitigations"
        ? expandedMitigations
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

  const examplePrinciples = [
    "An AI should maximize human happiness at all costs",
    "The system must always be truthful and never deceive humans",
    "Prioritize user engagement and time spent on platform",
    "Minimize false positives even if it increases false negatives",
    "Always defer to human judgment in uncertain situations",
  ];

  const handleRedTeam = async () => {
    if (!principle.trim()) {
      setError("Please enter a principle to stress-test");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiService.stressTest(principle);
      console.log("API Response Received:", response);

      // Check for backend parsing errors
      const hasParsingError =
        response.analysis?.rationale === "Analysis parsing failed";

      if (hasParsingError) {
        console.warn("Backend parsing failed, passing error state to result component");
        // Don't set error here, let the StressTestResult component handle it
        // by passing the parsing error state through
      }

      // --- CORRECTED TRANSFORMATION LOGIC ---
      // The backend already provides a well-structured `analysis` object.
      // We can pass most of it directly, only renaming keys where necessary.
      const transformedResult = {
        principle: response.principle || principle,
        sources: response.sources || [],

        // Pass all analysis fields directly, providing defaults
        risk_score: response.analysis?.risk_score || 0,
        critical_vulnerabilities:
          response.analysis?.critical_vulnerabilities || [],

        // Rename 'loopholes' to 'failure_modes' for the child component
        failure_modes: response.analysis?.loopholes || [],

        mitigations: response.analysis?.mitigations || [],
        historical_analogues: response.analysis?.historical_analogues || [],

        // Rename 'revised_principle' to 'revised_principle_suggestion'
        revised_principle_suggestion:
          response.analysis?.revised_principle || "No revision suggested.",

        // Pass the new fields that were previously missing
        philosophical_objections:
          response.analysis?.philosophical_objections || [],
        failure_scenarios: response.analysis?.failure_scenarios || [],
        detailed_risk_analysis: response.analysis?.detailed_risk_analysis || "",

        // Add any other fields the child component might expect
        rationale: response.analysis?.rationale || "",
        mitigation_gaps: response.analysis?.mitigation_gaps || [], // Assuming this might come from the backend
        stress_test_summary: response.analysis?.rationale || "", // Use rationale as a summary if no specific summary field exists
        
        // Pass the full analysis object for error detection
        analysis: response.analysis
      };

      console.log(
        "Data passed to StressTestResult component:",
        transformedResult
      );
      setResults(transformedResult);
    } catch (err) {
      console.error("Stress test failed:", err);
      setError(err.message || "Failed to analyze principle");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyJSON = async () => {
    if (!results) return;

    const exportData = {
      principle: results.principle,
      risk_assessment: {
        risk_score: results.risk_score,
        timestamp: new Date().toISOString(),
        analysis_method: "philosophical_red_team",
      },
      critical_vulnerabilities: results.critical_vulnerabilities || [],
      vulnerabilities:
        results.failure_modes?.map((mode) => mode.description) || [],
      mitigations: results.mitigations || [],
      historical_precedents: results.historical_analogues || [],
      rationale: results.rationale,
      revised_principle: results.revised_principle_suggestion || "",
      sources:
        results.sources?.map((source) => ({
          author: source.author,
          work: source.source,
          framework: source.framework,
          relevance: source.relevance_score,
        })) || [],
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleLoadExample = (example) => {
    setPrinciple(example);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getRiskColor = (score) => {
    if (score >= 8) return "text-red-600 bg-red-50";
    if (score >= 6) return "text-orange-600 bg-orange-50";
    if (score >= 4) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getRiskLabel = (score) => {
    if (score >= 8) return "HIGH RISK";
    if (score >= 6) return "MODERATE RISK";
    if (score >= 4) return "LOW RISK";
    return "MINIMAL RISK";
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Alignment Crash-Test Playground</h2>
        <p style={styles.subtitle}>The dev console for AI safety.</p>
        <p style={styles.description}>
          Paste a principle → Hit Red-Team → Watch loopholes surface with
          citations.
        </p>
      </div>

      {/* Input Section - Hidden when analyzing or results are shown */}
      {!isAnalyzing && !results && (
        <Card style={styles.queryCard}>
          <CardContent style={styles.cardContent}>
            <label style={styles.label}>Principle to Stress-Test:</label>
            <textarea
              ref={textareaRef}
              value={principle}
              onChange={(e) => setPrinciple(e.target.value)}
              placeholder="Paste any rule, system prompt, or reward spec to find loopholes..."
              style={styles.textarea}
              rows={4}
              disabled={isAnalyzing}
            />

            <Button
              onClick={handleRedTeam}
              disabled={isAnalyzing || !principle.trim()}
              style={styles.stressTestButton}
            >
              {isAnalyzing ? (
                <MoralColliderSpinner />
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Red-Team Now
                </>
              )}
            </Button>

            {/* Example Principles */}
            <div style={styles.quickSelectContainer}>
              <div style={styles.quickSelectLabel}>
                Example principles to test:
              </div>
              <div style={styles.quickSelectButtons}>
                {examplePrinciples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleLoadExample(example)}
                    style={styles.presetButton}
                    disabled={isAnalyzing}
                    title={example}
                  >
                    {example.substring(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={styles.errorAlert}>
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card style={styles.queryCard}>
          <CardContent style={styles.cardContent}>
            <div style={styles.loadingContainer}>
              <MoralColliderSpinner />
              <p style={styles.loadingText}>
                Analyzing principle for vulnerabilities...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <div style={styles.resultsContainer}>
          <div style={styles.resetButtonContainer}>
            <Button
              onClick={() => {
                setResults(null);
                setError(null);
                setPrinciple("");
              }}
              style={styles.resetButton}
            >
              <GitBranch className="w-3 h-3 mr-1" />
              New Test
            </Button>
          </div>
          <StressTestResult result={results} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    height: "100%",
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: "24px",
    padding: "0 20px",
    marginBottom: "40px",
    marginTop: "20px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "left",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "bold",
    color: "#fff",
    textShadow:
      "0 0 10px rgba(255, 195, 77, 0.3), 0 0 20px rgba(35, 217, 217, 0.2)",
    marginBottom: "8px",
  },
  subtitle: {
    margin: 0,
    fontSize: "16px",
    color: "#8f9aa6",
    marginBottom: "4px",
  },
  description: {
    margin: 0,
    fontSize: "14px",
    color: "#8f9aa6",
  },
  queryCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
    borderRadius: "12px",
    padding: 0,
  },
  cardContent: {
    padding: "24px",
  },
  label: {
    display: "block",
    fontSize: "16px",
    fontWeight: "500",
    color: "#fff",
    marginBottom: "12px",
  },
  textarea: {
    width: "80%",
    backgroundColor: "rgba(11, 14, 17, 0.8)",
    color: "#fff",
    border: "1px solid #23d9d9",
    borderRadius: "8px",
    padding: "16px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "120px",
    marginBottom: "16px",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "&:focus": {
      outline: "none",
      borderColor: "#23d9d9",
      boxShadow: "0 0 10px rgba(35, 217, 217, 0.3)",
    },
  },
  stressTestButton: {
    background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    color: "#fff",
    border: "1px solid rgba(220, 38, 38, 0.3)",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "80%",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 15px rgba(220, 38, 38, 0.2)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)",
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none",
    },
  },
  resultsContainer: {
    marginTop: "24px",
    position: "relative",
    overflowY: "auto",
    marginBottom: "40px",
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    border: "1px solid rgba(220, 38, 38, 0.2)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#ff6b6b",
    fontSize: "14px",
    marginTop: "12px",
  },
  quickSelectContainer: {
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "rgba(11, 14, 17, 0.4)",
    borderRadius: "8px",
    border: "1px solid rgba(35, 217, 217, 0.1)",
    width: "80%",
    marginRight: "auto",
  },
  quickSelectLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#8f9aa6",
    marginBottom: "12px",
  },
  quickSelectButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  presetButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    backgroundColor: "rgba(35, 217, 217, 0.1)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
    borderRadius: "4px",
    color: "#c3cfdc",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    "&:hover": {
      backgroundColor: "rgba(35, 217, 217, 0.2)",
      color: "#23d9d9",
      borderColor: "rgba(35, 217, 217, 0.4)",
    },
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: "16px",
  },
  loadingText: {
    margin: 0,
    fontSize: "16px",
    color: "#8f9aa6",
    textAlign: "center",
  },
  resetButtonContainer: {
    position: "absolute",
    top: "30px",
    right: "20px",
    zIndex: 10,
  },
  resetButton: {
    background: "rgba(35, 217, 217, 0.15)",
    color: "white",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "6px",
    padding: "9px 12px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(35, 217, 217, 0.25)",
      color: "#23d9d9",
      borderColor: "rgba(35, 217, 217, 0.5)",
    },
  },
};

export default AlignmentCrashTestPlayground;
