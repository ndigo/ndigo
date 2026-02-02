# Utility Organization Implementation Plan

**Date:** February 1, 2025  
**Status:** Planning - Corrected Approach  
**Reference:** STYLE_GUIDE.md Section 4.5

## Overview

This document outlines the plan for systematically identifying and extracting duplicated utility code across the BlueJS monorepo.

**Critical Correction:** Internal files (`_util.ts`, `_parser.ts`, etc.) should only be created when there are **actual local utility functions** to define, not just for centralizing imports or pass-through re-exports.

## Decision Rule

> **If you delete all the re-export lines and the file becomes empty, the file shouldn't exist.**

## Current State

**Existing Internal Files (Correct - Contain Local Utilities):**
- ✅ `@blue/parser/src/_util.ts` - Has local utilities: `joinOnEmptyString`, `lengthLessThanN`, `xprodAndJoinOnString`, `xprodAll`, `xprod3`, `rangeN`, `trailingJoin`
- ✅ `@blue/parser/src/_parser.ts` - Parser primitive utilities
- ✅ `@blue/context/src/_util.ts` - Has local utility: `isNotNil`
- ✅ `@blue/platform-web/src/_util.ts` - Has local utilities: `isDefined`, `isFunction`, `hasFunction`, `isDefinedAnd`
- ✅ `@blue/util/src/_natural-sort.ts` - Natural sorting algorithm implementation
- ✅ Test helpers (3 files): `_expect.ts`, `_worker.ts` - Custom test utilities

**Files Created Incorrectly (Deleted):**
- ❌ `@blue/core/src/_util.ts` - Only re-exports, no local utilities (DELETED)
- ❌ `@blue/dispatcher/src/_util.ts` - Only re-exports, no local utilities (DELETED)
- ❌ `@blue/logger/src/_util.ts` - Only re-exports, no local utilities (DELETED)
- ❌ `@blue/http/src/_util.ts` - Only re-exports, no local utilities (DELETED)
- ❌ `@blue/router/src/_util.ts` - Only re-exports, no local utilities (DELETED)
- ❌ `@blue/util/src/_util.ts` - Only re-exports of internal files (DELETED)
- ❌ `@blue/view-webcomponent/src/_util.ts` - Only pass-through re-export (DELETED)

**Files Merged:**
- ⚠️ `@blue/parser/src/_xprod.ts` - Used by only 1 file (below 3-file threshold) → MERGED into `_util.ts`

## Phase 1: Remediation (Completed)

### 1.1: Delete Incorrect Files (7 files)

✅ **Completed:** Removed 7 `_util.ts` files that only contained re-exports with no local utilities.

**Impact:** No breaking changes (all files were untracked, never used)

### 1.2: Merge `_xprod.ts` into `_util.ts`

✅ **Completed:** Following the 3-file threshold guideline:

1. Added xprod functions to `@blue/parser/src/_util.ts`
2. Updated import in `brace-expression.ts` from `./_xprod` to `./_util`
3. Deleted `packages/blue-parser/src/_xprod.ts`

### 1.3: Update Documentation

✅ **Completed:**
- Added "Internal Files Must Contain Local Utilities" to STYLE_GUIDE.md Section 4.5 (~200 lines)
- Enhanced test file conventions in STYLE_GUIDE.md Section 2 (~40 lines)
- Updated AGENTS.md Section 4 with corrected guidance (~30 lines)
- Enhanced ARCHITECTURE.md cross-reference (~2 lines)
- Rewrote this planning document with corrected approach

### 1.4: Verification

Run verification commands:

```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Verify correct internal files remain
find packages -name "_*.ts" -path "*/src/*" | sort

# Should show:
# - blue-context/src/_util.ts ✅
# - blue-parser/src/_parser.ts ✅
# - blue-parser/src/_util.ts ✅
# - blue-platform-web/src/_util.ts ✅
# - blue-util/src/_natural-sort.ts ✅
# (and test helpers in test/ directories)
```

## Phase 2: Scan for Actual Duplicates (Future)

### 2.1: Identify Duplicated Utility Code

