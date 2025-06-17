/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import Tooltip from "./ui/tooltip";
import {
  FileText,
  History,
  Edit3,
  Save,
  RotateCcw,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Download,
  ChevronDown,
} from "lucide-react";
import apiService from "../services/api";
import { exportConstitution } from "../utils/exportUtils";
import PrincipleEvaluationDisplay from "./PrincipleEvaluationDisplay";

const AgentConstitutionManager = ({ agentId, onConstitutionUpdate }) => {
  const [agent, setAgent] = useState(null);
  const [constitution, setConstitution] = useState([]);
  const [originalConstitution, setOriginalConstitution] = useState([]);
  const [constitutionHistory, setConstitutionHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [newPrinciple, setNewPrinciple] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showEditTooltip, setShowEditTooltip] = useState(false);

  useEffect(() => {
    if (agentId) {
      loadAgent();
      loadConstitutionHistory();
    }
  }, [agentId]);

  // Auto-show edit tooltip after component loads
  useEffect(() => {
    if (constitution.length > 0 && !isEditing) {
      const timer = setTimeout(() => {
        setShowEditTooltip(true);
        // Auto-hide after 10 seconds
        const hideTimer = setTimeout(() => {
          setShowEditTooltip(false);
        }, 10000);
        return () => clearTimeout(hideTimer);
      }, 1000); // Show after 1 second

      return () => clearTimeout(timer);
    }
  }, [constitution, isEditing]);

  const loadAgent = async () => {
    try {
      const agentData = await apiService.getAgent(agentId);
      setAgent(agentData);
      setConstitution([...agentData.constitution]);
      setOriginalConstitution([...agentData.constitution]);
    } catch (error) {
      console.error("Failed to load agent:", error);
      setError("Failed to load agent data");
    }
  };

  const loadConstitutionHistory = async () => {
    try {
      const history = await apiService.getConstitutionHistory(agentId);
      setConstitutionHistory(history);
    } catch (error) {
      console.error("Failed to load constitution history:", error);
    }
  };

  const saveConstitution = async () => {
    if (!agentId || constitution.length === 0) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiService.updateAgentConstitution(agentId, constitution);
      setOriginalConstitution([...constitution]);
      setIsEditing(false);
      await loadAgent();
      await loadConstitutionHistory();
      if (onConstitutionUpdate) {
        onConstitutionUpdate(constitution);
      }
    } catch (error) {
      console.error("Failed to save constitution:", error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setConstitution([...originalConstitution]);
    setIsEditing(false);
    setNewPrinciple("");
  };

  const updatePrinciple = (index, value) => {
    const updated = [...constitution];
    updated[index] = value;
    setConstitution(updated);
  };

  const addPrinciple = () => {
    if (newPrinciple.trim()) {
      setConstitution([...constitution, newPrinciple.trim()]);
      setNewPrinciple("");
    }
  };

  const removePrinciple = (index) => {
    const updated = constitution.filter((_, i) => i !== index);
    setConstitution(updated);
  };

  const hasChanges = () =>
    JSON.stringify(constitution) !== JSON.stringify(originalConstitution);

  const getDiffStats = (oldConst, newConst) => {
    const added = newConst.filter((p) => !oldConst.includes(p));
    const removed = oldConst.filter((p) => !newConst.includes(p));
    return { added: added.length, removed: removed.length };
  };

  const ConstitutionDiff = ({ oldVersion, newVersion }) => {
    const oldConst = oldVersion?.constitution || [];
    const newConst = newVersion?.constitution || [];
    const added = newConst.filter((p) => !oldConst.includes(p));
    const removed = oldConst.filter((p) => !newConst.includes(p));
    const unchanged = newConst.filter((p) => oldConst.includes(p));

    return (
      <div css={styles.diffContainer}>
        <div css={styles.diffStatsHeader}>
          <Badge variant="outline" css={styles.diffBadgeAdded}>
            +{added.length} added
          </Badge>
          <Badge variant="outline" css={styles.diffBadgeRemoved}>
            -{removed.length} removed
          </Badge>
          <Badge variant="outline">{unchanged.length} unchanged</Badge>
        </div>
        <div css={styles.diffList}>
          {removed.map((p, i) => (
            <div key={`rem-${i}`} css={styles.diffItemRemoved}>
              <span css={styles.diffSymbol}>-</span>
              <span css={styles.diffTextRemoved}>{p}</span>
            </div>
          ))}
          {added.map((p, i) => (
            <div key={`add-${i}`} css={styles.diffItemAdded}>
              <span css={styles.diffSymbol}>+</span>
              <span css={styles.diffTextAdded}>{p}</span>
            </div>
          ))}
          {unchanged.map((p, i) => (
            <div key={`unc-${i}`} css={styles.diffItemUnchanged}>
              <span css={styles.diffSymbol}> </span>
              <span css={styles.diffTextUnchanged}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const EvolutionTimeline = () => (
    <div css={styles.timelineContainer}>
      {constitutionHistory.map((entry, index) => {
        const prevEntry = constitutionHistory[index + 1];
        const diffStats = prevEntry
          ? getDiffStats(prevEntry.constitution, entry.constitution)
          : null;

        return (
          <div
            key={entry.version}
            css={styles.timelineEntry}
          >
            <div css={styles.timelineHeader}>
              <Badge variant={index === 0 ? "default" : "outline"}>
                v{entry.version}
              </Badge>
              <span css={styles.timelineTimestamp}>
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              {diffStats && (
                <div css={styles.timelineDiffStats}>
                  {diffStats.added > 0 && (
                    <Badge
                      variant="outline"
                      css={styles.timelineDiffBadgeAdded}
                    >
                      +{diffStats.added}
                    </Badge>
                  )}
                  {diffStats.removed > 0 && (
                    <Badge
                      variant="outline"
                      css={styles.timelineDiffBadgeRemoved}
                    >
                      -{diffStats.removed}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Triggering Scenario Section */}
            {entry.triggeringScenario && (
              <div css={styles.triggeringScenarioCard}>
                <div css={styles.triggeringScenarioHeader}>
                  <div css={styles.triggeringScenarioIcon}>🎯</div>
                  <h4 css={styles.triggeringScenarioTitle}>
                    Triggering Scenario
                  </h4>
                </div>
                <div css={styles.triggeringScenarioContent}>
                  <h5 css={styles.scenarioTitle}>
                    {entry.triggeringScenario.title}
                  </h5>
                  <p css={styles.scenarioDescription}>
                    {entry.triggeringScenario.description ||
                      entry.triggeringScenario.query}
                  </p>
                  {entry.triggeringScenario.outcome && (
                    <div css={styles.scenarioOutcome}>
                      <span css={styles.outcomeLabel}>Agent Response:</span>
                      <span css={styles.outcomeText}>
                        {entry.triggeringScenario.outcome}
                      </span>
                    </div>
                  )}
                  {entry.triggeringScenario.category && (
                    <Badge variant="outline" css={styles.scenarioCategory}>
                      {entry.triggeringScenario.category}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {entry.reasoning && (
              <div css={styles.reasoningCard}>
                <div css={styles.reasoningHeader}>
                  <div css={styles.reasoningIcon}>💭</div>
                  <h4 css={styles.reasoningTitle}>Learning Rationale</h4>
                </div>
                <p css={styles.timelineReasoning}>{entry.reasoning}</p>
              </div>
            )}

            <div css={styles.timelineFooter}>
              <div css={styles.timelinePrincipleCount}>
                {entry.constitution.length} principles
              </div>
              {entry.learningMetrics && (
                <div css={styles.learningMetrics}>
                  <span css={styles.metricItem}>
                    Confidence:{" "}
                    {(entry.learningMetrics.confidence * 100).toFixed(1)}%
                  </span>
                  <span css={styles.metricItem}>
                    Impact: {entry.learningMetrics.impact || "Medium"}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div css={styles.managerContainer}>
      <div css={styles.headerCard}>
        <div css={styles.headerPadding}>
          <div css={styles.headerContent}>
            <div css={styles.headerTitle}>
              <FileText css={styles.headerIcon} />
              <h2 css={styles.headerH2}>Agent Constitution</h2>
              {agent && <span css={styles.versionBadge}>v{agent.version}</span>}
            </div>
            <div css={styles.headerActions}>
              {agent && (
                <div css={styles.exportContainer}>
                  <Button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    variant="outline"
                    size="sm"
                    css={styles.exportButton}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                  {showExportMenu && (
                    <div css={styles.exportMenu}>
                      <button
                        onClick={() => {
                          exportConstitution(agent, "json");
                          setShowExportMenu(false);
                        }}
                        css={styles.exportMenuItem}
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={() => {
                          exportConstitution(agent, "csv");
                          setShowExportMenu(false);
                        }}
                        css={styles.exportMenuItem}
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          exportConstitution(agent, "text");
                          setShowExportMenu(false);
                        }}
                        css={styles.exportMenuItem}
                      >
                        Export as Text
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div css={styles.statsContainer}>
          {agent && (
            <div css={styles.statsGrid}>
              <div css={[styles.statCard, styles.statCardVersion]}>
                <div css={styles.statNumber}>{agent.version}</div>
                <div css={styles.statLabel}>Current Version</div>
              </div>
              <div css={[styles.statCard, styles.statCardPrinciples]}>
                <div css={styles.statNumber}>{constitution.length}</div>
                <div css={styles.statLabel}>Principles</div>
              </div>
              <div css={[styles.statCard, styles.statCardRevisions]}>
                <div css={styles.statNumber}>{constitutionHistory.length}</div>
                <div css={styles.statLabel}>Revisions</div>
              </div>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {hasChanges() && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes to the constitution.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Constitution</TabsTrigger>
          <TabsTrigger value="changes">Recent Changes</TabsTrigger>
          <TabsTrigger value="history">Evolution Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader className="pb-4">
              <div css={styles.cardHeader}>
                <h3 css={styles.principlesTitle}>
                  Constitutional Principles
                </h3>
                <div css={styles.principlesHeaderActions}>
                  {!isEditing ? (
                    <div css={styles.editButtonContainer}>
                      <Button 
                        onClick={() => {
                          setIsEditing(true);
                          setShowEditTooltip(false);
                        }} 
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {showEditTooltip && (
                        <div css={styles.autoTooltip}>
                          <div css={styles.autoTooltipContent}>
                            You can adjust and edit the constitution here
                          </div>
                          <div css={styles.autoTooltipArrow}></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div css={styles.editingActions}>
                      <Button
                        onClick={() => setShowDiff(!showDiff)}
                        variant="outline"
                        size="sm"
                      >
                        {showDiff ? (
                          <EyeOff className="w-4 h-4 mr-2" />
                        ) : (
                          <Eye className="w-4 h-4 mr-2" />
                        )}
                        {showDiff ? "Hide" : "Show"} Changes
                      </Button>
                      <Button
                        onClick={saveConstitution}
                        disabled={!hasChanges() || isSaving}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {showDiff && hasChanges() && (
                <div css={styles.previewChangesContainer}>
                  <h4 css={styles.previewChangesTitle}>Preview Changes:</h4>
                  <ConstitutionDiff
                    oldVersion={{ constitution: originalConstitution }}
                    newVersion={{ constitution }}
                  />
                </div>
              )}
              <div css={styles.principlesList}>
                {constitution.map((principle, index) => (
                  <div
                    key={index}
                    css={[
                      styles.principleCard,
                      !isEditing && styles.principleCardHover,
                      isEditing
                        ? styles.principleCardEditing
                        : index % 2 === 0
                        ? styles.principleCardEven
                        : styles.principleCardOdd,
                    ]}
                  >
                    <div css={styles.principleNumber}>{index + 1}</div>
                    {isEditing ? (
                      <div css={styles.principleEditingWrapper}>
                        <textarea
                          value={principle}
                          onChange={(e) =>
                            updatePrinciple(index, e.target.value)
                          }
                          css={styles.principleTextarea}
                          rows="3"
                          placeholder="Enter constitutional principle..."
                        />
                        <Button
                          onClick={() => removePrinciple(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div css={styles.principleTextViewer}>
                        <p css={styles.principleText}>{principle}</p>
                      </div>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div css={styles.addPrincipleContainer}>
                    <div css={styles.addPrincipleIconWrapper}>
                      <Plus className="w-5 h-5" />
                    </div>
                    <div css={styles.addPrincipleInputWrapper}>
                      <textarea
                        value={newPrinciple}
                        onChange={(e) => setNewPrinciple(e.target.value)}
                        placeholder="Add a new constitutional principle..."
                        css={styles.addPrincipleTextarea}
                        rows="3"
                      />
                      <Button
                        onClick={addPrinciple}
                        disabled={!newPrinciple.trim()}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card>
            <CardHeader className="pb-4">
              <div css={styles.tabHeader}>
                <div css={styles.changesIcon}>🔄</div>
                <h3 className="text-lg font-semibold">
                  Recent Constitutional Changes
                </h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {constitutionHistory.length >= 2 ? (
                <div css={styles.recentChangesContainer}>
                  {(() => {
                    const currentVersion = constitutionHistory[0];
                    const previousVersion = constitutionHistory[1];
                    const added = currentVersion.constitution.filter(
                      (p) => !previousVersion.constitution.includes(p)
                    );
                    const removed = previousVersion.constitution.filter(
                      (p) => !currentVersion.constitution.includes(p)
                    );

                    return (
                      <>
                        <div css={styles.versionComparisonHeader}>
                          <div css={styles.versionBadgeContainer}>
                            <Badge css={styles.currentVersionBadge}>
                              Current (v{currentVersion.version})
                            </Badge>
                            <span css={styles.vsText}>vs</span>
                            <Badge
                              variant="outline"
                              css={styles.previousVersionBadge}
                            >
                              Previous (v{previousVersion.version})
                            </Badge>
                          </div>
                          <div css={styles.changeTimestamp}>
                            Updated{" "}
                            {new Date(
                              currentVersion.timestamp
                            ).toLocaleDateString()}
                          </div>
                        </div>

                        {currentVersion.triggeringScenario && (
                          <div css={styles.latestTriggeringScenario}>
                            <div css={styles.latestScenarioHeader}>
                              <div css={styles.scenarioHeaderIcon}>⚡</div>
                              <h4 css={styles.latestScenarioTitle}>
                                What Triggered This Change?
                              </h4>
                            </div>
                            <div css={styles.latestScenarioCard}>
                              <h5 css={styles.latestScenarioName}>
                                {currentVersion.triggeringScenario.title}
                              </h5>
                              <p css={styles.latestScenarioDesc}>
                                {currentVersion.triggeringScenario
                                  .description ||
                                  currentVersion.triggeringScenario.query}
                              </p>
                              {currentVersion.triggeringScenario.outcome && (
                                <div css={styles.latestScenarioOutcome}>
                                  <span css={styles.latestOutcomeLabel}>
                                    Agent's Response:
                                  </span>
                                  <div css={styles.latestOutcomeText}>
                                    {currentVersion.triggeringScenario.outcome}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div css={styles.changesSummary}>
                          <div css={styles.changesSummaryHeader}>
                            <h4 css={styles.changesSummaryTitle}>
                              Constitutional Changes
                            </h4>
                            <div css={styles.changesBadges}>
                              {added.length > 0 && (
                                <Badge
                                  variant="outline"
                                  css={styles.addedBadge}
                                >
                                  +{added.length} Added
                                </Badge>
                              )}
                              {removed.length > 0 && (
                                <Badge
                                  variant="outline"
                                  css={styles.removedBadge}
                                >
                                  -{removed.length} Removed
                                </Badge>
                              )}
                            </div>
                          </div>

                          {(added.length > 0 || removed.length > 0) && (
                            <div css={styles.sideBySideChanges}>
                              <div css={styles.addedColumn}>
                                <h5 css={styles.changesSectionTitle}>
                                  ✅ Added Principles
                                </h5>
                                <div css={styles.principleChanges}>
                                  {added.length > 0 ? (
                                    added.map((principle, index) => (
                                      <div
                                        key={index}
                                        css={styles.addedPrinciple}
                                      >
                                        <div css={styles.addedPrincipleIcon}>
                                          +
                                        </div>
                                        <div css={styles.addedPrincipleText}>
                                          {principle}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div css={styles.noChangesPlaceholder}>
                                      No principles added
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div css={styles.removedColumn}>
                                <h5 css={styles.changesSectionTitle}>
                                  ❌ Removed Principles
                                </h5>
                                <div css={styles.principleChanges}>
                                  {removed.length > 0 ? (
                                    removed.map((principle, index) => (
                                      <div
                                        key={index}
                                        css={styles.removedPrinciple}
                                      >
                                        <div css={styles.removedPrincipleIcon}>
                                          -
                                        </div>
                                        <div css={styles.removedPrincipleText}>
                                          {principle}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div css={styles.noChangesPlaceholder}>
                                      No principles removed
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {currentVersion.evaluation && (
                            <PrincipleEvaluationDisplay
                              evaluation={currentVersion.evaluation}
                            />
                          )}

                          {currentVersion.reasoning && (
                            <div css={styles.changesSection}>
                              <h5 css={styles.changesSectionTitle}>
                                💡 Learning Rationale
                              </h5>
                              <div css={styles.reasoningExplanation}>
                                {currentVersion.reasoning}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div css={styles.emptyState}>
                  <div css={styles.emptyStateIcon}>🔄</div>
                  <p css={styles.emptyStateText}>
                    No constitutional changes yet
                  </p>
                  <p css={styles.emptyStateSubtext}>
                    Run learning cycles to see how the agent's constitution
                    evolves
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-4">
              <div css={styles.tabHeader}>
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">
                  Constitutional Evolution for {agent?.name || `Agent ${agentId}`}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {constitutionHistory.length > 1 ? (
                <EvolutionTimeline />
              ) : (
                <div css={styles.emptyState}>
                  <History css={styles.emptyStateIcon} />
                  <p css={styles.emptyStateText}>
                    No evolution history available yet
                  </p>
                  <p css={styles.emptyStateSubtext}>
                    Run learning cycles to track constitutional evolution
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

const styles = {
  managerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  headerCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    borderRadius: "12px",
    border: "1px solid rgba(35, 217, 217, 0.2)",
  },
  headerPadding: { padding: "24px 24px 16px 24px" },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexDirection: "column",
    "@media (min-width: 640px)": { flexDirection: "row", alignItems: "center" },
  },
  headerTitle: { display: "flex", alignItems: "center", gap: "12px" },
  headerIcon: { width: "20px", height: "20px", color: "#23d9d9" },
  headerH2: {
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
    color: "#ffffff",
  },
  versionBadge: {
    backgroundColor: "rgba(35, 217, 217, 0.2)",
    color: "#23d9d9",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  headerActions: { display: "flex", alignItems: "center", gap: "8px" },
  editingActions: { display: "flex", gap: "8px" },
  statsContainer: { padding: "0 24px 24px 24px" },
  statsGrid: {
    display: "grid",
    gap: "24px",
    marginBottom: "24px",
    gridTemplateColumns: "1fr",
    "@media (min-width: 640px)": { gridTemplateColumns: "repeat(3, 1fr)" },
  },
  statCard: {
    textAlign: "center",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    fontWeight: "bold",

    border: "1px solid rgba(35, 217, 217, 0.2)",
  },
  statCardVersion: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
  },
  statCardPrinciples: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
  },
  statCardRevisions: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(35, 217, 217, 0.2)",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "8px",
    lineHeight: "1",
    color: "#23d9d9",
  },
  statLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#8f9aa6",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  principlesHeaderActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  principlesTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
  },
  editButtonContainer: {
    position: "relative",
    display: "inline-block",
  },
  autoTooltip: {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    animation: "fadeInUp 0.3s ease-out",
  },
  autoTooltipContent: {
    background: "rgba(59, 130, 246, 0.95)",
    border: "1px solid rgba(59, 130, 246, 0.5)",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "250px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(8px)",
    wordWrap: "break-word",
    lineHeight: "1.4",
    whiteSpace: "nowrap",
  },
  autoTooltipArrow: {
    position: "absolute",
    top: "-3px",
    left: "50%",
    transform: "translateX(-50%) rotate(45deg)",
    width: "6px",
    height: "6px",
    borderLeft: "1px solid rgba(59, 130, 246, 0.5)",
    borderTop: "1px solid rgba(59, 130, 246, 0.5)",
    background: "rgba(59, 130, 246, 0.95)",
  },
  previewChangesContainer: {
    marginBottom: "24px",
    padding: "16px",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    borderRadius: "8px",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
  },
  previewChangesTitle: {
    fontWeight: "500",
    marginBottom: "12px",
    color: "#fbbf24",
  },
  principlesList: { display: "flex", flexDirection: "column", gap: "10px" },
  principleCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid rgba(35, 217, 217, 0.2)",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    transition: "all 0.2s ease",
    fontWeight: "bold",
  },
  principleCardHover: {
    "&:hover": {
      backgroundColor: "rgba(26, 31, 37, 0.9)",
      borderColor: "#23d9d9",
      transform: "translateY(-2px)",
    },
  },
  principleCardEditing: { backgroundColor: "rgba(26, 31, 37, 0.8)" },
  principleCardEven: { backgroundColor: "rgba(26, 31, 37, 0.8)" },
  principleCardOdd: { backgroundColor: "rgba(26, 31, 37, 0.8)" },
  principleNumber: {
    flexShrink: 0,
    width: "24px",
    height: "24px",
    backgroundColor: "rgba(35, 217, 217, 0.2)",
    color: "#23d9d9",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    border: "2px solid rgba(35, 217, 217, 0.3)",
  },
  principleEditingWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  principleTextarea: {
    flex: 1,
    padding: "12px",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "8px",
    resize: "none",
    fontFamily: "inherit",
    fontSize: "12px",
    lineHeight: "1.3",
    outline: "none",
    backgroundColor: "rgba(11, 14, 17, 0.8)",
    color: "#d1d5db",
    "&:focus": {
      borderColor: "#23d9d9",
      boxShadow: "0 0 0 3px rgba(35, 217, 217, 0.1)",
    },
  },
  principleTextViewer: { flex: 1 },
  principleText: {
    color: "#d1d5db",
    lineHeight: "1.4",
    fontSize: "15px",
    margin: 0,
    fontWeight: "bold",
  },
  addPrincipleContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "16px",
    border: "2px dashed rgba(35, 217, 217, 0.3)",
    borderRadius: "8px",
    backgroundColor: "rgba(26, 31, 37, 0.6)",
    transition: "background-color 0.2s",
    "&:hover": { backgroundColor: "rgba(26, 31, 37, 0.8)" },
  },
  addPrincipleIconWrapper: {
    flexShrink: 0,
    width: "40px",
    height: "40px",
    backgroundColor: "rgba(35, 217, 217, 0.2)",
    color: "#23d9d9",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addPrincipleInputWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  addPrincipleTextarea: {
    flex: 1,
    padding: "12px",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "8px",
    resize: "none",
    backgroundColor: "rgba(11, 14, 17, 0.8)",
    color: "#d1d5db",
    "&:focus": {
      outline: "none",
      borderColor: "#23d9d9",
      boxShadow: "0 0 0 3px rgba(35, 217, 217, 0.1)",
    },
  },
  tabHeader: { display: "flex", alignItems: "center", gap: "12px" },
  emptyState: { textAlign: "center", padding: "48px 0" },
  emptyStateIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 16px auto",
    color: "#8f9aa6",
  },
  emptyStateText: {
    color: "#8f9aa6",
    fontSize: "1.125rem",
    marginBottom: "8px",
  },
  emptyStateSubtext: { color: "#8f9aa6", fontSize: "0.875rem" },
  diffViewContainer: { display: "flex", flexDirection: "column", gap: "24px" },
  diffViewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "rgba(26, 31, 37, 0.6)",
    borderRadius: "8px",
  },
  diffViewContent: {
    border: "1px solid rgba(35, 217, 217, 0.2)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  diffContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  diffStatsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "0.875rem",
    color: "#d1d5db",
  },
  diffBadgeAdded: { color: "#22c55e" },
  diffBadgeRemoved: { color: "#ef4444" },
  diffList: { display: "flex", flexDirection: "column", gap: "8px" },
  diffItemBase: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "0.875rem",
    color: "#d1d5db",
  },
  diffItemRemoved: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "0.875rem",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  diffTextRemoved: { color: "#ef4444", textDecoration: "line-through" },
  diffItemAdded: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "0.875rem",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  diffTextAdded: { color: "#22c55e" },
  diffItemUnchanged: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "0.875rem",
  },
  diffTextUnchanged: { color: "#8f9aa6" },
  diffSymbol: { fontFamily: "monospace", color: "inherit" },
  timelineContainer: { display: "flex", flexDirection: "column", gap: "0" },
  timelineEntry: {
    borderLeft: "2px solid rgba(35, 217, 217, 0.3)",
    paddingLeft: "16px",
    paddingBottom: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#23d9d9",
      backgroundColor: "rgba(26, 31, 37, 0.6)",
    },
  },
  timelineEntrySelected: {
    borderColor: "#23d9d9",
    backgroundColor: "rgba(26, 31, 37, 0.6)",
  },
  timelineHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  timelineTimestamp: { fontSize: "0.875rem", color: "#8f9aa6" },
  timelineDiffStats: { display: "flex", gap: "4px" },
  timelineDiffBadgeAdded: { fontSize: "0.75rem", color: "#22c55e" },
  timelineDiffBadgeRemoved: { fontSize: "0.75rem", color: "#ef4444" },
  timelineReasoning: {
    fontSize: "0.875rem",
    color: "#8f9aa6",
    marginBottom: "8px",
  },
  timelinePrincipleCount: { fontSize: "0.75rem", color: "#8f9aa6" },

  // New styles for triggering scenarios and enhanced timeline
  triggeringScenarioCard: {
    marginTop: "12px",
    marginBottom: "12px",
    padding: "16px",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "8px",
  },
  triggeringScenarioHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  triggeringScenarioIcon: {
    fontSize: "16px",
  },
  triggeringScenarioTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#60a5fa",
    margin: 0,
  },
  triggeringScenarioContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  scenarioTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#e5e7eb",
    margin: 0,
    lineHeight: "1.4",
  },
  scenarioDescription: {
    fontSize: "13px",
    color: "#d1d5db",
    lineHeight: "1.5",
    margin: 0,
  },
  scenarioOutcome: {
    padding: "8px 12px",
    backgroundColor: "rgba(26, 31, 37, 0.6)",
    borderRadius: "6px",
    borderLeft: "3px solid #60a5fa",
  },
  outcomeLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#9ca3af",
    display: "block",
    marginBottom: "4px",
  },
  outcomeText: {
    fontSize: "13px",
    color: "#e5e7eb",
    lineHeight: "1.4",
  },
  scenarioCategory: {
    fontSize: "11px",
    color: "#60a5fa",
    borderColor: "rgba(59, 130, 246, 0.4)",
    alignSelf: "flex-start",
  },
  reasoningCard: {
    marginTop: "12px",
    marginBottom: "12px",
    padding: "16px",
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "8px",
  },
  reasoningHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  reasoningIcon: {
    fontSize: "16px",
  },
  reasoningTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#c084fc",
    margin: 0,
  },
  timelineFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(35, 217, 217, 0.2)",
  },
  learningMetrics: {
    display: "flex",
    gap: "16px",
  },
  metricItem: {
    fontSize: "11px",
    color: "#8f9aa6",
    fontWeight: "500",
  },

  // Recent Changes tab styles
  changesIcon: {
    fontSize: "20px",
  },
  recentChangesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  versionComparisonHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "rgba(26, 31, 37, 0.6)",
    borderRadius: "8px",
    border: "1px solid rgba(35, 217, 217, 0.2)",
  },
  versionBadgeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  currentVersionBadge: {
    backgroundColor: "#23d9d9",
    color: "#000",
    fontWeight: "600",
  },
  vsText: {
    color: "#8f9aa6",
    fontWeight: "500",
    fontSize: "14px",
  },
  previousVersionBadge: {
    borderColor: "rgba(35, 217, 217, 0.4)",
    color: "#23d9d9",
    fontWeight: "500",
  },
  changeTimestamp: {
    fontSize: "13px",
    color: "#8f9aa6",
  },
  latestTriggeringScenario: {
    padding: "20px",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    border: "2px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "12px",
  },
  latestScenarioHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  scenarioHeaderIcon: {
    fontSize: "20px",
  },
  latestScenarioTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#60a5fa",
    margin: 0,
  },
  latestScenarioCard: {
    padding: "16px",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    borderRadius: "8px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  latestScenarioName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#e5e7eb",
    margin: "0 0 8px 0",
  },
  latestScenarioDesc: {
    fontSize: "14px",
    color: "#d1d5db",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  latestScenarioOutcome: {
    padding: "12px",
    backgroundColor: "rgba(11, 14, 17, 0.8)",
    borderRadius: "6px",
    borderLeft: "4px solid #60a5fa",
  },
  latestOutcomeLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#9ca3af",
    display: "block",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  latestOutcomeText: {
    fontSize: "14px",
    color: "#e5e7eb",
    lineHeight: "1.5",
  },
  changesSummary: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  changesSummaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(35, 217, 217, 0.2)",
  },
  changesSummaryTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#e5e7eb",
    margin: 0,
  },
  changesBadges: {
    display: "flex",
    gap: "8px",
  },
  addedBadge: {
    color: "#22c55e",
    borderColor: "rgba(34, 197, 94, 0.4)",
    fontWeight: "600",
  },
  removedBadge: {
    color: "#ef4444",
    borderColor: "rgba(239, 68, 68, 0.4)",
    fontWeight: "600",
  },
  sideBySideChanges: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  addedColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  removedColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  noChangesPlaceholder: {
    padding: "20px",
    backgroundColor: "rgba(75, 85, 99, 0.1)",
    border: "1px dashed rgba(75, 85, 99, 0.4)",
    borderRadius: "8px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "14px",
    fontStyle: "italic",
  },
  changesSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  changesSectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#e5e7eb",
    margin: 0,
  },
  principleChanges: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  addedPrinciple: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: "8px",
  },
  addedPrincipleIcon: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#22c55e",
    flexShrink: 0,
    fontFamily: "monospace",
  },
  addedPrincipleText: {
    fontSize: "14px",
    color: "#e5e7eb",
    lineHeight: "1.5",
  },
  removedPrinciple: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
  },
  removedPrincipleIcon: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#ef4444",
    flexShrink: 0,
    fontFamily: "monospace",
  },
  removedPrincipleText: {
    fontSize: "14px",
    color: "#d1d5db",
    lineHeight: "1.5",
    textDecoration: "line-through",
    opacity: 0.8,
  },
  reasoningExplanation: {
    padding: "16px",
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    border: "1px solid rgba(168, 85, 247, 0.3)",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#e5e7eb",
    lineHeight: "1.6",
  },
  exportContainer: {
    position: "relative",
    display: "inline-block",
  },
  exportButton: {
    backgroundColor: "rgba(35, 217, 217, 0.1)",
    color: "#23d9d9",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    "&:hover": {
      backgroundColor: "rgba(35, 217, 217, 0.2)",
      borderColor: "rgba(35, 217, 217, 0.4)",
    },
  },
  exportMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "4px",
    backgroundColor: "rgba(26, 31, 37, 0.95)",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "8px",
    padding: "8px 0",
    minWidth: "160px",
    zIndex: 50,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
  },
  exportMenuItem: {
    width: "100%",
    padding: "10px 16px",
    fontSize: "14px",
    color: "#d1d5db",
    backgroundColor: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(35, 217, 217, 0.1)",
      color: "#23d9d9",
    },
  },
};

export default AgentConstitutionManager;
