# 🤖 AI Tools Setup Guide

**Status**: All AI Tools Supported  
**Location**: ai/tools/00-AI-TOOLS.md  
**Last Updated**: April 29, 2026

---

## 🎯 Supported AI Tools

✅ **GitHub Copilot** (VS Code) - Auto-configured  
✅ **Cursor AI** (Editor) - Auto-configured  
✅ **Claude** (Web, API, Desktop)  
✅ **ChatGPT** (Web, API)  
✅ **Google Gemini** (Web, API)  
✅ **OpenAI Codex** (API, Playground)  
✅ **Continue.dev** (VS Code Extension)  
✅ **Any AI Assistant** (Copy-paste approach)

---

## 🚀 GitHub Copilot (EASIEST)

**Setup**: Already configured via `.copilot-instructions`

```
✅ Open VS Code
✅ Start coding normally
✅ Copilot auto-loads ai/ patterns
✅ Ask: "How do I [task]?"
✅ Get suggestions following your patterns
```

**How to use**:

```
1. Open any file in the project
2. Comment: // How do I create an API endpoint?
3. Copilot suggests code + references ai/guides/
4. Copilot follows your established patterns

Or use Chat (Ctrl+I):
"Create product listing endpoint following project patterns"
```

**Pro Tips**:

- Copilot reads `.copilot-instructions`
- References `ai/agents/` and `ai/guides/` automatically
- No manual setup needed

---

## 🎨 Cursor AI (EASIEST)

**Setup**: Already configured via `.cursor-rules`

```
✅ Open Cursor
✅ Start coding normally
✅ Cursor auto-loads ai/ patterns
✅ Ask: "How do I [task]?"
✅ Get suggestions following your patterns
```

**How to use**:

```
1. Press Ctrl+K (or Cmd+K)
2. Ask: "Implement rate limiting for auth"
3. Cursor references .cursor-rules + ai/ files
4. Code suggestions follow your patterns

Or in Chat:
"Show me the pattern for [task]"
```

**Pro Tips**:

- Cursor reads `.cursor-rules`
- Understands project structure deeply
- Great for complex implementations

---

## 💬 Claude (Copy-Paste Method)

**Setup**: None - just copy-paste documentation

### Approach 1: Provide Pattern + Code

```
Prompt:
"I'm building an e-commerce marketplace and need to create
a user registration endpoint.

Here's the pattern from ai/guides/04-SKILLS_API.md:
[paste relevant section]

My current code:
[paste your code]

Implement this pattern for my code."

Result: Claude generates code following the pattern
```

### Approach 2: Ask for Explanation

```
Prompt:
"Why is this better? Compare:

My approach:
[paste N+1 query code]

Recommended (from ai/agents/db.agent.md):
[paste optimized approach]"

Result: Claude explains benefits
```

### Approach 3: Code Review

```
Prompt:
"Review my code against this checklist from ai/agents/security.agent.md:

[paste security checklist]

My implementation:
[paste code]

What issues do you find?"

Result: Claude identifies gaps
```

---

## 🔍 ChatGPT (Copy-Paste Method)

**Setup**: Same as Claude

### Quick Template

```
Prompt:
"I'm using this pattern from [file]:
[paste section]

Here's my code:
[your code]

How do I apply this pattern? What am I missing?"

Result: ChatGPT generates implementation
```

### For Debugging

```
Prompt:
"My code has an issue. Here's the debugging guide from ai/guides/02-DEBUGGING.md Issue #8:

[paste issue]

My code:
[your code]

How do I fix it?"

Result: ChatGPT suggests fixes
```

---

## 🌐 Google Gemini (Copy-Paste Method)

**Setup**: Same as Claude/ChatGPT

### Quick Template

```
Prompt:
"Here's the recommended pattern from ai/agents/backend.agent.md:

[paste section]

How should I apply this to my code:
[your code]"

Result: Gemini suggests implementation
```

---

## 💻 Continue.dev (VS Code Extension)

**Setup**: Install from VS Code extensions

```bash
# Install Continue extension
Extensions → Search "Continue" → Install
```

**How to use**:

```
1. Press Ctrl+L or Cmd+L to open Continue chat
2. Reference documentation in prompts:
   "Based on ai/agents/backend.agent.md, implement [task]"
3. Continue fetches ai/ files and generates code
4. Press Tab to accept suggestions
```

---

## 📋 Universal Copy-Paste Method (Any AI Tool)

Works with ANY AI, even those not listed above.

### Step 1: Identify Your Task

```
Do you need:
- API endpoint? → Use ai/agents/backend.agent.md
- React component? → Use ai/agents/frontend.agent.md
- Database query? → Use ai/agents/db.agent.md
- Security fix? → Use ai/agents/security.agent.md
```

### Step 2: Copy Relevant Section

```
1. Open relevant ai/agents/[domain].agent.md
2. Find matching section
3. Copy to clipboard
```

