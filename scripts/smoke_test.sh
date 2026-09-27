#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:8000/api}"
EMAIL="test@example.com"; PASS="Test12345!"

TOKEN=$(curl -sf -X POST "$BASE/v1/login/email" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
echo "PASS login"

COUNT=$(curl -sf "$BASE/v1/game/scenarios" -H "Authorization: Bearer $TOKEN" \
  | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))')
[ "$COUNT" -ge 6 ] && echo "PASS scenarios ($COUNT)"

RUN=$(curl -sf -X POST "$BASE/v1/game/scenarios/22-loud-music/start" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["run_id"])')
echo "PASS start run=$RUN"

CHOICE=$(curl -sf "$BASE/v1/game/runs/$RUN" -H "Authorization: Bearer $TOKEN" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["node"]["choices"][0]["id"])')
curl -sf -X POST "$BASE/v1/game/runs/$RUN/choose" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"choice_id\":\"$CHOICE\",\"time_spent\":10}" > /dev/null
echo "PASS choose"

curl -sf "$BASE/v1/game/runs/$RUN/report" -H "Authorization: Bearer $TOKEN" \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);print("PASS report:",d["verdict"],"| +"+str(d["xp_gained"]),"XP | achievements:",d["achievements"])'
echo "SMOKE OK"
