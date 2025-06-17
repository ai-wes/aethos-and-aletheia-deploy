import React from 'react';
import { Badge } from './ui/badge';
import './FlippableFrameworkCard.css';

const FlippableFrameworkCard = ({ 
  framework, 
  confidence = 0, 
  coreThesis = '', 
  author = '',
  era = '',
  onReadProof 
}) => {
  // Framework emoji mapping
  const getFrameworkEmoji = (framework) => {
    const emojiMap = {
      'Utilitarian': '⚖️',
      'Deontological': '📜', 
      'Virtue Ethics': '🏛️',
      'Buddhist Ethics': '☸️',
      'Stoic Ethics': '🗿',
      'Care Ethics': '💝',
      'Confucian Ethics': '🏮',
      'AI Safety': '🤖'
    };
    return emojiMap[framework] || '🧠';
  };

  // Color mapping for frameworks
  const getFrameworkColor = (framework) => {
    const colorMap = {
      'Utilitarian': '#f59e0b',
      'Deontological': '#dc2626',  
      'Virtue Ethics': '#059669',
      'Buddhist Ethics': '#7c3aed',
      'Stoic Ethics': '#6b7280',
      'Care Ethics': '#ec4899',
      'Confucian Ethics': '#3b82f6',
      'AI Safety': '#f97316'
    };
    return colorMap[framework] || '#6b7280';
  };

  const handleReadProof = (e) => {
    e.stopPropagation();
    if (onReadProof) {
      onReadProof(framework);
    }
  };

  return (
    <div className="framework-card">
      <div className="framework-card-inner">
        {/* Front Side */}
        <div className="framework-card-front">
          <div className="card-content">
            <div className="framework-emoji">
              {getFrameworkEmoji(framework)}
            </div>
            <h4 className="framework-name">
              {framework}
            </h4>
            <div className="confidence-badge">
              <Badge 
                variant="outline" 
                style={{ 
                  borderColor: getFrameworkColor(framework),
                  color: getFrameworkColor(framework)
                }}
              >
                {confidence}% confidence
              </Badge>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="framework-card-back">
          <div className="card-content">
            <div className="framework-meta">
              <span className="framework-author">{author}</span>
              <span className="framework-era">({era})</span>
            </div>
            <p className="core-thesis">
              "{coreThesis}"
            </p>
            <button 
              className="read-proof-btn"
              onClick={handleReadProof}
              style={{ borderColor: getFrameworkColor(framework) }}
            >
              Read proof ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlippableFrameworkCard;