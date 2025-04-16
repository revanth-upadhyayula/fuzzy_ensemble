// src/components/Research.js
import React from 'react';
import Footer from './Footer';
import './Research.css';

const Research = () => {
  return (
    <div className="research">
      <section className="research-header">
        <h1>Research</h1>
      </section>

      <section className="methodology">
        <div className="methodology-header">
          <span className="badge">Methodology</span>
          <h2>Fuzzy Ensembling Approach</h2>
          <p>
            Our research focuses on developing a novel image classification approach that combines multiple deep learning models through fuzzy logic principles. This methodology addresses several key challenges in machine learning.
          </p>
        </div>
        <div className="methodology-content">
          <div className="methodology-card">
            <h3>Model Diversity</h3>
            <p>
              We carefully selected five architecturally diverse neural networks that exhibit complementary strengths and weaknesses. This diversity ensures that the ensemble can handle a wide range of image characteristics and classes.
            </p>
          </div>
          <div className="methodology-card">
            <h3>Fuzzy Rule System</h3>
            <p>
              Our core innovation is a fuzzy inference system that adaptively weights model contributions based on image-specific characteristics, model confidence patterns, and historical performance metrics.
            </p>
          </div>
        </div>
      </section>

      <section className="key-innovations">
        <h2>Key Technical Innovations</h2>
        <ul>
          <li>Integration of 5 distinct neural network architectures with complementary strengths</li>
          <li>Novel fuzzy aggregation strategy using Takagi-Sugeno inference system</li>
          <li>Dynamic weighting mechanism based on input-dependent model reliability metrics</li>
          <li>Uncertainty-aware confidence calibration using temperature scaling and fuzzy membership functions</li>
          <li>Specialized fuzzy rule sets for different image domains and classification challenges</li>
        </ul>
        <div className="math-foundation">
          <h3>Mathematical Foundation</h3>
          <p>
            For a given image <em>x</em>, each model <em>M<sub>i</sub></em> produces a probability distribution <em>P<sub>i</sub></em> over classes. Our fuzzy ensemble computes the final prediction as:
          </p>
          <p className="math-equation">
            P(y|x) = Σ(w<sub>i</sub>(x) * P<sub>i</sub>(y|x)) for i=1 to N
          </p>
          <p>
            Where w<sub>i</sub>(x) are the adaptive fuzzy weights determined by our rule system based on image characteristics and model confidence patterns.
          </p>
        </div>
      </section>

      <section className="performance">
        <h2>Performance Improvements</h2>
        <p>
          Our fuzzy ensembling approach has consistently outperformed individual models and traditional ensembling methods across multiple benchmark datasets. The most significant improvements were observed in cases with limited training data and class imbalance.
        </p>
        <div className="performance-metrics">
          <div className="metric">
            <h3>+8.3%</h3>
            <p>Accuracy Improvement</p>
          </div>
          <div className="metric">
            <h3>-12.5%</h3>
            <p>Reduced Error Rate</p>
          </div>
          <div className="metric">
            <h3>+15.2%</h3>
            <p>F1 Score Increase</p>
          </div>
          <div className="metric">
            <h3>-9.7%</h3>
            <p>Uncertainty Reduction</p>
          </div>
        </div>
        <div className="benchmark-results">
          <h3>Benchmark Results</h3>
          <table>
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Best Single Model</th>
                <th>Traditional Ensemble</th>
                <th>Our Fuzzy Ensemble</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ImageNet</td>
                <td>76.8%</td>
                <td>79.2%</td>
                <td>82.4%</td>
              </tr>
              <tr>
                <td>CIFAR-100</td>
                <td>85.3%</td>
                <td>87.9%</td>
                <td>91.8%</td>
              </tr>
              <tr>
                <td>Medical Images</td>
                <td>73.5%</td>
                <td>76.2%</td>
                <td>82.9%</td>
              </tr>
              <tr>
                <td>Satellite Imagery</td>
                <td>68.7%</td>
                <td>71.3%</td>
                <td>78.5%</td>
              </tr>
            </tbody>
          </table>
          <p>
            Our method shows the greatest improvements in domains with high uncertainty or limited training data, such as medical imaging and satellite imagery classification tasks.
          </p>
        </div>
      </section>

      <section className="related-papers">
        <h2>Related Papers</h2>
        <div className="paper">
          <h3>Fuzzy Ensembling for Improved Image Classification</h3>
          <p>Journal of Artificial Intelligence Research, 2023</p>
          <p>
            This paper introduces our core fuzzy ensembling methodology and demonstrates its effectiveness on standard image classification benchmarks, showing consistent improvements over traditional ensembling techniques.
          </p>
          <a href="#">View Paper →</a>
        </div>
        <div className="paper">
          <h3>Uncertainty-Aware Classification Using Fuzzy Logic</h3>
          <p>Conference on Computer Vision and Pattern Recognition, 2022</p>
          <p>
            This conference paper focuses on the uncertainty quantification aspects of our research, showing how fuzzy membership functions can be used to obtain well-calibrated confidence scores that accurately reflect model uncertainty.
          </p>
          <a href="#">View Paper →</a>
        </div>
        <div className="paper">
          <h3>Comparative Analysis of Ensemble Techniques for Visual Recognition</h3>
          <p>IEEE Transactions on Neural Networks and Learning Systems, 2022</p>
          <p>
            This comprehensive analysis compares our fuzzy ensembling approach against 12 other ensemble methods across diverse image classification tasks, providing insights into when and why our approach outperforms alternatives.
          </p>
          <a href="#">View Paper →</a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Research;