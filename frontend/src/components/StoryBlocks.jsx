import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CitationTooltip from './CitationTooltip';

gsap.registerPlugin(ScrollTrigger);

const StoryBlocks = ({ content, sources = [] }) => {
  const containerRef = useRef(null);
  const [activeCitation, setActiveCitation] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Split content into blocks and animate them
    const blocks = containerRef.current.querySelectorAll('[data-block]');
    
    blocks.forEach((block, index) => {
      gsap.fromTo(block, 
        {
          opacity: 0,
          y: 40
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: block,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Set up citation click handlers
    const citationElements = containerRef.current.querySelectorAll('.cited');
    
    const handleCitationClick = (e) => {
      const sourceId = e.target.getAttribute('data-src');
      const source = sources.find(s => s.id === sourceId || s.author);
      
      if (source) {
        const rect = e.target.getBoundingClientRect();
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setActiveCitation(source);
        
        // Auto-hide after 3 seconds
        setTimeout(() => setActiveCitation(null), 3000);
      }
    };

    citationElements.forEach(el => {
      el.addEventListener('click', handleCitationClick);
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      citationElements.forEach(el => {
        el.removeEventListener('click', handleCitationClick);
      });
    };
  }, [content, sources]);

  // Split content into story blocks
  const createStoryBlocks = (htmlContent) => {
    if (!htmlContent) return [];

    // Split by headers or paragraph breaks
    const blocks = htmlContent
      .split(/(<h[1-6][^>]*>.*?<\/h[1-6]>|<hr\s*\/?>|<p>[\s\S]*?<\/p>)/gi)
      .filter(block => block.trim())
      .map((block, index) => ({
        id: `block-${index}`,
        content: block,
        type: block.match(/<h[1-6]/) ? 'header' : 
              block.match(/<hr/) ? 'divider' : 'paragraph'
      }));

    return blocks;
  };

  // Add citation highlighting to content
  const highlightCitations = (content) => {
    // Wrap citations in spans with click handlers
    return content.replace(
      /\[([^\]]+)\]/g,
      '<span class="cited" data-src="$1">$1</span>'
    );
  };

  const storyBlocks = createStoryBlocks(content);

  return (
    <div ref={containerRef} className="story-blocks">
      {storyBlocks.map((block) => (
        <section 
          key={block.id}
          data-block
          className={`story-block ${block.type}`}
        >
          <div 
            dangerouslySetInnerHTML={{ 
              __html: highlightCitations(block.content) 
            }}
          />
        </section>
      ))}

      {/* Citation Tooltip */}
      {activeCitation && (
        <CitationTooltip
          citation={activeCitation}
          position={tooltipPosition}
          onClose={() => setActiveCitation(null)}
        />
      )}

      <style jsx>{`
        .story-blocks {
          max-width: 100%;
          margin: 0 auto;
        }

        .story-block {
          margin-bottom: 24px;
          line-height: 1.7;
          color: #e5e7eb;
        }

        .story-block.header {
          margin-bottom: 16px;
          margin-top: 32px;
        }

        .story-block.header:first-child {
          margin-top: 0;
        }

        .story-block.divider {
          margin: 32px 0;
          text-align: center;
        }

        .story-block.paragraph {
          font-size: 0.95rem;
        }

        :global(.story-blocks .cited) {
          background: rgba(35, 217, 217, 0.15);
          border-bottom: 1px solid rgba(35, 217, 217, 0.4);
          padding: 1px 3px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(.story-blocks .cited:hover) {
          background: rgba(35, 217, 217, 0.25);
          border-bottom-color: rgba(35, 217, 217, 0.6);
        }

        :global(.story-blocks h1),
        :global(.story-blocks h2),
        :global(.story-blocks h3),
        :global(.story-blocks h4),
        :global(.story-blocks h5),
        :global(.story-blocks h6) {
          color: #ffffff;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        :global(.story-blocks h1) { font-size: 1.5rem; }
        :global(.story-blocks h2) { font-size: 1.3rem; }
        :global(.story-blocks h3) { font-size: 1.1rem; }
        :global(.story-blocks h4) { font-size: 1rem; }

        :global(.story-blocks p) {
          margin: 0 0 16px 0;
          font-size: 0.95rem;
        }

        :global(.story-blocks hr) {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(75, 85, 99, 0.5), transparent);
          margin: 24px 0;
        }

        :global(.story-blocks ul),
        :global(.story-blocks ol) {
          margin: 0 0 16px 0;
          padding-left: 24px;
        }

        :global(.story-blocks li) {
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        :global(.story-blocks blockquote) {
          border-left: 3px solid #23d9d9;
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default StoryBlocks;