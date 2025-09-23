import React, { useRef, useEffect } from 'react';

const AnimatedBackground = ({ className = '' }) => {
  const bgRef = useRef(null);

  useEffect(() => {
    const element = bgRef.current;
    if (!element) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const layers = element.children;
          
          // Parallax effect with max 6px total movement
          Array.from(layers).forEach((layer, index) => {
            const speed = (index + 1) * 0.002; // Very subtle
            const yPos = -(scrolled * speed);
            const clampedPos = Math.max(-6, Math.min(6, yPos)); // Clamp to ±6px
            layer.style.transform = `translateY(${clampedPos}px)`;
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      ref={bgRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-panel-2 to-bg opacity-100" />
      
      {/* Floating orb layer 1 */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-gradient-radial from-acc-1/20 via-acc-1/5 to-transparent rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-acc-2/15 via-acc-2/3 to-transparent rounded-full blur-3xl animate-float-reverse" />
      </div>
      
      {/* Floating orb layer 2 */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-gradient-radial from-acc-1/10 via-acc-1/2 to-transparent rounded-full blur-2xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/6 w-72 h-72 bg-gradient-radial from-acc-2/8 via-acc-2/2 to-transparent rounded-full blur-2xl animate-float-slow-reverse" />
      </div>
      
      {/* Grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Video slot - prepared for future drop-in */}
      <div id="hero-video-slot" className="absolute inset-0 z-0">
        {/* This is where the video will go */}
        <video
          className="w-full h-full object-cover opacity-0 pointer-events-none"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          {/* Video sources will be added here */}
          <source src="/assets/infcastle-loop.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Poster fallback */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-0 pointer-events-none"
          style={{ backgroundImage: 'url(/assets/infcastle-poster.jpg)' }}
        />
      </div>
    </div>
  );
};

export default AnimatedBackground;