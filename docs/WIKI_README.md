# OpsGuard Project Wiki

Welcome to the **OpsGuard** (User-IP-Viewer) internal documentation. This wiki serves as the central knowledge hub for understanding the system's philosophy, architecture, and operational workflows.

## 📚 Core Documentation

### [Architecture & Design](wiki/ARCHITECTURE_DEEP_DIVE.md)
*Deep dive into the system's components, the "Hardened by Design" philosophy, and the networking model.*

### [Security & Privacy](wiki/SECURITY_CONSIDERATIONS.md)
*Detailed explanation of our "Ingress-Only" model, Data Sovereignty, and Privacy Guardrails.*

### [Hybrid AI Strategy](wiki/HYBRID_AI_ARCHITECTURE.md)
*How we bridge Local AI (Ollama) and Cloud AI (Gemini) to balance privacy and intelligence.*

### [Observability Strategy](wiki/OBSERVABILITY_STRATEGY.md)
*Understanding the "Why" behind our metrics. The RED method, AI-specific instrumentation, and interpreting the dashboard.*

---

## 🛠️ Developer Resources

### [Developer Workflows](wiki/DEV_WORKFLOWS.md)
*Guides for CI/CD, Local Debugging with Docker scripts, and the Design Contract.*

### [Decision Log](wiki/DECISION_LOG.md)
*Chronological history of major architectural decisions and pivots (e.g., The "Cloud to OpsGuard" pivot).*

---

## 🎧 Audio Learning (NotebookLM)

Prefer listening to reading? You can turn this entire Wiki into a Deep Dive Podcast.

### How to generate the Podcast
1.  **Get the Source**: We have compiled all wiki pages into a single context file:
    -   [`docs/wiki/OPSGUARD_FULL_CONTEXT.md`](wiki/OPSGUARD_FULL_CONTEXT.md)
2.  **Upload to NotebookLM**:
    -   Go to [NotebookLM](https://notebooklm.google.com/).
    -   Create a new Notebook.
    -   Upload the `OPSGUARD_FULL_CONTEXT.md` file.
    -   Click **"Generate"** in the "Audio Overview" section.
3.  **Listen**: Enjoy a generated deep-dive discussion about OpsGuard's philosophy, security, and architecture.

### 🎙️ Recommended Episodes (Prompts)
Paste these into the **"What should the AI hosts focus on?"** box to generate specific episodes:

**Episode 1: The Hardened Architecture**
> "Focus mainly on the `ARCHITECTURE_DEEP_DIVE.md` and `SECURITY_CONSIDERATIONS.md`. Discuss the specific technical details of the 'Ingress-Only' networking model, how the Docker networks are split, and why the 'Single Container' approach was chosen for security. Explain the 'High Water Mark' retention policy."

**Episode 2: The Two Brains (Hybrid AI)**
> "Focus on `HYBRID_AI_ARCHITECTURE.md` and `OBSERVABILITY_STRATEGY.md`. Discuss the conflict between Privacy (Ollama) and Intelligence (Gemini). Analyze the routing logic, the latency trade-offs, and how the RED method is used to track AI performance."

**Episode 3: The Pivot (The Story)**
> "Focus on `DECISION_LOG.md`. Tell the story of how the project started as a blind cloud deployment and pivoted to become 'OpsGuard'. Discuss the 'Black Box' problem and how Observability solved it."

**Episode 4: The Monolith Manifesto**
> "Focus on `ENGINEERING_PHILOSOPHY.md`. This is a philosophical deep dive. Discuss why the team abandoned microservices for a monolith. Highlight the idea that 'Constraints are Superpowers' (No Database Internet, CPU-Only AI). Explain the emotional journey from 'Chaos' to 'Deployable Confidence'."

---

## 🚀 Quick Links
- **[Main README](../README.md)**: Setup and Installation.
- **[Architecture Overview](../ARCHITECTURE.md)**: High-level system diagram.
- **[Onboarding Guide](../ONBOARDING.md)**: Getting started for new team members.
