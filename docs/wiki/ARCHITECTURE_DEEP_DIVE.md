1# Architecture Deep Dive

This document provides a detailed look at the internal components of OpsGuard and how they interact. It expands on the high-level overview found in [ARCHITECTURE.md](../ARCHITECTURE.md).

> [!TIP] 🎧 Audio Deep Dive
> <a href="/opsguard_context.md" download class="VPCard" style="display:inline-block; padding: 6px 12px; background-color: var(--vp-c-brand); color: white; border-radius: 4px; text-decoration: none; margin-bottom: 10px;">📥 Download Source File</a>
>
> **Step 1**: Download the source above.
> **Step 2**: Upload to [NotebookLM](https://notebooklm.google.com/).
> **Step 3**: Copy & Paste this prompt:
> Want to hear the engineers debate this architecture?
> 1. Upload `OPSGUARD_FULL_CONTEXT.md` to **NotebookLM**.
> 2. Paste this prompt:
>    > "Deep dive into the **Single Container** architecture. Debate the pros and cons of 'Monolith in a Box' vs Microservices. Explain exactly how the Nginx Ingress protects the Node backend, and why the split network design is critical for security."

## 🏗️ Composition Strategy
OpsGuard is built as a **Single Container Deployment** (`Dockerfile.combined`) that encapsulates multiple logical services. This "Monolith in a Box" approach ensures that what we test in development is exactly what runs in production.

### The "Combined" Artifact
Instead of managing separate containers for Frontend, Backend, and Nginx in production, we build them into a single image.
- **Benefits**: Atomic deployments, simplified rollback, guaranteed version alignment.
- **Mechanism**: A Supervisor process (or entrypoint script) manages the lifecycle of the internal processes.

## 🧠 Service Logic

### 1. Ingress Layer (Nginx)
The gatekeeper. It listens on port 80/443 and routes traffic.
- **TLS Termination**: Handles SSL/TLS handshakes so the backend doesn't have to.
- **Static Serving**: serves the Vite-built React frontend directly for maximum performance.
- **Reverse Proxy**: Forwards `/api` requests to the Node.js backend.
- **Security Headers**: Injects HSTS, CSP, and X-Frame-Options headers.

### 2. Application Layer (Node.js/Express)
The brain.
- **API Routes**: Handles business logic for IP lookup and AI analysis.
- **AI Orchestrator**: Decides whether to route an analysis request to the local Ollama instance or the external Gemini API.
- **Database Interactor**: Uses `pg` to communicate with the isolated PostgreSQL database.
- **Metrics Exporter**: Exposes a `/metrics` endpoint for Prometheus to scrape.

### 3. Data Layer (PostgreSQL)
The memory.
- **Isolation**: It is configured to listen ONLY on the internal Docker network. It is unreachable from the public internet.
- **Persistence**: Data is stored in a Docker `volume` to survive container restarts.
- **Schema Management**: Schema is applied automatically on startup if not present.

## 🔄 Data Flow: The "Visit" Lifecycle

1.  **Ingress**: User visits `https://opsguard.local`. Nginx serves the React App.
2.  **Lookup**: React App calls `GET /api/ip`.
3.  **Processing**: Node.js Backend receives request.
    -   Extracts IP from headers.
    -   Queries internal Geo database.
    -   **Async Side-Effect**: Logs the visit to PostgreSQL.
4.  **Response**: JSON data returned to UI.
5.  **Analysis (Optional)**: User clicks "Analyze with AI".
    -   Backend fetches recent history for that IP.
    -   Backend prompts (Ollama or Gemini) for a security assessment.
    -   Result streaming back to UI.

## 🌐 Networking Model
We use a **Split Network** design in Docker Compose:
- **`ingress-net`**: The "Public" face. Only Nginx and the Host interact here.
- **`data-net`**: The "Private" vault. The DB lives here. The App joins this network to talk to the DB, but the Ingress cannot reach it.

> [!IMPORTANT]
> This network separation is our primary defense against direct database attacks. Even if Nginx is compromised, the attacker still needs to pivot through the App to reach the Data.
