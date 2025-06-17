import React, { useState } from 'react';
import { Lock, Copy, Check } from 'lucide-react';

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

const SecurityGuide = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Lock style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Security Guide</h1>
          <p style={styles.subtitle}>Security best practices and authentication</p>
        </div>
      </div>
      
      <div style={styles.content}>
        <div style={styles.intro}>
          <p style={styles.text}>
            Security best practices, authentication methods, and data protection guidelines 
            for the Aethos & Aletheia platform.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Authentication & Authorization</h2>
          
          <div style={styles.authSection}>
            <h3 style={styles.authTitle}>Current Implementation</h3>
            <p style={styles.text}>
              The current version uses CORS-based security with the following configuration:
            </p>
            <div style={styles.codeContainer}>
              <CopyButton text={`# Flask CORS Configuration
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Configure specific domains in production
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})`} />
              <div style={styles.codeBlock}>
                <code>{`# Flask CORS Configuration
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Configure specific domains in production
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})`}</code>
              </div>
            </div>
          </div>

          <div style={styles.authSection}>
            <h3 style={styles.authTitle}>Production Authentication</h3>
            <p style={styles.text}>
              For production deployment, implement API key authentication:
            </p>
            <div style={styles.codeContainer}>
              <CopyButton text={`# Example API Key Implementation
from functools import wraps
import hashlib

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or not validate_api_key(api_key):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

def validate_api_key(api_key):
    # Implement your API key validation logic
    valid_keys = os.getenv('VALID_API_KEYS', '').split(',')
    return api_key in valid_keys

@app.route('/api/query', methods=['POST'])
@require_api_key
def wisdom_query():
    # Your API logic here
    pass`} />
              <div style={styles.codeBlock}>
                <code>{`# Example API Key Implementation
from functools import wraps
import hashlib

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or not validate_api_key(api_key):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

def validate_api_key(api_key):
    # Implement your API key validation logic
    valid_keys = os.getenv('VALID_API_KEYS', '').split(',')
    return api_key in valid_keys

@app.route('/api/query', methods=['POST'])
@require_api_key
def wisdom_query():
    # Your API logic here
    pass`}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Data Protection</h2>
          
          <div style={styles.dataSection}>
            <h3 style={styles.dataTitle}>Sensitive Data Handling</h3>
            <ul style={styles.dataList}>
              <li><strong>Queries:</strong> Wisdom oracle queries may contain sensitive information</li>
              <li><strong>Constitutions:</strong> Agent constitutions may reveal proprietary ethics frameworks</li>
              <li><strong>Scenarios:</strong> Training scenarios may contain confidential test cases</li>
              <li><strong>API Keys:</strong> Google Cloud and other service credentials require protection</li>
            </ul>
          </div>

          <div style={styles.dataSection}>
            <h3 style={styles.dataTitle}>Encryption</h3>
            <div style={styles.encryptionGrid}>
              <div style={styles.encryptionItem}>
                <h4 style={styles.encryptionTitle}>In Transit</h4>
                <ul style={styles.encryptionList}>
                  <li>Use HTTPS for all API communications</li>
                  <li>Enable TLS 1.2+ for MongoDB connections</li>
                  <li>Encrypt Google Cloud API communications</li>
                  <li>Use secure WebSocket connections for real-time updates</li>
                </ul>
              </div>
              
              <div style={styles.encryptionItem}>
                <h4 style={styles.encryptionTitle}>At Rest</h4>
                <ul style={styles.encryptionList}>
                  <li>Enable MongoDB Atlas encryption at rest</li>
                  <li>Use Google Cloud KMS for key management</li>
                  <li>Encrypt environment variables in deployment</li>
                  <li>Secure storage for API keys and credentials</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Network Security</h2>
          
          <div style={styles.networkSection}>
            <h3 style={styles.networkTitle}>Firewall Configuration</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`# MongoDB Atlas Network Access
# Allow only specific IP addresses or ranges
IP_WHITELIST = [
    "203.0.113.0/24",    # Office network
    "198.51.100.50/32",  # Production server
    "0.0.0.0/0"          # Remove this in production!
]

# Google Cloud Firewall Rules
gcloud compute firewall-rules create aethos-api \
    --allow tcp:8080 \
    --source-ranges 203.0.113.0/24 \
    --description "Allow API access from office network"`} />
              <div style={styles.codeBlock}>
                <code>{`# MongoDB Atlas Network Access
# Allow only specific IP addresses or ranges
IP_WHITELIST = [
    "203.0.113.0/24",    # Office network
    "198.51.100.50/32",  # Production server
    "0.0.0.0/0"          # Remove this in production!
]

# Google Cloud Firewall Rules
gcloud compute firewall-rules create aethos-api \
    --allow tcp:8080 \
    --source-ranges 203.0.113.0/24 \
    --description "Allow API access from office network"`}</code>
              </div>
            </div>
          </div>

          <div style={styles.networkSection}>
            <h3 style={styles.networkTitle}>Rate Limiting</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`# Flask-Limiter Implementation
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour", "20 per minute"]
)

@app.route('/api/query', methods=['POST'])
@limiter.limit("10 per minute")
def wisdom_query():
    # API logic here
    pass

@app.route('/api/evaluate', methods=['POST'])
@limiter.limit("5 per hour")  # More restrictive for compute-intensive operations
def mas_evaluation():
    # MAS evaluation logic
    pass`} />
              <div style={styles.codeBlock}>
                <code>{`# Flask-Limiter Implementation
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour", "20 per minute"]
)

@app.route('/api/query', methods=['POST'])
@limiter.limit("10 per minute")
def wisdom_query():
    # API logic here
    pass

@app.route('/api/evaluate', methods=['POST'])
@limiter.limit("5 per hour")  # More restrictive for compute-intensive operations
def mas_evaluation():
    # MAS evaluation logic
    pass`}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Input Validation & Sanitization</h2>
          
          <div style={styles.validationSection}>
            <h3 style={styles.validationTitle}>Query Validation</h3>
            <div style={styles.codeBlock}>
              <code>{`import re
from flask import request, jsonify

def validate_query_input():
    data = request.get_json()
    
    # Validate required fields
    if not data or 'query' not in data:
        return jsonify({'error': 'Query field is required'}), 400
    
    query = data['query']
    
    # Length validation
    if len(query) > 10000:
        return jsonify({'error': 'Query too long (max 10000 characters)'}), 400
    
    if len(query.strip()) < 10:
        return jsonify({'error': 'Query too short (min 10 characters)'}), 400
    
    # Content validation - block potentially harmful content
    blocked_patterns = [
        r'<script[^>]*>.*?</script>',  # XSS attempts
        r'javascript:',                # JavaScript URLs
        r'data:text/html',            # Data URLs
        r'(eval|exec|__import__)'  # Code execution
    ]
    
    for pattern in blocked_patterns:
        if re.search(pattern, query, re.IGNORECASE):
            return jsonify({'error': 'Query contains prohibited content'}), 400
    
    # Mode validation
    allowed_modes = ['explore', 'practical', 'framework']
    mode = data.get('mode', 'explore')
    if mode not in allowed_modes:
        return jsonify({'error': f'Invalid mode. Allowed: {allowed_modes}'}), 400
    
    return None  # Validation passed`}</code>
            </div>
          </div>

          <div style={styles.validationSection}>
            <h3 style={styles.validationTitle}>Database Query Security</h3>
            <div style={styles.codeBlock}>
              <code>{`# Use parameterized queries to prevent injection
from bson import ObjectId
import pymongo.errors

def get_agent_securely(agent_id):
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(agent_id):
            raise ValueError("Invalid agent ID format")
        
        # Use parameterized query
        agent = db.agents.find_one({"agent_id": agent_id})
        
        if not agent:
            raise ValueError("Agent not found")
            
        return agent
        
    except (ValueError, pymongo.errors.PyMongoError) as e:
        logger.error(f"Database query error: {e}")
        raise

# Sanitize user input for text search
def sanitize_search_query(query):
    # Remove special MongoDB operators
    dangerous_chars = ['$', '{', '}', '\']
    for char in dangerous_chars:
        query = query.replace(char, '')
    
    # Limit length
    return query[:500]`}</code>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Monitoring & Logging</h2>
          
          <div style={styles.monitoringSection}>
            <h3 style={styles.monitoringTitle}>Security Event Logging</h3>
            <div style={styles.codeBlock}>
              <code>{`import logging
from datetime import datetime

# Configure security logger
security_logger = logging.getLogger('security')
security_handler = logging.FileHandler('security.log')
security_formatter = logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s'
)
security_handler.setFormatter(security_formatter)
security_logger.addHandler(security_handler)
security_logger.setLevel(logging.INFO)

def log_security_event(event_type, details, ip_address=None):
    ip_address = ip_address or request.remote_addr
    security_logger.info(f"{event_type} - IP: {ip_address} - {details}")

# Usage examples
log_security_event("AUTH_FAILURE", "Invalid API key attempted")
log_security_event("RATE_LIMIT", "Rate limit exceeded")
log_security_event("QUERY_BLOCKED", "Malicious content detected in query")
log_security_event("LARGE_QUERY", f"Unusually large query: {len(query)} chars")`}</code>
            </div>
          </div>

          <div style={styles.monitoringSection}>
            <h3 style={styles.monitoringTitle}>Anomaly Detection</h3>
            <ul style={styles.anomalyList}>
              <li><strong>Unusual Query Patterns:</strong> Detect abnormal query frequencies or content</li>
              <li><strong>Failed Authentication:</strong> Monitor repeated authentication failures</li>
              <li><strong>Large Data Requests:</strong> Flag requests for unusually large datasets</li>
              <li><strong>Geographic Anomalies:</strong> Detect access from unexpected locations</li>
              <li><strong>Time-based Patterns:</strong> Monitor access outside normal business hours</li>
            </ul>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Compliance & Privacy</h2>
          
          <div style={styles.complianceSection}>
            <h3 style={styles.complianceTitle}>Data Retention</h3>
            <div style={styles.retentionGrid}>
              <div style={styles.retentionItem}>
                <h4 style={styles.retentionTitle}>Wisdom Queries</h4>
                <p style={styles.retentionText}>
                  Retain for analysis and improvement, but implement automatic deletion after 90 days
                  unless specifically flagged for research purposes.
                </p>
              </div>
              
              <div style={styles.retentionItem}>
                <h4 style={styles.retentionTitle}>Learning Data</h4>
                <p style={styles.retentionText}>
                  Agent learning cycles and performance data may be retained indefinitely for
                  system improvement, but should be anonymized.
                </p>
              </div>
              
              <div style={styles.retentionItem}>
                <h4 style={styles.retentionTitle}>Security Logs</h4>
                <p style={styles.retentionText}>
                  Security events should be retained for at least 1 year for incident investigation
                  and compliance auditing purposes.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.complianceSection}>
            <h3 style={styles.complianceTitle}>Privacy Protection</h3>
            <ul style={styles.privacyList}>
              <li>Implement data anonymization for queries containing personal information</li>
              <li>Provide user data deletion capabilities upon request</li>
              <li>Use data minimization - collect only necessary information</li>
              <li>Implement consent mechanisms for data collection</li>
              <li>Regular privacy impact assessments</li>
              <li>Secure data sharing agreements with third parties</li>
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

export default SecurityGuide;