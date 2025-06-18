/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { X } from 'lucide-react';
import PrincipleEvaluationDisplay from './PrincipleEvaluationDisplay';

const TrainingReviewModal = ({ isOpen, onClose, trainingData, agentId, onNavigateToConstitution }) => {

  if (!isOpen || !trainingData) return null;

  const { 
    cyclesCompleted, 
    constitutionChanges, 
    totalDecisions, 
    finalVersion,
    learningHistory 
  } = trainingData;

  const hasChanges = constitutionChanges && constitutionChanges.length > 0;

  const styles = {
    overlay: css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `,
    modal: css`
      background-color: #1a1f25;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 700px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
    `,
    header: css`
      padding: 20px;
      border-bottom: 1px solid #333;
      position: relative;
    `,
    closeButton: css`
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 4px;
      
      &:hover {
        color: #fff;
      }
    `,
    title: css`
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    `,
    subtitle: css`
      font-size: 14px;
      color: #999;
      margin-top: 4px;
    `,
    content: css`
      padding: 20px;
    `,
    summaryRow: css`
      display: flex;
      justify-content: space-around;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #333;
    `,
    summaryItem: css`
      text-align: center;
    `,
    summaryValue: css`
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    `,
    summaryLabel: css`
      font-size: 13px;
      color: #999;
    `,
    changesSection: css`
      margin-bottom: 20px;
    `,
    sectionTitle: css`
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 16px;
    `,
    changeItem: css`
      background-color: #242a30;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 12px;
    `,
    changeHeader: css`
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 13px;
      color: #999;
    `,
    principleList: css`
      margin: 8px 0;
    `,
    principleItem: css`
      margin-bottom: 6px;
      font-size: 14px;
      line-height: 1.5;
      padding-left: 16px;
    `,
    addedPrinciple: css`
      color: #4ade80;
    `,
    removedPrinciple: css`
      color: #f87171;
      text-decoration: line-through;
      opacity: 0.7;
    `,
    keptPrinciple: css`
      color: #999;
    `,
    reasoning: css`
      font-size: 13px;
      color: #ccc;
      line-height: 1.5;
      margin-top: 12px;
      font-style: italic;
    `,
    noChangesMessage: css`
      text-align: center;
      color: #999;
      padding: 40px 20px;
      font-size: 14px;
    `,
    footer: css`
      padding: 20px;
      border-top: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `,
    footerText: css`
      font-size: 13px;
      color: #999;
    `,
    footerButtons: css`
      display: flex;
      gap: 12px;
    `,
    button: css`
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    `,
    primaryButton: css`
      background-color: #0ea5e9;
      color: #fff;
      border: none;
      
      &:hover {
        opacity: 0.9;
      }
    `,
    secondaryButton: css`
      background-color: transparent;
      color: #ccc;
      border: 1px solid #444;
      
      &:hover {
        border-color: #666;
      }
    `,
  };

  const handleNavigateToConstitution = () => {
    onClose();
    if (onNavigateToConstitution) {
      onNavigateToConstitution();
    }
  };

  const getChangeIcon = (change) => {
    if (change.rejected) return "❌";
    if (change.warnings && change.warnings.length > 0) return "⚠️";
    return "✓";
  };

  return (
    <div css={styles.overlay} onClick={onClose}>
      <div css={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div css={styles.header}>
          <button css={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
          <h2 css={styles.title}>Training Review</h2>
          <p css={styles.subtitle}>
            Learning cycle completed for {trainingData.agentName || `Agent ${agentId}`}
          </p>
        </div>

        <div css={styles.content}>
          <div css={styles.summaryRow}>
            <div css={styles.summaryItem}>
              <div css={styles.summaryValue}>{cyclesCompleted}</div>
              <div css={styles.summaryLabel}>Cycles</div>
            </div>
            <div css={styles.summaryItem}>
              <div css={styles.summaryValue}>{totalDecisions}</div>
              <div css={styles.summaryLabel}>Decisions</div>
            </div>
            <div css={styles.summaryItem}>
              <div css={styles.summaryValue}>v{finalVersion}</div>
              <div css={styles.summaryLabel}>Version</div>
            </div>
            <div css={styles.summaryItem}>
              <div css={styles.summaryValue}>{constitutionChanges?.length || 0}</div>
              <div css={styles.summaryLabel}>Updates</div>
            </div>
          </div>

          <div css={styles.changesSection}>
            <h3 css={styles.sectionTitle}>Constitutional Evolution</h3>

            {hasChanges ? (
              constitutionChanges.map((change, index) => (
                <div key={index} css={styles.changeItem}>
                  <div css={styles.changeHeader}>
                    <span>
                      {getChangeIcon(change)} v{change.fromVersion} → v{change.toVersion}
                    </span>
                    {change.scenario && (
                      <span>Scenario: {change.scenario}</span>
                    )}
                  </div>

                  {change.added && change.added.length > 0 && (
                    <div css={styles.principleList}>
                      {change.added.map((principle, i) => (
                        <div key={i} css={[styles.principleItem, styles.addedPrinciple]}>
                          + {principle}
                        </div>
                      ))}
                    </div>
                  )}

                  {change.removed && change.removed.length > 0 && (
                    <div css={styles.principleList}>
                      {change.removed.map((principle, i) => (
                        <div key={i} css={[styles.principleItem, styles.removedPrinciple]}>
                          - {principle}
                        </div>
                      ))}
                    </div>
                  )}

                  {change.kept && change.kept.length > 0 && (
                    <details style={{ marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer', color: '#999', fontSize: '13px' }}>
                        {change.kept.length} principles unchanged
                      </summary>
                      <div css={styles.principleList}>
                        {change.kept.map((principle, i) => (
                          <div key={i} css={[styles.principleItem, styles.keptPrinciple]}>
                            • {principle}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {change.reasoning && (
                    <div css={styles.reasoning}>
                      {change.reasoning}
                    </div>
                  )}

                  {change.evaluation && (
                    <PrincipleEvaluationDisplay evaluation={change.evaluation} />
                  )}
                </div>
              ))
            ) : (
              <div css={styles.noChangesMessage}>
                No constitutional changes were made during this training session.
                The agent's principles remained stable throughout all scenarios.
              </div>
            )}
          </div>
        </div>

        <div css={styles.footer}>
          <div css={styles.footerText}>
            Completed at {new Date().toLocaleTimeString()}
          </div>
          <div css={styles.footerButtons}>
            <button css={[styles.button, styles.secondaryButton]} onClick={onClose}>
              Close
            </button>
            <button css={[styles.button, styles.primaryButton]} onClick={handleNavigateToConstitution}>
              View Constitution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingReviewModal;