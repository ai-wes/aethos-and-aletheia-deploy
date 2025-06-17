import React, { useState } from 'react';
import { Settings, Copy, Check } from 'lucide-react';

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

const ConfigurationGuide = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Settings style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Configuration Guide</h1>
          <p style={styles.subtitle}>Environment setup and configuration options</p>
        </div>
      </div>
      
      <div style={styles.content}>
        <div style={styles.intro}>
          <p style={styles.text}>
            This guide covers environment setup, configuration options, and deployment requirements 
            for the Aethos & Aletheia platform.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Environment Variables</h2>
          <p style={styles.text}>
            Configure the following environment variables in your <code>.env</code> file:
          </p>
          
          <div style={styles.envGrid}>
            <div style={styles.envItem}>
              <h4 style={styles.envName}>MONGODB_URI</h4>
              <p style={styles.envDesc}>MongoDB Atlas connection string</p>
              <div style={styles.codeContainer}>
                <CopyButton text="MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aethos" />
                <div style={styles.codeBlock}>
                  <code>MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aethos</code>
                </div>
              </div>
              <span style={styles.envRequired}>Required</span>
            </div>

            <div style={styles.envItem}>
              <h4 style={styles.envName}>GOOGLE_CLOUD_PROJECT</h4>
              <p style={styles.envDesc}>Google Cloud Project ID for Vertex AI</p>
              <div style={styles.codeContainer}>
                <CopyButton text="GOOGLE_CLOUD_PROJECT=your-project-id" />
                <div style={styles.codeBlock}>
                  <code>GOOGLE_CLOUD_PROJECT=your-project-id</code>
                </div>
              </div>
              <span style={styles.envRequired}>Required</span>
            </div>

            <div style={styles.envItem}>
              <h4 style={styles.envName}>GEMINI_API_KEY</h4>
              <p style={styles.envDesc}>Google Gemini API key for AI processing</p>
              <div style={styles.codeContainer}>
                <CopyButton text="GEMINI_API_KEY=your-api-key" />
                <div style={styles.codeBlock}>
                  <code>GEMINI_API_KEY=your-api-key</code>
                </div>
              </div>
              <span style={styles.envRequired}>Required</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Installation Steps</h2>
          
          <div style={styles.stepsList}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Python Backend Setup</h4>
                <div style={styles.codeContainer}>
                  <CopyButton text={`# Install dependencies
pip install -r requirements.txt

# Optional: Install ML dependencies for MAS evaluation
pip install torch transformers datasets`} />
                  <div style={styles.codeBlock}>
                    <code>{`# Install dependencies
pip install -r requirements.txt

# Optional: Install ML dependencies for MAS evaluation
pip install torch transformers datasets`}</code>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Frontend Setup</h4>
                <div style={styles.codeContainer}>
                  <CopyButton text={`cd aethos_aletheia_ui && npm install`} />
                  <div style={styles.codeBlock}>
                    <code>{`cd aethos_aletheia_ui && npm install`}</code>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Start Services</h4>
                <div style={styles.codeContainer}>
                  <CopyButton text={`# Terminal 1: Backend
python app.py

# Terminal 2: Frontend  
cd aethos_aletheia_ui && npm start`} />
                  <div style={styles.codeBlock}>
                    <code>{`# Terminal 1: Backend
python app.py

# Terminal 2: Frontend  
cd aethos_aletheia_ui && npm start`}</code>
                  </div>
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

};

export default ConfigurationGuide;