import React, { useEffect, useRef } from 'react';

export default function CursorTrailRing() {
  const canvasRef = useRef(null);
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const points = [];
    let mouse = { x: -100, y: -100 };
    let ringPos = { x: -100, y: -100 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x - 4}px, ${mouse.y - 4}px, 0)`;
      }

      // Add trail particles (alternating red and white glow)
      for (let i = 0; i < 2; i++) {
        points.push({
          x: mouse.x + (Math.random() - 0.5) * 4,
          y: mouse.y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color: Math.random() > 0.45 ? '#e11d48' : '#ffffff',
          size: Math.random() * 5 + 3,
          alpha: 1.0,
          decay: Math.random() * 0.035 + 0.02
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp for outer cursor ring
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.x - 18}px, ${ringPos.y - 18}px, 0)`;
      }

      // Draw ribbon trail
      if (points.length > 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const xc = (points[i].x + points[i - 1].x) / 2;
          const yc = (points[i].y + points[i - 1].y) / 2;
          ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
        }
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.25)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Update and draw decaying particles
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.96;

        if (p.alpha <= 0 || p.size <= 0.5) {
          points.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color === '#e11d48' ? 'rgba(225, 29, 72, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Fullscreen trail canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
      />

      {/* Center cursor dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-rose-600 pointer-events-none z-50 transition-opacity duration-200 shadow-md shadow-rose-600/50"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />

      {/* Floating magnetic cursor ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-9 h-9 rounded-full border-2 border-rose-500/80 bg-rose-500/10 pointer-events-none z-50 transition-all duration-75 backdrop-blur-[1px] shadow-lg shadow-rose-500/20"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
    </>
  );
}
