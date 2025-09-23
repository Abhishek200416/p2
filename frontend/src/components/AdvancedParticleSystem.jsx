import React, { useEffect, useRef, useState } from 'react';

const AdvancedParticleSystem = ({ 
  particleCount = 60,
  color = '#7bdfff',
  size = 2,
  speed = 0.5,
  opacity = 0.4,
  enableMouse = true,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    
    const handleChange = (e) => setIsReduced(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isReduced) return;

    const ctx = canvas.getContext('2d');
    let mounted = true;

    // Set canvas size
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
    };

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.offsetWidth;
        this.y = y || Math.random() * canvas.offsetHeight;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.originalX = this.x;
        this.originalY = this.y;
        this.size = Math.random() * size + 1;
        this.opacity = Math.random() * opacity + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.drift = Math.random() * 0.02 + 0.005;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
      }

      update() {
        // Gentle floating movement
        this.angle += this.drift;
        this.x += Math.cos(this.angle) * 0.3 + this.vx;
        this.y += Math.sin(this.angle) * 0.3 + this.vy;

        // Pulsing opacity
        this.pulsePhase += this.pulseSpeed;
        const pulseFactor = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        this.currentOpacity = this.opacity * pulseFactor;

        // Boundary wrapping
        if (this.x < -this.size) this.x = canvas.offsetWidth + this.size;
        if (this.x > canvas.offsetWidth + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.offsetHeight + this.size;
        if (this.y > canvas.offsetHeight + this.size) this.y = -this.size;

        // Mouse interaction
        if (enableMouse && mouseRef.current) {
          const dx = mouseRef.current.x - this.x;
          const dy = mouseRef.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
          }
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.currentOpacity;
        ctx.fillStyle = color;
        
        // Create gradient effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add inner glow
        ctx.shadowColor = color;
        ctx.shadowBlur = this.size * 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle());
      }
    };

    // Animation loop
    const animate = () => {
      if (!mounted || !canvas) return;

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      // Draw connections between nearby particles
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.save();
            ctx.globalAlpha = (1 - distance / 150) * 0.3;
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse tracking
    const handleMouseMove = (e) => {
      if (!enableMouse) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    if (enableMouse) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    // Initialize
    resizeCanvas();
    initParticles();
    animate();

    return () => {
      mounted = false;
      window.removeEventListener('resize', resizeCanvas);
      if (enableMouse) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, color, size, speed, opacity, enableMouse, isReduced]);

  if (isReduced) {
    return (
      <div 
        className={`absolute inset-0 opacity-20 ${className}`}
        style={{
          background: `radial-gradient(circle at 30% 40%, ${color}15 0%, transparent 50%), 
                       radial-gradient(circle at 70% 80%, ${color}10 0%, transparent 50%)`,
          ...style
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export default AdvancedParticleSystem;