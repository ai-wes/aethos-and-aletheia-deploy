/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import apiService from "../services/api";
import WisdomResult from "./WisdomResult";
import CompassSearchSpinner from "./CompassSearchSpinner";

const PRESET_QUESTIONS = [
  {
    title: "AI Alignment",
    icon: "🤖",
    question:
      "How should we ensure that advanced AI systems remain aligned with human values as they become more capable?",
    description:
      "Explore AI safety and value alignment from multiple philosophical perspectives",
  },
  {
    title: "Autonomous Vehicles",
    icon: "🚗",
    question:
      "In an unavoidable accident, should an autonomous vehicle prioritize the safety of its passengers or pedestrians?",
    description: "Classic trolley problem applied to modern technology",
  },
  {
    title: "Privacy vs Security",
    icon: "🔒",
    question:
      "When is it ethical for governments to access private communications to prevent terrorism?",
    description: "Balance individual privacy rights with collective security",
  },
  {
    title: "AI Consciousness",
    icon: "🧠",
    question:
      "At what point should we consider an AI system to have moral rights and responsibilities?",
    description:
      "Explore questions of artificial consciousness and moral status",
  },
  {
    title: "Genetic Engineering",
    icon: "🧬",
    question:
      "Should parents be allowed to genetically modify their children to enhance intelligence or physical abilities?",
    description: "Ethics of human enhancement and genetic modification",
  },
  {
    title: "Climate Action",
    icon: "🌍",
    question:
      "Is it ethical to impose carbon restrictions that may harm economic growth in developing nations?",
    description: "Global justice and environmental ethics",
  },
];

export default function WisdomOracle({ onWisdomResult = () => {} }) {
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExploreSubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.query(query);
      console.log("Raw API response:", response);
      console.log("Structured response:", response?.structured_response);
      console.log("Is structured:", response?.is_structured);
      console.log(
        "Key points length:",
        response?.structured_response?.key_points?.length
      );
      console.log(
        "Perspectives length:",
        response?.structured_response?.perspectives?.length
      );
      console.log(
        "Full analysis available:",
        !!response?.structured_response?.full_analysis
      );
      setResult(response);
      setError(null);
      onWisdomResult(response); // Pass result up to parent
    } catch (error) {
      console.error("Failed to query wisdom network:", error);
      setError(error.message || "Failed to query wisdom network");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setQuery("");
    setError(null);
    onWisdomResult(null); // Clear result in parent
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Aethos Wisdom Network</h2>
        <p style={styles.subtitle}>
          Ask your ethical question to the collective human consciousness.
        </p>
        <p style={styles.description}>
          Query the network → Get perspectives → Explore wisdom from multiple
          philosophical frameworks.
        </p>
      </div>

      {!isLoading && !result && (
        <Card style={styles.queryCard}>
          <CardContent style={styles.cardContent}>
            <label style={styles.label}>Ask your ethical question:</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your ethical dilemma, AI safety question, or concept to explore..."
              style={styles.textarea}
              rows={4}
            />
            <div style={styles.quickSelectContainer}>
              <div style={styles.quickSelectLabel}>Quick Questions:</div>
              <div style={styles.quickSelectButtons}>
                {PRESET_QUESTIONS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(preset.question)}
                    style={styles.presetButton}
                    title={preset.description}
                  >
                    <span style={styles.presetIcon}>{preset.icon}</span>
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleExploreSubmit}
              disabled={!query.trim() || isLoading}
              style={styles.exploreButton}
            >
              <Search className="w-4 h-4 mr-2" />
              Query Aethos Wisdom Network
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card style={styles.queryCard}>
          <CardContent style={styles.cardContent}>
            <div style={styles.loadingContainer}>
              <div style={styles.largeSpinnerContainer}>
                <CompassSearchSpinner />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card style={styles.queryCard}>
          <CardContent style={styles.cardContent}>
            <div style={styles.errorContainer}>
              <h3 style={styles.errorTitle}>Error</h3>
              <p style={styles.errorMessage}>{error}</p>
              <Button onClick={handleReset} style={styles.resetButton}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && <WisdomResult result={result} onReset={handleReset} />}
    </div>
  );
}

const styles = {
  // This component is now a single column
  container: {
    height: "100vh",
    display: "flex",
    overflowY: "auto",
    width: "100%",
    flexDirection: "column",
    gap: "24px",
    padding: "0 20px",
    marginBottom: "100px",
    marginTop: "20px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "left",
    paddingBottom: "16px",
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
    width: "90%",
    maxWidth: "800px",
  },
  label: {
    display: "block",
    fontSize: "16px",
    fontWeight: "500",
    color: "#fff",
    marginBottom: "12px",
  },
  textarea: {
    width: "90%",
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
  },
  exploreButton: {
    background: "linear-gradient(135deg, #23d9d9 0%, #1e90ff 100%)",
    color: "#fff",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(35, 217, 217, 0.2)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "20px",
  },
  largeSpinnerContainer: {
    transform: "scale(2.5)",
    marginBottom: "20px",
  },
  quickSelectContainer: {
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "rgba(11, 14, 17, 0.4)",
    borderRadius: "8px",
    border: "1px solid rgba(35, 217, 217, 0.1)",
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
    color: "#8f9aa6",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  presetIcon: {
    fontSize: "12px",
    flexShrink: 0,
  },
  errorContainer: {
    textAlign: "center",
    padding: "20px",
  },
  errorTitle: {
    color: "#ff4757",
    marginBottom: "12px",
    fontSize: "18px",
    fontWeight: "600",
  },
  errorMessage: {
    color: "#d1d5db",
    marginBottom: "20px",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  resetButton: {
    background: "rgba(255, 71, 87, 0.2)",
    color: "#ff4757",
    border: "1px solid rgba(255, 71, 87, 0.3)",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
