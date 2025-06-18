/** @jsxImportSource @emotion/react */
import React, { useMemo } from "react";
import { css } from "@emotion/react";
import { BookOpen, MessageSquare } from "lucide-react";

const Section = ({ icon, title, items, onNavigate }) => {
  if (!items || items.length === 0) return null;
  return (
    <div css={styles.section}>
      <h4 css={styles.sectionTitle}>
        {icon}
        {title}
      </h4>
      <ul css={styles.list}>
        {items.map((item, index) => (
          <li key={index}>
            <button css={styles.linkButton} onClick={() => onNavigate(item.id)}>
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function WisdomInsightsSidebar({
  wisdomResult,
  onNavigateToSection,
}) {
  const structuredData = useMemo(() => {
    return wisdomResult?.structured_response || null;
  }, [wisdomResult]);

  const perspectives = useMemo(() => {
    if (!structuredData?.perspectives || structuredData.perspectives.length === 0) return [];
    return structuredData.perspectives.map((p, index) => ({
      text: p.framework,
      id: `perspective-ref-${index}`,
    }));
  }, [structuredData]);

  if (!structuredData) {
    // Render a placeholder or default state if no result
    return (
      <div css={styles.sidebarContainer}>
        <div css={styles.header}>
          <h3 css={styles.title}>Wisdom Network</h3>
          <p css={styles.subtitle}>
            Access the collective wisdom of human thought to explore ethical
            questions and philosophical perspectives.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div css={styles.sidebarContainer}>
      <div css={styles.header}>
        <h3 css={styles.title}>Wisdom Insights</h3>
        <p css={styles.subtitle}>Click to navigate the analysis</p>
      </div>
      <div css={styles.content}>
        {/* TLDR Section */}
        {structuredData.tldr && (
          <div css={styles.section}>
            <h4 css={styles.sectionTitle}>
              <MessageSquare size={16} />
              Summary
            </h4>
            <p css={styles.tldrText}>{structuredData.tldr}</p>
          </div>
        )}

        {/* Navigable Perspectives Section */}
        <Section
          icon={<BookOpen size={16} />}
          title="Philosophical Perspectives"
          items={perspectives}
          onNavigate={onNavigateToSection}
        />
      </div>
    </div>
  );
}

const styles = {
  sidebarContainer: css`
    background: rgba(17, 21, 26, 0.8);
    border: 1px solid rgba(56, 71, 87, 0.4);
    border-radius: 12px;
    padding: 24px;
    height: fit-content;
    max-height: calc(100vh - 180px);
    overflow-y: auto;
    backdrop-filter: blur(10px);
  `,
  header: css`
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(56, 71, 87, 0.4);
    margin-bottom: 16px;
  `,
  title: css`
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #23d9d9;
  `,
  subtitle: css`
    margin: 4px 0 0;
    font-size: 0.85rem;
    color: #8f9aa6;
  `,
  content: css`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  section: css``,
  sectionTitle: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #e0e6eb;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  tldrText: css`
    font-size: 0.85rem;
    color: #c3cbd3;
    line-height: 1.6;
    margin: 0;
    font-style: italic;
  `,
  list: css`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  linkButton: css`
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    color: #8f9aa6;
    font-size: 0.85rem;
    text-align: left;
    cursor: pointer;
    transition: color 0.2s ease;
    width: 100%;

    &:hover {
      color: #23d9d9;
    }
  `,
};
