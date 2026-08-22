"use client";

import { useEffect, useRef } from "react";

// The page's own mesh-gradient background (see the "Mesh gradient" comment
// in globals.css) sits still at rest — client asked for even the empty
// parts of the page to react to the cursor, like it's "swimming through"
// or "pushing against" a fluid surface. This lays a sparse grid of points
// over the full viewport, each held at rest by a spring and displaced away
// from the cursor on approach; only displaced points draw anything, so at
// rest the layer is fully invisible and the existing mesh gradient reads
// exactly as it does today. It's the actual page background's texture
// (fixed, z-[-1], pointer-events none) — not a decoration bolted onto one
// section — so it shows through every empty gap on every page.
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const SPACING = 52;
    const PUSH_RADIUS = 170;
    const PUSH_STRENGTH = 30;
    const SPRING = 0.06;
    const DAMPING = 0.84;

    type Point = { ox: number; oy: number; x: number; y: number; vx: number; vy: number };
    let points: Point[] = [];
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pointerX = -9999;
    let pointerY = -9999;
    let rafId = 0;

    function buildGrid() {
      points = [];
      const cols = Math.ceil(width / SPACING);
      const rows = Math.ceil(height / SPACING);
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;
          points.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
        }
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function onPointerMove(e: PointerEvent) {
      pointerX = e.clientX;
      pointerY = e.clientY;
    }
    function onPointerLeave() {
      pointerX = -9999;
      pointerY = -9999;
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      const dark = document.documentElement.classList.contains("dark");
      const rgb = dark ? "114,211,91" : "78,158,59";

      for (const p of points) {
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < PUSH_RADIUS) {
          const force = (1 - dist / PUSH_RADIUS) * PUSH_STRENGTH;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.05;
          p.vy += Math.sin(angle) * force * 0.05;
        }
        p.vx += (p.ox - p.x) * SPRING;
        p.vy += (p.oy - p.y) * SPRING;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        const displacement = Math.hypot(p.x - p.ox, p.y - p.oy);
        if (displacement > 1.2) {
          const alpha = Math.min(0.32, displacement / 55);
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 1.7, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
          ctx!.fill();
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
