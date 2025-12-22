# User-Ip-Viewer
**Mission**: "Observability First. Design Precision."

A full-stack IP Geolocation application demonstrating robust DevOps practices, "Scientific Instrument" design, and "OpsGuard" observability.

## 🚀 Quick Start
```bash
# 1. Start the Stack (HTTPS enabled)
docker compose --profile tls up -d --build

# 2. Open the App
# https://localhost
```

## 📚 Documentation
> **New Team Member? Start Here:**
> 👉 **[ONBOARDING GUIDE](docs/ONBOARDING.md)**

### Key Workflow Docs
*   **[AI Studio Bridge](docs/AI_STUDIO_BRIDGE.md)**: The mandatory context file for generating UI designs.
*   **[Resolution Report](docs/resolution_report.md)**: How we fixed the "Black Screen".
*   **[ADR-001: Cloud to OpsGuard Pivot](docs/ADR-001-cloud-to-opsguard-pivot.md)**: Why we paused Cloud deployment for Observability.

## 🛠️ Release Qualification
Before shipping, you must run the Qualification Pack:
```bash
./scripts/release-qualify.sh
```

## 🏗️ Architecture
*   **Frontend**: React 18, Vite, Tailwind v4.
*   **Backend**: Node.js, Express, Pino Logger.
*   **Database**: PostgreSQL with persistent schema.
*   **Infra**: Nginx Ingress (TLS-Termination).
