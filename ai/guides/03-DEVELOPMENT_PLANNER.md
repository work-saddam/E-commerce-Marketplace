# 🤖 AI Development Planner & Workflow

## Overview

This document provides a structured workflow for AI agents to approach development tasks efficiently, with token optimization and quality focus.

---

## 🎯 Task Classification Matrix

### How to Route Tasks to AI Agents

```
┌─────────────────────────┬──────────────┬─────────────────────────┐
│ Task Type               │ Complexity   │ Recommended Approach    │
├─────────────────────────┼──────────────┼─────────────────────────┤
│ Bug Fix (known issue)   │ Low          │ Direct fix (15-30 min)  │
│ New Feature             │ Medium       │ Plan → Build → Test     │
│ Optimization            │ High         │ Profile → Analyze → Fix │
│ Architecture Change     │ Very High    │ Design → Review → Phase │
│ Security Issue          │ Critical     │ Isolate → Fix → Verify  │
│ Integration Problem     │ High         │ Debug → Log → Trace     │
│ Code Review             │ Low-Medium   │ Automated → Manual      │
│ Documentation           │ Low          │ Generate → Review       │
└─────────────────────────┴──────────────┴─────────────────────────┘
```

---

## 📋 AI Workflow Templates

### Template 1: Bug Fix Workflow

```
1. GATHER CONTEXT (5 min)
   ├─ Read error message/logs
   ├─ Identify affected component
   └─ Check related code

2. ANALYZE ROOT CAUSE (10 min)
   ├─ Trace execution path
   ├─ Check inputs/outputs
   └─ Review recent changes

3. DESIGN FIX (5 min)
   ├─ Consider edge cases
   ├─ Check for side effects
   └─ Plan rollout strategy

4. IMPLEMENT (10 min)
   ├─ Write minimal fix
   ├─ Add validation
   └─ Update tests

5. VERIFY (5 min)
   ├─ Manual testing
   ├─ Run test suite
   └─ Check related flows
```

**Total Time: ~35 min**

### Template 2: Feature Implementation Workflow

```
1. REQUIREMENTS (10 min)
   ├─ Read spec/issue
   ├─ Identify acceptance criteria
   ├─ Check dependencies
   └─ Estimate effort

2. DESIGN (15 min)
   ├─ Database schema changes
   ├─ API endpoint structure
   ├─ State management updates
   └─ Component hierarchy

3. BACKEND IMPLEMENTATION (30 min)
   ├─ Create database model
   ├─ Add validations
   ├─ Create API endpoint
   ├─ Add error handling
   └─ Write tests

4. FRONTEND IMPLEMENTATION (25 min)
   ├─ Create Redux slice
   ├─ Build components
   ├─ Add API integration
   ├─ Style UI
   └─ Handle errors

5. INTEGRATION TESTING (15 min)
   ├─ End-to-end flow
   ├─ Edge cases
   ├─ Performance check
   └─ Cross-browser testing

6. DOCUMENTATION (10 min)
   ├─ Update API docs
   ├─ Add code comments
   ├─ Update README
   └─ Record decisions
```

**Total Time: ~105 min**

### Template 3: Performance Optimization Workflow

```
1. PROFILING (15 min)
   ├─ Identify slow component
   ├─ Measure current performance
   ├─ Get baseline metrics
   └─ Check database queries

2. ANALYSIS (15 min)
   ├─ Identify bottleneck
   ├─ Check for N+1 queries
   ├─ Review algorithm complexity
   └─ Profile CPU/memory

3. OPTIMIZATION (20 min)
   ├─ Add indexes
   ├─ Fix query patterns
   ├─ Add caching
   ├─ Optimize algorithm
   └─ Lazy load components

4. TESTING (10 min)
   ├─ Verify fix works
   ├─ Benchmark before/after
   ├─ Check for regressions
   └─ Document changes

5. DEPLOYMENT (5 min)
   ├─ Gradual rollout
   ├─ Monitor performance
   └─ Set alerts
```

**Total Time: ~65 min**

---

## 🔍 Investigation Protocol

### When Debugging Issues

