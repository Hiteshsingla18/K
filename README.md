# CoalGuard AI: Closed-Loop Coal Mining Compliance & Surveillance Engine

CoalGuard AI is a multi-tier regulatory platform engineered for the **Ministry of Coal, Government of India** and the **Directorate General of Mines Safety (DGMS)**. It unifies high-resolution geospatial telemetry (Sentinel-2, Cartosat-3, InSAR), regulatory clearance rules, and on-ground citizen reports to detect unauthorized mining perimeter expansions and automate the statutory show-cause response workflow.

---

## 🏛️ Problem Statement
Traditional coal compliance oversight suffers from fragmented data pipelines:
1. Satellite monitoring scans are historically decoupled from real-time operational lease data.
2. Mine operators lack a direct, auditable platform to clarify benign site adjustments versus illegal extractions before formal sanctions.
3. Citizen grievances (noise, excessive particulate dispersion) exist in silos without automatic spatiotemporal correlation to active colliery boundaries.

CoalGuard AI resolves these bottlenecks by pairing multi-source sensor verification with an explainable compliance audit loop.

---

## ⚡ Key Architecture & Features

### 1. Unified Single Sign-On (SSO) Role-Based Access
- **Directorate Surveillance Official (DGMS / MoC)**: Access to national telemetry feeds, active breach alerts, statutory notice generation, and early risk predictions.
- **Colliery Lease Operator (ECL / BCCL / CIL)**: Integrated compliance desk to receive digital Show-Cause Notices (SCN), track 48-hour response clocks, and submit certified surveyor annexures.
- **Citizen Environmental Vigilance**: Public portal to file cryptographically geotagged grievances (dust emissions, blasting vibration, off-lease encroachment).

### 2. Live Geospatial Command Center
- Interactive Leaflet-powered engine loaded with CartoDB Positron and Voyager tile layers.
- Real-time pinpointing across major Indian coal belts (Rajmahal Basin, Damodar Valley, Mahanadi Basin, Singrauli Basin, and Hasdeo Corridor).
- Dynamic boundary zoom and filtering by operational state and risk tier (Compliant, Monitor, Critical Deviation).

### 3. Explainable Multi-Source Evidence Chain (Violation ENV-082)
A 6-stage structured audit trail providing verifiable justification for statutory enforcement:
1. **MoEFCC Clearance Baseline**: Legal footprint extraction cap (1,248 Hectares).
2. **Operator Self-Report**: Monthly colliery submission records.
3. **Radar/Optical Delta Analysis**: Automated discrepancy mapping (+28 Ha unauthorized expansion outside lease polygon).
4. **Citizen Ground Corroboration**: Cross-referenced geotagged dust and night-blasting logs.
5. **AI Correlation Engine**: Spatial-temporal analysis yielding an 89.4% confidence score of non-compliance.
6. **Decision Support & SCN Dispatch**: Automated generation of official show-cause notices.

### 4. Bidirectional Compliance Loop
- Dispatched notices transition mine lease status to `Awaiting Operator Response`.
- Operator submissions via the Colliery Response Desk automatically trigger a review status (`Response Submitted - Awaiting Verification`) in the national command dashboard.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Core** | React 18, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Lucide React Icons |
| **Geospatial & Mapping** | Leaflet, React-Leaflet, CartoDB Tile API |
| **Design Framework** | Google Stitch, Google AI Studio |
| **Architecture** | Component-Driven Single-Page Architecture with In-Memory State Sync |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone [https://github.com/](https://github.com/)<your-username>/coalguard-ai.git

# 2. Navigate to the project directory
cd coalguard-ai

# 3. Install required dependencies
npm install

# 4. Start the local Vite development server
npm run dev
