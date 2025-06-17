import React from 'react';
import { useApi } from '../contexts/ApiContext';

export default function ConnectionStatus() {
  const { isConnected, isLoading, error } = useApi();

  if (isLoading) {
    return (
      <div style={styles.status}>
        <div style={{...styles.indicator, ...styles.loading}} />
        <span>Connecting to backend...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.status}>
        <div style={{...styles.indicator, ...styles.error}} />
        <span>Backend disconnected: {error}</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div style={styles.status}>
        <div style={{...styles.indicator, ...styles.connected}} />
        <span>Backend connected</span>
      </div>
    );
  }

  return null;
}

const styles = {
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(17, 21, 26, 0.9)',
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '0.75rem',
    color: '#cfd8e3',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  connected: {
    background: '#4ade80',
    boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)',
  },
  error: {
    background: '#ef4444',
    boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
  },
  loading: {
    background: '#fbbf24',
    animation: 'pulse 2s infinite',
  },
};