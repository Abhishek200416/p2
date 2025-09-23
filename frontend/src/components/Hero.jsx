import React, { useState } from 'react';
import { Github, Linkedin, Mail, Download, Eye } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Hero = ({ content }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage (frontend-only for now)
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('subscribers', JSON.stringify(subscribers));
      
      toast({
        title: "You're on my radar! 🎯",
        description: "Thanks for subscribing to rare updates, high signal only.",
        variant: "default"
      });
      
      setIsSubscribed(true);
      setEmail('');
    } else {
      toast({
        title: "Already subscribed",
        description: "You're already on the list!",
        variant: "default"
      });
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-video-bg" />
      
      <div className="hero-content fade-in">
        <div className="hero-punch-badge">
          {content.punch}
        </div>
        
        <h1 className="hero-name display-text">
          {content.name}
        </h1>
        
        <p className="hero-tagline heading-md">
          {content.tagline}
        </p>
        
        <div className="hero-actions">
          <a 
            href={`mailto:abhishekollurii@gmail.com?subject=Let's work together&body=Hi Abhi,%0A%0AI have a project in mind...`}
            className="cta-primary"
          >
            <Mail className="inline w-4 h-4 mr-2" />
            {content.ctaPrimary}
          </a>
          
          <button 
            onClick={() => scrollToSection('projects')}
            className="cta-secondary"
          >
            <Eye className="inline w-4 h-4 mr-2" />
            {content.ctaSecondary}
          </button>
          
          <a 
            href="https://drive.google.com/file/d/1sJ8kQo9vL2mN3pO4qR5tU6vW7xY8zA9b/view" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cta-secondary"
          >
            <Download className="inline w-4 h-4 mr-2" />
            {content.ctaDownload}
          </a>
        </div>
        
        <div className="hero-subscribe">
          <p className="body-sm" style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>
            {content.subscribeCopy}
          </p>
          
          {!isSubscribed ? (
            <form onSubmit={handleSubscribe} className="subscribe-form">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="subscribe-input"
                required
              />
              <button type="submit" className="subscribe-btn">
                Subscribe
              </button>
            </form>
          ) : (
            <div style={{ 
              padding: '0.75rem', 
              background: 'var(--ok)', 
              color: 'white', 
              borderRadius: '2rem',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              ✓ Subscribed! Thanks for joining.
            </div>
          )}
          
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'var(--muted)', 
            marginTop: '0.5rem' 
          }}>
            Backup: <a 
              href="mailto:abhishekollurii@gmail.com" 
              style={{ color: 'var(--acc-1)' }}
            >
              abhishekollurii@gmail.com
            </a>
          </p>
        </div>
        
        <div className="hero-social">
          <a 
            href={content.social.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            aria-label="GitHub Profile"
          >
            <Github size={20} />
          </a>
          
          <a 
            href={content.social.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            aria-label="LinkedIn Profile"
          >
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;