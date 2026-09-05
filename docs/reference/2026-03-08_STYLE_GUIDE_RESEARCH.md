# Style Guide Best Practices Research

**Date:** February 6, 2026  
**Purpose:** Research findings on effective STYLE_GUIDE.md organization and content for TypeScript/JavaScript projects

## Executive Summary

Based on analysis of major style guides (Airbnb, Google, Microsoft TypeScript, StandardJS) and examination of the current BlueJS STYLE_GUIDE.md, this document provides recommendations for improving the organization, clarity, and effectiveness of coding standards documentation.

## 1. How to Organize Coding Standards and Conventions

### Major Project Approaches

**Airbnb JavaScript Style Guide** (148k stars)

- **Structure:** 39 numbered sections organized by language feature
- **Order:** Types → References → Objects → Arrays → Destructuring → Strings → Functions → Classes → Modules → Properties → Variables → Comparison → Blocks → Comments → Whitespace → Naming → Accessors → Events → Testing
- **Strength:** Comprehensive table of contents with anchor links for quick navigation
- **Weakness:** Very long single-page document (can be overwhelming)

**Google TypeScript Style Guide**

- **Structure:** Organized by concern (file basics → structure → language features → formatting)
- **Order:** Source file basics → File structure → Language features → Formatting → Type system
- **Strength:** Clear hierarchy from high-level to low-level concerns
- **Weakness:** Less emphasis on examples compared to Airbnb

**Microsoft TypeScript Coding Guidelines**

- **Structure:** Simple, flat list by category
- **Order:** Names → Components → Types → null/undefined → Classes → Flags → Comments → Strings → Diagnostic Messages → General Constructs → Style
- **Strength:** Concise and actionable for contributors
- **Weakness:** Lacks detailed rationale and examples
- **Note:** Explicitly states this is for CONTRIBUTORS only, not the community

**StandardJS**

- **Structure:** Philosophy-first, then FAQ-based
- **Order:** Why use standard? → FAQ → Installation → Usage
- **Strength:** Minimal rules, maximum automation philosophy
- **Weakness:** Almost no configuration options (by design)

### Best Organizational Principles

