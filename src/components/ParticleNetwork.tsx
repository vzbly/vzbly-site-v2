import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = ['#e1b015', '#63a747', '#db690d', '#4581db'];
    
      particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5, // Increased initial velocity for better flow
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 8 + 4, // Much bigger: 4-12 pixels instead of 1-3
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Define repulsion zones
      const topBoundaryY = 0;
      const topBoundaryForce = 100; // Distance from top where force is applied (reduced)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const centerRadius = 400; // Radius of center content area to avoid

      particlesRef.current.forEach((particle) => {
        // Apply repulsion from top boundary (where webm is)
        const distanceFromTop = particle.y - topBoundaryY;
        if (distanceFromTop < topBoundaryForce && distanceFromTop > 0) {
          const force = (1 - distanceFromTop / topBoundaryForce) * 0.01;
          particle.vy += force; // Push downward
        }

        // Apply repulsion from center content area
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceFromCenter < centerRadius && distanceFromCenter > 0) {
          const forceStrength = (1 - distanceFromCenter / centerRadius) * 0.2;
          // Normalize direction and apply force
          particle.vx += (dx / distanceFromCenter) * forceStrength;
          particle.vy += (dy / distanceFromCenter) * forceStrength;
        }

        // Apply mouse repulsion (existing behavior)
        const mouseDx = mouseRef.current.x - particle.x;
        const mouseDy = mouseRef.current.y - particle.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

        if (mouseDistance < 150 && mouseDistance > 0) {
          particle.vx -= (mouseDx / mouseDistance) * 0.001;
          particle.vy -= (mouseDy / mouseDistance) * 0.001;
        }

        // Limit maximum velocity to prevent excessive speed
        const maxVelocity = 2;
        const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (currentSpeed > maxVelocity) {
          particle.vx = (particle.vx / currentSpeed) * maxVelocity;
          particle.vy = (particle.vy / currentSpeed) * maxVelocity;
        }

        // Apply minimal damping to maintain flow
        particle.vx *= 0.999;
        particle.vy *= 0.999;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary collision with bounce
        if (particle.x < 0) {
          particle.vx = Math.abs(particle.vx) * 0.7;
          particle.x = 0;
        } else if (particle.x > canvas.width) {
          particle.vx = -Math.abs(particle.vx) * 0.7;
          particle.x = canvas.width;
        }
        
        if (particle.y < 0) {
          particle.vy = Math.abs(particle.vy) * 0.7;
          particle.y = 0;
        } else if (particle.y > canvas.height) {
          particle.vy = -Math.abs(particle.vy) * 0.7;
          particle.y = canvas.height;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        // Convert hex color to rgba with opacity
        const hex = particle.color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.fill();
      });

      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = otherParticle.x - particle.x;
          const dy = otherParticle.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            // Use a neutral color for connections that works with the new palette
            ctx.strokeStyle = `rgba(69, 129, 219, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
