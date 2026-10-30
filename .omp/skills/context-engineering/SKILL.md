---
name: context-engineering
description: Feeds agents the right information at the right time. Use when starting a session, switching tasks, or when output quality drops.
---

# Context Engineering

## Overview

Provide the right context to AI agents at the right time. Agents are only as good as the information they have — context packing dramatically improves output quality.

## When to Use

- Starting a new session
- Switching tasks or features
- When output quality drops
- Agent seems confused
- Starting any significant work

**When NOT to use:** Simple, well-understood tasks that don't need context.

## Context Layers

### Layer 1: Project Context (Always)

Always provide:

- Tech stack (language, framework, key libs)
- Project structure
- Commands (build, test, lint, dev)

### Layer 2: Task Context (Usually)

When working on a feature:

- Relevant files
- Existing patterns in codebase
- API contracts
- Design decisions

### Layer 3: Skill Context (When Needed)

When a skill applies:

- Load the skill via `skill` tool
- Follow skill steps exactly

## What to Include

### Must Include

```
- What we're building (objective)
- Where files live (structure)
- How to build/test (commands)
- Boundaries (what to do / not do)
```

### Should Include

```
- Examples of similar code in codebase
- Design patterns to follow
- Testing approach
```

### Can Include

```
- External documentation
- Performance requirements
- Related features
```

## Why Context Matters

| Without Context | With Context |
|---|---|
| Agent guesses | Agent knows |
| Generic code | Project-specific code |
| Works but wrong | Works and fits |
| Rework needed | Works first time |

## Context Sources

1. **CLAUDE.md / AGENTS.md** — Project rules and conventions
2. **SPEC.md** — Feature specifications
3. **README.md** — Project overview
4. **Existing code** — Patterns to follow

## Loading Context

Load context in this order:
```

1. Project structure (ls, glob)
2. Key config files (build/dependency manifests, language config)
3. AGENTS.md / project rules
4. Relevant source files
5. Skill (if applicable)

```

## Patterns to Follow

Show examples, don't just describe:

```

// Instead of: "Use our async pattern"
// Show: "Here's how we handle async in this project:"
async function fetchUser(id: string): Promise<User> {
return db.users.findOne({ id }).then(user => {
if (!user) throw new NotFoundError('User not found');
return user;
});
}

```

## When Context Degrades

Signs you need more context:
- Generic code output
- Ignoring project conventions
- Not using existing utilities
- Reinventing patterns

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The agent should know" | It doesn't unless you tell it |
| "It's in the docs" | Not if it's not in the context |
| "I already explained" | Not in current context window |

## Red Flags

- Starting without project context
- Not showing relevant code
- Not using existing patterns
- Generic solutions

## Verification

Before any significant work:
- [ ] Project structure is clear
- [ ] Commands are known
- [ ] Relevant code shown
- [ ] Boundaries defined
```
