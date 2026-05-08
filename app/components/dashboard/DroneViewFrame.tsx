"use client";

export function DroneViewFrame() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-[var(--dashboard-muted)]">
        <span>1. The &lsquo;Software&rsquo; View · AI Detection</span>
        <span className="flex items-center gap-1.5 text-[var(--dashboard-teal)]">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--dashboard-teal)]" />
          Live feed
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[var(--dashboard-border)] bg-zinc-900 shadow-[var(--dashboard-shadow)]">
        {/* Corner reticles */}
        <div className="pointer-events-none absolute inset-3 z-20 sm:inset-4">
          <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-white/80" />
          <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-white/80" />
          <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-white/80" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-white/80" />
        </div>

        {/* Scan line animation */}
        <div className="scan-line" />

        {/* River / vegetation scene */}
        <div
          className="relative aspect-video w-full"
          style={{
            background:
              "linear-gradient(160deg, #0d3d36 0%, #1a5c52 35%, #0e3530 55%, #183028 100%)",
          }}
        >
          {/* Atmosphere */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 50% at 50% 65%, rgba(34,197,169,0.3) 0%, transparent 55%), radial-gradient(circle at 25% 38%, rgba(20,50,40,0.85) 0%, transparent 40%), radial-gradient(circle at 75% 55%, rgba(10,30,25,0.7) 0%, transparent 35%)",
            }}
          />

          {/* Water shimmer */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[40%] opacity-20"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(56,189,248,0.15) 6px, rgba(56,189,248,0.15) 7px)",
            }}
          />

          {/* Detection box — Hyacinth (green) */}
          <div className="absolute left-[8%] top-[24%] z-10 h-[26%] w-[42%] rounded-sm border-2 border-[var(--dashboard-teal)] bg-[var(--dashboard-teal)]/10">
            <span className="absolute -top-px left-0 -translate-y-full bg-black/75 px-1.5 py-0.5 font-mono text-[10px] leading-tight text-emerald-200">
              HYACINTH [GREEN] · CONF: 98%
            </span>
            <span className="absolute bottom-0.5 right-1 font-mono text-[9px] text-emerald-300/80">ORGANIC</span>
          </div>

          {/* Detection box — Solid waste 1 (red) */}
          <div className="absolute right-[12%] top-[44%] z-10 h-[20%] w-[26%] rounded-sm border-2 border-[var(--dashboard-alert)] bg-[var(--dashboard-alert)]/10">
            <span className="absolute -top-px left-0 -translate-y-full bg-black/75 px-1.5 py-0.5 font-mono text-[10px] leading-tight text-red-200">
              SOLID WASTE [RED] · CONF: 92%
            </span>
          </div>

          {/* Detection box — Solid waste 2 (smaller) */}
          <div className="absolute left-[20%] top-[52%] z-10 h-[16%] w-[18%] rounded-sm border-2 border-orange-400 bg-orange-400/10">
            <span className="absolute -top-px left-0 -translate-y-full bg-black/75 px-1.5 py-0.5 font-mono text-[10px] leading-tight text-orange-200">
              DEBRIS [MIX] · CONF: 85%
            </span>
          </div>

          {/* HUD top bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 bg-black/65 px-3 py-1.5 font-mono text-[10px] text-white/90 sm:text-[11px]">
            <span className="font-bold text-emerald-400">AI DETECTION: LIVE</span>
            <span className="text-white/50">|</span>
            <span>FPS: 24</span>
            <span className="text-white/50">|</span>
            <span>MARIKINA R.</span>
            <span className="text-white/50">|</span>
            <span className="font-medium">GPS: 14.6302, 121.0965</span>
          </div>

          {/* HUD bottom bar */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 bg-black/65 px-3 py-1.5 font-mono text-[10px] text-white/90 sm:text-[11px]">
            <span>ALT: 55 m AGL</span>
            <span className="text-white/50">|</span>
            <span>GIMBAL: −12°</span>
            <span className="text-white/50">|</span>
            <span>BITRATE: 12.4 Mbps</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              REC
            </span>
          </div>
        </div>

        {/* Legend footer */}
        <div className="flex flex-wrap gap-4 border-t border-white/10 bg-zinc-800 px-4 py-2.5">
          {[
            { color: "border-[var(--dashboard-teal)] bg-[var(--dashboard-teal)]/20", label: "Organic (Hyacinth)" },
            { color: "border-[var(--dashboard-alert)] bg-[var(--dashboard-alert)]/20", label: "Non-organic waste" },
            { color: "border-orange-400 bg-orange-400/20", label: "Mixed debris" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-zinc-300">
              <span className={`h-3 w-4 rounded-sm border ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
