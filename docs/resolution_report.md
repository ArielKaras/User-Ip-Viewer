# Resolution Report: The "Black Screen" Incident
**Date**: Dec 22, 2025
**Status**: RESOLVED 🟢

## 1. The Incident
The application displayed a persistent **"Black Screen"** upon load. The DOM contained the `#root` element, but it was empty. No standard console errors appeared initially.

## 2. Root Cause Analysis
The issue was a "Perfect Storm" of three distinct failures masking each other:

1.  **Dependency Conflict (The "React 19" Problem)**:
    *   The project was initialized with **React 19**.
    *   Several libraries (`react-leaflet`, `recharts` via CDN) were optimized for **React 18**.
    *   This caused a "Duplicate React" or "Invalid Hook Call" crash deep in the minified bundle (`TypeError: reading 'S'`).

2.  **Build Architecture Mismatch**:
    *   We attempted a "Golden Copy" fix using **CDN-based libraries** (ImportMaps) while using a **local build tool** (Vite).
    *   Vite bundled its own internal React while the browser tried to load the CDN React, causing a dual-instance crash.

3.  **Runtime Logic Crash** (The Final Boss):
    *   Once the build was fixed, the `IpCard` component crashed immediately on render.
    *   **Reason**: It tried to run `.toFixed(4)` on `data.latitude` which was `undefined` (likely due to a partial API response).
    *   **Effect**: The entire React tree unmounted instantly, reverting to the Black Screen.

## 3. The Solution Workflow

### Phase 1: Diagnosis & The "Golden Copy" Experiment
*   **Action**: Applied AI Studio's "Golden Copy" (`index.html` with explicit ImportMaps).
*   **Result**: Failed. The local Vite build ignored the ImportMap and bundled conflicting dependencies.

### Phase 2: Architecture Reset (Standardization)
*   **Action**: We pivoted away from the risky CDN strategy.
    *   Modified `vite.config.js`: Removed `external` config and deleted `importmap` from `index.html`.
    *   **Goal**: Force a single, self-contained application bundle.

### Phase 3: Dependency Resolution
*   **Action**: Downgraded dependencies to a known stable stack in `package.json`.
    *   `react` & `react-dom`: `^19.0.0` -> `^18.2.0`
    *   `react-leaflet`: `^5.0.0` -> `^4.2.1`
*   **Result**: `docker build` finally succeeded without peer dependency errors.

### Phase 4: Runtime Patching
*   **Action**: identified the standard JS Error `Cannot read properties of undefined (reading 'toFixed')` in the browser logs.
*   **Fix**: Applied defensive coding to `IpCard.tsx`:
    ```typescript
    // Before (Unsafe)
    value={`${data.latitude.toFixed(4)}`}

    // After (Safe)
    value={`${data.latitude?.toFixed(4) ?? '0.0000'}`}
    ```

## 4. Final State verification
*   **URL**: `http://localhost:3001`
*   **Status**: **Functional**
*   **Visulas**: 
    *   "System Identity" Card: **Visible**
    *   OpsGuard Dashboard: **Interactive** (via "RESTRICTED ACCESS" toggle)
    *   Console: **Clean** (No crash logs)

## 5. Lessons Learned
*   **Avoid "Hybrid" Builds**: Don't mix CDN dependencies (ImportMaps) with local Bundlers (Vite) unless heavily configured.
*   **Trust Local Logs**: The browser console in the containerized environment was the only source of truth for the runtime crash.
*   **Defensive Coding**: Never assume API data (like `lat`/`lon`) exists. Always optional-chain (`?.`) external data.
