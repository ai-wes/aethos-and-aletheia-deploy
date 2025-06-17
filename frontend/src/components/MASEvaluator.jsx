import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Target, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Brain,
  FileJson,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  Database,
  Zap,
  X
} from 'lucide-react';
import apiService from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function MASEvaluator() {
  const [selectedModel, setSelectedModel] = useState('google/gemma-2b-it');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [constitutionVersion, setConstitutionVersion] = useState('');
  const [batchSize, setBatchSize] = useState(4);
  const [maxTokens, setMaxTokens] = useState(256);
  const [sampleLimit, setSampleLimit] = useState(100);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [evaluationTasks, setEvaluationTasks] = useState([]);

  useEffect(() => {
    loadAgents();
    loadAvailableModels();
    loadEvaluationTasks();
  }, []);

  // Poll for task updates when evaluating
  useEffect(() => {
    if (currentTask && isEvaluating) {
      const pollInterval = setInterval(async () => {
        try {
          const taskStatus = await apiService.getMASEvaluationStatus(currentTask.task_id);
          setCurrentTask(taskStatus);
          
          if (taskStatus.status === 'completed') {
            setEvaluationResults(taskStatus);
            setIsEvaluating(false);
            clearInterval(pollInterval);
            loadEvaluationTasks(); // Refresh task list
          } else if (taskStatus.status === 'failed') {
            setEvaluationError(taskStatus.error);
            setIsEvaluating(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Failed to poll task status:', error);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [currentTask, isEvaluating]);

  const loadAgents = async () => {
    try {
      const agentsData = await apiService.getAgents();
      setAgents(agentsData);
      if (agentsData.length > 0 && !selectedAgent) {
        setSelectedAgent(agentsData[0].agent_id);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const loadAvailableModels = async () => {
    try {
      console.log('Loading available models...');
      const modelsData = await apiService.getAvailableMASModels();
      console.log('Models data received:', modelsData);
      
      if (modelsData.error) {
        setEvaluationError(modelsData.error + ': ' + modelsData.note);
        setAvailableModels([]);
        return;
      }
      
      setAvailableModels(modelsData.models || []);
    } catch (error) {
      console.error('Failed to load available models:', error);
      console.error('Error details:', error.message);
      
      // Check if it's a 503 service unavailable (missing dependencies)
      if (error.message && error.message.includes('503')) {
        setEvaluationError('ML dependencies not installed. Please install torch and transformers to enable MAS evaluation.');
      } else {
        setEvaluationError('Failed to load available models: ' + error.message);
      }
      
      setAvailableModels([]);
    }
  };

  const loadEvaluationTasks = async () => {
    try {
      const tasksData = await apiService.getMASEvaluationTasks();
      setEvaluationTasks(tasksData.tasks || []);
    } catch (error) {
      console.error('Failed to load evaluation tasks:', error);
    }
  };

  const handleStartEvaluation = async () => {
    if (!selectedModel || !selectedAgent) {
      setEvaluationError('Please select both a model and an agent');
      return;
    }

    setIsEvaluating(true);
    setEvaluationError(null);
    setEvaluationResults(null);
    setCurrentTask(null);

    try {
      const evaluationRequest = {
        model_path: selectedModel,
        agent_id: selectedAgent,
        constitution_version: constitutionVersion ? parseInt(constitutionVersion) : undefined,
        batch_size: batchSize,
        max_tokens: maxTokens,
        limit: sampleLimit
      };

      const task = await apiService.startMASEvaluation(evaluationRequest);
      setCurrentTask(task);
    } catch (error) {
      setEvaluationError(error.message || 'Failed to start evaluation');
      setIsEvaluating(false);
    }
  };

  const handleDownloadResults = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${taskId}/csv`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mas_evaluation_${taskId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download results:', error);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Target style={styles.headerIcon} />
          <div>
            <h1 style={styles.title}>MAS Evaluator</h1>
            <p style={styles.subtitle}>Moral-Alignment Score Evaluation System</p>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Configuration Panel */}
        <Card style={styles.configCard}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>
              <Settings style={styles.cardIcon} />
              Evaluation Configuration
            </CardTitle>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <div style={styles.configGrid}>
              {/* Model Selection */}
              <div style={styles.configGroup}>
                <label style={styles.label}>Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={styles.select}
                >
                  {availableModels.map((model) => (
                    <option key={model.path} value={model.path}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <div style={styles.helpText}>
                  Choose the model to evaluate for moral alignment
                </div>
              </div>

              {/* Agent Selection */}
              <div style={styles.configGroup}>
                <label style={styles.label}>Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent) => (
                    <option key={agent.agent_id} value={agent.agent_id}>
                      {agent.name || `Agent v${agent.version}`}
                    </option>
                  ))}
                </select>
                <div style={styles.helpText}>
                  Agent provides the constitutional framework for evaluation
                </div>
              </div>

              {/* Constitution Version */}
              <div style={styles.configGroup}>
                <label style={styles.label}>Constitution Version (Optional)</label>
                <input
                  type="number"
                  value={constitutionVersion}
                  onChange={(e) => setConstitutionVersion(e.target.value)}
                  placeholder="Latest"
                  style={styles.input}
                />
                <div style={styles.helpText}>
                  Specific constitution version to use for evaluation
                </div>
              </div>

              {/* Sample Limit */}
              <div style={styles.configGroup}>
                <label style={styles.label}>Sample Limit</label>
                <input
                  type="number"
                  value={sampleLimit}
                  onChange={(e) => setSampleLimit(parseInt(e.target.value))}
                  min="1"
                  max="1000"
                  style={styles.input}
                />
                <div style={styles.helpText}>
                  Number of scenarios to evaluate (max 1000)
                </div>
              </div>

              {/* Batch Size */}
              <div style={styles.configGroup}>
                <label style={styles.label}>Batch Size</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  min="1"
                  max="16"
                  style={styles.input}
                />
                <div style={styles.helpText}>
                  Number of samples to process simultaneously
                </div>
              </div>

              {/* Max Tokens */}
              <div style={styles.configGroup}>
                <label style={styles.label}>Max Response Tokens</label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  min="50"
                  max="1024"
                  style={styles.input}
                />
                <div style={styles.helpText}>
                  Maximum tokens for model responses
                </div>
              </div>
            </div>

            <div style={styles.actionSection}>
              <Button
                onClick={handleStartEvaluation}
                disabled={isEvaluating || !selectedModel || !selectedAgent}
                style={styles.startButton}
              >
                {isEvaluating ? (
                  <>
                    <Loader2 style={styles.spinner} />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Zap style={styles.buttonIcon} />
                    Start MAS Evaluation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Evaluation Progress */}
        {isEvaluating && currentTask && (
          <Card style={styles.progressCard}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Brain style={styles.cardIcon} />
                Evaluation Progress
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <div style={styles.progressSection}>
                <div style={styles.progressInfo}>
                  <Badge variant="secondary" style={styles.statusBadge}>
                    {currentTask.status}
                  </Badge>
                  <span style={styles.progressText}>
                    {currentTask.progress || 0}% Complete
                  </span>
                </div>
                <Progress 
                  value={currentTask.progress || 0} 
                  style={styles.progressBar}
                />
                <div style={styles.progressDetails}>
                  <span>Started: {formatDateTime(currentTask.started_at)}</span>
                  {currentTask.total_samples && (
                    <span>Samples: {currentTask.total_samples}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {evaluationError && (
          <Alert variant="destructive" style={styles.errorAlert}>
            <AlertCircle style={styles.alertIcon} />
            <AlertDescription>
              <strong>MAS Evaluator:</strong> {evaluationError}
              {evaluationError.includes('ML dependencies') && (
                <div style={styles.installInstructions}>
                  <div>To install the required dependencies, run:</div>
                  <code style={styles.codeBlock}>pip install torch transformers datasets</code>
                </div>
              )}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEvaluationError(null)}
              style={styles.closeButton}
            >
              <X style={styles.closeIcon} />
            </Button>
          </Alert>
        )}

        {/* Results Display */}
        {evaluationResults && evaluationResults.status === 'completed' && (
          <Card style={styles.resultsCard}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <TrendingUp style={styles.cardIcon} />
                MAS Evaluation Results
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <div style={styles.resultsGrid}>
                <div style={styles.masScoreSection}>
                  <div style={styles.masScore}>
                    {(evaluationResults.mas_score * 100).toFixed(1)}%
                  </div>
                  <div style={styles.masLabel}>Moral-Alignment Score</div>
                </div>

                <div style={styles.resultStats}>
                  <div style={styles.statItem}>
                    <Database style={styles.statIcon} />
                    <div>
                      <div style={styles.statValue}>{evaluationResults.total_samples}</div>
                      <div style={styles.statLabel}>Samples Evaluated</div>
                    </div>
                  </div>
                  
                  <div style={styles.statItem}>
                    <Clock style={styles.statIcon} />
                    <div>
                      <div style={styles.statValue}>
                        {formatDateTime(evaluationResults.completed_at)}
                      </div>
                      <div style={styles.statLabel}>Completed At</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.actionSection}>
                <Button
                  onClick={() => handleDownloadResults(currentTask.task_id)}
                  style={styles.downloadButton}
                >
                  <Download style={styles.buttonIcon} />
                  Download Detailed Results (CSV)
                </Button>
              </div>

              {/* Constitution Display */}
              {evaluationResults.constitution && (
                <div style={styles.constitutionSection}>
                  <h4 style={styles.constitutionTitle}>Constitutional Framework Used</h4>
                  <div style={styles.constitutionList}>
                    {evaluationResults.constitution.map((principle, index) => (
                      <div key={index} style={styles.constitutionItem}>
                        <span style={styles.principleNumber}>{index + 1}</span>
                        <span style={styles.principleText}>{principle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Evaluations */}
        {evaluationTasks.length > 0 && (
          <Card style={styles.historyCard}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <BarChart3 style={styles.cardIcon} />
                Recent Evaluations
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <div style={styles.tasksList}>
                {evaluationTasks.slice(0, 5).map((task) => (
                  <div key={task.task_id} style={styles.taskItem}>
                    <div style={styles.taskInfo}>
                      <Badge 
                        variant={getStatusBadgeVariant(task.status)}
                        style={styles.taskStatus}
                      >
                        {task.status}
                      </Badge>
                      <div style={styles.taskDetails}>
                        <div style={styles.taskMeta}>
                          Started: {formatDateTime(task.started_at)}
                        </div>
                        {task.mas_score !== undefined && (
                          <div style={styles.taskScore}>
                            MAS: {(task.mas_score * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    {task.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadResults(task.task_id)}
                        style={styles.downloadTaskButton}
                      >
                        <Download style={styles.downloadIcon} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'transparent',
  },
  header: {
    marginBottom: '24px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    width: '32px',
    height: '32px',
    color: '#23d9d9',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#8f9aa6',
    margin: 0,
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    flex: 1,
  },
  configCard: {
    backgroundColor: 'rgba(11, 14, 17, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  progressCard: {
    backgroundColor: 'rgba(11, 14, 17, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  resultsCard: {
    backgroundColor: 'rgba(11, 14, 17, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '12px',
  },
  historyCard: {
    backgroundColor: 'rgba(11, 14, 17, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
  },
  cardIcon: {
    width: '20px',
    height: '20px',
    color: '#23d9d9',
  },
  cardContent: {
    color: '#cfd8e3',
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  configGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
  select: {
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#cfd8e3',
    fontSize: '14px',
  },
  input: {
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#cfd8e3',
    fontSize: '14px',
  },
  helpText: {
    fontSize: '12px',
    color: '#8f9aa6',
    lineHeight: '1.4',
  },
  actionSection: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  startButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#23d9d9',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(35, 217, 217, 0.2)',
    color: '#23d9d9',
    border: '1px solid #23d9d9',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  buttonIcon: {
    width: '16px',
    height: '16px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: 'rgba(35, 217, 217, 0.2)',
    color: '#23d9d9',
    border: '1px solid #23d9d9',
  },
  progressText: {
    fontSize: '14px',
    color: '#cfd8e3',
    fontWeight: '500',
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#8f9aa6',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    position: 'relative',
  },
  alertIcon: {
    width: '16px',
    height: '16px',
  },
  closeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px',
  },
  closeIcon: {
    width: '14px',
    height: '14px',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '24px',
    alignItems: 'center',
    marginBottom: '24px',
  },
  masScoreSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'rgba(35, 217, 217, 0.1)',
    border: '1px solid rgba(35, 217, 217, 0.3)',
    borderRadius: '12px',
  },
  masScore: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#23d9d9',
    lineHeight: 1,
  },
  masLabel: {
    fontSize: '14px',
    color: '#8f9aa6',
    textAlign: 'center',
    marginTop: '8px',
  },
  resultStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIcon: {
    width: '20px',
    height: '20px',
    color: '#8f9aa6',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '12px',
    color: '#8f9aa6',
  },
  constitutionSection: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  constitutionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '16px',
  },
  constitutionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  constitutionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  principleNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    backgroundColor: '#23d9d9',
    color: '#000',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0,
  },
  principleText: {
    fontSize: '14px',
    color: '#cfd8e3',
    lineHeight: '1.5',
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  taskInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  taskStatus: {
    fontSize: '12px',
  },
  taskDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  taskMeta: {
    fontSize: '12px',
    color: '#8f9aa6',
  },
  taskScore: {
    fontSize: '12px',
    color: '#23d9d9',
    fontWeight: '500',
  },
  downloadTaskButton: {
    padding: '6px',
    color: '#8f9aa6',
  },
  downloadIcon: {
    width: '14px',
    height: '14px',
  },
  installInstructions: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  codeBlock: {
    display: 'block',
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#23d9d9',
    border: '1px solid rgba(35, 217, 217, 0.3)',
  },
};