Scan for actual duplicated functions and patterns (NOT just common imports):

```bash
# Find duplicated utility functions
rg "^(export )?const \w+ = " packages/*/src --type ts -A 5 | sort | uniq -c | sort -rn

# Find duplicated regex patterns
rg "const.*_REGEX.*=.*/.*/[gimuy]*" packages/*/src --type ts

# Find duplicated functional compositions
rg "const \w+ = (pipe|compose)\(" packages/*/src --type ts -A 3

# Use jscpd for copy/paste detection
npx jscpd packages/*/src --min-lines 3 --format typescript
```

### 2.2: Categorize Findings

For each duplicate found:
1. **Count usage** - How many files use it?
2. **Determine domain** - Same category or cross-cutting?
3. **Choose extraction target:**
   - Same category, 3+ files → Dedicated file (e.g., `_validators.ts`)
   - Cross-cutting, 4+ files → Internal file (`_util.ts` or `_<domain>.ts`)
   - Multiple packages → Promote to `@blue/util`

### 2.3: Extract When Appropriate

**Only extract when:**
- Thresholds are met (3+ or 4+ files)
- There's actual duplicated code (not just similar imports)
- Extraction improves maintainability

**Process:**
1. Create/update internal file with actual utility functions
2. Add re-exports as supporting infrastructure (optional)
3. Update consuming files to import from internal file
4. Run tests after each extraction
5. Commit incrementally with clear messages

## Phase 3: Create Internal Files (As Needed)

### When to Create

Only create when you have:
- 4+ duplicated utilities across categories in a package
- Package-specific utilities not suitable for `@blue/util`
- Composed/partial functions from `@blue/util` imports used by multiple files

### Naming Decision

**Choose the appropriate name based on content:**

| Content Type | File Name | Example |
|-------------|-----------|---------|
| Mixed-purpose utilities | `_util.ts` | Re-exports + various helpers |
| Domain-specific (3+ related) | `_<domain>.ts` | `_validators.ts`, `_formatters.ts` |
| Single algorithm | Descriptive name | `_natural-sort.ts`, `_media-type-parser.ts` |
| Test helpers | `test/_<purpose>.ts` | `test/_expect.ts`, `test/_fixtures.ts` |

**Follow Node.js pattern:** Use descriptive names (`_http_common.js`) over generic (`_util.js`) when utilities serve a clear domain.

### Creation Process

1. **Verify need exists** - Check thresholds and actual duplication
2. **Choose appropriate name** - Generic vs domain-specific vs algorithm-specific
3. **Create file with local utilities** - The actual utility functions that justify the file
4. **Add re-exports (optional)** - Supporting infrastructure for convenience
5. **Update consuming files** - Import from new internal file
6. **Add JSDoc header:**
   ```typescript
   /**
    * Internal utilities for @blue/<package> package.
    * 
    * This file contains:
    * - [Brief description of local utilities]
    * - Re-exports of commonly used utilities (optional)
    * 
    * @internal - Do not export in index.ts or import across package boundaries
    * @author Jeff Rose
    */
   ```
7. **Run tests** - Verify functionality
8. **Commit** - Clear message explaining extraction

## Phase 4: Validation and Documentation (Ongoing)

### 4.1: Validate All Internal Files

Periodic audit to ensure internal files follow guidelines:

```bash
# Find all internal files
find packages -name "_*.ts" -path "*/src/*"

# For each file:
# 1. Read the file
# 2. Identify re-export lines
# 3. Verify local utilities exist beyond re-exports
# 4. If only re-exports → Delete file
```

**Validation Checklist:**
- ✅ Contains actual local utility functions
- ✅ Functions are used by multiple files in package (if `_util.ts`)
- ✅ File name reflects content (generic vs specific)
- ✅ Has proper JSDoc header with `@internal` tag
- ✅ Not exported in package's `index.ts`

### 4.2: Add Enforcement Mechanisms

**ESLint Rule (Future):**
```javascript
// Prevent importing _*.ts across package boundaries
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["../**/_*.ts", "@blue/*/_*.ts"]
      }
    ]
  }
}
```

