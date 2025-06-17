import React, { useState } from 'react';
import { Brain, Copy, Check } from 'lucide-react';

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

const AletheiaAPI = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Brain style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Aletheia Learning API</h1>
          <p style={styles.subtitle}>API documentation for the Aletheia learning system</p>
        </div>
      </div>
      
      <div style={styles.content}>

        <div style={styles.intro}>
          <p style={styles.text}>
            The Aletheia API manages AI agents and their constitutional learning processes. It enables 
            agent creation, learning cycle execution, and constitution evolution through reinforcement learning.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Agent Management</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/aletheia/agents</span>
            </div>
            <p style={styles.endpointDescription}>List all AI agents</p>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>POST</span>
              <span style={styles.path}>/api/aletheia/create_agent</span>
            </div>
            <p style={styles.endpointDescription}>Create a new AI agent with initial constitution</p>
            
            <h4 style={styles.paramTitle}>Request Body</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "name": "Ethical Assistant v1",
  "initial_constitution": [
    "Always prioritize human welfare and dignity",
    "Consider consequences for all stakeholders", 
    "Respect individual rights and autonomy",
    "Act with transparency and honesty",
    "Minimize harm while maximizing benefit"
  ]
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "name": "Ethical Assistant v1",
  "initial_constitution": [
    "Always prioritize human welfare and dignity",
    "Consider consequences for all stakeholders", 
    "Respect individual rights and autonomy",
    "Act with transparency and honesty",
    "Minimize harm while maximizing benefit"
  ]
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/aletheia/agents/{'{agentId}'}</span>
            </div>
            <p style={styles.endpointDescription}>Get detailed agent information</p>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>DELETE</span>
              <span style={styles.path}>/api/aletheia/agents/{'{agentId}'}</span>
            </div>
            <p style={styles.endpointDescription}>Delete an agent and all associated data</p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Constitution Management</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/aletheia/agents/{'{agentId}'}/constitution</span>
            </div>
            <p style={styles.endpointDescription}>Get current agent constitution</p>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>PUT</span>
              <span style={styles.path}>/api/aletheia/agents/{'{agentId}'}/constitution</span>
            </div>
            <p style={styles.endpointDescription}>Update agent constitution</p>
            
            <h4 style={styles.paramTitle}>Request Body</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "constitution": [
    "Updated principle 1",
    "Updated principle 2", 
    "Updated principle 3"
  ]
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "constitution": [
    "Updated principle 1",
    "Updated principle 2", 
    "Updated principle 3"
  ]
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/aletheia/agents/{'{agentId}'}/constitution-history</span>
            </div>
            <p style={styles.endpointDescription}>Get constitution evolution history</p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Learning Cycles</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>POST</span>
              <span style={styles.path}>/api/aletheia/start_cycle</span>
            </div>
            <p style={styles.endpointDescription}>Start a learning cycle for an agent</p>
            
            <h4 style={styles.paramTitle}>Request Body</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "agent_id": "agent_123",
  "cycles": 1
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "agent_id": "agent_123",
  "cycles": 1
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/aletheia/history/{'{agentId}'}</span>
            </div>
            <p style={styles.endpointDescription}>Get learning history for an agent</p>
            
            <h4 style={styles.paramTitle}>Query Parameters</h4>
            <ul style={styles.paramList}>
              <li><code>limit</code> - Maximum number of records (default: 10)</li>
            </ul>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/aletheia/agents/{'{agentId}'}/analytics</span>
            </div>
            <p style={styles.endpointDescription}>Get learning analytics and performance metrics</p>
            
            <h4 style={styles.paramTitle}>Query Parameters</h4>
            <ul style={styles.paramList}>
              <li><code>days</code> - Time period for analytics (default: 30)</li>
            </ul>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Scenarios</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/aletheia/scenarios</span>
            </div>
            <p style={styles.endpointDescription}>List all available scenarios</p>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/aletheia/scenarios/random</span>
            </div>
            <p style={styles.endpointDescription}>Get a random scenario for training</p>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>POST</span>
              <span style={styles.path}>/api/aletheia/scenarios</span>
            </div>
            <p style={styles.endpointDescription}>Create a new scenario</p>
            
            <h4 style={styles.paramTitle}>Request Body</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "scenario_description": "A self-driving car must choose between hitting one person or five people",
  "difficulty": "hard",
  "category": "trolley_problem",
  "expected_reasoning": "...",
  "evaluation_criteria": [...]
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "scenario_description": "A self-driving car must choose between hitting one person or five people",
  "difficulty": "hard",
  "category": "trolley_problem",
  "expected_reasoning": "...",
  "evaluation_criteria": [...]
}`}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Real-time Updates</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>SSE</span>
              <span style={styles.path}>/api/aletheia/stream/learning/{'{agentId}'}</span>
            </div>
            <p style={styles.endpointDescription}>Server-sent events for real-time learning updates</p>
            
            <h4 style={styles.paramTitle}>Event Types</h4>
            <ul style={styles.paramList}>
              <li><code>cycle_started</code> - Learning cycle began</li>
              <li><code>scenario_processed</code> - Scenario evaluation completed</li>
              <li><code>constitution_updated</code> - Constitution evolved</li>
              <li><code>cycle_completed</code> - Learning cycle finished</li>
            </ul>
          </div>
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

export default AletheiaAPI;