import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CitationTooltip = ({ citation, position, onClose }) => {
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (tooltipRef.current) {
      // Animate in
      gsap.fromTo(tooltipRef.current, 
        {
          opacity: 0,
          scale: 0.8,
          y: 10
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.2,
          ease: "back.out(1.7)"
        }
      );
    }
  }, []);

  const handleClose = () => {
    if (tooltipRef.current) {
      gsap.to(tooltipRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 10,
        duration: 0.15,
        ease: "power2.in",
        onComplete: onClose
      });
    }
  };

  return (
    <div
      ref={tooltipRef}
      className="citation-tooltip"
      style={{
        left: position.x - 125,
        top: position.y - 10,
        position: 'fixed',
        zIndex: 1000
      }}
    >
      <div className="tooltip-content">
        <div className="tooltip-header">
          <span className="author-name">{citation.author}</span>
          {citation.era && <span className="era">({citation.era})</span>}
        </div>
        <div className="source-title">{citation.source}</div>
        {citation.framework && (
          <div className="framework-tag">{citation.framework}</div>
        )}
        {citation.excerpt && (
          <div className="excerpt">
            "{citation.excerpt.substring(0, 120)}..."
          </div>
        )}
      </div>
      <button className="close-btn" onClick={handleClose}>×</button>
      
      <style jsx>{`
        .citation-tooltip {
          width: 250px;
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(35, 217, 217, 0.3);
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
          pointer-events: auto;
        }

        .tooltip-content {
          position: relative;
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
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

        .source-title {
          color: #23d9d9;
          font-size: 0.85rem;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .framework-tag {
          display: inline-block;
          background: rgba(35, 217, 217, 0.1);
          color: #23d9d9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-bottom: 8px;
        }

        .excerpt {
          color: #d1d5db;
          font-size: 0.8rem;
          line-height: 1.4;
          font-style: italic;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(75, 85, 99, 0.3);
        }

        .close-btn {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border: none;
          background: rgba(75, 85, 99, 0.8);
          color: #d1d5db;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(220, 38, 38, 0.8);
          color: #ffffff;
        }

        /* Tooltip arrow */
        .citation-tooltip::before {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(35, 217, 217, 0.3);
        }

        .citation-tooltip::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid rgba(17, 24, 39, 0.95);
        }
      `}</style>
    </div>
  );
};

export default CitationTooltip;