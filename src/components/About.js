// src/components/About.js
import React from 'react';
import Footer from './Footer';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <section className="about-header">
        <h1>About Our Project</h1>
      </section>

      <section className="mission">
        <h2>Our Mission</h2>
        <p>
          The Fuzzy Classify project is the result of extensive research into fuzzy logic-based ensemble learning for improving image classification. Our goal was to create an accessible interface demonstrating the power of fuzzy ensembling techniques in handling complex classification tasks with inherent uncertainty.
        </p>
        <p>
          We believe that by combining the strengths of multiple models and using fuzzy logic to intelligently weight their contributions, we can create classification systems that are more accurate, robust, and provide better uncertainty estimates than traditional approaches.
        </p>
        <p>
          This platform serves both as a practical demonstration of our research and as an educational tool for those interested in advanced machine learning techniques.
        </p>
      </section>

      <section className="values">
        <div className="value">
          <span role="img" aria-label="GitHub">🐱</span>
          <h3>Open Source</h3>
          <p>Our project is fully open source, with code and documentation available on GitHub.</p>
        </div>
        <div className="value">
          <span role="img" aria-label="Research">📜</span>
          <h3>Research Driven</h3>
          <p>Built on peer-reviewed research with a focus on advancing the field of machine learning.</p>
        </div>
        <div className="value">
          <span role="img" aria-label="Community">👥</span>
          <h3>Community Focus</h3>
          <p>We actively encourage collaboration and contributions from the global research community.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;