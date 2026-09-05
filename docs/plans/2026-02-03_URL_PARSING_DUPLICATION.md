# URL Parsing Code Duplication Resolution Plan

**Date:** February 3, 2026  
**Status:** ✅ Implemented  
**Archived:** February 3, 2026  
**Priority:** High  
**Reference:** `docs/plans/2026-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md`

---

## 📦 Archive Notice

This plan has been implemented and archived. The resolution involved consolidating URL parsing utilities from `@blue/router` into `@blue/http` following the approach detailed in `docs/plans/2026-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md`.

---

## Overview

This document outlines the plan for resolving significant code duplication in URL parsing functionality across three packages: `@blue/parser`, `@blue/http`, and `@blue/router`.

## Problem Statement

### Affected Files and Line Counts

| Package        | File                        | Lines   | Functionality                             |
| -------------- | --------------------------- | ------- | ----------------------------------------- |
| `@blue/http`   | `src/query-string.ts`       | 147     | Query string parsing/stringification      |
| `@blue/router` | `src/to-query-string.ts`    | 142     | Query string stringification (duplicate)  |
| `@blue/router` | `src/from-query-string.ts`  | 125     | Query string parsing (duplicate)          |
| `@blue/parser` | `src/matrix-string.ts`      | 119     | Matrix string parsing                     |
| `@blue/router` | `src/from-matrix-string.ts` | 57      | Matrix string parsing (duplicate)         |
| `@blue/router` | `src/to-matrix-string.ts`   | 56      | Matrix string stringification (duplicate) |
| **Total**      | **6 files**                 | **646** | **~300-400 lines of duplication**         |

### Duplication Details

**Query String Duplication:**

- `packages/blue-http/src/query-string.ts` (147 lines)
- `packages/blue-router/src/to-query-string.ts` (142 lines)
- **Estimated duplication:** ~126 lines, 389 tokens (~95% duplicate)

**Matrix String Duplication:**

- `packages/blue-parser/src/matrix-string.ts` (119 lines)
- `packages/blue-router/src/from-matrix-string.ts` (57 lines)
- `packages/blue-router/src/to-matrix-string.ts` (56 lines)
- **Estimated duplication:** 10-29 lines, 164-212 tokens per clone

### Root Cause

The router package (`@blue/router`) does not currently depend on the parser (`@blue/parser`) or HTTP (`@blue/http`) packages. When URL parsing functionality was needed in the router, the code was duplicated instead of establishing proper dependencies.

**Current Dependencies (relevant):**

```json
// packages/blue-router/package.json
{
    "dependencies": {
        "@blue/core": "workspace:*",
        "@blue/util": "workspace:*"
        // Missing: @blue/parser, @blue/http
    }
}
```

## Resolution Options

### Option A: Router Depends on Parser/HTTP (Recommended for Manual Review)

**Approach:**

1. Add `@blue/parser` to `@blue/router` dependencies
2. Add `@blue/http` to `@blue/router` dependencies
3. Delete duplicated files in router:
    - `src/to-query-string.ts` → use `@blue/http`
    - `src/from-query-string.ts` → use `@blue/http`
    - `src/from-matrix-string.ts` → use `@blue/parser`
    - `src/to-matrix-string.ts` → use `@blue/parser`
4. Update imports in `src/path-route.ts` and tests

**Pros:**

- ✅ Simplest solution
- ✅ Leverages existing, tested code
- ✅ No new packages to maintain
- ✅ Clear dependency structure

**Cons:**

- ⚠️ Increases router package dependencies
- ⚠️ May pull in unneeded functionality
- ⚠️ Creates tighter coupling between packages

**Impact:**

- **Files deleted:** 4 files (267 lines)
- **Dependencies added:** 2 packages
- **Test updates:** ~5 test files
- **Breaking changes:** None (internal refactoring only)

---

### Option B: New `@blue/url` Package

**Approach:**

1. Create new package `@blue/url`
2. Extract URL parsing utilities from parser, http, router
3. All three packages depend on `@blue/url`
4. Update imports across all affected packages

**Pros:**

- ✅ Clean separation of concerns
- ✅ Single source of truth for URL utilities
- ✅ Reduces coupling between http/parser/router

**Cons:**

- ⚠️ New package to maintain
- ⚠️ More extensive refactoring required
- ⚠️ May be overkill for this specific problem
- ⚠️ Additional build/test infrastructure

**Impact:**

