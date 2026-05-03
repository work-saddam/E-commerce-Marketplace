# AI Tools Setup Guide

This guide explains how to use the repository documentation with common AI tools.

## Auto-Loaded Tools

### GitHub Copilot

- Uses root `.copilot-instructions`
- Best starting point: `ai/README.md`

### Cursor

- Uses root `.cursor-rules`
- Best starting point: `ai/README.md`

## Prompt-Driven Tools

### Claude / ChatGPT / Gemini / Other Assistants

Use this pattern:

```text
I am working in this repository.

Relevant project guidance:
- [paste section from ai/agents/...]
- [paste section from ai/skills/...]

My current code/problem:
[paste code or description]

Please follow the project pattern and explain the change briefly.
```

## Which File To Reference

| Need | File |
| --- | --- |
| Backend/API pattern | `ai/agents/backend.agent.md` |
| Frontend/UI pattern | `ai/agents/frontend.agent.md` |
| Database/query pattern | `ai/agents/db.agent.md` |
| Security/payment pattern | `ai/agents/security.agent.md` |
| Endpoint examples | `ai/skills/api-development.md` |
| Query and index examples | `ai/skills/database-optimization.md` |
| Project structure | `ai/guides/01-ARCHITECTURE.md` |
| Planning larger work | `ai/guides/03-DEVELOPMENT_PLANNER.md` |

## Good Prompt Habits

- Reference the exact project file you want the tool to follow
- Include the current code or the exact path being changed
- Ask for a narrow change instead of a broad rewrite
- Ask for verification notes if the tool cannot run checks

## Quick Verification

- `AGENTS.md` points to `ai/`
- `CLAUDE.md` points to `ai/`
- `.copilot-instructions` points to `ai/`
- `.cursor-rules` points to `ai/`
