#!/usr/bin/env bash
set -euo pipefail

# ── Kill any existing processes on port 5173 ─────────────────────────────────
mapfile -t EXISTING_PIDS < <(lsof -ti tcp:5173 2>/dev/null || true)
if [[ ${#EXISTING_PIDS[@]} -gt 0 ]]; then
    echo "⚠  Killing existing process(es) on port 5173 (PIDs: ${EXISTING_PIDS[*]})..."
    kill "${EXISTING_PIDS[@]}"
    sleep 1
fi

# ── Ensure the Postgres container is running ──────────────────────────────────
CONTAINER="hangul-postgres"
STATUS=$(podman inspect --format '{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo "missing")

if [[ "$STATUS" == "running" ]]; then
    echo "✓  $CONTAINER is already running"
elif [[ "$STATUS" == "missing" ]]; then
    echo "▶  Starting $CONTAINER via podman-compose..."
    podman-compose up -d
elif [[ "$STATUS" == "exited" || "$STATUS" == "stopped" ]]; then
    echo "▶  Restarting stopped container $CONTAINER..."
    podman start "$CONTAINER"
else
    echo "▶  Container status is '$STATUS', starting via podman-compose..."
    podman-compose up -d
fi

# Wait briefly for Postgres to be ready
echo -n "   Waiting for Postgres..."
for i in {1..10}; do
    if podman exec "$CONTAINER" pg_isready -q 2>/dev/null; then
        echo " ready ✓"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# ── Start the dev server ──────────────────────────────────────────────────────
echo "▶  Starting Vite dev server..."
exec bun run dev
