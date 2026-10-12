#!/usr/bin/env python3
"""Claude Code capture hook for the 8x assignment.

Wired in .claude/settings.json to two events:
  UserPromptSubmit -> append the prompt, verbatim, to the session log
  Stop             -> append the final assistant response for the turn

One Markdown file per session in .agent-logs/, named
YYYY-MM-DD_HH-MM-SS_<session-id>.md. Entries are append-only; only the
frontmatter counters (total_exchanges, last_prompt_time, model) are rewritten.
Never blocks Claude: any failure is written to .claude/hooks/capture-errors.log
and the hook exits 0.
"""
import datetime as dt
import glob
import json
import os
import subprocess
import sys
import time
import traceback

PROJECT_DIR = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
LOG_DIR = os.environ.get("AGENT_LOG_DIR") or os.path.join(PROJECT_DIR, ".agent-logs")
STATE_DIR = os.path.join(PROJECT_DIR, ".claude", "hooks", ".state")
ERR_LOG = os.path.join(PROJECT_DIR, ".claude", "hooks", "capture-errors.log")
PROJECT = os.environ.get("AGENT_LOG_PROJECT") or os.path.basename(PROJECT_DIR.rstrip("/"))
TOOL = "claude-code"


def now_iso():
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def author():
    for cmd in (["gh", "api", "user", "-q", ".login"], ["git", "config", "user.name"]):
        try:
            out = subprocess.run(cmd, capture_output=True, text=True, timeout=5).stdout.strip()
            if out:
                return out
        except Exception:
            pass
    return "unknown"


def read_transcript(path):
    rows = []
    if not path or not os.path.exists(path):
        return rows
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            try:
                rows.append(json.loads(line))
            except Exception:
                pass
    return rows


def is_real_prompt(row):
    """A user turn typed by the human (not a tool result / meta injection)."""
    if row.get("type") != "user" or row.get("isSidechain") or row.get("isMeta"):
        return False
    content = (row.get("message") or {}).get("content")
    if isinstance(content, str):
        return True
    if isinstance(content, list):
        return any(b.get("type") == "text" for b in content) and not any(
            b.get("type") == "tool_result" for b in content
        )
    return False


def last_model(rows):
    for row in reversed(rows):
        if row.get("type") == "assistant" and not row.get("isSidechain"):
            m = (row.get("message") or {}).get("model")
            if m and m != "<synthetic>":
                return m
    return None


def final_response(rows):
    """Text of the last main-thread assistant message after the latest prompt."""
    start = 0
    for i, row in enumerate(rows):
        if is_real_prompt(row):
            start = i
    texts, model = [], None
    for row in rows[start + 1:]:
        if row.get("isSidechain"):
            continue
        if row.get("type") == "assistant":
            msg = row.get("message") or {}
            model = msg.get("model") or model
            blocks = [b.get("text", "") for b in msg.get("content") or [] if b.get("type") == "text"]
            if any(b.get("type") == "tool_use" for b in msg.get("content") or []):
                texts = []  # text before a tool call is intermediate, not final
            if blocks:
                texts.append("".join(blocks))
        elif row.get("type") == "user":
            content = (row.get("message") or {}).get("content")
            if isinstance(content, list) and any(b.get("type") == "tool_result" for b in content):
                texts = []
    return "\n\n".join(t for t in texts if t.strip()), model


def configured_model():
    """Model requested for this session before any response exists:
    --model flag on the claude process, then ANTHROPIC_MODEL, then settings."""
    pid = os.getppid()
    for _ in range(6):
        try:
            out = subprocess.run(["ps", "-o", "ppid=,args=", "-p", str(pid)],
                                 capture_output=True, text=True, timeout=3).stdout.strip()
        except Exception:
            break
        if not out:
            break
        ppid, _, args = out.partition(" ")
        parts = args.split()
        if parts and os.path.basename(parts[0]) == "claude":
            for i, a in enumerate(parts):
                if a == "--model" and i + 1 < len(parts):
                    return parts[i + 1]
                if a.startswith("--model="):
                    return a.split("=", 1)[1]
            break
        pid = int(ppid.strip() or 0)
        if pid <= 1:
            break
    if os.environ.get("ANTHROPIC_MODEL"):
        return os.environ["ANTHROPIC_MODEL"]
    for f in (".claude/settings.local.json", ".claude/settings.json"):
        try:
            m = json.load(open(os.path.join(PROJECT_DIR, f))).get("model")
            if m:
                return m
        except Exception:
            pass
    try:
        m = json.load(open(os.path.expanduser("~/.claude/settings.json"))).get("model")
        if m:
            return m
    except Exception:
        pass
    return "default"


