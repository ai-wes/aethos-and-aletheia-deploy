import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Brain,
  Compass,
  Target,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Database,
  Clock,
} from "lucide-react";
import apiService from "../services/api";

const ETHICAL_FRAMEWORKS = {
  utilitarian: {
    name: "Utilitarian",
    color: "bg-green-500",
    description: "Maximizing overall well-being and happiness",
    keywords: ["consequences", "greatest good", "utility", "outcomes"],
  },
  deontological: {
    name: "Deontological",
    color: "bg-blue-500",
    description: "Duty-based ethics and moral rules",
    keywords: ["duty", "rights", "categorical imperative", "universal law"],
  },
  virtue_ethics: {
    name: "Virtue Ethics",
    color: "bg-purple-500",
    description: "Character-based ethics and moral virtues",
    keywords: ["character", "virtue", "flourishing", "excellence"],
  },
  ai_safety: {
    name: "AI Safety",
    color: "bg-red-500",
    description: "AI alignment and safety considerations",
    keywords: ["alignment", "control problem", "existential risk"],
  },
  buddhist: {
    name: "Buddhist",
    color: "bg-orange-500",
    description: "Compassion and non-harm principles",
    keywords: ["compassion", "non-harm", "mindfulness", "interdependence"],
  },
  confucian: {
    name: "Confucian",
    color: "bg-yellow-500",
    description: "Social harmony and relationships",
    keywords: ["benevolence", "social harmony", "relationships", "propriety"],
  },
  stoic: {
    name: "Stoic",
    color: "bg-gray-500",
    description: "Virtue and rational acceptance",
    keywords: ["virtue", "reason", "acceptance", "resilience"],
  },
  care_ethics: {
    name: "Care Ethics",
    color: "bg-pink-500",
    description: "Relationships and responsibility",
    keywords: ["care", "relationships", "responsibility", "empathy"],
  },
};

