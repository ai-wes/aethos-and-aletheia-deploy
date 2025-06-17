import React, { useState } from 'react';
import { HelpCircle, Copy, Check } from 'lucide-react';

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

const Troubleshooting = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <HelpCircle style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Troubleshooting</h1>
          <p style={styles.subtitle}>Common issues and debugging techniques</p>
        </div>
      </div>
      
      <div style={styles.content}>
        <div style={styles.intro}>
          <p style={styles.text}>
            Common issues, debugging techniques, and solutions for the Aethos & Aletheia platform.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Common Issues</h2>
          
          <div style={styles.issueGrid}>
            <div style={styles.issue}>
              <h4 style={styles.issueTitle}>MongoDB Connection Failed</h4>
              <div style={styles.issueSymptoms}>
                <strong>Symptoms:</strong>
                <ul style={styles.symptomsList}>
                  <li>pymongo.errors.ServerSelectionTimeoutError</li>
                  <li>Connection timeout errors</li>
                  <li>"No module named 'pymongo'" error</li>
                </ul>
              </div>
              <div style={styles.issueSolution}>
                <strong>Solutions:</strong>
                <ol style={styles.solutionsList}>
                  <li>Verify MONGODB_URI in .env file</li>
                  <li>Check network connectivity to MongoDB Atlas</li>
                  <li>Ensure IP address is whitelisted in Atlas</li>
                  <li>Install pymongo: <code>pip install pymongo</code></li>
                </ol>
              </div>
            </div>

            <div style={styles.issue}>
              <h4 style={styles.issueTitle}>Google Cloud Authentication</h4>
              <div style={styles.issueSymptoms}>
                <strong>Symptoms:</strong>
                <ul style={styles.symptomsList}>
                  <li>google.auth.exceptions.DefaultCredentialsError</li>
                  <li>403 Forbidden errors from Google APIs</li>
                  <li>Vertex AI initialization failures</li>
                </ul>
              </div>
              <div style={styles.issueSolution}>
                <strong>Solutions:</strong>
                <ol style={styles.solutionsList}>
                  <li>Set GOOGLE_APPLICATION_CREDENTIALS environment variable</li>
                  <li>Verify service account has required permissions</li>
                  <li>Enable required APIs in Google Cloud Console</li>
                  <li>Check project ID and region configuration</li>
                </ol>
              </div>
            </div>

            <div style={styles.issue}>
              <h4 style={styles.issueTitle}>MAS Evaluation Dependencies</h4>
              <div style={styles.issueSymptoms}>
                <strong>Symptoms:</strong>
                <ul style={styles.symptomsList}>
                  <li>503 Service Unavailable for MAS endpoints</li>
                  <li>"ML dependencies not installed" error</li>
                  <li>Import errors for torch/transformers</li>
                </ul>
              </div>
              <div style={styles.issueSolution}>
                <strong>Solutions:</strong>
                <ol style={styles.solutionsList}>
                  <li>Install ML dependencies: <code>pip install torch transformers datasets</code></li>
                  <li>For Apple Silicon Macs: <code>pip install --pre torch torchvision --index-url https://download.pytorch.org/whl/nightly/cpu</code></li>
                  <li>Check CUDA availability if using GPU</li>
                  <li>Verify sufficient system memory</li>
                </ol>
              </div>
            </div>

            <div style={styles.issue}>
              <h4 style={styles.issueTitle}>Frontend Connection Issues</h4>
              <div style={styles.issueSymptoms}>
                <strong>Symptoms:</strong>
                <ul style={styles.symptomsList}>
                  <li>CORS errors in browser console</li>
                  <li>Network errors when calling API</li>
                  <li>Components showing "OFFLINE" status</li>
                </ul>
              </div>
              <div style={styles.issueSolution}>
                <strong>Solutions:</strong>
                <ol style={styles.solutionsList}>
                  <li>Ensure backend is running on port 8080</li>
                  <li>Check REACT_APP_API_URL environment variable</li>
                  <li>Verify CORS configuration in Flask app</li>
                  <li>Clear browser cache and cookies</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Debugging Techniques</h2>
          
          <div style={styles.debugSection}>
            <h3 style={styles.debugTitle}>Backend Debugging</h3>
            <div style={styles.codeBlock}>
              <code>{`# Enable debug mode
export FLASK_ENV=development
export DEBUG=True

# Increase logging verbosity
import logging
logging.basicConfig(level=logging.DEBUG)

# Add debug prints
print(f"Processing query: {query}")
print(f"Database connection: {db.client.admin.command('ping')}")

# Use debugger
import pdb; pdb.set_trace()`}</code>
            </div>
          </div>

          <div style={styles.debugSection}>
            <h3 style={styles.debugTitle}>Frontend Debugging</h3>
            <div style={styles.codeBlock}>
              <code>{`// Enable detailed API logging
console.log('API Request:', url, config);
console.log('API Response:', response.status, response.data);

// Check component state
console.log('Component state:', this.state);

// Network debugging in browser DevTools
// 1. Open Network tab
// 2. Check for failed requests (red status)
// 3. Examine request/response headers
// 4. Look for CORS or timeout issues`}</code>
            </div>
          </div>

          <div style={styles.debugSection}>
            <h3 style={styles.debugTitle}>Database Debugging</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`# Test MongoDB connection
from pymongo import MongoClient
client = MongoClient(MONGODB_URI)
print(client.admin.command('ping'))

# Check collections
db = client[DATABASE_NAME]
print(f"Collections: {db.list_collection_names()}")

# Query debugging
collection = db.scenarios
print(f"Document count: {collection.count_documents({})}")
print(f"Sample document: {collection.find_one()}")`} />
              <div style={styles.codeBlock}>
                <code>{`# Test MongoDB connection
from pymongo import MongoClient
client = MongoClient(MONGODB_URI)
print(client.admin.command('ping'))

# Check collections
db = client[DATABASE_NAME]
print(f"Collections: {db.list_collection_names()}")

# Query debugging
collection = db.scenarios
print(f"Document count: {collection.count_documents({})}")
print(f"Sample document: {collection.find_one()}")`}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Performance Optimization</h2>
          
          <div style={styles.perfTips}>
            <div style={styles.perfTip}>
              <h4 style={styles.perfTitle}>Database Optimization</h4>
              <ul style={styles.perfList}>
                <li>Create indexes on frequently queried fields</li>
                <li>Use connection pooling for multiple requests</li>
                <li>Implement query result caching</li>
                <li>Limit query result sizes with pagination</li>
                <li>Use projection to fetch only needed fields</li>
              </ul>
            </div>

            <div style={styles.perfTip}>
              <h4 style={styles.perfTitle}>API Performance</h4>
              <ul style={styles.perfList}>
                <li>Enable response compression (gzip)</li>
                <li>Implement request rate limiting</li>
                <li>Use async processing for long-running tasks</li>
                <li>Cache frequently requested data</li>
                <li>Optimize JSON serialization</li>
              </ul>
            </div>

            <div style={styles.perfTip}>
              <h4 style={styles.perfTitle}>Frontend Performance</h4>
              <ul style={styles.perfList}>
                <li>Implement component lazy loading</li>
                <li>Use React.memo for expensive components</li>
                <li>Debounce user input for search</li>
                <li>Implement virtual scrolling for large lists</li>
                <li>Optimize bundle size with code splitting</li>
              </ul>
            </div>

            <div style={styles.perfTip}>
              <h4 style={styles.perfTitle}>ML Model Performance</h4>
              <ul style={styles.perfList}>
                <li>Use GPU acceleration when available</li>
                <li>Implement model caching and reuse</li>
                <li>Optimize batch sizes for evaluation</li>
                <li>Use quantized models for faster inference</li>
                <li>Monitor memory usage during evaluation</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Log Analysis</h2>
          
          <div style={styles.logSection}>
            <h3 style={styles.logTitle}>Important Log Patterns</h3>
            <div style={styles.logPatterns}>
              <div style={styles.logPattern}>
                <strong>Successful Query:</strong>
                <div style={styles.codeBlock}>
                  <code>INFO - Processing wisdom query: "..." (mode: explore)</code>
                </div>
              </div>
              
              <div style={styles.logPattern}>
                <strong>Database Error:</strong>
                <div style={styles.codeBlock}>
                  <code>ERROR - MongoDB connection failed: ServerSelectionTimeoutError</code>
                </div>
              </div>
              
              <div style={styles.logPattern}>
                <strong>Authentication Error:</strong>
                <div style={styles.codeBlock}>
                  <code>ERROR - Google Cloud authentication failed: DefaultCredentialsError</code>
                </div>
              </div>
              
              <div style={styles.logPattern}>
                <strong>Rate Limiting:</strong>
                <div style={styles.codeBlock}>
                  <code>WARN - Rate limit exceeded for IP: 192.168.1.100</code>
                </div>
              </div>
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
  exampleGroup: {
    marginBottom: '30px',
  },
  exampleTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px',
  },
  issueGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
  },
  issue: {
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  issueTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: '12px',
  },
  issueSymptoms: {
    marginBottom: '16px',
  },
  symptomsList: {
    color: '#8f9aa6',
    fontSize: '14px',
    paddingLeft: '20px',
  },
  issueSolution: {
    marginBottom: '16px',
  },
  solutionsList: {
    color: '#cfd8e3',
    fontSize: '14px',
    paddingLeft: '20px',
  },
  envGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  envItem: {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  },
  envName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#23d9d9',
    marginBottom: '8px',
    fontFamily: 'monospace',
  },
  envDesc: {
    fontSize: '12px',
    color: '#8f9aa6',
    marginBottom: '12px',
  },
  envRequired: {
    fontSize: '11px',
    color: '#ff6b6b',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  envOptional: {
    fontSize: '11px',
    color: '#51cf66',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  step: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#23d9d9',
    color: '#000',
    borderRadius: '50%',
    fontSize: '16px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
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
};

export default Troubleshooting;