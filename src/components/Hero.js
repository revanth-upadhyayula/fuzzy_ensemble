// src/components/Hero.js
import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="badge">Fuzzy Classification</span>
        <h1>Advanced Image Classification with Fuzzy Ensembling</h1>
        <p>
          Upload an image and our intelligent algorithm will classify it using our innovative fuzzy ensembling approach, providing accurate results even with uncertainty.
        </p>
        <div className="upload-box">
          <div className="upload-placeholder">
            <span role="img" aria-label="image">🖼️</span>
            <p>Drag & drop image here or click to browse</p>
            <p className="supported-formats">Supported formats: JPG, PNG, WEBP</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;