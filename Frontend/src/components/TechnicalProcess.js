// src/components/TechnicalProcess.js
import React from 'react';
import './TechnicalProcess.css';

const TechnicalProcess = () => {
  return (
    <section className="technical-process">
      <h2>Technical Process</h2>
      <div className="process-steps">
        <p>1. <strong>Image Preprocessing:</strong> Your uploaded image is normalized, resized, and augmented to match the input requirements of each model in our ensemble.</p>
        <p>2. <strong>Parallel Inference:</strong> The image is processed through each of our five base models simultaneously to generate individual predictions.</p>
        <p>3. <strong>Fuzzy Aggregation:</strong> A set of fuzzy rules evaluates the reliability of each model’s predictions based on image characteristics and confidence distributions.</p>
        <p>4. <strong>Membership Function Application:</strong> Confidence scores are refined through fuzzy membership functions that account for model-specific biases and tendencies.</p>
        <p>5. <strong>Defuzzification:</strong> The final step combines the weighted predictions into a coherent output with well-calibrated confidence scores.</p>
      </div>
    </section>
  );
};

export default TechnicalProcess;