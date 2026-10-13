import { useState, useRef } from "react";

export function Card3D({
  children,
  className = "",
  style = {},
  maxTilt = 8,
  depth = 15,
  glowColor = "rgba(99, 102, 241, 0.25)",
  interactive = true,
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-card ${className}`}
      style={{
        position: "relative",
        transformStyle: "preserve-3d",
        transition: "transform 0.15s ease-out, box-shadow 0.25s ease, border-color 0.25s ease",
        transform,
        willChange: "transform",
        boxShadow: glare.opacity > 0 ? `0 14px 35px -5px rgba(0, 0, 0, 0.6), 0 0 20px ${glowColor}` : "var(--shadow-card)",
        ...style,
      }}
      {...props}
    >
      {/* Specular glare overlay */}
      {interactive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.22) 0%, transparent 65%)`,
            opacity: glare.opacity,
            transition: "opacity 0.2s ease",
            zIndex: 10,
          }}
        />
      )}
      <div
        style={{
          transform: `translateZ(${depth}px)`,
          transformStyle: "preserve-3d",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
