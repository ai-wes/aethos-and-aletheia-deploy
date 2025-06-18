// src/App.jsx
import React, { useState, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HarmonicPatternScene from "./components/HarmonicPatternScene"; // Our new master scene
import "./App.css";
import Layout from "./components/Layout";
import Documentation from "./components/Documentation";
import { ApiProvider } from "./contexts/ApiContext";
import { AnalysisProvider } from "./contexts/AnalysisContext";
import backgroundImage from "./assets/images/hero-bg.png";

function App() {
  return (
    <ApiProvider>
      <AnalysisProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Layout />} />
          <Route path="/docs/*" element={<Documentation />} />
        </Routes>
      </AnalysisProvider>
    </ApiProvider>
  );
}

function LandingPage() {
  const [positions, setPositions] = useState(null);
  const navigate = useNavigate();

  const handlePositionsUpdate = useCallback((newPositions) => {
    setPositions(newPositions);
  }, []);

  const handleExploreDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleRunSimulation = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="landing-container">
      <HarmonicPatternScene onPositionsUpdate={handlePositionsUpdate} />

      {positions && (
        <div
          className="title-aethos-positioned"
          style={{
            position: "absolute",
            left: `${positions.aethos.x * 1.3}px`,
            top: `${positions.aethos.y * 0.4}px`, // Reduced by 35%
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <h1 className="title-aethos">Aethos</h1>
        </div>
      )}

      {/* Aletheia title positioned over the right object */}
      {positions && (
        <div
          className="title-aletheia-positioned"
          style={{
            position: "absolute",
            left: `${positions.aletheia.x * 0.9}px`,
            top: `${positions.aletheia.y * 0.4}px`, // Reduced by 35%
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <h1 className="title-aletheia">Aletheia</h1>
        </div>
      )}

      {/* Ampersand positioned between the objects */}
      {positions && (
        <div
          className="ampersand-positioned"
          style={{
            position: "absolute",
            left: `${(positions.aethos.x + positions.aletheia.x) / 2}px`,
            top: `${
              (positions.aethos.y * 0.5 + positions.aletheia.y * 0.5) / 2
            }px`, // Adjusted to match new heights
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <span className="ampersand">&</span>
        </div>
      )}

      {/* Centered subtitle and buttons */}
      <div className="centered-content">
        <div className="subtitle-container">
          <h2 className="subtitle">A Living Moral-Compass Engine</h2>
          <p className="tagline">
            Where enduring wisdom meets real-time learning.
          </p>
        </div>
        <div className="button-container">
          <button className="btn btn-wisdom" onClick={handleExploreDashboard}>
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
