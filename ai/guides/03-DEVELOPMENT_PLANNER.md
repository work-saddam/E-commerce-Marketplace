# AI Development Planner

## Purpose

Use this guide to plan medium and large implementation work before editing code.

## Task Types

| Task | Recommended Approach |
| --- | --- |
| Small fix | Inspect -> change -> verify |
| New feature | Scope -> design -> build -> verify |
| Performance work | Measure -> analyze -> optimize -> compare |
| Architecture change | Design -> phase -> migrate -> validate |
| Security-sensitive work | isolate -> review inputs -> harden -> verify |

## Issue Resolution Workflow

1. Gather context
   - Read the affected files
   - Confirm current behavior
   - Identify the user-facing impact
2. Trace the cause
   - Check the request flow or data flow
   - Compare expected vs actual behavior
   - Narrow the smallest safe fix
3. Design the change
   - Define exact files and interfaces touched
   - Note risks and compatibility constraints
   - Decide the verification strategy
4. Implement
   - Make the smallest complete change
   - Keep response shapes and contracts stable unless intentional
5. Verify
   - Run targeted checks
   - Revisit adjacent flows
   - Document important assumptions

## Feature Workflow

1. Requirements
   - Clarify the goal and acceptance criteria
   - Identify in-scope and out-of-scope behavior
2. Design
   - Data shape
   - API surface
   - UI/state changes if needed
3. Backend work
   - Validation
   - Business logic
   - Persistence/query changes
4. Frontend work
   - API integration
   - UI states
   - Error handling
5. Verification
   - Happy path
   - Permission checks
   - Edge cases

## Performance Workflow

1. Measure current behavior
2. Find the bottleneck
3. Improve one layer at a time
4. Re-measure after the change

Focus areas:

- indexes
- pagination
- `.lean()`
- field selection
- aggregation vs repeated queries

## Planning Checklist

- Goal is explicit
- Acceptance criteria are concrete
- Interfaces are identified
- Edge cases are listed
- Verification steps are defined
- Rollback or safe fallback is understood

## Useful References

- Architecture -> `ai/guides/01-ARCHITECTURE.md`
- API patterns -> `ai/skills/api-development.md`
- Database patterns -> `ai/skills/database-optimization.md`
- Domain rules -> `ai/agents/`
