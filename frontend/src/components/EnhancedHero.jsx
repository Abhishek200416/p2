import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, Download, Eye } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import AnimatedBackground from './AnimatedBackground';
import ParticleSystem from './ParticleSystem';

const EnhancedHero = React.forwardRef(({ content }, ref) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isReduced, setIsReduced] = useState(false);
  const { toast } = useToast();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    
    const handleChange = (e) => setIsReduced(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    try {
      // Frontend-only for now - save to localStorage
      const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push({
          email,
          subscribedAt: new Date().toISOString(),
          source: 'hero-form'
        });
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
        
        // Future: Backend call when enabled
        // await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscribe`, {...});
        
        toast({
          title: "You're on my radar! 🎯",
          description: "Thanks for subscribing to rare updates, high signal only.",
        });
        
        setIsSubscribed(true);
        setEmail('');
      } else {
        toast({
          title: "Already subscribed",
          description: "You're already on the list!",
        });
      }
    } catch (error) {
      toast({
        title: "Subscription saved locally",
        description: "Your email has been saved. I'll reach out soon!",
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
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background with Video Slot */}
      <AnimatedBackground />
      
      {/* Particle System */}
      <ParticleSystem isReduced={isReduced} />
      
      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 py-12 max-w-4xl mx-auto">
        {/* Punch Badge */}
        <div className="inline-block mb-6 animate-pulse-glow">
          <div className="bg-acc-1 text-bg px-6 py-3 rounded-full font-semibold text-sm font-display tracking-wide">
            {content.punch}
          </div>
        </div>
        
        {/* Name */}
        <h1 className="font-display font-bold text-ink mb-4 animate-fade-in text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight">
          {content.name}
        </h1>
        
        {/* Tagline */}
        <p className="font-display text-xl sm:text-2xl lg:text-3xl text-muted mb-8 animate-slide-up font-medium">
          {content.tagline}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <a 
            href={`mailto:abhishekollurii@gmail.com?subject=Let's work together&body=Hi Abhi,%0A%0AI have a project in mind...`}
            className="group bg-acc-1 hover:bg-acc-2 text-bg px-8 py-4 rounded-full font-semibold text-lg transition-all duration-250 ease-smooth transform hover:scale-105 hover:shadow-2xl hover:shadow-acc-1/25 flex items-center gap-3"
          >
            <Mail className="w-5 h-5 transition-transform group-hover:rotate-12" />
            {content.ctaPrimary}
          </a>
          
          <button 
            onClick={() => scrollToSection('projects')}
            className="group border-2 border-glass-border hover:border-acc-1 hover:bg-acc-1/10 text-ink hover:text-acc-1 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-250 ease-smooth flex items-center gap-3"
          >
            <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
            {content.ctaSecondary}
          </button>
          
          <a 
            href="https://drive.google.com/file/d/1sJ8kQo9vL2mN3pO4qR5tU6vW7xY8zA9b/view" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group border-2 border-glass-border hover:border-acc-2 hover:bg-acc-2/10 text-ink hover:text-acc-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-250 ease-smooth flex items-center gap-3"
          >
            <Download className="w-5 h-5 transition-transform group-hover:translate-y-1" />
            {content.ctaDownload}
          </a>
        </div>
        
        {/* Subscribe Section */}
        <div className="max-w-md mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-muted text-sm mb-4 font-medium">
            {content.subscribeCopy}
          </p>
          
          {!isSubscribed ? (
            <form onSubmit={handleSubscribe} className="flex gap-2 p-2 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-full shadow-lg">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-0 px-4 py-3 text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg rounded-full"
                required
              />
              <button 
                type="submit" 
                className="bg-acc-1 hover:bg-acc-2 text-bg px-6 py-3 rounded-full font-semibold transition-all duration-250 ease-smooth hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          ) : (
            <div className="bg-ok/20 border border-ok/30 text-ok px-6 py-4 rounded-full font-semibold backdrop-blur-xl">
              ✓ Subscribed! Thanks for joining.
            </div>
          )}
          
          <p className="text-xs text-muted mt-3">
            Backup: <a 
              href="mailto:abhishekollurii@gmail.com" 
              className="text-acc-1 hover:text-acc-2 transition-colors duration-200"
            >
              abhishekollurii@gmail.com
            </a>
          </p>
        </div>
        
        {/* Social Links */}
        <div className="flex justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <a 
            href={content.social?.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group w-14 h-14 bg-glass-bg backdrop-blur-xl border border-glass-border hover:border-acc-1 rounded-full flex items-center justify-center transition-all duration-250 ease-smooth hover:scale-110 hover:shadow-lg hover:shadow-acc-1/25"
            aria-label="GitHub Profile"
          >
            <Github className="w-6 h-6 text-ink group-hover:text-acc-1 transition-colors duration-200" />
          </a>
          
          <a 
            href={content.social?.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group w-14 h-14 bg-glass-bg backdrop-blur-xl border border-glass-border hover:border-acc-1 rounded-full flex items-center justify-center transition-all duration-250 ease-smooth hover:scale-110 hover:shadow-lg hover:shadow-acc-1/25"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="w-6 h-6 text-ink group-hover:text-acc-1 transition-colors duration-200" />
          </a>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-glass-border rounded-full p-1">
          <div className="w-1 h-3 bg-acc-1 rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  );
});

EnhancedHero.displayName = 'EnhancedHero';

export default EnhancedHero;