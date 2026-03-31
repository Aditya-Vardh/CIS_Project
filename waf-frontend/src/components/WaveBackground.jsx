import { useEffect, useRef } from "react";

export function WaveBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;
    let lastFrame = 0;

    const wavePalette = [
      { offset: 0, amplitude: 70, frequency: 0.003, color: "#00d4aa", opacity: 0.28 },
      { offset: Math.PI / 2, amplitude: 90, frequency: 0.0026, color: "#00ff9d", opacity: 0.2 },
      { offset: Math.PI, amplitude: 60, frequency: 0.0034, color: "#2ed4ff", opacity: 0.16 },
      { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: "#a855f7", opacity: 0.14 },
      { offset: Math.PI * 2, amplitude: 55, frequency: 0.004, color: "#ff4757", opacity: 0.1 },
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const recenterMouse = () => {
      mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
      targetMouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    };

    const onResize = () => {
      resizeCanvas();
      recenterMouse();
    };
    const onMouseMove = (e) => {
      targetMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", recenterMouse);

    resizeCanvas();
    recenterMouse();

    const drawWave = (wave) => {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 8) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height / 2 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / 320);
        const mouseEffect = influence * 70 * Math.sin(time * 0.001 + x * 0.01 + wave.offset);
        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45) +
          mouseEffect;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = 35;
      ctx.shadowColor = wave.color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = (now) => {
      if (now - lastFrame < 16) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastFrame = now;
      time += 1;
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.1;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#04050a");
      gradient.addColorStop(1, "#080c14");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      wavePalette.forEach(drawWave);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", recenterMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}
