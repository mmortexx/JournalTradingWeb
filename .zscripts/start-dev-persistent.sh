#!/bin/bash
# Persistent dev server launcher — fully detaches from the calling shell so
# the Next.js process survives after the Bash tool call returns.
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null
sleep 2
rm -f dev.log
# setsid: new session, detached from controlling terminal
# </dev/null: no stdin
# nohup-like: redirect all output
# disown: remove from shell job table
setsid bash -c 'exec next dev -p 3000 > /home/z/my-project/dev.log 2>&1' </dev/null >/dev/null 2>&1 &
disown
echo "dev server launched, pid group $!"
# Wait for it to be ready
for i in $(seq 1 30); do
  sleep 1
  if curl -s --max-time 3 http://localhost:3000/ -o /dev/null 2>/dev/null; then
    echo "READY after ${i}s"
    exit 0
  fi
done
echo "TIMEOUT after 30s"
exit 1
