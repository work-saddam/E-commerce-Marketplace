# CLAUDE.md

Use this file as the default instruction entry point for Claude-style agents in this repository.

## Read First

1. `ai/context/agent-principles.md`
2. `ai/README.md`
3. The matching domain guide in `ai/agents/`

## Supporting References

- `ai/context/domain.md`
- `ai/context/stack.md`
- `ai/context/conventions.md`
- `ai/guides/01-ARCHITECTURE.md`
- `ai/guides/03-DEVELOPMENT_PLANNER.md`
- `ai/skills/api-development.md`
- `ai/skills/database-optimization.md`

## Skills

See **Skill Registry** in `ai/README.md` for all available skills.
All registered skills (built-in + installed) are automatically available to this agent.

## Working Style

- Prefer direct, minimal implementations.
- Do not guess through ambiguity.
- Keep changes scoped to the request.
- Verify outcomes with tests, checks, or concrete inspection when possible.
