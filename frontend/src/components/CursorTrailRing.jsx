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

    // Particle & history arrays for smooth continuous tail
    const history = [];
    const maxHistory = 18;
    const particles = [];

    let mouse = { x: -200, y: -200, moved: false };
    let ringPos = { x: -200, y: -200 };

    const handlePointerMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;

      // Update center dot instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x - 4}px, ${mouse.y - 4}px, 0)`;
      }

      // Add to trailing history spline
      history.push({ x: mouse.x, y: mouse.y });
      if (history.length > maxHistory) {
        history.shift();
      }

      // Spawn glowing green & white sparks
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: mouse.x + (Math.random() - 0.5) * 6,
          y: mouse.y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8,
          color: Math.random() > 0.35 ? '#10b981' : (Math.random() > 0.5 ? '#00ff66' : '#ffffff'),
          size: Math.random() * 5 + 3,
          alpha: 1.0,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lag for outer cursor ring
      ringPos.x += (mouse.x - ringPos.x) * 0.22;
      ringPos.y += (mouse.y - ringPos.y) * 0.22;

      if (ringRef.current && mouse.moved) {
        ringRef.current.style.transform = `translate3d(${ringPos.x - 20}px, ${ringPos.y - 20}px, 0)`;
      }

      // Draw continuous glowing green snake ribbon trail
      if (history.length > 2) {
        for (let i = 0; i < history.length - 1; i++) {
          const ratio = (i + 1) / history.length;
          ctx.beginPath();
          ctx.moveTo(history[i].x, history[i].y);
          ctx.lineTo(history[i + 1].x, history[i + 1].y);
          ctx.strokeStyle = `rgba(16, 185, 129, ${ratio * 0.7})`;
          ctx.lineWidth = ratio * 5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.stroke();
        }

        // Slowly decay history when mouse stops moving
        if (Math.random() > 0.5 && history.length > 0) {
          history.shift();
        }
      }

      // Render and update glowing green/white particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.95;

        if (p.alpha <= 0 || p.size <= 0.4) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
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
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <>
      {/* Fullscreen trail canvas with maximum z-index and pointer-events none */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
      />

      {/* Center glowing green cursor dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-emerald-400 pointer-events-none z-[9999] shadow-[0_0_12px_#10b981]"
        style={{ transform: 'translate3d(-200px, -200px, 0)' }}
      />

      {/* Outer floating magnetic cursor ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border-2 border-emerald-400/80 bg-emerald-500/15 pointer-events-none z-[9999] backdrop-blur-[1px] shadow-[0_0_18px_rgba(16,185,129,0.35)]"
        style={{ transform: 'translate3d(-200px, -200px, 0)' }}
      />
    </>
  );
}
