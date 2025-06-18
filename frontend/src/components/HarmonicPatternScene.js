// src/HarmonicPatternScene.jsx
import React from "react";
import ParticleField from "./ParticleField";

const HarmonicPatternScene = ({ onPositionsUpdate }) => {
  // Calculate fixed positions for text
  const aethosPosition = {
    x: window.innerWidth * 0.25, // 25% from left
    y: window.innerHeight * 0.5, // Centered vertically
  };

  const aletheiaPosition = {
    x: window.innerWidth * 0.75, // 75% from left
    y: window.innerHeight * 0.5, // Centered vertically
  };

  // Pass positions to parent
  React.useEffect(() => {
    onPositionsUpdate({
      aethos: aethosPosition,
      aletheia: aletheiaPosition,
    });

    const handleResize = () => {
      onPositionsUpdate({
        aethos: {
          x: window.innerWidth * 0.25,
          y: window.innerHeight * 0.5,
        },
        aletheia: {
          x: window.innerWidth * 0.75,
          y: window.innerHeight * 0.5,
        },
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "transparent",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%)",
      }}
    >
      <ParticleField />
    </div>
  );
};

export default HarmonicPatternScene;
