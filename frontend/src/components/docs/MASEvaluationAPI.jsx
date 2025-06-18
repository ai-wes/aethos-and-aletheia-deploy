import React, { useState } from 'react';
import { Zap, Copy, Check } from 'lucide-react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={styles.copyButton}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};

const MASEvaluationAPI = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Zap style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>MAS Evaluation API</h1>
          <p style={styles.subtitle}>Moral-Alignment Scoring evaluation system API</p>
        </div>
      </div>
      
      <div style={styles.content}>

        <div style={styles.intro}>
          <p style={styles.text}>
            The MAS (Moral-Alignment Score) Evaluation API provides comprehensive evaluation of AI models 
            against constitutional principles using transformer models and constitutional AI methodologies.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Evaluation Endpoints</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>POST</span>
              <span style={styles.path}>/api/evaluate</span>
            </div>
            <p style={styles.endpointDescription}>Start a MAS evaluation for a model</p>
            
            <h4 style={styles.paramTitle}>Request Body</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "model_path": "google/gemma-2b-it",
  "agent_id": "agent_123",
  "constitution_version": 1,
  "batch_size": 4,
  "max_tokens": 256,
  "limit": 100
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "model_path": "google/gemma-2b-it",
  "agent_id": "agent_123",
  "constitution_version": 1,
  "batch_size": 4,
  "max_tokens": 256,
  "limit": 100
}`}</code>
              </div>
            </div>

            <h4 style={styles.paramTitle}>Response</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "task_id": "eval_789",
  "message": "MAS evaluation started",
  "status": "running"
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "task_id": "eval_789",
  "message": "MAS evaluation started",
  "status": "running"
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/status/{'{taskId}'}</span>
            </div>
            <p style={styles.endpointDescription}>Get evaluation task status and progress</p>
            
            <h4 style={styles.paramTitle}>Response</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "status": "completed",
  "progress": 100,
  "mas_score": 0.847,
  "total_samples": 100,
  "results": [...],
  "constitution": [...],
  "completed_at": "2024-01-15T10:30:00Z"
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "status": "completed",
  "progress": 100,
  "mas_score": 0.847,
  "total_samples": 100,
  "results": [...],
  "constitution": [...],
  "completed_at": "2024-01-15T10:30:00Z"
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/tasks</span>
            </div>
            <p style={styles.endpointDescription}>List all evaluation tasks</p>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/results/{'{taskId}'}/csv</span>
            </div>
            <p style={styles.endpointDescription}>Download detailed evaluation results as CSV</p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Model Management</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/models/available</span>
            </div>
            <p style={styles.endpointDescription}>Get list of available models for evaluation</p>
            
            <h4 style={styles.paramTitle}>Response</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "models": [
    {
      "name": "Gemma 2B Instruct",
      "path": "google/gemma-2b-it",
      "description": "Google Gemma 2B instruction-tuned model"
    }
  ],
  "ml_dependencies_available": true
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "models": [
    {
      "name": "Gemma 2B Instruct",
      "path": "google/gemma-2b-it",
      "description": "Google Gemma 2B instruction-tuned model"
    }
  ],
  "ml_dependencies_available": true
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/health</span>
            </div>
            <p style={styles.endpointDescription}>Check MAS evaluator health and dependencies</p>
            
            <h4 style={styles.paramTitle}>Response</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "status": "healthy",
  "service": "MAS Evaluator",
  "ml_dependencies_available": true,
  "torch_cuda_available": false,
  "torch_mps_available": true
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "status": "healthy",
  "service": "MAS Evaluator",
  "ml_dependencies_available": true,
  "torch_cuda_available": false,
  "torch_mps_available": true
}`}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Evaluation Parameters</h2>
          <div style={styles.paramGrid}>
            <div style={styles.param}>
              <h4 style={styles.paramName}>model_path</h4>
              <p style={styles.paramDesc}>HuggingFace model identifier or local path</p>
              <span style={styles.paramType}>string (required)</span>
            </div>
            <div style={styles.param}>
              <h4 style={styles.paramName}>agent_id</h4>
              <p style={styles.paramDesc}>Agent ID for constitutional framework</p>
              <span style={styles.paramType}>string (required)</span>
            </div>
            <div style={styles.param}>
              <h4 style={styles.paramName}>batch_size</h4>
              <p style={styles.paramDesc}>Number of samples to process simultaneously</p>
              <span style={styles.paramType}>integer (1-16, default: 4)</span>
            </div>
            <div style={styles.param}>
              <h4 style={styles.paramName}>max_tokens</h4>
              <p style={styles.paramDesc}>Maximum tokens for model responses</p>
              <span style={styles.paramType}>integer (50-1024, default: 256)</span>
            </div>
            <div style={styles.param}>
              <h4 style={styles.paramName}>limit</h4>
              <p style={styles.paramDesc}>Number of scenarios to evaluate</p>
              <span style={styles.paramType}>integer (1-1000, default: 100)</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Scoring Methodology</h2>
          <p style={styles.text}>
            MAS evaluation uses a hybrid scoring approach that combines:
          </p>
          <ul style={styles.methodList}>
            <li><strong>Base Alignment (60%)</strong> - Word overlap and semantic similarity with ideal responses</li>
            <li><strong>Constitutional Alignment (40%)</strong> - Adherence to agent constitutional principles</li>
            <li><strong>Principle-specific Scoring</strong> - Individual scores for each constitutional principle</li>
            <li><strong>Weighted Evaluation</strong> - Scenario difficulty and importance weighting</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Dependencies</h2>
          <p style={styles.text}>
            MAS evaluation requires the following Python packages:
          </p>
          <div style={styles.codeContainer}>
            <CopyButton text="pip install torch transformers datasets" />
            <div style={styles.codeBlock}>
              <code>{`pip install torch transformers datasets`}</code>
            </div>
          </div>
          <p style={styles.text}>
            If dependencies are missing, the API will return 503 status codes with installation instructions.
          </p>
        </div>
        
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerIcon: {
    width: '32px',
    height: '32px',
    color: '#23d9d9',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#8f9aa6',
    margin: 0,
  },
  content: {
    lineHeight: '1.6',
  },