1. **Start with purpose and scope** (all guides)

    - Clear statement of what the guide covers
    - Explicit exclusions (what's in other docs)

2. **Group related rules together** (Airbnb, Google)

    - Language features (types, classes, modules)
    - Formatting (indentation, quotes, semicolons)
    - Naming conventions (files, variables, classes)

3. **Order from high-level to low-level** (Google)

    - File organization → Module structure → Code structure → Formatting

4. **Provide comprehensive navigation** (Airbnb)

    - Table of contents with anchor links
    - Numbered sections for easy reference
    - Searchable headings

5. **Separate automated from manual rules**
    - Prettier/formatter-enforced rules (section 1 in BlueJS)
    - Linter-enforced rules
    - Conventions requiring human judgment

## 2. Balance Between Prescriptive Rules and Guiding Principles

### Airbnb Approach: Prescriptive with Rationale

- **Pattern:** Rule → Why → Example (good/bad)
- **Strength:** Developers understand the reasoning
- **Example:**
    ```javascript
    // 2.1 Use const for all references; avoid using var
    // Why? This ensures you can't reassign references...
    // bad: var a = 1;
    // good: const a = 1;
    ```

### Google Approach: Normative Language

- **Uses RFC 2119 terminology:** must, must not, should, should not, may
- **Clarity:** Unambiguous about requirement level
- **Example:** "Code _must_ use paths to import other TypeScript code"

### StandardJS Approach: Zero Configuration

- **Philosophy:** No decisions to make
- **Trade-off:** Removes bikeshedding but limits flexibility
- **Community impact:** 26.8k forks suggest desire for customization

### Prettier Rationale: Opinionated Minimalism

- **Focus:** What matters vs. what doesn't
- **Explicit disclaimers:** "What Prettier is NOT concerned about"
- **Philosophy:** Limit scope to printing, not transformation

### Recommendations for BlueJS

**Current State:**

- ✅ Good: Clear separation of automated (Prettier) vs. manual rules
- ✅ Good: Rationale provided for most conventions
- ⚠️ Could improve: More explicit requirement levels (must/should/may)

**Suggested Improvements:**

1. Add RFC 2119 terminology section
2. Explicitly state which rules are enforced by tools vs. convention
3. Add a "Philosophy" section explaining core principles

## 3. Effective Use of Examples (Before/After, Good/Bad)

### Pattern Analysis

**All major guides use:**

- ✅ Correct / Good examples
- ❌ Wrong / Bad examples
- Side-by-side comparison when helpful

**Airbnb Format:**

```javascript
// bad
const foo = 'bar';

// good
const foo = 'bar';
```

**Google Format:**

```typescript
// Disallowed:
const foo = 'bar';

// Allowed:
const foo = 'bar';
```

**BlueJS Format:**

```typescript
// ✅ Correct
const foo = 'bar';

// ❌ Wrong
const foo = 'bar';
```

### Effectiveness Ranking

1. **BlueJS emoji approach** (✅/❌) - Most visually scannable
2. **Airbnb comments** (good/bad) - Clear and simple
3. **Google formal language** (Allowed/Disallowed) - Professional but verbose

### Example Best Practices

**DO:**

- Show both correct and incorrect examples
- Use syntax highlighting for code blocks
- Include brief explanations when non-obvious
- Show real-world usage, not just toy examples

**DON'T:**

- Show only negative examples (confusing)
- Use overly complex examples for simple rules
- Rely on examples without explaining the rule
- Mix multiple concepts in one example

### BlueJS Assessment

**Strengths:**

- Excellent use of ✅/❌ markers (highly scannable)
- Comprehensive examples throughout
- Real-world examples from actual codebase

**Opportunities:**

- Could add more "why this matters" context to examples
- Some complex examples could use step-by-step breakdown
- Consider adding "common mistakes" subsections

## 4. Common Sections and Their Ordering

### Meta-Analysis of Section Organization

**Common First Sections:**

1. Purpose/Introduction (all guides)
2. Formatting rules (Prettier-enforced)
3. File/module organization
4. Naming conventions

**Common Middle Sections:** 5. Language features (types, classes, functions) 6. Code organization patterns 7. Best practices by domain

**Common Final Sections:** 8. Special patterns/edge cases 9. Complete examples 10. Maintenance/contribution guidelines

### Recommended Section Order (Synthesis)

Based on analysis of all guides and current BlueJS structure:

```
1. Purpose and Scope                  (Meta)
2. Formatting Rules                   (Automated - Prettier)
3. File Naming Conventions            (High-level structure)
4. Code Naming Conventions            (Implementation details)
5. Module Organization                (Architecture)
6. Special Patterns                   (Edge cases)
7. Complete Example                   (Synthesis)
8. Maintenance                        (Meta)
```

**Rationale for this order:**

- Start with automation (formatting) - least controversial
- Move to file organization (visible in file system)
- Then to code naming (visible in code)
- Then to module patterns (understanding relationships)
- End with edge cases and complete examples

### Current BlueJS Structure Assessment

**Current Order:**

1. Purpose and Scope ✅
2. Formatting Rules ✅
3. File Naming Conventions ✅
4. Code Naming Conventions ✅
5. Module Organization ✅
6. Special Patterns ✅
7. Complete Example ✅
8. Maintenance ✅

**Verdict:** BlueJS structure is already well-organized and follows best practices!

## 5. Examples from Major Projects

### Airbnb JavaScript (148k stars)

**Key Features:**

- Comprehensive (39 sections)
- Strong use of ESLint rule references
- Extensive community adoption proof
- "In the Wild" section showing major users

**Sample Rule:**

```javascript
// 7.1 Use named function expressions instead of function declarations
// Why? Function declarations are hoisted...

// bad
function foo() { ... }

// good
const short = function longUniqueMoreDescriptiveLexicalFoo() { ... };
```

**Lessons for BlueJS:**

- Link to automated enforcement tools (ESLint rules)
- Consider "Who uses this" social proof section

### Google TypeScript Style Guide

**Key Features:**

- Normative language (must/should/may)
- Clear enforcement levels
- Extensive rationale for each rule
- Focus on Google-specific constraints

**Sample Rule:**

```typescript
// Export visibility
// TypeScript does not support restricting visibility.
// Only export symbols used outside the module.
```

**Lessons for BlueJS:**

- Use normative language for clarity
- Explicitly state enforcement mechanism

### Microsoft TypeScript Coding Guidelines

**Key Features:**

- Internal team guide, not prescriptive for community
- Very concise (13 categories)
- Strong warning that this is for contributors only
- Focus on consistency over perfection

**Sample Rule:**

```
Names
1. Use PascalCase for type names
2. Do not use "I" as a prefix for interface names
3. Use PascalCase for enum values
```

**Lessons for BlueJS:**

- Clear disclaimer about scope (already done well)
- Concise bullet points work for contributor guides

### StandardJS (148k users)

**Key Features:**

- Zero configuration philosophy
- FAQ-driven documentation
- Strong opinions, minimal options
- Automatic fixing emphasis

**Sample Philosophy:**

```
No configuration. The easiest way to enforce code quality.
Just drop it in.
```

**Lessons for BlueJS:**

- Emphasize what's automated vs. manual
- FAQ section could be useful for common questions

## 6. How to Keep Style Guides Actionable and Enforceable

### Automation Strategies

**1. Clearly Mark Automated Rules**

- Prettier: Formatting (indentation, quotes, semicolons)
- ESLint: Code quality (unused vars, no-console, etc.)
- TypeScript: Type safety

**Example from BlueJS (excellent):**

```markdown
## 1. Formatting Rules

These rules are enforced by Prettier (`prettier.config.mjs`).
When Prettier configuration changes, this section must be updated.
```

**2. Provide Tool Configuration**
All guides include:

- Installation instructions
- Configuration file examples
- Editor integration guides
- CI/CD integration examples

**3. Make Violations Obvious**

- Pre-commit hooks
- CI checks that fail on violations
- Editor highlighting

### Manual Rule Enforcement

**Code Review Focus Areas:**

1. Naming conventions (hardest to automate)
2. Architecture patterns (requires human judgment)
3. Documentation quality
4. Test coverage

**Microsoft's Approach:**

```
Please do not file issues about these guidelines.
These are for contributors to TypeScript's codebase.
```

- Sets clear expectations about scope

**Airbnb's Approach:**

- Links to ESLint configs
- Badges for style guide compliance
- Community enforcement through forks

### Enforcement Hierarchy (Best Practice)

```
Level 1: Automated (Prettier, ESLint)
  ↓ Fail fast, no human intervention needed
Level 2: Lint warnings (ESLint, TSLint)
  ↓ Caught in development, can be bypassed with comment
Level 3: Code review (Human judgment)
  ↓ Architecture, naming, patterns
Level 4: Documentation (Aspirational)
  ↓ "Should" and "may" recommendations
```

### BlueJS Assessment

**Current Enforcement:**

- ✅ Level 1: Prettier config documented
- ✅ Level 2: ESLint mentioned in AGENTS.md
- ✅ Level 3: Clear patterns for code review
- ⚠️ Could improve: More explicit about what's enforced where

**Suggestions:**

1. Add enforcement level markers to each rule

    ```markdown
    ### Semicolons [AUTOMATED: Prettier]

    ### Private Fields [CONVENTION: Code Review]
    ```

2. Create enforcement summary table
    ```markdown
    | Rule Category | Enforcement | Tool     |
    | ------------- | ----------- | -------- |
    | Formatting    | Automated   | Prettier |
    | Naming        | Code Review | Human    |
    ```

## 7. Integration with Linters and Automated Tools

### Tooling Ecosystem

**All major projects provide:**

1. Shareable configs (npm packages)
2. Editor plugins
3. Pre-commit hooks
4. CI/CD examples

### Airbnb's Ecosystem

**Packages:**

- `eslint-config-airbnb` - Full config
- `eslint-config-airbnb-base` - Base without React
- `babel-preset-airbnb` - Babel configuration

**Integration:**

```json
{
    "extends": "airbnb",
    "rules": {
        // Override specific rules
    }
}
```

### Google's Approach

**TypeScript-specific tooling:**

- `gts` (Google TypeScript Style) - Complete toolchain
- Integrates formatting, linting, fixing
- Zero-config approach

```bash
npx gts init  # Sets up entire toolchain
npx gts check # Runs all checks
npx gts fix   # Auto-fixes issues
```

### StandardJS Ecosystem

**Philosophy: The tool IS the standard**

```bash
standard --fix  # One command to rule them all
```

**Plugins:**

- `standard` - The main tool
- `semistandard` - With semicolons
- `standardx` - With custom tweaks

### BlueJS Current State

**Tools in use:**

- Prettier (formatting)
- ESLint (linting)
- TypeScript compiler (type checking)

**Documentation:**

- ✅ Prettier config well-documented in STYLE_GUIDE.md
- ✅ ESLint config exists (`eslint.config.mjs`)
- ⚠️ ESLint rules not documented in STYLE_GUIDE.md

### Recommendations for BlueJS

**1. Add "Tool Integration" Section**

```markdown
## 9. Tool Integration

### Prettier (Formatting)

- Config: `prettier.config.mjs`
- Run: `pnpm format`
- Pre-commit: Configured in `.git/hooks/pre-commit`

### ESLint (Code Quality)

- Config: `eslint.config.mjs`
- Run: `pnpm lint`
- Rules: See [ESLint Configuration](../config/eslint-rules.md)

### TypeScript (Type Safety)

- Config: `tsconfig.json`
- Run: `pnpm build`
```

**2. Document Custom ESLint Rules**
Create a separate document for ESLint rules if they're extensive, or add a section:

```markdown
### ESLint Rules

**Enforced:**

- `no-var` - Use const/let instead of var
- `prefer-const` - Use const when variable is not reassigned
- `no-unused-vars` - Catch unused variables

**Disabled:**

- `@typescript-eslint/no-explicit-any` - Allowed for migration
```

**3. Add Editor Setup Guide**
Like Airbnb and StandardJS, provide editor integration:

````markdown
## Editor Integration

### VS Code

1. Install extensions:

    - Prettier - Code formatter
    - ESLint
    - TypeScript and JavaScript Language Features

2. Add to `.vscode/settings.json`:
    ```json
    {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
    ```
````

````

## 8. Length and Detail Considerations

### Length Analysis

**Airbnb JavaScript:**
- ~25,000 words
- 39 major sections
- Comprehensive examples throughout
- Community: Loves it (148k stars)

**Google TypeScript:**
- ~15,000 words
- More concise, corporate style
- Fewer examples, more normative

**Microsoft TypeScript:**
- ~2,000 words
- Very brief contributor guide
- Assumes familiarity with TypeScript

**StandardJS:**
- ~10,000 words (mostly FAQ)
- Philosophy over rules
- Automation over documentation

**BlueJS Current:**
- ~10,000 words
- Detailed but focused
- Good balance of examples and rules

### Optimal Length Principles

**1. Match Scope to Audience**
- Contributors: Shorter, more prescriptive (Microsoft model)
- Community: Longer, more educational (Airbnb model)
- Internal: Balance (BlueJS current approach)

**2. Use Progressive Disclosure**
- Quick reference at top
- Details in subsections
- Examples inline
- Rationale in expandable sections

**3. Split When Necessary**
- Style guide for conventions
- Architecture guide for patterns (✅ BlueJS does this)
- Contributing guide for process
- Tool configs in separate files

### BlueJS Length Assessment

**Current: ~1,727 lines / ~10,000 words**

**Breakdown:**
- Formatting: 15% (automated rules)
- File naming: 12% (structure)
- Code naming: 20% (conventions)
- Module organization: 40% (patterns and utilities)
- Special patterns: 8% (edge cases)
- Maintenance: 5% (meta)

**Verdict:** Well-balanced length for a project style guide

**Opportunities:**
1. Could split "Module Organization" section (currently 40% of guide)
2. Consider moving utility organization to ARCHITECTURE.md
3. Could create separate "Utility Organization Guide" if pattern grows

### Detailed vs. Concise Trade-offs

**When to be detailed:**
- New or non-obvious patterns
- Common mistakes need prevention
- Rationale is important for buy-in

**When to be concise:**
- Industry-standard conventions
- Automated enforcement
- Obvious applications

**Example of good balance (from BlueJS):**
```markdown
### Semicolons

- **Always required** at the end of statements
- Configured: `semi: true`

// Good: Clear rule, references automation, brief example
````

**Example of necessary detail (from BlueJS):**

```markdown
### 4.5 Utility Function Organization

Organizing helper functions and utilities follows a clear hierarchy...

[400+ lines of detailed guidance]

// Good: Complex topic requires thorough explanation
```

## Key Findings Summary

### What BlueJS is Doing Well

1. ✅ **Clear separation of concerns** (STYLE_GUIDE.md vs ARCHITECTURE.md)
2. ✅ **Excellent use of visual markers** (✅/❌ is more scannable than comments)
3. ✅ **Automated rules clearly marked** (Section 1: Prettier-enforced)
4. ✅ **Real-world examples** from actual codebase
5. ✅ **Comprehensive coverage** without being overwhelming
6. ✅ **Good section organization** (high-level to low-level)
7. ✅ **Maintenance section** (how to keep guide updated)

### Opportunities for Improvement

1. **Add normative language** (must/should/may from RFC 2119)
2. **Add enforcement markers** to each rule
3. **Document ESLint rules** (currently undocumented)
4. **Add editor integration guide** (like Airbnb/StandardJS)
5. **Consider splitting Module Organization** (currently 40% of guide)
6. **Add "Philosophy" section** explaining core principles
7. **Add enforcement summary table** (what's automated vs. manual)

### Recommended Priority Order

**High Priority:**

1. Add normative language section
2. Add enforcement markers to rules
3. Document ESLint configuration

**Medium Priority:** 4. Add editor integration guide 5. Add philosophy/principles section 6. Create enforcement summary table

**Low Priority:** 7. Consider splitting Module Organization section 8. Add "Who uses BlueJS" section (if public) 9. Add FAQ section for common questions

## Conclusion

BlueJS STYLE_GUIDE.md is already well-structured and follows industry best practices from major projects like Airbnb, Google, and Microsoft. The main opportunities for improvement are:

1. **Formalize enforcement levels** (automated vs. manual)
2. **Document tooling integration** (ESLint, editor setup)
3. **Add normative language** for clarity (must/should/may)

The guide's current length (~10,000 words) is appropriate for its scope, and the organization from high-level (formatting) to low-level (special patterns) follows proven patterns from successful style guides.

The emphasis on automation (Prettier for formatting), clear visual markers (✅/❌), and real-world examples makes it more effective than many industry guides. With the suggested improvements, it will be a reference-quality style guide for TypeScript/JavaScript projects.

---

**References:**

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Microsoft TypeScript Coding Guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
- [StandardJS](https://standardjs.com)
- [Prettier Rationale](https://prettier.io/docs/en/rationale.html)

**Last Updated:** February 6, 2026
