# Developer Workflows

## 🛠️ Getting Started
OpsGuard is designed to be developed inside the local Docker environment.

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local scripts)
- **Ollama** installed on the host machine (if testing local AI).

## 🐋 The Docker Interface
We have a set of scripts to manage the lifecycle of the application.
- `scripts/manage.sh` (or `cleanup.sh`): The main control tower.
    -   **Clean**: Removes all containers and volumes (a fresh start).
    -   **Stop**: Halts containers but keeps data.
    -   **Restart**: Rebuilds and restarts (useful after code changes).

### Common Commands
```bash
# Full reset (Nuke it)
./scripts/cleanup.sh --full

# Start up normally
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

## 🎨 The Design Contract
We separate **Activity** (Code) from **Aesthetics** (Design).
- **Design Tokens**: Located in `docs/design/DESIGN_TOKENS.json`. This is the "Single Source of Truth" for colors, spacing, and typography.
- **Golden Copy**: We use AI Studio to generate "Golden Copy" HTML/CSS artifacts.
    -   *Workflow*: Copy the AI-generated code -> Paste into `src/components` -> Adapt to React/Tailwind.

## 🚢 CI/CD Pipeline
Our GitHub Actions pipeline (`.github/workflows`) enforces quality.

### `ci.yml` (Pull Requests)
Runs on every PR to `main`.
1.  **Lint**: Checks for code style errors.
2.  **Test**: Runs unit tests.
3.  **Security**: Scans for vulnerabilities.
4.  **Build**: Verifies the Docker image builds successfully.

### `cd-prod.yml` (Main Branch)
Deploys the verified artifact.
- **Immutability**: The Docker image built in CI is the *exact same* image deployed to Prod. We do not rebuild in production.

## 🐛 Debugging Guide
### "I see a Black Screen"
1.  Check the JS Console.
2.  Check container logs: `docker-compose logs -f app`.
3.  Did you introduce a new env var? Make sure it's in `docker-compose.yml`.

### "The AI is hallucinating"
1.  Check the prompt in `server/services/aiService.js`.
2.  Switch to "Gemini" mode to see if it's a model issue (Ollama) or a prompt issue.
