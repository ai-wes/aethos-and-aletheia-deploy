import React, { useState } from 'react';
import { Rocket, Clock, CheckCircle, Copy, Check } from 'lucide-react';

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

const GettingStarted = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Rocket style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Getting Started</h1>
          <p style={styles.subtitle}>Quick start guide to Aethos & Aletheia</p>
        </div>
      </div>
      
      <div style={styles.content}>
        <div style={styles.quickStart}>
          <h2 style={styles.sectionTitle}>Quick Start</h2>
          <p style={styles.text}>
            Welcome to Aethos & Aletheia - a comprehensive platform for moral reasoning, 
            AI safety evaluation, and ethical decision-making systems.
          </p>
          
          <div style={styles.timeEstimate}>
            <Clock style={styles.timeIcon} />
            <span>Estimated setup time: 10-15 minutes</span>
          </div>
        </div>

        <div style={styles.steps}>
          <h3 style={styles.stepsTitle}>Setup Steps</h3>
          
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Environment Setup</h4>
              <p style={styles.stepText}>
                Configure your environment variables and dependencies.
              </p>
              <div style={styles.codeContainer}>
                <CopyButton text={`# Copy environment template
cp .env.example .env

# Install Python dependencies
pip install -r requirements.txt

# Install UI dependencies
cd aethos_aletheia_ui && npm install`} />
                <div style={styles.codeBlock}>
                  <code>
                    {`# Copy environment template
cp .env.example .env

# Install Python dependencies
pip install -r requirements.txt

# Install UI dependencies
cd aethos_aletheia_ui && npm install`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Database Configuration</h4>
              <p style={styles.stepText}>
                Set up MongoDB connection and initialize collections.
              </p>
              <div style={styles.codeContainer}>
                <CopyButton text={`# Set MongoDB URI in .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Initialize database
python -c "from app import seed_database; seed_database()"`} />
                <div style={styles.codeBlock}>
                  <code>
                    {`# Set MongoDB URI in .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Initialize database
python -c "from app import seed_database; seed_database()"`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <div style={styles.stepContent}>
              <h4 style={styles.stepTitle}>Start the System</h4>
              <p style={styles.stepText}>
                Launch the backend API and frontend interface.
              </p>
              <div style={styles.codeContainer}>
                <CopyButton text={`# Start backend (Terminal 1)
python app.py

# Start frontend (Terminal 2)
cd aethos_aletheia_ui && npm start`} />
                <div style={styles.codeBlock}>
                  <code>
                    {`# Start backend (Terminal 1)
python app.py

# Start frontend (Terminal 2)
cd aethos_aletheia_ui && npm start`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.nextSteps}>
          <h3 style={styles.nextStepsTitle}>Next Steps</h3>
          <div style={styles.nextStepsList}>
            <div style={styles.nextStep}>
              <CheckCircle style={styles.checkIcon} />
              <span>Explore the <a href="/docs/overview" style={styles.link}>System Overview</a></span>
            </div>
            <div style={styles.nextStep}>
              <CheckCircle style={styles.checkIcon} />
              <span>Try the <a href="/dashboard" style={styles.link}>Interactive Dashboard</a></span>
            </div>
            <div style={styles.nextStep}>
              <CheckCircle style={styles.checkIcon} />
              <span>Read the <a href="/docs/api/wisdom-oracle" style={styles.link}>API Documentation</a></span>
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
  quickStart: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '16px',
  },
  text: {
    fontSize: '16px',
    color: '#cfd8e3',
    marginBottom: '20px',
  },
  timeEstimate: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'rgba(35, 217, 217, 0.1)',
    border: '1px solid rgba(35, 217, 217, 0.3)',
    borderRadius: '8px',
    color: '#23d9d9',
    fontSize: '14px',
    fontWeight: '500',
  },
  timeIcon: {
    width: '16px',
    height: '16px',
  },
  steps: {
    marginBottom: '40px',
  },
  stepsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '24px',
  },
  step: {
    display: 'flex',
    gap: '20px',
    marginBottom: '32px',
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
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
  },
  stepText: {
    fontSize: '14px',
    color: '#8f9aa6',
    marginBottom: '16px',
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
    whiteSpace: 'pre',
    lineHeight: '1.4',
  },
  nextSteps: {
    marginTop: '40px',
  },
  nextStepsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px',
  },
  nextStepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  nextStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  checkIcon: {
    width: '16px',
    height: '16px',
    color: '#23d9d9',
  },
  link: {
    color: '#23d9d9',
    textDecoration: 'none',
  },
};

export default GettingStarted;