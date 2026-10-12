# Capture Test

Follows the 8x "Agent Capture Setup" instructions (https://8x-internal.com/p/8x-agent-capture-setup). Logs go to `.agent-logs/`, ship with the repo, and are committed alongside the work.

## 1. Tool and model

- **Tool:** Claude Code (CLI), run in `~/Documents/8x`.
- **Model:** Claude Opus 5.5 (`claude-opus-5-5`) does both planning and execution. No separate planner/executor model is configured. Any subagents spawned later inherit the session model unless a log entry says otherwise.
- **Automatic mechanism:** yes. Claude Code has lifecycle hooks configured in `.claude/settings.json`. `UserPromptSubmit` fires on every prompt and `Stop` fires at the end of every turn.

## 2. Mechanism and config

- **Config file changed:** `.claude/settings.json` registers both `UserPromptSubmit` and `Stop` to run `python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/capture.py"`.
- **Script:** `.claude/hooks/capture.py`
  - On `UserPromptSubmit` it appends the prompt verbatim from the hook payload, with a UTC timestamp and the model name.
  - On `Stop` it reads the session transcript (`transcript_path` from stdin) and appends only the final assistant text of the turn. Thinking, tool calls and intermediate steps are excluded.
  - It rewrites the frontmatter counters (`total_exchanges`, `last_prompt_time`, `model`) on each event.
- **Log file:** one per session, named `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md`, in the format given by the instructions.
- **Excluded from git:**
  - Per-session hook state (`.claude/hooks/.state/`)
  - The hook's own error log (`.claude/hooks/capture-errors.log`)
  - `.claude/settings.local.json`
  - `.agent-logs/` is **not** ignored.

## 3. Log files the canaries landed in

| Session | Log file |
|---|---|
| Session A (setup session, where the hook was created) | `.agent-logs/2026-10-12_18-07-14_0774a806-2570-43f7-8290-c80bf554f657.md` |
| Session B (fresh `claude` process) | `.agent-logs/2026-10-12_18-14-45_a8b11f79-ac39-4459-886a-91ba00034e64.md` |

Both prompt and response were captured in both sessions. Session B proves the hook works from the first prompt of a new session.

## 4. Canary entries (raw, copied from the log files)

### Session A — `0774a806`

```
[LOG_ENTRY type=PROMPT num=2 session=0774a806]
timestamp: 2026-10-12T18:09:46.011Z
model: claude-opus-5-5

 CAPTURE TEST — 8x assignment, Ahmed.? DO I DO IT HERE?


[LOG_ENTRY type=RESPONSE num=2 session=0774a806]
timestamp: 2026-10-12T18:10:02.733Z
model: claude-opus-5-5

Yes, here works. I was wrong last turn when I said this session wasn't being logged. Claude Code picked up the new hooks partway through the session. Logging started with your previous message, and this canary has landed too:

`.agent-logs/2026-10-12_18-07-14_0774a806-2570-43f7-8290-c80bf554f657.md`
- **#1:** "ok what now? isnt my email…", prompt and response both logged
- **#2:** "CAPTURE TEST — 8x assignment, Ahmed.? DO I DO IT HERE?", prompt logged; this reply gets added when the turn ends

**Gap to disclose:** your first message, the setup paste, and my reply to it aren't in the log because the hook didn't exist yet. Numbering starts at your email question. That goes in CAPTURE-TEST.md under "what didn't work". I won't backfill it, since that would be hand-editing the log.

**Next:**
1. Exit this session with `/exit`.
2. Run `claude` in `~/Documents/8x` and send `CAPTURE TEST — 8x assignment, Ahmed`. This tests the hook in a fresh session, which the brief requires.
3. In that same session, ask me to verify both canaries, write `CAPTURE-TEST.md` and commit it along with the logs.
```

### Session B — `a8b11f79`

```
[LOG_ENTRY type=PROMPT num=1 session=a8b11f79]
timestamp: 2026-10-12T18:14:45.388Z
model: opus

CAPTURE TEST — 8x assignment, Ahmed.


[LOG_ENTRY type=RESPONSE num=1 session=a8b11f79]
timestamp: 2026-10-12T18:15:01.808Z
model: claude-opus-5-5

The canary landed: the hook logged your prompt in this fresh session.

`.agent-logs/2026-10-12_18-14-45_a8b11f79-ac39-4459-886a-91ba00034e64.md`
- The frontmatter is filled in: session `a8b11f79`, author `tk1475`, project `8x`, `total_exchanges: 1`.
- Entry **PROMPT #1** has the text `CAPTURE TEST — 8x assignment, Ahmed.` exactly, with timestamp `18:14:45Z`.
- This reply isn't in the file yet. The hook should add it as RESPONSE #1 when the turn ends.

The earlier session's log (`0774a806`) is also there with both of its canaries.

One small inconsistency: this log records the model as `opus`, while the old one says `claude-opus-5-5`. The log is still valid, but say so in CAPTURE-TEST.md if you want the model name to match across logs.

Next: send any message and I'll check that RESPONSE #1 was written. Then I'll write `CAPTURE-TEST.md` and commit it with both logs.
```

## 5. What did not work / caveats

- **Started without capture.** In session A the setup prompt was pasted and the hook was written before any capture existed. Claude Code began running the new hooks partway through the session. So the setup paste and its reply are not logged, and that log's numbering starts at the following message. They were not backfilled, because the instructions say never to edit entries.
- **Wrong claim corrected.** In session A I first told the user that session wasn't being logged. The next turn showed it was; the log keeps both the wrong claim and the correction.
- **Setup page not read first.** The setup page renders its text inside a sandboxed iframe, so plain fetching returned only the title. In session A the hook was built from the setup text the user pasted. In session B I re-read the page in the browser and checked the setup against it, and this file was then rewritten to include the items the page asks for: tool/model, raw canary entries, full log paths.
- **Model name has two spellings.** The first prompt of a session has no transcript entry yet, so the hook falls back to the configured model alias (`opus`). Later entries take the exact id from the transcript (`claude-opus-5-5`). Same model; session B's frontmatter lists both (`opus, claude-opus-5-5`).
- **Session A canary text.** The session A canary was sent as `CAPTURE TEST — 8x assignment, Ahmed.? DO I DO IT HERE?`, so it includes the question that was typed with it. Session B's canary is the exact text.
