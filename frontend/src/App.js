import React from 'react';
import './styles/portfolio.css';

function App() {
  return (
    <div className="App">
      <section className="hero-section">
        <div className="hero-video-bg" />
        
        <div className="hero-content fade-in">
          <div className="hero-punch-badge">
            I ship working apps fast — 1 day typical, hard in 3–4.
          </div>
          
          <h1 className="hero-name display-text">
            Abhishek Kolluri
          </h1>
          
          <p className="hero-tagline heading-md">
            Founder @ PromptForge • Full-Stack + AI
          </p>
          
          <div className="hero-actions">
            <a 
              href="mailto:abhishekollurii@gmail.com"
              className="cta-primary"
            >
              Hire Me
            </a>
            
            <button className="cta-secondary">
              View Projects
            </button>
            
            <a 
              href="#" 
              className="cta-secondary"
            >
              Download Resume
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="portfolio-container">
          <div className="glass-card section-content">
            <h2 className="heading-xl" style={{ color: 'var(--acc-1)' }}>
              Less talk. More shipping.
            </h2>
            <p className="body-lg" style={{ color: 'var(--muted)' }}>
              I solve practical problems by shipping software that actually works.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

export default App;