- **New package:** `@blue/url` (~400 lines)
- **Files refactored:** 6+ files across 3 packages
- **Test migration:** ~8 test files to move/update
- **Breaking changes:** None (maintain existing exports)

---

### Option C: Promote to `@blue/util`

**Approach:**

1. Move query string utilities to `@blue/util/src/url/query-string.ts`
2. Move matrix string utilities to `@blue/util/src/url/matrix-string.ts`
3. Update imports in http, parser, router packages
4. Delete duplicates

**Pros:**

- ✅ No new package needed
- ✅ `@blue/util` already widely used
- ✅ URL utilities are general-purpose

**Cons:**

- ⚠️ `@blue/util` may become bloated
- ⚠️ URL utilities may not fit util's purpose (integration layer)
- ⚠️ Creates circular dependency risk (util → parser → util)

**Impact:**

- **Files added to util:** 2-3 files (~400 lines)
- **Files deleted:** 6 files from other packages
- **Risk:** Medium (circular dependency concerns)

---

### Option D: Designate Parser as Canonical Source

**Approach:**

1. Move all URL parsing to `@blue/parser`
2. HTTP and router import from parser
3. Parser becomes the authority for URL utilities

**Pros:**

- ✅ Parser already has URL parsing logic
- ✅ Semantic fit (parsing is parser's domain)
- ✅ No new package needed

**Cons:**

- ⚠️ HTTP depending on parser feels architecturally odd
- ⚠️ Mixes parsing with HTTP concerns
- ⚠️ Less flexible than dedicated package

**Impact:**

- **Files moved to parser:** 2 files from HTTP (~150 lines)
- **Dependencies added:** parser → http, router
- **Risk:** Medium (architectural coupling)

---

## Decision Framework

### Questions for Manual Review

Before choosing a resolution option, answer these questions:

1. **Dependency Philosophy:**

    - Is it acceptable for `@blue/router` to depend on `@blue/http`?
    - Is it acceptable for `@blue/router` to depend on `@blue/parser`?

2. **Code Ownership:**

    - Where do query string utilities conceptually belong?
    - Where do matrix string utilities conceptually belong?

3. **Future Growth:**

    - Will URL utilities expand significantly (warrant dedicated package)?
    - Are there other URL-related utilities to add?

4. **Package Boundaries:**
    - Should parser focus purely on parsing primitives (arcsecond wrappers)?
    - Should HTTP focus purely on HTTP protocol concerns?
    - Should router focus purely on routing logic?

### Comparison Matrix

| Criteria                  | Option A   | Option B   | Option C | Option D |
| ------------------------- | ---------- | ---------- | -------- | -------- |
| **Simplicity**            | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⭐⭐⭐   | ⭐⭐⭐⭐ |
| **Maintainability**       | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐ |
| **Architectural Clarity** | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐     | ⭐⭐⭐   |
| **Implementation Effort** | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Risk**                  | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐     | ⭐⭐⭐   |
| **Future Scalability**    | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐ |

---

## Implementation Plan (Option A - Tentative)

**Note:** This plan assumes Option A is chosen. Adapt as needed based on manual review decision.

### Phase 1: Analysis and Preparation (1-2 hours)

**1.1: File Comparison**

Manually compare duplicated files to verify similarity:

```bash
# Compare query string implementations
diff packages/blue-http/src/query-string.ts \
     packages/blue-router/src/to-query-string.ts

diff packages/blue-http/src/query-string.ts \
     packages/blue-router/src/from-query-string.ts

# Compare matrix string implementations
diff packages/blue-parser/src/matrix-string.ts \
     packages/blue-router/src/from-matrix-string.ts

diff packages/blue-parser/src/matrix-string.ts \
     packages/blue-router/src/to-matrix-string.ts
```

**1.2: Dependency Analysis**

Check for any subtle differences that justify duplication:

- Different parameter types
- Different error handling
- Different edge case behavior
- Performance optimizations

**1.3: Test Coverage Verification**

```bash
# Verify test coverage for all affected files
nx run @blue/http:test -- --coverage
nx run @blue/router:test -- --coverage
nx run @blue/parser:test -- --coverage
```

Ensure >80% coverage before refactoring.

---

### Phase 2: Dependency Updates (30 minutes)

**2.1: Update Router package.json**

```bash
cd packages/blue-router
```

**File:** `packages/blue-router/package.json`

```json
{
    "dependencies": {
        "@blue/core": "workspace:*",
        "@blue/http": "workspace:*", // ADD
        "@blue/parser": "workspace:*", // ADD
        "@blue/util": "workspace:*"
    },
    "devDependencies": {
        // ... existing
        "@blue/http": "workspace:*", // ADD to dev as well
        "@blue/parser": "workspace:*" // ADD to dev as well
    },
    "peerDependencies": {
        "@blue/http": "workspace:*", // ADD
        "@blue/parser": "workspace:*" // ADD
    }
}
```

**2.2: Install Dependencies**

```bash
pnpm install
```

---

### Phase 3: Import Updates (1 hour)

**3.1: Update path-route.ts**

**File:** `packages/blue-router/src/path-route.ts`

**Before:**

```typescript
import fromMatrixString from './from-matrix-string';
import toMatrixString from './to-matrix-string';
import toQueryString from './to-query-string';
import fromQueryString from './from-query-string';
```

**After:**

```typescript
import { fromMatrixString, toMatrixString } from '@blue/parser';
import { QueryString } from '@blue/http';

// Use QueryString.parse() and QueryString.stringify()
// OR if http exports fromQueryString/toQueryString:
import { fromQueryString, toQueryString } from '@blue/http';
```

**Note:** Verify the exact export names in http/parser packages.

**3.2: Update router index.ts**

**File:** `packages/blue-router/src/index.ts`

**Before:**

```typescript
export { default as fromMatrixString } from './from-matrix-string';
export { default as fromQueryString } from './from-query-string';
export { default as toMatrixString } from './to-matrix-string';
export { default as toQueryString } from './to-query-string';
```

**After:**

```typescript
// Re-export from canonical sources for backward compatibility
export { fromMatrixString, toMatrixString } from '@blue/parser';
export { fromQueryString, toQueryString } from '@blue/http';

// OR if maintaining backward compat is critical:
export { fromMatrixString, toMatrixString } from '@blue/parser';

export {
    QueryString as fromQueryString, // Adapt as needed
    QueryString as toQueryString,
} from '@blue/http';
```

---

### Phase 4: Test Updates (1-2 hours)

**4.1: Update Router Tests**

Update imports in test files:

```bash
# Files to update:
packages/blue-router/test/to-query-string.spec.ts
packages/blue-router/test/from-query-string.spec.ts
packages/blue-router/test/to-matrix-string.spec.ts
packages/blue-router/test/from-matrix-string.spec.ts
```

**Options:**

- **A:** Keep tests, update imports to point to http/parser
- **B:** Delete tests (rely on http/parser tests)
- **C:** Keep tests as integration tests

**Recommendation:** Option C - Keep as integration tests to verify router's usage of these utilities.

**4.2: Update Test Imports**

**Example:** `packages/blue-router/test/to-query-string.spec.ts`

**Before:**

```typescript
import toQueryString from '../src/to-query-string';
```

**After:**

```typescript
import { toQueryString } from '@blue/http';
// OR
import { toQueryString } from '../src/index'; // Via re-export
```

---

### Phase 5: File Deletion (15 minutes)

**5.1: Delete Duplicate Files**

```bash
cd packages/blue-router/src

# Delete duplicates
rm from-matrix-string.ts
rm to-matrix-string.ts
rm from-query-string.ts
rm to-query-string.ts
```

**5.2: Verify No Remaining References**

```bash
# Search for imports of deleted files
grep -r "from '\./from-matrix-string'" packages/blue-router/
grep -r "from '\./to-matrix-string'" packages/blue-router/
grep -r "from '\./from-query-string'" packages/blue-router/
grep -r "from '\./to-query-string'" packages/blue-router/

# Should return no results
```

---

### Phase 6: Build and Test (30 minutes)

**6.1: Build Router Package**

```bash
nx run @blue/router:build:lib
```

**Expected:** Successful build, no errors.

**6.2: Run Router Tests**

```bash
nx run @blue/router:test
```

**Expected:** All tests pass.

**6.3: Build All Packages**

```bash
pnpm build
```

**Expected:** No build failures.

**6.4: Run All Tests**

```bash
pnpm test
```

**Expected:** No test failures.

---

### Phase 7: Documentation (30 minutes)

**7.1: Update Router README (if exists)**

Document the dependency changes and rationale.

**7.2: Update CHANGELOG**

```markdown
## [Unreleased]

### Changed

- **BREAKING INTERNAL:** Router now depends on @blue/parser and @blue/http
- Removed duplicated URL parsing code (from-query-string, to-query-string,
  from-matrix-string, to-matrix-string)
- Router now re-exports URL utilities from canonical sources

### Migration

- No public API changes
- Internal refactoring only
- All exports remain compatible
```

**7.3: Update This Plan**

Mark as "Implemented" and document any deviations from plan.

---

## Alternative Implementation Plans

### If Option B Chosen: New @blue/url Package

**Steps:**

1. Create `packages/blue-url/` directory
2. Initialize package with standard structure
3. Extract common code from http/parser/router
4. Design unified API (parseQueryString, stringifyQueryString, etc.)
5. Update all three packages to depend on `@blue/url`
6. Delete duplicates
7. Run tests

**Timeline:** 4-6 hours

---

### If Option C Chosen: Promote to @blue/util

**Steps:**

1. Create `packages/blue-util/src/url/` directory
2. Move query-string utilities
3. Move matrix-string utilities
4. Update http/parser/router to import from util
5. Verify no circular dependencies
6. Delete duplicates
7. Run tests

**Timeline:** 3-4 hours

---

### If Option D Chosen: Parser as Canonical

**Steps:**

1. Move http query-string code to parser
2. Update http to import from parser
3. Delete router duplicates
4. Update router to import from parser
5. Verify builds and tests
6. Document rationale for parser owning URL utilities

**Timeline:** 2-3 hours

---

## Success Metrics

### Quantitative

- ✅ Duplicate code reduced from ~300-400 lines to 0
- ✅ Code duplication percentage: 0% for URL parsing
- ✅ File count reduction: -4 files (267 lines)
- ✅ All tests pass
- ✅ Build succeeds

### Qualitative

- ✅ Clear dependency structure
- ✅ Single source of truth for URL utilities
- ✅ Improved maintainability
- ✅ No breaking changes to public API
- ✅ Documentation updated

---

## Risk Assessment

### Low Risk Items

- ✅ Internal refactoring (no public API changes)
- ✅ Existing test coverage
- ✅ Type safety ensures correctness

### Medium Risk Items

- ⚠️ Subtle behavioral differences between duplicates
- ⚠️ Unintended breaking changes for internal consumers
- ⚠️ Circular dependency issues (if Option C chosen)

### Mitigation Strategies

1. **Thorough Testing:** Run full test suite multiple times
2. **Manual Review:** Compare duplicates line-by-line before deletion
3. **Staged Rollout:** Update one package at a time
4. **Rollback Plan:** Git revert if issues discovered

---

## Manual Review Checklist

Before implementing, complete this checklist:

- [ ] Compare all duplicated files side-by-side
- [ ] Identify any behavioral differences
- [ ] Verify test coverage >80%
- [ ] Choose resolution option (A, B, C, or D)
- [ ] Document decision rationale
- [ ] Review dependency impacts
- [ ] Check for circular dependency risks
- [ ] Plan test migration strategy
- [ ] Estimate implementation timeline
- [ ] Identify breaking change risks

---

## Timeline Estimate

### Option A: Router Depends on Parser/HTTP

- **Phase 1:** 1-2 hours (analysis)
- **Phase 2:** 30 minutes (dependencies)
- **Phase 3:** 1 hour (imports)
- **Phase 4:** 1-2 hours (tests)
- **Phase 5:** 15 minutes (deletion)
- **Phase 6:** 30 minutes (build/test)
- **Phase 7:** 30 minutes (docs)
- **Total:** 5-7 hours

### Other Options

- **Option B:** 4-6 hours (new package)
- **Option C:** 3-4 hours (promote to util)
- **Option D:** 2-3 hours (parser canonical)

---

## References

- **Original Issue:** `docs/plans/2026-02-01_UTILITY_ORGANIZATION.md` lines 130-150
- **Affected Packages:** `@blue/parser`, `@blue/http`, `@blue/router`
- **Related Plans:** `docs/plans/2026-02-01_FILE_REFACTORING.md` (may need updates)
- **Architecture:** `ARCHITECTURE.md` (dependency management patterns)

---

## Next Steps

1. **Manual Review:** Review all 6 affected files in detail
2. **Decision:** Choose resolution option (A, B, C, or D)
3. **Document:** Record decision rationale in this plan
4. **Implement:** Follow implementation plan for chosen option
5. **Validate:** Verify all tests pass and no regressions
6. **Archive:** Mark this plan as complete

---

**Status:** Awaiting Manual Review  
**Author:** OpenCode AI Agent  
**Created:** February 3, 2026  
**Last Updated:** February 3, 2026
