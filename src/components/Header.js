// src/components/Header.js
import React from 'react';
import { Link }from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <span role="img" aria-label="database">📊</span> Fuzzy Classify
      </div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/research">Research</Link>
        <Link to="/team">Team</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
};

export default Header;