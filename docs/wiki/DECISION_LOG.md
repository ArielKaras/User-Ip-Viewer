# Decision Log

A history of the "Why" behind OpsGuard.

## 2025-12-22: The "OpsGuard" Pivot
- **Context**: We had a working Cloud deployment on AWS App Runner.
- **Problem**: It was a "Black Box". We had no insight into traffic or errors.
- **Decision**: Pause Cloud deployment. Focus 100% on **Observability**.
- **Outcome**: Created the Dashboard, instituted the RED method, and renamed the project to "OpsGuard".

## 2025-12-20: Adoption of "Hybrid AI"
- **Context**: We wanted securely analyze IP addresses.
- **Problem**: Sending IP addresses to a public AI API (like OpenAI/Gemini) violates privacy principles.
- **Decision**: Implement a **Local First** strategy using Ollama.
- **Outcome**: Privacy is preserved. Cloud is only used for non-sensitive or complex queries.

## 2025-12-15: The "Ingress-Only" Network
- **Context**: Securing the Database.
- **Problem**: Default Docker setups often expose ports to the host interface.
- **Decision**: Strictly isolate the Database on an internal network (`data-net`) accessible ONLY by the App.
- **Outcome**: Massive reduction in attack surface.

## 2025-12-10: Single Container Architecture
- **Context**: Deployment complexity.
- **Problem**: Managing separate Frontend and Backend containers was brittle.
- **Decision**: Merge them into a single `Dockerfile.combined`.
- **Outcome**: Simplified deployment, atomic rollbacks.
