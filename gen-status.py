#!/usr/bin/env python3
"""
Generates status.json for shinypsyduck054.github.io.
Run periodically via OpenClaw cron. Commits + pushes automatically.
"""

import json, subprocess, re, time, os, sys
from datetime import datetime, timezone
from urllib.request import urlopen
from urllib.error import URLError

REPO_DIR = os.path.dirname(os.path.abspath(__file__))
STATUS_FILE = os.path.join(REPO_DIR, 'status.json')
now_ms = int(time.time() * 1000)
now_iso = datetime.now(timezone.utc).isoformat()

# ── helpers ──────────────────────────────────────────────────────────────────

def ms_to_human(ms):
    if ms is None or ms <= 0: return None
    s = ms / 1000
    if s < 3600:   return f"{int(s/60)}m"
    if s < 86400:  return f"{s/3600:.1f}h"
    return f"{int(s/86400)}d"

def ts_to_date(ms):
    if not ms: return None
    return datetime.fromtimestamp(ms/1000, tz=timezone.utc).strftime('%b %-d')

# ── openclaw models status (text) ────────────────────────────────────────────

oc_text = subprocess.run(
    ['openclaw', 'models', 'status'],
    capture_output=True, text=True
).stdout

# Parse: "anthropic usage: 5h 10% left ⏱2h 42m · Week 86% left ⏱4h 12m"
ant_session_pct = ant_session_remain = ant_week_pct = ant_week_remain = None
m = re.search(r'anthropic usage: 5h (\d+)% left ⏱([\w ]+?) · Week (\d+)% left ⏱([\w ]+)', oc_text)
if m:
    ant_session_pct   = int(m.group(1))
    ant_session_remain = m.group(2).strip()
    ant_week_pct      = int(m.group(3))
    ant_week_remain   = m.group(4).strip()

# Parse claude-cli expiry: "expires in 51m" or "expiring expires in 2h"
ant_oauth_remain = None
m2 = re.search(r'anthropic:claude-cli.*?expires in ([\w ]+)', oc_text)
if m2:
    ant_oauth_remain = m2.group(1).strip()

# openai-codex cooldown
codex_cooldown = None
m3 = re.search(r'openai-codex.*?\[cooldown (\w+)\]', oc_text)
if m3:
    codex_cooldown = m3.group(1)

# ── auth-state.json ───────────────────────────────────────────────────────────

auth_state_path = os.path.expanduser('~/.openclaw/agents/main/agent/auth-state.json')
auth_state = {}
try:
    with open(auth_state_path) as f:
        auth_state = json.load(f)
except: pass

codex_blocked_until_ms = auth_state.get('usageStats', {}) \
    .get('openai-codex:shinypsyduck054@gmail.com', {}) \
    .get('blockedUntil')
codex_blocked_date = ts_to_date(codex_blocked_until_ms)
codex_remain_ms = (codex_blocked_until_ms - now_ms) if codex_blocked_until_ms else None

# ── ollama ────────────────────────────────────────────────────────────────────

ollama_ok = False
ollama_models = []
try:
    with urlopen('http://192.168.32.1:11434/api/tags', timeout=3) as r:
        data = json.loads(r.read())
        ollama_models = [m['name'] for m in data.get('models', [])]
        ollama_ok = True
except: pass

# ── telegram ──────────────────────────────────────────────────────────────────

ch_text = subprocess.run(
    ['openclaw', 'channels', 'list'],
    capture_output=True, text=True
).stdout
telegram_ok = 'installed, configured, enabled' in ch_text

# ── build status.json ─────────────────────────────────────────────────────────

# Anthropic status
if ant_session_pct is not None:
    if ant_session_pct <= 5:
        ant_status = 'limited'
        ant_note = f'session nearly exhausted · {ant_session_remain} left'
    elif ant_session_pct <= 20:
        ant_status = 'limited'
        ant_note = f'session {ant_session_pct}% left · {ant_session_remain}'
    else:
        ant_status = 'ok'
        ant_note = f'session {ant_session_pct}% · {ant_session_remain} · week {ant_week_pct}% · {ant_week_remain}'
    if ant_oauth_remain:
        ant_note += f' · oauth {ant_oauth_remain}'
elif re.search(r'anthropic via claude-cli.*status=usable', oc_text):
    # OpenClaw 2026.7.x dropped the "anthropic usage: 5h ..." line; fall back
    # to auth state when the provider is usable via Claude CLI OAuth.
    ant_status = 'ok'
    ant_note = 'auth ok via Claude CLI'
    if ant_oauth_remain:
        ant_note += f' · oauth {ant_oauth_remain}'
else:
    ant_status = 'unknown'
    ant_note = 'could not read usage'

# OpenAI status
if codex_blocked_until_ms and codex_remain_ms and codex_remain_ms > 0:
    codex_status = 'locked'
    codex_note = f'subscription locked · unblocks {codex_blocked_date or ms_to_human(codex_remain_ms)}'
else:
    codex_status = 'ok'
    codex_note = 'available'

status = {
    "updated":    now_iso,
    "updatedMs":  now_ms,
    "channels": [
        {
            "id":     "telegram",
            "name":   "Telegram",
            "status": "ok" if telegram_ok else "down",
            "note":   "bot connected · primary channel" if telegram_ok else "bot not connected"
        },
        {
            "id":     "signal",
            "name":   "Signal",
            "status": "down",
            "note":   "not configured"
        },
        {
            "id":     "claude-code",
            "name":   "Claude Code",
            "status": "ok",
            "note":   "local CLI · always available"
        }
    ],
    "providers": [
        {
            "id":             "anthropic",
            "name":           "Anthropic",
            "status":         ant_status,
            "note":           ant_note,
            "session_pct":    ant_session_pct,
            "session_remain": ant_session_remain,
            "week_pct":       ant_week_pct,
            "week_remain":    ant_week_remain,
            "models":         ["Claude Sonnet 4.6", "Claude Haiku 4.5", "Claude Opus 4.7"]
        },
        {
            "id":          "openai",
            "name":        "OpenAI",
            "status":      codex_status,
            "note":        codex_note,
            "unlock_date": codex_blocked_date,
            "models":      ["ChatGPT / Codex"]
        },
        {
            "id":      "ollama",
            "name":    "Ollama (Local)",
            "status":  "ok" if ollama_ok else "down",
            "note":    f"{len(ollama_models)} models · 192.168.32.1" if ollama_ok else "host unreachable",
            "models":  ollama_models
        }
    ]
}

with open(STATUS_FILE, 'w') as f:
    json.dump(status, f, indent=2)

print(f"[gen-status] wrote status.json @ {now_iso}")
print(f"  anthropic: {ant_status} — {ant_note}")
print(f"  openai:    {codex_status} — {codex_note}")
print(f"  ollama:    {'ok' if ollama_ok else 'down'} — {len(ollama_models)} models")
print(f"  telegram:  {'ok' if telegram_ok else 'down'}")

# ── commit + push ─────────────────────────────────────────────────────────────

os.chdir(REPO_DIR)
subprocess.run(['git', 'add', 'status.json'], check=True)

diff = subprocess.run(['git', 'diff', '--cached', '--stat'], capture_output=True, text=True)
if 'status.json' not in diff.stdout:
    print("[gen-status] no change, skipping commit")
    sys.exit(0)

subprocess.run([
    'git', 'commit', '-m',
    f'chore: auto-update status.json [{datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")} UTC]'
], check=True)

subprocess.run(['git', 'push'], check=True)
print("[gen-status] pushed.")
