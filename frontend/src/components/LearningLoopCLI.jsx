import React, { useEffect, useRef } from 'react';

const LearningLoopCLI = ({ 
  phase, 
  currentCycle, 
  cycles, 
  progress,
  currentScenario,
  currentDecision,
  currentCritique,
  currentReflection,
  executionLogs,
  error
}) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [executionLogs]);

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'scenario_loading': return 'text-blue-400';
      case 'decision_making': return 'text-purple-400';
      case 'critique_generation': return 'text-orange-400';
      case 'reflection': return 'text-cyan-400';
      case 'constitution_update': return 'text-green-400';
      case 'complete': return 'text-green-500';
      case 'idle': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'info': return 'text-gray-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (timestamp) => {
    // Handle both ISO strings and Unix timestamps
    const date = timestamp ? new Date(timestamp) : new Date();
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-black rounded-lg p-4 font-mono text-sm">
      {/* Header */}
      <div className="mb-4 pb-2 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div className="text-green-400">
            <span className="text-gray-500">$</span> aletheia-rl --cycles {cycles}
          </div>
          <div className="text-gray-500 text-xs">
            PID: {Math.floor(Math.random() * 10000)} | TTY: pts/1
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mb-4 flex items-center gap-4 text-xs">
        <div className={`${getPhaseColor(phase)}`}>
          [{phase.replace(/_/g, ' ').toUpperCase()}]
        </div>
        <div className="text-gray-500">
          Cycle: {currentCycle}/{cycles}
        </div>
        <div className="text-gray-500">
          Progress: [{Array(10).fill('').map((_, i) => 
            i < Math.floor(progress / 10) ? '█' : '░'
          ).join('')}] {progress}%
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="bg-gray-950 rounded p-3 h-64 overflow-y-auto space-y-1 border border-gray-800"
      >
        {executionLogs
          .filter(log => {
            // Filter out redundant event messages and heartbeats
            const msg = log.message.toLowerCase();
            return !msg.includes('heartbeat') && 
                   !msg.startsWith('event:') && 
                   !msg.startsWith('received:');
          })
          .map((log, index) => (
            <div key={index} className={`${getLogColor(log.type)} leading-tight`}>
              <span className="text-gray-600">[{formatTime(log.timestamp)}]</span> {log.message}
            </div>
          ))}

        {/* Current State Display */}
        {currentScenario && (
          <div className="mt-2 pt-2 border-t border-gray-800">
            <div className="text-blue-400">▶ SCENARIO: {currentScenario.title}</div>
          </div>
        )}

        {currentDecision && (
          <div className="mt-1">
            <div className="text-purple-400">▶ DECISION: {currentDecision.action}</div>
          </div>
        )}

        {currentCritique && (
          <div className="mt-1">
            <div className="text-orange-400">▶ CRITIQUE: Processing oracle feedback...</div>
          </div>
        )}

        {currentReflection && (
          <div className="mt-1">
            <div className="text-cyan-400">▶ REFLECTION: Constitution evolution in progress...</div>
          </div>
        )}

        {error && (
          <div className="mt-2 pt-2 border-t border-red-800">
            <div className="text-red-400">✗ ERROR: {error}</div>
          </div>
        )}

        {/* Cursor */}
        <div className="text-gray-500 animate-pulse inline-block">█</div>
      </div>

      {/* Command Prompt */}
      <div className="mt-3 pt-2 border-t border-gray-800">
        <div className="flex items-center text-gray-400">
          <span className="text-green-400">aletheia@learning</span>
          <span className="text-gray-500">:</span>
          <span className="text-blue-400">~/cycles/{currentCycle}</span>
          <span className="text-gray-500">$</span>
          <span className="ml-2 animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};

export default LearningLoopCLI;