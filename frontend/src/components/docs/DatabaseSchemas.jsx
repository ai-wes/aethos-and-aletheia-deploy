import React from 'react';
import { Database } from 'lucide-react';

const DatabaseSchemas = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Database style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Database Schemas</h1>
          <p style={styles.subtitle}>MongoDB collection schemas and data structures</p>
        </div>
      </div>
      
      <div style={styles.content}>

        <div style={styles.intro}>
          <p style={styles.text}>
            Aethos & Aletheia uses MongoDB Atlas for data storage. This page documents all collection 
            schemas, field types, and data relationships across the system.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>agents</h2>
          <p style={styles.text}>Stores AI agent definitions and their constitutional frameworks.</p>
          
          <div style={styles.schemaTable}>
            <div style={styles.schemaHeader}>
              <span style={styles.fieldCol}>Field</span>
              <span style={styles.typeCol}>Type</span>
              <span style={styles.descCol}>Description</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>_id</span>
              <span style={styles.typeCol}>ObjectId</span>
              <span style={styles.descCol}>Unique document identifier</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>agent_id</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Unique agent identifier (UUID)</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>name</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Human-readable agent name</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>version</span>
              <span style={styles.typeCol}>Integer</span>
              <span style={styles.descCol}>Agent version number</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>constitution</span>
              <span style={styles.typeCol}>Array[String]</span>
              <span style={styles.descCol}>List of constitutional principles</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>constitution_version</span>
              <span style={styles.typeCol}>Integer</span>
              <span style={styles.descCol}>Constitution version number</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>created_at</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Agent creation timestamp</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>updated_at</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Last update timestamp</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>performance_metrics</span>
              <span style={styles.typeCol}>Object</span>
              <span style={styles.descCol}>Learning performance statistics</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>scenarios</h2>
          <p style={styles.text}>Moral dilemma scenarios used for training and evaluation.</p>
          
          <div style={styles.schemaTable}>
            <div style={styles.schemaHeader}>
              <span style={styles.fieldCol}>Field</span>
              <span style={styles.typeCol}>Type</span>
              <span style={styles.descCol}>Description</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>_id</span>
              <span style={styles.typeCol}>ObjectId</span>
              <span style={styles.descCol}>Unique document identifier</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>scenario_description</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Detailed scenario text</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>category</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Scenario category (trolley_problem, privacy, etc.)</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>difficulty</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Difficulty level (easy, medium, hard)</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>expected_response</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Ideal response for evaluation</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>evaluation_criteria</span>
              <span style={styles.typeCol}>Array[Object]</span>
              <span style={styles.descCol}>Criteria for response evaluation</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>weight</span>
              <span style={styles.typeCol}>Number</span>
              <span style={styles.descCol}>Scenario importance weight (0.0-1.0)</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>constitution_version</span>
              <span style={styles.typeCol}>Integer</span>
              <span style={styles.descCol}>Associated constitution version</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>created_at</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Scenario creation timestamp</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>tags</span>
              <span style={styles.typeCol}>Array[String]</span>
              <span style={styles.descCol}>Scenario tags for categorization</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>reasoning_traces</h2>
          <p style={styles.text}>Detailed reasoning traces from wisdom oracle queries.</p>
          
          <div style={styles.schemaTable}>
            <div style={styles.schemaHeader}>
              <span style={styles.fieldCol}>Field</span>
              <span style={styles.typeCol}>Type</span>
              <span style={styles.descCol}>Description</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>_id</span>
              <span style={styles.typeCol}>ObjectId</span>
              <span style={styles.descCol}>Unique document identifier</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>trace_id</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Unique trace identifier</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>query</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Original wisdom query</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>mode</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Query mode (explore, practical, framework)</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>reasoning_steps</span>
              <span style={styles.typeCol}>Array[Object]</span>
              <span style={styles.descCol}>Step-by-step reasoning process</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>response</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Final wisdom response</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>confidence_score</span>
              <span style={styles.typeCol}>Number</span>
              <span style={styles.descCol}>Confidence in response (0.0-1.0)</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>processing_time_ms</span>
              <span style={styles.typeCol}>Number</span>
              <span style={styles.descCol}>Processing time in milliseconds</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>frameworks_used</span>
              <span style={styles.typeCol}>Array[String]</span>
              <span style={styles.descCol}>Ethical frameworks applied</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>sources</span>
              <span style={styles.typeCol}>Array[Object]</span>
              <span style={styles.descCol}>Knowledge sources referenced</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>timestamp</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Query timestamp</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>wisdom_cache</h2>
          <p style={styles.text}>Cached wisdom responses for performance optimization.</p>
          
          <div style={styles.schemaTable}>
            <div style={styles.schemaHeader}>
              <span style={styles.fieldCol}>Field</span>
              <span style={styles.typeCol}>Type</span>
              <span style={styles.descCol}>Description</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>_id</span>
              <span style={styles.typeCol}>ObjectId</span>
              <span style={styles.descCol}>Unique document identifier</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>cache_key</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Hash of query and parameters</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>query</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Original query text</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>response</span>
              <span style={styles.typeCol}>Object</span>
              <span style={styles.descCol}>Cached response data</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>hit_count</span>
              <span style={styles.typeCol}>Integer</span>
              <span style={styles.descCol}>Number of cache hits</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>created_at</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Cache entry creation time</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>last_accessed</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Last cache access time</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>expires_at</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Cache expiration time</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>learning_cycles</h2>
          <p style={styles.text}>Learning cycle execution records and results.</p>
          
          <div style={styles.schemaTable}>
            <div style={styles.schemaHeader}>
              <span style={styles.fieldCol}>Field</span>
              <span style={styles.typeCol}>Type</span>
              <span style={styles.descCol}>Description</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>_id</span>
              <span style={styles.typeCol}>ObjectId</span>
              <span style={styles.descCol}>Unique document identifier</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>agent_id</span>
              <span style={styles.typeCol}>String</span>
              <span style={styles.descCol}>Associated agent identifier</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>cycle_number</span>
              <span style={styles.typeCol}>Integer</span>
              <span style={styles.descCol}>Sequential cycle number</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>scenarios_processed</span>
              <span style={styles.typeCol}>Array[ObjectId]</span>
              <span style={styles.descCol}>Scenario IDs processed in cycle</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>performance_metrics</span>
              <span style={styles.typeCol}>Object</span>
              <span style={styles.descCol}>Cycle performance statistics</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>constitution_before</span>
              <span style={styles.typeCol}>Array[String]</span>
              <span style={styles.descCol}>Constitution before cycle</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>constitution_after</span>
              <span style={styles.typeCol}>Array[String]</span>
              <span style={styles.descCol}>Constitution after cycle</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>improvements</span>
              <span style={styles.typeCol}>Array[Object]</span>
              <span style={styles.descCol}>Identified improvements</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>started_at</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Cycle start time</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>completed_at</span>
              <span style={styles.typeCol}>DateTime</span>
              <span style={styles.descCol}>Cycle completion time</span>
            </div>
            <div style={styles.schemaRow}>
              <span style={styles.fieldCol}>duration_ms</span>
              <span style={styles.typeCol}>Number</span>
              <span style={styles.descCol}>Cycle duration in milliseconds</span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Index Strategy</h2>
          <p style={styles.text}>
            Key indexes for optimal query performance:
          </p>
          <div style={styles.indexGrid}>
            <div style={styles.indexItem}>
              <h4 style={styles.indexCollection}>agents</h4>
              <ul style={styles.indexList}>
                <li>agent_id (unique)</li>
                <li>created_at (desc)</li>
                <li>version (desc)</li>
              </ul>
            </div>
            <div style={styles.indexItem}>
              <h4 style={styles.indexCollection}>scenarios</h4>
              <ul style={styles.indexList}>
                <li>category + difficulty</li>
                <li>constitution_version</li>
                <li>weight (desc)</li>
              </ul>
            </div>
            <div style={styles.indexItem}>
              <h4 style={styles.indexCollection}>reasoning_traces</h4>
              <ul style={styles.indexList}>
                <li>trace_id (unique)</li>
                <li>timestamp (desc)</li>
                <li>query (text search)</li>
              </ul>
            </div>
            <div style={styles.indexItem}>
              <h4 style={styles.indexCollection}>wisdom_cache</h4>
              <ul style={styles.indexList}>
                <li>cache_key (unique)</li>
                <li>expires_at (TTL)</li>
                <li>last_accessed (desc)</li>
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
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '16px',
    overflow: 'auto',
    marginBottom: '20px',
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

export default DatabaseSchemas;