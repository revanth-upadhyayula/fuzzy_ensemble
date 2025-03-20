// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import TechnicalProcess from './components/TechnicalProcess';
import Footer from './components/Footer';
import Research from './components/Research';
import Team from './components/Team';
import About from './components/About';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <HowItWorks />
                <TechnicalProcess />
                <Footer />
              </>
            }
          />
          <Route path="/research" element={<Research />} />
          <Route path="/team" element={<Team />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;