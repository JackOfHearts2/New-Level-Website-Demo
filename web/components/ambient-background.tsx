"use client";

import { useEffect, useRef } from "react";

// Fourth pass. Prior attempts got the physics right (a real wave field
// instead of a spring mesh — see the "genuine ripple, not particles or a
// grid" reasoning below) but were still wrong on two counts the client
// called out directly: the ripple could travel most of the way across the
// screen, and it showed up underneath text and images, not just in the
// genuinely empty parts of the page.
//
// Two changes fix both. First, the simulated field is now a small fixed
// patch (not the whole viewport) that's redrawn centered on the cursor's
// *current* position every frame — it physically cannot appear more than
// RADIUS px from wherever the mouse is right now, because that's the only
// place it's ever drawn. Second, on every pointer move this checks
// document.elementFromPoint() at the cursor — if the topmost thing
// actually rendered there is text or an image (or anything else with
// real content), no energy is injected and nothing is drawn that frame;
// it only reacts over genuinely empty page background. Opacity was also
// dropped substantially — this is meant to be a barely-there texture, not
// a visual effect competing with the page.
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const buffer = document.createElement("canvas");
    const bufferCtx = buffer.getContext("2d");
    if (!bufferCtx) return;

    // The whole effect lives inside a small patch this size (in real
    // screen px), always centered on the cursor — see the file comment.
    // "A tiny little pulse sent out around the mouse" — small and
    // contained, not a broad halo.
    const RADIUS = 110;
    const GRID = 22; // cells across the patch
    const DAMPING = 0.93; // higher decay than a full-page version needs,
    // since there's nowhere for the wave to travel to anyway — this just
    // keeps it from ringing/lingering.
    const INJECT_RADIUS_CELLS = 1.4;
    const MAX_SPEED = 50;
    const BLUR_PX = 12;
    // Hard ceilings on opacity — "very subtle" per client feedback. v's
    // own magnitude (roughly 0-1.5 right after a fast injection, decaying
    // from there) is remapped to a 0-1 intensity first, *then* capped at
    // these, so tuning injection strength elsewhere can never make it
    // brighter than this regardless of how hard the field gets hit.
    const CREST_ALPHA = 0.16;
    const TROUGH_ALPHA = 0.09;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    let field = new Float32Array(GRID * GRID);
    let scratch = new Float32Array(GRID * GRID);
    const imageData = bufferCtx.createImageData(GRID, GRID);
    buffer.width = GRID;
    buffer.height = GRID;

    let pointerX = -9999;
    let pointerY = -9999;
    let prevPointerX = -9999;
    let prevPointerY = -9999;
    let overContent = true;
    let alphaScale = 1; // dimmer for touch taps than mouse hover — see onPointerDown
    let rafId = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Real content (text, images, cards, controls — anything actually
    // rendered at that point) suppresses the effect; only a hit that
    // resolves to the page's own empty background lets it through.
    const CONTENT_SELECTOR =
      "img, svg, video, picture, canvas, p, h1, h2, h3, h4, h5, h6, span, a, li, blockquote, label, button, dt, dd, dl, figcaption, input, textarea, select, td, th";

    function checkOverContent(x: number, y: number) {
      const el = document.elementFromPoint(x, y);
      if (!el || el === document.body || el === document.documentElement) {
        overContent = false;
        return;
      }
      overContent = el.closest(CONTENT_SELECTOR) != null;
    }

    // Mouse: continuous hover-follow, handled here. Touch has no hover —
    // see onPointerDown below, which is where touch taps get their own,
    // deliberately different, one-shot handling instead of tracking drag.
    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      alphaScale = 1;
      checkOverContent(pointerX, pointerY);
    }
    function onPointerLeave(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      pointerX = -9999;
      pointerY = -9999;
      prevPointerX = -9999;
      prevPointerY = -9999;
      overContent = true;
    }

    // Touch: "wherever they touch, it sends out a tiny pulse" — a single
    // deposit right on contact, not something that keeps tracking the
    // finger through a scroll/drag. Dimmer than the mouse version too
    // (alphaScale below) — a passive response, not something meant to
    // grab attention on a screen someone's actively scrolling.
    function onPointerDown(e: PointerEvent) {
      if (e.pointerType !== "touch") return;
      checkOverContent(e.clientX, e.clientY);
      if (overContent) return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      prevPointerX = pointerX;
      prevPointerY = pointerY;
      alphaScale = 0.55;
      inject(RADIUS, RADIUS, 0.85);
    }

    function inject(localX: number, localY: number, amount: number) {
      const cell = (RADIUS * 2) / GRID;
      const cx = localX / cell;
      const cy = localY / cell;
      const r = INJECT_RADIUS_CELLS;
      const minC = Math.max(0, Math.floor(cx - r));
      const maxC = Math.min(GRID - 1, Math.ceil(cx + r));
      const minR = Math.max(0, Math.floor(cy - r));
      const maxR = Math.min(GRID - 1, Math.ceil(cy + r));
      for (let ry = minR; ry <= maxR; ry++) {
        for (let rx = minC; rx <= maxC; rx++) {
          const d = Math.hypot(rx - cx, ry - cy);
          if (d > r) continue;
          const falloff = 1 - d / r;
          field[ry * GRID + rx] += amount * falloff * falloff;
        }
      }
    }

    function step() {
      if (!overContent && prevPointerX > -9000 && pointerX > -9000) {
        const dx = pointerX - prevPointerX;
        const dy = pointerY - prevPointerY;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.5) {
          const speed = Math.min(dist, MAX_SPEED) / MAX_SPEED;
          // Injected at the patch's own center — the patch itself moves
          // with the cursor at draw time, so "center" is always "here."
          inject(RADIUS, RADIUS, speed * 1.1);
        }
      }

      for (let r = 0; r < GRID; r++) {
        const up = r > 0 ? r - 1 : r;
        const down = r < GRID - 1 ? r + 1 : r;
        for (let c = 0; c < GRID; c++) {
          const left = c > 0 ? c - 1 : c;
          const right = c < GRID - 1 ? c + 1 : c;
          const i = r * GRID + c;
          const avg =
            (field[r * GRID + left] +
              field[r * GRID + right] +
              field[up * GRID + c] +
              field[down * GRID + c]) /
            2;
          scratch[i] = (avg - scratch[i]) * DAMPING;
        }
      }
      // scratch now holds this frame's newly computed heights; field still
      // holds what's about to become "one frame ago" for next time — just
      // swap the two references, no copying needed.
      const tmp = field;
      field = scratch;
      scratch = tmp;
    }

    function draw() {
      if (overContent || pointerX < -9000) {
        ctx!.clearRect(0, 0, width, height);
        return;
      }
      const dark = document.documentElement.classList.contains("dark");
      const data = imageData.data;
      let any = false;
      for (let i = 0; i < field.length; i++) {
        const v = field[i];
        const o = i * 4;
        if (Math.abs(v) < 0.02) {
          data[o + 3] = 0;
          continue;
        }
        any = true;
        if (v >= 0) {
          const intensity = Math.min(1, v * 0.7);
          data[o] = dark ? 114 : 78;
          data[o + 1] = dark ? 211 : 158;
          data[o + 2] = dark ? 91 : 59;
          data[o + 3] = Math.round(intensity * CREST_ALPHA * alphaScale * 255);
        } else {
          const intensity = Math.min(1, -v * 0.7);
          data[o] = 0;
          data[o + 1] = 0;
          data[o + 2] = 0;
          data[o + 3] = Math.round(intensity * TROUGH_ALPHA * alphaScale * 255);
        }
      }
      ctx!.clearRect(0, 0, width, height);
      if (!any) return;
      bufferCtx!.putImageData(imageData, 0, 0);
      ctx!.filter = `blur(${BLUR_PX}px)`;
      ctx!.drawImage(
        buffer,
        0,
        0,
        GRID,
        GRID,
        pointerX - RADIUS,
        pointerY - RADIUS,
        RADIUS * 2,
        RADIUS * 2
      );
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
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown);
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
