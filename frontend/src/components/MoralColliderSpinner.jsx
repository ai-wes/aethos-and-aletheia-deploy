// Filename: MoralColliderSpinner.jsx
import React from 'react';
import './MoralColliderSpinner.css';

const MoralColliderSpinner = () => (
  <div className="collider-wrapper">
    <div className="collider-container">
      <div className="collider-core"></div>

      {/* Shockwaves must be underneath the particles */}
      <div className="shockwave aethos-shockwave"></div>
      <div className="shockwave aletheia-shockwave"></div>

      {/* Orbiting Particles */}
      <div className="orbit-path aethos-path">
        <div className="collider-particle aethos-particle"></div>
      </div>
      <div className="orbit-path aletheia-path">
        <div className="collider-particle aletheia-particle"></div>
      </div>
    </div>
    <div className="collider-text">STRESS-TESTING...</div>
  </div>
);

export default MoralColliderSpinner;