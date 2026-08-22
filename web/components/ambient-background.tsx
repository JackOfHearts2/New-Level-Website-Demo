"use client";

import { useEffect, useRef } from "react";

// Third pass at this. First pass was a per-point spring grid rendered as
// dots ("particles" — client said no). Second pass connected the points
// with neighbor springs and rendered the connections as lines ("grid" —
// still not it, and points held near the cursor read as sticking to it
// rather than letting it pass through). This pass drops the mass-spring
// mesh entirely in favor of an actual wave simulation (the classic
// discrete ripple algorithm — a scalar "height" field where each cell
// pulls toward the average of its neighbors, offset against its own
// previous frame): a disturbance genuinely radiates outward and passes
// through neighboring cells like a real ripple, and there is nothing for
// the cursor to grab onto — it only ever deposits energy, never pins a
// position. Rendered as a blurred glow (a small low-res buffer, upscaled
// through a single blur filter), not discrete shapes, so there is no
// visible grid/mesh/dot structure at any zoom — just soft light moving
// across the surface, the way light catches fabric as a hand passes over
// it. Confirmed with the client this "no visible lines at all" version is
// the one they want, over a softened-but-still-visible mesh alternative.
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const buffer = document.createElement("canvas");
    const bufferCtx = buffer.getContext("2d", { willReadFrequently: false });
    if (!bufferCtx) return;

    // One buffer cell per ~14px of real screen — coarse on purpose. The
    // blur that follows on composite is what turns this into a smooth
    // glow; a fine-grained field would just cost more per frame for a
    // result that gets blurred away regardless.
    const CELL = 14;
    const DAMPING = 0.972;
    const INJECT_RADIUS_CELLS = 2.2;
    const MAX_SPEED = 60; // px/frame of pointer travel treated as "fast"
    const BLUR_PX = 34;

    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let field = new Float32Array(0);
    let prevField = new Float32Array(0);
    let imageData: ImageData | null = null;

    let pointerX = -9999;
    let pointerY = -9999;
    let prevPointerX = -9999;
    let prevPointerY = -9999;
    let rafId = 0;

    function buildField() {
      cols = Math.max(1, Math.ceil(width / CELL));
      rows = Math.max(1, Math.ceil(height / CELL));
      field = new Float32Array(cols * rows);
      prevField = new Float32Array(cols * rows);
      buffer.width = cols;
      buffer.height = rows;
      imageData = bufferCtx!.createImageData(cols, rows);
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildField();
    }

    function onPointerMove(e: PointerEvent) {
      pointerX = e.clientX;
      pointerY = e.clientY;
    }
    function onPointerLeave() {
      pointerX = -9999;
      pointerY = -9999;
      prevPointerX = -9999;
      prevPointerY = -9999;
    }

    function inject(px: number, py: number, amount: number) {
      const cx = px / CELL;
      const cy = py / CELL;
      const r = INJECT_RADIUS_CELLS;
      const minC = Math.max(0, Math.floor(cx - r));
      const maxC = Math.min(cols - 1, Math.ceil(cx + r));
      const minR = Math.max(0, Math.floor(cy - r));
      const maxR = Math.min(rows - 1, Math.ceil(cy + r));
      for (let ry = minR; ry <= maxR; ry++) {
        for (let rx = minC; rx <= maxC; rx++) {
          const d = Math.hypot(rx - cx, ry - cy);
          if (d > r) continue;
          const falloff = 1 - d / r;
          field[ry * cols + rx] += amount * falloff * falloff;
        }
      }
    }

    function step() {
      // Only a moving pointer deposits energy — a still cursor holds
      // nothing in place, it just stops adding anything new while
      // whatever's already rippling keeps traveling and fading on its
      // own. This is the actual fix for "sticks to the mouse": there is
      // no force at all tying field values to the current pointer
      // position, only a one-time deposit where it has recently moved.
      if (prevPointerX > -9000 && pointerX > -9000) {
        const dx = pointerX - prevPointerX;
        const dy = pointerY - prevPointerY;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.5) {
          const speed = Math.min(dist, MAX_SPEED) / MAX_SPEED;
          const steps = Math.max(1, Math.min(8, Math.round(dist / (CELL * 0.6))));
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            inject(
              prevPointerX + dx * t,
              prevPointerY + dy * t,
              speed * 2.2
            );
          }
        }
      }

      // Classic discrete ripple: each cell eases toward the average of
      // its 4 neighbors, offset against where it was two frames ago, then
      // damped. This is what makes a disturbance genuinely radiate
      // outward as a traveling wave instead of just decaying in place.
      const next = prevField; // reuse the older buffer as scratch space
      for (let r = 0; r < rows; r++) {
        const up = r > 0 ? r - 1 : r;
        const down = r < rows - 1 ? r + 1 : r;
        for (let c = 0; c < cols; c++) {
          const left = c > 0 ? c - 1 : c;
          const right = c < cols - 1 ? c + 1 : c;
          const i = r * cols + c;
          const avg =
            (field[r * cols + left] +
              field[r * cols + right] +
              field[up * cols + c] +
              field[down * cols + c]) /
            2;
          next[i] = (avg - next[i]) * DAMPING;
        }
      }
      prevField = field;
      field = next;
    }

    function draw() {
      const dark = document.documentElement.classList.contains("dark");
      const data = imageData!.data;
      for (let i = 0; i < field.length; i++) {
        const v = field[i];
        const o = i * 4;
        if (v >= 0) {
          // Crest — brand green, brighter with height (light catching a
          // raised fold).
          const a = Math.min(1, v * 0.9);
          data[o] = dark ? 114 : 78;
          data[o + 1] = dark ? 211 : 158;
          data[o + 2] = dark ? 91 : 59;
          data[o + 3] = Math.round(a * 255);
        } else {
          // Trough — a faint shadow, not a color, so it reads as a fold
          // dipping away from the light rather than a second hue.
          const a = Math.min(0.5, -v * 0.55);
          data[o] = 0;
          data[o + 1] = 0;
          data[o + 2] = 0;
          data[o + 3] = Math.round(a * 255);
        }
      }
      bufferCtx!.putImageData(imageData!, 0, 0);

      ctx!.clearRect(0, 0, width, height);
      ctx!.filter = `blur(${BLUR_PX}px)`;
      ctx!.drawImage(buffer, 0, 0, cols, rows, 0, 0, width, height);
      ctx!.filter = "none";
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
