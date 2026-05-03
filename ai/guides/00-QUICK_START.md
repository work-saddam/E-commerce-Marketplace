# Quick Start Guide

## What To Read First

1. `ai/context/agent-principles.md`
2. `ai/guides/01-ARCHITECTURE.md`
3. One domain guide from `ai/agents/`

## Pick The Right Guide

- Backend/API work -> `ai/agents/backend.agent.md`
- Frontend/UI work -> `ai/agents/frontend.agent.md`
- Database/query work -> `ai/agents/db.agent.md`
- Security/auth/payment work -> `ai/agents/security.agent.md`

## Reference Files

- API patterns -> `ai/skills/api-development.md`
- Database patterns -> `ai/skills/database-optimization.md`
- Planning -> `ai/guides/03-DEVELOPMENT_PLANNER.md`
- Business context -> `ai/context/domain.md`
- Stack details -> `ai/context/stack.md`
- Conventions -> `ai/context/conventions.md`

## Common Workflows

### Build an API endpoint

1. Load `ai/agents/backend.agent.md`
2. Reference `ai/skills/api-development.md`
3. Follow existing controller, middleware, and response conventions

### Build a React component

1. Load `ai/agents/frontend.agent.md`
2. Reference `ai/prompts/component.prompt.md`
3. Match the established UI and state patterns

### Improve a slow query

1. Load `ai/agents/db.agent.md`
2. Reference `ai/skills/database-optimization.md`
3. Check indexes, query shape, field selection, and pagination

### Plan a larger change

1. Load `ai/guides/03-DEVELOPMENT_PLANNER.md`
2. Define scope, interfaces, edge cases, and verification
3. Implement in small, reviewable steps

## Practical Checklist

- Validate inputs before database access
- Check permissions before writes
- Use `.lean()` for read-only queries where appropriate
- Avoid N+1 patterns
- Add indexes for repeated filters and sorts
- Verify important changes with tests or direct checks

## Repo Layout

```text
ai/
├── README.md
├── agents/
├── context/
├── guides/
├── prompts/
├── skills/
└── tools/
```

Root instruction files:

- `AGENTS.md`
- `CLAUDE.md`
- `.copilot-instructions`
- `.cursor-rules`
