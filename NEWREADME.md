# BAGWIS — UAV River Monitoring Dashboard

**Blockage and Aerial Geospatial Waterway Intelligence System**  
Marikina River UAV obstruction monitoring dashboard for RPA, CEMO, and MDRRMO.

> PUP Computer Engineering Thesis — Bañez, Cosare, Gan, Mistal — May 2026

---

## Overview

BAGWIS is a real-time UAV river monitoring system for the 2 km Marikina River corridor.
A multirotor UAV equipped with an RGB + NIR camera streams live video to an Orange Pi 5
ground station, which runs YOLO26n inference on its NPU to detect five obstruction classes,
computes geospatial metrics, and pushes results to this web dashboard via WebSocket.

The dashboard is a **Next.js static app** served from the Orange Pi 5 over the local
network — no internet connection required.

---

## System Architecture
