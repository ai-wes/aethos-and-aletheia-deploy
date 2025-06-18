import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Target,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Search,
  Shuffle,
  Play,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Lightbulb,
  Zap,
} from "lucide-react";
import apiService from "../services/api";

const COMPLEXITY_LEVELS = {
  1: {
    label: "Simple",
    color: "bg-green-500",
    description: "Clear-cut ethical decisions",
  },
  2: {
    label: "Moderate",
    color: "bg-yellow-500",
    description: "Some competing considerations",
  },
  3: {
    label: "Complex",
    color: "bg-orange-500",
    description: "Multiple stakeholders and trade-offs",
  },
  4: {
    label: "Advanced",
    color: "bg-red-500",
    description: "Deep philosophical tensions",
  },
  5: {
    label: "Expert",
    color: "bg-purple-500",
    description: "Cutting-edge ethical dilemmas",
  },
};

const ScenarioManager = ({ onScenarioSelect, selectedScenario }) => {
  const [scenarios, setScenarios] = useState([]);
  const [filteredScenarios, setFilteredScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [complexityFilter, setComplexityFilter] = useState([]);
  const [stakeholderFilter, setStakeholderFilter] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // New scenario form state
  const [newScenario, setNewScenario] = useState({
    title: "",
    description: "",
    actions: ["", "", ""],
    complexity: 1,
    stakeholders: [],
    domain: "",
    ethical_frameworks: [],
    estimated_time: 5,
  });

  useEffect(() => {
    loadScenarios();
  }, []);

  useEffect(() => {
    filterScenarios();
  }, [scenarios, searchTerm, complexityFilter, stakeholderFilter]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await apiService.getScenarios();
      setScenarios(data);
    } catch (error) {
      console.error("Failed to load scenarios:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterScenarios = () => {
    let filtered = [...scenarios];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (scenario) =>
          scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scenario.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Complexity filter
    if (complexityFilter.length > 0) {
      filtered = filtered.filter((scenario) =>
        complexityFilter.includes(scenario.complexity)
      );
    }

    // Stakeholder count filter
    if (stakeholderFilter.length > 0) {
      filtered = filtered.filter((scenario) => {
        const stakeholderCount = scenario.stakeholders?.length || 0;
        return stakeholderFilter.some((range) => {
          switch (range) {
            case "low":
              return stakeholderCount <= 2;
            case "medium":
              return stakeholderCount >= 3 && stakeholderCount <= 5;
            case "high":
              return stakeholderCount > 5;
            default:
              return true;
          }
        });
      });
    }

    setFilteredScenarios(filtered);
    setCurrentIndex(0);
  };

  const toggleComplexityFilter = (complexity) => {
    setComplexityFilter((prev) =>
      prev.includes(complexity)
        ? prev.filter((c) => c !== complexity)
        : [...prev, complexity]
    );
  };

  const toggleStakeholderFilter = (range) => {
    setStakeholderFilter((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const getRandomScenario = async () => {
    try {
      const scenario = await apiService.getRandomScenario();
      if (onScenarioSelect) {
        onScenarioSelect(scenario);
      }
    } catch (error) {
      console.error("Failed to get random scenario:", error);
    }
  };

  const createScenario = async () => {
    try {
      const scenario = await apiService.createScenario(newScenario);
      setScenarios([...scenarios, scenario]);
      setShowCreateModal(false);
      resetNewScenario();
    } catch (error) {
      console.error("Failed to create scenario:", error);
      setError(error.message);
    }
  };

  const resetNewScenario = () => {
    setNewScenario({
      title: "",
      description: "",
      actions: ["", "", ""],
      complexity: 1,
      stakeholders: [],
      domain: "",
      ethical_frameworks: [],
      estimated_time: 5,
    });
  };

  const updateNewScenarioAction = (index, value) => {
    const updatedActions = [...newScenario.actions];
    updatedActions[index] = value;
    setNewScenario({ ...newScenario, actions: updatedActions });
  };

  const addAction = () => {
    setNewScenario({
      ...newScenario,
      actions: [...newScenario.actions, ""],
    });
  };

  const removeAction = (index) => {
    const updatedActions = newScenario.actions.filter((_, i) => i !== index);
    setNewScenario({ ...newScenario, actions: updatedActions });
  };

  const ScenarioCard = ({ scenario, index, isActive = false }) => {
    if (!scenario) return null;
    const complexity =
      COMPLEXITY_LEVELS[scenario.complexity] || COMPLEXITY_LEVELS[1];
    const stakeholderCount = scenario.stakeholders?.length || 0;

    return (
      <div
        style={{
          ...styles.scenarioCard,
          ...(isActive ? styles.scenarioCardActive : {})
        }}
        onClick={() => onScenarioSelect && onScenarioSelect(scenario)}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.borderColor = "rgba(35, 217, 217, 0.3)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(35, 217, 217, 0.1)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        <div style={styles.cardHeader}>
          <div style={styles.cardTitleRow}>
            <h4 style={styles.cardTitle}>{scenario.title}</h4>
            <div style={styles.cardBadges}>
              <div style={{
                ...styles.complexityBadge,
                backgroundColor: getComplexityColor(complexity.label)
              }}>
                {complexity.label}
              </div>
              {scenario.domain && (
                <div style={styles.domainBadge}>{scenario.domain}</div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.cardContent}>
          <p style={styles.cardDescription}>
            {scenario.description}
          </p>

          <div style={styles.cardMeta}>
            <div style={styles.metaItem}>
              <Users style={styles.metaIcon} />
              <span style={styles.metaText}>{stakeholderCount} stakeholders</span>
            </div>
            <div style={styles.metaItem}>
              <Clock style={styles.metaIcon} />
              <span style={styles.metaText}>{scenario.estimated_time || 5} min</span>
            </div>
          </div>

          {scenario.actions && scenario.actions.length > 0 && (
            <div style={styles.actionsSection}>
              <h5 style={styles.actionsTitle}>Possible Actions:</h5>
              <ul style={styles.actionsList}>
                {scenario.actions.slice(0, 2).map((action, actionIndex) => (
                  <li key={actionIndex} style={styles.actionItem}>
                    • {action}
                  </li>
                ))}
                {scenario.actions.length > 2 && (
                  <li style={styles.actionItem}>
                    • +{scenario.actions.length - 2} more...
                  </li>
                )}
              </ul>
            </div>
          )}

          <div style={styles.cardActions}>
            <button
              style={styles.selectButton}
              onClick={(e) => {
                e.stopPropagation();
                onScenarioSelect && onScenarioSelect(scenario);
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#23d9d9";
                e.target.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
                e.target.style.color = "#23d9d9";
              }}
            >
              <Play style={styles.buttonIcon} />
              Select
            </button>

            <button
              style={styles.editButton}
              onClick={(e) => {
                e.stopPropagation();
                setEditingScenario(scenario);
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              <Edit3 style={styles.buttonIcon} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getComplexityColor = (level) => {
    const colors = {
      "Simple": "#10b981",
      "Moderate": "#f59e0b", 
      "Complex": "#f97316",
      "Advanced": "#ef4444",
      "Expert": "#8b5cf6"
    };
    return colors[level] || "#6b7280";
  };

  const ScenarioCarousel = () => {
    const itemsPerPage = 3;
    const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const visibleScenarios = filteredScenarios.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    const nextPage = () => {
      if (currentPage < totalPages - 1) {
        setCurrentIndex((currentPage + 1) * itemsPerPage);
      }
    };

    const prevPage = () => {
      if (currentPage > 0) {
        setCurrentIndex((currentPage - 1) * itemsPerPage);
      }
    };

    return (
      <div style={styles.carouselContainer}>
        <div style={styles.carouselControls}>
          <div style={styles.paginationControls}>
            <button
              style={{
                ...styles.paginationButton,
                ...(currentPage === 0 ? styles.paginationButtonDisabled : {})
              }}
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              ←
            </button>
            <span style={styles.pageInfo}>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              style={{
                ...styles.paginationButton,
                ...(currentPage >= totalPages - 1 ? styles.paginationButtonDisabled : {})
              }}
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
            >
              →
            </button>
          </div>

          <button 
            style={styles.randomButton} 
            onClick={getRandomScenario}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
              e.target.style.borderColor = "#23d9d9";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            <Shuffle style={styles.buttonIcon} />
            Random
          </button>
        </div>

        <div style={styles.scenariosGrid}>
          {visibleScenarios.filter(Boolean).map((scenario, index) => (
            <ScenarioCard
              key={scenario._id || scenario.id}
              scenario={scenario}
              index={startIndex + index}
              isActive={selectedScenario?._id === scenario._id}
            />
          ))}
        </div>

        {filteredScenarios.length === 0 && (
          <div style={styles.emptyState}>
            <BookOpen style={styles.emptyIcon} />
            <p style={styles.emptyText}>
              No scenarios match your filters
            </p>
          </div>
        )}
      </div>
    );
  };

  const CreateScenarioModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Create New Scenario</h2>
            <Button
              onClick={() => setShowCreateModal(false)}
              variant="outline"
              size="sm"
            >
              ×
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newScenario.title}
                onChange={(e) =>
                  setNewScenario({ ...newScenario, title: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Enter scenario title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={newScenario.description}
                onChange={(e) =>
                  setNewScenario({
                    ...newScenario,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border rounded h-24"
                placeholder="Describe the ethical dilemma..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Possible Actions
              </label>
              {newScenario.actions.map((action, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={action}
                    onChange={(e) =>
                      updateNewScenarioAction(index, e.target.value)
                    }
                    className="flex-1 p-2 border rounded"
                    placeholder={`Action ${index + 1}...`}
                  />
                  {newScenario.actions.length > 2 && (
                    <Button
                      onClick={() => removeAction(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addAction} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Complexity
                </label>
                <select
                  value={newScenario.complexity}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      complexity: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  {Object.entries(COMPLEXITY_LEVELS).map(([level, info]) => (
                    <option key={level} value={level}>
                      {info.label} - {info.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  value={newScenario.estimated_time}
                  onChange={(e) =>
                    setNewScenario({
                      ...newScenario,
                      estimated_time: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                  min="1"
                  max="60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={newScenario.domain}
                onChange={(e) =>
                  setNewScenario({ ...newScenario, domain: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="e.g., Healthcare, Technology, Business..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={createScenario}
                disabled={!newScenario.title || !newScenario.description}
              >
                Create Scenario
              </Button>
            </div>
          </div>
        </div>
      </div>
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerCard}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <Target style={styles.headerIcon} />
            <h2 style={styles.headerTitle}>Scenario Manager</h2>
            <div style={styles.scenarioCount}>
              {filteredScenarios.length} SCENARIOS
            </div>
          </div>
          <button 
            style={styles.createButton}
            onClick={() => setShowCreateModal(true)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#23d9d9";
              e.target.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
              e.target.style.color = "#23d9d9";
            }}
          >
            <Plus style={styles.buttonIcon} />
            Create Scenario
          </button>
        </div>

        {/* Search and Filters */}
        <div style={styles.filtersSection}>
          <div style={styles.searchContainer}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Complexity Filter */}
          <div style={styles.filterRow}>
            <Filter style={styles.filterIcon} />
            <span style={styles.filterLabel}>Complexity:</span>
            <div style={styles.filterButtons}>
              {Object.entries(COMPLEXITY_LEVELS).map(([level, info]) => (
                <button
                  key={level}
                  style={{
                    ...styles.filterButton,
                    ...(complexityFilter.includes(parseInt(level)) ? styles.filterButtonActive : {})
                  }}
                  onClick={() => toggleComplexityFilter(parseInt(level))}
                  onMouseEnter={(e) => {
                    if (!complexityFilter.includes(parseInt(level))) {
                      e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
                      e.target.style.borderColor = "#23d9d9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!complexityFilter.includes(parseInt(level))) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    }
                  }}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stakeholder Filter */}
          <div style={styles.filterRow}>
            <span style={styles.filterLabel}>Stakeholders:</span>
            <div style={styles.filterButtons}>
              {[
                { key: "low", label: "1-2" },
                { key: "medium", label: "3-5" },
                { key: "high", label: "6+" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  style={{
                    ...styles.filterButton,
                    ...(stakeholderFilter.includes(key) ? styles.filterButtonActive : {})
                  }}
                  onClick={() => toggleStakeholderFilter(key)}
                  onMouseEnter={(e) => {
                    if (!stakeholderFilter.includes(key)) {
                      e.target.style.backgroundColor = "rgba(35, 217, 217, 0.1)";
                      e.target.style.borderColor = "#23d9d9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!stakeholderFilter.includes(key)) {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle style={styles.alertIcon} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Scenario Carousel */}
      <div style={styles.scenariosCard}>
        <div style={styles.scenariosHeader}>
          <h3 style={styles.scenariosTitle}>Available Scenarios</h3>
        </div>
        <div style={styles.scenariosContent}>
          <ScenarioCarousel />
        </div>
      </div>

      {/* Create Scenario Modal */}
      <CreateScenarioModal />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    height: "100%",
    overflowY: "auto",
  },
  headerCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  headerIcon: {
    width: "18px",
    height: "18px",
    color: "#23d9d9",
  },
  headerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
  },
  scenarioCount: {
    backgroundColor: "rgba(35, 217, 217, 0.2)",
    color: "#23d9d9",
    border: "1px solid #23d9d9",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
  createButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(35, 217, 217, 0.1)",
    color: "#23d9d9",
    border: "1px solid #23d9d9",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  buttonIcon: {
    width: "14px",
    height: "14px",
  },
  filtersSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  searchContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
  },
  searchIcon: {
    position: "absolute",
    left: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "14px",
    height: "14px",
    color: "#8f9aa6",
  },
  searchInput: {
    width: "100%",
    paddingLeft: "28px",
    paddingRight: "8px",
    paddingTop: "6px",
    paddingBottom: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    color: "#cfd8e3",
    fontSize: "12px",
    "&::placeholder": {
      color: "#8f9aa6",
    },
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  filterIcon: {
    width: "14px",
    height: "14px",
    color: "#8f9aa6",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#cfd8e3",
    minWidth: "70px",
  },
  filterButtons: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  filterButton: {
    backgroundColor: "transparent",
    color: "#cfd8e3",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  filterButtonActive: {
    backgroundColor: "#23d9d9",
    color: "#000",
    borderColor: "#23d9d9",
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "12px",
    marginTop: "12px",
  },
  alertIcon: {
    width: "14px",
    height: "14px",
  },
  scenariosCard: {
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
    flex: 1,
    overflow: "hidden",
  },
  scenariosHeader: {
    marginBottom: "16px",
  },
  scenariosTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
  },
  scenariosContent: {
    height: "100%",
    overflowY: "auto",
  },
  // Scenario Card Styles
  scenarioCard: {
    backgroundColor: "rgba(26, 31, 37, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  scenarioCardActive: {
    borderColor: "#23d9d9",
    boxShadow: "0 0 15px rgba(35, 217, 217, 0.2)",
  },
  cardHeader: {
    marginBottom: "10px",
  },
  cardTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
    color: "#fff",
    lineHeight: "1.3",
    flex: 1,
  },
  cardBadges: {
    display: "flex",
    gap: "4px",
    flexShrink: 0,
  },
  complexityBadge: {
    color: "#fff",
    borderRadius: "3px",
    padding: "2px 6px",
    fontSize: "9px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  domainBadge: {
    backgroundColor: "transparent",
    color: "#8f9aa6",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "3px",
    padding: "2px 6px",
    fontSize: "9px",
    fontWeight: "500",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardDescription: {
    margin: 0,
    fontSize: "11px",
    lineHeight: "1.4",
    color: "#b0bec5",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardMeta: {
    display: "flex",
    gap: "12px",
    fontSize: "10px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },
  metaIcon: {
    width: "12px",
    height: "12px",
    color: "#8f9aa6",
  },
  metaText: {
    color: "#8f9aa6",
  },
  actionsSection: {
    marginTop: "4px",
  },
  actionsTitle: {
    margin: "0 0 4px 0",
    fontSize: "10px",
    fontWeight: "600",
    color: "#cfd8e3",
  },
  actionsList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  actionItem: {
    fontSize: "9px",
    color: "#8f9aa6",
    lineHeight: "1.3",
    marginBottom: "2px",
  },
  cardActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "6px",
    marginTop: "6px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  selectButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "rgba(35, 217, 217, 0.1)",
    color: "#23d9d9",
    border: "1px solid #23d9d9",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "transparent",
    color: "#8f9aa6",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    padding: "4px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  // Carousel Styles
  carouselContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  carouselControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  paginationButton: {
    backgroundColor: "transparent",
    color: "#cfd8e3",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  paginationButtonDisabled: {
    color: "#6b7280",
    cursor: "not-allowed",
    opacity: 0.5,
  },
  pageInfo: {
    fontSize: "11px",
    color: "#8f9aa6",
  },
  randomButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "transparent",
    color: "#cfd8e3",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  scenariosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px",
    textAlign: "center",
  },
  emptyIcon: {
    width: "32px",
    height: "32px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  emptyText: {
    margin: 0,
    fontSize: "12px",
    color: "#8f9aa6",
  },
};

export default ScenarioManager;
