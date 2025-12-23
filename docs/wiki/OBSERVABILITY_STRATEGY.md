# Observability Strategy

At OpsGuard, "Observability" is not just about having graphs—it's about being able to answer the question: *"Why is the system behaving this way?"*

> [!TIP] 🎧 Audio Deep Dive
> <a href="/opsguard_context.md" download class="VPCard" style="display:inline-block; padding: 6px 12px; background-color: var(--vp-c-brand); color: white; border-radius: 4px; text-decoration: none; margin-bottom: 10px;">📥 Download Source File</a>
>
> **Step 1**: Download the source above.
> **Step 2**: Upload to [NotebookLM](https://notebooklm.google.com/).
> **Step 3**: Copy & Paste this prompt:
> Why do we care about "RED" metrics?
> 1. Upload `OPSGUARD_FULL_CONTEXT.md` to **NotebookLM**.
> 2. Paste this prompt:
>    > "Focus on **Observability**. Explain the 'RED Method' (Requests, Errors, Duration) and why it's the gold standard. Discuss how measuring AI latency (the 'Tail') is different from measuring standard web API latency. Explain the business value of tracking Provider Usage."

## 📊 The RED Method
We strictly follow the RED method for all backend services. This gives us a common language for "Health".

### 1. Rate (Requests per Second)
- **What it tells us**: The traffic volume.
- **Why it matters**: A sudden spike might indicate a DDoS attack or a viral event. A drop to zero means we are down.
- **Prometheus Metric**: `http_requests_total`

### 2. Errors (Failure Rate)
- **What it tells us**: The percentage of requests failing (5xx codes).
- **Why it matters**: We aim for < 0.1% error rate.
- **Differentiation**: We carefully distinguish between `4xx` (User Errors - e.g., Invalid IP) and `5xx` (System Errors - e.g., Database Crash).

### 3. Duration (Latency)
- **What it tells us**: How long a request takes.
- **Why it matters**: Latency kills usage. We track P95 and P99 latencies.
- **The "Tail"**: In a Hybrid AI system, the "Tail" (P99) is massive because local AI inference can take 10s+. We isolate these metrics from standard API calls.

## 🤖 AI Instrumentation
Standard web metrics aren't enough for AI. We added custom instrumentation to `aiService.js`.

### Provider Tracking
We track `ai_requests_total{provider="ollama"}` vs `ai_requests_total{provider="gemini"}`.
- **Business Value**: Allows us to calculate "Money Saved" (by using Ollama) vs "Quota Used" (Gemini).

### Token Usage
(Future Phase) We plan to track `token_count` to measure the complexity of queries and optimize our prompts.

## 🛠️ The Stack
- **Prometheus**: Scrapes our `/metrics` endpoint every 15s. Stores data locally.
- **Grafana**: Visualizes the data.
    -   **Dashboard**: `OpsGuard Main` (Default view).
    -   **Logs**: We correlate Logs and Metrics using `trace_id`. If you see a spike in 500 errors on the graph, you can click it to see the exact logs for that timeframe.
