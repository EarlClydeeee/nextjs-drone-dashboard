"use client";

import Image from "next/image";
import { HEATMAP_POINTS } from "./heatmap-data";

export function OverallMapPanel() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--dashboard-border)] bg-zinc-800 shadow-[var(--dashboard-shadow-lg)]">
      {/* Map image */}
      <div className="relative w-full" style={{ aspectRatio: "21/7" }}>
        <Image
          src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/13673/9010"
          alt="Overall satellite basemap — Marikina River corridor"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />

        {/* Dark overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Hotspot markers */}
        {HEATMAP_POINTS.map((p, i) => (
          <div
            key={p.id}
            className="absolute z-10"
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
          >
            {/* Pulsing halo */}
            <span
              className="heat-pulse absolute inset-0 rounded-full"
              style={{
                width: `${p.radius * 1.8}px`,
                height: `${p.radius * 1.8}px`,
                left: `${-p.radius * 0.9}px`,
                top: `${-p.radius * 0.9}px`,
                background: `radial-gradient(circle, rgba(239,68,68,${0.3 + p.intensity * 0.4}) 0%, transparent 70%)`,
              }}
            />
            {/* Pin */}
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 shadow-lg text-[10px] font-bold text-white">
              {i + 1}
            </div>
            {/* Label bubble */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {p.label}
            </div>
          </div>
        ))}

        {/* Top-left search bar mock */}
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
          <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-medium text-zinc-500">Marikina River, Philippines</span>
        </div>

        {/* Bottom-right controls */}
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex gap-1 rounded-lg bg-white/95 p-1 shadow backdrop-blur-sm">
          {["+", "−", "⊞"].map((c) => (
            <span key={c} className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-zinc-600">
              {c}
            </span>
          ))}
        </div>

        {/* Bottom-left attribution */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
          ESRI World Imagery · Demo tile
        </div>

        {/* Top-right — mission badge */}
        <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2 rounded-xl bg-[var(--dashboard-forest)]/90 px-3 py-2 text-xs font-semibold text-white shadow backdrop-blur-sm">
          <span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />
          UAV MISSION ACTIVE
        </div>
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[var(--dashboard-forest)] px-4 py-3">
        <div className="flex flex-wrap gap-4">
          {[
            { color: "bg-red-500", label: "Debris choke point" },
            { color: "bg-sky-400", label: "Open water" },
            { color: "bg-emerald-400", label: "Riparian vegetation" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs text-white/80">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>
        <span className="text-xs font-mono text-white/50">Zoom 14 · Tile 13673/9010</span>
      </div>
    </div>
  );
}
