import React, { useState, useRef, useEffect } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import FlippableFrameworkCard from './FlippableFrameworkCard';
import StoryBlocks from './StoryBlocks';
import { gsap } from 'gsap';

const AccordionStepper = ({ 
  frameworks = [], 
  keyInsights = [], 
  fullAnalysis = '',
  onFrameworkReadProof 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);

  // Auto-collapse previous steps when opening new one
  const handleStepChange = (stepIndex) => {
    if (stepIndex !== activeStep) {
      setActiveStep(stepIndex);
    }
  };

  // Smooth height transitions
  useEffect(() => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        duration: 0.3,
        ease: "power2.inOut"
      });
    }
  }, [activeStep]);

  const steps = [
    {
      id: 0,
      title: 'Framework Analysis',
      icon: '🏛️',
      content: (
        <div id="perspectives" className="framework-cards-grid">
          {frameworks.map((framework, index) => (
            <FlippableFrameworkCard
              key={index}
              framework={framework.framework}
              confidence={Math.round((framework.core_thesis?.length || 50) / 5)} // Mock confidence
              coreThesis={framework.core_thesis}
              author={framework.author}
              era={framework.era}
              onReadProof={onFrameworkReadProof}
            />
          ))}
        </div>
      )
    },
    {
      id: 1,
      title: 'Key Insights',
      icon: '⚡',
      content: (
        <div id="key-points" className="key-insights-grid">
          {keyInsights.map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-bullet">⚡</div>
              <p className="insight-text">{insight}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 2,
      title: 'Complete Analysis',
      icon: '📜',
      content: (
        <div id="analysis">
          <StoryBlocks content={fullAnalysis} />
        </div>
      )
    }
  ];

  return (
    <div ref={containerRef} className="accordion-stepper">
      {steps.map((step, index) => (
        <Disclosure 
          key={step.id}
          defaultOpen={index === 0}
        >
          {({ open }) => {
            // Auto-manage active step
            if (open && activeStep !== index) {
              setTimeout(() => setActiveStep(index), 0);
            }

            return (
              <div className={`stepper-item ${open ? 'active' : ''}`}>
                <Disclosure.Button 
                  className="stepper-button"
                  onClick={() => handleStepChange(index)}
                >
                  <div className="stepper-header">
                    <div className="stepper-icon">
                      {step.icon}
                    </div>
                    <div className="stepper-info">
                      <h3 className="stepper-title">{step.title}</h3>
                      <p className="stepper-subtitle">
                        {index === 0 && `${frameworks.length} frameworks`}
                        {index === 1 && `${keyInsights.length} insights`}
                        {index === 2 && 'Full detailed analysis'}
                      </p>
                    </div>
                  </div>
                  <ChevronDownIcon 
                    className={`stepper-chevron ${open ? 'rotate-180' : ''}`} 
                  />
                </Disclosure.Button>

                <Disclosure.Panel className="stepper-content">
                  <div className="stepper-content-inner">
                    {step.content}
                  </div>
                </Disclosure.Panel>
              </div>
            );
          }}
        </Disclosure>
      ))}

      <style jsx>{`
        .accordion-stepper {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin: 24px 0;
        }

        .stepper-item {
          background: rgba(31, 41, 55, 0.6);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .stepper-item.active {
          border-color: rgba(35, 217, 217, 0.4);
          box-shadow: 0 0 20px rgba(35, 217, 217, 0.1);
        }

        .stepper-button {
          width: 100%;
          padding: 20px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background-color 0.2s ease;
        }

        .stepper-button:hover {
          background: rgba(55, 65, 81, 0.3);
        }

        .stepper-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stepper-icon {
          font-size: 1.5rem;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(35, 217, 217, 0.1);
          border-radius: 50%;
        }

        .stepper-info {
          text-align: left;
        }

        .stepper-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 4px 0;
        }

        .stepper-subtitle {
          font-size: 0.9rem;
          color: #9ca3af;
          margin: 0;
        }

        .stepper-chevron {
          width: 20px;
          height: 20px;
          color: #6b7280;
          transition: transform 0.3s ease;
        }

        .stepper-chevron.rotate-180 {
          transform: rotate(180deg);
        }

        .stepper-content {
          border-top: 1px solid rgba(75, 85, 99, 0.2);
        }

        .stepper-content-inner {
          padding: 24px;
        }

        .key-insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .insight-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(17, 24, 39, 0.4);
          border-radius: 8px;
          border-left: 3px solid #23d9d9;
        }

        .insight-bullet {
          color: #23d9d9;
          font-size: 1.2rem;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .insight-text {
          color: #e5e7eb;
          margin: 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default AccordionStepper;