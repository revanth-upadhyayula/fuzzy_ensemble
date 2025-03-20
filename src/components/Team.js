// src/components/Team.js
import React from 'react';
import Footer from './Footer';
import './Team.css';

const Team = () => {
  return (
    <div className="team">
      <section className="team-header">
        <h1>Our Team</h1>
        <p>
          Meet the researchers and developers behind the Fuzzy Ensembling project. Our interdisciplinary team combines expertise in machine learning, fuzzy logic, computer vision, and software engineering.
        </p>
      </section>

      <section className="team-members">
        <div className="member">
          <div className="member-photo placeholder-photo"></div>
          <h3>Dr. Alex Chen</h3>
          <p className="role">Project Lead</p>
          <p className="description">
            Expert in ensemble learning and fuzzy systems with 15+ years of research experience in computer vision.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Twitter"><span role="img" aria-label="Twitter">🐦</span></a>
            <a href="#" aria-label="LinkedIn"><span role="img" aria-label="LinkedIn">🔗</span></a>
            <a href="#" aria-label="Email"><span role="img" aria-label="Email">✉️</span></a>
          </div>
        </div>

        <div className="member">
          <div className="member-photo placeholder-photo"></div>
          <h3>Dr. Sarah Johnson</h3>
          <p className="role">Fuzzy Logic Specialist</p>
          <p className="description">
            Researcher focused on developing novel fuzzy inference systems for uncertainty-aware machine learning applications.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Twitter"><span role="img" aria-label="Twitter">🐦</span></a>
            <a href="#" aria-label="LinkedIn"><span role="img" aria-label="LinkedIn">🔗</span></a>
            <a href="#" aria-label="Website"><span role="img" aria-label="Website">🌐</span></a>
          </div>
        </div>

        <div className="member">
          <div className="member-photo placeholder-photo"></div>
          <h3>Michael Wei</h3>
          <p className="role">Neural Network Engineer</p>
          <p className="description">
            Expert in neural network optimization and architecture design, focused on model efficiency and performance.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Twitter"><span role="img" aria-label="Twitter">🐦</span></a>
            <a href="#" aria-label="LinkedIn"><span role="img" aria-label="LinkedIn">🔗</span></a>
            <a href="#" aria-label="Email"><span role="img" aria-label="Email">✉️</span></a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;