def state_path(session_id):
    return os.path.join(STATE_DIR, session_id + ".json")


def load_state(session_id):
    try:
        with open(state_path(session_id)) as fh:
            return json.load(fh)
    except Exception:
        return {}


def save_state(session_id, state):
    os.makedirs(STATE_DIR, exist_ok=True)
    with open(state_path(session_id), "w") as fh:
        json.dump(state, fh)


def log_file(session_id):
    hits = sorted(glob.glob(os.path.join(LOG_DIR, "*_" + session_id + ".md")))
    if hits:
        return hits[0]
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    return os.path.join(LOG_DIR, f"{stamp}_{session_id}.md")


def header(session_id, meta):
    short = session_id[:8]
    return (
        "---\n"
        f"session_id: {session_id}\n"
        f"date: {meta['date']}\n"
        f"author: {meta['author']}\n"
        f"model: {meta['model']}\n"
        f"tool: {TOOL}\n"
        f"project: {PROJECT}\n"
        f"total_exchanges: {meta['total']}\n"
        f"first_prompt_time: {meta['first']}\n"
        f"last_prompt_time: {meta['last']}\n"
        "---\n\n"
        f"# Session Log - {meta['date']}\n\n"
        f"Session: `{short}` | Project: `{PROJECT}` | Author: `{meta['author']}`\n\n"
        "---\n"
    )


def append_entry(session_id, kind, num, ts, model, body, is_prompt):
    os.makedirs(LOG_DIR, exist_ok=True)
    path = log_file(session_id)
    state = load_state(session_id)
    meta = state.get("meta") or {
        "date": ts[:10],
        "author": author(),
        "model": model,
        "total": 0,
        "first": ts,
        "last": ts,
    }
    if is_prompt:
        meta["total"] = num
        meta["last"] = ts
    if model and model not in meta["model"].split(", "):
        meta["model"] = meta["model"] + ", " + model if meta["model"] else model

    entry = (
        f"\n[LOG_ENTRY type={kind} num={num} session={session_id[:8]}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n\n"
        f"{body.rstrip()}\n\n"
    )
    old_body = ""
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
        # body = everything after the header's closing '---' rule
        marker = "\n---\n"
        idx = text.find(marker, text.find("# Session Log"))
        old_body = text[idx + len(marker):] if idx != -1 else ""
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        fh.write(header(session_id, meta) + old_body + entry)
    os.replace(tmp, path)
    state["meta"] = meta
    save_state(session_id, state)


def on_prompt(data):
    sid = data["session_id"]
    state = load_state(sid)
    num = state.get("num", 0) + 1
    state["num"] = num
    state["answered"] = False
    save_state(sid, state)
    rows = read_transcript(data.get("transcript_path"))
    model = last_model(rows) or configured_model()
    append_entry(sid, "PROMPT", num, now_iso(), model, data.get("prompt", ""), True)


def on_stop(data):
    sid = data["session_id"]
    state = load_state(sid)
    num = state.get("num", 0)
    if num == 0 or state.get("answered"):
        return
    text, model = "", None
    # The transcript can lag the Stop event by a moment; retry briefly.
    for _ in range(10):
        text, model = final_response(read_transcript(data.get("transcript_path")))
        if text:
            break
        time.sleep(0.3)
    if not text:
        text = data.get("last_assistant_message") or "(no text response captured)"
    model = model or last_model(read_transcript(data.get("transcript_path"))) or configured_model()
    append_entry(sid, "RESPONSE", num, now_iso(), model, text, False)
    state = load_state(sid)
    state["answered"] = True
    save_state(sid, state)


def main():
    raw = sys.stdin.read()
    if os.environ.get("CAPTURE_DEBUG"):
        open(os.path.join(LOG_DIR, "debug.jsonl"), "a").write(raw.strip() + "\n")
    try:
        data = json.loads(raw)
        event = data.get("hook_event_name")
        if event == "UserPromptSubmit":
            on_prompt(data)
        elif event == "Stop":
            on_stop(data)
    except Exception:
        os.makedirs(os.path.dirname(ERR_LOG), exist_ok=True)
        with open(ERR_LOG, "a") as fh:
            fh.write(f"{now_iso()}\n{traceback.format_exc()}\n{raw[:2000]}\n\n")
    sys.exit(0)


if __name__ == "__main__":
    main()
