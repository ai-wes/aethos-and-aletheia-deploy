import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Brain,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  RotateCcw,
  Eye,
  History,
  FileText,
  Zap,
  Plus,
  User,
  Trash2,
} from "lucide-react";
import apiService from "../services/api";
import TrainingReviewModal from "./TrainingReviewModal";
import LearningLoopCLI from "./LearningLoopCLI";

// Skeleton loader component
const SkeletonLoader = ({
  className = "h-4 bg-gray-200 rounded animate-pulse",
}) => <div className={className}></div>;

// Progress bar with phase indicator component
const LearningProgressBar = ({ progress, phase, cycleNumber, totalCycles }) => {
  const getPhaseIcon = (currentPhase) => {
    switch (currentPhase) {
      case "scenario_loading":
        return <Target className="w-4 h-4" />;
      case "decision_making":
        return <Brain className="w-4 h-4" />;
      case "critique_generation":
        return <RotateCcw className="w-4 h-4" />;
      case "reflection":
        return <RefreshCw className="w-4 h-4" />;
      case "constitution_update":
        return <TrendingUp className="w-4 h-4" />;
      case "complete":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPhaseEmoji = (currentPhase) => {
    switch (currentPhase) {
      case "scenario_loading":
        return "🎯";
      case "decision_making":
        return "🧠";
      case "critique_generation":
        return "🔄";
      case "reflection":
        return "🔁";
      case "constitution_update":
        return "✨";
      case "complete":
        return "✅";
      default:
        return "⏱️";
    }
  };

  const getPhaseColor = (currentPhase) => {
    switch (currentPhase) {
      case "complete":
        return "#22c55e";
      case "idle":
        return "#9ca3af";
      case "scenario_loading":
        return "#3b82f6";
      case "decision_making":
        return "#a855f7";
      case "critique_generation":
        return "#f97316";
      case "reflection":
        return "#06b6d4";
      case "constitution_update":
        return "#4ade80";
      default:
        return "#3b82f6";
    }
  };

  const formatPhaseName = (phaseName) => {
    return phaseName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "14px",
        }}
      >
        <span>
          Cycle {cycleNumber} of {totalCycles}
        </span>
        <span>{progress}%</span>
      </div>

      <div
        style={{
          width: "90%",
          height: "12px",
          backgroundColor: "rgba(75, 85, 99, 0.3)",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: "#1e90ff",
            transition: "width 0.3s ease",
            borderRadius: "6px",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          backgroundColor: "rgba(17, 24, 39, 0.6)",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: getPhaseColor(phase),
            animation: "pulse 2s infinite",
          }}
        />
        <span style={{ fontSize: "24px" }}>{getPhaseEmoji(phase)}</span>
        {getPhaseIcon(phase)}
        <span style={{ fontWeight: "500", fontSize: "14px" }}>
          {formatPhaseName(phase)}
        </span>
      </div>
    </div>
  );
};

