# Welcome to User-Ip-Viewer: Onboarding Guide
**Mission**: "Observability First. Design Precision."

## 1. What is this Project?
We built an IP Geolocation tool, but it's really a **Full-Stack Observability Demo**.
*   **Public View**: A "Scientific Instrument" interface for tracking IP data.
*   **Restricted View ("OpsGuard")**: An internal dashboard monitoring the system's own health (Log streams, RED metrics).

## 2. The Golden Rules (Architecture)
To avoid the "Black Screen" disasters of the past, we follow these strict rules:
1.  **Standard Build Only**: We use Vite + React 18. **NO CDNs**. **NO ImportMaps**.
2.  **HTTPS Everywhere**: Development runs on `https://localhost` (Port 443) via a local Docker Nginx ingress.
3.  **Isolation**: The App container (Port 3001) is **closed** to the host. You must go through Nginx.

## 3. Getting Started

### Prerequisites
*   Docker & Docker Compose
*   Node.js 18+ (for local scripts)

### First Run
```bash
# 1. Start the Stack (HTTPS enabled)
docker compose --profile tls up -d --build

# 2. Access the App
# Open https://localhost (Accept the self-signed cert warning)
```

## 4. Development Workflow

### "How do I make changes?"
*   **Frontend**: Edit `frontend/src/App.tsx`. The "Scientific Design" (Zinc/Cyan) is enforced by Tailwind v4.
*   **Backend**: Edit `backend/server.js`. Logs must uses `req.log.info()` (Pino), never `console.log`.

### "How do I add new UI?" (IMPORTANT)
We depend on **Google AI Studio** for design, but you must use the **Bridge**.
1.  Copy the content of `docs/AI_STUDIO_BRIDGE.md`.
2.  Paste it into AI Studio.
3.  Ask for your component (e.g., "Design a Settings Panel").
4.  Copy the code back to VSCode.
*   *Why?* The Bridge ensures the AI generates React 18 code that won't crash our build.

## 5. Shipping Code (The Release Gate)
Before you push, you **must** run the Qualification Pack.
This runs a clean build, smoke tests, and DB integration tests.

```bash
# This is the "God Command"
./scripts/release-qualify.sh
```

If it says **"RELEASE QUALIFIED"**, you are safe to push.

## 6. Project Structure
*   `frontend/`: React 18 SPA (Vite).
*   `backend/`: Express API + Pino Logging.
*   `infra/`: Nginx & Cert configuration.
*   `scripts/`: DevOps tooling (`smoke-test`, `release-qualify`).
*   `docs/`: Historical context & spec.
