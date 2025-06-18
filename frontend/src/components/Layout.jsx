import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Gavel,
  Activity,
  User,
  Plus,
  RefreshCw,
  BarChart3,
  Target,
  Brain,
  Compass,
  FileText,
  AlertCircle,
  Lightbulb,
  BookMarked,
  ShieldCheck,
  Upload,
  BookOpen,
  ExternalLink,
} from "lucide-react";

// Import all the new backend integration components
import AletheiaLearningLoop from "./AletheiaLearningLoop";
import AgentConstitutionManager from "./AgentConstitutionManager";
import WisdomOracle from "./WisdomOracle";
import WisdomInsightsSidebar from "./WisdomInsightsSidebar";
import CyclicSystemDiagram from "./CyclicSystemDiagram";
import apiService from "../services/api";

// Import existing components for backward compatibility
import ConnectionStatus from "./ConnectionStatus";
import ConversationalScenarioModal from "./ConversationalScenarioModal";
import AgentNameModal from "./AgentNameModal";
import { useApi } from "../contexts/ApiContext";
import AlignmentCrashTestPlayground from "./AlignmentCrashTestPlayground";
import ScenarioExporter from "./ScenarioExporter";
import MASEvaluator from "./MASEvaluator";
import { css } from "@emotion/react";
import Tooltip from "./ui/tooltip";
import GuidedTour, { TourLauncher } from "./GuidedTour";

// Define the Feature component used in the Playground sidebar
function Feature({ icon, title, body }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "rgba(26, 31, 37, 0.8)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        gap: "8px",
      }}
    >
      <div>{icon}</div>
      <div style={{ fontWeight: 600, color: "#fff", fontSize: "15px" }}>
        {title}
      </div>
      <div style={{ color: "#b0bec5", fontSize: "13px" }}>{body}</div>
    </div>
  );
}

