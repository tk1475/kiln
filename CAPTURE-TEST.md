# Capture Test

Verifies that Claude Code sessions in this repo are logged to `.agent-logs/` before assignment work begins.

## Setup

- `.claude/settings.json` registers `UserPromptSubmit` and `Stop` hooks.
- Both run `.claude/hooks/capture.py`, which appends each prompt and each final response to `.agent-logs/<start-timestamp>_<session-id>.md`.
- Each log has YAML frontmatter (session, author, model, project, exchange count, first/last prompt time) followed by `[LOG_ENTRY type=PROMPT|RESPONSE num=N session=…]` blocks.

## Results — 2026-10-12

| Session | Log file | Canary | Result |
|---|---|---|---|
| `0774a806` (setup session) | `2026-10-12_18-07-14_0774a806-….md` | `CAPTURE TEST — 8x assignment, Ahmed.? DO I DO IT HERE?` | Prompt + response logged (exchange #2) |
| `a8b11f79` (fresh session) | `2026-10-12_18-14-45_a8b11f79-….md` | `CAPTURE TEST — 8x assignment, Ahmed.` | Prompt logged at 18:14:45Z, response at 18:15:01Z; follow-up `test` prompt and response also logged |

Checks performed in the fresh session:

- Prompt captured verbatim on submit.
- Response appended when the turn ended (confirmed on the next turn).
- Frontmatter `total_exchanges` and `last_prompt_time` update per prompt.
- `.claude/hooks/capture-errors.log` is absent, so no hook errors were recorded.

## What didn't work / caveats

- **Setup session partially unlogged.** Hooks were added mid-session in `0774a806`. Claude Code only picked them up partway through, so the first message (the setup paste) and its reply are missing; that log's numbering starts at the following message. The log was not backfilled by hand.
- **Model name inconsistency.** Prompt entries record the model as `opus` (alias from the hook input) while response entries record `claude-opus-5-5` (from the transcript). The frontmatter of the fresh-session log lists both: `model: opus, claude-opus-5-5`. Same model, two spellings.

## Conclusion

Capture works in fresh sessions from the first prompt. All further assignment sessions in this repo will be logged automatically.
