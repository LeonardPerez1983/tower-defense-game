/**
 * CanvasParticles - Canvas-based particle system
 */

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity?: number;
}

interface CanvasParticlesProps {
  type: "confetti" | "fireworks" | "ash";
  className?: string;
}

export default function CanvasParticles({ type, className = "" }: CanvasParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particle spawning logic
    const spawnParticles = () => {
      if (type === "confetti") {
        // Spawn confetti from top
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 2 + 2,
            size: Math.random() * 8 + 4,
            color: ["#60a5fa", "#fbbf24", "#a855f7", "#ef4444", "#10b981"][Math.floor(Math.random() * 5)],
            life: 1,
            maxLife: 1,
            gravity: 0.1,
          });
        }
      } else if (type === "fireworks") {
        // Spawn firework bursts occasionally
        if (Math.random() < 0.05) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height * 0.5;
          const color = ["#60a5fa", "#fbbf24", "#ef4444"][Math.floor(Math.random() * 3)];

          for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = Math.random() * 3 + 2;
            particlesRef.current.push({
              x,
              y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 3 + 2,
              color,
              life: 1,
              maxLife: 1,
              gravity: 0.05,
            });
          }
        }
      } else if (type === "ash") {
        // Spawn ash particles
        if (Math.random() < 0.2) {
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -Math.random() * 0.5 - 0.3,
            size: Math.random() * 4 + 2,
            color: `rgba(${200 + Math.random() * 55}, ${100 + Math.random() * 50}, 50, ${Math.random() * 0.3 + 0.3})`,
            life: 1,
            maxLife: 1,
          });
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles
      spawnParticles();

      // Update and render particles
      particlesRef.current = particlesRef.current.filter((p) => {
        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        if (p.gravity) {
          p.vy += p.gravity;
        }

        // Update life
        p.life -= 0.01;

        // Remove dead particles or out-of-bounds
        if (p.life <= 0 || p.y > canvas.height + 50 || p.x < -50 || p.x > canvas.width + 50) {
          return false;
        }

        // Render
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;

        return true;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [type]);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
}
