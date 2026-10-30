# CivicSense AI — Autonomous Civic Intelligence Platform
> **Tagline:** From Complaints to Intelligent Action  
> **Hackathon:** PromptWars x ASTRA | AI for Civic Impact  
> **Development Target:** Fully Integrated, Working End-to-End Enterprise Civic Platform

---

## 🏛️ Overview

**CivicSense AI** bridges the operational divide between public citizen reports and responsive municipal remediation. In modern metropolitan centers, citizen grievances regarding road craters, waterlogging, waste heaps, dark streetlights, and ruptured water mains arrive through disjointed, chaotic channels. Municipal authorities face duplicate overload, unprioritized hazardous conditions, and triage paralysis, leaving citizens in the dark.

CivicSense AI solves this through a connected 4-stage operational paradigm:
1. **CAPTURE:** Frictionless, mobile-first citizen reporting with geocoding and instant tracking ID generation (`CS-2026-XXXXX`).
2. **UNDERSTAND:** A hybrid AI engine delivering category prediction, factual summarization, multi-factor duplicate candidate detection, and an explainable 5-factor priority score (0–100).
3. **REVEAL:** Geospatial Leaflet and OpenStreetMap intelligence with autonomous spatial clustering (DBSCAN / distance radius) that identifies systemic infrastructure hotspots and synthesizes action briefs.
4. **ACT:** Administrative Command Center managing department allocation, priority overrides with justification, status progression audit trails, and transparent citizen self-service tracking.

---

## ⚡ Quick Start Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm (tested on Node v24.19 / npm 11.17)

### 1. Database Initialization & Seeding
Initialize SQLite tables and populate 40 realistic synthetic complaints around Bengaluru:
```bash
# Seed 40 complaints with deliberate duplicates, hotspots, and critical cases
python scripts/seed_data.py
```

### 2. Start the Backend API
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger / OpenAPI Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- API Health Status: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 3. Start the Frontend Application
```bash
cd frontend
npm run dev
```
- Open in your browser: [http://localhost:5173](http://localhost:5173)

### 4. Run Automated Acceptance Tests
Verify all 10 end-to-end integration and lifecycle tests:
```bash
python backend/tests/run_tests.py
```

---

## 🧪 Verified Acceptance Tests (10 / 10 Passing)

| Test ID | Objective | Status | Validation Output |
|---|---|---|---|
| **TEST 1** | Submit Waterlogging Report | ✅ PASSED | Generated tracking ID `CS-2026-XXXXX` & persisted |
| **TEST 2** | AI Triage & Prioritization | ✅ PASSED | Category, 0–100 score, factual summary stored |
| **TEST 3** | Multi-Factor Duplicate Detection | ✅ PASSED | Sub-50m match detected (94% composite similarity) |
| **TEST 4** | Dashboard Live Telemetry | ✅ PASSED | Real-time counts computed from SQLite database |
| **TEST 5** | Geospatial Hotspot Clusters | ✅ PASSED | 5 active spatial clusters detected & mapped |
| **TEST 6** | Department Assignment | ✅ PASSED | Allocated to Drainage division & persisted |
| **TEST 7** | Status Progression Audit | ✅ PASSED | Transitioned to *In Progress* with immutable audit log |
| **TEST 8** | Transparent Citizen Tracking | ✅ PASSED | Public timeline synchronized on tracking page |
| **TEST 9** | Data Persistence Verification | ✅ PASSED | Entity re-queried across independent sessions |
| **TEST 10** | Server-Side Validation | ✅ PASSED | Invalid payloads rejected with clean HTTP 400 |

---

## 🔑 Administrative Demo Credentials
- **Username:** `admin`
- **Password:** `CivicAdmin2026!`
- *Prefilled in UI for rapid single-click hackathon evaluation.*

---

## 🏗️ Repository Layout
```
civicsense-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application & lifespan startup
│   │   ├── core/config.py       # Configuration & directories
│   │   ├── database/session.py  # SQLAlchemy engine & session factory
│   │   ├── models/              # Complaint, Department, StatusHistory, Duplicates, Admin
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── ai/                  # Classifier, Summarizer, Duplicate, Priority, Clustering
│   │   └── routes/              # Complaints, Dashboard, Departments, AI, Auth
│   ├── tests/
│   │   ├── run_tests.py         # Automated acceptance test runner
│   │   └── test_pipeline.py     # Pytest test cases
│   └── requirements.txt         # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Footer, ComplaintMap, ComplaintDetailModal
│   │   ├── pages/               # LandingPage, ReportPage, TrackingPage, AdminDashboard, LoginPage
│   │   ├── services/api.ts      # Typed REST client
│   │   ├── types/index.ts       # TypeScript domain models
│   │   └── App.tsx              # Router setup
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   └── seed_data.py             # Idempotent 40-record Bengaluru seed script
├── ARCHITECTURE.md              # Detailed technical design & formula specifications
├── LIMITATIONS.md               # Production roadmap, constraints, & AI boundaries
├── DEMO_GUIDE.md                # 5-minute hackathon presentation script
├── .env.example                 # Environment configuration template
└── README.md                    # Project manual
```
