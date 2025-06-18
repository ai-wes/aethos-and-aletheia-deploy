import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [frameworks, setFrameworks] = useState([]);

  // Check backend connection on mount
  useEffect(() => {
    checkConnection();
    loadInitialData();
  }, []);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      await apiService.healthCheck();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError("Backend connection failed");
      console.error("Backend connection failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [agentsData, scenariosData, frameworksData] = await Promise.all([
        apiService.getAgents().catch(() => []),
        apiService.getScenarios().catch(() => []),
        apiService.getFrameworks().catch(() => []),
      ]);

      setAgents(agentsData);
      setScenarios(scenariosData);
      setFrameworks(frameworksData);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  };

  // Wisdom query function
  const queryWisdom = async (query, mode = "explore") => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.query(query, mode);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Aletheia learning functions
  const startLearningCycle = async (agentId) => {
    try {
      setIsLoading(true);
      const response = await apiService.startLearningCycle(agentId);
      // Refresh agents list
      const updatedAgents = await apiService.getAgents();
      setAgents(updatedAgents);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.seedDatabase();
      // Refresh data
      await loadInitialData();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Stress test function
  const stressTest = async (principle) => {
    try {
      setIsLoading(true);
      const response = await apiService.stressTest(principle);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isConnected,
    isLoading,
    error,
    agents,
    scenarios,
    frameworks,
    queryWisdom,
    startLearningCycle,
    seedDatabase,
    stressTest,
    checkConnection,
    refreshData: loadInitialData,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
