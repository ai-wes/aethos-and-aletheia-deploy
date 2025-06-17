import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

const PrincipleEvaluationDisplay = ({ evaluation }) => {
  if (!evaluation) return null;

  const getRecommendationIcon = (recommendation) => {
    if (recommendation.includes('REJECT')) return <XCircle className="w-5 h-5 text-red-500" />;
    if (recommendation.includes('RECONSIDER')) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation.includes('REJECT')) return 'text-red-500';
    if (recommendation.includes('RECONSIDER')) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreChangeIcon = (change) => {
    if (change > 0.1) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -0.1) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const styles = {
    container: {
      backgroundColor: 'rgba(26, 31, 37, 0.8)',
      border: '1px solid rgba(35, 217, 217, 0.2)',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px',
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#e5e7eb',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    recommendation: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '6px',
      marginBottom: '16px',
    },
    scores: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginBottom: '16px',
    },
    scoreCard: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid rgba(75, 85, 99, 0.3)',
    },
    scoreLabel: {
      fontSize: '12px',
      color: '#9ca3af',
      marginBottom: '4px',
    },
    scoreValue: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '18px',
      fontWeight: '600',
    },
    scoreChange: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
    },
    warnings: {
      marginTop: '12px',
    },
    warning: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      borderRadius: '6px',
      marginBottom: '8px',
      color: '#fbbf24',
      fontSize: '14px',
    },
    overallScore: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '6px',
      marginBottom: '12px',
    },
    overallLabel: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#e5e7eb',
    },
    overallValue: {
      fontSize: '24px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
  };

  const scoreMetrics = [
    { key: 'specificity', label: 'Specificity' },
    { key: 'action_guidance', label: 'Action Guidance' },
    { key: 'complexity', label: 'Complexity' },
    { key: 'stakeholder_awareness', label: 'Stakeholder Awareness' },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        <AlertTriangle className="w-5 h-5 text-cyan-400" />
        Constitutional Change Evaluation
      </h3>

      <div style={styles.recommendation}>
        {getRecommendationIcon(evaluation.recommendation)}
        <span className={getRecommendationColor(evaluation.recommendation)}>
          {evaluation.recommendation}
        </span>
      </div>

      {evaluation.avg_old_score !== undefined && evaluation.avg_new_score !== undefined && (
        <div style={styles.overallScore}>
          <span style={styles.overallLabel}>Overall Constitution Quality</span>
          <span style={styles.overallValue}>
            <span style={{ color: '#9ca3af' }}>{formatPercentage(evaluation.avg_old_score)}</span>
            <span style={{ color: '#6b7280' }}>→</span>
            <span style={{ color: evaluation.avg_new_score >= evaluation.avg_old_score ? '#22c55e' : '#ef4444' }}>
              {formatPercentage(evaluation.avg_new_score)}
            </span>
            {getScoreChangeIcon(evaluation.avg_new_score - evaluation.avg_old_score)}
          </span>
        </div>
      )}

      {evaluation.warnings && evaluation.warnings.length > 0 && (
        <div style={styles.warnings}>
          {evaluation.warnings.map((warning, index) => (
            <div key={index} style={styles.warning}>
              <AlertTriangle className="w-4 h-4" />
              {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipleEvaluationDisplay;