import React, { useEffect, useRef } from 'react';

/**
 * Lightweight 3D Canvas rendering rotating 3D stars & glowing particles.
 * Automatically disables all animation on media queries (screens <= 1024px or prefers-reduced-motion).
 */
export default function ThreeDCanvas({ count = 30, interactive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check media queries: disable animation on mobile / responsive / reduced-motion
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches;

    if (isReducedMotion || isSmallScreen) {
      return; // No animation in media queries
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      if (window.innerWidth <= 1024) {
        cancelAnimationFrame(animationFrameId);
        return;
      }
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX - width / 2) / (width / 2);
      mouse.targetY = (clientY - height / 2) / (height / 2);
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const objects = [];
    const colors = ['#0d9488', '#14b8a6', '#f59e0b', '#0284c7', '#10b981'];

    for (let i = 0; i < count; i++) {
      objects.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        rotZ: Math.random() * Math.PI * 2,
        speedZ: (Math.random() - 0.5) * 0.015,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        isStar: Math.random() > 0.4
      });
    }

    const fov = 400;

    const draw3DStar = (cx, cy, spikes, outerRadius, innerRadius, rot) => {
      let rotStep = Math.PI / spikes;
      let angle = rot;
      ctx.beginPath();
      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(angle) * outerRadius;
        let y = cy + Math.sin(angle) * outerRadius;
        ctx.lineTo(x, y);
        angle += rotStep;
        x = cx + Math.cos(angle) * innerRadius;
        y = cy + Math.sin(angle) * innerRadius;
        ctx.lineTo(x, y);
        angle += rotStep;
      }
      ctx.closePath();
    };

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      objects.sort((a, b) => b.z - a.z);

      for (let obj of objects) {
        obj.rotZ += obj.speedZ;

        const camX = mouse.x * 100;
        const camY = mouse.y * 100;

        const adjX = obj.x - camX;
        const adjY = obj.y - camY;
        const adjZ = obj.z;

        if (adjZ <= 0) continue;

        const scale = fov / (fov + adjZ);
        const projX = width / 2 + adjX * scale;
        const projY = height / 2 + adjY * scale;
        const projSize = obj.size * scale;
        const alpha = Math.min(1, Math.max(0.1, (1000 - adjZ) / 900));

        ctx.save();
        ctx.globalAlpha = alpha * 0.8;

        if (obj.isStar) {
          ctx.translate(projX, projY);
          draw3DStar(0, 0, 5, projSize * 1.4, projSize * 0.65, obj.rotZ);
          ctx.fillStyle = obj.color;
          ctx.shadowColor = obj.color;
          ctx.shadowBlur = 8 * scale;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
          ctx.fillStyle = obj.color;
          ctx.shadowColor = obj.color;
          ctx.shadowBlur = 6 * scale;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [count, interactive]);

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
        zIndex: 0
      }}
    />
  );
}
