import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PinnedVerdict = ({ tldr, points = [], score = 0 }) => {
  const verdictRef = useRef(null);

  useEffect(() => {
    if (!verdictRef.current) return;

    // Fade in and slide up animation
    gsap.fromTo(verdictRef.current, 
      {
        opacity: 0,
        y: 8
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }
    );

    // Pin while scrolling
    ScrollTrigger.create({
      trigger: verdictRef.current,
      start: "top 80px",
      end: "bottom top",
      pin: true,
      pinSpacing: false
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const getScoreColor = (score) => {
    if (score <= 33) return '#c9344a'; // red
    if (score <= 66) return '#e1a10d'; // amber
    return '#24c4b6'; // teal
  };

  const getScoreGradient = (score) => {
    const color = getScoreColor(score);
    return `linear-gradient(90deg, ${color} ${score}%, rgba(255,255,255,0.1) ${score}%)`;
  };

  return (
    <div 
      ref={verdictRef}
      className="sticky top-20 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700"
      style={{ height: '56px' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Left: TL;DR */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 truncate font-medium">
            {tldr || "Analyzing ethical implications..."}
          </p>
        </div>

        {/* Center: Key Points Pills */}
        <div className="flex items-center gap-2 mx-4">
          {points.map((point, index) => (
            <div
              key={index}
              className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400 whitespace-nowrap"
            >
              {point}
            </div>
          ))}
        </div>

        {/* Right: Alignment Score */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-gray-400 font-medium">
            Alignment
          </span>
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${score}%`,
                background: getScoreGradient(100) // Full color for the bar
              }}
            />
          </div>
          <span 
            className="text-sm font-bold min-w-[2.5rem] text-right"
            style={{ color: getScoreColor(score) }}
          >
            {score}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PinnedVerdict;