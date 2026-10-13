import { useEffect, useRef } from "react";

/**
 * 3D Ambient Spatial Canvas Background
 * Renders floating 3D dust particles and depth nodes that react with mouse parallax.
 */
export function ThreeDBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Generate 3D floating nodes
    const count = 45;
    const nodes = Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 800 + 200,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.6 ? "rgba(99, 102, 241, " : Math.random() > 0.5 ? "rgba(6, 182, 212, " : "rgba(168, 85, 247, ",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const focal = 600;
      const offsetX = (mouse.x - width / 2) * 0.05;
      const offsetY = (mouse.y - height / 2) * 0.05;

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (n.z < 100) n.z = 1000;
        if (n.z > 1000) n.z = 100;
        if (n.x < -width) n.x = width;
        if (n.x > width) n.x = -width;
        if (n.y < -height) n.y = height;
        if (n.y > height) n.y = -height;

        const scale = focal / (focal + n.z);
        const px = width / 2 + (n.x - offsetX) * scale;
        const py = height / 2 + (n.y - offsetY) * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = (1 - n.z / 1000) * 0.35;
          ctx.fillStyle = `${n.color}${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(px, py, n.size * scale * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.8,
      }}
    />
  );
}
