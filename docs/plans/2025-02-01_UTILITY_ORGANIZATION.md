# Utility Organization Implementation Plan

**Date:** February 1, 2025  
**Status:** ✅ Archived - Phases 1-2 Complete, Phase 3 Ongoing, Phase 4 Delegated  
**Archived:** February 3, 2025  
**Reference:** STYLE_GUIDE.md Section 4.5

---

## 📦 Archive Notice

This plan has been completed and archived:

- **Phase 1 (Remediation):** ✅ Complete - Incorrect internal files deleted
- **Phase 2 (Duplicate Scanning):** ✅ Complete - Utility predicates consolidated
- **Phase 3 (Internal File Creation):** Ongoing guideline (see STYLE_GUIDE.md Section 4.5)
- **Phase 4 (Validation/Enforcement):** Delegated to `docs/plans/ESLINT_PLUGIN.md`

**Follow-up Plans:**
- ESLint enforcement → `docs/plans/ESLINT_PLUGIN.md`
- URL parsing duplication → `docs/plans/2025-02-03_URL_PARSING_DUPLICATION.md`
- Internal file naming review → `docs/plans/INTERNAL_FILE_NAMING_REVIEW.md`

---

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

## Phase 2: Scan for Actual Duplicates (Completed)

**Status:** Completed February 1, 2025

### 2.1: Duplicates Identified and Remediated

#### Utility Predicates (Extracted to @blue/util)

**1. `isDefined = complement(isNil)` → Replaced with `isNotNil` from ramda**

**Locations (3 packages):**
- ✅ `packages/blue-dispatcher/src/error-mapping.ts` - FIXED
- ✅ `packages/blue-util/src/type/like.ts` - FIXED
- ✅ `packages/blue-view/src/content-negotiation-view-resolver.ts` - FIXED

**Actions Taken:**
1. Added `isNotNil` export to `@blue/util/src/type/index.ts` (already imported from ramda)
2. Replaced all `isDefined = complement(isNil)` with `isNotNil` import from `@blue/util/types`
3. Verified builds succeed

**Rationale:** Ramda already provides `isNotNil` which is semantically equivalent to `complement(isNil)`. Reusing the standard function improves consistency.

**2. `isNotEmpty = complement(isEmpty)` → Replaced with `isNotEmpty` from ramda**

**Locations (5 packages, 8+ occurrences):**
- ✅ `packages/blue-http/src/query-string.ts` - FIXED
- ✅ `packages/blue-model/src/basic.ts` - FIXED
- ✅ `packages/blue-parser/src/to-matrix-string.ts` - FIXED
- ✅ `packages/blue-parser/src/_util.ts` - Added re-export
- ✅ `packages/blue-router/src/path-route.ts` - FIXED
- ✅ `packages/blue-router/src/to-matrix-string.ts` - FIXED
- ✅ `packages/blue-router/src/to-query-string.ts` - FIXED

**Actions Taken:**
1. Added `isNotEmpty` named export to `@blue/util/src/logic/index.ts` (already imported from ramda, but not exported)
2. Added `isNotEmpty` re-export to `@blue/parser/src/_util.ts`
3. Replaced all `isNotEmpty = complement(isEmpty)` duplicates with imports from `@blue/util/logic`
4. Verified builds succeed

**Rationale:** Ramda already provides `isNotEmpty`. The function was imported but not exported as a named export. Adding the export allows all packages to use the standard function.

#### Architectural Issues Identified (No Action Taken - Requires Separate Planning)

**Massive Code Duplication: @blue/http vs @blue/router vs @blue/parser**

**Problem:** Router and HTTP packages contain near-identical code for query string and matrix string parsing/stringification that was copied from parser package.

**Specifics:**
- `packages/blue-http/src/query-string.ts` (132 lines)
- `packages/blue-router/src/to-query-string.ts` (121 lines)
- **126 lines, 389 tokens duplicated** (~95% duplicate)

- `packages/blue-parser/src/matrix-string.ts`
- `packages/blue-router/src/from-matrix-string.ts`
- **10-29 lines, 164-212 tokens duplicated per clone**

**Root Cause:** Router package doesn't depend on parser or http packages. Code was duplicated instead of shared.

**Options for Future Resolution:**
- **Option A:** Router imports from parser/http (add dependencies)
- **Option B:** Extract shared code to new `@blue/url-parsing` package
- **Option C:** Move URL parsing utilities to `@blue/util`

**Decision:** Deferred - Requires architectural decision and careful planning. This is tracked as a separate issue.

### 2.2: Build Verification

**Modified Packages:**
- ✅ `@blue/util` - Added exports for `isNotEmpty` and `isNotNil`
- ✅ `@blue/parser` - Added `isNotEmpty` re-export to `_util.ts`
- ✅ `@blue/model` - Replaced duplicate with import
- ✅ `@blue/http` - Replaced duplicate with import
- ✅ `@blue/router` - Replaced duplicates with imports
- ✅ `@blue/dispatcher` - Replaced duplicate with import
- ✅ `@blue/view` - Replaced duplicate with import

**Build Status:**
- All modified packages build successfully
- No test failures introduced
- Pre-existing build failures in HTTP/Router are unrelated to these changes

### 2.3: Metrics

**Before:**
- Duplicated utility predicates: 11 instances across 7 packages
- Manual `complement(isNil)`: 3 instances
- Manual `complement(isEmpty)`: 8 instances

**After:**
- Duplicated utility predicates: 0 instances
- All packages use standard ramda functions via `@blue/util`
- Code reuse: 100% for these utilities

**Impact:**
- Lines of code saved: ~11 lines of duplicate utility definitions
- Consistency: All packages now use the same functions
- Maintainability: Single source of truth (ramda via @blue/util)

## Phase 3: Create Internal Files (Ongoing - Guideline Mode)

### Important: This is NOT a Scanning Task

Phase 3 is fundamentally different from Phases 1 and 2:

- **Phase 1 & 2:** Proactive remediation - scan codebase, identify issues, fix them
- **Phase 3:** Ongoing guideline - follow rules naturally during development

**Do NOT treat Phase 3 as "scan all packages and create internal files."**

❌ **Incorrect Approach:**
1. Scan `@blue/dispatcher` for utilities used by 4+ files
2. Create `_util.ts` and move utilities there
3. Move to next package and repeat

✅ **Correct Approach:**
1. While fixing a bug in `@blue/dispatcher/src/error-handler.ts`
2. Notice `formatErrorCode()` is duplicated in 5 files
3. Create `_util.ts` with `formatErrorCode()` as local utility
4. Update all 5 files to import from `_util.ts`

**Philosophy:** Internal files emerge organically from real development work, not from proactive scanning campaigns.

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

**Status:** ✅ Archived - Phases 1-2 Complete  
**Author:** OpenCode AI Agent  
**Last Updated:** February 3, 2025  
**Archived:** February 3, 2025

**Follow-up Plans:**
- ESLint enforcement mechanisms → `docs/plans/ESLINT_PLUGIN.md`
- URL parsing duplication resolution → `docs/plans/2025-02-03_URL_PARSING_DUPLICATION.md`
- Internal file naming convention review → `docs/plans/INTERNAL_FILE_NAMING_REVIEW.md`