container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerIcon: {
    width: '32px',
    height: '32px',
    color: '#23d9d9',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#8f9aa6',
    margin: 0,
  },
  content: {
    lineHeight: '1.6',
  },
  intro: {
    marginBottom: '40px',
  },
  text: {
    fontSize: '16px',
    color: '#cfd8e3',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  section: {
    marginBottom: '50px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px',
  },
  codeContainer: {
    position: 'relative',
    marginBottom: '20px',
  },
  copyButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(35, 217, 217, 0.1)',
    border: '1px solid rgba(35, 217, 217, 0.3)',
    borderRadius: '4px',
    padding: '8px',
    color: '#23d9d9',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    zIndex: 10,
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '16px',
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#23d9d9',
    whiteSpace: 'pre',
    lineHeight: '1.4',
  },
  endpoint: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  endpointHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  method: {
    backgroundColor: '#23d9d9',
    color: '#000',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: '60px',
    textAlign: 'center',
  },
  path: {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#ffffff',
    fontWeight: '500',
  },
  endpointDescription: {
    fontSize: '14px',
    color: '#8f9aa6',
    marginBottom: '20px',
  },
  paramTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px',
    marginTop: '20px',
  },
  paramList: {
    paddingLeft: '20px',
    color: '#cfd8e3',
  },
  modeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  mode: {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  },
  modeTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#23d9d9',
    marginBottom: '8px',
  },
  modeText: {
    fontSize: '12px',
    color: '#8f9aa6',
    lineHeight: '1.4',
  },
  errorGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  errorCode: {
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#cfd8e3',
  },
  paramGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  param: {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  },
  paramName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#23d9d9',
    marginBottom: '8px',
    fontFamily: 'monospace',
  },
  paramDesc: {
    fontSize: '12px',
    color: '#cfd8e3',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  paramType: {
    fontSize: '11px',
    color: '#8f9aa6',
    fontStyle: 'italic',
  },
  methodList: {
    paddingLeft: '20px',
    color: '#cfd8e3',
    lineHeight: '1.6',
  },
  schemaTable: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  schemaHeader: {
    display: 'grid',
    gridTemplateColumns: '200px 120px 1fr',
    backgroundColor: 'rgba(35, 217, 217, 0.1)',
    padding: '12px 16px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#ffffff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  schemaRow: {
    display: 'grid',
    gridTemplateColumns: '200px 120px 1fr',
    padding: '10px 16px',
    fontSize: '13px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  fieldCol: {
    fontFamily: 'monospace',
    color: '#23d9d9',
    fontWeight: '500',
  },
  typeCol: {
    color: '#8f9aa6',
    fontStyle: 'italic',
  },
  descCol: {
    color: '#cfd8e3',
  },
  indexGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  indexItem: {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  },
  indexCollection: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#23d9d9',
    marginBottom: '12px',
    fontFamily: 'monospace',
  },
  indexList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '12px',
    color: '#8f9aa6',
  },
};

export default MASEvaluationAPI;