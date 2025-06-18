import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  FileText,
  Quote,
  Zap,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const WisdomResult = ({ result, onReset }) => {
  const [expandedSections, setExpandedSections] = useState({
    tldr: true,
    perspectives: false,
    fullAnalysis: false,
    citations: false,
  });

  const [expandedPerspective, setExpandedPerspective] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Extract data from the result - handle both structured and unstructured responses
  const extractData = (result) => {
    // Helper function to parse JSON from markdown code blocks
    const parseJsonFromMarkdown = (text) => {
      if (typeof text !== "string") return text;

      // Remove markdown code block wrapper if present
      const cleanText = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

      try {
        return JSON.parse(cleanText);
      } catch (e) {
        return text; // Return original if parsing fails
      }
    };

    // If we have structured_response, use it but parse the JSON strings
    if (
      result?.structured_response &&
      typeof result.structured_response === "object"
    ) {
      const structured = result.structured_response;

      // Parse each field that might be a JSON string
      const parsedData = {
        tldr: parseJsonFromMarkdown(structured.tldr)?.tldr || structured.tldr,
        key_points:
          parseJsonFromMarkdown(structured.key_points)?.key_points ||
          structured.key_points ||
          [],
        perspectives:
          parseJsonFromMarkdown(structured.perspectives)?.perspectives ||
          structured.perspectives ||
          [],
        full_analysis:
          parseJsonFromMarkdown(structured.full_analysis)?.full_analysis ||
          structured.full_analysis,
        citation_mapping: structured.citation_mapping || [],
      };

      // If the main fields are still strings, try parsing the full_analysis
      if (
        typeof parsedData.tldr === "string" &&
        parsedData.tldr.includes("```json")
      ) {
        const fullParsed = parseJsonFromMarkdown(parsedData.full_analysis);
        if (fullParsed && typeof fullParsed === "object") {
          return {
            tldr: fullParsed.tldr || parsedData.tldr,
            key_points: fullParsed.key_points || [],
            perspectives: fullParsed.perspectives || [],
            full_analysis: fullParsed.full_analysis || parsedData.full_analysis,
            citation_mapping: fullParsed.citation_mapping || [],
          };
        }
      }

      return parsedData;
    }

    // Fallback: try to parse from response field
    if (result?.response) {
      try {
        const parsed = parseJsonFromMarkdown(result.response);
        return typeof parsed === "object"
          ? parsed
          : {
              tldr: result.response,
              full_analysis: result.response,
              key_points: [],
              perspectives: [],
              citation_mapping: [],
            };
      } catch (e) {
        return {
          tldr: result.response,
          full_analysis: result.response,
          key_points: [],
          perspectives: [],
          citation_mapping: [],
        };
      }
    }

    // Final fallback
    return {
      tldr: "Analysis completed",
      full_analysis: JSON.stringify(result, null, 2),
      key_points: [],
      perspectives: [],
      citation_mapping: [],
    };
  };

  const data = extractData(result);

  // Debug logging
  console.log("WisdomResult - Raw result:", result);
  console.log("WisdomResult - Extracted data:", data);
  console.log("WisdomResult - Data tldr:", data?.tldr);
  console.log("WisdomResult - Data perspectives:", data?.perspectives);

  const getFrameworkColor = (framework) => {
    const colors = {
      "Kantian Deontology": "bg-purple-100 text-purple-800 border-purple-300",
      "Utilitarian Ethics": "bg-blue-100 text-blue-800 border-blue-300",
      "Virtue Ethics": "bg-green-100 text-green-800 border-green-300",
      "Hermeneutics/Epistemology of Values":
        "bg-orange-100 text-orange-800 border-orange-300",
      "Social Contract Theory":
        "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
    return colors[framework] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getFrameworkIcon = (framework) => {
    const icons = {
      "Kantian Deontology": <ShieldCheck className="w-5 h-5" />,
      "Utilitarian Ethics": <Scale className="w-5 h-5" />,
      "Virtue Ethics": <Sparkles className="w-5 h-5" />,
      "Hermeneutics/Epistemology of Values": <BookOpen className="w-5 h-5" />,
      "Social Contract Theory": <Users className="w-5 h-5" />,
    };
    return icons[framework] || <BookOpen className="w-5 h-5" />;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Wisdom Network Analysis</h1>
          <p style={styles.subtitle}>
            Philosophical perspectives and ethical analysis
          </p>
        </div>
        <button onClick={onReset} style={styles.resetButton}>
          Ask New Question
        </button>
      </header>

      {/* Summary Card */}
      {data.tldr && (
        <div style={styles.card}>
          <div style={styles.cardHeader} onClick={() => toggleSection("tldr")}>
            <div style={styles.cardHeaderContent}>
              <div style={styles.iconContainer}>
                <Zap style={styles.icon} />
              </div>
              <h2 style={styles.cardTitle}>Quick Summary</h2>
            </div>
            {expandedSections.tldr ? (
              <ChevronDown style={styles.chevron} />
            ) : (
              <ChevronRight style={styles.chevron} />
            )}
          </div>

          {expandedSections.tldr && (
            <div style={styles.cardContent}>
              <p style={styles.tldrText}>{data.tldr}</p>

              {data.key_points && data.key_points.length > 0 && (
                <div style={styles.keyPointsContainer}>
                  <h3 style={styles.keyPointsTitle}>Key Points</h3>
                  {data.key_points.map((point, idx) => (
                    <div key={idx} style={styles.keyPoint}>
                      <span style={styles.keyPointIcon}>⚡</span>
                      <span style={styles.keyPointText}>
                        {point.replace(/⚡\s*/, "")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Philosophical Perspectives */}
      {data.perspectives && data.perspectives.length > 0 && (
        <div style={styles.card}>
          <div
            style={styles.cardHeader}
            onClick={() => toggleSection("perspectives")}
          >
            <div style={styles.cardHeaderContent}>
              <div style={styles.iconContainer}>
                <Users style={styles.icon} />
              </div>
              <h2 style={styles.cardTitle}>
                Philosophical Perspectives ({data.perspectives.length})
              </h2>
            </div>
            {expandedSections.perspectives ? (
              <ChevronDown style={styles.chevron} />
            ) : (
              <ChevronRight style={styles.chevron} />
            )}
          </div>

          {expandedSections.perspectives && (
            <div style={styles.cardContent}>
              <div style={styles.perspectivesGrid}>
                {data.perspectives.map((perspective, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.perspectiveCard,
                      ...(expandedPerspective === idx
                        ? styles.perspectiveCardExpanded
                        : {}),
                    }}
                    onClick={() =>
                      setExpandedPerspective(
                        expandedPerspective === idx ? null : idx
                      )
                    }
                  >
                    <div style={styles.perspectiveHeader}>
                      <div>
                        <div style={styles.perspectiveTitleContainer}>
                          {getFrameworkIcon(perspective.framework)}
                          <h3 style={styles.perspectiveTitle}>
                            {perspective.framework}
                          </h3>
                        </div>
                        {perspective.author && perspective.era && (
                          <p style={styles.perspectiveAuthor}>
                            {perspective.author} • {perspective.era}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        style={{
                          ...styles.perspectiveChevron,
                          transform:
                            expandedPerspective === idx
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                        }}
                      />
                    </div>

                    <p style={styles.perspectiveThesis}>
                      {perspective.core_thesis}
                    </p>

                    {expandedPerspective === idx &&
                      perspective.supporting_passage_ids && (
                        <div style={styles.supportingSources}>
                          <p style={styles.sourcesLabel}>Supporting sources:</p>
                          <div style={styles.sourcesContainer}>
                            {perspective.supporting_passage_ids.map((id, i) => (
                              <span key={i} style={styles.sourceTag}>
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Analysis */}
      {data.full_analysis && (
        <div style={styles.card}>
          <div
            style={styles.cardHeader}
            onClick={() => toggleSection("fullAnalysis")}
          >
            <div style={styles.cardHeaderContent}>
              <div style={styles.iconContainer}>
                <FileText style={styles.icon} />
              </div>
              <h2 style={styles.cardTitle}>Full Analysis</h2>
            </div>
            {expandedSections.fullAnalysis ? (
              <ChevronDown style={styles.chevron} />
            ) : (
              <ChevronRight style={styles.chevron} />
            )}
          </div>

          {expandedSections.fullAnalysis && (
            <div style={styles.cardContent}>
              <div
                style={styles.fullAnalysis}
                dangerouslySetInnerHTML={{ __html: data.full_analysis }}
              />
            </div>
          )}
        </div>
      )}

      {/* Citations */}
      {data.citation_mapping && data.citation_mapping.length > 0 && (
        <div style={styles.card}>
          <div
            style={styles.cardHeader}
            onClick={() => toggleSection("citations")}
          >
            <div style={styles.cardHeaderContent}>
              <div style={styles.iconContainer}>
                <Quote style={styles.icon} />
              </div>
              <h2 style={styles.cardTitle}>
                Key Citations ({data.citation_mapping.length})
              </h2>
            </div>
            {expandedSections.citations ? (
              <ChevronDown style={styles.chevron} />
            ) : (
              <ChevronRight style={styles.chevron} />
            )}
          </div>

          {expandedSections.citations && (
            <div style={styles.cardContent}>
              <div style={styles.citationsContainer}>
                {data.citation_mapping.map((citation, idx) => (
                  <div key={idx} style={styles.citation}>
                    <div style={styles.citationHeader}>
                      <span style={styles.sourceId}>{citation.source_id}</span>
                      <span style={styles.relevanceScore}>
                        Relevance: {(citation.weight * 100).toFixed(1)}%
                      </span>
                    </div>

                    <blockquote style={styles.citationText}>
                      "{citation.sentence_preview}"
                    </blockquote>

                    {citation.ai_safety_relevance && (
                      <p style={styles.relevanceText}>
                        <span style={styles.relevanceLabel}>
                          AI Safety Relevance:
                        </span>{" "}
                        {citation.ai_safety_relevance}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trace ID */}
      {result.trace_id && (
        <div style={styles.traceInfo}>
          <small>Trace ID: {result.trace_id}</small>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "95%",
    padding: "24px",
    backgroundColor: "rgba(17, 21, 26, 0.9)",
    minHeight: "100vh",
    color: "#ffffff",
    overflowY: "auto",
    marginBottom: "100px",
  },
  header: {
    marginBottom: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: "24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#8f9aa6",
    margin: 0,
  },
  resetButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#23d9d9",
    backgroundColor: "rgba(35, 217, 217, 0.1)",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    marginBottom: "24px",
    overflow: "hidden",
    overflowY: "auto",
  },
  cardHeader: {
    padding: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  cardHeaderContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconContainer: {
    padding: "8px",
    backgroundColor: "rgba(35, 217, 217, 0.1)",
    borderRadius: "8px",
  },
  icon: {
    width: "20px",
    height: "20px",
    color: "#23d9d9",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0,
  },
  chevron: {
    width: "20px",
    height: "20px",
    color: "#8f9aa6",
  },
  cardContent: {
    padding: "14px",
  },
  tldrText: {
    color: "#d1d5db",
    marginBottom: "16px",
    lineHeight: "1.6",
    fontSize: "16px",
  },
  keyPointsContainer: {
    marginTop: "24px",
  },
  keyPointsTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#8f9aa6",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "12px",
  },
  keyPoint: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px",
  },
  keyPointIcon: {
    fontSize: "18px",
  },
  keyPointText: {
    color: "#d1d5db",
    lineHeight: "1.5",
  },
  perspectivesGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  perspectiveCard: {
    padding: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  perspectiveCardExpanded: {
    backgroundColor: "rgba(35, 217, 217, 0.05)",
    borderColor: "rgba(35, 217, 217, 0.2)",
  },
  perspectiveHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  perspectiveTitleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  perspectiveTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0,
  },
  perspectiveAuthor: {
    fontSize: "14px",
    color: "#8f9aa6",
    margin: 0,
  },
  perspectiveChevron: {
    width: "20px",
    height: "20px",
    color: "#8f9aa6",
    transition: "transform 0.2s ease",
  },
  perspectiveThesis: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#d1d5db",
    margin: 0,
  },
  supportingSources: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  sourcesLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#8f9aa6",
    margin: "0 0 8px 0",
  },
  sourcesContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  sourceTag: {
    fontSize: "12px",
    padding: "4px 8px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "4px",
    color: "#d1d5db",
  },
  fullAnalysis: {
    color: "#d1d5db",
    lineHeight: "1.7",
    fontSize: "15px",
  },
  citationsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  citation: {
    borderLeft: "4px solid rgba(35, 217, 217, 0.3)",
    paddingLeft: "16px",
    paddingTop: "8px",
    paddingBottom: "8px",
  },
  citationHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  sourceId: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#23d9d9",
  },
  relevanceScore: {
    fontSize: "12px",
    padding: "4px 8px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#8f9aa6",
  },
  citationText: {
    fontSize: "14px",
    color: "#d1d5db",
    fontStyle: "italic",
    marginBottom: "8px",
    borderLeft: "none",
    paddingLeft: 0,
  },
  relevanceText: {
    fontSize: "12px",
    color: "#8f9aa6",
    backgroundColor: "rgba(35, 217, 217, 0.05)",
    padding: "8px",
    borderRadius: "4px",
    margin: 0,
  },
  relevanceLabel: {
    fontWeight: "600",
  },
  traceInfo: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "16px",
    color: "#8f9aa6",
    fontSize: "12px",
    textAlign: "center",
  },
};

export default WisdomResult;
