import React from 'react';
import { Layers } from 'lucide-react';

const SystemArchitecture = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Layers style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>System Architecture</h1>
          <p style={styles.subtitle}>Technical architecture and component diagrams</p>
        </div>
      </div>
      
      <div style={styles.content}>
        <div style={styles.placeholder}>
          <h2 style={styles.placeholderTitle}>Coming Soon</h2>
          <p style={styles.placeholderText}>
            This documentation section is currently under development.
            Check back soon for comprehensive system architecture documentation.
          </p>
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

export default SystemArchitecture;