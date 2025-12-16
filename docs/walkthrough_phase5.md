# Verification Walkthrough - Phase 5 Refactoring

## 1. Verify Directory Structure
Ensure the following new directories and files exist:
- `database/init/01_schema.sql`
- `infra/nginx/nginx.conf`
- `infra/certs/selfsigned.crt` & `selfsigned.key`

## 2. Start the Stack (Clean State)
> [!IMPORTANT]
> To ensure the database initializes correctly (schema load), you must start with a fresh volume.
> **Warning**: This deletes existing data in the volume.

```bash
docker compose down -v
docker compose --profile tls up -d --build
```
(Use `docker compose logs -f db` to watch initialization)
Verify logs show schema loading:
```log
db-1  | /usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/01_schema.sql
```

## 3. "Golden" Verification Checklist

Run these commands in a Git Bash or similar terminal (use `curl -k` to ignore self-signed cert errors).

### A. Connectivity & TLS
**Goal**: Verify proper ingress through Nginx and TLS termination.
```bash
# 1. Verify HTTPS & Server Header
curl -kI https://localhost
# Expected: 200 OK ... Server: nginx ... (HTTP/1.1 or HTTP/2)

# 2. Verify Health Endpoint (Passed through to App)
curl -k https://localhost/healthz
# Expected: {"status":"ok"}
```

### B. Application Logic
**Goal**: Verify App is running and connected to DB.
```bash
# 3. Verify Dedicated DB Health Endpoint
curl -k https://localhost/api/health/db
# Expected: {"db":"ok"}

# 4. Verify External IP fetch
curl -k https://localhost/api/ip
# Expected: {"ip":"..."}
```

### C. Security & Isolation
**Goal**: Verify network segregation and port restrictions.
```bash
# 5. Verify App is NOT exposed on host port 3001
curl -i http://localhost:3001/healthz
# Expected: curl: (7) Failed to connect to localhost port 3001: Connection refused

# 6. Verify DB is NOT exposed on host
docker compose ps
# Expected: 'db' service should NOT show any port mapping like 0.0.0.0:5432->5432
```

## 4. Service-to-Service Verification (Internal)
**Goal**: Prove the network topology (`ingress-net` vs `data-net`).

### From Ingress (Nginx)
Can it reach App? Yes.
*(Note: If the service name is not `nginx`, check `docker compose ps`)*
```bash
docker compose exec nginx wget -qO- http://app:3001/healthz
# Expected: {"status":"ok"}
```

### From App
Can it reach DB? Yes.
```bash
docker compose exec app sh -lc 'nc -zv db 5432'
# Expected: db (172.x.x.x:5432) open
```

### Isolation Check (Strict)
**Goal**: Ensure Ingress cannot see the Database.
```bash
# A) Identify the ingress network name
NETWORK_NAME=$(docker network ls | grep ingress-net | awk '{print $2}')
# If empty, list manually: docker network ls
echo "Testing on network: $NETWORK_NAME"

# B) DNS should not resolve 'db' on ingress-net
docker run --rm --network $NETWORK_NAME alpine sh -lc 'getent hosts db || true'
# Expected: No output (exit code 1 masked by || true)

# C) (Optional) Verify manual reachability
docker run --rm --network $NETWORK_NAME alpine nc -zv db 5432
# Expected: nc: bad address 'db'
```
