// Filename: CompassSearchSpinner.jsx
import React from "react";
import "./CompassSearchSpinner.css";

const CompassSearchSpinner = () => (
  <div className="compass-wrapper">
    <div className="compass-container">
      {/* Outer circle */}
      <div className="compass-circle"></div>

      {/* Cardinal points */}
      <div className="compass-point north"></div>
      <div className="compass-point east"></div>
      <div className="compass-point south"></div>
      <div className="compass-point west"></div>

      {/* Center dot */}
      <div className="compass-center"></div>

      {/* Needles */}
      <div className="compass-needle gold-needle"></div>
      <div className="compass-needle cyan-needle"></div>
    </div>
    <div className="compass-text">Consulting Wisdom Network...</div>
  </div>
);

export default CompassSearchSpinner;
