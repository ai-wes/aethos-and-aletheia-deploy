import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Brain,
  Target,
  Clock,
  Database,
  Zap,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
} from "lucide-react";
import apiService from "../services/api";

const FRAMEWORK_COLORS = {
  utilitarian: "#10b981",
  deontological: "#3b82f6",
  virtue_ethics: "#8b5cf6",
  ai_safety: "#ef4444",
  buddhist: "#f97316",
  confucian: "#eab308",
  stoic: "#6b7280",
  care_ethics: "#ec4899",
};

const AnalyticsDashboard = ({ agentId }) => {
  const [systemAnalytics, setSystemAnalytics] = useState(null);
  const [decisionQualityMetrics, setDecisionQualityMetrics] = useState(null);
  const [frameworkUsageStats, setFrameworkUsageStats] = useState(null);
  const [constitutionEvolution, setConstitutionEvolution] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [agentId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [
        systemData,
        decisionData,
        frameworkData,
        evolutionData,
        performanceData,
        healthData,
      ] = await Promise.all([
        apiService.getSystemAnalytics(),
        agentId ? apiService.getDecisionQualityMetrics(agentId) : null,
        apiService.getFrameworkUsageStats(),
        agentId ? apiService.getConstitutionEvolution(agentId) : null,
        apiService.getPerformanceStats(),
        apiService.getSystemHealth(),
      ]);

      setSystemAnalytics(systemData);
      setDecisionQualityMetrics(decisionData);
      setFrameworkUsageStats(frameworkData);
      setConstitutionEvolution(evolutionData);
      setPerformanceStats(performanceData);
      setSystemHealth(healthData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div
                className={`flex items-center text-sm ${
                  change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DecisionQualityChart = () => {
    if (!decisionQualityMetrics?.quality_over_time) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={decisionQualityMetrics.quality_over_time}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="version" />
          <YAxis domain={[0, 1]} />
          <Tooltip
            formatter={(value) => [
              `${(value * 100).toFixed(1)}%`,
              "Quality Score",
            ]}
          />
          <Line
            type="monotone"
            dataKey="quality_score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const FrameworkUsageChart = () => {
    if (!frameworkUsageStats?.framework_distribution) return null;

    const data = Object.entries(frameworkUsageStats.framework_distribution).map(
      ([framework, count]) => ({
        name: framework
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: count,
        color: FRAMEWORK_COLORS[framework] || "#6b7280",
      })
    );

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const ConstitutionEvolutionChart = () => {
    if (!constitutionEvolution?.evolution_timeline) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={constitutionEvolution.evolution_timeline}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="version" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="principle_count"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const SystemPerformanceRadar = () => {
    if (!performanceStats) return null;

    const data = [
      {
        subject: "Cache Hit Rate",
        value: performanceStats.cache_hit_rate || 0,
        fullMark: 100,
      },
      {
        subject: "Response Time",
        value: Math.max(0, 100 - (performanceStats.avg_response_time || 0)),
        fullMark: 100,
      },
      {
        subject: "Embedding Quality",
        value: (performanceStats.embedding_quality || 0.8) * 100,
        fullMark: 100,
      },
      {
        subject: "Vector Search",
        value: (performanceStats.vector_search_accuracy || 0.9) * 100,
        fullMark: 100,
      },
      {
        subject: "Memory Usage",
        value: Math.max(0, 100 - (performanceStats.memory_usage_percent || 0)),
        fullMark: 100,
      },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Critiques"
          value={systemAnalytics?.total_critiques || 0}
          change={systemAnalytics?.critique_growth_rate}
          icon={Brain}
          color="blue"
        />
        <KPICard
          title="Active Agents"
          value={systemAnalytics?.active_agents || 0}
          change={systemAnalytics?.agent_growth_rate}
          icon={Target}
          color="green"
        />
        <KPICard
          title="Cache Hit Rate"
          value={`${performanceStats?.cache_hit_rate || 0}%`}
          change={performanceStats?.cache_improvement}
          icon={Database}
          color="purple"
        />
        <KPICard
          title="Avg Response Time"
          value={`${performanceStats?.avg_response_time || 0}ms`}
          change={performanceStats?.response_time_improvement}
          icon={Zap}
          color="orange"
        />
      </div>

      {/* System Health Status */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    systemHealth.status === "healthy"
                      ? "bg-green-500"
                      : systemHealth.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="font-medium">
                  {systemHealth.status?.toUpperCase() || "UNKNOWN"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Uptime: {systemHealth.uptime || "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                Memory: {systemHealth.memory_usage || "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Decision Quality</TabsTrigger>
          <TabsTrigger value="frameworks">Framework Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Framework Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Framework Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FrameworkUsageChart />
              </CardContent>
            </Card>

            {/* Constitution Evolution */}
            {agentId && constitutionEvolution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Constitution Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConstitutionEvolutionChart />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          {systemAnalytics?.recent_activity && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAnalytics.recent_activity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          {agentId && decisionQualityMetrics ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Decision Quality Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <DecisionQualityChart />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {(decisionQualityMetrics.average_quality * 100).toFixed(
                          1
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Quality
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {decisionQualityMetrics.improvement_rate?.toFixed(1) ||
                          0}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Improvement Rate
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {decisionQualityMetrics.consistency_score?.toFixed(2) ||
                          0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Consistency Score
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  {agentId
                    ? "No decision quality data available"
                    : "Select an agent to view decision quality metrics"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          {frameworkUsageStats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Framework Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      frameworkUsageStats.framework_distribution || {}
                    ).map(([framework, count]) => {
                      const total = Object.values(
                        frameworkUsageStats.framework_distribution
                      ).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;

                      return (
                        <div key={framework} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    FRAMEWORK_COLORS[framework] || "#6b7280",
                                }}
                              />
                              <span className="font-medium capitalize">
                                {framework.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {count} uses
                              </span>
                              <Badge variant="outline">
                                {percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {frameworkUsageStats.framework_effectiveness && (
                <Card>
                  <CardHeader>
                    <CardTitle>Framework Effectiveness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(
                        frameworkUsageStats.framework_effectiveness
                      ).map(([framework, effectiveness]) => (
                        <div
                          key={framework}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  FRAMEWORK_COLORS[framework] || "#6b7280",
                              }}
                            />
                            <span className="font-medium capitalize">
                              {framework.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={effectiveness * 100}
                              className="w-20 h-2"
                            />
                            <span className="text-sm font-medium">
                              {(effectiveness * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemPerformanceRadar />
            </CardContent>
          </Card>

          {performanceStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cache Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Hit Rate</span>
                      <Badge>{performanceStats.cache_hit_rate}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Hits</span>
                      <span className="font-medium">
                        {performanceStats.cache_hits}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Misses</span>
                      <span className="font-medium">
                        {performanceStats.cache_misses}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Embeddings Generated</span>
                      <span className="font-medium">
                        {performanceStats.embeddings_generated}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Vector Searches</span>
                      <span className="font-medium">
                        {performanceStats.vector_searches}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Critiques Generated</span>
                      <span className="font-medium">
                        {performanceStats.critiques_generated}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
