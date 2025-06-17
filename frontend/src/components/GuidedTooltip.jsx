import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

const GuidedTooltip = ({ 
  children, 
  title,
  content, 
  step = 1,
  totalSteps = 1,
  position = 'top',
  onNext,
  onPrevious,
  onClose,
  onComplete,
  showGuide = false,
  variant = 'guided'
}) => {
  const [isVisible, setIsVisible] = useState(showGuide);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    setIsVisible(showGuide);
  }, [showGuide]);

  const calculatePosition = useCallback((triggerRect) => {
    const offset = 15;
    const tooltipWidth = 350; // max width of guided tooltip
    const tooltipHeight = 200; // estimated height
    let x, y;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.top - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - offset;
        y = triggerRect.top + triggerRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2;
        break;
      default:
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.top - offset;
    }

    // Boundary checking to keep tooltip on screen
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Horizontal boundary checking
    if (position === 'top' || position === 'bottom') {
      if (x - tooltipWidth / 2 < 10) {
        x = tooltipWidth / 2 + 10;
      } else if (x + tooltipWidth / 2 > windowWidth - 10) {
        x = windowWidth - tooltipWidth / 2 - 10;
      }
    } else if (position === 'left') {
      if (x - tooltipWidth < 10) {
        x = triggerRect.right + offset; // Switch to right side
      }
    } else if (position === 'right') {
      if (x + tooltipWidth > windowWidth - 10) {
        x = triggerRect.left - offset; // Switch to left side
      }
    }

    // Vertical boundary checking
    if (position === 'left' || position === 'right') {
      if (y - tooltipHeight / 2 < 10) {
        y = tooltipHeight / 2 + 10;
      } else if (y + tooltipHeight / 2 > windowHeight - 10) {
        y = windowHeight - tooltipHeight / 2 - 10;
      }
    } else if (position === 'top') {
      if (y - tooltipHeight < 10) {
        y = triggerRect.bottom + offset; // Switch to bottom
      }
    } else if (position === 'bottom') {
      if (y + tooltipHeight > windowHeight - 10) {
        y = triggerRect.top - offset; // Switch to top
      }
    }

    return { x, y };
  }, [position]);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const pos = calculatePosition(rect);
      setTooltipPosition(pos);
    }
  }, [isVisible, position, calculatePosition]);

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      gsap.fromTo(tooltipRef.current, 
        {
          opacity: 0,
          scale: 0.8,
          y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
          x: position === 'left' ? 10 : position === 'right' ? -10 : 0
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          x: 0,
          duration: 0.3,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [isVisible, position]);

  const handleNext = () => {
    if (step < totalSteps && onNext) {
      onNext();
    } else if (step === totalSteps && onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (step > 1 && onPrevious) {
      onPrevious();
    }
  };

  const handleClose = () => {
    if (tooltipRef.current) {
      gsap.to(tooltipRef.current, {
        opacity: 0,
        scale: 0.8,
        y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
        x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setIsVisible(false);
          if (onClose) onClose();
        }
      });
    }
  };

  const getTooltipTransform = () => {
    switch (position) {
      case 'top':
        return 'translateX(-50%) translateY(-100%)';
      case 'bottom':
        return 'translateX(-50%)';
      case 'left':
        return 'translateX(-100%) translateY(-50%)';
      case 'right':
        return 'translateY(-50%)';
      default:
        return 'translateX(-50%) translateY(-100%)';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="guided-tooltip-trigger"
        style={{ 
          display: 'inline-block',
          position: 'relative',
          ...(isVisible && {
            zIndex: 1001,
            outline: '2px solid rgba(35, 217, 217, 0.6)',
            outlineOffset: '4px',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          })
        }}
      >
        {children}
      </div>

      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              pointerEvents: 'auto'
            }}
            onClick={handleClose}
          />

          <div
            ref={tooltipRef}
            className="guided-tooltip-portal"
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: getTooltipTransform(),
              zIndex: 1002,
              pointerEvents: 'auto'
            }}
          >
            <div 
              className="guided-tooltip-content"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(26, 31, 37, 0.98) 100%)',
                border: '2px solid rgba(35, 217, 217, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                minWidth: '280px',
                maxWidth: '350px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(35, 217, 217, 0.1)',
                backdropFilter: 'blur(12px)',
                color: '#ffffff'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  {title && (
                    <h4 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#23d9d9',
                      marginBottom: '4px'
                    }}>
                      {title}
                    </h4>
                  )}
                  <div style={{
                    fontSize: '12px',
                    color: '#8f9aa6',
                    fontWeight: '500'
                  }}>
                    Step {step} of {totalSteps}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8f9aa6',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = '#8f9aa6'}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#e0e6eb',
                marginBottom: '16px'
              }}>
                {content}
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(step / totalSteps) * 100}%`,
                  height: '100%',
                  backgroundColor: '#23d9d9',
                  transition: 'width 0.3s ease',
                  borderRadius: '2px'
                }} />
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button
                  onClick={handlePrevious}
                  disabled={step === 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: step === 1 ? '#4b5563' : '#8f9aa6',
                    cursor: step === 1 ? 'not-allowed' : 'pointer',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (step > 1) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = step === 1 ? '#4b5563' : '#8f9aa6';
                  }}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#23d9d9',
                    border: 'none',
                    color: '#000',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1fa8a8';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#23d9d9';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {step === totalSteps ? 'Complete' : 'Next'}
                  {step < totalSteps && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
            
            {/* Arrow */}
            <div
              className="guided-tooltip-arrow"
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                ...(() => {
                  switch (position) {
                    case 'top':
                      return {
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        borderRight: '2px solid rgba(35, 217, 217, 0.4)',
                        borderBottom: '2px solid rgba(35, 217, 217, 0.4)',
                        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(26, 31, 37, 0.98) 100%)'
                      };
                    case 'bottom':
                      return {
                        top: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        borderLeft: '2px solid rgba(35, 217, 217, 0.4)',
                        borderTop: '2px solid rgba(35, 217, 217, 0.4)',
                        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(26, 31, 37, 0.98) 100%)'
                      };
                    case 'left':
                      return {
                        right: '-5px',
                        top: '50%',
                        transform: 'translateY(-50%) rotate(45deg)',
                        borderTop: '2px solid rgba(35, 217, 217, 0.4)',
                        borderRight: '2px solid rgba(35, 217, 217, 0.4)',
                        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(26, 31, 37, 0.98) 100%)'
                      };
                    case 'right':
                      return {
                        left: '-5px',
                        top: '50%',
                        transform: 'translateY(-50%) rotate(45deg)',
                        borderBottom: '2px solid rgba(35, 217, 217, 0.4)',
                        borderLeft: '2px solid rgba(35, 217, 217, 0.4)',
                        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(26, 31, 37, 0.98) 100%)'
                      };
                    default:
                      return {};
                  }
                })()
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

export default GuidedTooltip;