const EnhancedWisdomOracle = ({
  scenario,
  action,
  justification,
  onCritiqueGenerated,
}) => {
  const [selectedFrameworks, setSelectedFrameworks] = useState([
    "utilitarian",
    "deontological",
    "virtue_ethics",
    "ai_safety",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [critique, setCritique] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentFramework, setCurrentFramework] = useState(null);
  const [frameworkResults, setFrameworkResults] = useState({});
  const [alignmentScore, setAlignmentScore] = useState(null);
  const [dominantEthic, setDominantEthic] = useState(null);

  useEffect(() => {
    loadPerformanceStats();
  }, []);

  const loadPerformanceStats = async () => {
    try {
      const stats = await apiService.getPerformanceStats();
      setPerformanceStats(stats);
    } catch (error) {
      console.error("Failed to load performance stats:", error);
    }
  };

  const toggleFramework = (frameworkId) => {
    setSelectedFrameworks((prev) =>
      prev.includes(frameworkId)
        ? prev.filter((id) => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const generateCritique = async () => {
    if (
      !scenario ||
      !action ||
      !justification ||
      selectedFrameworks.length === 0
    ) {
      setError(
        "Please provide scenario, action, justification, and select at least one framework"
      );
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCritique(null);
    setFrameworkResults({});
    setCurrentFramework(null);

    try {
      // Simulate progressive framework analysis
      const totalFrameworks = selectedFrameworks.length;
      let completedFrameworks = 0;

      for (const framework of selectedFrameworks) {
        setCurrentFramework(framework);
        setProgress((completedFrameworks / totalFrameworks) * 80);

        // Simulate framework processing delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        completedFrameworks++;
      }

      setProgress(90);
      setCurrentFramework("synthesis");

      // Generate the actual multi-framework critique
      const result = await apiService.generateMultiFrameworkCritique(
        scenario,
        action,
        justification,
        selectedFrameworks
      );

      setCritique(result);
      setFrameworkResults(result.framework_analyses || {});

      // Calculate alignment score and dominant ethic
      calculateAlignmentMetrics(result);

      setProgress(100);
      setCurrentFramework(null);

      if (onCritiqueGenerated) {
        onCritiqueGenerated(result);
      }

      // Refresh performance stats
      loadPerformanceStats();
    } catch (error) {
      console.error("Failed to generate critique:", error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateAlignmentMetrics = (critiqueResult) => {
    if (!critiqueResult.framework_analyses) return;

    const analyses = critiqueResult.framework_analyses;
    const scores = Object.values(analyses).map(
      (analysis) => analysis.relevance_score || 0.5
    );
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    setAlignmentScore(Math.round(avgScore * 100));

    // Find dominant framework
    const frameworkScores = Object.entries(analyses).map(
      ([framework, analysis]) => ({
        framework,
        score: analysis.relevance_score || 0.5,
      })
    );

    const dominant = frameworkScores.reduce((max, current) =>
      current.score > max.score ? current : max
    );

    setDominantEthic(ETHICAL_FRAMEWORKS[dominant.framework]?.name || "Unknown");
  };

  const clearCache = async () => {
    try {
      await apiService.clearWisdomCache();
      loadPerformanceStats();
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  };

  const MoralCompass = () => {
    const compassSize = 200;
    const centerX = compassSize / 2;
    const centerY = compassSize / 2;
    const radius = 80;

    const getFrameworkPosition = (index, total) => {
      const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    };

    return (
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg
            width={compassSize}
            height={compassSize}
            className="transform rotate-0"
          >
            {/* Compass background */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 10}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
              className="opacity-30"
            />

            {/* Framework positions */}
            {selectedFrameworks.map((frameworkId, index) => {
              const framework = ETHICAL_FRAMEWORKS[frameworkId];
              const position = getFrameworkPosition(
                index,
                selectedFrameworks.length
              );
              const result = frameworkResults[frameworkId];
              const relevance = result?.relevance_score || 0;
              const isActive = currentFramework === frameworkId;

              return (
                <g key={frameworkId}>
                  {/* Framework wedge */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={12 + relevance * 8}
                    className={`${framework.color} ${
                      isActive ? "animate-pulse" : ""
                    }`}
                    opacity={isActive ? 1 : relevance * 0.8 + 0.2}
                  />

                  {/* Framework label */}
                  <text
                    x={position.x}
                    y={position.y + 25}
                    textAnchor="middle"
                    className="text-xs font-medium fill-current"
                  >
                    {framework.name}
                  </text>
                </g>
              );
            })}

            {/* Center compass needle */}
            <circle cx={centerX} cy={centerY} r="4" className="fill-gray-800" />

            {/* Compass spokes */}
            {selectedFrameworks.map((_, index) => {
              const position = getFrameworkPosition(
                index,
                selectedFrameworks.length
              );
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={position.x}
                  y2={position.y}
                  stroke="#d1d5db"
                  strokeWidth="1"
                  opacity="0.3"
                />
              );
            })}
          </svg>

          {/* Center alignment score */}
          {alignmentScore !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold">{alignmentScore}%</div>
                <div className="text-xs text-muted-foreground">Alignment</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Aethos Wisdom Network
            </div>
            {performanceStats && (
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline">
                  <Database className="w-3 h-3 mr-1" />
                  Cache: {performanceStats.cache_hit_rate}%
                </Badge>
                <Badge variant="outline">
                  <Activity className="w-3 h-3 mr-1" />
                  {performanceStats.critiques_generated} critiques
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Verdict */}
          {alignmentScore !== null && dominantEthic && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <Badge className="text-lg px-3 py-1">
                Alignment: {alignmentScore}%
              </Badge>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Dominant: {dominantEthic}
              </Badge>
            </div>
          )}

          {/* Framework Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Select Ethical Frameworks:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(ETHICAL_FRAMEWORKS).map(([id, framework]) => (
                <Button
                  key={id}
                  variant={
                    selectedFrameworks.includes(id) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleFramework(id)}
                  className="justify-start"
                  disabled={isGenerating}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${framework.color} mr-2`}
                  />
                  {framework.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={generateCritique}
              disabled={isGenerating || selectedFrameworks.length === 0}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Critique...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Multi-Framework Critique
                </>
              )}
            </Button>

            {performanceStats && (
              <Button variant="outline" onClick={clearCache} size="sm">
                Clear Cache
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          {isGenerating && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {currentFramework === "synthesis"
                    ? "Synthesizing insights..."
                    : currentFramework
                    ? `Analyzing ${ETHICAL_FRAMEWORKS[currentFramework]?.name}...`
                    : "Preparing analysis..."}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Moral Compass Visualization */}
      {(critique || isGenerating) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5" />
              Moral Compass
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoralCompass />
          </CardContent>
        </Card>
      )}

      {/* Critique Results */}
      {critique && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="frameworks">Framework Analysis</TabsTrigger>
            <TabsTrigger value="sources">Sources & Evidence</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Synthesis & Core Tensions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {critique.core_tension && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Core Ethical Tension:
                      </h4>
                      <p className="text-muted-foreground bg-yellow-50 p-3 rounded">
                        {critique.core_tension}
                      </p>
                    </div>
                  )}

                  {critique.synthesis && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Philosophical Synthesis:
                      </h4>
                      <p className="text-muted-foreground">
                        {critique.synthesis}
                      </p>
                    </div>
                  )}

                  {critique.recommendations && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {critique.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4">
            {Object.entries(frameworkResults).map(([frameworkId, analysis]) => {
              const framework = ETHICAL_FRAMEWORKS[frameworkId];
              if (!framework) return null;

              return (
                <Card key={frameworkId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full ${framework.color}`}
                      />
                      {framework.name} Analysis
                      <Badge variant="outline">
                        {Math.round((analysis.relevance_score || 0) * 100)}%
                        relevance
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-muted-foreground">
                        {analysis.analysis || "No analysis available"}
                      </p>

                      {analysis.key_principles && (
                        <div>
                          <h5 className="font-medium mb-1">Key Principles:</h5>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {analysis.key_principles.map((principle, index) => (
                              <li key={index}>{principle}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.verdict && (
                        <div className="bg-gray-50 p-3 rounded">
                          <h5 className="font-medium mb-1">Verdict:</h5>
                          <p className="text-sm">{analysis.verdict}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Philosophical Sources & Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                {critique.sources && critique.sources.length > 0 ? (
                  <div className="space-y-4">
                    {critique.sources.map((source, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-blue-200 pl-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            Relevance:{" "}
                            {Math.round((source.relevance_score || 0) * 100)}%
                          </Badge>
                          {source.framework && (
                            <Badge
                              className={
                                ETHICAL_FRAMEWORKS[source.framework]?.color
                              }
                            >
                              {ETHICAL_FRAMEWORKS[source.framework]?.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {source.text || source.content}
                        </p>
                        {source.author && (
                          <p className="text-xs text-muted-foreground">
                            — {source.author}{" "}
                            {source.work && `(${source.work})`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No sources available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedWisdomOracle;
