import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDownIcon, ThumbsUpIcon, ThumbsDownIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ReasonChain = ({ analysisData, onFeedback }) => {
  const containerRef = useRef();
  const accordionRefs = useRef([]);

  const sections = [
    {
      title: "Scenario Analysis",
      content:
        analysisData?.scenario_analysis || "No scenario analysis available",
      icon: "🎯"
    },
    {
      title: "Framework Evaluation",
      content:
        analysisData?.framework_evaluation ||
        "No framework evaluation available",
      icon: "⚖️"
    },
    {
      title: "Outcome Forecast",
      content:
        analysisData?.outcome_forecast || "No outcome forecast available",
      icon: "🔮"
    },
    {
      title: "Final Verdict",
      content: analysisData?.tldr || "No final verdict available",
      icon: "⚡",
      isFinal: true
    }
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Setup ScrollTrigger animations for each panel
    accordionRefs.current.forEach((panel, index) => {
      if (!panel) return;

      gsap.fromTo(
        panel,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [analysisData]);

  const handleFeedbackClick = (rating) => {
    if (onFeedback) {
      onFeedback({
        trace_id: analysisData?.trace_id,
        rating: rating,
        timestamp: new Date().toISOString()
      });
    }
  };

  const parseContent = (content) => {
    if (!content) return [];

    // Split by <h3> sections or by double newlines
    const sections = content.split(/\n\n|\n(?=##|\*\*)/);
    return sections.filter((section) => section.trim());
  };

  return (
    <div ref={containerRef} className="space-y-4 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Reasoning Chain</h2>
        <p className="text-gray-400">Step-by-step ethical analysis breakdown</p>
      </div>

      {sections.map((section, index) => (
        <div
          key={section.title}
          ref={(el) => (accordionRefs.current[index] = el)}
          className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{section.icon}</span>
              <h3 className="text-lg font-semibold text-white">
                {section.title}
              </h3>
              <div className="flex-1" />
              {section.isFinal && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFeedbackClick("up")}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    title="Approve this analysis"
                  >
                    <ThumbsUpIcon className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleFeedbackClick("down")}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    title="Disapprove this analysis"
                  >
                    <ThumbsDownIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="prose prose-invert max-w-none">
              {parseContent(section.content).map((paragraph, pIndex) => (
                <div key={pIndex} className="mb-4">
                  {paragraph.startsWith("**") || paragraph.startsWith("##") ? (
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">
                      {paragraph.replace(/[\*#]/g, "").trim()}
                    </h4>
                  ) : (
                    <p className="text-gray-300 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {section.isFinal && analysisData?.key_points && (
              <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Key Takeaways
                </h4>
                <ul className="space-y-2">
                  {analysisData.key_points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start space-x-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span className="text-sm text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReasonChain;
