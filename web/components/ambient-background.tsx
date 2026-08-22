"use client";

import { useEffect, useRef } from "react";

// The page's own mesh-gradient background (see the "Mesh gradient" comment
// in globals.css) sits still at rest — client asked for even the empty
// parts of the page to react to the cursor, specifically like a cloth: the
// cursor sends small ripples across a connected surface as it moves,
// rather than isolated particles bouncing independently (an earlier pass
// of this used a plain per-point spring-to-rest grid, which read as
// "particles" — the client asked for that to be replaced with this).
//
// The difference that actually makes it read as cloth instead of
// particles: each point is spring-connected to its 4 grid neighbors, not
// just to its own rest position. Poke one point and the disturbance
// propagates outward through those neighbor springs frame by frame — a
// genuine ripple traveling across a connected fabric — instead of every
// point reacting only to the cursor in isolation. Rendered as connected
// grid lines (a woven mesh), not dots, for the same reason. Only
// meaningfully-displaced segments draw anything, so at rest this is fully
// invisible and the existing mesh gradient reads exactly as it does today.
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const SPACING = 44;
    const PUSH_RADIUS = 130;
    const PUSH_STRENGTH = 14;
    const NEIGHBOR_K = 0.045; // structural spring toward neighbors — carries the ripple
    const HOME_K = 0.006; // weak pull back to rest — keeps the cloth from drifting
    const DAMPING = 0.9;

    type Point = { ox: number; oy: number; x: number; y: number; vx: number; vy: number };
    let cols = 0;
    let rows = 0;
    let grid: Point[] = [];
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pointerX = -9999;
    let pointerY = -9999;
    let prevPointerX = -9999;
    let prevPointerY = -9999;
    let rafId = 0;

    const at = (r: number, c: number) => grid[r * cols + c];

    function buildGrid() {
      cols = Math.ceil(width / SPACING) + 1;
      rows = Math.ceil(height / SPACING) + 1;
      grid = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;
          grid.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
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

    function step() {
      // Only push points along the cursor's recent travel path (a short
      // trail of sample positions between last frame and this one), the
      // way dragging a finger through cloth disturbs a line, not just a
      // single point under the tip.
      const trailSteps = 4;
      for (const p of grid) {
        let ax = 0;
        let ay = 0;

        for (let s = 0; s <= trailSteps; s++) {
          const t = s / trailSteps;
          const px = prevPointerX + (pointerX - prevPointerX) * t;
          const py = prevPointerY + (pointerY - prevPointerY) * t;
          const dx = p.x - px;
          const dy = p.y - py;
          const dist = Math.hypot(dx, dy);
          if (dist < PUSH_RADIUS && dist > 0.001) {
            const force = (1 - dist / PUSH_RADIUS) * PUSH_STRENGTH;
            ax += (dx / dist) * force;
            ay += (dy / dist) * force;
          }
        }

        ax += (p.ox - p.x) * HOME_K;
        ay += (p.oy - p.y) * HOME_K;

        p.vx = (p.vx + ax) * DAMPING;
        p.vy = (p.vy + ay) * DAMPING;
      }

      // Structural springs to right/down neighbors (each pair only needs
      // to be resolved once) — this is what carries a poke at one point
      // into a ripple across its neighbors over the following frames.
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = at(r, c);
          if (c < cols - 1) applySpring(p, at(r, c + 1));
          if (r < rows - 1) applySpring(p, at(r + 1, c));
        }
      }

      for (const p of grid) {
        p.x += p.vx;
        p.y += p.vy;
      }
    }

    function applySpring(a: Point, b: Point) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const diff = (dist - SPACING) * NEIGHBOR_K;
      const fx = (dx / dist) * diff;
      const fy = (dy / dist) * diff;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      const dark = document.documentElement.classList.contains("dark");
      const rgb = dark ? "114,211,91" : "78,158,59";

      ctx!.lineWidth = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = at(r, c);
          if (c < cols - 1) drawSegment(p, at(r, c + 1), rgb);
          if (r < rows - 1) drawSegment(p, at(r + 1, c), rgb);
        }
      }
    }

    function drawSegment(a: Point, b: Point, rgb: string) {
      const da = Math.hypot(a.x - a.ox, a.y - a.oy);
      const db = Math.hypot(b.x - b.ox, b.y - b.oy);
      const displacement = (da + db) / 2;
      if (displacement < 0.6) return;
      const alpha = Math.min(0.3, displacement / 45);
      ctx!.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.stroke();
    }

    function tick() {
      step();
      draw();
      prevPointerX = pointerX;
      prevPointerY = pointerY;
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
