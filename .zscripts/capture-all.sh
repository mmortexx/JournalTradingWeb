#!/bin/bash
# One-shot: start dev, wait, capture all key screenshots, then leave dev running.
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null; sleep 2
rm -f dev.log
NODE_OPTIONS="--max-old-space-size=2048" setsid sh -c '
  exec node /home/z/my-project/node_modules/next/dist/bin/next dev -H 0.0.0.0 -p 3000 > /home/z/my-project/dev.log 2>&1
' </dev/null >/dev/null 2>&1 &
disown
echo "dev launched, waiting for ready..."
for i in $(seq 1 40); do
  sleep 1
  if curl -s --max-time 3 http://localhost:3000/ -o /dev/null 2>/dev/null; then
    echo "READY after ${i}s"
    break
  fi
done

# Close any stale browser session
agent-browser close --all 2>/dev/null
sleep 1

# Home page — full page + viewport sections
agent-browser open "http://localhost:3000/" --wait-until networkidle 2>&1 | tail -1
sleep 4
agent-browser screenshot /tmp/h-hero.png 2>&1 | tail -1
agent-browser scroll down 900 2>&1 | tail -1; sleep 1
agent-browser screenshot /tmp/h-sec2.png 2>&1 | tail -1
agent-browser scroll down 900 2>&1 | tail -1; sleep 1
agent-browser screenshot /tmp/h-sec3.png 2>&1 | tail -1
agent-browser scroll down 1200 2>&1 | tail -1; sleep 1
agent-browser screenshot /tmp/h-sec4.png 2>&1 | tail -1
agent-browser scroll down 1200 2>&1 | tail -1; sleep 1
agent-browser screenshot /tmp/h-sec5.png 2>&1 | tail -1

# Demo page
agent-browser open "http://localhost:3000/demo" --wait-until networkidle 2>&1 | tail -1
sleep 5
agent-browser screenshot /tmp/demo-top.png 2>&1 | tail -1
agent-browser scroll down 600 2>&1 | tail -1; sleep 1
agent-browser screenshot /tmp/demo-sec2.png 2>&1 | tail -1

# Other pages
for p in features pricing about faq; do
  agent-browser open "http://localhost:3000/$p" --wait-until networkidle 2>&1 | tail -1
  sleep 3
  agent-browser screenshot /tmp/page-$p.png 2>&1 | tail -1
done

echo "===ALL SHOTS==="
ls -la /tmp/h-*.png /tmp/demo-*.png /tmp/page-*.png 2>/dev/null
echo "===DEV ALIVE==="
curl -s --max-time 5 http://localhost:3000/ -o /dev/null -w "HTTP %{http_code}\n"