export default function Layout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [focus, setFocus] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isAgentNameModalOpen, setIsAgentNameModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showTourLauncher, setShowTourLauncher] = useState(true);

  // Playground state for testing scenarios
  const [playgroundScenario, setPlaygroundScenario] = useState({
    title: "",
    description: "",
  });
  const [playgroundAction, setPlaygroundAction] = useState("");
  const [playgroundJustification, setPlaygroundJustification] = useState("");

  // Wisdom result state for insights sidebar
  const [currentWisdomResult, setCurrentWisdomResult] = useState(null);

  // Handle navigation to wisdom result sections
  const handleNavigateToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Tour button hover handlers
  const handleTourButtonHover = (e) => {
    e.currentTarget.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
    e.currentTarget.style.borderColor = "rgba(35, 217, 217, 0.3)";
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 15px rgba(35, 217, 217, 0.2)";
  };

  const handleTourButtonLeave = (e) => {
    e.currentTarget.style.backgroundColor = "rgba(26, 31, 37, 0.9)";
    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  };

  // API context for agents and backend data
  const {
    isConnected,
    agents: apiAgents,
    scenarios: apiScenarios,
    error: apiError,
    isLoading: apiLoading,
    refreshData,
  } = useApi();

  // Sync local agents state with API context agents
  useEffect(() => {
    if (apiAgents && apiAgents.length > 0) {
      setAgents(apiAgents);
      // Load selected agent from localStorage if available
      const savedAgentId = localStorage.getItem("aethos-selected-agent-id");
      if (savedAgentId && !selectedAgent) {
        const savedAgent = apiAgents.find((a) => a.agent_id === savedAgentId);
        if (savedAgent) {
          setSelectedAgent(savedAgent);
        }
      }
    }
  }, [apiAgents, selectedAgent]);

  // Combine API scenarios, custom scenarios, and fallback to mock data
  const availableScenarios = [...(apiScenarios.length > 0 ? apiScenarios : [])];

  useEffect(() => {
    initializeApp();
  }, [isConnected]); // Re-run when connection status changes

  useEffect(() => {
    // Listen for navigation event from training review modal
    const handleNavigateToConstitution = (event) => {
      setActiveTab("constitution");
      // The agent should already be selected since they just finished training
      // but we could select it if needed:
      if (event.detail && event.detail.agentId && agents) {
        const agent = agents.find((a) => a.agent_id === event.detail.agentId);
        if (agent) {
          setSelectedAgent(agent);
        }
      }
    };

    window.addEventListener(
      "navigate-to-constitution",
      handleNavigateToConstitution
    );

    return () => {
      window.removeEventListener(
        "navigate-to-constitution",
        handleNavigateToConstitution
      );
    };
  }, [agents]);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setLocalError(null);
      // Agents are loaded by ApiContext automatically
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setLocalError(`Initialization failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabTriggerHover = css`
    &:hover {
      background-color: rgba(35, 217, 217, 0.12) !important;
      color: #23d9d9 !important;
      box-shadow: 0 0 8px 0 #23d9d933;
      transition: background 0.2s, color 0.2s;
    }
  `;

  const createNewAgent = async (agentName) => {
    try {
      const initialConstitution = [
        "Always prioritize human welfare and dignity",
        "Consider the consequences of actions on all stakeholders",
        "Respect individual rights and autonomy",
        "Act with transparency and honesty",
        "Minimize harm while maximizing benefit",
      ];

      const newAgent = await apiService.createAgent(
        initialConstitution,
        agentName || `Agent ${agents.length + 1}`
      );

      // Refresh data from API to get updated agents list
      await refreshData();

      // Set the new agent as selected
      setSelectedAgent(newAgent);
      // Persist new agent selection
      localStorage.setItem("aethos-selected-agent-id", newAgent.agent_id);
    } catch (error) {
      console.error("Failed to create agent:", error);
      setLocalError(`Failed to create agent: ${error.message}`);
    }
  };

  const handleAgentUpdate = (updatedAgent) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.agent_id === updatedAgent.agent_id ? updatedAgent : agent
      )
    );
    if (selectedAgent?.agent_id === updatedAgent.agent_id) {
      setSelectedAgent(updatedAgent);
    }
  };

  const handleAgentDelete = async (agentId) => {
    // Remove agent from local state
    setAgents((prev) => prev.filter((agent) => agent.agent_id !== agentId));

    // Clear selection if the deleted agent was selected
    if (selectedAgent?.agent_id === agentId) {
      setSelectedAgent(null);
      localStorage.removeItem("aethos-selected-agent-id");
    }

    // Refresh data from API to ensure consistency
    await refreshData();
  };

  return (
    <>
      <div style={styles.backgroundLayer}></div>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoSection}>
              <Brain style={styles.logoIcon} />
              <div>
                <h1 style={styles.title}>Aethos & Aletheia</h1>
                <p style={styles.subtitle}>Ethical AI Learning System</p>
              </div>
            </div>

            <Badge
              variant={isConnected ? "default" : "warning"}
              style={styles.statusBadge}
            >
              <Activity style={styles.statusIcon} />
              {isConnected ? "ONLINE" : "OFFLINE"}
            </Badge>
          </div>

          <div style={styles.headerRight}>
            {/* Agent Selector */}
            <div style={styles.agentSelector}>
              <User style={styles.userIcon} />
              <select
                value={selectedAgent?.agent_id || ""}
                onChange={(e) => {
                  const agent = agents.find(
                    (a) => a.agent_id === e.target.value
                  );
                  setSelectedAgent(agent);
                  // Persist selected agent_id to localStorage
                  if (agent) {
                    localStorage.setItem(
                      "aethos-selected-agent-id",
                      agent.agent_id
                    );
                  } else {
                    localStorage.removeItem("aethos-selected-agent-id");
                  }
                }}
                style={styles.select}
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent.agent_id} value={agent.agent_id}>
                    {agent.name || `Agent v${agent.version}`}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => setIsAgentNameModalOpen(true)}
                style={styles.addButton}
              >
                <Plus style={styles.buttonIcon} />
              </Button>
            </div>

            <Button onClick={initializeApp} style={styles.refreshButton}>
              <RefreshCw style={styles.buttonIcon} />
            </Button>

            <ConnectionStatus />

            <Button
              onClick={() => window.open("/docs", "_blank")}
              style={styles.docsButton}
              title="Open Documentation"
            >
              <BookOpen style={styles.buttonIcon} />
              <ExternalLink style={styles.externalIcon} />
            </Button>

            <button
              style={styles.focusBtn}
              onClick={() => setFocus((v) => !v)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#23d9d9";
                e.target.style.color = "#000";
                e.target.style.boxShadow = "0 0 25px 0px #23d9d9";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#23d9d9";
                e.target.style.boxShadow = "0 0 15px -5px #23d9d9";
              }}
            >
              {focus ? "Exit Focus" : "Focus Mode"}
            </button>
          </div>
        </header>

        {(apiError || localError) && (
          <Alert variant="destructive" style={styles.errorAlert}>
            <AlertCircle style={styles.alertIcon} />
            <AlertDescription>{apiError || localError}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <main style={styles.main}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            style={styles.tabs}
          >
            <TabsList style={styles.tabsList}>
              <TabsTrigger value="dashboard" style={styles.tabTrigger}>
                <BarChart3 style={styles.tabIcon} />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="learning" style={styles.tabTrigger}>
                <Compass style={styles.tabIcon} />
                Aletheia Constitutional RL
              </TabsTrigger>

              <TabsTrigger value="oracle" style={styles.tabTrigger}>
                <Compass style={styles.tabIcon} />
                Aethos Wisdom Network
              </TabsTrigger>
              <TabsTrigger value="constitution" style={styles.tabTrigger}>
                <FileText style={styles.tabIcon} />
                Constitution
              </TabsTrigger>
              <TabsTrigger value="playground" style={styles.tabTrigger}>
                <Gavel style={styles.tabIcon} />
                Alignment Crash-Test Playground
              </TabsTrigger>
              <TabsTrigger value="export" style={styles.tabTrigger}>
                <Upload style={styles.tabIcon} />
                Scenario Exporter
              </TabsTrigger>
              <TabsTrigger value="mas" style={styles.tabTrigger}>
                <Target style={styles.tabIcon} />
                MAS Evaluator
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" style={styles.tabContent}>
              <div style={styles.dashboardWrapper}>
                {/* Main Dashboard Content */}
                <div style={styles.dashboardMain}>
                  <div style={styles.dashboardContainer}>
                    {/* Take a Tour */}
                    <div style={styles.quickActionsCard}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Take a Tour</h3>
                      </div>
                      <div style={styles.cardContent}>
                        <div style={styles.tourGrid}>
                          <div style={styles.tourButtonWrapper}>
                            <Tooltip
                              content="Query the Aethos Wisdom Network to explore a multitude of ethical perspectives for a given scenario."
                              position="top"
                              variant="secondary"
                            >
                              <button
                                style={styles.tourButton}
                                onClick={() => setActiveTab("oracle")}
                                onMouseEnter={handleTourButtonHover}
                                onMouseLeave={handleTourButtonLeave}
                              >
                                <div style={styles.tourIcon}>🧭</div>
                                <div style={styles.tourContent}>
                                  <div style={styles.tourTitle}>
                                    Wisdom Network
                                  </div>
                                  <div style={styles.tourDesc}>
                                    Explore ethical perspectives
                                  </div>
                                </div>
                              </button>
                            </Tooltip>
                          </div>

                          <div style={styles.tourButtonWrapper}>
                            <Tooltip
                              content="Conduct a real-time training run of the Aletheia RL Self Correcting agent. Watch it update its own moral constitution and evolve."
                              position="top"
                              variant="secondary"
                            >
                              <button
                                style={styles.tourButton}
                                onClick={() => setActiveTab("learning")}
                                onMouseEnter={handleTourButtonHover}
                                onMouseLeave={handleTourButtonLeave}
                              >
                                <div style={styles.tourIcon}>🧠</div>
                                <div style={styles.tourContent}>
                                  <div style={styles.tourTitle}>
                                    Aletheia Training
                                  </div>
                                  <div style={styles.tourDesc}>
                                    Watch RL agent evolve
                                  </div>
                                </div>
                              </button>
                            </Tooltip>
                          </div>

                          <div style={styles.tourButtonWrapper}>
                            <Tooltip
                              content="Red-team your best proposed AI Ethics principle in the Alignment Crash-Test Playground. Identify critical red-teamed loopholes in your AI alignment directives."
                              position="top"
                              variant="secondary"
                            >
                              <button
                                style={styles.tourButton}
                                onClick={() => setActiveTab("playground")}
                                onMouseEnter={handleTourButtonHover}
                                onMouseLeave={handleTourButtonLeave}
                              >
                                <div style={styles.tourIcon}>⚡</div>
                                <div style={styles.tourContent}>
                                  <div style={styles.tourTitle}>
                                    Crash-Test Playground
                                  </div>
                                  <div style={styles.tourDesc}>
                                    Red-team AI principles
                                  </div>
                                </div>
                              </button>
                            </Tooltip>
                          </div>

                          <div style={styles.tourButtonWrapper}>
                            <Tooltip
                              content="Utilize the Scenario Dataset Exporter to create formatted training data for your own custom finetuning runs."
                              position="top"
                              variant="secondary"
                            >
                              <button
                                style={styles.tourButton}
                                onClick={() => setActiveTab("exporter")}
                                onMouseEnter={handleTourButtonHover}
                                onMouseLeave={handleTourButtonLeave}
                              >
                                <div style={styles.tourIcon}>📊</div>
                                <div style={styles.tourContent}>
                                  <div style={styles.tourTitle}>
                                    Dataset Exporter
                                  </div>
                                  <div style={styles.tourDesc}>
                                    Create training data
                                  </div>
                                </div>
                              </button>
                            </Tooltip>
                          </div>

                          <div style={styles.tourButtonWrapper}>
                            <Tooltip
                              content="Try out the Moral-Alignment Score Evaluation System to evaluate your ML models' ethical alignment."
                              position="top"
                              variant="secondary"
                            >
                              <button
                                style={styles.tourButton}
                                onClick={() => setActiveTab("mas")}
                                onMouseEnter={handleTourButtonHover}
                                onMouseLeave={handleTourButtonLeave}
                              >
                                <div style={styles.tourIcon}>📈</div>
                                <div style={styles.tourContent}>
                                  <div style={styles.tourTitle}>
                                    MAS Evaluator
                                  </div>
                                  <div style={styles.tourDesc}>
                                    Evaluate model alignment
                                  </div>
                                </div>
                              </button>
                            </Tooltip>
                          </div>

                          <div style={styles.tourButtonWrapper}>
                            <Tooltip
                              content="Explore the API documentation to take a deeper dive into the Aethos and Aletheia Ethical Alignment Platform."
                              position="top"
                              variant="secondary"
                            >
                              <button
                                style={styles.tourButton}
                                onClick={() => window.open("/docs", "_blank")}
                                onMouseEnter={handleTourButtonHover}
                                onMouseLeave={handleTourButtonLeave}
                              >
                                <div style={styles.tourIcon}>📚</div>
                                <div style={styles.tourContent}>
                                  <div style={styles.tourTitle}>
                                    API Documentation
                                  </div>
                                  <div style={styles.tourDesc}>
                                    Deep dive into platform
                                  </div>
                                </div>
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cyclic System Diagram */}
                <div style={styles.dashboardSidebar}>
                  <CyclicSystemDiagram onNavigate={setActiveTab} />
                </div>
              </div>
            </TabsContent>

            {/* Learning Loop Tab */}
            <TabsContent value="learning" style={styles.tabContent}>
              {!isConnected ? (
                <Card style={styles.placeholderCard}>
                  <CardContent style={styles.placeholderContent}>
                    <p style={styles.placeholderText}>
                      Backend server required for learning loop functionality
                    </p>
                    <p style={styles.placeholderSubtext}>
                      Start the backend server with: python app.py
                    </p>
                  </CardContent>
                </Card>
              ) : selectedAgent ? (
                <AletheiaLearningLoop
                  agentId={selectedAgent.agent_id}
                  onAgentUpdate={handleAgentUpdate}
                />
              ) : (
                <AletheiaLearningLoop
                  agentId={null}
                  onAgentUpdate={handleAgentUpdate}
                  onAgentCreate={(newAgent) => {
                    setAgents([...agents, newAgent]);
                    setSelectedAgent(newAgent);
                    localStorage.setItem(
                      "aethos-selected-agent-id",
                      newAgent.agent_id
                    );
                  }}
                  onAgentSelect={(agent) => {
                    setSelectedAgent(agent);
                    localStorage.setItem(
                      "aethos-selected-agent-id",
                      agent.agent_id
                    );
                  }}
                  onAgentDelete={handleAgentDelete}
                  availableAgents={agents}
                />
              )}
            </TabsContent>

            {/* Aethos Wisdom Network Tab */}
            <TabsContent value="oracle" style={styles.tabContent}>
              {!isConnected ? (
                <Card style={styles.placeholderCard}>
                  <CardContent style={styles.placeholderContent}>
                    <p style={styles.placeholderText}>
                      Backend server required for wisdom network functionality
                    </p>
                    <p style={styles.placeholderSubtext}>
                      Start the backend server with: python app.py
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div style={styles.wisdomNetworkLayout}>
                  {/* Main Wisdom Oracle */}
                  <div style={styles.wisdomNetworkMain}>
                    <Card style={styles.wisdomNetworkCard}>
                      <WisdomOracle
                        scenario={playgroundScenario}
                        action={playgroundAction}
                        justification={playgroundJustification}
                        onWisdomResult={setCurrentWisdomResult}
                      />
                    </Card>
                  </div>

                  {/* Wisdom Network Sidebar */}
                  <div style={styles.wisdomNetworkSidebar}>
                    <WisdomInsightsSidebar
                      wisdomResult={currentWisdomResult}
                      onNavigateToSection={handleNavigateToSection}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Constitution Manager Tab */}
            <TabsContent value="constitution" style={styles.tabContent}>
              {!isConnected ? (
                <Card style={styles.placeholderCard}>
                  <CardContent style={styles.placeholderContent}>
                    <p style={styles.placeholderText}>
                      Backend server required for constitution management
                    </p>
                    <p style={styles.placeholderSubtext}>
                      Start the backend server with: python app.py
                    </p>
                  </CardContent>
                </Card>
              ) : selectedAgent ? (
                <AgentConstitutionManager
                  agentId={selectedAgent.agent_id}
                  onConstitutionUpdate={handleAgentUpdate}
                />
              ) : (
                <Card style={styles.placeholderCard}>
                  <CardContent style={styles.placeholderContent}>
                    <p style={styles.placeholderText}>
                      Please select an agent to manage its constitution
                    </p>
                    <Button
                      onClick={() => setIsAgentNameModalOpen(true)}
                      style={styles.createButton}
                    >
                      <Plus style={styles.buttonIcon} />
                      Create New Agent
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Playground Tab (Original Wisdom Oracle) */}
            <TabsContent value="playground" style={styles.tabContent}>
              <div style={styles.playgroundWrapper}>
                {/* Main Playground Content */}
                <div style={styles.playgroundMain}>
                  <Card style={styles.playgroundCard}>
                    <AlignmentCrashTestPlayground />
                  </Card>
                </div>

                {/* Playground Sidebar */}
                <div style={styles.playgroundSidebar}>
                  {/* Playground Guide */}
                  <div style={styles.playgroundGuideCard}>
                    {/* Features Section */}
                    <div style={styles.featuresSection}>
                      <div style={styles.featuresGrid}>
                        <Feature
                          icon={<Lightbulb className="h-6 w-6" />}
                          title="Instant Stress-Test"
                          body="Generates adversarial prompts & scores risk 1-10 so you patch before deployment."
                        />
                        <Feature
                          icon={<BookMarked className="h-6 w-6" />}
                          title="Cited Wisdom"
                          body="Each loophole is backed by passages from Kant, Mill, Rawls & more—ready for compliance reports."
                        />
                        <Feature
                          icon={<ShieldCheck className="h-6 w-6" />}
                          title="Live Feedback Loop"
                          body="Thumb-ups/down feed our RLHF reward model, tightening guard-rails over time."
                        />
                      </div>
                    </div>

                    {/* Why Section */}
                    <div style={styles.whySection}>
                      <h3 style={styles.sidebarSectionTitle}>Why it matters</h3>
                      <ul style={styles.reasonsList}>
                        <li style={styles.reasonItem}>
                          <strong>Shift-left safety.</strong> Find alignment
                          failures while the model’s still in dev.
                        </li>
                        <li style={styles.reasonItem}>
                          <strong>Explainability.</strong> Full reasoning chain
                          & citations for every red-team finding.
                        </li>
                        <li style={styles.reasonItem}>
                          <strong>Continuous learning.</strong> Every test
                          becomes new training signal for the Moral-Compass
                          layer.
                        </li>
                      </ul>
                    </div>

                    {/* How Section */}
                    <div style={styles.howSection}>
                      <h3 style={styles.sidebarSectionTitle}>
                        How it works under the hood
                      </h3>
                      <ol style={styles.stepsList}>
                        <li style={styles.stepItem}>
                          <em>Vector search</em> pulls semantically-similar
                          wisdom from the Aethos corpus.
                        </li>
                        <li style={styles.stepItem}>
                          <em>Gemini Flash</em> acts as the adversary, crafting
                          exploit prompts.
                        </li>
                        <li style={styles.stepItem}>
                          <em>Risk model</em> (RLHF-tuned) scores severity &
                          suggests mitigations.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" style={styles.tabContent}>
              {!isConnected ? (
                <Card style={styles.placeholderCard}>
                  <CardContent style={styles.placeholderContent}>
                    <p style={styles.placeholderText}>
                      Backend server required for export functionality
                    </p>
                    <p style={styles.placeholderSubtext}>
                      Start the backend server with: python app.py
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ScenarioExporter />
              )}
            </TabsContent>

            {/* MAS Evaluator Tab */}
            <TabsContent value="mas" style={styles.tabContent}>
              {!isConnected ? (
                <Card style={styles.placeholderCard}>
                  <CardContent style={styles.placeholderContent}>
                    <p style={styles.placeholderText}>
                      Backend server required for MAS evaluation functionality
                    </p>
                    <p style={styles.placeholderSubtext}>
                      Start the backend server with: python app.py
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <MASEvaluator />
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Conversational Scenario Modal */}
        <ConversationalScenarioModal
          isOpen={isScenarioModalOpen}
          onClose={() => setIsScenarioModalOpen(false)}
          onSubmit={(scenario) => {
            setPlaygroundScenario(scenario);
            setActiveTab("oracle"); // Navigate to wisdom oracle
          }}
        />

        {/* Agent Name Modal */}
        <AgentNameModal
          isOpen={isAgentNameModalOpen}
          onClose={() => setIsAgentNameModalOpen(false)}
          onSubmit={(agentName) => {
            createNewAgent(agentName);
          }}
        />

        {/* Guided Tour */}
        <GuidedTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onComplete={() => {
            setIsTourOpen(false);
            setShowTourLauncher(false);
            localStorage.setItem("aethos-tour-completed", "true");
          }}
        />

        {/* Tour Launcher */}
        {showTourLauncher && (
          <TourLauncher
            onStart={() => {
              setIsTourOpen(true);
              setShowTourLauncher(false);
            }}
          />
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "95vh",
    position: "relative",
    color: "#cfd8e3",
    fontFamily: "Inter, sans-serif",
  },
  backgroundLayer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, #0b0e11 0%, #1a1e23 50%, #0f1419 100%)",
    backgroundImage: "url('/assets/images/dashboard-bg-dark.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundBlendMode: "overlay",
    filter: "blur(2px)",
    zIndex: -1,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(35, 217, 217, 0.2)",
    borderTop: "4px solid #23d9d9",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  loadingText: {
    color: "#8f9aa6",
    fontSize: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "rgba(11, 14, 17, 0.8)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "32px",
    height: "32px",
    color: "#23d9d9",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
    color: "#fff",
    textShadow:
      "0 0 10px rgba(255, 195, 77, 0.3), 0 0 20px rgba(35, 217, 217, 0.2)",
  },
  subtitle: {
    margin: 0,
    fontSize: "12px",
    color: "#8f9aa6",
  },
  statusBadge: {
    backgroundColor: "rgba(35, 217, 217, 0.2)",
    color: "#23d9d9",
    border: "1px solid #23d9d9",
  },
  statusIcon: {
    width: "12px",
    height: "12px",
    marginRight: "4px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  agentSelector: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userIcon: {
    width: "16px",
    height: "16px",
    color: "#8f9aa6",
  },
  select: {
    padding: "6px 12px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    color: "#cfd8e3",
    fontSize: "14px",
  },
  addButton: {
    padding: "6px",
    backgroundColor: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    color: "#8f9aa6",
  },
  refreshButton: {
    padding: "6px",
    backgroundColor: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    color: "#8f9aa6",
  },
  docsButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 8px",
    backgroundColor: "rgba(35, 217, 217, 0.1)",
    border: "1px solid #23d9d9",
    borderRadius: "6px",
    color: "#23d9d9",
    fontSize: "12px",
    fontWeight: "500",
  },
  buttonIcon: {
    width: "16px",
    height: "16px",
  },
  externalIcon: {
    width: "12px",
    height: "12px",
    opacity: 0.7,
  },
  focusBtn: {
    background: "transparent",
    color: "#23d9d9",
    border: "2px solid #23d9d9",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    boxShadow: "0 0 15px -5px #23d9d9",
  },
  errorAlert: {
    margin: "16px 24px",
  },
  alertIcon: {
    width: "16px",
    height: "16px",
  },
  main: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    height: "95vh",
    minHeight: 0,
    marginBottom: "16px",
  },
  tabs: {
    width: "97%",
    height: "97%",
    display: "flex",
    flexDirection: "column",
  },
  tabsList: {
    display: "flex",
    width: "100%",
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "4px",
    gap: "2px",
    overflow: "hidden",
  },
  tabTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 8px",
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    transition: "all 0.3s ease",
    flex: "1 1 0",
    minWidth: "0",
    justifyContent: "center",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    "&:hover": {
      backgroundColor: "rgba(17, 172, 186, 0.559)",
    },
  },
  tabIcon: {
    width: "14px",
    height: "14px",
    flexShrink: 0,
    "&:hover": {
      backgroundColor: "rgba(17, 172, 186, 0.559)",
    },
  },
  tabContent: {
    marginTop: "24px",
    flex: 1,
    paddingBottom: "24px",
    minHeight: 0,
  },
  dashboardWrapper: {
    display: "flex",
    gap: "24px",
    height: "100%",
    width: "100%",
  },
  dashboardMain: {
    flex: "0 0 50%",
    maxWidth: "50%",
    minWidth: "400px",
  },
  dashboardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    height: "100%",
  },
  dashboardSidebar: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowY: "auto",
    paddingLeft: "8px",
  },
  statsCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  analyticsCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  scenarioCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  cardHeader: {
    marginBottom: "12px",
  },
  cardTitle: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
  },
  statBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#23d9d9",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "11px",
    color: "#8f9aa6",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  },
  metricCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
  },
  metricIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },
  metricContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  metricTitle: {
    fontSize: "11px",
    color: "#8f9aa6",
    marginBottom: "2px",
  },
  metricValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
  },
  offlineState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px",
    textAlign: "center",
  },
  offlineIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  offlineText: {
    color: "#8f9aa6",
    fontSize: "14px",
    marginBottom: "8px",
    margin: 0,
  },
  offlineSubtext: {
    color: "#6b7280",
    fontSize: "12px",
    fontFamily: "monospace",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: "6px 8px",
    borderRadius: "4px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  scenarioContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  scenarioTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    margin: 0,
  },
  scenarioDescription: {
    fontSize: "12px",
    color: "#b0bec5",
    lineHeight: "1.4",
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  scenarioMeta: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  scenarioBadge: {
    backgroundColor: "rgba(35, 217, 217, 0.2)",
    color: "#23d9d9",
    border: "1px solid #23d9d9",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  placeholderCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
  },
  placeholderContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px",
    textAlign: "center",
  },
  placeholderText: {
    color: "#8f9aa6",
    marginBottom: "16px",
    fontSize: "16px",
  },
  placeholderSubtext: {
    color: "#6b7280",
    fontSize: "14px",
    fontFamily: "monospace",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
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
    fontWeight: "500",
    cursor: "pointer",
  },
  playgroundCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    height: "calc(100vh - 160px)",
    overflow: "hidden",
  },
  playgroundForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#fff",
  },
  input: {
    padding: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    color: "#cfd8e3",
    fontSize: "14px",
  },
  textarea: {
    padding: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    color: "#cfd8e3",
    fontSize: "14px",
    minHeight: "96px",
    resize: "vertical",
  },
  textareaSmall: {
    padding: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    color: "#cfd8e3",
    fontSize: "14px",
    minHeight: "80px",
    resize: "vertical",
  },
  welcomeCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  welcomeText: {
    color: "#b0bec5",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "16px",
    margin: 0,
  },
  welcomeFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 0",
  },
  featureIcon: {
    fontSize: "16px",
    width: "20px",
    textAlign: "center",
  },
  featureText: {
    color: "#cfd8e3",
    fontSize: "12px",
    fontWeight: "500",
  },
  tutorialCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  tutorialSteps: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tutorialStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "8px 0",
  },
  stepNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    backgroundColor: "#23d9d9",
    color: "#000",
    borderRadius: "50%",
    fontSize: "12px",
    fontWeight: "600",
    flexShrink: 0,
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  stepTitle: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  stepDescription: {
    color: "#8f9aa6",
    fontSize: "11px",
    lineHeight: "1.4",
  },
  systemInfoCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  systemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  systemInfoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  systemInfoLabel: {
    color: "#8f9aa6",
    fontSize: "12px",
    fontWeight: "500",
  },
  systemInfoValue: {
    color: "#cfd8e3",
    fontSize: "12px",
    fontWeight: "600",
  },

  playgroundWrapper: {
    display: "flex",
    gap: "24px",
    height: "100%",
    width: "100%",
    alignItems: "flex-start",
  },
  playgroundMain: {
    flex: "2",
    maxWidth: "none",
    minWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  playgroundSidebar: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowY: "auto",
    paddingLeft: "16px",
    minWidth: "350px",
    maxWidth: "400px",
  },
  playgroundGuideCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "20px",
    height: "calc(100vh - 200px)",
    overflowY: "auto",
  },
  guideText: {
    color: "#b0bec5",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  guideSteps: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  guideStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "8px 0",
  },
  guideStepNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    backgroundColor: "#23d9d9",
    color: "#000",
    borderRadius: "50%",
    fontSize: "12px",
    fontWeight: "600",
    flexShrink: 0,
  },
  guideStepContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  guideStepTitle: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  guideStepDesc: {
    color: "#8f9aa6",
    fontSize: "11px",
    lineHeight: "1.4",
  },
  exampleScenariosCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  exampleScenarios: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  exampleScenario: {
    padding: "12px",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  exampleTitle: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  exampleDesc: {
    color: "#8f9aa6",
    fontSize: "11px",
    lineHeight: "1.4",
  },
  frameworksCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  frameworks: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  framework: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
  },
  frameworkIcon: {
    fontSize: "18px",
    flexShrink: 0,
  },
  frameworkContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  frameworkName: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  frameworkDesc: {
    color: "#8f9aa6",
    fontSize: "11px",
    lineHeight: "1.4",
  },
  quickActionsCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  quickActionButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px 12px",
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center",
  },
  quickActionIcon: {
    fontSize: "24px",
    lineHeight: 1,
  },
  quickActionContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  quickActionTitle: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  quickActionDesc: {
    color: "#8f9aa6",
    fontSize: "11px",
    lineHeight: "1.3",
  },
  tourGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    width: "100%",
    gridAutoRows: "minmax(120px, auto)",
  },
  tourButtonWrapper: {
    display: "flex",
    width: "100%",
    height: "100%",
  },
  tourButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "20px 16px",
    backgroundColor: "rgba(26, 31, 37, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center",
    minHeight: "140px",
    justifyContent: "center",
    width: "175px",

    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: "inherit",
  },
  tourIcon: {
    fontSize: "32px",
    lineHeight: 1,
    marginBottom: "4px",
  },
  tourContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "center",
    width: "100%",
  },
  tourTitle: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: "1.2",
  },
  tourDesc: {
    color: "#8f9aa6",
    fontSize: "12px",
    lineHeight: "1.3",
    textAlign: "center",
    maxWidth: "140px",
  },
  wisdomNetworkLayout: {
    display: "flex",
    gap: "24px",
    height: "100%",
    width: "100%",
    alignItems: "flex-start",
  },
  wisdomNetworkMain: {
    flex: "2",
    maxWidth: "none",
    minWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  wisdomNetworkSidebar: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowY: "auto",
    paddingLeft: "16px",
    minWidth: "350px",
    maxWidth: "400px",
  },
  wisdomNetworkCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    height: "90vh",
    overflow: "hidden",
  },
  wisdomNetworkGuideCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    height: "fit-content",
  },
  wisdomFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "16px",
  },
  wisdomFeature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  wisdomFeatureIcon: {
    fontSize: "18px",
    width: "24px",
    textAlign: "center",
  },
  wisdomFeatureText: {
    color: "#e0e6eb",
    fontSize: "14px",
    fontWeight: "500",
  },
  featuresSection: {
    marginBottom: "24px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  whySection: {
    marginBottom: "20px",
  },
  howSection: {
    marginBottom: "20px",
  },
  sidebarSectionTitle: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    marginTop: "0",
  },
  reasonsList: {
    margin: "0",
    paddingLeft: "16px",
    listStyle: "none",
  },
  reasonItem: {
    color: "#b0bec5",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "8px",
    position: "relative",
    paddingLeft: "0",
  },
  stepsList: {
    margin: "0",
    paddingLeft: "16px",
    counterReset: "step-counter",
  },
  stepItem: {
    color: "#b0bec5",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "8px",
    position: "relative",
    paddingLeft: "0",
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
