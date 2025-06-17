import React, { useState, useRef, useEffect } from 'react';
import { X, Check, User } from 'lucide-react';

const AgentNameModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "Create New Agent"
}) => {
  const [agentName, setAgentName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef();

  // Auto-focus input when modal opens
  useEffect(() => {
    if (inputRef.current && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAgentName('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmedName = agentName.trim();
    
    if (!trimmedName) {
      setError('Please enter a name for your agent');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('Agent name must be at least 2 characters long');
      return;
    }
    
    if (trimmedName.length > 50) {
      setError('Agent name must be less than 50 characters');
      return;
    }
    
    onSubmit(trimmedName);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && agentName.trim()) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
    },
    modal: {
      width: '100%',
      maxWidth: '448px',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      border: '1px solid rgba(55, 65, 81, 1)',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid rgba(55, 65, 81, 0.5)',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    iconWrapper: {
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      width: '20px',
      height: '20px',
      color: '#06b6d4',
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#ffffff',
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      padding: '8px',
      cursor: 'pointer',
      color: '#9ca3af',
      borderRadius: '6px',
      transition: 'all 0.2s',
    },
    closeIcon: {
      width: '20px',
      height: '20px',
    },
    content: {
      padding: '24px',
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#d1d5db',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'rgba(31, 41, 55, 0.5)',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    errorText: {
      marginTop: '8px',
      fontSize: '14px',
      color: '#ef4444',
    },
    charCount: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#6b7280',
    },
    infoBox: {
      backgroundColor: 'rgba(31, 41, 55, 0.5)',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid rgba(55, 65, 81, 1)',
      marginTop: '16px',
    },
    infoText: {
      fontSize: '14px',
      color: '#d1d5db',
      marginBottom: '8px',
    },
    principlesList: {
      margin: '0',
      paddingLeft: '20px',
      color: '#9ca3af',
      fontSize: '12px',
      lineHeight: '1.5',
    },
    principleItem: {
      marginBottom: '4px',
    },
    footer: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '1px solid rgba(55, 65, 81, 0.5)',
    },
    button: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: 'none',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      color: '#d1d5db',
    },
    submitButton: {
      backgroundColor: '#06b6d4',
      color: '#000000',
    },
    submitButtonDisabled: {
      backgroundColor: '#06b6d4',
      color: '#000000',
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    buttonIcon: {
      width: '16px',
      height: '16px',
    },
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <div style={styles.iconWrapper}>
                <User style={styles.icon} />
              </div>
              <h2 style={styles.title}>{title}</h2>
            </div>
            <button
              style={styles.closeButton}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.2)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <X style={styles.closeIcon} />
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.formGroup}>
            <label htmlFor="agent-name" style={styles.label}>
              Agent Name
            </label>
            <input
              ref={inputRef}
              id="agent-name"
              type="text"
              value={agentName}
              onChange={(e) => {
                setAgentName(e.target.value);
                setError(''); // Clear error when user types
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter a name for your agent"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#06b6d4';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)';
              }}
              maxLength={50}
            />
            {error && (
              <p style={styles.errorText}>{error}</p>
            )}
            <p style={styles.charCount}>
              {agentName.length}/50 characters
            </p>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              Your agent will be initialized with default ethical principles:
            </p>
            <ul style={styles.principlesList}>
              <li style={styles.principleItem}>Always prioritize human welfare and dignity</li>
              <li style={styles.principleItem}>Consider consequences on all stakeholders</li>
              <li style={styles.principleItem}>Respect individual rights and autonomy</li>
              <li style={styles.principleItem}>Act with transparency and honesty</li>
              <li style={styles.principleItem}>Minimize harm while maximizing benefit</li>
            </ul>
          </div>

          <div style={styles.footer}>
            <button
              style={{...styles.button, ...styles.cancelButton}}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.8)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.5)';
                e.currentTarget.style.color = '#d1d5db';
              }}
            >
              Cancel
            </button>
            
            <button
              style={{
                ...styles.button,
                ...(agentName.trim() ? styles.submitButton : styles.submitButtonDisabled)
              }}
              onClick={handleSubmit}
              disabled={!agentName.trim()}
              onMouseEnter={(e) => {
                if (agentName.trim()) {
                  e.currentTarget.style.backgroundColor = '#0891b2';
                }
              }}
              onMouseLeave={(e) => {
                if (agentName.trim()) {
                  e.currentTarget.style.backgroundColor = '#06b6d4';
                }
              }}
            >
              <Check style={styles.buttonIcon} />
              Create Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentNameModal;