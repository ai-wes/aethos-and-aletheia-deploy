// Filename: MoralColliderSpinner.jsx
import React from "react";
import "./IntroMoralColliderSpinner.css";

const IntroMoralColliderSpinner = () => (
  <div className="intro-collider-wrapper">
    <div className="intro-collider-container">
      <div className="intro-collider-core"></div>

      {/* Shockwaves must be underneath the particles */}
      <div className="intro-shockwave intro-aethos-shockwave"></div>
      <div className="intro-shockwave intro-aletheia-shockwave"></div>

      {/* Orbiting Particles */}
      <div className="intro-orbit-path intro-aethos-path">
        <div className="intro-collider-particle intro-aethos-particle"></div>
      </div>
      <div className="intro-orbit-path intro-aletheia-path">
        <div className="intro-collider-particle intro-aletheia-particle"></div>
      </div>
    </div>
    <div className="intro-collider-text"></div>
  </div>
);

export default IntroMoralColliderSpinner;
