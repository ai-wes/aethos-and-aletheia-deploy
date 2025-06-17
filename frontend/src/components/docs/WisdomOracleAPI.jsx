import React, { useState } from 'react';
import { Target, Copy, Check } from 'lucide-react';

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

const WisdomOracleAPI = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Target style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Wisdom Oracle API</h1>
          <p style={styles.subtitle}>Complete API reference for the Wisdom Oracle system</p>
        </div>
      </div>
      
      <div style={styles.content}>

        <div style={styles.intro}>
          <p style={styles.text}>
            The Wisdom Oracle API provides access to the Aethos wisdom reasoning engine, enabling 
            applications to query philosophical and ethical knowledge for moral guidance and decision-making.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Base URL</h2>
          <div style={styles.codeContainer}>
            <CopyButton text="http://localhost:8080/api" />
            <div style={styles.codeBlock}>
              <code>http://localhost:8080/api</code>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Authentication</h2>
          <p style={styles.text}>
            Currently, the API uses CORS for cross-origin requests. Future versions will include API key authentication.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Endpoints</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>POST</span>
              <span style={styles.path}>/api/query</span>
            </div>
            <p style={styles.endpointDescription}>Submit a wisdom query for ethical reasoning</p>
            
            <h4 style={styles.paramTitle}>Request Body</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "query": "How should AI systems balance individual privacy with collective safety?",
  "mode": "explore",
  "use_cache": true
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "query": "How should AI systems balance individual privacy with collective safety?",
  "mode": "explore",
  "use_cache": true
}`}</code>
              </div>
            </div>

            <h4 style={styles.paramTitle}>Response</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "response": "...",
  "reasoning_trace_id": "trace_123",
  "cached": false,
  "structured_response": {
    "key_points": ["Point 1", "Point 2"],
    "ethical_frameworks": ["Utilitarianism", "Deontology"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  }
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "response": "...",
  "reasoning_trace_id": "trace_123",
  "cached": false,
  "structured_response": {
    "key_points": ["Point 1", "Point 2"],
    "ethical_frameworks": ["Utilitarianism", "Deontology"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  }
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/trace/{'{traceId}'}</span>
            </div>
            <p style={styles.endpointDescription}>Retrieve detailed reasoning trace</p>
            
            <h4 style={styles.paramTitle}>Response</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "trace_id": "trace_123",
  "query": "...",
  "reasoning_steps": [...],
  "confidence_score": 0.85,
  "sources": [...]
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "trace_id": "trace_123",
  "query": "...",
  "reasoning_steps": [...],
  "confidence_score": 0.85,
  "sources": [...]
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>POST</span>
              <span style={styles.path}>/api/feedback</span>
            </div>
            <p style={styles.endpointDescription}>Submit feedback on wisdom responses</p>
            
            <h4 style={styles.paramTitle}>Request Body</h4>
            <div style={styles.codeContainer}>
              <CopyButton text={`{
  "trace_id": "trace_123",
  "rating": 4,
  "feedback": "Very helpful analysis",
  "improvement_suggestions": "Could include more diverse perspectives"
}`} />
              <div style={styles.codeBlock}>
                <code>{`{
  "trace_id": "trace_123",
  "rating": 4,
  "feedback": "Very helpful analysis",
  "improvement_suggestions": "Could include more diverse perspectives"
}`}</code>
              </div>
            </div>
          </div>

          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>GET</span>
              <span style={styles.path}>/api/wisdom-stats</span>
            </div>
            <p style={styles.endpointDescription}>Get wisdom oracle usage statistics</p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Query Modes</h2>
          <div style={styles.modeGrid}>
            <div style={styles.mode}>
              <h4 style={styles.modeTitle}>explore</h4>
              <p style={styles.modeText}>Deep philosophical exploration with multiple perspectives</p>
            </div>
            <div style={styles.mode}>
              <h4 style={styles.modeTitle}>practical</h4>
              <p style={styles.modeText}>Focused on actionable ethical guidance</p>
            </div>
            <div style={styles.mode}>
              <h4 style={styles.modeTitle}>framework</h4>
              <p style={styles.modeText}>Analysis through specific ethical frameworks</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Error Handling</h2>
          <div style={styles.errorGrid}>
            <div style={styles.errorCode}>
              <strong>400 Bad Request</strong>
              <p>Invalid query format or missing required fields</p>
            </div>
            <div style={styles.errorCode}>
              <strong>429 Too Many Requests</strong>
              <p>Rate limit exceeded, please slow down requests</p>
            </div>
            <div style={styles.errorCode}>
              <strong>500 Internal Server Error</strong>
              <p>Server error, please try again later</p>
            </div>
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

export default WisdomOracleAPI;