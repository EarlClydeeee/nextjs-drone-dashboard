# UAV River Monitoring — Web Dashboard

A real-time ground-station dashboard for a UAV-based aquatic invasive species and solid waste detection system deployed over the Marikina River. The system uses a YOLO26n deep-learning model running on an Orange Pi 5 edge computer to detect and classify targets, calculate NDVI and biomass density, and stream live results to this web dashboard via WebSocket.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Repository Structure](#4-repository-structure)
5. [Frontend Setup (Next.js)](#5-frontend-setup-nextjs)
6. [Backend Setup (FastAPI)](#6-backend-setup-fastapi)
7. [Orange Pi 5 Integration](#7-orange-pi-5-integration)
8. [Running the Full System](#8-running-the-full-system)
9. [API Reference](#9-api-reference)
10. [WebSocket Protocol](#10-websocket-protocol)
11. [Database Schema](#11-database-schema)
12. [Authentication](#12-authentication)
13. [Export Formats](#13-export-formats)
14. [Dashboard Panels](#14-dashboard-panels)
15. [Demo / Offline Mode](#15-demo--offline-mode)
16. [Deployment](#16-deployment)
17. [Environment Variables](#17-environment-variables)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. System Overview

The detection targets are:

| Code | Target |
|------|--------|
| `hyacinth` | *Eichhornia crassipes* (Water Hyacinth) |
| `pet` | PET plastic bottles |
| `soft-plastic` | Soft / film plastic |
| `eps` | Expanded Polystyrene (styrofoam) |
| `wood` | Driftwood / floating debris |

Per detection, the system records:
- GPS coordinates (lat/lng) from drone telemetry
- YOLO confidence score
- NDVI value (computed from RGB + NIR channels)
- Biomass density (kg/m²)
- Obstruction area (m²)
- Drone altitude, battery %, waypoint progress, and flight mode

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  UAV (Drone)                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Orange Pi 5                                             │  │
│  │  ├── RGB + NIR Camera Payload                           │  │
│  │  ├── Image Preprocessing (OpenCV)                       │  │
│  │  ├── YOLO26n Inference (5-class detection)              │  │
│  │  ├── NDVI Calculation  (NIR−Red / NIR+Red)              │  │
│  │  └── Biomass Density + Obstruction Area (OpenCV)        │  │
│  └──────────────────┬───────────────────────────────────────┘  │
└─────────────────────│───────────────────────────────────────────┘
                      │ HTTP POST /ingest
                      │ (local WiFi / USB tether)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Ground Station Laptop                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI Server  :8000                                   │  │
│  │  ├── POST /ingest   ← Orange Pi 5                       │  │
│  │  ├── GET  /missions                                      │  │
│  │  ├── GET  /detections                                    │  │
│  │  ├── GET  /export/csv                                    │  │
│  │  ├── GET  /export/kml                                    │  │
│  │  ├── POST /auth/login                                    │  │
│  │  └── WS   /ws       → Browser                           │  │
│  │                                                          │  │
│  │  SQLite DB  (detections.db)                             │  │
│  │  ├── missions table                                      │  │
│  │  └── detections table                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────│───────────────────────────────────────────┘
                      │ WebSocket /ws  (live push)
                      │ REST GET  (historical queries + export)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Browser — Next.js Dashboard  :3000                             │
│  ├── MissionStatusBar    (altitude, GPS, battery, waypoint)    │
│  ├── DetectionSummaryPanel  (counts per category)              │
│  ├── MapHeatmapPanel     (KDE · Heatmap · Orthomosaic modes)   │
│  ├── NDVIBiomassPanel    (NDVI gauge + biomass metrics)        │
│  ├── DroneViewFrame      (live AI detection feed)              │
│  ├── MetricsSidebar      (selected-point detail)               │
│  ├── DetectionLogTable   (sortable detection log)              │
│  └── Export Panel        (CSV · KML download)                  │
└─────────────────────────────────────────────────────────────────┘
```

### Network topology (field deployment)

```
[Orange Pi 5] ──WiFi──► [Ground Laptop Hotspot]
[Browser Laptop] ──WiFi──► [Ground Laptop Hotspot]
```

Both the drone and the viewing browser connect to a portable WiFi hotspot running on (or connected to) the ground station laptop. No internet connection is required during a flight.

---

## 3. Prerequisites

### Ground Station Laptop

| Requirement | Version |
|-------------|---------|
| Node.js | 20 or higher |
| npm | 10 or higher |
| Python | 3.11 or higher |
| pip | latest |

### Orange Pi 5 (on-drone)

| Requirement | Notes |
|-------------|-------|
| Python | 3.10+ |
| `requests` library | `pip install requests` |
| Existing YOLO26n script | NDVI and biomass already computed |

---

## 4. Repository Structure

```
nextjs-drone-dashboard/
│
├── app/                              # Next.js app directory
│   ├── page.tsx                      # Home page → renders DashboardClient
│   ├── layout.tsx                    # Root layout, fonts, metadata
│   ├── globals.css                   # Design tokens + animations
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── auth/
│   │   └── AuthContext.tsx           # JWT auth context + provider
│   ├── hooks/
│   │   └── useDroneSocket.ts         # WebSocket hook (live mission state)
│   ├── images/
│   │   ├── heatmap.png               # Map background image
│   │   └── aidetection.png           # AI detection frame background
│   └── components/dashboard/
│       ├── types.ts                  # Shared TypeScript types
│       ├── heatmap-data.ts           # Mock data (offline/demo fallback)
│       ├── DashboardClient.tsx       # Root dashboard orchestrator
│       ├── MissionStatusBar.tsx      # Top telemetry bar
│       ├── MapHeatmapPanel.tsx       # Interactive map (KDE/Heatmap/Ortho)
│       ├── DetectionSummaryPanel.tsx # Per-category detection counts
│       ├── NDVIBiomassPanel.tsx      # NDVI gauge + biomass metrics
│       ├── DroneViewFrame.tsx        # Live AI detection viewport
│       ├── HeatmapMetricCards.tsx    # Per-choke-point cards + export CTA
│       ├── MetricsSidebar.tsx        # Selected point detail sidebar
│       └── DetectionLogTable.tsx     # Sortable detection log table
│
├── backend/                          # FastAPI ground station server
│   ├── main.py                       # App entry point, CORS, router mounts
│   ├── routers/
│   │   ├── ingest.py                 # POST /ingest
│   │   ├── missions.py               # GET /missions, GET /missions/:id
│   │   ├── detections.py             # GET /detections
│   │   ├── export.py                 # GET /export/csv, GET /export/kml
│   │   └── auth.py                   # POST /auth/login
│   ├── ws/
│   │   └── hub.py                    # WebSocket connection manager
│   ├── models/
│   │   ├── db.py                     # SQLAlchemy engine + session factory
│   │   ├── mission.py                # Mission ORM model
│   │   ├── detection.py              # Detection ORM model
│   │   └── user.py                   # User ORM model (seeded)
│   ├── schemas/
│   │   ├── ingest.py                 # Pydantic: DetectionPayload (Orange Pi input)
│   │   └── ws_message.py             # Pydantic: WsMessage (browser output)
│   ├── auth/
│   │   └── jwt.py                    # JWT encode/decode + role dependency
│   ├── seed.py                       # Seed default users into DB
│   ├── requirements.txt
│   └── .env.example
│
├── next.config.ts
├── package.json
├── tsconfig.json
├── amplify.yml                       # AWS Amplify CI config
├── deploy-s3.sh                      # Manual S3 + CloudFront deploy
└── README.md
```

---

## 5. Frontend Setup (Next.js)

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
```

The output is in the `out/` folder (static export for S3/Amplify).

### Environment variables

Create a `.env.local` file in the project root:

```env
# URL of the FastAPI backend (ground station laptop)
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket URL of the FastAPI backend
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

During a field deployment, replace `localhost` with the ground laptop's local IP address (e.g. `192.168.1.100`).

---

## 6. Backend Setup (FastAPI)

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

`requirements.txt` includes:

```
fastapi
uvicorn[standard]
sqlalchemy
alembic
python-jose[cryptography]
bcrypt
python-dotenv
```

### Configure environment

Copy `.env.example` to `.env` and fill in the values:

```env
# Secret key for JWT signing — change before deployment
SECRET_KEY=change-this-to-a-random-secret

# Shared API key for Orange Pi 5 ingest endpoint
DRONE_API_KEY=drone-secret-key

# SQLite database file path
DATABASE_URL=sqlite:///./detections.db

# JWT token expiry in minutes
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

### Initialise the database and seed users

```bash
cd backend
python seed.py
```

This creates `detections.db` and inserts two default users:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | `admin` |
| `viewer` | `viewer123` | `viewer` |

> Change these passwords before any stakeholder demonstration.

### Start the server

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `--host 0.0.0.0` flag makes the server accessible from other devices on the same network (required for the drone to POST data).

The interactive API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 7. Orange Pi 5 Integration

Add the following snippet to the end of the existing YOLO26n inference loop on the Orange Pi 5. It fires after each frame where a target is detected, using the values already computed by the detection pipeline.

```python
import requests

GROUND_STATION_URL = "http://192.168.1.100:8000"  # replace with actual laptop IP
DRONE_API_KEY = "drone-secret-key"                 # must match backend .env

def send_detection(
    mission_id: str,
    lat: float,
    lng: float,
    category: str,          # "hyacinth" | "pet" | "soft-plastic" | "eps" | "wood"
    confidence: float,      # 0.0 – 1.0
    ndvi: float,            # -1.0 – 1.0
    biomass_density: float, # kg/m²
    obstruction_area: float,# m²
    altitude_m: float,
    battery_pct: float,
    waypoint_current: int,
    waypoint_total: int,
    flight_mode: str        # "AUTO" | "RTL" | "HOLD" | "MANUAL"
):
    payload = {
        "mission_id": mission_id,
        "lat": lat,
        "lng": lng,
        "category": category,
        "confidence": confidence,
        "ndvi": ndvi,
        "biomass_density": biomass_density,
        "obstruction_area_m2": obstruction_area,
        "altitude_m": altitude_m,
        "battery_pct": battery_pct,
        "waypoint_current": waypoint_current,
        "waypoint_total": waypoint_total,
        "flight_mode": flight_mode,
    }
    try:
        requests.post(
            f"{GROUND_STATION_URL}/ingest",
            json=payload,
            headers={"X-Api-Key": DRONE_API_KEY},
            timeout=2  # non-blocking — do not stall inference loop
        )
    except requests.exceptions.RequestException:
        pass  # silently skip if ground station is unreachable
```

### How to find the ground laptop's IP

On the ground laptop:

```bash
# Windows
ipconfig

# Linux / macOS
ip addr show
```

Look for the IP on the WiFi interface (e.g. `192.168.x.x`).

### Telemetry-only frames (no target detected)

When YOLO detects no target but you still want to stream telemetry (altitude, battery, GPS) to the dashboard, POST with `category` set to `null` and `confidence` set to `0`. The backend will skip creating a detection row but will still broadcast the telemetry via WebSocket.

---

## 8. Running the Full System

### Step-by-step field checklist

1. **Ground laptop** — connect to the portable WiFi hotspot.
2. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
3. Start the frontend (or open the pre-built `out/index.html`):
   ```bash
   npm run dev
   # OR serve the static build:
   npx serve out -p 3000
   ```
4. Open the dashboard in a browser: `http://localhost:3000`
5. Log in with your credentials.
6. **Orange Pi 5** — connect to the same WiFi hotspot.
7. Confirm the ground laptop IP matches `GROUND_STATION_URL` in the drone script.
8. Begin the UAV mission — detections will appear live on the dashboard.

### Ports summary

| Service | Port | Accessible from |
|---------|------|-----------------|
| Next.js dashboard | 3000 | Ground laptop browser |
| FastAPI backend | 8000 | Drone (POST) + browser (WS + REST) |
| SQLite DB | — | Local file on ground laptop |

---

## 9. API Reference

All endpoints are prefixed with `http://<ground-laptop-ip>:8000`.

---

### POST `/ingest`

Receives a detection payload from the Orange Pi 5. Persists to SQLite and broadcasts a WebSocket message to all connected browsers.

**Auth:** `X-Api-Key: <DRONE_API_KEY>` header

**Request body:**

```json
{
  "mission_id": "flight-001",
  "lat": 14.6302,
  "lng": 121.0965,
  "category": "hyacinth",
  "confidence": 0.91,
  "ndvi": 0.63,
  "biomass_density": 4.2,
  "obstruction_area_m2": 85.0,
  "altitude_m": 55,
  "battery_pct": 72,
  "waypoint_current": 4,
  "waypoint_total": 12,
  "flight_mode": "AUTO"
}
```

**Response:** `201 Created`

```json
{ "detection_id": "abc123", "broadcasted": true }
```

---

### GET `/missions`

Returns all flight missions ordered by most recent.

**Auth:** Bearer JWT

**Response:**

```json
[
  {
    "id": "flight-001",
    "started_at": "2026-05-29T08:00:00Z",
    "ended_at": null,
    "total_waypoints": 12,
    "flight_mode": "AUTO",
    "detection_count": 47
  }
]
```

---

### GET `/missions/:id`

Returns a single mission with aggregated detection statistics.

**Auth:** Bearer JWT

**Response:**

```json
{
  "id": "flight-001",
  "started_at": "2026-05-29T08:00:00Z",
  "ended_at": "2026-05-29T09:15:00Z",
  "total_waypoints": 12,
  "detection_count": 47,
  "by_category": {
    "hyacinth": 28,
    "pet": 9,
    "soft-plastic": 5,
    "eps": 3,
    "wood": 2
  },
  "avg_ndvi": 0.54,
  "total_obstruction_area_m2": 1240.0,
  "avg_biomass_density": 3.8
}
```

---

### GET `/detections`

Returns detection rows. Supports query parameters for filtering.

**Auth:** Bearer JWT

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `mission_id` | string | Filter by mission |
| `category` | string | Filter by category |
| `from` | ISO datetime | Start of time range |
| `to` | ISO datetime | End of time range |
| `limit` | int | Max rows (default 500) |
| `offset` | int | Pagination offset |

**Response:**

```json
[
  {
    "id": "det-001",
    "mission_id": "flight-001",
    "timestamp": "2026-05-29T08:12:34Z",
    "lat": 14.6302,
    "lng": 121.0965,
    "category": "hyacinth",
    "confidence": 0.91,
    "ndvi": 0.63,
    "biomass_density": 4.2,
    "obstruction_area_m2": 85.0
  }
]
```

---

### GET `/export/csv`

Downloads a CSV file of all detections for a given mission.

**Auth:** Bearer JWT (admin role required)

**Query parameters:** `mission_id` (required)

**Response:** `text/csv` file attachment

```csv
id,mission_id,timestamp,lat,lng,category,confidence,ndvi,biomass_density,obstruction_area_m2
det-001,flight-001,2026-05-29T08:12:34Z,14.6302,121.0965,hyacinth,0.91,0.63,4.2,85.0
```

---

### GET `/export/kml`

Downloads a KML file for import into Google Earth or GIS tools. Each detection becomes a `<Placemark>` with category, NDVI, and biomass in the description.

**Auth:** Bearer JWT (admin role required)

**Query parameters:** `mission_id` (required)

**Response:** `application/vnd.google-earth.kml+xml` file attachment

---

### POST `/auth/login`

Returns a JWT access token.

**Request body:**

```json
{ "username": "admin", "password": "admin123" }
```

**Response:**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "role": "admin",
  "expires_in": 28800
}
```

---

## 10. WebSocket Protocol

Connect to: `ws://<ground-laptop-ip>:8000/ws?token=<JWT>`

The server pushes messages to the browser in real time whenever `/ingest` receives a payload. There is no polling — the browser is a passive subscriber.

### Message types

#### `telemetry` — emitted on every `/ingest` call

```json
{
  "type": "telemetry",
  "payload": {
    "mission_id": "flight-001",
    "altitude_m": 55,
    "gps_lat": 14.6302,
    "gps_lng": 121.0965,
    "battery_pct": 72,
    "waypoint_current": 4,
    "waypoint_total": 12,
    "flight_mode": "AUTO",
    "elapsed_seconds": 740
  }
}
```

#### `detection` — emitted only when a target is detected (category is not null)

```json
{
  "type": "detection",
  "payload": {
    "id": "det-001",
    "mission_id": "flight-001",
    "timestamp": "2026-05-29T08:12:34Z",
    "lat": 14.6302,
    "lng": 121.0965,
    "category": "hyacinth",
    "confidence": 0.91,
    "ndvi": 0.63,
    "biomass_density": 4.2,
    "obstruction_area_m2": 85.0
  }
}
```

#### `mission_end` — emitted when the drone posts `flight_mode: "RTL"`

```json
{
  "type": "mission_end",
  "payload": {}
}
```

### Frontend hook usage

```typescript
import { useDroneSocket } from "@/hooks/useDroneSocket";

const { missionStatus, detectionLog, isConnected } = useDroneSocket();
```

| Return value | Type | Description |
|---|---|---|
| `missionStatus` | `MissionStatus \| null` | Latest telemetry from drone |
| `detectionLog` | `DetectionEntry[]` | All detections received this session |
| `isConnected` | `boolean` | WebSocket connection state |

---

## 11. Database Schema

The SQLite database (`detections.db`) has three tables.

### `missions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | Primary key (e.g. `flight-001`) |
| `started_at` | DATETIME | Set on first ingest for this mission_id |
| `ended_at` | DATETIME | Set when flight_mode = RTL |
| `total_waypoints` | INTEGER | From ingest payload |
| `flight_mode` | TEXT | Last known flight mode |

### `detections`

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | UUID primary key |
| `mission_id` | TEXT | Foreign key → `missions.id` |
| `timestamp` | DATETIME | Server receipt time (UTC) |
| `lat` | REAL | GPS latitude |
| `lng` | REAL | GPS longitude |
| `category` | TEXT | One of the 5 detection classes |
| `confidence` | REAL | 0.0 – 1.0 |
| `ndvi` | REAL | −1.0 – 1.0 |
| `biomass_density` | REAL | kg/m² |
| `obstruction_area_m2` | REAL | m² |

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Auto-increment primary key |
| `username` | TEXT | Unique |
| `password_hash` | TEXT | bcrypt hash |
| `role` | TEXT | `admin` or `viewer` |

---

## 12. Authentication

The system uses JWT (JSON Web Tokens) for browser authentication.

- **Login:** `POST /auth/login` with username + password → returns access token
- **Token storage:** Stored in `localStorage` on the browser
- **Token lifetime:** 8 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Protected routes:** The dashboard page redirects to `/login` if no valid token is found
- **Role enforcement:**
  - `admin` — full access including export endpoints
  - `viewer` — read-only; export buttons are hidden in the UI

### WebSocket authentication

The JWT is appended as a query parameter when connecting:

```
ws://localhost:8000/ws?token=eyJ...
```

The server validates the token before accepting the connection. Unauthenticated connections are rejected with `4001 Unauthorized`.

### Drone authentication

The Orange Pi 5 uses a static shared API key (`X-Api-Key` header) rather than JWT. This avoids the complexity of token refresh on embedded hardware.

---

## 13. Export Formats

### CSV

Downloaded via `GET /export/csv?mission_id=flight-001`.

Columns: `id, mission_id, timestamp, lat, lng, category, confidence, ndvi, biomass_density, obstruction_area_m2`

Use cases:
- Import into Excel / Google Sheets for post-mission analysis
- Academic reporting

### KML

Downloaded via `GET /export/kml?mission_id=flight-001`.

Each detection is a `<Placemark>` at its GPS coordinates. The `<description>` includes category, confidence, NDVI, and biomass density. The icon colour is set per category:

| Category | KML Icon Colour |
|----------|-----------------|
| hyacinth | Green |
| pet | Red |
| soft-plastic | Orange |
| eps | Yellow |
| wood | Brown |

Use cases:
- Open in Google Earth for spatial review
- Import into QGIS or ArcGIS for the Marikina CEMO

---

## 14. Dashboard Panels

| Panel | Location | Data source |
|-------|----------|-------------|
| `MissionStatusBar` | Top bar | `useDroneSocket` → `missionStatus` |
| `DetectionSummaryPanel` | Left column, Section 1 | `useDroneSocket` → `detectionLog` counts |
| `MapHeatmapPanel` | Centre, Section 1 | `detectionLog` coordinates + heatmap image |
| `NDVIBiomassPanel` | Right column, Section 1 | `detectionLog` → latest NDVI + biomass |
| `DroneViewFrame` | Left, Section 2 | Static `aidetection.png` + bounding box overlays |
| `MetricsSidebar` | Right, Section 2 | Selected `HeatmapPoint` detail |
| `DetectionLogTable` | Section 3 | `detectionLog` — sortable by any column |
| Export buttons | Section 3 | `GET /export/csv` and `GET /export/kml` |

### Map modes (MapHeatmapPanel)

| Mode | Description |
|------|-------------|
| `heatmap` | KDE hotspot overlay on map background image |
| `kde` | Category-coloured hotspots (one colour per detection class) |
| `orthomosaic` | SVG segmentation overlay + legend |

---

## 15. Demo / Offline Mode

When the WebSocket is disconnected (no backend running), the dashboard automatically falls back to static mock data defined in `app/components/dashboard/heatmap-data.ts`.

This allows the dashboard to be presented at venues without the physical drone or ground station. The mock data includes:
- 3 choke-point heatmap entries
- 10 sample detection log rows across all 5 categories
- A simulated mission status (altitude 55 m, battery 72%, waypoint 4/12)

To force offline mode even when a backend is available, set:

```env
NEXT_PUBLIC_WS_URL=
```

---

## 16. Deployment

### Local field deployment (recommended)

```bash
# Build the static frontend
npm run build

# Serve the static build on the ground laptop
npx serve out -p 3000

# Start the backend
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

Access the dashboard on the ground laptop at `http://localhost:3000`.
Other devices on the same WiFi network can access it at `http://<ground-laptop-ip>:3000`.

### AWS (optional — for remote stakeholder access)

The project includes `amplify.yml` and `deploy-s3.sh` for AWS Amplify / S3 + CloudFront hosting of the static frontend. When using cloud hosting, update the environment variables to point to the cloud backend URL instead of `localhost`.

---

## 17. Environment Variables

### Frontend (`.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI base URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000/ws` | WebSocket URL |

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | — | JWT signing secret (required) |
| `DRONE_API_KEY` | — | Shared key for Orange Pi ingest (required) |
| `DATABASE_URL` | `sqlite:///./detections.db` | SQLAlchemy DB URL |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | JWT lifetime in minutes |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |

---

## 18. Troubleshooting

### Dashboard shows no live data

- Confirm FastAPI is running: open `http://<ground-laptop-ip>:8000/docs`
- Check `NEXT_PUBLIC_WS_URL` matches the backend host
- Verify both devices are on the same WiFi network
- Check the browser console for WebSocket errors

### Orange Pi 5 detections not appearing

- Ping the ground laptop from the Orange Pi 5: `ping 192.168.1.100`
- Check `GROUND_STATION_URL` in the drone script matches the laptop IP
- Confirm `DRONE_API_KEY` matches the backend `.env`
- Check the FastAPI logs for `422 Unprocessable Entity` (payload shape mismatch)

### Login fails

- Confirm the database was seeded: `cd backend && python seed.py`
- Check `SECRET_KEY` is set in `backend/.env`

### Export buttons do nothing

- Export requires `admin` role — log in as `admin`
- Check that `NEXT_PUBLIC_API_URL` is set correctly

### Database is empty after a flight

- Confirm the backend was running with `--host 0.0.0.0` (not `127.0.0.1`)
- Check `detections.db` exists in the `backend/` folder

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | SQLite via SQLAlchemy |
| Auth | JWT (`python-jose`), bcrypt |
| Real-time | WebSocket (FastAPI native) |
| On-drone | Python, OpenCV, YOLO26n, `requests` |
| Hosting (optional) | AWS S3 + CloudFront (frontend), EC2 (backend) |
