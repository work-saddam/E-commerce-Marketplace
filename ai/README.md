# AI Agent Hub

The `ai/` folder is the documentation hub for repository-aware AI tools and human contributors.

## Start Here

1. Read `context/agent-principles.md`
2. Read `guides/00-QUICK_START.md`
3. Read `guides/01-ARCHITECTURE.md`
4. Load the most relevant domain guide in `agents/`

## Folder Map

| Folder | Purpose |
| --- | --- |
| `agents/` | Domain-specific working rules |
| `context/` | Project domain, stack, and conventions |
| `guides/` | Quick start, architecture, and planning |
| `prompts/` | Reusable implementation templates |
| `skills/` | API and database patterns |
| `tools/` | AI tool usage notes |

## Core Guides

| File | Use |
| --- | --- |
| `guides/00-QUICK_START.md` | Fast orientation |
| `guides/01-ARCHITECTURE.md` | System structure and runtime setup |
| `guides/03-DEVELOPMENT_PLANNER.md` | Planning and implementation workflow |

## Domain Guides

| File | Use |
| --- | --- |
| `agents/backend.agent.md` | Express controllers, routes, services, middleware |
| `agents/frontend.agent.md` | React components, pages, state management |
| `agents/db.agent.md` | Schemas, queries, indexes, aggregations |
| `agents/security.agent.md` | Auth, validation, payments, webhooks, headers |

## Skills

| File | Use |
| --- | --- |
| `skills/api-development.md` | Endpoint design and request handling |
| `skills/database-optimization.md` | Query tuning and index strategy |

## Common Routing

- Building an endpoint -> `agents/backend.agent.md` + `skills/api-development.md`
- Improving a query -> `agents/db.agent.md` + `skills/database-optimization.md`
- Working on auth or payments -> `agents/security.agent.md`
- Planning a larger change -> `guides/03-DEVELOPMENT_PLANNER.md`
- Understanding project structure -> `guides/01-ARCHITECTURE.md`

## Tool Entry Points

- Copilot -> root `.copilot-instructions`
- Cursor -> root `.cursor-rules`
- Claude-style agents -> root `CLAUDE.md`
- AGENTS-aware tools -> root `AGENTS.md`

## Notes

- The current AI docs are intentionally centralized in `ai/`.
- Root instruction files should stay small and point back here.
- Prefer existing repo patterns over generic examples.
