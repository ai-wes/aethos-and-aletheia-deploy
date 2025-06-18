// Export utility functions for different data types and formats

/**
 * Downloads data as a JSON file
 */
export const downloadJSON = (data, filename) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads data as a CSV file
 */
export const downloadCSV = (data, filename) => {
  const csvString = arrayToCSV(data);
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads data as a text file
 */
export const downloadText = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Converts array of objects to CSV string
 */
const arrayToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get all unique keys from all objects
  const keys = [...new Set(data.flatMap(obj => Object.keys(obj)))];
  
  // Create header row
  const header = keys.join(',');
  
  // Create data rows
  const rows = data.map(obj => 
    keys.map(key => {
      const value = obj[key];
      // Handle complex values
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Handle strings with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [header, ...rows].join('\n');
};

/**
 * Export stress test results in multiple formats
 */
export const exportStressTestResults = (result, format = 'json') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `stress-test-${timestamp}`;
  
  switch (format) {
    case 'json':
      downloadJSON(result, filename);
      break;
    case 'csv':
      // Convert to flat structure for CSV
      const csvData = [];
      
      // Basic info
      csvData.push({
        type: 'principle',
        content: result.principle,
        risk_score: result.risk_score
      });
      
      // Critical vulnerabilities
      result.critical_vulnerabilities?.forEach((vuln, index) => {
        csvData.push({
          type: 'critical_vulnerability',
          index: index + 1,
          content: typeof vuln === 'string' ? vuln : vuln.description || JSON.stringify(vuln)
        });
      });
      
      // Loopholes/Failure modes
      result.failure_modes?.forEach((mode, index) => {
        csvData.push({
          type: 'loophole',
          index: index + 1,
          title: mode.title,
          description: mode.description,
          example: mode.example,
          severity: mode.severity
        });
      });
      
      // Mitigations
      result.mitigations?.forEach((mitigation, index) => {
        csvData.push({
          type: 'mitigation',
          index: index + 1,
          content: typeof mitigation === 'string' ? mitigation : mitigation.strategy || JSON.stringify(mitigation)
        });
      });
      
      downloadCSV(csvData, filename);
      break;
    case 'text':
      const textContent = formatStressTestAsText(result);
      downloadText(textContent, filename);
      break;
    default:
      downloadJSON(result, filename);
  }
};

/**
 * Export agent constitution in multiple formats
 */
export const exportConstitution = (agent, format = 'json') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const agentName = agent.name || `agent-${agent.agent_id}`;
  const filename = `constitution-${agentName}-${timestamp}`;
  
  switch (format) {
    case 'json':
      downloadJSON(agent, filename);
      break;
    case 'csv':
      const csvData = agent.constitution?.map((principle, index) => ({
        index: index + 1,
        principle: principle,
        agent_id: agent.agent_id,
        agent_name: agent.name,
        version: agent.version,
        created_at: agent.created_at
      })) || [];
      downloadCSV(csvData, filename);
      break;
    case 'text':
      const textContent = formatConstitutionAsText(agent);
      downloadText(textContent, filename);
      break;
    default:
      downloadJSON(agent, filename);
  }
};

/**
 * Export wisdom oracle results in multiple formats
 */
export const exportWisdomResults = (result, format = 'json') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `wisdom-query-${timestamp}`;
  
  switch (format) {
    case 'json':
      downloadJSON(result, filename);
      break;
    case 'csv':
      const csvData = [];
      
      // Query info
      csvData.push({
        type: 'query',
        content: result.query || result.question,
        timestamp: result.timestamp
      });
      
      // Response
      csvData.push({
        type: 'response',
        content: result.response || result.answer
      });
      
      // Sources
      result.sources?.forEach((source, index) => {
        csvData.push({
          type: 'source',
          index: index + 1,
          author: source.author,
          framework: source.framework,
          excerpt: source.excerpt,
          relevance_score: source.relevance_score
        });
      });
      
      downloadCSV(csvData, filename);
      break;
    case 'text':
      const textContent = formatWisdomResultsAsText(result);
      downloadText(textContent, filename);
      break;
    default:
      downloadJSON(result, filename);
  }
};

/**
 * Format stress test results as readable text
 */
const formatStressTestAsText = (result) => {
  let text = `STRESS TEST RESULTS\n`;
  text += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  text += `PRINCIPLE TESTED:\n"${result.principle}"\n\n`;
  
  text += `RISK SCORE: ${result.risk_score}/10\n\n`;
  
  if (result.critical_vulnerabilities?.length > 0) {
    text += `CRITICAL VULNERABILITIES:\n`;
    result.critical_vulnerabilities.forEach((vuln, index) => {
      text += `${index + 1}. ${typeof vuln === 'string' ? vuln : vuln.description || JSON.stringify(vuln)}\n`;
    });
    text += `\n`;
  }
  
  if (result.failure_modes?.length > 0) {
    text += `LOOPHOLES:\n`;
    result.failure_modes.forEach((mode, index) => {
      text += `${index + 1}. ${mode.title || `Loophole ${index + 1}`}\n`;
      text += `   Description: ${mode.description}\n`;
      if (mode.example) text += `   Example: ${mode.example}\n`;
      if (mode.severity) text += `   Severity: ${mode.severity}\n`;
      text += `\n`;
    });
  }
  
  if (result.mitigations?.length > 0) {
    text += `MITIGATIONS:\n`;
    result.mitigations.forEach((mitigation, index) => {
      text += `${index + 1}. ${typeof mitigation === 'string' ? mitigation : mitigation.strategy || JSON.stringify(mitigation)}\n`;
    });
    text += `\n`;
  }
  
  if (result.revised_principle_suggestion) {
    text += `REVISED PRINCIPLE:\n${result.revised_principle_suggestion}\n\n`;
  }
  
  if (result.rationale) {
    text += `RATIONALE:\n${result.rationale}\n\n`;
  }
  
  return text;
};

/**
 * Format constitution as readable text
 */
const formatConstitutionAsText = (agent) => {
  let text = `AGENT CONSTITUTION\n`;
  text += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  text += `Agent ID: ${agent.agent_id}\n`;
  text += `Agent Name: ${agent.name || 'Unnamed Agent'}\n`;
  text += `Version: ${agent.version}\n`;
  text += `Created: ${agent.created_at}\n\n`;
  
  text += `CONSTITUTIONAL PRINCIPLES:\n`;
  agent.constitution?.forEach((principle, index) => {
    text += `${index + 1}. ${principle}\n`;
  });
  
  return text;
};

/**
 * Format wisdom results as readable text
 */
const formatWisdomResultsAsText = (result) => {
  let text = `WISDOM ORACLE QUERY RESULTS\n`;
  text += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  text += `QUERY:\n${result.query || result.question}\n\n`;
  
  text += `RESPONSE:\n${result.response || result.answer}\n\n`;
  
  if (result.sources?.length > 0) {
    text += `SOURCES:\n`;
    result.sources.forEach((source, index) => {
      text += `${index + 1}. ${source.author} - ${source.framework}\n`;
      text += `   Relevance: ${Math.round(source.relevance_score * 100)}%\n`;
      if (source.excerpt) {
        text += `   Excerpt: ${source.excerpt}\n`;
      }
      text += `\n`;
    });
  }
  
  return text;
};

/**
 * Get current timestamp for filenames
 */
export const getTimestamp = () => {
  return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
};