#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  VSM Gamification - Full Test Suite"
echo "=========================================="
echo ""

echo -e "${YELLOW}[1/4] Checking backend...${NC}"

TOKEN=$(curl -sf -X POST http://localhost:8000/api/v1/login/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"Test12345!"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])' 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Backend login failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Backend login OK${NC}"

COUNT=$(curl -sf http://localhost:8000/api/v1/game/scenarios \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))' 2>/dev/null || echo "0")

if [ "$COUNT" -ge 6 ]; then
  echo -e "${GREEN}✓ Scenarios API OK ($COUNT scenarios)${NC}"
else
  echo -e "${RED}✗ Scenarios API failed (got $COUNT)${NC}"
  exit 1
fi

RUN_ID=$(curl -sf -X POST http://localhost:8000/api/v1/game/scenarios/22-loud-music/start \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["run_id"])' 2>/dev/null || echo "")

if [ -n "$RUN_ID" ]; then
  echo -e "${GREEN}✓ Scenario start OK (run_id: ${RUN_ID:0:8}...)${NC}"
else
  echo -e "${RED}✗ Scenario start failed${NC}"
  exit 1
fi

CHOICE_ID=$(curl -sf http://localhost:8000/api/v1/game/runs/$RUN_ID \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["node"]["choices"][0]["id"])' 2>/dev/null || echo "")

if [ -n "$CHOICE_ID" ]; then
  curl -sf -X POST http://localhost:8000/api/v1/game/runs/$RUN_ID/choose \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"choice_id\":\"$CHOICE_ID\",\"time_spent\":10}" > /dev/null
  echo -e "${GREEN}✓ Scenario choose OK${NC}"
else
  echo -e "${RED}✗ Scenario choose failed${NC}"
  exit 1
fi

XP=$(curl -sf http://localhost:8000/api/v1/game/runs/$RUN_ID/report \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["xp_gained"])' 2>/dev/null || echo "0")

if [ "$XP" -gt 0 ]; then
  echo -e "${GREEN}✓ Scenario report OK (+$XP XP)${NC}"
else
  echo -e "${RED}✗ Scenario report failed${NC}"
  exit 1
fi

echo ""

echo -e "${YELLOW}[2/4] Checking frontend pages...${NC}"

if ! curl -sf http://localhost:3001/ > /dev/null 2>&1; then
  echo "Starting frontend dev server..."
  cd website
  pnpm dev --port 3001 > /tmp/frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ..
  sleep 15
  
  if ! curl -sf http://localhost:3001/ > /dev/null 2>&1; then
    echo -e "${RED}✗ Frontend failed to start${NC}"
    cat /tmp/frontend.log | tail -20
    exit 1
  fi
  echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
else
  echo -e "${GREEN}✓ Frontend already running${NC}"
fi

PAGES=("/login" "/" "/app/scenarios" "/app/profile" "/app/leaderboard")
FAILED=0

for page in "${PAGES[@]}"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001$page)
  if [ "$CODE" = "200" ] || [ "$CODE" = "302" ] || [ "$CODE" = "307" ]; then
    echo -e "${GREEN}✓ $page: HTTP $CODE${NC}"
  else
    echo -e "${RED}✗ $page: HTTP $CODE${NC}"
    FAILED=$((FAILED + 1))
  fi
done

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}✗ $FAILED pages failed${NC}"
  exit 1
fi

echo ""

echo -e "${YELLOW}[3/4] Checking for compilation errors...${NC}"

PROFILE_HTML=$(curl -s http://localhost:3001/app/profile 2>&1)
PROFILE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/app/profile)
HAS_RUNTIME_ERROR=0
if echo "$PROFILE_HTML" | grep -q "Unhandled Runtime Error\|Application error: a client-side exception\|Error: .*TypeError\|Error: .*ReferenceError\|Error: .*SyntaxError"; then
  HAS_RUNTIME_ERROR=1
fi
if [ "$HAS_RUNTIME_ERROR" -eq 1 ]; then
  echo -e "${RED}✗ Runtime error on /app/profile${NC}"
  echo "$PROFILE_HTML" | grep -o "Unhandled Runtime Error.*" | head -3
  exit 1
elif [ "$PROFILE_CODE" != "200" ]; then
  echo -e "${RED}✗ Profile page returned HTTP $PROFILE_CODE${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Profile page renders without errors${NC}"
fi

echo ""

echo -e "${YELLOW}[4/4] Summary${NC}"
echo "=========================================="
echo -e "${GREEN}✓ Backend API: All endpoints working${NC}"
echo -e "${GREEN}✓ Game loop: start → choose → report OK${NC}"
echo -e "${GREEN}✓ Frontend: All pages accessible${NC}"
echo -e "${GREEN}✓ Compilation: No errors${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}All tests passed! 🎉${NC}"
echo ""
echo "Demo credentials:"
echo "  Email: test@example.com"
echo "  Password: Test12345!"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3001"
echo "  Swagger:  http://localhost:8000/docs"
echo ""
