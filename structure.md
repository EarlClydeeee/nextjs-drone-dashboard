app/
├── page.tsx                        # Entry point → DashboardClient
├── layout.tsx                      # Root layout, fonts, metadata
├── globals.css                     # Design tokens, animations
├── images/
│   ├── aidetection.png             # Fallback for detection feed
│   └── heatmap.png                 # Fallback for heatmap overlay
└── components/dashboard/
    ├── DashboardClient.tsx         # Main shell, owns detections + missionStatus state
    ├── OverallMapPanel.tsx         # Section 1 — Leaflet map
    ├── DroneViewFrame.tsx          # Section 2 left — MJPEG + detection overlay
    ├── MapHeatmapPanel.tsx         # Section 2 right — Leaflet + KDE heatmap
    ├── HeatmapMetricCards.tsx      # Section 3 — metric cards + export
    ├── heatmap-data.ts             # Mock fallback data
    └── types.ts                    # DetectionEntry, MissionStatus, WsMessage

hooks/
└── useDroneSocket.ts               # WebSocket hook with reconnect + mock fallback

backend/                            # FastAPI (Orange Pi 5)
├── main.py                         # App entry, static file mount
├── routers/
│   ├── ingest.py                   # POST /ingest
│   ├── ws.py                       # WebSocket /ws
│   ├── missions.py                 # GET /missions /detections
│   ├── export.py                   # GET /export/csv /export/kml
│   └── stream.py                   # GET /stream.mjpeg
└── db.py                           # SQLite schema + aiosqlite helpers

docs/
└── MANUSCRIPT-AI-CONTEXT.md       # Thesis ↔ code mapping for AI agents