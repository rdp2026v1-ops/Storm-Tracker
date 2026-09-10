# Offshore Storm Tracker & Severe Weather Decision Support System
### Rong Doi Central Platform (RDP - Block 11.2) & BK-TNHA WHP (Block 12.11)

A modern, real-time, interactive GIS web application for tracking tropical depressions, storms, and typhoons approaching offshore platforms. Built in full compliance with the **Typhoon Evacuation - RDP.docx** Standard Operating Procedures (SOP).

---

## 🚀 Field Configuration & Assets

1. **Rong Doi Central Complex (RDP)**:
   - **Coordinates**: `7.7925°N, 108.2021°E` (Block 11.2, Nam Con Son Basin).
   - **Visual Asset**: `RD Vertical - transparent.png` platform illustration.
   - **Facilities**: Central Production Platform (PUQC), Living Quarters, Helideck, FSO PPS-01 Connection.
2. **BK-TNHA Wellhead Platform (WHP)**:
   - **Coordinates**: `7.7300°N, 107.9300°E` (Block 12.11).
   - **Visual Asset**: Small orange point without text inside.
   - **Infield Distance**: `16.50 NM` to RDP Central Complex.
3. **Safety Perimeter Range Rings**:
   - 🔴 **RED ALERT (< 240 NM / < 24 hrs)**: Total ESD-1 facility shutdown, depressurization, and platform abandonment.
   - 🟡 **YELLOW ALERT (750 NM to 240 NM / < 36 hrs)**: Down-manning non-essential personnel (Flight #1), cessation of FSO PPS-01 offtake.
   - 🟢 **GREEN ALERT (1000 NM to 750 NM / < 48 hrs)**: 3-hourly surveillance tracking, emergency communication checks, helicopter standby.

---

## 📋 Emergency Response Checklists (SOP Compliance)

- **Green Alert (1000 NM to 750 NM)**: 20 operational action items for OIM, Telecom Technician, CRT, Medic, and onshore DIM.
- **Yellow Alert (750 NM to 240 NM)**: 17 action items for down-manning, securing RDP & BK-TNHA, FSO offtake shutdown, and helicopter logistics.
- **Red Alert (< 240 NM)**: 16 action items for full ESD-1 emergency shutdown, SCSSV closure verification, final helicopter evacuation, and locking medical narcotics.

---

## 📦 How to Run Offline (No Internet Required)

All required dependencies (Leaflet.js GIS, SheetJS Excel export, MQTT synchronization) are bundled locally in the `vendor/` directory so the app works **100% offline** without any internet connection.

### Option 1: 1-Click Launcher (Windows)
Double-click **`run_offline.bat`** in this folder. It will start a local server and automatically launch your default browser at `http://localhost:8000`.

### Option 2: Command Line (PowerShell / Command Prompt / Terminal)
```bash
python -m http.server 8000
```
Then open **`http://localhost:8000`** in Chrome, Edge, or Firefox.

> **Why a local server is required:** Modern browsers enforce CORS security policies that prevent ES6 JavaScript modules (`import`/`export`) from running directly via `file:///` URLs. Running `python -m http.server` serves the files locally over HTTP loopback (`127.0.0.1`) without needing an internet connection or network access.
