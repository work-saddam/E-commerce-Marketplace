# AI Operating Principles

**Purpose**: Shared operating rules for all AI coding agents used in this repository.  
**Applies To**: Copilot, Cursor, Claude-style agents, AGENTS-aware agents, and any tool that reads the repo instructions.

These principles are adapted from the Karpathy-inspired guidelines collected in the `andrej-karpathy-skills` project:
https://github.com/forrestchang/andrej-karpathy-skills/blob/main/CLAUDE.md

---

## The Four Principles

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Required Working Style

- Prefer clarifying ambiguity over making hidden assumptions.
- Prefer small diffs over broad cleanup.
- Prefer verification over confidence.
- Prefer explicit tradeoffs over silent decisions.

## Quick Self-Check

Before finalizing work, ask:

1. Did I make any assumption the user did not ask for?
2. Is there any simpler implementation that would still solve the task?
3. Did I touch anything unrelated to the request?
4. Did I verify the result instead of just writing code?
