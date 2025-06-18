import React from 'react';
import { Brain, Target, Zap, Database } from 'lucide-react';

const SystemOverview = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Brain style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>System Overview</h1>
          <p style={styles.subtitle}>Understanding Aethos & Aletheia Architecture</p>
        </div>
      </div>
      
      <div style={styles.content}>
        <p style={styles.intro}>
          Aethos & Aletheia is a comprehensive platform for moral reasoning and AI safety evaluation,
          consisting of interconnected systems that work together to provide ethical decision-making capabilities.
          This platform enables the development, testing, and deployment of morally-aligned AI systems.
        </p>

        <div style={styles.architectureSection}>
          <h2 style={styles.sectionTitle}>System Architecture</h2>
          <p style={styles.text}>
            The platform follows a modular architecture where each component serves a specific role in the
            moral reasoning pipeline. Data flows between components through a shared MongoDB database and
            RESTful API endpoints.
          </p>
        </div>

        <div style={styles.components}>
          <div style={styles.component}>
            <Target style={styles.componentIcon} />
            <h3 style={styles.componentTitle}>Aethos (Wisdom Oracle)</h3>
            <p style={styles.componentText}>
              The wisdom reasoning engine that processes ethical queries and provides moral guidance
              based on accumulated wisdom and philosophical frameworks. Uses vector search and semantic
              reasoning to provide contextual ethical insights.
            </p>
            <div style={styles.features}>
              <span style={styles.feature}>• Philosophical reasoning</span>
              <span style={styles.feature}>• Vector-based wisdom search</span>
              <span style={styles.feature}>• Contextual moral guidance</span>
              <span style={styles.feature}>• Multi-framework integration</span>
            </div>
          </div>

          <div style={styles.component}>
            <Brain style={styles.componentIcon} />
            <h3 style={styles.componentTitle}>Aletheia (Learning Loop)</h3>
            <p style={styles.componentText}>
              The adaptive learning system that continuously improves AI agent constitutions
              through iterative moral scenario evaluation and constitutional reinforcement learning.
            </p>
            <div style={styles.features}>
              <span style={styles.feature}>• Constitutional reinforcement learning</span>
              <span style={styles.feature}>• Automated scenario generation</span>
              <span style={styles.feature}>• Agent constitution evolution</span>
              <span style={styles.feature}>• Performance analytics</span>
            </div>
          </div>

          <div style={styles.component}>
            <Zap style={styles.componentIcon} />
            <h3 style={styles.componentTitle}>MAS Evaluation</h3>
            <p style={styles.componentText}>
              Moral-Alignment Scoring system that evaluates AI models against constitutional
              principles using transformer models and constitutional AI scoring methodologies.
            </p>
            <div style={styles.features}>
              <span style={styles.feature}>• Hugging Face integration</span>
              <span style={styles.feature}>• Constitutional scoring</span>
              <span style={styles.feature}>• Batch evaluation</span>
              <span style={styles.feature}>• Detailed analytics</span>
            </div>
          </div>

          <div style={styles.component}>
            <Database style={styles.componentIcon} />
            <h3 style={styles.componentTitle}>Stress Testing & Export</h3>
            <p style={styles.componentText}>
              Comprehensive testing framework for validating moral principles under challenging 
              scenarios, plus Google Cloud integration for data export and collaboration.
            </p>
            <div style={styles.features}>
              <span style={styles.feature}>• Principle validation</span>
              <span style={styles.feature}>• Edge case testing</span>
              <span style={styles.feature}>• Google Cloud export</span>
              <span style={styles.feature}>• Colab integration</span>
            </div>
          </div>
        </div>

        <div style={styles.dataFlow}>
          <h2 style={styles.sectionTitle}>Data Flow & Integration</h2>
          <div style={styles.flowSteps}>
            <div style={styles.flowStep}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Scenario Creation</h4>
                <p style={styles.stepText}>
                  Moral scenarios are created through the Aletheia system or imported from external sources.
                  Scenarios are stored in MongoDB with metadata and evaluation criteria.
                </p>
              </div>
            </div>
            
            <div style={styles.flowStep}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Agent Constitution</h4>
                <p style={styles.stepText}>
                  AI agents are defined with constitutional principles that guide their moral reasoning.
                  Constitutions evolve through the learning loop based on performance feedback.
                </p>
              </div>
            </div>
            
            <div style={styles.flowStep}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Evaluation & Testing</h4>
                <p style={styles.stepText}>
                  Agents are evaluated using MAS scoring and stress testing to validate moral alignment.
                  Results feed back into the learning system for continuous improvement.
                </p>
              </div>
            </div>
            
            <div style={styles.flowStep}>
              <div style={styles.stepNumber}>4</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Wisdom Integration</h4>
                <p style={styles.stepText}>
                  Successful moral reasoning patterns are integrated into the Wisdom Oracle for 
                  future guidance and consultation by other systems.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.techStack}>
          <h2 style={styles.sectionTitle}>Technology Stack</h2>
          <div style={styles.techGrid}>
            <div style={styles.techCategory}>
              <h4 style={styles.techTitle}>Backend</h4>
              <ul style={styles.techList}>
                <li>Python Flask API</li>
                <li>MongoDB Atlas</li>
                <li>Google Vertex AI</li>
                <li>Hugging Face Transformers</li>
                <li>Vector Search</li>
              </ul>
            </div>
            <div style={styles.techCategory}>
              <h4 style={styles.techTitle}>Frontend</h4>
              <ul style={styles.techList}>
                <li>React 19</li>
                <li>React Router</li>
                <li>Lucide Icons</li>
                <li>Custom UI Components</li>
                <li>Real-time Updates</li>
              </ul>
            </div>
            <div style={styles.techCategory}>
              <h4 style={styles.techTitle}>Infrastructure</h4>
              <ul style={styles.techList}>
                <li>Google Cloud Platform</li>
                <li>Google Cloud Storage</li>
                <li>Vertex AI Platform</li>
                <li>Flask-CORS</li>
                <li>RESTful APIs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
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
    fontSize: '16px',
    color: '#cfd8e3',
    marginBottom: '40px',
  },
  architectureSection: {
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
  components: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '60px',
  },
  component: {
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  componentIcon: {
    width: '24px',
    height: '24px',
    color: '#23d9d9',
    marginBottom: '16px',
  },
  componentTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px',
  },
  componentText: {
    fontSize: '14px',
    color: '#8f9aa6',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  feature: {
    fontSize: '12px',
    color: '#23d9d9',
    opacity: 0.8,
  },
  dataFlow: {
    marginBottom: '60px',
  },
  flowSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  flowStep: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: '#23d9d9',
    color: '#000',
    borderRadius: '50%',
    fontSize: '18px',
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
  stepText: {
    fontSize: '14px',
    color: '#8f9aa6',
    lineHeight: '1.5',
  },
  techStack: {
    marginBottom: '40px',
  },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  techCategory: {
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  techTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px',
  },
  techList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
};

export default SystemOverview;