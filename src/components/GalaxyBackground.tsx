import React, { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isTabActive, setIsTabActive] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Handle tab visibility for performance
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars();
    };

    const initializeStars = () => {
      const starCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 8000));
      starsRef.current = [];
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.8 + 0.2,
          color: Math.random() > 0.7 ? '#00E0FF' : '#FFFFFF'
        });
      }
    };

    const createParticle = (x: number, y: number) => {
      const colors = ['#00E0FF', '#00BFFF', '#87CEEB', '#FFFFFF'];
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 60 + 30
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Create particles near mouse
      if (Math.random() < 0.1 && particlesRef.current.length < 50) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY));
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const animate = () => {
      if (!isTabActive || prefersReducedMotion) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      time += 0.01;
      
      // Clear canvas with slight trail effect
      ctx.fillStyle = 'rgba(11, 11, 16, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      starsRef.current.forEach((star, index) => {
        // Update star position
        star.z -= star.speed;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        // Calculate 3D projection
        const x = (star.x - canvas.width / 2) * (1000 / star.z) + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * (1000 / star.z) + canvas.height / 2;
        const size = star.size * (1000 / star.z);

        // Add subtle movement
        const offsetX = Math.sin(time + index * 0.1) * 0.5;
        const offsetY = Math.cos(time + index * 0.1) * 0.5;

        // Draw star with glow
        if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
          ctx.save();
          ctx.globalAlpha = star.opacity * (1000 / star.z) * 0.8;
          
          // Outer glow
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(x + offsetX, y + offsetY, 0, x + offsetX, y + offsetY, size * 3);
          gradient.addColorStop(0, star.color + '40');
          gradient.addColorStop(1, star.color + '00');
          ctx.fillStyle = gradient;
          ctx.fill();

          // Inner star
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.fill();
          
          ctx.restore();
        }
      });

      // Draw and update particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;
        particle.opacity = 1 - (particle.life / particle.maxLife);
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        if (particle.opacity > 0) {
          ctx.save();
          ctx.globalAlpha = particle.opacity;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          ctx.restore();
          return true;
        }
        return false;
      });

      // Draw galaxy spiral effect
      if (!prefersReducedMotion) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.strokeStyle = '#00E0FF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
            const radius = angle * 20 + Math.sin(time + i) * 50;
            const x = centerX + Math.cos(angle + time * 0.5 + i * 2) * radius;
            const y = centerY + Math.sin(angle + time * 0.5 + i * 2) * radius * 0.6;
            
            if (angle === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.stroke();
          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTabActive, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0B0B10 100%)' }}
    />
  );
};

export default GalaxyBackground;