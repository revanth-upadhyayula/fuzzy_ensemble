// src/components/HowItWorks.js
import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <section className="how-it-works">
      <h2>How Fuzzy Ensembling Works</h2>
      <div className="how-it-works-content">
        <div className="text-content">
          <div className="card">
            <h3>Multi-Model Architecture</h3>
            <p>
              Our system combines predictions from multiple deep learning architectures (ResNet, EfficientNet, Vision Transformer, DenseNet, and MobileNet) to leverage the strengths of each model while mitigating their individual weaknesses.
            </p>
          </div>
          <div className="card">
            <h3>Fuzzy Logic Integration</h3>
            <p>
              Instead of simple averaging or voting, we employ fuzzy logic rules to weight each model’s output based on its historical performance with similar images. This allows the system to adaptively trust specific models more in contexts where they excel.
            </p>
          </div>
          <div className="card">
            <h3>Uncertainty Quantification</h3>
            <p>
              Our fuzzy-ensemble provides confidence scores that are well-calibrated and accurately reflect prediction uncertainty, unlike standard softmax outputs which often produce overconfident results even when wrong.
            </p>
          </div>
        </div>
        <div className="image-content">
          {/* Placeholder for the image */}
          <div className="placeholder-image">📊</div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;