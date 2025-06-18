import React, { useState } from 'react';
import PinnedVerdict from './PinnedVerdict';
import AccordionStepper from './AccordionStepper';
import SourceBrowser from './SourceBrowser';
import QuickActions, { useScrollProgress } from './QuickActions';

const ProgressiveWisdomDisclosure = ({ 
  analysis = null, 
  isLoading = false,
  onDeepDive = () => {},
  onFeedback = () => {},
  onSaveToNotebook = () => {},
  onExplainSimple = () => {}
}) => {
  const scrollProgress = useScrollProgress();
  
  console.log("ProgressiveWisdomDisclosure - analysis:", analysis);

  // Extract data from analysis
  const alignmentScore = analysis?.confidence || 0;
  const dominantEthic = analysis?.perspectives?.[0]?.framework || 'Unknown';
  const frameworks = analysis?.perspectives || [];
  const keyInsights = analysis?.key_points || [];
  const sources = analysis?.sources || [];
  const tldr = analysis?.tldr || analysis?.summary || '';
  const fullAnalysis = analysis?.full_analysis || '';
  const traceId = analysis?.trace_id || '';
  
  // Get theme color based on alignment score
  const getThemeColor = (score) => {
    if (score <= 33) return '#c9344a'; // red
    if (score <= 66) return '#e1a10d'; // amber
    return '#24c4b6'; // teal
  };

  // Handle framework read proof navigation
  const handleFrameworkReadProof = (framework) => {
    onDeepDive({
      type: 'framework-focus',
      framework: framework,
      action: 'show-deep-analysis'
    });
  };

  // Handle trace map navigation
  const handleTraceMap = (source) => {
    onDeepDive({
      type: 'trace-map',
      source: source,
      action: 'open-reason-graph'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full" />
          <span className="text-gray-400">Acquiring wisdom...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-400">No wisdom analysis available</p>
        <p className="text-sm text-gray-500 mt-1">Submit a query to see progressive disclosure</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full" />
          <span className="text-gray-400">Acquiring wisdom...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-400">No wisdom analysis available</p>
        <p className="text-sm text-gray-500 mt-1">Submit a query to see progressive disclosure</p>
      </div>
    );
  }

  // Enhanced UX with constrained layout 
  return (
    <div className="enhanced-wisdom-disclosure" style={{ width: '100%', maxWidth: 'none' }}>
      {/* Simplified Pinned Verdict - no fixed positioning */}
      <div id="summary" style={{ 
        background: 'rgba(17, 24, 39, 0.9)',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ fontSize: '14px', color: '#d1d5db', margin: 0 }}>
              {tldr || "Analyzing ethical implications..."}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {keyInsights.slice(0, 2).map((point, index) => (
              <span key={index} style={{
                padding: '4px 8px',
                background: 'rgba(35, 217, 217, 0.1)',
                border: '1px solid rgba(35, 217, 217, 0.2)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#23d9d9',
                whiteSpace: 'nowrap'
              }}>
                ⚡ {point.replace(/^⚡\s*/, '').substring(0, 20)}...
              </span>
            ))}
            <span style={{
              fontSize: '12px',
              color: '#9ca3af',
              fontWeight: '500'
            }}>
              Alignment: <span style={{ 
                color: getThemeColor(alignmentScore),
                fontWeight: '600'
              }}>{alignmentScore}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simple layout - no complex grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Main Content - Accordion Stepper */}
        <AccordionStepper
          frameworks={frameworks}
          keyInsights={keyInsights}
          fullAnalysis={fullAnalysis}
          onFrameworkReadProof={handleFrameworkReadProof}
        />
        
        {/* Source Browser - simplified */}
        {sources.length > 0 && (
          <div id="sources" style={{ 
            background: 'rgba(17, 24, 39, 0.6)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h4 style={{ 
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>📚 Philosophical Sources</h4>
            <SourceBrowser 
              sources={sources.slice(0, 3)} // Limit to avoid overflow
              onTraceMap={handleTraceMap}
            />
          </div>
        )}
      </div>

      {/* Simple Quick Actions - no fixed positioning */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onFeedback({ trace_id: traceId, rating: 'up' })}
          style={{
            background: 'transparent',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            color: '#d1d5db',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          👍 Helpful
        </button>
        <button
          onClick={() => onSaveToNotebook({ trace_id: traceId })}
          style={{
            background: 'transparent',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            color: '#d1d5db',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          💾 Save
        </button>
      </div>
    </div>
  )
};

export default ProgressiveWisdomDisclosure;