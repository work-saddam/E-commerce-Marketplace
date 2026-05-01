# AI Operating Principles

**Purpose**: Shared operating rules for all AI coding agents used in this repository.  
**Applies To**: Copilot, Cursor, Claude-style agents, AGENTS-aware agents, and any tool that reads the repo instructions.

These principles are adapted from the Karpathy-inspired guidelines collected in the `andrej-karpathy-skills` project:
https://github.com/forrestchang/andrej-karpathy-skills/blob/main/README.md

---

## The Four Principles

### 1. Think Before Coding

- State assumptions explicitly instead of silently guessing.
- If multiple interpretations are plausible, surface them before implementation.
- Push back when a simpler or safer approach is better than the requested shape.
- If confusion remains, stop and clarify rather than coding through uncertainty.

### 2. Simplicity First

- Implement the minimum code that solves the stated problem.
- Do not add speculative flexibility, abstractions, flags, or features.
- Avoid overengineering for single-use code paths.
- Prefer the version a senior engineer would consider obviously simple.

### 3. Surgical Changes

- Touch only the code required for the request.
- Do not refactor adjacent code unless the task requires it.
- Match the existing style and patterns of the surrounding code.
- Remove only the dead code made obsolete by your own change.
- If unrelated problems are noticed, mention them instead of changing them by default.

### 4. Goal-Driven Execution

- Convert requests into clear success criteria with a verification step.
- For non-trivial tasks, state a brief plan before making substantial changes.
- Verify outcomes with tests, checks, or concrete inspection whenever possible.
- Do not stop at code changes alone; confirm the requested goal was actually met.

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
