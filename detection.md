
---

## Detection Classes

| Class ID | Category | Code key | Metrics |
|---|---|---|---|
| 0 | Water hyacinth | `hyacinth` | Area m², Biomass kg, RWOR % |
| 1 | PET / rigid plastics | `pet` | Area m², Volume m³, Trucks, RWOR % |
| 2 | Soft plastics / nylon | `soft-plastic` | Area m², Volume m³, Trucks, RWOR % |
| 3 | Styrofoam / EPS | `eps` | Area m², Volume m³, Trucks, RWOR % |
| 4 | Organic debris | `wood` | Area m², Volume m³, Trucks, RWOR % |

> Wet biomass (kg) is computed **only for hyacinth** — not for inorganic classes.

---

## Dashboard Sections

**Section 1 — Overall Map**
Interactive Leaflet.js map of the 2 km river corridor. Live drone position marker
updates from WebSocket telemetry. Detection pins appear per category color as the
UAV flies.

**Section 2 Left — AI Detection Feed**
Live MJPEG video stream from Orange Pi 5 (`/stream.mjpeg`). YOLO bounding boxes
overlaid in real time showing class label and confidence. Falls back to static
`aidetection.png` when no drone is connected.

**Section 2 Right — Map + KDE Risk Heatmap**
Toggles between Orthomosaic view and KDE Risk Heatmap. The heatmap uses
`leaflet-heat` to render a 2D kernel density layer weighted by obstruction area
as detections stream in.

**Section 3 — Metric Cards**
Per-choke-point analytical output cards showing:
- Surface area (m²), Volume (m³), Estimated truck loads
- Wet biomass kg (hyacinth only)
- River Width Obstruction Ratio — RWOR (%)
- Export KML / Export CSV buttons

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Maps | Leaflet.js, react-leaflet, leaflet-heat |
| Real-time | Native WebSocket (`useDroneSocket` hook) |
| Backend | FastAPI (Python), SQLite via aiosqlite |
| Video stream | MJPEG over HTTP (local network) |
| Build output | Static export (`next build`) |
| Edge inference | YOLO26n on Orange Pi 5 NPU (RK3588S) |

---

## Hardware

| Device | Role |
|---|---|
| Raspberry Pi Zero 2W | On drone — H.264 video relay via 5.8 GHz Wi-Fi |
| Orange Pi 5 (RK3588S) | Ground station — NPU inference, FastAPI, dashboard host |
| SpeedyBee F405 | Flight controller |
| Matek M10Q | GPS module |
| Raspberry Pi NoIR Camera | RGB + NIR imaging |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Development (mock data mode)

```bash
npm install
npm run dev