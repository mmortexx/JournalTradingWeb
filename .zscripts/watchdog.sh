#!/bin/bash
# Watchdog that keeps the Next.js dev server alive.
# Checks every 5s; restarts if curl fails. Runs as a detached daemon.
cd /home/z/my-project
LOG=dev.log
PIDFILE=.zscripts/dev.pid

is_alive() {
  curl -s --max-time 4 http://localhost:3000/ -o /dev/null 2>/dev/null
}

start_dev() {
  pkill -f "next dev" 2>/dev/null
  sleep 2
  rm -f "$LOG"
  # Double-fork style detachment
  NODE_OPTIONS="--max-old-space-size=2048" setsid sh -c '
    exec node /home/z/my-project/node_modules/next/dist/bin/next dev -H 0.0.0.0 -p 3000 > /home/z/my-project/dev.log 2>&1
  ' </dev/null >/dev/null 2>&1 &
  echo $! > "$PIDFILE"
  disown
  # wait for ready
  for i in $(seq 1 40); do
    sleep 1
    if is_alive; then
      echo "dev ready after ${i}s"
      return 0
    fi
  done
  echo "dev failed to start in 40s"
  return 1
}

# Main watchdog loop
while true; do
  if ! is_alive; then
    echo "[$(date +%H:%M:%S)] dev down, restarting..."
    start_dev
  fi
  sleep 5
done
