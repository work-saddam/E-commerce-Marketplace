# CLAUDE.md

Use this file as the default instruction entry point for Claude-style agents in this repository.

## Universal AI Operating Principles

Apply the shared principles in `ai/context/agent-principles.md` before making non-trivial changes.

- Think Before Coding
- Simplicity First
- Surgical Changes
- Goal-Driven Execution

## Repo Instruction Order

1. Read `ai/context/agent-principles.md`
2. Read `ai/README.md`
3. Load the relevant domain guide:
   - `ai/agents/backend.agent.md`
   - `ai/agents/frontend.agent.md`
   - `ai/agents/db.agent.md`
   - `ai/agents/security.agent.md`
4. Reference supporting context as needed:
   - `ai/context/domain.md`
   - `ai/context/stack.md`
   - `ai/context/conventions.md`
   - `ai/guides/02-DEBUGGING.md`

## Required Working Style

- Do not guess through ambiguity.
- Prefer minimal, direct implementations.
- Keep changes narrowly scoped to the request.
- Verify the result with tests, checks, or concrete inspection when possible.
