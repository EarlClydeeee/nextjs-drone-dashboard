"use client";

import Image from "next/image";
import { useState } from "react";
import type { HeatmapPoint } from "./types";

type MapMode = "orthomosaic" | "heatmap";

const modes: { id: MapMode; label: string; icon: string }[] = [
  { id: "orthomosaic", label: "Orthomosaic + Segmentation", icon: "◈" },
  { id: "heatmap", label: "Risk Heatmap", icon: "◉" },
];

function SegmentationOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-hard-light"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="water2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id="veg2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e827a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="debris2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b45309" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {/* Water */}
      <path d="M0 35 Q25 32 50 38 T100 40 L100 100 L0 100 Z" fill="url(#water2)" />
      {/* Vegetation bank */}
      <path d="M0 20 Q40 15 55 25 Q70 35 100 28 L100 38 Q65 42 50 38 Q30 34 0 35 Z" fill="url(#veg2)" />
      {/* Debris patch 1 */}
      <path d="M38 42 Q48 40 52 48 Q50 56 44 58 Q36 54 38 42 Z" fill="url(#debris2)" />
      {/* Debris patch 2 */}
      <path d="M62 48 Q72 46 78 52 Q76 60 68 58 Q60 54 62 48 Z" fill="url(#debris2)" />
      {/* Debris patch 3 */}
      <path d="M18 52 Q28 48 32 56 Q26 64 20 60 Q14 56 18 52 Z" fill="url(#debris2)" />
    </svg>
  );
}

/* Segmentation legend */
function SegLegend() {
  const items = [
    { color: "bg-teal-500", label: "Vegetation" },
    { color: "bg-sky-500", label: "Open water" },
    { color: "bg-amber-700", label: "Debris" },
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex flex-col gap-1 rounded-xl bg-black/65 px-2.5 py-2 text-[10px] text-white backdrop-blur-sm">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${it.color}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

type Props = {
  points: HeatmapPoint[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function MapHeatmapPanel({ points, selectedId, onSelect }: Props) {
  const [mode, setMode] = useState<MapMode>("orthomosaic");

  const showSegmentation = mode === "orthomosaic";
  const showHeat = true; // always show hotspots

  return (
    <section className="flex flex-col gap-3">
      {/* Mode tab toggle */}
      <div
        className="flex gap-1 self-start rounded-xl border border-[var(--dashboard-border)] bg-white/80 p-1 shadow-sm"
        role="tablist"
        aria-label="Map display mode"
      >
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            id={`map-tab-${m.id}`}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
              mode === m.id
                ? "bg-[var(--dashboard-teal)] text-white shadow-sm"
                : "text-[var(--dashboard-muted)] hover:bg-zinc-100"
            }`}
          >
            <span aria-hidden>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[var(--dashboard-border)] bg-zinc-200 shadow-[var(--dashboard-shadow)]">
        <div className="relative aspect-video w-full">
          <Image
            src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/13673/9010"
            alt="Satellite basemap — Marikina corridor"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />

          {showSegmentation && <SegmentationOverlay />}
          {showSegmentation && <SegLegend />}

          {showHeat &&
            points.map((p) => {
              const active = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  title={p.label}
                  aria-label={`${p.label}. Select for metrics.`}
                  aria-pressed={active}
                  id={`map-hotspot-${p.id}`}
                  className="absolute z-10 rounded-full border-2 border-white/40 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[var(--dashboard-teal)] focus-visible:ring-offset-2"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.radius * 2}%`,
                    aspectRatio: "1",
                    transform: active
                      ? "translate(-50%, -50%) scale(1.12)"
                      : "translate(-50%, -50%)",
                    background: `radial-gradient(circle, rgba(239,68,68,${0.28 + p.intensity * 0.48}) 0%, rgba(239,68,68,0.06) 55%, transparent 70%)`,
                    boxShadow: active
                      ? `0 0 0 3px rgba(26,122,114,0.85), 0 0 32px rgba(239,68,68,${0.4 + p.intensity * 0.35})`
                      : `0 0 24px rgba(239,68,68,${0.2 + p.intensity * 0.25})`,
                  }}
                  onClick={() => onSelect(active ? null : p.id)}
                />
              );
            })}

          {/* Top-left overlay label */}
          <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
            <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium text-zinc-500">Search choke points…</span>
          </div>

          {/* Controls */}
          <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex gap-1 rounded-lg bg-white/95 p-1 shadow backdrop-blur-sm">
            {["+", "−", "⊞"].map((c) => (
              <span key={c} className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-zinc-600">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Caption bar */}
        <div className="border-t border-[var(--dashboard-border)] bg-white/95 px-4 py-2.5">
          <p className="text-xs leading-relaxed text-[var(--dashboard-muted)]">
            {mode === "orthomosaic"
              ? "Segmentation overlay: teal/green — riparian vegetation; blue — open water; brown — debris / exposed shoals."
              : "Click a hotspot to load quantitative removal estimates. Export coordinates as KML/CSV for field crews."}
          </p>
        </div>
      </div>
    </section>
  );
}
