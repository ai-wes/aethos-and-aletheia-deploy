import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Badge } from './ui/badge';

const SourceBrowser = ({ sources = [], onTraceMap }) => {
  const [expandedSources, setExpandedSources] = useState(new Set());

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSources(newExpanded);
  };

  // Framework colors mapping
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

  return (
    <aside className="source-browser">
      <div className="browser-header">
        <h4 className="browser-title">📚 Philosophical Sources</h4>
        <span className="source-count">{sources.length} consulted</span>
      </div>

      <div className="sources-list">
        {sources.map((source, index) => (
          <div key={index} className="source-item">
            {/* Relevance Score Bar */}
            <div className="relevance-bar-container">
              <div 
                className="relevance-bar"
                style={{
                  width: `${(source.relevance_score || 0) * 100}%`,
                  background: `linear-gradient(90deg, 
                    ${getFrameworkColor(source.framework)}40 0%, 
                    ${getFrameworkColor(source.framework)} 100%)`
                }}
              />
            </div>

            {/* Source Info */}
            <div className="source-info">
              <div className="source-header">
                <div className="source-meta">
                  <span className="author-name">{source.author}</span>
                  {source.era && <span className="era">({source.era})</span>}
                </div>
                <div className="source-actions">
                  <Badge 
                    variant="outline" 
                    className="framework-badge"
                    style={{ 
                      borderColor: getFrameworkColor(source.framework),
                      color: getFrameworkColor(source.framework)
                    }}
                  >
                    {source.framework}
                  </Badge>
                  <button
                    className="expand-btn"
                    onClick={() => toggleExpanded(index)}
                  >
                    {expandedSources.has(index) ? 
                      <ChevronUpIcon className="w-4 h-4" /> : 
                      <ChevronDownIcon className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              <div className="source-title">{source.source}</div>
              
              {source.relevance_score && (
                <div className="relevance-score">
                  Relevance: {(source.relevance_score * 100).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Expandable Excerpt */}
            {expandedSources.has(index) && source.excerpt && (
              <div className="source-excerpt">
                <div className="excerpt-content">
                  "{source.excerpt}"
                </div>
                
                {/* Trace Map Button */}
                {source.text_hash && onTraceMap && (
                  <button
                    className="trace-btn"
                    onClick={() => onTraceMap(source)}
                    style={{ borderColor: getFrameworkColor(source.framework) }}
                  >
                    Trace Path ↗
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .source-browser {
          position: sticky;
          top: 120px;
          height: calc(100vh - 140px);
          overflow-y: auto;
          padding: 20px;
          background: rgba(17, 24, 39, 0.8);
          border-radius: 12px;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .browser-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
        }

        .browser-title {
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .source-count {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .source-item {
          position: relative;
          background: rgba(31, 41, 55, 0.6);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid rgba(75, 85, 99, 0.2);
          transition: all 0.2s ease;
        }

        .source-item:hover {
          border-color: rgba(35, 217, 217, 0.3);
          background: rgba(31, 41, 55, 0.8);
        }

        .relevance-bar-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(75, 85, 99, 0.3);
          border-radius: 8px 8px 0 0;
          overflow: hidden;
        }

        .relevance-bar {
          height: 100%;
          transition: width 0.8s ease;
        }

        .source-info {
          margin-top: 4px;
        }

        .source-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .source-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .author-name {
          font-weight: 600;
          color: #ffffff;
          font-size: 0.9rem;
        }

        .era {
          color: #9ca3af;
          font-size: 0.8rem;
          font-style: italic;
        }

        .source-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .framework-badge {
          font-size: 0.75rem;
          padding: 2px 6px;
        }

        .expand-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .expand-btn:hover {
          background: rgba(75, 85, 99, 0.3);
          color: #d1d5db;
        }

        .source-title {
          color: #23d9d9;
          font-size: 0.85rem;
          margin-bottom: 8px;
          font-weight: 500;
          line-height: 1.3;
        }

        .relevance-score {
          color: #ffc34d;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .source-excerpt {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(75, 85, 99, 0.3);
        }

        .excerpt-content {
          color: #d1d5db;
          font-size: 0.85rem;
          line-height: 1.4;
          font-style: italic;
          margin-bottom: 12px;
        }

        .trace-btn {
          background: transparent;
          border: 1px solid #6b7280;
          color: #d1d5db;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .trace-btn:hover {
          background: rgba(75, 85, 99, 0.2);
          transform: translateY(-1px);
        }

        /* Custom scrollbar */
        .source-browser::-webkit-scrollbar {
          width: 6px;
        }

        .source-browser::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
        }

        .source-browser::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 3px;
        }

        .source-browser::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
      `}</style>
    </aside>
  );
};

export default SourceBrowser;