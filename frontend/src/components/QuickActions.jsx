import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const QuickActions = ({ 
  traceId, 
  scrollProgress = 0, 
  onFeedback, 
  onSaveToNotebook, 
  onExplainSimple 
}) => {
  const [visible, setVisible] = useState(false);
  const [savedCitations, setSavedCitations] = useState(new Set());

  useEffect(() => {
    // Show/hide based on scroll progress
    if (scrollProgress > 0.8) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [scrollProgress]);

  const handleFeedback = async (rating) => {
    try {
      if (onFeedback) {
        await onFeedback({ trace_id: traceId, rating });
      }
      
      // Visual feedback
      const btn = document.querySelector(`[data-rating="${rating}"]`);
      if (btn) {
        gsap.to(btn, {
          scale: 1.2,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleSaveToNotebook = (sourceId) => {
    try {
      // Save to IndexedDB
      const saved = { trace_id: traceId, source_id: sourceId, timestamp: Date.now() };
      
      // Mock IndexedDB save (implement actual IndexedDB logic)
      const existingSaved = JSON.parse(localStorage.getItem('saved_citations') || '[]');
      existingSaved.push(saved);
      localStorage.setItem('saved_citations', JSON.stringify(existingSaved));
      
      setSavedCitations(prev => new Set([...prev, sourceId]));
      
      if (onSaveToNotebook) {
        onSaveToNotebook(saved);
      }
    } catch (error) {
      console.error('Failed to save to notebook:', error);
    }
  };

  const handleExplainSimple = () => {
    if (onExplainSimple) {
      onExplainSimple({ difficulty: 'beginner' });
    }
  };

  return (
    <div className={`quick-actions ${visible ? 'visible' : ''}`}>
      {/* Helpful/Not Helpful - visible when 80%+ scrolled */}
      {visible && (
        <div className="feedback-actions">
          <span className="action-label">Was this helpful?</span>
          <button
            className="action-btn feedback-btn helpful"
            data-rating="up"
            onClick={() => handleFeedback('up')}
            title="Mark as helpful"
          >
            👍 Helpful
          </button>
          <button
            className="action-btn feedback-btn not-helpful"
            data-rating="down"
            onClick={() => handleFeedback('down')}
            title="Mark as not helpful"
          >
            👎 Not helpful
          </button>
        </div>
      )}

      {/* Save to Notebook - context-aware on citation hover */}
      <div className="save-action">
        <button
          className="action-btn save-btn"
          onClick={() => handleSaveToNotebook('current')}
          title="Save to notebook"
        >
          💾 Save to Notebook
        </button>
      </div>

      {/* Explain Simply - after TL;DR */}
      <div className="explain-action">
        <button
          className="action-btn explain-btn"
          onClick={handleExplainSimple}
          title="Get a simpler explanation"
        >
          🛰 Explain like I'm 14
        </button>
      </div>

      <style jsx>{`
        .quick-actions {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
          z-index: 100;
        }

        .quick-actions.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .feedback-actions,
        .save-action,
        .explain-action {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          backdrop-filter: blur(8px);
        }

        .action-label {
          color: #d1d5db;
          font-size: 0.85rem;
          margin-right: 8px;
        }

        .action-btn {
          background: transparent;
          border: 1px solid rgba(75, 85, 99, 0.5);
          color: #d1d5db;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .action-btn:hover {
          background: rgba(75, 85, 99, 0.2);
          border-color: rgba(75, 85, 99, 0.7);
          transform: translateY(-1px);
        }

        .feedback-btn.helpful:hover {
          border-color: rgba(34, 197, 94, 0.5);
          color: #22c55e;
        }

        .feedback-btn.not-helpful:hover {
          border-color: rgba(239, 68, 68, 0.5);
          color: #ef4444;
        }

        .save-btn:hover {
          border-color: rgba(59, 130, 246, 0.5);
          color: #3b82f6;
        }

        .explain-btn:hover {
          border-color: rgba(168, 85, 247, 0.5);
          color: #a855f7;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .quick-actions {
            bottom: 16px;
            right: 16px;
            left: 16px;
          }

          .feedback-actions,
          .save-action,
          .explain-action {
            flex-wrap: wrap;
            padding: 10px 12px;
          }

          .action-btn {
            font-size: 0.8rem;
            padding: 6px 10px;
          }
        }

        /* Animation for button interactions */
        .action-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* Saved state for save button */
        .save-btn.saved {
          border-color: rgba(34, 197, 94, 0.5);
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .save-btn.saved::before {
          content: '✓ ';
        }
      `}</style>
    </div>
  );
};

// Hook to track scroll progress
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(Math.min(progress, 1));
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return scrollProgress;
};

export default QuickActions;