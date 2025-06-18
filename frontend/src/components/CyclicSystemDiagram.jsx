import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Target,
  CheckCircle,
  RotateCcw,
  Brain,
  Zap,
} from "lucide-react";
import IntroMoralColliderSpinner from "./IntroMoralColliderSpinner";

const CyclicSystemDiagram = ({ onNavigate }) => {
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    // Add CSS animation to document head
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup
      document.head.removeChild(style);
    };
  }, []);

  const handleSectionClick = (section) => {
    switch (section) {
      case "aethos":
        onNavigate("oracle");
        break;
      case "aletheia":
        onNavigate("learning");
        break;
      case "stress-test":
        onNavigate("playground");
        break;
      case "constitution":
        onNavigate("constitution");
        break;
      default:
        break;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>How Aethos & Aletheia Work Together</h3>
        <p style={styles.subtitle}>
          Interactive AI systems form a cyclic relationship where ancient wisdom
          guides modern learning, which in turn refines ethical reasoning.
        </p>
      </div>

      <div style={styles.diagramContainer}>
        {/* Flow Background with Centered Collider */}
        <div style={styles.flowBackground}>
          {/* Central MoralColliderSpinner */}
          <div style={styles.centralSpinner}>
            <IntroMoralColliderSpinner />
          </div>
        </div>
      </div>

      {/* Bottom Section Descriptions - Now Clickable */}
      <div style={styles.descriptions}>
        <div
          style={{
            ...styles.aethosDescription,
            ...(hoveredSection === "aethos" ? styles.cardHover : {}),
          }}
          onClick={() => handleSectionClick("aethos")}
          onMouseEnter={() => setHoveredSection("aethos")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div style={styles.descriptionHeader}>
            <Brain style={{ ...styles.descriptionIcon, color: "#ff8c42" }} />
            <h4 style={styles.descriptionTitle}>AETHOS</h4>
            <p style={styles.descriptionSubtitle}>The Wisdom Network</p>
          </div>
          <p style={styles.descriptionText}>
            Provides philosophical guidance and ethical reasoning through
            ancient wisdom and comprehensive ethical frameworks.
          </p>
          <div style={styles.clickHint}>Click to explore →</div>
        </div>

        <div
          style={{
            ...styles.aletheiaDescription,
            ...(hoveredSection === "aletheia" ? styles.cardHover : {}),
          }}
          onClick={() => handleSectionClick("aletheia")}
          onMouseEnter={() => setHoveredSection("aletheia")}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div style={styles.descriptionHeader}>
            <Zap style={{ ...styles.descriptionIcon, color: "#23d9d9" }} />
            <h4 style={styles.descriptionTitle}>ALETHEIA</h4>
            <p style={styles.descriptionSubtitle}>Continuous Improvement</p>
          </div>
          <p style={styles.descriptionText}>
            Refines ethical reasoning through real-world testing, threat
            analysis, and constitutional reinforcement learning.
          </p>
          <div style={styles.clickHint}>Click to explore →</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    backgroundColor: "rgba(11, 14, 17, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    position: "relative",
    overflow: "hidden",
  },

  header: {
    textAlign: "center",
    marginBottom: "32px",
  },

  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 12px 0",
    background: "linear-gradient(135deg, #ff8c42 0%, #23d9d9 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  subtitle: {
    fontSize: "14px",
    color: "#b0bec5",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  diagramContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "32px",
    position: "relative",
  },

  flowBackground: {
    width: "350px",
    height: "200px",
    backgroundImage:
      "url(/assets/images/energy_yang_nobg_lowq.png), url(/images/flow-waves.png)",
    backgroundSize: "cover, cover",
    backgroundPosition: "center, center",
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundBlendMode: "overlay",
    borderRadius: "16px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },

  centralSpinner: {
    position: "relative",
    zIndex: 10,
    scale: "1.2",
  },

  descriptions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },

  aethosDescription: {
    padding: "20px",
    backgroundColor: "rgba(255, 140, 66, 0.1)",
    border: "1px solid rgba(255, 140, 66, 0.3)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  aletheiaDescription: {
    padding: "20px",
    backgroundColor: "rgba(35, 217, 217, 0.1)",
    border: "1px solid rgba(35, 217, 217, 0.3)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  descriptionHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "16px",
  },

  descriptionIcon: {
    width: "32px",
    height: "32px",
    marginBottom: "8px",
  },

  descriptionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 4px 0",
    letterSpacing: "2px",
  },

  descriptionSubtitle: {
    fontSize: "12px",
    color: "#b0bec5",
    fontStyle: "italic",
    margin: 0,
  },

  descriptionText: {
    fontSize: "13px",
    color: "#d1d5db",
    lineHeight: "1.5",
    textAlign: "center",
    margin: 0,
  },

  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
    filter: "brightness(1.05)",
  },

  clickHint: {
    fontSize: "12px",
    color: "#9ca3af",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: "12px",
    opacity: 0.8,
    transition: "all 0.3s ease",
  },
};

export default CyclicSystemDiagram;
