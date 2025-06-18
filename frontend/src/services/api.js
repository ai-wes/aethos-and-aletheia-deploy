const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://aethos-and-aletheia.onrender.com";

// Helper function for fetch requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`API Request: ${config.method || "GET"} ${url}`);
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`API Response: ${response.status} ${url}`);
    return data;
  } catch (error) {
    console.error("API Request Error:", error.message);
    throw error;
  }
};

// API service functions
const apiService = {
  // Health check
  healthCheck: () => apiRequest("/api/health"),

  // Sophia Guard wisdom queries
  query: (query, mode = "explore", useCache = true) =>
    apiRequest("/api/query", {
      method: "POST",
      body: { query, mode, use_cache: useCache },
    }),

  // Get reasoning trace data
  getTrace: (traceId) => apiRequest(`/api/trace/${traceId}`),

  // Get cached wisdom trace data
  getCachedTrace: (cacheId) => apiRequest(`/api/trace/cached_${cacheId}`),

  // Submit feedback
  submitFeedback: (feedbackData) =>
    apiRequest("/api/feedback", {
      method: "POST",
      body: feedbackData,
    }),

  // Get wisdom statistics
  getWisdomStats: () => apiRequest("/api/wisdom-stats"),

  // Aletheia learning system
  getAgents: () => apiRequest("/api/aletheia/agents"),

  startLearningCycle: (agentId, cycles = 1) =>
    apiRequest("/api/aletheia/start_cycle", {
      method: "POST",
      body: { agent_id: agentId, cycles },
    }),

  getLearningHistory: (agentId, limit = 10) =>
    apiRequest(`/api/aletheia/history/${agentId}?limit=${limit}`),

  seedDatabase: () =>
    apiRequest("/api/aletheia/seed_database", {
      method: "POST",
    }),

  // Stress testing
  stressTest: (principle) =>
    apiRequest("/api/stress-test", {
      method: "POST",
      body: { principle },
    }),

  // Pre-defined scenarios and frameworks (AI safety scenarios)
  getAISafetyScenarios: () => apiRequest("/api/scenarios/ai-safety"),
  getFrameworks: () => apiRequest("/api/frameworks"),

  // Agent constitution management
  getAgentConstitution: (agentId) =>
    apiRequest(`/api/aletheia/agents/${agentId}/constitution`),
  updateAgentConstitution: (agentId, constitution) =>
    apiRequest(`/api/aletheia/agents/${agentId}/constitution`, {
      method: "PUT",
      body: { constitution },
    }),

  // AI Agent management
  createAgent: (initialConstitution, name) =>
    apiRequest("/api/aletheia/create_agent", {
      method: "POST",
      body: { initial_constitution: initialConstitution, name },
    }),

  getAgent: (agentId) => apiRequest(`/api/aletheia/agents/${agentId}`),

  deleteAgent: (agentId) =>
    apiRequest(`/api/aletheia/agents/${agentId}`, {
      method: "DELETE",
    }),

  getConstitutionHistory: (agentId) =>
    apiRequest(`/api/aletheia/agents/${agentId}/constitution-history`),

  // Get scenarios from Aletheia system
  getScenarios: () => apiRequest("/api/aletheia/scenarios"),

  getRandomScenario: () => apiRequest("/api/aletheia/scenarios/random"),

  createScenario: (scenario) =>
    apiRequest("/api/aletheia/scenarios", {
      method: "POST",
      body: scenario,
    }),

  // Get learning analytics for an agent
  getLearningAnalytics: (agentId, days = 30) =>
    apiRequest(`/api/aletheia/agents/${agentId}/analytics?days=${days}`),

  // Streaming endpoints for real-time updates
  subscribeToLearningUpdates: (agentId) => {
    const eventSource = new EventSource(
      `${API_BASE_URL}/api/aletheia/stream/learning/${agentId}`
    );
    return eventSource;
  },

  // Scenario Export endpoints
  exportScenarios: (exportRequest) =>
    apiRequest("/api/export", {
      method: "POST",
      body: exportRequest,
    }),

  exportToColab: (exportRequest) =>
    apiRequest("/api/export/colab", {
      method: "POST",
      body: exportRequest,
    }),

  getExportFormats: () => apiRequest("/api/export/formats"),

  getExportStatus: (taskId) => apiRequest(`/api/export/status/${taskId}`),

  // MAS Evaluation endpoints
  startMASEvaluation: (evaluationRequest) =>
    apiRequest("/api/evaluate", {
      method: "POST",
      body: evaluationRequest,
    }),

  getMASEvaluationStatus: (taskId) => apiRequest(`/api/status/${taskId}`),

  getMASEvaluationTasks: () => apiRequest("/api/tasks"),

  getAvailableMASModels: () => apiRequest("/api/models/available"),
};

export default apiService;
