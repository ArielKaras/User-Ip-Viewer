# Security & Privacy Considerations

OpsGuard operates on a "Privacy First, Security Always" philosophy. This document outlines the specific measures taken to protect user data and system integrity.

## 🛡️ "Hardened by Design"
We do not treat security as an afterthought or a "patch". It is baked into the infrastructure.

> [!TIP] 🎧 Audio Deep Dive
> <a href="/opsguard_context.md" download class="VPCard" style="display:inline-block; padding: 6px 12px; background-color: var(--vp-c-brand); color: white; border-radius: 4px; text-decoration: none; margin-bottom: 10px;">📥 Download Source File</a>
>
> **Step 1**: Download the source above.
> **Step 2**: Upload to [NotebookLM](https://notebooklm.google.com/).
> **Step 3**: Copy & Paste this prompt:
> Want to understand the "Hardened" philosophy?
> 1. Upload `OPSGUARD_FULL_CONTEXT.md` to **NotebookLM**.
> 2. Paste this prompt:
>    > "Focus on the **Security & Privacy** aspect. Explain the 'Ingress-Only' concept like I'm a junior engineer. Why is it so important that the Database is on a private network? Also, discuss the 'High Water Mark' retention policy and how it limits liability."

### 1. Ingress-Only Architecture
The most critical security feature is that **no application logic or database port is exposed to the internet**.
- **Attack Surface Reduction**: Only Nginx (a battle-tested web server) is accessible.
- **Port Blocking**: The Docker Compose configuration explicitly binds backend ports (3001, 5432) to `127.0.0.1` or internal networks only.

### 2. Data Sovereignty & Pseudo-Anonymity
We are building a tool that respects the user.
- **No Third-Party Trackers**: We do not use Google Analytics, Mixpanel, or Facebook Pixels.
- **Local AI Preference**: By default, analysis attempts to use **Ollama** running locally on the host. This ensures sensitive IP logs are not sent to the cloud.
- **Cloud Fallback**: When using Gemini (Cloud AI), we only send the *necessary* metadata, and we do not store the AI's response permanently to avoid "poisoning" our own database with external data.

### 3. Retention Policies (Auto-Pruning)
To minimize liability and risk, we implement strict data retention limits.
- **The "High Water Mark"**: The database is configured to keep only the latest `N` records (e.g., 50 or 100).
- **Mechanism**: A background job or trigger runs after inserts to delete older records.
- **Benefit**: Even if the database is dumped, the exposure is limited to a small time window.

### 4. Client-Side Guardrails
- **Clear History**: A prominent "Nuke" button in the UI allows the user to wipe their local session and request a server-side purge.
- **Visual Indicators**: The UI clearly shows when "Secure Mode" (HTTPS) is active and when AI analysis is happening locally vs. cloud.

## 🔐 Credentials Management
- **No Hardcoded Secrets**: API keys (like `GEMINI_API_KEY`) and Database passwords are injected via Environment Variables.
- **`.env` Protection**: `.env` files are `.gitignore`d to prevent accidental leakage to version control.
- **Internal Rotation**: The internal JWT tokens used for service-to-service communication are generated ephemerally at startup.

## 🚨 Incident Response
In the event of a suspected breach:
1.  **Kill Switch**: Run `docker-compose down` immediately.
2.  **Rotate Keys**: Invalidate the `GEMINI_API_KEY`.
3.  **Audit Logs**: Check `docs/wiki/OBSERVABILITY_STRATEGY.md` on how to access the persistent logs to trace the attack vector.
