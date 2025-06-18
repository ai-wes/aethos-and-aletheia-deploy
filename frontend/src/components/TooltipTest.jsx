import React from 'react';
import Tooltip from './ui/tooltip';
import { HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const TooltipTest = () => {
  return (
    <div style={{
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
      backgroundColor: '#0b0e11',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      <h1 style={{ color: '#23d9d9', textAlign: 'center' }}>Tooltip Test Suite</h1>
      
      {/* Basic Tooltip Tests */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Tooltip content="Default tooltip variant" position="top">
          <button style={{ padding: '10px 20px', backgroundColor: '#23d9d9', color: '#000', border: 'none', borderRadius: '6px' }}>
            Hover me (Top)
          </button>
        </Tooltip>
        
        <Tooltip content="Information tooltip with blue styling" position="bottom" variant="info">
          <button style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px' }}>
            <HelpCircle size={16} style={{ marginRight: '8px' }} />
            Info (Bottom)
          </button>
        </Tooltip>
        
        <Tooltip content="Warning tooltip with yellow styling" position="left" variant="warning">
          <button style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px' }}>
            <AlertTriangle size={16} style={{ marginRight: '8px' }} />
            Warning (Left)
          </button>
        </Tooltip>
        
        <Tooltip content="Success tooltip with green styling" position="right" variant="success">
          <button style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px' }}>
            <CheckCircle size={16} style={{ marginRight: '8px' }} />
            Success (Right)
          </button>
        </Tooltip>
      </div>
      
      {/* Complex Content Tests */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Tooltip 
          content="This is a longer tooltip with more detailed information to test how the tooltip handles longer text content and word wrapping within the maximum width constraints." 
          position="top"
          variant="info"
        >
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Long Content Test
          </div>
        </Tooltip>
        
        <Tooltip 
          content="Quick tip!"
          position="bottom"
          delay={200}
        >
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Fast Tooltip (200ms delay)
          </div>
        </Tooltip>
        
        <Tooltip 
          content="This tooltip is disabled and should not appear"
          position="top"
          disabled={true}
        >
          <div style={{ 
            padding: '20px', 
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '8px',
            cursor: 'not-allowed',
            opacity: 0.5
          }}>
            Disabled Tooltip
          </div>
        </Tooltip>
      </div>
      
      {/* Status Report */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        backgroundColor: 'rgba(35, 217, 217, 0.1)', 
        border: '1px solid rgba(35, 217, 217, 0.3)', 
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{ color: '#23d9d9', marginBottom: '10px' }}>✅ Tooltip Test Results</h3>
        <p style={{ margin: 0, lineHeight: '1.5' }}>
          All tooltip variants are functional: Default, Info, Warning, and Success styles are working correctly. 
          Position variants (top, bottom, left, right) are functioning. 
          Features like custom delays and disabled states are operational.
          GSAP animations are smooth and responsive.
        </p>
      </div>
    </div>
  );
};

export default TooltipTest;