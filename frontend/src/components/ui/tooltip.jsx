import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  delay = 500,
  className = '',
  disabled = false,
  variant = 'default'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && 
          triggerRef.current && 
          !triggerRef.current.contains(event.target) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target)) {
        hideTooltip();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible) {
        hideTooltip();
      }
    };

    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible]);

  const calculatePosition = (triggerRect) => {
    const offset = 10;
    const tooltipWidth = 250; // estimated tooltip width
    const tooltipHeight = 60; // estimated tooltip height
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
      if (x - tooltipWidth / 2 < 0) {
        x = tooltipWidth / 2 + 10;
      } else if (x + tooltipWidth / 2 > windowWidth) {
        x = windowWidth - tooltipWidth / 2 - 10;
      }
    } else if (position === 'left') {
      if (x - tooltipWidth < 0) {
        x = triggerRect.right + offset; // Switch to right side
      }
    } else if (position === 'right') {
      if (x + tooltipWidth > windowWidth) {
        x = triggerRect.left - offset; // Switch to left side
      }
    }

    // Vertical boundary checking
    if (position === 'left' || position === 'right') {
      if (y - tooltipHeight / 2 < 0) {
        y = tooltipHeight / 2 + 10;
      } else if (y + tooltipHeight / 2 > windowHeight) {
        y = windowHeight - tooltipHeight / 2 - 10;
      }
    } else if (position === 'top') {
      if (y - tooltipHeight < 0) {
        y = triggerRect.bottom + offset; // Switch to bottom
      }
    } else if (position === 'bottom') {
      if (y + tooltipHeight > windowHeight) {
        y = triggerRect.top - offset; // Switch to top
      }
    }

    return { x, y };
  };

  const showTooltip = () => {
    if (disabled || !content) return;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const pos = calculatePosition(rect);
        setTooltipPosition(pos);
        setIsVisible(true);
      }
    }, delay);
  };

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
          duration: 0.2,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [isVisible, position]);

  const getVariantStyles = () => {
    const variants = {
      default: {
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(35, 217, 217, 0.3)',
        color: '#ffffff'
      },
      info: {
        background: 'rgba(59, 130, 246, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.5)',
        color: '#ffffff'
      },
      warning: {
        background: 'rgba(245, 158, 11, 0.95)',
        border: '1px solid rgba(245, 158, 11, 0.5)',
        color: '#1f2937'
      },
      success: {
        background: 'rgba(34, 197, 94, 0.95)',
        border: '1px solid rgba(34, 197, 94, 0.5)',
        color: '#ffffff'
      }
    };
    return variants[variant] || variants.default;
  };

  const getArrowStyles = () => {
    const variantColors = {
      default: 'rgba(35, 217, 217, 0.3)',
      info: 'rgba(59, 130, 246, 0.5)',
      warning: 'rgba(245, 158, 11, 0.5)',
      success: 'rgba(34, 197, 94, 0.5)'
    };
    return variantColors[variant] || variantColors.default;
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
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`tooltip-trigger ${className}`}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>

      {isVisible && content && (
        <div
          ref={tooltipRef}
          className="tooltip-portal"
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: getTooltipTransform(),
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div 
            className="tooltip-content"
            style={{
              ...getVariantStyles(),
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '250px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              wordWrap: 'break-word',
              lineHeight: '1.4'
            }}
          >
            {content}
          </div>
          
          {/* Arrow */}
          <div
            className="tooltip-arrow"
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              ...(() => {
                const arrowColor = getArrowStyles();
                switch (position) {
                  case 'top':
                    return {
                      bottom: '-3px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      borderRight: `1px solid ${arrowColor}`,
                      borderBottom: `1px solid ${arrowColor}`,
                      background: getVariantStyles().background
                    };
                  case 'bottom':
                    return {
                      top: '-3px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      borderLeft: `1px solid ${arrowColor}`,
                      borderTop: `1px solid ${arrowColor}`,
                      background: getVariantStyles().background
                    };
                  case 'left':
                    return {
                      right: '-3px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(45deg)',
                      borderTop: `1px solid ${arrowColor}`,
                      borderRight: `1px solid ${arrowColor}`,
                      background: getVariantStyles().background
                    };
                  case 'right':
                    return {
                      left: '-3px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(45deg)',
                      borderBottom: `1px solid ${arrowColor}`,
                      borderLeft: `1px solid ${arrowColor}`,
                      background: getVariantStyles().background
                    };
                  default:
                    return {};
                }
              })()
            }}
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;