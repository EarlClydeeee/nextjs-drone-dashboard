"use client";

import { useState } from "react";
import { DroneViewFrame } from "./DroneViewFrame";
import { HEATMAP_POINTS } from "./heatmap-data";
import { MapHeatmapPanel } from "./MapHeatmapPanel";
import { HeatmapMetricCards } from "./HeatmapMetricCards";
import { OverallMapPanel } from "./OverallMapPanel";

export function DashboardClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    HEATMAP_POINTS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <header className="mb-6 flex flex-col gap-4 border-b border-[var(--dashboard-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--dashboard-teal)]">
            Output
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--dashboard-forest)] sm:text-3xl">
            UAV River Monitoring
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-[var(--dashboard-muted)]">
            Live AI detection · orthomosaic segmentation · geospatial choke-point heatmaps
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-border)] bg-white px-3 py-2 text-xs font-medium text-[var(--dashboard-forest)] shadow-sm">
            <svg className="h-3.5 w-3.5 text-[var(--dashboard-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Drone altitude: 55 m
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-border)] bg-white px-3 py-2 text-xs font-medium shadow-sm">
            <span className="live-dot h-2 w-2 rounded-full bg-[var(--dashboard-teal)]" />
            <span className="text-[var(--dashboard-teal)] font-semibold">STATUS: LIVE</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--dashboard-border)] bg-white px-3 py-2 text-xs font-mono font-medium text-[var(--dashboard-muted)] shadow-sm">
            GPS 14.6302, 121.0965
          </div>
        </div>
      </header>

      {/* ── Section 1: Overall Map ───────────────────────────────────── */}
      <section className="mb-8">
        <SectionLabel number={1} title="Overall Map" subtitle="Mission planning basemap — Marikina River corridor" />
        <OverallMapPanel />
      </section>

      {/* ── Section 2: AI Detection + Orthomosaic ───────────────────── */}
      <section className="mb-8">
        <SectionLabel number={2} title="Software View &amp; Orthomosaic" subtitle="AI detection feed alongside classified surface segmentation" />
        <div className="grid gap-5 lg:grid-cols-2">
          <DroneViewFrame />
          <MapHeatmapPanel
            points={HEATMAP_POINTS}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </section>

      {/* ── Section 3: Heatmap metric cards ─────────────────────────── */}
      <section className="mb-2">
        <SectionLabel number={3} title="Risk Heatmap — Quantitative Metrics" subtitle="Click a card to highlight on map · data for engineers &amp; field crews" />
        <HeatmapMetricCards
          points={HEATMAP_POINTS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </section>

    </div>
  );
}

/* ── Shared section label ──────────────────────────────────────────────── */
function SectionLabel({
  number,
  title,
  subtitle,
}: {
  number: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-[var(--dashboard-teal)]"
        style={{ background: "var(--section-num-bg)" }}
        aria-hidden
      >
        {number}
      </span>
      <div>
        <h2
          className="text-base font-semibold text-[var(--dashboard-forest)] sm:text-lg"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className="mt-0.5 text-xs text-[var(--dashboard-muted)]" dangerouslySetInnerHTML={{ __html: subtitle }} />
      </div>
    </div>
  );
}
