import React, { useRef, useEffect, useState } from 'react';

const ParticleSystem = ({ isReduced = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const particlesRef = useRef([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height || isReduced) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Particle count based on screen size
    const isMobile = dimensions.width < 768;
    const maxParticles = isMobile ? 8 : 20;
    
    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < maxParticles; i++) {
        particlesRef.current.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: Math.random() * 1 + 1, // 1-2px
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.35 + 0.1, // 0.1-0.45
          life: Math.random() * 200 + 100,
          maxLife: 300,
          color: Math.random() > 0.7 ? '#e6b800' : '#7bdfff', // 30% gold, 70% cyan
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Update life
        particle.life--;
        
        // Fade based on life
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = Math.max(0, lifeRatio * 0.35);
        
        // Wrap around screen edges
        if (particle.x < 0) particle.x = dimensions.width;
        if (particle.x > dimensions.width) particle.x = 0;
        if (particle.y < 0) particle.y = dimensions.height;
        if (particle.y > dimensions.height) particle.y = 0;
        
        // Remove dead particles
        if (particle.life <= 0) {
          particlesRef.current[index] = {
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            size: Math.random() * 1 + 1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.35 + 0.1,
            life: Math.random() * 200 + 100,
            maxLife: 300,
            color: Math.random() > 0.7 ? '#e6b800' : '#7bdfff',
          };
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, isReduced]);

  if (isReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  );
};

export default ParticleSystem;