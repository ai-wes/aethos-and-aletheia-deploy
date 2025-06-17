import React from 'react';
import { Shield } from 'lucide-react';

const StressTestingAPI = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Shield style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Stress Testing API</h1>
          <p style={styles.subtitle}>Stress testing framework API reference</p>
        </div>
      </div>
      
      <div style={styles.content}>
        <div style={styles.intro}>
          <p style={styles.text}>
            The Stress Testing API validates moral principles under challenging scenarios and edge cases,
            ensuring robust ethical decision-making across diverse situations.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Stress Test Endpoint</h2>
          
          <div style={styles.endpoint}>
            <div style={styles.endpointHeader}>
              <span style={styles.method}>POST</span>
              <span style={styles.path}>/api/stress-test</span>
            </div>
            <p style={styles.endpointDescription}>Execute stress test for a principle</p>
            
            <h4 style={styles.paramTitle}>Request Body</h4>
            <div style={styles.codeBlock}>
              <code>{`{
  "principle": "Always prioritize human welfare and dignity"
}`}</code>
            </div>

            <h4 style={styles.paramTitle}>Response</h4>
            <div style={styles.codeBlock}>
              <code>{`{
  "test_id": "stress_123",
  "principle": "Always prioritize human welfare and dignity",
  "scenarios_tested": 15,
  "pass_rate": 0.87,
  "edge_cases_identified": [
    {
      "scenario": "Conflicting welfare priorities",
      "challenge": "Multiple stakeholder competing interests",
      "recommendation": "Implement weighted decision framework"
    }
  ],
  "stress_metrics": {
    "consistency_score": 0.89,
    "edge_case_resilience": 0.82,
    "principle_adherence": 0.91
  }
}`}</code>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Test Categories</h2>
          <div style={styles.categoryGrid}>
            <div style={styles.category}>
              <h4 style={styles.categoryTitle}>Conflicting Principles</h4>
              <p style={styles.categoryText}>Tests scenarios where multiple ethical principles conflict</p>
            </div>
            <div style={styles.category}>
              <h4 style={styles.categoryTitle}>Edge Cases</h4>
              <p style={styles.categoryText}>Extreme scenarios that challenge principle boundaries</p>
            </div>
            <div style={styles.category}>
              <h4 style={styles.categoryTitle}>Ambiguous Contexts</h4>
              <p style={styles.categoryText}>Scenarios with unclear or incomplete information</p>
            </div>
            <div style={styles.category}>
              <h4 style={styles.categoryTitle}>Scale Testing</h4>
              <p style={styles.categoryText}>Tests principle application across different scales</p>
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
  placeholder: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
  },
  placeholderTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '16px',
  },
  placeholderText: {
    fontSize: '16px',
    color: '#8f9aa6',
    maxWidth: '400px',
    margin: '0 auto',
  },
};

export default StressTestingAPI;