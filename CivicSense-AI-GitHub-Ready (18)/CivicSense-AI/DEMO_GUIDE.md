# CivicSense AI — 5-Minute Hackathon Demonstration Script
**PromptWars x ASTRA | AI for Civic Impact**  
**Presenter Flow:** Principal Architect & Engineering Lead  
**Timing:** Exactly 5:00 Minutes

---

## ⏱️ Live Demonstration Timeline

### 00:00 – 00:30 | The Civic Challenge & Product Vision
- **Speaker Action:** Open [http://localhost:5173](http://localhost:5173).
- **Verbal Pitch:**
  > *"Every monsoon, Indian cities collapse under the weight of damaged roads, knee-deep waterlogging, clogged storm drains, and overflowing waste. Citizens file complaints into a black hole—call centers, Twitter, WhatsApp—receiving duplicate noise, unprioritized hazardous conditions, and zero visibility.*  
  > *This is **CivicSense AI**: an autonomous civic intelligence platform that transforms community complaints into prioritized, explainable, and trackable municipal actions across four connected stages: **CAPTURE &rarr; UNDERSTAND &rarr; REVEAL &rarr; ACT**."*

---

### 00:30 – 01:15 | CAPTURE: Frictionless Citizen Reporting
- **Speaker Action:** Click **"Report an Issue"** (`/report`).
- **Demo Steps:**
  1. Click quick preset button: **📍 Koramangala Sony World Junction**.
  2. In the Title, enter:  
     `"Massive water stagnation near Sony World Signal blocking vehicles"`
  3. In Description, enter:  
     `"Heavy stormwater accumulation. Several two-wheelers slipping and pedestrians cannot cross the 80ft road."`
  4. Click **"Preview AI Intelligence Triage"**:
     - *Show the judges the instant pre-analysis card:* Category predicted as *Waterlogging* with high confidence, factual operational brief synthesized, and urgency scored.
  5. Click **"Submit Complaint to CivicSense AI"**.
  6. **Highlight Output:** The system instantly registers the complaint, generates unique tracking ID (e.g. `CS-2026-XXXXX`), and displays the factual AI brief.
  7. Click the **Copy** button to copy the tracking ID.

---

### 01:15 – 02:15 | UNDERSTAND: Explainable AI & Duplicate Deduplication
- **Speaker Action:** Navigate to **"Command Center"** (`/admin`).
- **Demo Steps:**
  1. Show the **Duplicate Queue KPI** (`3 Potential Duplicates`).
  2. Click on the newly submitted Koramangala complaint in the Operational Complaint Queue.
  3. **Inspect AI Tab:**
     - Point to the **5-Factor Score Breakdown Progress Bars**:
       - Safety Risk (35 pts max)
       - Time Urgency (25 pts max)
       - Community Impact (20 pts max)
       - Repeat Density (10 pts max)
       - Sensitive Zone Proximity (10 pts max)
     - Read the **Explainable Decision Rationale**: Note how it explicitly quotes real triggers rather than an opaque black-box number.
  4. **Inspect Duplicates Tab:**
     - Point to the candidate matched against `CS-2026-KOR01`:
     - *“Matched existing report 'CS-2026-KOR01' in category 'Waterlogging' located 55m away with 94% composite similarity.”*
     - Click **"Confirm Duplicate"**: Notice how it links the record in the database without deleting the citizen's original report.

---

### 02:15 – 03:15 | REVEAL: Geospatial Intelligence & Hotspot Clustering
- **Speaker Action:** Switch to **Geographic Intelligence Map** / **Autonomous Hotspot Briefs** view in the Command Center.
- **Demo Steps:**
  1. Point to the **Leaflet OpenStreetMap**:
     - Markers color-coded by priority: Red (Critical), Orange (High), Yellow (Medium), Green (Low).
     - Click on the red marker near Victoria Hospital: Show popup for `CS-2026-SAF01` (Live electric wire hanging into standing water).
  2. Point to the **Hotspot Overlay Circles**:
     - Show the Koramangala cluster (5 reports: 3 waterlogging, 1 drainage, 1 pothole).
  3. Scroll to the **Autonomous Infrastructure Hotspot Analysis Cards**:
     - Point to **Hotspot HS-1 (80 Feet Road)**.
     - Read the AI Action Brief:  
       *“Concentration of 5 active civic reports detected within 1.0km radius... Pattern shows 3 Waterlogging, accompanied by Drainage and Road Damage. Suggested field investigation: Inspect storm runoff channels and sub-surface drainage network.”*
     - Explain: *“The AI has identified a systemic drainage infrastructure failure rather than treating each pothole or puddle as an isolated accident.”*

---

### 03:15 – 04:15 | ACT: Administrative Workflow & Department Dispatch
- **Speaker Action:** In the Complaint Modal:
- **Demo Steps:**
  1. Select **Assigned Municipal Department**: Choose **Drainage & Stormwater (DRN-OPS)**.
  2. Click **"Assign Department"** &rarr; Notice status automatically moves to `Assigned` and records in the audit history.
  3. In **Update Operational Status**, change to `In Progress`.
  4. In the remarks box, write:  
     `"Field crew deployed with suction pumps to clear arterial drain grates."`
  5. Check **"Visible on Citizen Tracking Portal"**.
  6. Click **"Commit Status Update"**.
  7. Show the **Audit History Tab**: Point to the timestamped immutable log with actor stamps.

---

### 04:15 – 04:45 | Transparent Citizen Tracking Portal
- **Speaker Action:** Click **"Track Complaint"** (`/track`) in the navigation bar.
- **Demo Steps:**
  1. Paste the tracking ID from earlier (or click on `CS-2026-KOR01`).
  2. Click **"Track Progress"**.
  3. **Point out the synchronized citizen experience:**
     - 5-stage progress bar showing `In Progress` pulsing in active blue.
     - Responsible Division clearly displayed: *Drainage & Stormwater*.
     - The public-safe operational brief is visible.
     - The remark entered by the administrator moments ago (*"Field crew deployed with suction pumps..."*) is immediately visible with its exact timestamp.
     - Private administrator internal notes remain hidden.

---

### 04:45 – 05:00 | Engineering Truth, Boundaries & Impact
- **Speaker Closing:**
  > *"Everything you have just witnessed is real. The database is persistent SQLite. The statistics are live queries. The AI uses real mathematical TF-IDF vectorization, Haversine geographic geometry, and explainable 5-factor scoring.  
  > CivicSense AI proves that AI for civic impact isn't about generating generic chatbot responses—it's about turning fragmented public complaints into verifiable, autonomous, and accountable urban action. Thank you."*

---

## 📋 Emergency Backup Demonstration Tracking IDs

| ID | Category | Status | Primary Feature Highlight |
|---|---|---|---|
| `CS-2026-SAF01` | Public Safety | Under Review | **Top Critical Score (88/100)**: Live wire in hospital water |
| `CS-2026-KOR01` | Waterlogging | In Progress | **Active Spatial Cluster**: Koramangala 80ft Road hotspot |
| `CS-2026-KOR02` | Waterlogging | Under Review | **Duplicate Candidate**: Sub-60m proximity to KOR01 |
| `CS-2026-WHI01` | Water Supply | In Progress | **Infrastructure Burst**: Whitefield ITPL feeder pipeline |
| `CS-2026-JAY01` | Road Damage | Resolved | **Completed Resolution**: Verified pavement restoration |
