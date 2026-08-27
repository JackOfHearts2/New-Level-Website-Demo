"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  href?: string;
};

// Open-source Leaflet + OpenStreetMap tiles — no API key, no billing
// account, unlike the Google Maps JS API a real multi-pin map would
// otherwise need. Client ask (2026-08-27): confirmed this needs to stay
// free, so this is the one built. OSM's tile server has a fair-use
// policy for very high-traffic production use (not a payment tier, just
// an acceptable-use guideline) — worth knowing if traffic ever gets
// large, not a concern at this site's scale.
export function LeafletMap({
  points,
  height = 320,
  zoom,
}: {
  points: MapPoint[];
  height?: number;
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      // Leaflet's default marker icon references image paths relative to
      // its own package on disk, which don't resolve once bundled — the
      // standard fix is pointing the default icon at the same package
      // version's files on a CDN instead of trying to get Next's bundler
      // to carry the raw PNGs through.
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current).setView(
        [points[0].lat, points[0].lng],
        zoom ?? (points.length > 1 ? 11 : 14)
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markers: import("leaflet").Marker[] = points.map((p) => {
        const marker = L.marker([p.lat, p.lng]).addTo(map);
        const popupHtml = `<strong>${escapeHtml(p.label)}</strong>${p.sublabel ? `<br>${escapeHtml(p.sublabel)}` : ""}`;
        marker.bindPopup(popupHtml);
        if (p.href) {
          // Click-through happens from the popup, not the marker itself —
          // a visitor sees which listing a pin is before navigating away.
          marker.on("popupopen", (e) => {
            const el = e.popup.getElement()?.querySelector<HTMLElement>(".leaflet-popup-content");
            if (!el) return;
            el.style.cursor = "pointer";
            el.onclick = () => router.push(p.href!);
          });
        }
        return marker;
      });

      if (points.length > 1) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
      }
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  if (points.length === 0) {
    return (
      <div
        style={{ height }}
        className="bg-muted text-muted-foreground flex items-center justify-center rounded-2xl text-sm"
      >
        No mapped listings yet.
      </div>
    );
  }

  return <div ref={containerRef} style={{ height }} className="z-0 w-full overflow-hidden rounded-2xl" />;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
