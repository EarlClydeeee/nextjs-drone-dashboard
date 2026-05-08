"use client";

import type { HeatmapPoint } from "./types";
import { HEATMAP_POINTS } from "./heatmap-data";

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-PH").format(n);
}

type Props = {
  selected: HeatmapPoint | null;
};

export function MetricsSidebar({ selected }: Props) {
  const aggregateSqm = HEATMAP_POINTS.reduce((s, p) => s + p.sqMeters, 0);
  const aggregateTrucks = HEATMAP_POINTS.reduce((s, p) => s + p.estimatedTrucks, 0);

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-2xl border-2 border-[var(--dashboard-teal)]/40 bg-white p-4 shadow-[var(--dashboard-shadow)]">
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-teal)]/15 text-[var(--dashboard-teal)]"
            aria-hidden
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--dashboard-forest)]">
              Automated feature extraction
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--dashboard-muted)]">
              Computer vision separates organic cover (teal) from non-organic
              debris (red). GIS heat nodes roll up removal logistics below.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--dashboard-border)] bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--dashboard-muted)]">
          Mission totals (all hotspots)
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-2 border-b border-zinc-100 py-2">
            <dt className="text-[var(--dashboard-muted)]">Clogged area</dt>
            <dd className="font-semibold tabular-nums text-[var(--dashboard-forest)]">
              {formatNumber(aggregateSqm)} m²
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-zinc-100 py-2">
            <dt className="text-[var(--dashboard-muted)]">Est. truck loads</dt>
            <dd className="font-semibold tabular-nums text-[var(--dashboard-forest)]">
              {aggregateTrucks}
            </dd>
          </div>
          <div className="flex justify-between gap-2 py-2">
            <dt className="text-[var(--dashboard-muted)]">Status</dt>
            <dd className="font-semibold text-[var(--dashboard-teal)]">LIVE</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-[var(--dashboard-border)] bg-gradient-to-br from-white to-[var(--dashboard-mint)]/40 p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--dashboard-muted)]">
          Selected heat node
        </h3>
        {selected ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-semibold text-[var(--dashboard-forest)]">
              {selected.label}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between gap-2">
                <span className="text-[var(--dashboard-muted)]">Sq. meters</span>
                <span className="font-mono font-medium tabular-nums text-[var(--dashboard-forest)]">
                  {formatNumber(selected.sqMeters)} m²
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-[var(--dashboard-muted)]">
                  Est. trucks
                </span>
                <span className="font-mono font-medium tabular-nums text-[var(--dashboard-forest)]">
                  {selected.estimatedTrucks}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-[var(--dashboard-muted)]">
                  Volume / mass
                </span>
                <span className="font-mono font-medium text-[var(--dashboard-forest)]">
                  {selected.volumeMass}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-[var(--dashboard-muted)]">
                  Flow reduction
                </span>
                <span className="font-mono font-medium tabular-nums text-[var(--dashboard-alert)]">
                  {selected.flowReductionPct}%
                </span>
              </li>
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-[var(--dashboard-muted)]">
            Tap a red hotspot on the map to view sq. meters, truck estimates,
            debris mass, and modeled flow impact for that node.
          </p>
        )}
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dashboard-teal)] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dashboard-teal)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export KML / CSV
      </button>
    </aside>
  );
}
