import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

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

const APIExamples = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Code style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>API Examples</h1>
          <p style={styles.subtitle}>Working code examples and integration patterns</p>
        </div>
      </div>
      
      <div style={styles.content}>
        <div style={styles.intro}>
          <p style={styles.text}>
            Working code examples and integration patterns for all Aethos & Aletheia APIs.
            Examples are provided in Python, JavaScript, and curl for comprehensive integration guidance.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Wisdom Oracle Examples</h2>
          
          <div style={styles.exampleGroup}>
            <h3 style={styles.exampleTitle}>Python Example</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`import requests

def query_wisdom_oracle(query, mode="explore"):
    url = "http://localhost:8080/api/query"
    payload = {
        "query": query,
        "mode": mode,
        "use_cache": True
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        raise Exception(f"Error: {response.status_code}")

# Usage
result = query_wisdom_oracle(
    "How should AI systems handle conflicting ethical principles?"
)
print(result["response"])`} />
              <div style={styles.codeBlock}>
                <code>{`import requests

def query_wisdom_oracle(query, mode="explore"):
    url = "http://localhost:8080/api/query"
    payload = {
        "query": query,
        "mode": mode,
        "use_cache": True
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        raise Exception(f"Error: {response.status_code}")

# Usage
result = query_wisdom_oracle(
    "How should AI systems handle conflicting ethical principles?"
)
print(result["response"])`}</code>
              </div>
            </div>
          </div>

          <div style={styles.exampleGroup}>
            <h3 style={styles.exampleTitle}>JavaScript Example</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`async function queryWisdomOracle(query, mode = 'explore') {
  const response = await fetch('http://localhost:8080/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      mode: mode,
      use_cache: true
    })
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  return await response.json();
}

// Usage
queryWisdomOracle('What are the key principles of AI ethics?')
  .then(result => console.log(result.response))
  .catch(error => console.error('Error:', error));`} />
              <div style={styles.codeBlock}>
                <code>{`async function queryWisdomOracle(query, mode = 'explore') {
  const response = await fetch('http://localhost:8080/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      mode: mode,
      use_cache: true
    })
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  return await response.json();
}

// Usage
queryWisdomOracle('What are the key principles of AI ethics?')
  .then(result => console.log(result.response))
  .catch(error => console.error('Error:', error));`}</code>
              </div>
            </div>
          </div>

          <div style={styles.exampleGroup}>
            <h3 style={styles.exampleTitle}>cURL Example</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`curl -X POST http://localhost:8080/api/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "How can AI systems ensure fairness in decision-making?",
    "mode": "practical",
    "use_cache": true
  }'`} />
              <div style={styles.codeBlock}>
                <code>{`curl -X POST http://localhost:8080/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How can AI systems ensure fairness in decision-making?",
    "mode": "practical",
    "use_cache": true
  }'`}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Aletheia Learning Examples</h2>
          
          <div style={styles.exampleGroup}>
            <h3 style={styles.exampleTitle}>Create Agent (Python)</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`import requests

def create_agent(name, constitution):
    url = "http://localhost:8080/api/aletheia/create_agent"
    payload = {
        "name": name,
        "initial_constitution": constitution
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Create an agent
constitution = [
    "Always prioritize human welfare and dignity",
    "Consider consequences for all stakeholders", 
    "Respect individual rights and autonomy",
    "Act with transparency and honesty"
]

agent = create_agent("Ethical Assistant v1", constitution)
print(f"Created agent: {agent['agent_id']}")`} />
              <div style={styles.codeBlock}>
                <code>{`import requests

def create_agent(name, constitution):
    url = "http://localhost:8080/api/aletheia/create_agent"
    payload = {
        "name": name,
        "initial_constitution": constitution
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Create an agent
constitution = [
    "Always prioritize human welfare and dignity",
    "Consider consequences for all stakeholders", 
    "Respect individual rights and autonomy",
    "Act with transparency and honesty"
]

agent = create_agent("Ethical Assistant v1", constitution)
print(f"Created agent: {agent['agent_id']}")`}</code>
              </div>
            </div>
          </div>

          <div style={styles.exampleGroup}>
            <h3 style={styles.exampleTitle}>Start Learning Cycle (JavaScript)</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`async function startLearningCycle(agentId, cycles = 1) {
  const response = await fetch('http://localhost:8080/api/aletheia/start_cycle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: agentId,
      cycles: cycles
    })
  });

  return await response.json();
}

// Usage
startLearningCycle('agent_123', 1)
  .then(result => console.log('Learning cycle started:', result))
  .catch(error => console.error('Error:', error));`} />
              <div style={styles.codeBlock}>
                <code>{`async function startLearningCycle(agentId, cycles = 1) {
  const response = await fetch('http://localhost:8080/api/aletheia/start_cycle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: agentId,
      cycles: cycles
    })
  });

  return await response.json();
}

// Usage
startLearningCycle('agent_123', 1)
  .then(result => console.log('Learning cycle started:', result))
  .catch(error => console.error('Error:', error));`}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>MAS Evaluation Examples</h2>
          
          <div style={styles.exampleGroup}>
            <h3 style={styles.exampleTitle}>Start Evaluation (Python)</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`import requests
import time

def start_mas_evaluation(model_path, agent_id):
    url = "http://localhost:8080/api/evaluate"
    payload = {
        "model_path": model_path,
        "agent_id": agent_id,
        "batch_size": 4,
        "max_tokens": 256,
        "limit": 50
    }
    
    response = requests.post(url, json=payload)
    return response.json()

def check_evaluation_status(task_id):
    url = f"http://localhost:8080/api/status/{task_id}"
    response = requests.get(url)
    return response.json()

# Start evaluation
task = start_mas_evaluation("google/gemma-2b-it", "agent_123")
task_id = task["task_id"]

# Poll for completion
while True:
    status = check_evaluation_status(task_id)
    print(f"Status: {status['status']}, Progress: {status.get('progress', 0)}%")
    
    if status["status"] == "completed":
        print(f"MAS Score: {status['mas_score']:.3f}")
        break
    elif status["status"] == "failed":
        print(f"Evaluation failed: {status.get('error')}")
        break
    
    time.sleep(2)`} />
              <div style={styles.codeBlock}>
                <code>{`import requests
import time

def start_mas_evaluation(model_path, agent_id):
    url = "http://localhost:8080/api/evaluate"
    payload = {
        "model_path": model_path,
        "agent_id": agent_id,
        "batch_size": 4,
        "max_tokens": 256,
        "limit": 50
    }
    
    response = requests.post(url, json=payload)
    return response.json()

def check_evaluation_status(task_id):
    url = f"http://localhost:8080/api/status/{task_id}"
    response = requests.get(url)
    return response.json()

# Start evaluation
task = start_mas_evaluation("google/gemma-2b-it", "agent_123")
task_id = task["task_id"]

# Poll for completion
while True:
    status = check_evaluation_status(task_id)
    print(f"Status: {status['status']}, Progress: {status.get('progress', 0)}%")
    
    if status["status"] == "completed":
        print(f"MAS Score: {status['mas_score']:.3f}")
        break
    elif status["status"] == "failed":
        print(f"Evaluation failed: {status.get('error')}")
        break
    
    time.sleep(2)`}</code>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Error Handling Patterns</h2>
          
          <div style={styles.exampleGroup}>
            <h3 style={styles.exampleTitle}>Robust Error Handling (Python)</h3>
            <div style={styles.codeContainer}>
              <CopyButton text={`import requests
from requests.exceptions import RequestException
import time

class AethosClient:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        
    def _make_request(self, method, endpoint, **kwargs):
        url = f"{self.base_url}{endpoint}"
        max_retries = 3
        backoff_factor = 1
        
        for attempt in range(max_retries):
            try:
                response = requests.request(method, url, **kwargs)
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:  # Rate limited
                    wait_time = backoff_factor * (2 ** attempt)
                    print(f"Rate limited. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception(f"HTTP {response.status_code}: {response.text}")
                    
            except RequestException as e:
                if attempt == max_retries - 1:
                    raise Exception(f"Request failed after {max_retries} attempts: {e}")
                time.sleep(backoff_factor * (2 ** attempt))
                
    def query_wisdom(self, query, mode="explore"):
        return self._make_request('POST', '/api/query', json={
            'query': query,
            'mode': mode,
            'use_cache': True
        })

# Usage
client = AethosClient()
try:
    result = client.query_wisdom("What is the trolley problem?")
    print(result["response"])
except Exception as e:
    print(f"Error: {e}")`} />
              <div style={styles.codeBlock}>
                <code>{`import requests
from requests.exceptions import RequestException
import time

class AethosClient:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        
    def _make_request(self, method, endpoint, **kwargs):
        url = f"{self.base_url}{endpoint}"
        max_retries = 3
        backoff_factor = 1
        
        for attempt in range(max_retries):
            try:
                response = requests.request(method, url, **kwargs)
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:  # Rate limited
                    wait_time = backoff_factor * (2 ** attempt)
                    print(f"Rate limited. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception(f"HTTP {response.status_code}: {response.text}")
                    
            except RequestException as e:
                if attempt == max_retries - 1:
                    raise Exception(f"Request failed after {max_retries} attempts: {e}")
                time.sleep(backoff_factor * (2 ** attempt))
                
    def query_wisdom(self, query, mode="explore"):
        return self._make_request('POST', '/api/query', json={
            'query': query,
            'mode': mode,
            'use_cache': True
        })

# Usage
client = AethosClient()
try:
    result = client.query_wisdom("What is the trolley problem?")
    print(result["response"])
except Exception as e:
    print(f"Error: {e}")`}</code>
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

export default APIExamples;