**Pre-commit Hook:**
```bash
#!/bin/bash
# Fail if underscore files are exported in index.ts
if grep -r "from '\.\/_" packages/*/src/index.ts; then
  echo "Error: Internal files (_*.ts) should not be exported in index.ts"
  exit 1
fi
```

**Package.json Exports Field:**
```json
{
  "exports": {
    ".": "./lib/index.js",
    "./package.json": "./package.json"
    // Explicitly omit lib/_*.js from exports
  }
}
```

## Success Metrics

### Quantitative
- ✅ Zero internal files with only re-exports
- ✅ All internal files pass the "delete re-exports" test
- ✅ <5% code duplication in utilities (measured by jscpd)
- ✅ Internal file ratio stays <10% of total files

### Qualitative
- ✅ Clear guidelines prevent creation of empty re-export files
- ✅ Internal file names communicate purpose clearly
- ✅ Developers know when to extract vs keep inline
- ✅ Code reviews rarely question internal file placement

## Future Re-evaluation

The hybrid internal file naming convention (generic `_util.ts` + specific domain files) will be formally reviewed at a future date.

**See:** `docs/plans/INTERNAL_FILE_NAMING_REVIEW.md` for the evaluation framework.

**Review Triggers:**
- >5 internal files per package (may need directory structure)
- >10% internal file ratio (too many internal files)
- Significant organizational challenges emerge
- Developer confusion about naming conventions

## Package-by-Package Analysis

### Packages Currently Without Internal Files

**These packages may need internal files in the future if actual duplicated utilities emerge:**

| Package | Files | Assessment |
|---------|-------|------------|
| `@blue/core` | 24 | Monitor for duplicated utilities; create `_util.ts` when organic need arises |
| `@blue/dispatcher` | 34 | Largest package - likely candidate for future internal files |
| `@blue/logger` | 47 | Very large - scan for duplicated formatting/transformation logic |
| `@blue/http` | 19 | Monitor for HTTP-specific utility patterns |
| `@blue/router` | 11 | Monitor for routing utility patterns |
| `@blue/validate` | 10 | Small - defer until clear need |
| `@blue/factory` | 8 | Small - defer until clear need |
| `@blue/domain` | 6 | Small - defer until clear need |

**Process for each:**
1. **Do NOT** create `_util.ts` preemptively
2. **Wait** for actual duplicated code to emerge organically
3. **Extract** when thresholds are met (3+ or 4+ files)
4. **Document** rationale for extraction in commit message

### Packages With Correct Internal Files

| Package | File | Status | Content |
|---------|------|--------|---------|
| `@blue/parser` | `_util.ts` | ✅ Correct | Local utilities + re-exports |
| `@blue/parser` | `_parser.ts` | ✅ Correct | Parser primitives |
| `@blue/context` | `_util.ts` | ✅ Correct | Local utility: `isNotNil` |
| `@blue/platform-web` | `_util.ts` | ✅ Correct | Local utilities: `isDefined`, etc. |
| `@blue/util` | `_natural-sort.ts` | ✅ Correct | Natural sorting algorithm |

**These serve as good examples of correct internal file usage.**

## Monitoring and Maintenance

### Ongoing Activities

1. **Code Review Checklist:**
   - Does this `_*.ts` file contain actual utilities?
   - Is the file name appropriate for the content?
   - Could these utilities be promoted to `@blue/util`?

2. **Quarterly Audit:**
   - Review all internal files for correct usage
   - Check for utilities that should be promoted
   - Identify emerging patterns that need documentation

3. **Update Guidelines:**
   - Document new patterns as they emerge
   - Add examples to STYLE_GUIDE.md
   - Refine thresholds based on experience

## References

- **Guidelines:** STYLE_GUIDE.md Section 4.5
- **Agent Instructions:** AGENTS.md Section 4
- **Architecture:** ARCHITECTURE.md
- **Future Review:** docs/plans/INTERNAL_FILE_NAMING_REVIEW.md

---

**Status:** Phase 1 Complete  
**Author:** OpenCode AI Agent  
**Last Updated:** February 1, 2025
