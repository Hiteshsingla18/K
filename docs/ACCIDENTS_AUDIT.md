# CoalGuard AI — Accidents & Safety Statistics Module Audit

**Repository:** Hiteshsingla18/coalguard-ai  
**Branch:** `feat/accidents-statistics`  
**Date:** September 19, 2026  
**Auditor:** Antigravity AI  

---

## 1. Source Code & Architecture Inventory (`src/`)

### 1.1 Navigation & Routing Architecture
- **Router Pattern:** Single-page application using HTML5 history API (`window.history.pushState` and `popstate` listeners in `App.tsx`).
- **Primary Routes:**
  - `/` — National Role-Based Login Gateway (`AuthGateway.tsx`)
  - `/command` — Directorate General of Mines Surveillance Command Center (`GovNavType`: `overview`, `explorer`, `evidence`, `citizen`, `risk`)
  - `/operator` — Colliery Operator Desk (`OperatorNavTab`: `notice_response`, `lease_map`, `compliance_history`, `workforce_attendance`)
  - `/citizen` — Citizen Environmental Vigilance Portal
  - `/officer` — Mine Safety Officer Field Portal
  - `/labour` — Colliery Labour Mobile App
- **Integration Strategy:** Extend `GovNavType` with `'accidents'` and `OperatorNavTab` with `'accidents_safety'` / `'accidents_reporting'`.

### 1.2 Authentication & Role-Based Access Control
- **Context Provider:** `AuthContext.tsx` providing `useAuth()`.
- **Role Hierarchy:**
  - `gov`: DGMS / Ministry of Coal Officials (Full national visibility, enquiry actions, statutory recommendations)
  - `operator`: Mine Manager / Safety Officer (Colliery-scoped reports, rebuttal desk, mine benchmarking)
  - `officer`: Field Safety Officer
  - `labour`: Mine Worker / Labourer
  - `citizen`: Public user (Aggregate stats only, no PII/narratives)
- **Role Gating:** Enforced via `<AuthGuard requiredRole="...">`.

### 1.3 Shared State Management & In-Memory Sync
- **State Store:** Managed centrally in `App.tsx` and context providers.
- **Service Layer:** `coalGuardService.ts` provides mock API wrappers and local state persistence.
- **Offline / Subterranean Mode:** Uses `mutationQueue: OfflineMutation[]` with unique `idempotencyKey` strings and `localUuid` generation to simulate subterranean offline mode and sync with central servers.

### 1.4 Domain Entity Identifiers & Mine Registry Linkages
All accident records MUST link directly to existing `mine_id`s in `MINES_DATA`:
- `MIN-4492-R`: Rajmahal OCP (ECL, Jharkhand, Rajmahal Basin)
- `MIN-3108-J`: Jharia Kujama Colliery (BCCL, Jharkhand, Damodar Valley Basin)
- `MIN-7120-N`: North Karanpura Megamine (CCL, Jharkhand, Damodar Valley Basin)
- `MIN-8834-K`: Gevra Mega OCP (SECL, Chhattisgarh, Hasdeo-Arand Basin)
- `MIN-8850-K`: Kusmunda Super Pit OCP (SECL, Chhattisgarh, Hasdeo-Arand Basin)
- `MIN-9941-T`: Talcher Central OCP (MCL, Odisha, Mahanadi Basin)
- `MIN-6284-S`: Singrauli Jayant OCP (NCL, Madhya Pradesh, Son Valley Basin)
- `MIN-1422-C`: Chandrapur Durgapur OCP (WCL, Maharashtra, Wardha Valley Basin)
- `MIN-7712-K`: Singareni Kothagudem OCP IV (SCCL, Telangana, Godavari Valley Basin)
- *(Total 22 mines across 8 subsidiaries: ECL, BCCL, CCL, SECL, MCL, NCL, WCL, SCCL and 7 states)*.

### 1.5 UI Tokens & Design System
- **Sidebar & Header Background:** `#0A192F` (Deep Navy)
- **Primary Color:** `#1E40AF` (Royal Blue)
- **Accent Badges:** Amber `#F59E0B`, Emerald `#10B981`, Red `#EF4444`, Cyan `#06B6D4`
- **Background Content:** `#F8FAFC` (Light Slate)
- **Iconography:** `lucide-react`
- **Map Library:** `leaflet` and `react-leaflet` v5.0.0
- **Animation:** `motion` (Framer Motion v12)

---

## 2. Backend & Data Infrastructure Audit