// Scenario card component with slide-in animation
const ScenarioCard = ({ scenario, isVisible }) => {
  if (!scenario) return null;

  // Get styles based on scenario card definition in main styles object
  const cardStyle = {
    ...styles.scenarioCard,
    ...(isVisible ? {} : styles.scenarioCardHidden),
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case "simple":
        return "#22c55e";
      case "moderate":
        return "#f59e0b";
      case "complex":
        return "#f97316";
      case "extreme":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getComplexityIcon = (complexity) => {
    switch (complexity) {
      case "simple":
        return "🟢";
      case "moderate":
        return "🟡";
      case "complex":
        return "🟠";
      case "extreme":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div style={cardStyle}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <Target style={{ width: "20px", height: "20px", color: "#1e90ff" }} />
          Current Scenario
        </div>
        {scenario.metadata && (
          <div style={styles.scenarioMetadata}>
            <div
              style={{
                ...styles.complexityBadge,
                backgroundColor:
                  getComplexityColor(scenario.metadata.complexity) + "20",
                color: getComplexityColor(scenario.metadata.complexity),
                border: `1px solid ${getComplexityColor(
                  scenario.metadata.complexity
                )}40`,
              }}
            >
              {getComplexityIcon(scenario.metadata.complexity)}{" "}
              {scenario.metadata.complexity}
            </div>
            {scenario.metadata.estimated_decision_time_minutes && (
              <div style={styles.timeBadge}>
                <Clock style={{ width: "12px", height: "12px" }} />
                {scenario.metadata.estimated_decision_time_minutes}m
              </div>
            )}
          </div>
        )}
      </div>
      <div style={styles.cardContent}>
        <h3 style={styles.scenarioTitle}>{scenario.title}</h3>
        <p style={styles.scenarioDescription}>{scenario.description}</p>

        {scenario.metadata && scenario.metadata.ethical_frameworks_relevant && (
          <div style={styles.cardSection}>
            <h4 style={styles.sectionTitle}>Relevant Ethical Frameworks:</h4>
            <div style={styles.frameworksList}>
              {scenario.metadata.ethical_frameworks_relevant.map(
                (framework, index) => (
                  <span key={index} style={styles.frameworkBadge}>
                    {framework.replace("_", " ").toUpperCase()}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {scenario.actions && scenario.actions.length > 0 && (
          <div style={styles.cardSection}>
            <h4 style={styles.sectionTitle}>Available Actions:</h4>
            <div style={styles.actionsList}>
              {scenario.actions.map((action, index) => (
                <div key={index} style={styles.actionItem}>
                  <span style={styles.actionNumber}>{index + 1}.</span>
                  {action}
                </div>
              ))}
            </div>
          </div>
        )}

        {scenario.metadata &&
          scenario.metadata.stakeholder_analysis &&
          Object.keys(scenario.metadata.stakeholder_analysis).length > 0 && (
            <div style={styles.cardSection}>
              <h4 style={styles.sectionTitle}>Stakeholders:</h4>
              <div style={styles.stakeholdersList}>
                {Object.entries(scenario.metadata.stakeholder_analysis).map(
                  ([category, count], index) => (
                    <span key={index} style={styles.stakeholderBadge}>
                      {category.replace("_", " ")}: {count}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

        {scenario.metadata && scenario.metadata.moral_weight_score > 0 && (
          <div style={styles.cardSection}>
            <div style={styles.moralWeightContainer}>
              <span style={styles.moralWeightLabel}>Moral Weight:</span>
              <div style={styles.moralWeightBar}>
                <div
                  style={{
                    ...styles.moralWeightFill,
                    width: `${scenario.metadata.moral_weight_score * 100}%`,
                  }}
                />
              </div>
              <span style={styles.moralWeightValue}>
                {Math.round(scenario.metadata.moral_weight_score * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Agent decision card component
const AgentDecisionCard = ({ decision, isVisible }) => {
  if (!decision) return null;

  const cardStyle = {
    ...styles.decisionCard,
    ...(isVisible ? {} : styles.decisionCardHidden),
  };

  return (
    <div style={cardStyle}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <Brain style={{ width: "20px", height: "20px", color: "#9333ea" }} />
          Agent Decision
        </div>
      </div>
      <div style={styles.cardContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <h4 style={styles.sectionTitle}>Action Taken:</h4>
            <div style={styles.decisionAction}>
              <p style={styles.decisionActionText}>{decision.action}</p>
            </div>
          </div>

          <div>
            <h4 style={styles.sectionTitle}>Justification:</h4>
            <div style={styles.decisionJustification}>
              <p style={styles.decisionJustificationText}>
                {decision.justification}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Structured critique parsing utilities
const parseCritiqueData = (critique) => {
  if (!critique || typeof critique !== "object") return null;

  // Expected critique structure from backend
  const critiqueSection = {
    utilitarian: {
      key: "utilitarian_analysis",
      title: "Utilitarian Analysis",
      icon: "⚖️",
      color: "#3b82f6",
      description: "Focuses on outcomes and maximizing overall welfare",
    },
    deontological: {
      key: "deontological_analysis",
      title: "Deontological Analysis",
      icon: "📜",
      color: "#7c3aed",
      description: "Examines duties, rules, and moral obligations",
    },
    virtue: {
      key: "virtue_ethics_analysis",
      title: "Virtue Ethics Analysis",
      icon: "🌱",
      color: "#059669",
      description: "Considers character traits and moral virtues",
    },
    aiSafety: {
      key: "ai_safety_note",
      title: "AI Safety Perspective",
      icon: "🛡️",
      color: "#dc2626",
      description: "Evaluates potential risks and safety concerns",
    },
    coreTension: {
      key: "core_tension",
      title: "Core Ethical Tension",
      icon: "⚡",
      color: "#f59e0b",
      description: "Identifies fundamental conflicts between approaches",
    },
  };

  // Parse and organize critique data
  const parsedSections = [];

  Object.values(critiqueSection).forEach((section) => {
    const content = critique[section.key];
    if (content && typeof content === "string" && content.trim()) {
      parsedSections.push({
        ...section,
        content: content.trim(),
        summary: extractSummary(content),
      });
    }
  });

  return parsedSections;
};

const extractSummary = (text) => {
  if (!text) return "";

  // Extract first sentence or first 120 characters
  const sentences = text.split(/[.!?]+/);
  const firstSentence = sentences[0]?.trim();

  if (firstSentence && firstSentence.length <= 120) {
    return firstSentence + ".";
  }

  // Fallback to character limit
  return text.substring(0, 120).trim() + (text.length > 120 ? "..." : "");
};

const getCritiqueKeyInsights = (parsedSections) => {
  return parsedSections.map((section) => ({
    perspective: section.title,
    insight: section.summary,
    icon: section.icon,
    color: section.color,
  }));
};

const generateCritiqueOverview = (parsedSections) => {
  if (!parsedSections || parsedSections.length === 0) return null;

  const coreTension = parsedSections.find((s) => s.key === "core_tension");
  const perspectives = parsedSections.filter((s) => s.key !== "core_tension");

  const agreementLevel =
    perspectives.length > 2
      ? "Multiple perspectives identified"
      : "Limited analysis available";
  const mainConflict = coreTension
    ? coreTension.summary
    : "No major conflicts identified";

  return {
    agreementLevel,
    mainConflict,
    perspectiveCount: perspectives.length,
    hasCoreTension: !!coreTension,
  };
};

// Individual critique section component
const CritiqueSectionCard = ({ section, isExpanded, onToggle }) => {
  return (
    <div style={styles.critiqueSectionCard}>
      <div style={styles.critiqueSectionHeader} onClick={onToggle}>
        <div style={styles.critiqueSectionTitleContainer}>
          <span style={styles.critiqueSectionIcon}>{section.icon}</span>
          <div style={styles.critiqueSectionTitleGroup}>
            <h4
              style={{ ...styles.critiqueSectionTitle, color: section.color }}
            >
              {section.title}
            </h4>
            <p style={styles.critiqueSectionDescription}>
              {section.description}
            </p>
          </div>
        </div>
        <button style={styles.critiqueSectionToggle}>
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {isExpanded && (
        <div style={styles.critiqueSectionContent}>
          <div
            style={{
              ...styles.critiqueSectionBorder,
              borderColor: section.color + "40",
            }}
          >
            <p style={styles.critiqueSectionText}>{section.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Oracle critique component with structured display
const OracleCritiqueCard = ({ critique, isVisible, decision }) => {
  const [globalExpanded, setGlobalExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());

  if (!critique) return null;

  // Parse the critique data
  const parsedSections = parseCritiqueData(critique);
  const keyInsights = getCritiqueKeyInsights(parsedSections || []);
  const overview = generateCritiqueOverview(parsedSections);

  const cardStyle = {
    ...styles.critiqueCard,
    ...(isVisible ? {} : styles.critiqueCardHidden),
  };

  const toggleSection = (sectionKey) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const toggleAllSections = () => {
    if (globalExpanded) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(parsedSections?.map((s) => s.key) || []));
    }
    setGlobalExpanded(!globalExpanded);
  };

  return (
    <div style={cardStyle}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitleWithButton}>
          <div style={styles.cardTitle}>
            <RotateCcw
              style={{ width: "20px", height: "20px", color: "#f97316" }}
            />
            Oracle Critique
            {parsedSections && parsedSections.length > 0 && (
              <span style={styles.critiquePerspectiveCount}>
                {parsedSections.length} perspectives
              </span>
            )}
          </div>
          <button style={styles.expandButton} onClick={toggleAllSections}>
            <Eye style={{ width: "16px", height: "16px" }} />
            {globalExpanded ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      <div style={styles.cardContent}>
        {parsedSections && parsedSections.length > 0 ? (
          <div style={styles.critiqueStructuredContainer}>
            {/* Quick Overview */}
            {overview && (
              <div style={styles.critiqueOverviewContainer}>
                <h4 style={styles.critiqueOverviewTitle}>
                  <span style={styles.critiqueOverviewIcon}>📋</span>
                  Quick Overview
                </h4>
                <div style={styles.critiqueOverviewContent}>
                  <div style={styles.critiqueOverviewRow}>
                    <span style={styles.critiqueOverviewLabel}>
                      Analysis Scope:
                    </span>
                    <span style={styles.critiqueOverviewValue}>
                      {overview.perspectiveCount} philosophical perspectives
                    </span>
                  </div>
                  <div style={styles.critiqueOverviewRow}>
                    <span style={styles.critiqueOverviewLabel}>
                      Primary Tension:
                    </span>
                    <span
                      style={{
                        ...styles.critiqueOverviewValue,
                        color: overview.hasCoreTension ? "#f59e0b" : "#10b981",
                      }}
                    >
                      {overview.mainConflict}
                    </span>
                  </div>
                  <div style={styles.critiqueOverviewRow}>
                    <span style={styles.critiqueOverviewLabel}>
                      Consensus Level:
                    </span>
                    <span style={styles.critiqueOverviewValue}>
                      {overview.agreementLevel}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights Summary */}
            <div style={styles.critiqueInsightsContainer}>
              <h4 style={styles.critiqueInsightsTitle}>Key Insights</h4>
              <div style={styles.critiqueInsightsList}>
                {keyInsights.map((insight, index) => (
                  <div key={index} style={styles.critiqueInsightItem}>
                    <span style={styles.critiqueInsightIcon}>
                      {insight.icon}
                    </span>
                    <div style={styles.critiqueInsightContent}>
                      <span
                        style={{
                          ...styles.critiqueInsightPerspective,
                          color: insight.color,
                        }}
                      >
                        {insight.perspective}:
                      </span>
                      <span style={styles.critiqueInsightText}>
                        {insight.insight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Sections */}
            <div style={styles.critiqueSectionsContainer}>
              <h4 style={styles.critiqueSectionsTitle}>Detailed Analysis</h4>
              {parsedSections.map((section) => (
                <CritiqueSectionCard
                  key={section.key}
                  section={section}
                  isExpanded={expandedSections.has(section.key)}
                  onToggle={() => toggleSection(section.key)}
                />
              ))}
            </div>

            {/* Decision Comparison */}
            {decision && (
              <div style={styles.critiqueComparisonContainer}>
                <h4 style={styles.critiqueComparisonTitle}>
                  Decision vs Critique Analysis
                </h4>
                <DecisionCritiqueDiff decision={decision} critique={critique} />
              </div>
            )}
          </div>
        ) : (
          // Fallback for unparseable critiques
          <div style={styles.critiqueFallbackContainer}>
            <div style={styles.critiqueFallbackHeader}>
              <AlertCircle style={styles.critiqueFallbackIcon} />
              <span style={styles.critiqueFallbackTitle}>
                Raw Critique Data
              </span>
            </div>
            <pre style={styles.critiqueJsonContainer}>
              {JSON.stringify(critique, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Decision vs Critique diff component
const DecisionCritiqueDiff = ({ decision, critique }) => {
  if (!decision || !critique) return null;

  // Simple diff visualization
  const critiqueSummary = Object.values(critique).join("\n\n");

  return (
    <div style={styles.diffContainer}>
      <div style={styles.diffSection}>
        <h5 style={styles.diffTitle}>Original Decision</h5>
        <div style={styles.diffOriginal}>
          <p style={styles.diffOriginalText}>{decision.justification}</p>
        </div>
      </div>
      <div style={styles.diffSection}>
        <h5 style={styles.diffTitle}>Oracle Analysis</h5>
        <div style={styles.diffAnalysis}>
          <p style={styles.diffAnalysisText}>
            {critiqueSummary.substring(0, 200)}...
          </p>
        </div>
      </div>
    </div>
  );
};

// Agent reflection component
const AgentReflectionCard = ({ reflection, isVisible }) => {
  if (!reflection) return null;

  const cardStyle = {
    ...styles.reflectionCard,
    ...(isVisible ? {} : styles.reflectionCardHidden),
  };

  return (
    <div style={cardStyle}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <RefreshCw
            style={{ width: "20px", height: "20px", color: "#06b6d4" }}
          />
          Agent Reflection
        </div>
      </div>
      <div style={styles.cardContent}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reflection.analysis_of_critique && (
            <div style={styles.reflectionSection}>
              <h4 style={styles.sectionTitle}>Analysis of Critique:</h4>
              <div style={styles.reflectionAnalysis}>
                <p style={styles.decisionJustificationText}>
                  {typeof reflection.analysis_of_critique === "string"
                    ? reflection.analysis_of_critique
                    : JSON.stringify(reflection.analysis_of_critique)}
                </p>
              </div>
            </div>
          )}

          {reflection.reasoning_for_change && (
            <div style={styles.reflectionSection}>
              <h4 style={styles.sectionTitle}>Reasoning for Change:</h4>
              <div style={styles.reflectionReasoning}>
                <p style={styles.decisionJustificationText}>
                  {typeof reflection.reasoning_for_change === "string"
                    ? reflection.reasoning_for_change
                    : JSON.stringify(reflection.reasoning_for_change)}
                </p>
              </div>
            </div>
          )}

          {reflection.proposed_constitution && (
            <div style={styles.reflectionSection}>
              <h4 style={styles.sectionTitle}>Proposed Principles:</h4>
              <div style={styles.principlesList}>
                {reflection.proposed_constitution.map((principle, index) => (
                  <div key={index} style={styles.principleItem}>
                    <span style={styles.principleBullet}>•</span>
                    <span style={styles.principleText}>{principle}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Execution logs component
const ExecutionLogs = ({ logs }) => {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Auto-scroll with smooth behavior
  useEffect(() => {
    if (logRef.current && logs.length > 0) {
      const scrollToBottom = () => {
        logRef.current?.scrollTo({
          top: logRef.current.scrollHeight,
          behavior: "smooth",
        });
      };

      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogMessageStyle = (type) => {
    switch (type) {
      case "error":
        return styles.logMessageError;
      case "warning":
        return styles.logMessageWarning;
      case "success":
        return styles.logMessageSuccess;
      default:
        return styles.logMessageInfo;
    }
  };

  return (
    <div style={styles.logsContainer}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <FileText style={{ width: "20px", height: "20px" }} />
          Execution Logs
        </div>
      </div>
      <div style={styles.cardContent}>
        <div ref={logRef} style={styles.logsContent}>
          {logs.length === 0 ? (
            <p style={styles.logsEmpty}>No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={styles.logEntry}>
                <span style={styles.logTimestamp}>[{log.timestamp}]</span>
                <div style={styles.logIcon}>{getLogIcon(log.type)}</div>
                <span style={getLogMessageStyle(log.type)}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Main AletheiaLearningLoop component
const AletheiaLearningLoop = ({
  agentId,
  onAgentUpdate,
  onAgentCreate,
  availableAgents,
  onAgentSelect,
  onAgentDelete,
}) => {
  // State management
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(1);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(null);

  // Cycle data state
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentDecision, setCurrentDecision] = useState(null);
  const [currentCritique, setCurrentCritique] = useState(null);
  const [currentReflection, setCurrentReflection] = useState(null);
  const [learningHistory, setLearningHistory] = useState([]);
  const [executionLogs, setExecutionLogs] = useState([]);

  // Refs
  const eventSourceRef = useRef(null);
  const currentCycleRef = useRef(null);
  const [activeTab, setActiveTab] = useState("current");
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Agent creation modal state
  const [isCreateAgentModalOpen, setIsCreateAgentModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  // Training review modal state
  const [showTrainingReview, setShowTrainingReview] = useState(false);
  const [trainingReviewData, setTrainingReviewData] = useState(null);

  // Load agent data on mount
  useEffect(() => {
    if (agentId) {
      loadAgentData();
    } else {
      setIsLoading(false);
    }
  }, [agentId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingInterval) {
        if (pollingInterval.interval) {
          clearInterval(pollingInterval.interval);
        }
        if (pollingInterval.timeout) {
          clearTimeout(pollingInterval.timeout);
        }
      }
    };
  }, [pollingInterval]);

  // Auto-switch to current tab when learning starts
  useEffect(() => {
    if (isRunning && phase !== "idle") {
      setActiveTab("current");
    }
  }, [isRunning, phase]);

  // Auto-scroll current cycle tab to bottom when new content appears
  useEffect(() => {
    if (activeTab === "current" && currentCycleRef.current) {
      const scrollToBottom = () => {
        currentCycleRef.current?.scrollTo({
          top: currentCycleRef.current.scrollHeight,
          behavior: "smooth",
        });
      };

      // Check if scroll indicator should be shown
      const checkScrollPosition = () => {
        if (currentCycleRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            currentCycleRef.current;
          const isScrolledToBottom =
            scrollHeight - scrollTop <= clientHeight + 20;
          const hasScrollableContent = scrollHeight > clientHeight + 50;
          setShowScrollIndicator(!isScrolledToBottom && hasScrollableContent);
        }
      };

      // Delay to ensure DOM updates are complete
      const timeoutId = setTimeout(() => {
        scrollToBottom();
        checkScrollPosition();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentScenario,
    currentDecision,
    currentCritique,
    currentReflection,
    activeTab,
  ]);

  // Handle scroll events for scroll indicator
  useEffect(() => {
    const handleScroll = () => {
      if (currentCycleRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          currentCycleRef.current;
        const isScrolledToBottom =
          scrollHeight - scrollTop <= clientHeight + 20;
        const hasScrollableContent = scrollHeight > clientHeight + 50;
        setShowScrollIndicator(!isScrolledToBottom && hasScrollableContent);
      }
    };

    const currentRef = currentCycleRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
      return () => currentRef.removeEventListener("scroll", handleScroll);
    }
  }, [activeTab]);

  const loadAgentData = async () => {
    try {
      setIsLoading(true);
      const [agentData, history] = await Promise.all([
        apiService.getAgent(agentId),
        apiService.getLearningHistory(agentId, 10),
      ]);
      setAgent(agentData);

      // Debug and fix learning history format
      console.log("Raw learning history:", history);

      // Ensure proper format for learning history
      const formattedHistory = (history || []).map((entry, index) => {
        console.log(`History entry ${index}:`, entry);

        // Handle different possible formats from backend
        const formattedEntry = {
          version_before:
            entry.version_before ||
            entry.versionBefore ||
            (entry.version ? entry.version - 1 : 1),
          version_after:
            entry.version_after || entry.versionAfter || entry.version || 1,
          timestamp:
            entry.timestamp || entry.createdAt || new Date().toISOString(),
          summary:
            entry.summary || entry.description || "Learning cycle completed",
          success:
            entry.success !== undefined
              ? entry.success
              : entry.status !== undefined
              ? entry.status === "success" || entry.status === "completed"
              : entry.failed !== undefined
              ? !entry.failed
              : entry.error === undefined, // Default to success if no error field
        };

        // Format timestamp for display
        if (formattedEntry.timestamp) {
          try {
            const date = new Date(formattedEntry.timestamp);
            formattedEntry.displayTimestamp = date.toLocaleString();
          } catch (e) {
            formattedEntry.displayTimestamp = formattedEntry.timestamp;
          }
        }

        console.log(`Formatted entry ${index}:`, formattedEntry);
        return formattedEntry;
      });

      setLearningHistory(formattedHistory);
    } catch (error) {
      console.error("Failed to load agent data:", error);
      setError("Failed to load agent data");
    } finally {
      setIsLoading(false);
    }
  };

  const addLogEntry = useCallback((message, type = "info") => {
    // Filter out heartbeat messages
    if (message.toLowerCase().includes('heartbeat')) {
      return;
    }
    
    const timestamp = new Date();
    setExecutionLogs((prev) => [...prev, { timestamp, message, type }]);
  }, []);

  // Track constitutional changes during learning
  const constitutionChangesRef = useRef([]);
  const startVersionRef = useRef(null);
  const totalDecisionsRef = useRef(0);
  const completedCyclesRef = useRef(0); // Track completed cycles for training review

  const compileTrainingReviewData = useCallback(() => {
    const changes = constitutionChangesRef.current;

    // Process changes to extract kept principles
    const processedChanges = changes.map((change, index) => {
      const previousConstitution =
        index === 0
          ? agent?.constitution || []
          : changes[index - 1].newConstitution || [];

      const added = change.newConstitution.filter(
        (p) => !previousConstitution.includes(p)
      );
      const removed = previousConstitution.filter(
        (p) => !change.newConstitution.includes(p)
      );
      const kept = change.newConstitution.filter((p) =>
        previousConstitution.includes(p)
      );

      return {
        ...change,
        added,
        removed,
        kept,
        fromVersion: change.fromVersion || startVersionRef.current + index,
        toVersion: change.toVersion || startVersionRef.current + index + 1,
      };
    });

    // Use the ref to track total cycles completed
    const cyclesCompleted = completedCyclesRef.current || currentCycle || cycles;
    
    return {
      cyclesCompleted: cyclesCompleted,
      constitutionChanges: processedChanges,
      totalDecisions: totalDecisionsRef.current,
      finalVersion: agent?.version || 1,
      learningHistory,
      agentName: agent?.name,
    };
  }, [agent, currentCycle, learningHistory, cycles]);

  const showTrainingReviewModal = useCallback(async () => {
    // First reload the agent data to get the latest history
    await loadAgentData();
    
    // If we don't have detailed constitution changes from SSE, build them from history
    if (constitutionChangesRef.current.length === 0 && learningHistory.length > 0) {
      // Get the most recent learning sessions
      const recentSessions = learningHistory.slice(0, cycles);
      recentSessions.reverse(); // Put in chronological order
      
      recentSessions.forEach((session, index) => {
        if (session.agent_reflection && session.agent_reflection.proposed_constitution) {
          constitutionChangesRef.current.push({
            scenario: session.scenario?.title || `Cycle ${index + 1}`,
            newConstitution: session.agent_reflection.proposed_constitution,
            reasoning: session.agent_reflection.reasoning_for_change || "No reasoning provided",
            fromVersion: session.agent_version,
            toVersion: session.agent_version + 1,
          });
          totalDecisionsRef.current += 1;
        }
      });
    }
    
    const reviewData = compileTrainingReviewData();
    setTrainingReviewData(reviewData);
    setShowTrainingReview(true);
    // Reset tracking refs
    constitutionChangesRef.current = [];
    startVersionRef.current = null;
    totalDecisionsRef.current = 0;
  }, [compileTrainingReviewData, loadAgentData, learningHistory, cycles]);

  // Agent creation functions
  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) {
      return;
    }

    try {
      setIsCreatingAgent(true);
      const initialConstitution = [
        "Always prioritize human welfare and dignity",
        "Consider the consequences of actions on all stakeholders",
        "Respect individual rights and autonomy",
        "Act with transparency and honesty",
        "Minimize harm while maximizing benefit",
      ];

      const newAgent = await apiService.createAgent(
        initialConstitution,
        newAgentName.trim()
      );

      if (onAgentCreate) {
        onAgentCreate(newAgent);
      }

      setIsCreateAgentModalOpen(false);
      setNewAgentName("");
    } catch (error) {
      console.error("Failed to create agent:", error);
      setError(`Failed to create agent: ${error.message}`);
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const handleCancelCreateAgent = () => {
    setIsCreateAgentModalOpen(false);
    setNewAgentName("");
  };

  const openCreateAgentModal = () => {
    setIsCreateAgentModalOpen(true);
    setNewAgentName("");
  };

  const handleDeleteAgent = async (agentToDelete, event) => {
    // Stop event propagation to prevent card click
    if (event) {
      event.stopPropagation();
    }

    const agentName = agentToDelete.name || `Agent v${agentToDelete.version}`;

    if (
      !window.confirm(
        `Are you sure you want to delete "${agentName}"? This action cannot be undone and will delete all learning history.`
      )
    ) {
      return;
    }

    try {
      await apiService.deleteAgent(agentToDelete.agent_id);

      // Call parent's delete handler to update the UI
      if (onAgentDelete) {
        onAgentDelete(agentToDelete.agent_id);
      }

      addLogEntry(`Agent "${agentName}" deleted successfully`, "info");
    } catch (error) {
      console.error("Failed to delete agent:", error);
      addLogEntry(`Failed to delete agent: ${error.message}`, "error");
      setError(`Failed to delete agent: ${error.message}`);
    }
  };

  const startLearningCycle = async () => {
    if (!agentId) return;

    try {
      setIsRunning(true);
      setCurrentCycle(1);
      setProgress(10);
      setPhase("scenario_loading");
      setError(null);
      setExecutionLogs([]);
      setCurrentScenario(null);
      setCurrentDecision(null);
      setCurrentCritique(null);
      setCurrentReflection(null);

      addLogEntry(
        `Starting ${cycles} learning cycles for agent ${agentId}`,
        "info"
      );

      // Initialize tracking for training review
      startVersionRef.current = agent?.version || 1;
      constitutionChangesRef.current = [];
      totalDecisionsRef.current = 0;
      completedCyclesRef.current = 0;

      // Setup SSE connection for real-time updates with cycles parameter
      eventSourceRef.current = new EventSource(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8080"
        }/api/aletheia/stream/learning/${agentId}?cycles=${cycles}`
      );

      eventSourceRef.current.onmessage = (event) => {
        try {
          console.log("SSE Raw message received:", event.data);
          const data = JSON.parse(event.data);
          console.log("SSE Parsed data:", data);
          handleLearningUpdate(data);
        } catch (error) {
          console.error(
            "Failed to parse SSE data:",
            error,
            "Raw data:",
            event.data
          );
          addLogEntry(`SSE Parse Error: ${error.message}`, "error");
        }
      };

      eventSourceRef.current.onopen = (event) => {
        console.log("SSE connection opened:", event);
        addLogEntry("Real-time connection established", "info");
      };

      eventSourceRef.current.onerror = (error) => {
        console.error("SSE connection error:", error);
        addLogEntry(
          "Real-time connection lost - falling back to polling",
          "warning"
        );

        // Close the failed connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // The polling mechanism will handle updates now
        addLogEntry(
          "Using polling for updates instead of real-time events",
          "info"
        );
      };

      // Start the learning cycle via API
      try {
        await apiService.startLearningCycle(agentId, cycles);
      } catch (error) {
        console.error("Failed to start learning cycle:", error);
        addLogEntry(`Failed to start learning cycle: ${error.message}`, "error");
      }

      // Fallback polling mechanism in case SSE doesn't work properly
      let cyclesCompleted = 0;
      const startVersion = agent?.version || 1;

      const pollInterval = setInterval(async () => {
        try {
          const updatedAgent = await apiService.getAgent(agentId);
          if (updatedAgent.version !== agent?.version) {
            console.log(
              "Agent version changed via polling:",
              updatedAgent.version
            );
            setAgent(updatedAgent);
            cyclesCompleted = updatedAgent.version - startVersion;
            
            // Track the cycles completed
            completedCyclesRef.current = cyclesCompleted;
            totalDecisionsRef.current = cyclesCompleted; // Assume 1 decision per cycle for polling
            
            // Track constitution changes for polling mode
            if (updatedAgent.constitution) {
              const change = {
                scenario: `Cycle ${cyclesCompleted}`,
                newConstitution: updatedAgent.constitution,
                reasoning: "Constitution updated via polling",
                fromVersion: updatedAgent.version - 1,
                toVersion: updatedAgent.version,
              };
              constitutionChangesRef.current.push(change);
            }
            
            addLogEntry(
              `Agent updated to version ${updatedAgent.version} (via polling) - Cycle ${cyclesCompleted}/${cycles}`,
              "success"
            );

            // Check if we've completed all requested cycles
            if (cyclesCompleted >= cycles) {
              addLogEntry(
                `All ${cycles} learning cycles complete (via polling)`,
                "success"
              );
              setIsRunning(false);
              setPhase("idle");
              clearInterval(pollInterval);
              setPollingInterval(null);
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
              }
              loadAgentData(); // Refresh history
              // Show training review modal
              showTrainingReviewModal();
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 2000); // Poll every 2 seconds

      // Add timeout to prevent infinite polling (max 10 minutes)
      const timeoutId = setTimeout(() => {
        addLogEntry(
          "Learning cycle timeout - stopping automatically",
          "warning"
        );
        setIsRunning(false);
        setPhase("idle");
        clearInterval(pollInterval);
        setPollingInterval(null);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      }, 600000); // 10 minutes timeout

      setPollingInterval({ interval: pollInterval, timeout: timeoutId });
    } catch (error) {
      console.error("Failed to start learning cycle:", error);
      setError(error.message);
      addLogEntry(`Error: ${error.message}`, "error");
      setIsRunning(false);
    }
  };

  const handleLearningUpdate = (data) => {
    console.log("Processing learning update:", data);
    const { type, payload } = data;
    
    // Skip logging heartbeat messages
    if (type !== 'heartbeat') {
      // Format the event type for better readability
      const formattedType = type.replace(/_/g, ' ').toLowerCase();
      addLogEntry(`Event: ${formattedType}`, "info");
    }

    switch (type) {
      case "cycle_started":
        setCurrentCycle(payload.cycle);
        completedCyclesRef.current = payload.cycle - 1; // Track completed cycles
        setPhase("scenario_loading");
        setProgress(10);
        addLogEntry(`Cycle ${payload.cycle} started`, "info");
        break;

      case "scenario_loaded":
        setCurrentScenario(payload.scenario);
        setPhase("decision_making");
        setProgress(25);
        addLogEntry(`Scenario loaded: ${payload.scenario.title}`, "info");
        break;

      case "decision_made":
        setCurrentDecision(payload.decision);
        setPhase("critique_generation");
        setProgress(50);
        addLogEntry(`Decision made: ${payload.decision.action}`, "success");
        totalDecisionsRef.current += 1;
        break;

      case "critique_generated":
        setCurrentCritique(payload.critique);
        setPhase("reflection");
        setProgress(75);
        addLogEntry("Oracle critique generated", "info");
        break;

      case "reflection_complete":
        setCurrentReflection(payload.reflection);
        setPhase("constitution_update");
        setProgress(90);
        addLogEntry("Agent reflection complete", "info");

        // Track constitution changes if any
        if (payload.reflection && payload.reflection.proposed_constitution) {
          const change = {
            scenario: currentScenario?.title,
            newConstitution: payload.reflection.proposed_constitution,
            reasoning: payload.reflection.reasoning_for_change,
            evaluation: payload.reflection.evaluation,
            rejected: payload.reflection.change_rejected,
            warnings: payload.reflection.evaluation?.warnings,
          };
          constitutionChangesRef.current.push(change);
        }
        break;

      case "constitution_updated":
        setAgent((prev) => ({ ...prev, version: payload.agent.version }));
        setProgress(100);
        setPhase("complete");
        addLogEntry(
          `Constitution updated to version ${payload.agent.version}`,
          "success"
        );
        if (onAgentUpdate) onAgentUpdate(payload.agent);
        break;

      case "cycle_complete":
        addLogEntry(`Cycle ${payload.cycle} complete`, "success");
        completedCyclesRef.current = payload.cycle; // Update completed cycles
        loadAgentData(); // Refresh history

        // Check if we've completed all requested cycles
        if (payload.cycle >= cycles) {
          setIsRunning(false);
          setPhase("idle");
          addLogEntry(
            `All ${cycles} learning cycles complete (via SSE)`,
            "success"
          );
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          // Clear polling interval if it exists
          if (pollingInterval) {
            if (pollingInterval.interval) {
              clearInterval(pollingInterval.interval);
            }
            if (pollingInterval.timeout) {
              clearTimeout(pollingInterval.timeout);
            }
            setPollingInterval(null);
          }
          // Show training review modal
          showTrainingReviewModal();
        } else {
          // Reset for next cycle
          setCurrentCycle(payload.cycle + 1);
          setProgress(10);
          setPhase("scenario_loading");
          addLogEntry(
            `Starting cycle ${payload.cycle + 1} of ${cycles}`,
            "info"
          );
        }
        break;

      case "error":
        setError(payload.message);
        addLogEntry(`Error: ${payload.message}`, "error");
        setIsRunning(false);
        setPhase("idle");
        break;

      case "all_cycles_complete":
        addLogEntry(`All ${payload.total_cycles} learning cycles complete`, "success");
        setIsRunning(false);
        setPhase("idle");
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        // Clear polling interval if it exists
        if (pollingInterval) {
          if (pollingInterval.interval) {
            clearInterval(pollingInterval.interval);
          }
          if (pollingInterval.timeout) {
            clearTimeout(pollingInterval.timeout);
          }
          setPollingInterval(null);
        }
        // Show training review modal
        showTrainingReviewModal();
        break;

      default:
        console.log("Unknown update type:", type);
    }
  };

  const stopLearningCycle = () => {
    setIsRunning(false);
    setPhase("idle");
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (pollingInterval) {
      if (pollingInterval.interval) {
        clearInterval(pollingInterval.interval);
      }
      if (pollingInterval.timeout) {
        clearTimeout(pollingInterval.timeout);
      }
      setPollingInterval(null);
    }
    addLogEntry("Learning cycle stopped by user", "warning");
  };

  const resetCycle = () => {
    setCurrentCycle(0);
    setProgress(0);
    setPhase("idle");
    setCurrentScenario(null);
    setCurrentDecision(null);
    setCurrentCritique(null);
    setCurrentReflection(null);
    setExecutionLogs([]);
    setError(null);
    if (pollingInterval) {
      if (pollingInterval.interval) {
        clearInterval(pollingInterval.interval);
      }
      if (pollingInterval.timeout) {
        clearTimeout(pollingInterval.timeout);
      }
      setPollingInterval(null);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.skeletonCard}>
          <div style={styles.cardHeader}>
            <div style={styles.skeletonHeader}>
              <div style={{ ...styles.skeleton, ...styles.skeletonIcon }} />
              <div style={{ ...styles.skeleton, ...styles.skeletonTitle }} />
            </div>
          </div>
          <div style={{ ...styles.cardContent, ...styles.skeletonContent }}>
            <div style={{ ...styles.skeleton, ...styles.skeletonLine }} />
            <div style={{ ...styles.skeleton, ...styles.skeletonLineShort }} />
            <div style={{ ...styles.skeleton, ...styles.skeletonButton }} />
          </div>
        </div>
      </div>
    );
  }

  // No agent selected state
  if (!agentId) {
    return (
      <div style={styles.container}>
        <Card style={styles.placeholderCard}>
          <CardContent style={styles.placeholderContent}>
            <Brain style={styles.placeholderIcon} />
            <h3 style={styles.placeholderTitle}>No Agent Selected</h3>
            <p style={styles.placeholderText}>
              Select an existing agent from the dropdown above, or create a new
              agent to begin the constitutional learning process.
            </p>

            {availableAgents && availableAgents.length > 0 && (
              <div style={styles.agentList}>
                <h4 style={styles.agentListTitle}>Available Agents:</h4>
                <div style={styles.agentGrid}>
                  {availableAgents.slice(0, 6).map((agent) => (
                    <div
                      key={agent.agent_id}
                      style={styles.agentCard}
                      onClick={() => onAgentSelect && onAgentSelect(agent)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(35, 217, 217, 0.1)";
                        e.target.style.borderColor = "#23d9d9";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(35, 217, 217, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(17, 24, 39, 0.6)";
                        e.target.style.borderColor = "rgba(75, 85, 99, 0.3)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      <div style={styles.agentCardHeader}>
                        <User style={styles.agentCardIcon} />
                        <span style={styles.agentCardName}>
                          {agent.name || `Agent v${agent.version}`}
                        </span>
                      </div>
                      <div style={styles.agentCardInfo}>
                        <span style={styles.agentCardDetails}>
                          {agent.constitution?.length || 0} principles
                        </span>
                        <button
                          style={styles.deleteButton}
                          onClick={(e) => handleDeleteAgent(agent, e)}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor =
                              "rgba(239, 68, 68, 0.2)";
                            e.target.style.color = "#ef4444";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "#6b7280";
                          }}
                          title={`Delete ${
                            agent.name || `Agent v${agent.version}`
                          }`}
                        >
                          <Trash2 style={styles.deleteIcon} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {availableAgents.length > 6 && (
                  <p style={styles.moreAgentsText}>
                    +{availableAgents.length - 6} more agents available in
                    dropdown
                  </p>
                )}
              </div>
            )}

            <Button onClick={openCreateAgentModal} style={styles.createButton}>
              <Plus style={styles.buttonIcon} />
              Create New Agent
            </Button>
          </CardContent>
        </Card>

        {/* Create Agent Modal */}
        {isCreateAgentModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Create New Agent</h3>
                <button
                  onClick={handleCancelCreateAgent}
                  style={styles.modalCloseButton}
                  onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                  onMouseLeave={(e) => (e.target.style.color = "#8f9aa6")}
                >
                  ✕
                </button>
              </div>
              <div style={styles.modalContent}>
                <label style={styles.modalLabel}>Agent Name *</label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="Enter a unique name for your agent"
                  style={styles.modalInput}
                  onFocus={(e) => (e.target.style.borderColor = "#23d9d9")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(35, 217, 217, 0.3)")
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && newAgentName.trim()) {
                      handleCreateAgent();
                    }
                  }}
                  disabled={isCreatingAgent}
                  autoFocus
                />
                <p style={styles.modalDescription}>
                  Choose a descriptive name that helps you identify this agent's
                  purpose (e.g., "Medical Ethics Advisor", "Customer Service
                  Bot", "Legal Consultant").
                </p>
              </div>
              <div style={styles.modalActions}>
                <button
                  onClick={handleCancelCreateAgent}
                  style={styles.modalCancelButton}
                  disabled={isCreatingAgent}
                  onMouseEnter={(e) => {
                    if (!isCreatingAgent) {
                      e.target.style.backgroundColor = "rgba(75, 85, 99, 0.1)";
                      e.target.style.borderColor = "rgba(75, 85, 99, 0.8)";
                      e.target.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.borderColor = "rgba(75, 85, 99, 0.5)";
                    e.target.style.color = "#9ca3af";
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAgent}
                  style={{
                    ...styles.modalCreateButton,
                    opacity: !newAgentName.trim() || isCreatingAgent ? 0.5 : 1,
                    cursor:
                      !newAgentName.trim() || isCreatingAgent
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={!newAgentName.trim() || isCreatingAgent}
                  onMouseEnter={(e) => {
                    if (!(!newAgentName.trim() || isCreatingAgent)) {
                      e.target.style.backgroundColor = "#1fa8a8";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#23d9d9";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  {isCreatingAgent ? "Creating..." : "Create Agent"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Control Panel */}
      <Card style={styles.controlCard}>
        <CardHeader>
          <CardTitle style={styles.controlHeader}>
            <div style={styles.controlTitle}>
              <Zap style={styles.titleIcon} />
              Aletheia Learning Loop
              {agent && (
                <Badge
                  variant="outline"
                  style={{
                    ...styles.agentBadge,
                    ...(isRunning ? styles.agentBadgeActive : {}),
                  }}
                >
                  Agent v{agent.version}
                </Badge>
              )}
            </div>
            {isRunning && (
              <div style={styles.learningActiveIndicator}>
                <Activity style={styles.learningActiveIcon} />
                Learning Active
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Configuration Controls */}
          <div style={styles.configControls}>
            <div style={styles.cyclesContainer}>
              <label htmlFor="cycles" style={styles.cyclesLabel}>
                Cycles:
              </label>
              <input
                id="cycles"
                type="number"
                min="1"
                max="10"
                value={cycles}
                onChange={(e) => setCycles(parseInt(e.target.value) || 1)}
                disabled={isRunning}
                style={{
                  ...styles.cyclesInput,
                  ...(isRunning ? { opacity: 0.6, cursor: "not-allowed" } : {}),
                }}
              />
            </div>

            <div style={styles.buttonGroup}>
              {!isRunning ? (
                <button
                  onClick={startLearningCycle}
                  disabled={!agentId}
                  style={{
                    ...styles.startButton,
                    ...(!agentId
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}),
                  }}
                >
                  <Play style={styles.buttonIcon} />
                  Start Learning
                </button>
              ) : (
                <button onClick={stopLearningCycle} style={styles.stopButton}>
                  <Square style={styles.buttonIcon} />
                  Stop
                </button>
              )}

              <button
                onClick={resetCycle}
                disabled={isRunning}
                style={{
                  ...styles.resetButton,
                  ...(isRunning ? { opacity: 0.6, cursor: "not-allowed" } : {}),
                }}
              >
                <RefreshCw style={styles.buttonIcon} />
                Reset
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {(isRunning || phase !== "idle") && (
            <LearningProgressBar
              progress={progress}
              phase={phase}
              cycleNumber={currentCycle}
              totalCycles={cycles}
            />
          )}

          {/* Error Display */}
          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle style={styles.alertIcon} />
              <div style={styles.alertDescription}>{error}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Cycle Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        style={styles.tabsContainer}
      >
        <div style={styles.tabsList}>
          <button
            onClick={() => setActiveTab("current")}
            style={{
              ...styles.tabTrigger,
              ...(activeTab === "current" ? styles.tabTriggerActive : {}),
            }}
          >
            <Target style={styles.tabIcon} />
            Current Cycle
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              ...styles.tabTrigger,
              ...(activeTab === "history" ? styles.tabTriggerActive : {}),
            }}
          >
            <History style={styles.tabIcon} />
            Learning History
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            style={{
              ...styles.tabTrigger,
              ...(activeTab === "logs" ? styles.tabTriggerActive : {}),
            }}
          >
            <FileText style={styles.tabIcon} />
            Logs
          </button>
        </div>

        {/* Current Cycle Tab */}
        {activeTab === "current" && (
          <div style={styles.tabContent}>
            <LearningLoopCLI
              phase={phase}
              currentCycle={currentCycle}
              cycles={cycles}
              progress={progress}
              currentScenario={currentScenario}
              currentDecision={currentDecision}
              currentCritique={currentCritique}
              currentReflection={currentReflection}
              executionLogs={executionLogs}
              error={error}
            />
          </div>
        )}

        {/* Learning History Tab */}
        {activeTab === "history" && (
          <div style={styles.historyCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <History style={{ width: "20px", height: "20px" }} />
                Learning History
              </div>
            </div>
            <div style={styles.cardContent}>
              {learningHistory.length === 0 ? (
                <div style={styles.historyEmpty}>
                  <History style={styles.historyEmptyIcon} />
                  <p style={styles.historyEmptyText}>No learning history yet</p>
                </div>
              ) : (
                <div style={styles.historyList}>
                  {learningHistory.map((entry, index) => (
                    <div key={index} style={styles.historyEntry}>
                      <div style={styles.historyEntryHeader}>
                        <div style={styles.historyEntryInfo}>
                          <div style={styles.historyBadge}>
                            v{entry.version_before} → v{entry.version_after}
                          </div>
                          <span style={styles.historyTimestamp}>
                            {entry.displayTimestamp || entry.timestamp}
                          </span>
                        </div>
                        <div
                          style={
                            entry.success
                              ? styles.historyStatusSuccess
                              : styles.historyStatusFailed
                          }
                        >
                          {entry.success ? "Success" : "Failed"}
                        </div>
                      </div>
                      <p style={styles.historySummary}>{entry.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Execution Logs Tab */}
        {activeTab === "logs" && <ExecutionLogs logs={executionLogs} />}
      </Tabs>

      {/* Training Review Modal */}
      <TrainingReviewModal
        isOpen={showTrainingReview}
        onClose={() => setShowTrainingReview(false)}
        trainingData={trainingReviewData}
        agentId={agentId}
        onNavigateToConstitution={() => {
          // This will be handled by the parent Layout component
          if (window.dispatchEvent) {
            window.dispatchEvent(
              new CustomEvent("navigate-to-constitution", {
                detail: { agentId },
              })
            );
          }
        }}
      />
    </div>
  );
};

const styles = {
  // Main container styles
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  // Control panel styles
  controlCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
    borderRadius: "12px",
  },

  controlHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  controlTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  titleIcon: {
    width: "20px",
    height: "20px",
    color: "#1e90ff",
  },

  agentBadge: {
    transition: "all 0.3s ease",
  },

  agentBadgeActive: {
    animation: "pulse 2s infinite",
    backgroundColor: "rgba(30, 144, 255, 0.1)",
  },

  learningActiveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "14px",
    color: "#1e90ff",
  },

  learningActiveIcon: {
    width: "16px",
    height: "16px",
    animation: "spin 1s linear infinite",
  },

  configControls: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "15px",
  },

  cyclesContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  cyclesLabel: {
    fontSize: "14px",
    fontWeight: "500",
  },

  cyclesInput: {
    width: "64px",
    padding: "4px 8px",
    border: "1px solid rgba(75, 85, 99, 0.3)",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    color: "#fff",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },

  cyclesInputFocus: {
    borderColor: "#1e90ff",
    boxShadow: "0 0 0 2px rgba(30, 144, 255, 0.2)",
  },

  buttonGroup: {
    display: "flex",
    gap: "8px",
  },

  startButton: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background-color 0.2s ease",
  },

  startButtonHover: {
    backgroundColor: "#1c7ed6",
  },

  stopButton: {
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  resetButton: {
    backgroundColor: "transparent",
    color: "#8f9aa6",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  buttonIcon: {
    width: "16px",
    height: "16px",
  },

  // Progress bar styles
  progressContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  progressHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "14px",
  },

  progressBar: {
    width: "100%",
    height: "12px",
    backgroundColor: "rgba(75, 85, 99, 0.3)",
    borderRadius: "6px",
    overflowY: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#1e90ff",
    transition: "width 0.3s ease",
    borderRadius: "6px",
  },

  phaseIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: "8px",
  },

  phaseDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },

  phaseEmoji: {
    fontSize: "24px",
  },

  phaseIcon: {
    width: "16px",
    height: "16px",
  },

  phaseName: {
    fontWeight: "500",
    fontSize: "14px",
  },

  // Tab styles
  tabsContainer: {
    width: "100%",
  },

  tabsList: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    width: "100%",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: "8px",
    padding: "4px",
    height: "auto",
  },

  tabTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "6px",
    color: "#8f9aa6",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  tabTriggerActive: {
    backgroundColor: "rgba(35, 217, 217, 0.2)",
    color: "#23d9d9",
  },

  tabIcon: {
    width: "16px",
    height: "16px",
  },

  // Current cycle tab styles (Compacted)
  currentCycleContainer: {
    position: "relative",
  },

  currentCycleContent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px", // MODIFIED: Was 16px
    maxHeight: "60vh",
    overflowY: "auto",
    scrollBehavior: "smooth",
    border: "1px solid rgba(75, 85, 99, 0.3)",
    borderRadius: "8px",
    padding: "12px", // MODIFIED: Was 16px
    minHeight: "400px",
  },

  // Card styles (Compacted)
  scenarioCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(30, 144, 255, 0.3)",
    borderLeft: "4px solid #1e90ff",
    borderRadius: "8px", // MODIFIED: Was 12px
    transition: "all 0.5s ease-in-out",
    transform: "translateX(0)",
    opacity: 1,
  },

  scenarioCardHidden: {
    transform: "translateX(100%)",
    opacity: 0,
  },

  scenarioMetadata: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  complexityBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  timeBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "rgba(75, 85, 99, 0.2)",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    border: "1px solid rgba(75, 85, 99, 0.3)",
  },

  frameworksList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "8px",
  },

  frameworkBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "500",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },

  stakeholdersList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "8px",
  },

  stakeholderBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "500",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    textTransform: "capitalize",
  },

  moralWeightContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "8px",
  },

  moralWeightLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#9ca3af",
    minWidth: "80px",
  },

  moralWeightBar: {
    flex: 1,
    height: "6px",
    backgroundColor: "rgba(75, 85, 99, 0.3)",
    borderRadius: "3px",
    overflow: "hidden",
  },

  moralWeightFill: {
    height: "100%",
    backgroundColor: "#ef4444",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },

  moralWeightValue: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#ef4444",
    minWidth: "35px",
    textAlign: "right",
  },

  decisionCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(147, 51, 234, 0.3)",
    borderLeft: "4px solid #9333ea",
    borderRadius: "8px", // MODIFIED: Was 12px
    transition: "all 0.5s ease-in-out",
    transform: "translateY(0)",
    opacity: 1,
  },

  decisionCardHidden: {
    transform: "translateY(32px)",
    opacity: 0,
  },

  critiqueCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(249, 115, 22, 0.3)",
    borderLeft: "4px solid #f97316",
    borderRadius: "8px", // MODIFIED: Was 12px
    transition: "all 0.5s ease-in-out",
    transform: "translateY(0)",
    opacity: 1,
  },

  critiqueCardHidden: {
    transform: "translateY(32px)",
    opacity: 0,
  },

  reflectionCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(6, 182, 212, 0.3)",
    borderLeft: "4px solid #06b6d4",
    borderRadius: "8px", // MODIFIED: Was 12px
    transition: "all 0.5s ease-in-out",
    transform: "translateY(0)",
    opacity: 1,
  },

  reflectionCardHidden: {
    transform: "translateY(32px)",
    opacity: 0,
  },

  cardHeader: {
    padding: "10px 16px 0 16px", // MODIFIED: Was 16px 20px 0 20px
  },

  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px", // MODIFIED: Was 8px
    margin: 0,
    fontSize: "15px", // MODIFIED: Was 16px
    fontWeight: "600",
    color: "#fff",
  },

  cardTitleWithButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardContent: {
    padding: "10px 16px 12px 16px", // MODIFIED: Was 16px 20px 20px 20px
  },

  cardSection: {
    marginBottom: "12px", // MODIFIED: Was 16px
  },

  sectionTitle: {
    fontWeight: "600",
    fontSize: "13px", // MODIFIED: Was 14px
    color: "#d1d5db",
    marginBottom: "6px", // MODIFIED: Was 8px
  },

  sectionContent: {
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  // Scenario card specific styles
  scenarioTitle: {
    fontWeight: "bold",
    fontSize: "16px", // MODIFIED: Was 18px
    marginBottom: "8px",
    color: "#fff",
  },

  scenarioDescription: {
    color: "#9ca3af",
    marginBottom: "12px", // MODIFIED: Was 16px
    lineHeight: 1.5, // MODIFIED: Was 1.6
  },

  actionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  actionItem: {
    fontSize: "14px",
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    padding: "8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },

  actionNumber: {
    color: "#1e90ff",
    fontWeight: "500",
    flexShrink: 0,
  },

  // Decision card specific styles (Compacted)
  decisionAction: {
    backgroundColor: "rgba(147, 51, 234, 0.1)",
    border: "1px solid rgba(147, 51, 234, 0.3)",
    borderRadius: "6px", // MODIFIED: Was 8px
    padding: "10px", // MODIFIED: Was 12px
  },

  decisionActionText: {
    fontWeight: "500",
    color: "#c084fc",
    fontSize: "14px",
  },

  decisionJustification: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: "6px", // MODIFIED: Was 8px
    padding: "10px", // MODIFIED: Was 12px
  },

  decisionJustificationText: {
    fontSize: "13px", // MODIFIED: Was 14px
    color: "#d1d5db",
    lineHeight: 1.5,
  },

  // Critique card specific styles (Compacted)
  expandButton: {
    backgroundColor: "transparent",
    border: "1px solid rgba(75, 85, 99, 0.3)",
    borderRadius: "4px",
    padding: "4px 8px",
    color: "#8f9aa6",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  critiqueJsonContainer: {
    backgroundColor: "#1f2937",
    color: "#10b981",
    padding: "10px", // MODIFIED: Was 16px
    borderRadius: "6px", // MODIFIED: Was 8px
    fontSize: "11px", // MODIFIED: Was 12px
    overflowY: "auto",
    maxHeight: "250px", // MODIFIED: Was 384px
    fontFamily: "monospace",
  },

  critiqueSummary: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  critiquePreview: {
    fontSize: "14px",
    color: "#9ca3af",
    marginTop: "4px",
  },

  critiqueExpandNote: {
    fontSize: "12px",
    color: "#6b7280",
    fontStyle: "italic",
  },

  critiquePerspectiveCount: {
    fontSize: "12px",
    color: "#8f9aa6",
    backgroundColor: "rgba(35, 217, 217, 0.2)",
    border: "1px solid #23d9d9",
    borderRadius: "12px",
    padding: "2px 8px",
    marginLeft: "8px",
    fontWeight: "500",
  },

  critiqueStructuredContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px", // MODIFIED: Was 20px
  },

  critiqueOverviewContainer: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "8px",
    padding: "12px", // MODIFIED: Was 16px
  },

  critiqueOverviewTitle: {
    fontSize: "14px", // MODIFIED: Was 16px
    fontWeight: "600",
    color: "#3b82f6",
    marginBottom: "8px", // MODIFIED: Was 12px
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  critiqueOverviewIcon: {
    fontSize: "16px", // MODIFIED: Was 18px
  },

  critiqueOverviewContent: {
    display: "flex",
    flexDirection: "column",
    gap: "6px", // MODIFIED: Was 8px
  },

  critiqueOverviewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0", // MODIFIED: Was 6px 0
  },

  critiqueOverviewLabel: {
    fontSize: "12px", // MODIFIED: Was 13px
    color: "#8f9aa6",
    fontWeight: "500",
  },

  critiqueOverviewValue: {
    fontSize: "12px", // MODIFIED: Was 13px
    color: "#d1d5db",
    fontWeight: "600",
    textAlign: "right",
    letterSpacing: "0.2px",
    lineHeight: "1.4",
  },

  critiqueInsightsContainer: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    borderRadius: "8px",
    padding: "12px", // MODIFIED: Was 16px
    border: "1px solid rgba(75, 85, 99, 0.3)",
  },

  critiqueInsightsTitle: {
    fontSize: "14px", // MODIFIED: Was 16px
    fontWeight: "600",
    color: "#fff",
    marginBottom: "8px", // MODIFIED: Was 12px
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  critiqueInsightsList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px", // MODIFIED: Was 8px
  },

  critiqueInsightItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px", // MODIFIED: Was 10px
    padding: "6px", // MODIFIED: Was 8px
    backgroundColor: "rgba(26, 31, 37, 0.6)",
    borderRadius: "6px",
    border: "1px solid rgba(75, 85, 99, 0.2)",
  },

  critiqueInsightIcon: {
    fontSize: "14px", // MODIFIED: Was 16px
    flexShrink: 0,
    marginTop: "2px",
  },

  critiqueInsightContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },

  critiqueInsightPerspective: {
    fontSize: "12px", // MODIFIED: Was 13px
    fontWeight: "600",
  },

  critiqueInsightText: {
    fontSize: "12px", // MODIFIED: Was 13px
    color: "#b0bec5",
    lineHeight: "1.5",
    letterSpacing: "0.2px",
  },

  critiqueSectionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px", // MODIFIED: Was 12px
  },

  critiqueSectionsTitle: {
    fontSize: "14px", // MODIFIED: Was 16px
    fontWeight: "600",
    color: "#fff",
    marginBottom: "4px", // MODIFIED: Was 8px
  },

  critiqueSectionCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(75, 85, 99, 0.3)",
    borderRadius: "8px",
    overflow: "hidden",
  },

  critiqueSectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px", // MODIFIED: Was 12px 16px
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(35, 217, 217, 0.05)",
    },
  },

  critiqueSectionTitleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // MODIFIED: Was 12px
    flex: 1,
  },

  critiqueSectionIcon: {
    fontSize: "18px", // MODIFIED: Was 20px
    flexShrink: 0,
  },

  critiqueSectionTitleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  critiqueSectionTitle: {
    fontSize: "13px", // MODIFIED: Was 14px
    fontWeight: "700",
    margin: 0,
    letterSpacing: "0.4px",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },

  critiqueSectionDescription: {
    fontSize: "11px",
    color: "#8f9aa6",
    margin: 0,
    fontStyle: "italic",
  },

  critiqueSectionToggle: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "1px solid rgba(75, 85, 99, 0.4)",
    backgroundColor: "transparent",
    color: "#8f9aa6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(35, 217, 217, 0.1)",
      borderColor: "#23d9d9",
      color: "#23d9d9",
    },
  },

  critiqueSectionContent: {
    borderTop: "1px solid rgba(75, 85, 99, 0.3)",
  },

  critiqueSectionBorder: {
    margin: "12px", // MODIFIED: Was 16px
    padding: "12px", // MODIFIED: Was 16px
    borderLeft: "3px solid",
    borderRadius: "4px",
    backgroundColor: "rgba(17, 24, 39, 0.4)",
  },

  critiqueSectionText: {
    fontSize: "13px", // MODIFIED: Was 14px
    color: "#d1d5db",
    lineHeight: "1.6", // MODIFIED: Was 1.7
    margin: 0,
    letterSpacing: "0.3px",
    fontWeight: "400",
    textAlign: "justify",
  },

  critiqueComparisonContainer: {
    borderTop: "1px solid rgba(75, 85, 99, 0.3)",
    paddingTop: "12px", // MODIFIED: Was 16px
  },

  critiqueComparisonTitle: {
    fontSize: "14px", // MODIFIED: Was 16px
    fontWeight: "600",
    color: "#fff",
    marginBottom: "8px", // MODIFIED: Was 12px
  },

  critiqueFallbackContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px", // MODIFIED: Was 12px
  },

  critiqueFallbackHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px", // MODIFIED: Was 8px 12px
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "6px",
  },

  critiqueFallbackIcon: {
    width: "16px",
    height: "16px",
    color: "#ef4444",
  },

  critiqueFallbackTitle: {
    fontSize: "13px", // MODIFIED: Was 14px
    color: "#ef4444",
    fontWeight: "500",
  },

  diffContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px", // MODIFIED: Was 16px
    borderTop: "1px solid rgba(75, 85, 99, 0.3)",
    paddingTop: "12px", // MODIFIED: Was 16px
  },

  diffSection: {
    display: "flex",
    flexDirection: "column",
  },

  diffTitle: {
    fontWeight: "500",
    fontSize: "13px", // MODIFIED: Was 14px
    color: "#d1d5db",
    marginBottom: "6px", // MODIFIED: Was 8px
  },

  diffOriginal: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "4px",
    padding: "10px", // MODIFIED: Was 12px
    fontSize: "13px", // MODIFIED: Was 14px
  },

  diffOriginalText: {
    color: "#fca5a5",
  },

  diffAnalysis: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: "4px",
    padding: "10px", // MODIFIED: Was 12px
    fontSize: "13px", // MODIFIED: Was 14px
  },

  diffAnalysisText: {
    color: "#86efac",
  },

  // Reflection card specific styles (Compacted)
  reflectionSection: {
    marginBottom: "12px", // MODIFIED: Was 16px
  },

  reflectionAnalysis: {
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderRadius: "6px", // MODIFIED: Was 8px
    padding: "10px", // MODIFIED: Was 12px
  },

  reflectionReasoning: {
    backgroundColor: "rgba(30, 144, 255, 0.1)",
    borderRadius: "6px", // MODIFIED: Was 8px
    padding: "10px", // MODIFIED: Was 12px
  },

  principlesList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px", // MODIFIED: Was 8px
  },

  principleItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    padding: "6px", // MODIFIED: Was 8px
    borderRadius: "4px",
  },

  principleBullet: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: "14px",
    marginTop: "2px",
    flexShrink: 0,
  },

  principleText: {
    fontSize: "13px", // MODIFIED: Was 14px
    color: "#d1d5db",
  },

  // Placeholder styles
  placeholderCard: {
    border: "2px dashed rgba(75, 85, 99, 0.3)",
    borderRadius: "8px",
  },

  placeholderContent: {
    textAlign: "center",
    padding: "48px 20px",
  },

  placeholderIcon: {
    width: "48px",
    height: "48px",
    color: "#6b7280",
    margin: "0 auto 16px auto",
  },

  placeholderText: {
    color: "#6b7280",
  },

  // Scroll indicator styles
  scrollIndicator: {
    position: "absolute",
    bottom: "16px",
    right: "16px",
  },

  scrollButton: {
    backgroundColor: "#1e90ff",
    color: "#fff",
    border: "1px solid #1e90ff",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    animation: "bounce 1s infinite",
  },

  scrollButtonHover: {
    backgroundColor: "#1c7ed6",
  },

  scrollButtonIcon: {
    width: "16px",
    height: "16px",
  },

  // Learning history styles
  historyCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
    borderRadius: "12px",
  },

  historyEmpty: {
    textAlign: "center",
    padding: "32px",
  },

  historyEmptyIcon: {
    width: "48px",
    height: "48px",
    color: "#6b7280",
    margin: "0 auto 16px auto",
  },

  historyEmptyText: {
    color: "#6b7280",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  historyEntry: {
    border: "1px solid rgba(75, 85, 99, 0.3)",
    borderRadius: "8px",
    padding: "16px",
  },

  historyEntryHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },

  historyEntryInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  historyBadge: {
    border: "1px solid rgba(35, 217, 217, 0.3)",
    backgroundColor: "transparent",
    color: "#23d9d9",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  },

  historyTimestamp: {
    fontSize: "12px",
    color: "#6b7280",
  },

  historyStatusSuccess: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },

  historyStatusFailed: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },

  historySummary: {
    fontSize: "14px",
    color: "#9ca3af",
  },

  // Execution logs styles
  logsContainer: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
    borderRadius: "12px",
  },

  logsContent: {
    maxHeight: "384px",
    overflowY: "auto",
    backgroundColor: "#1f2937",
    color: "#10b981",
    padding: "16px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  logsEmpty: {
    color: "#6b7280",
    fontStyle: "italic",
  },

  logEntry: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },

  logTimestamp: {
    color: "#6b7280",
    fontSize: "12px",
    flexShrink: 0,
  },

  logIcon: {
    width: "16px",
    height: "16px",
    flexShrink: 0,
  },

  logMessageInfo: {
    color: "#60a5fa",
  },

  logMessageSuccess: {
    color: "#34d399",
  },

  logMessageWarning: {
    color: "#fbbf24",
  },

  logMessageError: {
    color: "#f87171",
  },

  // Error alert styles
  errorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "16px",
  },

  alertIcon: {
    width: "16px",
    height: "16px",
    color: "#ef4444",
  },

  alertDescription: {
    color: "#ef4444",
    fontSize: "14px",
  },

  // Loading skeleton styles
  skeletonCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
    borderRadius: "12px",
  },

  skeletonHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  skeletonContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  skeleton: {
    backgroundColor: "rgba(75, 85, 99, 0.3)",
    borderRadius: "4px",
    animation: "pulse 2s infinite",
  },

  skeletonIcon: {
    width: "20px",
    height: "20px",
  },

  skeletonTitle: {
    width: "192px",
    height: "24px",
  },

  skeletonLine: {
    width: "100%",
    height: "16px",
  },

  skeletonLineShort: {
    width: "66.666%",
    height: "16px",
  },

  skeletonButton: {
    width: "50%",
    height: "32px",
  },

  // No agent state styles
  placeholderTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#e5e7eb",
    margin: "0 0 16px 0",
  },

  agentList: {
    margin: "24px 0",
    width: "100%",
  },

  agentListTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#d1d5db",
    margin: "0 0 16px 0",
  },

  agentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },

  agentCard: {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    border: "1px solid rgba(75, 85, 99, 0.3)",
    borderRadius: "8px",
    padding: "12px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },

  agentCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },

  agentCardIcon: {
    width: "16px",
    height: "16px",
    color: "#9ca3af",
  },

  agentCardName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#e5e7eb",
  },

  agentCardInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  agentCardDetails: {
    fontSize: "12px",
    color: "#9ca3af",
  },

  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    padding: "4px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteIcon: {
    width: "14px",
    height: "14px",
    color: "#6b7280",
  },

  moreAgentsText: {
    fontSize: "13px",
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    margin: 0,
  },

  createButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#23d9d9",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },

  modal: {
    backgroundColor: "rgba(26, 31, 37, 0.98)",
    border: "2px solid rgba(35, 217, 217, 0.4)",
    borderRadius: "16px",
    padding: "0",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(35, 217, 217, 0.1)",
    backdropFilter: "blur(12px)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 24px 0 24px",
    borderBottom: "1px solid rgba(35, 217, 217, 0.2)",
    paddingBottom: "16px",
    marginBottom: "24px",
  },

  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#23d9d9",
    margin: 0,
  },

  modalCloseButton: {
    background: "none",
    border: "none",
    color: "#8f9aa6",
    cursor: "pointer",
    fontSize: "18px",
    padding: "4px",
    borderRadius: "4px",
    transition: "color 0.2s ease",
  },

  modalContent: {
    padding: "0 24px",
  },

  modalLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: "8px",
  },

  modalInput: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    border: "2px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "8px",
    color: "#ffffff",
    outline: "none",
    transition: "border-color 0.2s ease",
    marginBottom: "12px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  modalDescription: {
    fontSize: "13px",
    color: "#9ca3af",
    lineHeight: "1.5",
    margin: "0 0 24px 0",
  },

  modalActions: {
    display: "flex",
    gap: "12px",
    padding: "24px",
    borderTop: "1px solid rgba(35, 217, 217, 0.2)",
    marginTop: "8px",
  },

  modalCancelButton: {
    flex: 1,
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "transparent",
    border: "2px solid rgba(75, 85, 99, 0.5)",
    borderRadius: "8px",
    color: "#9ca3af",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  modalCreateButton: {
    flex: 1,
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#23d9d9",
    border: "none",
    borderRadius: "8px",
    color: "#000000",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default AletheiaLearningLoop;