```
STEP 1: COLLECT INFORMATION
├─ What's the exact error message?
├─ When did it start happening?
├─ What changed recently?
├─ How often does it occur?
└─ What's the impact?

STEP 2: CHECK LOGS & TRACES
├─ Backend logs (console.error, winston, etc)
├─ Frontend console (Network tab, console)
├─ Database queries (MongoDB profiler)
├─ External services (Razorpay, Cloudinary logs)
└─ Infrastructure (Redis, BullMQ)

STEP 3: NARROW SCOPE
├─ Is it frontend or backend?
├─ Which API endpoint?
├─ Which database collection?
├─ Which user or flow?
└─ Which environment (dev/prod)?

STEP 4: REPRODUCE
├─ Can you reproduce locally?
├─ What's the minimum reproduction?
├─ Test with different inputs
└─ Check related functionality

STEP 5: DIAGNOSE
├─ Add console.logs at key points
├─ Use debugger breakpoints
├─ Check variable states
├─ Trace execution flow
└─ Review recent code changes

STEP 6: FIX & VERIFY
├─ Implement minimal fix
├─ Test fix locally
├─ Run full test suite
├─ Verify related flows work
└─ Document root cause
```

---

## 📊 Token Optimization Strategy

### Rule 1: Read Strategically

```
❌ WRONG: "Read the entire file"
✅ RIGHT: "Read lines 1-50 to find getUserById function"

❌ WRONG: "Check all validation files"
✅ RIGHT: "Search for email validation in utils/"

❌ WRONG: "Understand the order creation flow"
✅ RIGHT: "Find createOrder function, check validation & transaction"
```

### Rule 2: Parallel Searches

```
// Instead of 5 sequential searches:
search("getUserById" in authController)
search("validateEmail" in validation)
search("hashPassword" in utils)
search("JWT generation" in authController)
search("token verification" in middleware)

// Do 1 parallel search:
search("getUserById | validateEmail | hashPassword | JWT | token")
```

### Rule 3: Selective File Reads

```
// ❌ Read whole file (1000 lines)
read("backend/src/services/order.service.js", 1, -1)

// ✅ Read function (50 lines)
read("backend/src/services/order.service.js", 1, 100)
// Find createOrder, then read just that section

// ✅ Use grep to find line numbers first
grep("createOrder", "order.service.js")
// Result: line 45
read("backend/src/services/order.service.js", 40, 80)
```

### Rule 4: Response Formatting

```
// ✅ GOOD: Brief with specific references
Issue: N+1 query in [orderController.js](orderController.js#L23)
Fix: Use .populate() instead of manual loop

// ❌ BAD: Long explanation with code dumps
[entire 200-line function pasted]
```

---

## 🚀 Implementation Priorities

### High Priority (Critical Path)

1. ✅ Security fixes (rate limiting, validation, HTTPS)
2. ✅ Database optimizations (indexes, N+1 fixes)
3. ✅ Payment integration (idempotency, webhook verification)
4. ✅ Core features (user auth, products, orders)

### Medium Priority (Quality)

5. ✅ Error handling improvements
6. ✅ Logging and monitoring
7. ✅ Performance optimization
8. ✅ Code refactoring

### Low Priority (Polish)

9. ✅ Documentation
10. ✅ Testing infrastructure
11. ✅ DevOps improvements
12. ✅ UI/UX enhancements

---

## 📝 Skill Selection Guide

### Use These Skills For:

#### 🛠️ ai/skills/api-development.md

When implementing/debugging:

- New API endpoints
- Request validation
- Error handling
- Authentication/authorization
- Response formatting
- Middleware chains

#### 🗄️ ai/skills/database-optimization.md

When working with:

- Slow queries
- High database load
- N+1 problems
- Schema design
- Indexes
- Transactions
- Large datasets

#### 💳 ai/agents/security.agent.md

When working with:

- Payment processing
- Webhook handling
- Refunds/disputes
- Security vulnerabilities
- PCI compliance
- Rate limiting

#### 🐛 DEBUGGING_GUIDE.md

When you encounter:

- Unexpected errors
- Security issues
- Performance problems
- Integration failures
- Authentication issues