### 2.1 Backend Status
- **Directory `/backend`:** Currently absent.
- **Action Plan:** Create `/backend` using FastAPI + SQLite. Structure:
  ```
  backend/
  ├── app/
  │   ├── main.py
  │   ├── api/
  │   │   ├── accidents.py
  │   │   └── rirvere.py (future hook)
  │   ├── core/
  │   │   ├── config.py
  │   │   └── db.py
  │   ├── models/
  │   │   ├── accident.py
  │   │   └── dgms_seed.py
  │   └── services/
  │       ├── accident_stats.py
  │       └── state_machine.py
  ├── data/
  │   ├── raw/dgms/ (PROVENANCE.md)
  │   └── seed/accidents/
  ├── scripts/
  │   └── ingest_dgms.py
  ├── tests/
  │   └── test_accidents.py
  └── requirements.txt
  ```

### 2.2 Raw DGMS File Audit
- **Path `backend/data/raw/dgms/`:** Directory created.
- **Status:** Raw PDF/XLSX files are not present in workspace.
- **Action:**
  1. Instruct project owner in `docs/OPEN_QUESTIONS.md` regarding missing raw PDF uploads (`sanket0404_2024.pdf`).
  2. Ingest official public DGMS statistics (Lok Sabha / Ministry of Coal published figures 2013-2022) with complete provenance in `backend/data/raw/dgms/PROVENANCE.md`.
  3. Include seed dataset tagged with `synthetic=false` for official figures and `synthetic=true` for colliery sample fixtures.

---

## 3. UI Screenshot Inventory ("Before" State)

The existing application state was captured at `http://172.25.160.37:3000/` and saved to `docs/screens/before/`:
1. `01_auth_gateway.png` — Login Gateway
2. `02_dgms_overview.png` — DGMS Officer Overview
3. `03_dgms_mine_explorer.png` — DGMS Mine Explorer
4. `04_dgms_evidence_center.png` — DGMS Evidence Center
5. `05_dgms_risk_prediction.png` — DGMS Risk & Prediction
6. `06_dgms_citizen_reports.png` — DGMS Citizen Reports
7. `07_operator_notice_desk.png` — Operator Notice Desk
8. `08_operator_lease_radar.png` — Operator Lease Radar Map
9. `09_operator_workforce.png` — Operator Workforce Roster
10. `10_citizen_file_concern.png` — Citizen Concern Portal
11. `11_officer_portal.png` — Mine Officer Portal
12. `12_labour_app.png` — Labour Mobile App

---

## 4. Proposed Technical Architecture & Design Concept

### 4.1 "National Safety Command Deck" Hero Visualization Concept
1. **Geospatial Time-Lapse View (Default):**
   - Built with high-contrast Leaflet map layer / SVG overlay.
   - Glowing pulses on coal basins (Rajmahal, Damodar Valley, Mahanadi, Son Valley, Hasdeo-Arand, Ib Valley, Wardha Valley, Godavari Valley).
   - Animated timeline scrubber (2013 → 2022) with Play/Pause button.
   - Live animating counters for national fatal accidents, fatalities, serious injuries, and fatality rate per thousand persons employed.
2. **Virtual Mine Cutaway View (Interactive 3D / Stylized Cross-Section):**
   - Built with React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`) lazy-loaded on demand (~120KB gzipped total added asset weight, 0 external 3D files, pure procedural primitives).
   - Shows Underground Gallery (Roof fall, coal seam, pillar, haulage, gas/dust) and Opencast Pit (Highwall bench slope, dumper haulage, blasting zone).
   - Interactive hotspot nodes mapped to DGMS cause categories with animated glowing pulses.
   - Hover displays share of fatalities, YoY trend, and DGMS prevention guidelines. Clicking filters the analytics dashboard.
3. **Resilience & Accessibility:**
   - Fallback to 2D SVG vector diagram for low-power devices / WebGL-disabled environments.
   - `prefers-reduced-motion` toggle to disable pulse animations.
   - Keyboard accessible navigation for scrubber and hotspots.

### 4.2 Colliery Operator Safety & Reporting Desk
- **Wizard:** 5-step guided reporting workflow (Incident Details → Geotag & Shift → Casualties & Category → DGMS Cause Taxonomy & Equipment → Attachments & Declarations).
- **Tracker:** Interactive stepper for accident status state machine (`Draft` → `Submitted` → `Acknowledged by DGMS` → `Under Enquiry` → `Additional Info Requested` → `Operator Response Submitted` → `Enquiry Completed` → `Recommendations Issued` → `Compliance Verified` → `Closed`).
- **Benchmarking:** Colliery fatality and serious injury rate benchmarked against company (e.g. ECL) and national DGMS averages.

---
*End of Audit.*
