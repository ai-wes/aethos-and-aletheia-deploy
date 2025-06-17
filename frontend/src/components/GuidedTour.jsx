import React, { useState, useEffect } from 'react';
import GuidedTooltip from './GuidedTooltip';
import { Button } from './ui/button';
import { HelpCircle, X } from 'lucide-react';

const TOUR_STEPS = [
  {
    target: '.logo-section',
    title: "Welcome to Aethos & Aletheia",
    content: "This is a cutting-edge ethical AI learning system that combines wisdom-driven decision making with continuous learning loops. Aethos provides philosophical guidance while Aletheia enables constitutional reinforcement learning.",
    position: 'bottom'
  },
  {
    target: '.status-badge',
    title: "System Status",
    content: "This shows whether the backend server is connected. When online, all features are available. When offline, you'll need to start the backend server with 'python app.py'.",
    position: 'bottom'
  },
  {
    target: '.agent-selector',
    title: "Agent Management",
    content: "Select or create AI agents here. Each agent has its own ethical constitution and can be trained independently. Start by creating your first agent!",
    position: 'bottom'
  },
  {
    target: '.main-tabs',
    title: "Main Navigation",
    content: "Navigate between different sections: Dashboard for overview, Learning Loop for training, Wisdom Network for philosophical guidance, Constitution for ethical principles, and Playground for safety testing.",
    position: 'bottom'
  },
  {
    target: '.dashboard-analytics',
    title: "System Analytics",
    content: "Monitor your agents' performance with real-time metrics including critique counts, active agents, and cache performance.",
    position: 'right'
  },
  {
    target: '.quick-actions',
    title: "Quick Actions",
    content: "Use these shortcuts to quickly run simulations, explore wisdom, or access analysis tools without navigating through multiple tabs.",
    position: 'right'
  },
  {
    target: '.tutorial-sidebar',
    title: "Getting Started Guide",
    content: "Follow the 3-step process: Create an Agent, Run Learning Loop, and Test Scenarios. This sidebar provides helpful guidance for new users.",
    position: 'left'
  }
];

const GuidedTour = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM elements are rendered
      setTimeout(() => {
        setShowTour(true);
      }, 100);
    } else {
      setShowTour(false);
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShowTour(false);
    setCurrentStep(0);
    if (onComplete) onComplete();
  };

  const handleClose = () => {
    setShowTour(false);
    setCurrentStep(0);
    if (onClose) onClose();
  };

  if (!showTour || currentStep >= TOUR_STEPS.length) {
    return null;
  }

  const currentStepData = TOUR_STEPS[currentStep];
  const targetElement = document.querySelector(currentStepData.target);

  if (!targetElement) {
    // If target element not found, skip to next step
    setTimeout(() => {
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }, 100);
    return null;
  }

  return (
    <GuidedTooltip
      title={currentStepData.title}
      content={currentStepData.content}
      position={currentStepData.position}
      step={currentStep + 1}
      totalSteps={TOUR_STEPS.length}
      showGuide={true}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onClose={handleClose}
      onComplete={handleComplete}
    >
      <div
        style={{
          position: 'fixed',
          top: targetElement.getBoundingClientRect().top,
          left: targetElement.getBoundingClientRect().left,
          width: targetElement.getBoundingClientRect().width,
          height: targetElement.getBoundingClientRect().height,
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />
    </GuidedTooltip>
  );
};

export const TourLauncher = ({ onStart }) => {
  const [showLauncher, setShowLauncher] = useState(true);

  useEffect(() => {
    // Check if user has completed tour before
    const hasCompletedTour = localStorage.getItem('aethos-tour-completed');
    if (hasCompletedTour) {
      setShowLauncher(false);
    }
  }, []);

  const handleStartTour = () => {
    setShowLauncher(false);
    if (onStart) onStart();
  };

  const handleDismiss = () => {
    setShowLauncher(false);
    localStorage.setItem('aethos-tour-completed', 'true');
  };

  if (!showLauncher) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(26, 31, 37, 0.98) 100%)',
        border: '2px solid rgba(35, 217, 217, 0.4)',
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '300px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(35, 217, 217, 0.1)',
        backdropFilter: 'blur(12px)',
        color: '#ffffff'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <HelpCircle size={20} style={{ color: '#23d9d9' }} />
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#23d9d9'
          }}>
            Take a Tour?
          </h4>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#8f9aa6',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          <X size={16} />
        </button>
      </div>
      
      <p style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        color: '#e0e6eb',
        lineHeight: '1.5'
      }}>
        New to Aethos & Aletheia? Take a quick guided tour to learn about the key features and how to get started with ethical AI development.
      </p>
      
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <Button
          onClick={handleStartTour}
          style={{
            flex: 1,
            backgroundColor: '#23d9d9',
            color: '#000',
            border: 'none',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          Start Tour
        </Button>
        <Button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'transparent',
            color: '#8f9aa6',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px 16px',
            fontSize: '13px'
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
};

export default GuidedTour;