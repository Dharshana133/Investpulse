import { useEffect, useRef, useState } from "react";

/**
 * Interactive 3D Canvas Object
 * Renders rotating 3D geometric crystals, holographic cubes, orbital rings,
 * and particle fields that react to mouse hover and drag in real-time.
 */
export function ThreeDObject({
  ticker = "LIVE",
  theme = "primary", // "primary" | "gain" | "loss" | "cyan"
  size = 200,
  mode = "crystal", // "crystal" | "cube" | "ring"
  subtitle = "MARKET MATRIX",
  interactive = true,
  showLabel = true,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    rotX: 0.4,
    rotY: 0.6,
    rotZ: 0.1,
    velX: 0.005,
    velY: 0.008,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  // Palette determination
  const getColors = () => {
    switch (theme) {
      case "gain":
        return {
          primary: "rgba(16, 185, 129, 0.9)",
          secondary: "rgba(52, 211, 153, 0.4)",
          glow: "rgba(16, 185, 129, 0.6)",
          fill: "rgba(16, 185, 129, 0.08)",
          hex: "#10b981",
        };
      case "loss":
        return {
          primary: "rgba(244, 63, 94, 0.9)",
          secondary: "rgba(251, 113, 133, 0.4)",
          glow: "rgba(244, 63, 94, 0.6)",
          fill: "rgba(244, 63, 94, 0.08)",
          hex: "#f43f5e",
        };
      case "cyan":
        return {
          primary: "rgba(6, 182, 212, 0.9)",
          secondary: "rgba(103, 232, 249, 0.4)",
          glow: "rgba(6, 182, 212, 0.6)",
          fill: "rgba(6, 182, 212, 0.08)",
          hex: "#06b6d4",
        };
      default:
        return {
          primary: "rgba(99, 102, 241, 0.9)",
          secondary: "rgba(168, 85, 247, 0.5)",
          glow: "rgba(99, 102, 241, 0.6)",
          fill: "rgba(99, 102, 241, 0.08)",
          hex: "#6366f1",
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Define 3D Vertices for Crystal / Polyhedron
    // Octahedron with bevelled vertices (Diamond Crystal)
    const baseRadius = size * 0.32;
    const vertices = [
      // Top apex
      [0, -baseRadius * 1.3, 0],
      // Bottom apex
      [0, baseRadius * 1.3, 0],
      // Middle ring vertices
      [baseRadius, 0, 0],
      [0, 0, baseRadius],
      [-baseRadius, 0, 0],
      [0, 0, -baseRadius],
      // Secondary ring
      [baseRadius * 0.7, -baseRadius * 0.4, baseRadius * 0.7],
      [-baseRadius * 0.7, -baseRadius * 0.4, baseRadius * 0.7],
      [-baseRadius * 0.7, -baseRadius * 0.4, -baseRadius * 0.7],
      [baseRadius * 0.7, -baseRadius * 0.4, -baseRadius * 0.7],
    ];

    // Edges connecting vertices
    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 3], [3, 4], [4, 5], [5, 2],
      [0, 6], [0, 7], [0, 8], [0, 9],
      [6, 7], [7, 8], [8, 9], [9, 6],
    ];

    // Orbital particles
    const particles = Array.from({ length: 24 }).map((_, i) => ({
      angle: (i / 24) * Math.PI * 2,
      radius: baseRadius * (1.35 + (i % 3) * 0.2),
      yOffset: (Math.sin(i) * baseRadius * 0.4),
      speed: 0.015 + (i % 3) * 0.005,
      size: 1.5 + (i % 3),
    }));

    // Render loop
    const render = () => {
      const state = stateRef.current;
      const colors = getColors();

      // Clear Canvas
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const focalLength = size * 1.5;

      // Update rotation
      if (!state.isDragging) {
        state.rotX += state.velX;
        state.rotY += state.velY;
        // Damping velocity back to steady pace
        state.velX += (0.004 - state.velX) * 0.05;
        state.velY += (0.007 - state.velY) * 0.05;
      }

      const cosX = Math.cos(state.rotX);
      const sinX = Math.sin(state.rotX);
      const cosY = Math.cos(state.rotY);
      const sinY = Math.sin(state.rotY);

      // 3D Projection helper
      const project = (x, y, z) => {
        // Rotate Y
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const scale = focalLength / (focalLength + z2);
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          z: z2,
          scale,
        };
      };

      // Draw subtle background radial aura
      const radialGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, size * 0.45);
      radialGrad.addColorStop(0, colors.glow.replace("0.6", "0.2"));
      radialGrad.addColorStop(1, "transparent");
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Draw Orbit Rings
      ctx.save();
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.1) {
        const ringRadius = baseRadius * 1.5;
        const px = Math.cos(a) * ringRadius;
        const pz = Math.sin(a) * ringRadius;
        const proj = project(px, 0, pz);
        if (a === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Project vertices
      const projected = vertices.map((v) => project(v[0], v[1], v[2]));

      // Draw Faces (Subtle tinted glass facets)
      const faces = [
        [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2],
        [1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 2],
      ];

      faces.forEach((face) => {
        const p0 = projected[face[0]];
        const p1 = projected[face[1]];
        const p2 = projected[face[2]];

        // Calculate face normal direction
        const avgZ = (p0.z + p1.z + p2.z) / 3;
        const opacity = Math.max(0.04, 0.16 + (avgZ / (baseRadius * 2)) * 0.1);

        ctx.fillStyle = colors.glow.replace("0.6", opacity.toFixed(2));
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fill();
      });

      // Draw Wireframe Edges
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw glowing vertices
      projected.forEach((p) => {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update & Draw orbital particles
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = Math.cos(p.angle) * p.radius;
        const pz = Math.sin(p.angle) * p.radius;
        const py = p.yOffset;
        const proj = project(px, py, pz);

        ctx.fillStyle = colors.hex;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, size, mode]);

  // Mouse interaction handlers
  const handleMouseDown = (e) => {
    if (!interactive) return;
    stateRef.current.isDragging = true;
    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!interactive) return;
    const state = stateRef.current;
    if (state.isDragging) {
      const deltaX = e.clientX - state.lastMouseX;
      const deltaY = e.clientY - state.lastMouseY;
      state.rotY += deltaX * 0.01;
      state.rotX -= deltaY * 0.01;
      state.velY = deltaX * 0.005;
      state.velX = -deltaY * 0.005;
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
    }
  };

  const handleMouseUp = () => {
    stateRef.current.isDragging = false;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        stateRef.current.isDragging = false;
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: "relative",
        width: size,
        height: size,
        cursor: interactive ? "grab" : "default",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          display: "block",
          filter: isHovered ? "drop-shadow(0 0 12px rgba(99, 102, 241, 0.4))" : "none",
          transition: "filter 0.3s ease",
        }}
      />

      {/* Floating Center Ticker Badge */}
      {showLabel && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(9, 13, 22, 0.7)",
            backdropFilter: "blur(8px)",
            padding: "0.25rem 0.6rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
              color: "#ffffff",
              letterSpacing: "0.04em",
            }}
          >
            {ticker}
          </div>
          <div
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              color: "var(--accent-cyan)",
              letterSpacing: "0.08em",
            }}
          >
            {subtitle}
          </div>
        </div>
      )}

      {/* 3D Hint */}
      {interactive && isHovered && (
        <div
          style={{
            position: "absolute",
            bottom: "4px",
            fontSize: "0.62rem",
            color: "var(--text-dim)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            pointerEvents: "none",
          }}
        >
          ✦ Drag to rotate in 3D
        </div>
      )}
    </div>
  );
}