---

## 🎯 AI Agent Decision Tree

```
┌─ What type of task is this?
│
├─→ SECURITY ISSUE?
│   ├─ Yes → Check DEBUGGING_GUIDE.md + ai/agents/security.agent.md
│   └─ No ↓
│
├─→ PAYMENT/WEBHOOK?
│   ├─ Yes → Check ai/agents/security.agent.md
│   └─ No ↓
│
├─→ DATABASE/QUERY PROBLEM?
│   ├─ Yes → Check ai/skills/database-optimization.md
│   └─ No ↓
│
├─→ API ENDPOINT/VALIDATION?
│   ├─ Yes → Check ai/skills/api-development.md
│   └─ No ↓
│
├─→ GENERAL BUG/DEBUG?
│   ├─ Yes → Check DEBUGGING_GUIDE.md
│   └─ No ↓
│
└─→ Other
    └─ Check AGENTS.md for architecture
```

---

## ⏱️ Time Estimation Guidelines

```
Task Type                    Estimate    Range
─────────────────────────────────────────────────
Bug fix (identified)         30 min      15-45 min
Simple feature               2 hours     1-3 hours
Medium feature               4 hours     3-6 hours
Complex feature              8 hours     6-12 hours
Optimization                 1 hour      30m-2 hours
Security fix                 2 hours     1-4 hours
Refactoring                  3 hours     2-5 hours
Testing                      2 hours     1-4 hours
Documentation                1 hour      30m-2 hours

Buffer (always add 20%)      +20%        +20%
```

---

## 🔄 Code Review Checklist for AI

- [ ] Follows project conventions
- [ ] Input validation present
- [ ] Error handling implemented
- [ ] No hardcoded values/secrets
- [ ] Async/await used correctly
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Security considerations addressed
- [ ] Tests written
- [ ] Documentation updated
- [ ] Performance acceptable
- [ ] No console.log in production code

---

## 📞 Escalation Protocol

### When to Ask for Clarification

```
1. Requirements unclear
   → Ask specific questions with context

2. Multiple valid solutions
   → Present options with pros/cons

3. Blocked by external factors
   → Document what's needed, propose workaround

4. Out of scope
   → Explain scope limitations, suggest next steps

5. High-risk change
   → Document risks, propose testing strategy
```

---

## 🎓 Learning From Issues

When you find a bug or issue:

1. **Document** the root cause
2. **Identify** the pattern (similar issues?)
3. **Implement** preventive checks
4. **Update** documentation/skills
5. **Share** learnings with team

Example:

```
Issue: N+1 query in order listing
Root Cause: Loop with findById inside
Pattern: Anywhere we populate related data
Prevention: Always use .populate() or aggregation
Code Pattern: Check for loops with DB queries
Documentation: Add to ai/skills/database-optimization.md
```

---

## 🚨 Emergency Protocol

### When Critical Issue Occurs

1. **IMMEDIATE** (0-5 min)
   - Identify severity
   - Notify stakeholders
   - Start incident log

2. **SHORT TERM** (5-30 min)
   - Isolate issue
   - Apply temporary fix if needed
   - Prevent data loss

3. **MEDIUM TERM** (30 min - 2 hours)
   - Debug root cause
   - Implement permanent fix
   - Test thoroughly

4. **FOLLOW UP** (2+ hours)
   - Deploy fix
   - Monitor for issues
   - Post-mortem analysis

---

## 📊 Metrics to Track

When working on improvements, measure:

```
Performance:
- Query time (before/after)
- API response time
- Page load time
- Database CPU usage

Quality:
- Test coverage
- Error rate
- Bug recurrence

Security:
- Auth failures
- Rate limit hits
- Invalid inputs blocked

Reliability:
- Uptime
- Error logs
- Failed transactions
```

---

## ✅ Before You Hand Off

Always ensure:

- [ ] Code is tested
- [ ] Error messages are clear
- [ ] Changes are documented
- [ ] Edge cases handled
- [ ] No breaking changes
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Rollback plan exists
- [ ] Team is notified
- [ ] Monitoring in place
