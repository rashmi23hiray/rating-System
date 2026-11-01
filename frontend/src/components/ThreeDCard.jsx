import React, { useRef, useState, useEffect } from 'react';

/**
 * 3D Interactive Tilt Card Component
 * Disabled automatically on media queries (<= 1024px or prefers-reduced-motion)
 */
export default function ThreeDCard({ children, className = '', maxTilt = 10, style = {}, onClick }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const checkMedia = () => {
      const isSmall = window.matchMedia('(max-width: 1024px)').matches;
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setDisabled(isSmall || isReduced);
    };
    checkMedia();
    window.addEventListener('resize', checkMedia);
    return () => window.removeEventListener('resize', checkMedia);
  }, []);

  const handleMouseMove = (e) => {
    if (disabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      x: rotateX,
      y: rotateY,
      glareX,
      glareY,
      isHovered: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  if (disabled) {
    return (
      <div className={`threed-tilt-container ${className}`} style={{ ...style }} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`threed-tilt-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        transition: tilt.isHovered ? 'none' : 'transform 0.4s ease',
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
          tilt.isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(1, 1, 1)'
        }`,
        position: 'relative',
        ...style
      }}
    >
      {tilt.isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}

      {children}
    </div>
  );
}
