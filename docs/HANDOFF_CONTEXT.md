# Handoff Context: OpsGuard Phase 10 -> DevOps

**Current State**: Phase 10 (Hybrid AI Analysis) is **COMPLETE** and **COMMITTED** (v1.0.0-ai).

## 1. System Architecture (Current)
*   **Project**: OpsGuard (formerly User-IP-Viewer).
*   **Stack**: Node.js (Backend), React (Frontend), PostgreSQL (DB), Nginx (Ingress).
*   **Security**: Hardened "Ingress-Only" design. Localhost TLS.
*   **New Feature (Phase 10)**: Hybrid AI Log Analysis.
    *   **Backend**: `analysisService.js` uses Strategy Pattern (`gemini` vs `ollama`).
    *   **Auth**: Ephemeral `X-OpsGuard-Token` (auto-generated or injected).
    *   **Error Contract**: Strict 502/503/504 mapping. No internal leakage.
    *   **Delivery**: GitHub Actions (Ephemeral Runners).

## 2. Recent Decisions (Architecture Decision Records)
*   **ADR-002**: Hybrid AI Strategy. Defaults to Gemini (Cloud) for speed on E7270 hardware, but supports Ollama (Local) for data sovereignty.
*   **Hardware Constraint**: Host is Dell Latitude E7270 (Dual Core i7, No GPU).

## 3. Next Objective: The "Aviram" DevOps Assignment
**Goal**: Build a CI/CD pipeline using **Jenkins** (not GitHub Actions) as a learning exercise.
*   **Deadline Logic**: Simulating a "30/4/2024" urgent delivery.
*   **Components**:
    *   **App**: "Python Web App" (We use our Node.js app as the stand-in, or a simple Python script if strictly required).
    *   **CI**: Jenkins (Running in Docker: `jenkins/jenkins:lts`).
    *   **Logic**: `Jenkinsfile` (Groovy).
    *   **Containerization**: `Dockerfile` + `docker-compose.yml`.

## 4. Prompt for Next Agent
"I am resuming the OpsGuard project. Phase 10 (Hardened Hybrid AI) is complete/committed.
My next task is the 'DevOps Assignment'.
1.  I need to set up **Jenkins in Docker** locally.
2.  I need to write a **Jenkinsfile** to build/test our application.
3.  I need to explain how this differs from our current GitHub Actions setup.
Please analyze `docs/HANDOFF_CONTEXT.md` and start the Jenkins setup."