### Step 3: Paste into AI + Add Your Code

```
Prompt:
"I'm [your task]. Here's the pattern I should follow:

[pasted pattern]

My current code:
[your code]

What should I do?"

Result: AI generates code following the pattern
```

### Step 4: Iterate

```
If AI response isn't quite right:
"That's close. Per [file], I also need [requirement].
Can you add that?"

AI refines the implementation
```

---

## 🎯 Perfect Prompt Templates

### Template 1: "Implement This Pattern"

```
"I need to [task]. Here's the pattern I should follow
from ai/guides/[file]:

[paste section]

Here's my code:
[paste code]

Implement the pattern."
```

### Template 2: "Fix My Issue"

```
"My code has an issue. According to ai/guides/02-DEBUGGING.md Issue #[N]:

[paste issue description]

My code:
[paste code]

How do I fix it?"
```

### Template 3: "Code Review"

```
"Review my code against the checklist from ai/agents/[agent].md:

[paste checklist]

My code:
[paste code]

What's missing?"
```

### Template 4: "Explain the Pattern"

```
"Explain this pattern from ai/[path]:

[paste pattern]

Why is it better than:
[paste current approach]"
```

---

## 🔗 File References for Each Task

| Task                    | Reference                             | Section           |
| ----------------------- | ------------------------------------- | ----------------- |
| Build API endpoint      | `ai/guides/04-SKILLS_API.md`          | Sections 1-3      |
| Build React component   | `ai/prompts/component.prompt.md`      | All               |
| Design MongoDB schema   | `ai/prompts/schema.prompt.md`         | All               |
| Fix slow query          | `ai/guides/05-SKILLS_DATABASE.md`     | Sections 2-4      |
| Implement JWT auth      | `ai/agents/security.agent.md`         | JWT Section       |
| Verify payment webhook  | `ai/agents/security.agent.md`         | Payment Section   |
| Fix N+1 query           | `ai/agents/db.agent.md`               | Common Mistakes   |
| Code review             | Any `ai/agents/*.agent.md`            | Checklist Section |
| Understand architecture | `ai/guides/01-ARCHITECTURE.md`        | All               |
| Find known issue        | `ai/guides/02-DEBUGGING.md`           | Issues 1-15       |
| Plan complex task       | `ai/guides/03-DEVELOPMENT_PLANNER.md` | Workflows         |

---

## 💡 Pro Tips for All Tools

### 1. Be Specific

```
❌ Bad: "How do I fix this?"
✅ Good: "How do I fix N+1 queries per ai/agents/db.agent.md"
```

### 2. Provide Context

```
❌ Bad: "Here's my code" [10 lines]
✅ Good: "I'm implementing [requirement], here's my attempt" [code]
```

### 3. Reference Patterns

```
❌ Bad: "Should I use MongoDB?"
✅ Good: "Following ai/guides/01-ARCHITECTURE.md, should I add an index on email?"
```

### 4. Iterate Smart

```
❌ "That's wrong, try again"
✅ "Per ai/agents/security.agent.md Issue #5, I also need [requirement]"
```

---

## 🌟 What Makes This Setup Different

| Aspect          | Traditional            | This Setup                      |
| --------------- | ---------------------- | ------------------------------- |
| **Discovery**   | Generic docs           | Specific agents for your domain |
| **Token Cost**  | High (read full files) | Low (targeted sections)         |
| **Consistency** | Manual                 | Automated (ai/agents control)   |
| **Quality**     | Variable               | Enterprise-grade patterns       |
| **AI Tools**    | Single tool per setup  | Works with ANY tool             |
| **Maintenance** | Hard                   | Easy (single source of truth)   |

---

## 🚀 Quick Start by Tool

### Copilot Users

```
1. Open VS Code
2. Start coding
3. Ask Copilot
Done!
```

### Cursor Users

```
1. Open Cursor
2. Start coding
3. Ask Cursor
Done!
```

### Online AI Users (Claude, ChatGPT, etc.)

```
1. Identify task type
2. Copy relevant ai/agents/*.md section
3. Paste + add your code
4. Get response
Done!
```

### Any Other Tool

```
1. Use universal copy-paste method (see above)
2. Reference ai/ files in prompt
3. Get response
Done!
```

---

## ✅ Verification Checklist

- [ ] `.copilot-instructions` exists & references ai/
- [ ] `.cursor-rules` exists & references ai/
- [ ] ai/agents/ has 4 agent files
- [ ] ai/guides/ has 6 guide files
- [ ] ai/context/ has 3 context files
- [ ] ai/prompts/ has 3 prompt files
- [ ] ai/tools/ has this file (00-AI-TOOLS.md)
- [ ] Root has only redirect AGENTS.md
- [ ] All cross-references updated

---

**That's it! Pick your AI tool and start coding with expert patterns automatically.** ✨
