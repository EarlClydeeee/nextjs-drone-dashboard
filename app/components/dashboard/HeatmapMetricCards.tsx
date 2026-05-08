"use client";

import type { HeatmapPoint } from "./types";

type Props = {
  points: HeatmapPoint[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function formatNum(n: number) {
  return new Intl.NumberFormat("en-PH").format(n);
}

/* Intensity → colour mapping for the flow-reduction arc */
function flowColor(pct: number) {
  if (pct >= 30) return { track: "#fecaca", fill: "#dc2626", text: "text-red-600" };
  if (pct >= 20) return { track: "#fed7aa", fill: "#ea580c", text: "text-orange-600" };
  return { track: "#fde68a", fill: "#d97706", text: "text-amber-600" };
}

/* Simple SVG arc gauge */
function FlowGauge({ pct }: { pct: number }) {
  const { track, fill, text } = flowColor(pct);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" stroke={track} strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={fill}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="41" textAnchor="middle" fontSize="13" fontWeight="700" fill={fill}>
          {pct}%
        </text>
      </svg>
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${text}`}>
        Flow reduced
      </span>
    </div>
  );
}

/* Individual metric chip */
function MetricChip({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--dashboard-muted)]">
        <span className="text-[var(--dashboard-teal)]" aria-hidden>{icon}</span>
        {label}
      </div>
      <p className={`font-mono text-base font-bold leading-none ${accent ?? "text-[var(--dashboard-forest)]"}`}>
        {value}
      </p>
    </div>
  );
}

export function HeatmapMetricCards({ points, selectedId, onSelect }: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {points.map((p, i) => {
        const active = selectedId === p.id;
        const { track } = flowColor(p.flowReductionPct);

        return (
          <button
            key={p.id}
            type="button"
            id={`heatmap-card-${p.id}`}
            aria-pressed={active}
            onClick={() => onSelect(active ? null : p.id)}
            className={`group relative flex flex-col rounded-2xl border-2 bg-white text-left shadow-[var(--dashboard-shadow)] transition-all duration-200 hover:shadow-[var(--dashboard-shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-teal)] focus-visible:ring-offset-2 ${
              active
                ? "border-[var(--dashboard-teal)] shadow-[0_0_0_4px_rgba(26,122,114,0.12)]"
                : "border-[var(--dashboard-border)] hover:-translate-y-0.5"
            }`}
          >
            {/* Card top bar */}
            <div
              className="flex items-center gap-3 rounded-t-2xl px-4 py-3"
              style={{
                background: active
                  ? "linear-gradient(135deg, #0c3829 0%, #1a7a72 100%)"
                  : "linear-gradient(135deg, #0f3d2e 0%, #1e827a 100%)",
              }}
            >
              {/* Number badge */}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-white">{p.label}</p>
                <p className="text-[10px] font-medium text-white/60">
                  Intensity: {Math.round(p.intensity * 100)}%
                </p>
              </div>
              {/* Heatmap dot */}
              <span
                className="heat-pulse h-4 w-4 rounded-full border border-white/30"
                style={{ background: `rgba(239,68,68,${0.4 + p.intensity * 0.5})` }}
              />
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-2.5 p-4">
              <MetricChip
                icon={
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                }
                label="Sq. Meters"
                value={`${formatNum(p.sqMeters)} m²`}
              />
              <MetricChip
                icon={
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                }
                label="Est. Trucks"
                value={`${p.estimatedTrucks} loads`}
              />
              <MetricChip
                icon={
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                }
                label="Volume / Mass"
                value={p.volumeMass}
              />

              {/* Flow reduction gauge */}
              <div className="flex items-center justify-center rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-3 py-2">
                <FlowGauge pct={p.flowReductionPct} />
              </div>
            </div>

            {/* Channel capacity footer */}
            <div className="flex items-center justify-between border-t border-[var(--dashboard-border)] px-4 py-2.5 text-xs text-[var(--dashboard-muted)]">
              <span>Channel capacity remaining</span>
              <span className="font-mono font-semibold text-[var(--dashboard-forest)]">
                {100 - p.flowReductionPct}%
              </span>
            </div>

            {/* Selected indicator */}
            {active && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dashboard-teal)] shadow-md">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}

      {/* Export action card */}
      <div className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-[var(--dashboard-border)] bg-white/60 p-5 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-[var(--dashboard-forest)]">
            Geospatial Choke-Point Analysis
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--dashboard-muted)]">
            Generates precise GPS coordinates (KML/CSV) that can be sent directly to DPWH or cleaning crews&apos; mobile phones.
          </p>
        </div>
        <button
          type="button"
          id="export-kml-btn"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dashboard-teal)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dashboard-teal)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export KML / CSV
        </button>
      </div>
    </div>
  );
}
