# File Size Refactoring Plan

**Date:** February 1, 2025  
**Status:** Planning  
**Reference:** STYLE_GUIDE.md Section 4.6

## Overview

Analysis of 250 TypeScript source files identified 15 files exceeding 300 lines, requiring evaluation for potential refactoring. This document provides detailed analysis and recommendations for each file.

## Target Metrics

Based on codebase statistics:

- **Ideal:** 20-150 lines per file (80% of files)
- **Review threshold:** 200 lines
- **Refactor threshold:** 300 lines
- **Median file size:** 61 lines
- **Average file size:** 106 lines

## Files Requiring Review

### Priority Classification

| Priority   | Criteria                                             | Action                                |
| :--------- | :--------------------------------------------------- | :------------------------------------ |
| **High**   | >500 lines, multiple responsibilities, complex logic | Refactor immediately                  |
| **Medium** | 300-500 lines, moderate complexity, some cohesion    | Plan refactoring                      |
| **Low**    | >300 lines but single responsibility, high cohesion  | Document rationale, defer refactoring |

---

## File Analysis

### 1. standard-constraints.ts (965 lines) - HIGH PRIORITY

**Package:** `@ndigo/validate`  
**Lines:** 965  
**Exports:** 5 main exports + many constraint functions  
**Current Structure:**

- String validation constraints (email, phone, SSN, URL, etc.)
- Number validation constraints (integer, real, currency, etc.)
- Date validation constraints (temporal, before, after, etc.)
- Type validation constraints (boolean, pattern, etc.)
- Helper functions and utilities

**Issue:** Multiple validation categories in single file violates Single Responsibility Principle.

**Recommendation:** **SPLIT BY CATEGORY**

**Proposed Structure:**

```
standard-constraints.ts (100 lines) - Main entry point, re-exports
├── string-constraints.ts (250 lines) - email, phone, SSN, URL, name, etc.
├── number-constraints.ts (200 lines) - integer, real, currency, range, etc.
├── date-constraints.ts (180 lines) - temporal, before, after, between, etc.
├── type-constraints.ts (150 lines) - boolean, pattern, enumeration, etc.
└── _constraint-util.ts (85 lines) - Shared helpers (normalizeToDate, etc.)
```

**Benefits:**

- Improved discoverability (find all string constraints in one place)
- Easier testing (focused test files per category)
- Reduced merge conflicts (different developers work on different categories)
- Maintains backward compatibility through re-exports

**Risk:** Low - Pure refactoring with re-exports maintains API compatibility

---

### 2. route-handler-mapping.ts (884 lines) - MEDIUM PRIORITY

**Package:** `@ndigo/dispatcher`  
**Lines:** 884  
**Exports:** 12 exports, 8 classes  
**Current Structure:**

- Route handler mapping logic
- Request method handling
- Path parameter extraction
- Response mapping
- Multiple related classes

**Issue:** High line count but cohesive functionality - all related to route handling.

**Recommendation:** **EXTRACT HELPERS TO \_util.ts**

**Proposed Structure:**

```
route-handler-mapping.ts (650 lines) - Core mapping logic
├── _route-mapping-util.ts (150 lines) - Parameter extraction helpers
└── route-handler-types.ts (84 lines) - Type definitions (if many)
```

**Alternative:** Document rationale and **DEFER** if all code is tightly coupled.

**Benefits:**

- Reduced file size without major restructuring
- Extracted utilities testable independently
- Maintains logical cohesion

**Risk:** Low to Medium - Need to verify no circular dependencies

---

### 3. event-emitter.ts (771 lines) - HIGH PRIORITY

**Package:** `@ndigo/context`  
**Lines:** 771  
**Exports:** 19 exports (interfaces, mixins, classes, functions)  
**Current Structure:**

- Core event emitter implementation
- Async event emitter mixin
- Conditional event emitter mixin (once, many, until)
- Positional event emitter mixin (at, first)
- Helper functions

**Issue:** Multiple event emitter variants in single file. Each mixin could be separate module.

**Recommendation:** **SPLIT BY FUNCTIONALITY**

**Proposed Structure:**

```
event-emitter.ts (300 lines) - Core EventEmitter + base implementation
├── async-event-emitter.ts (150 lines) - AsyncEventEmitter mixin
├── conditional-event-emitter.ts (150 lines) - ConditionalEventEmitter mixin
├── positional-event-emitter.ts (120 lines) - PositionalEventEmitter mixin
└── _event-util.ts (51 lines) - Shared helpers
```

**Benefits:**

- Each mixin independently testable
- Users can import only needed functionality
- Clear separation of concerns
- Tree-shaking friendly (unused mixins not bundled)

**Risk:** Medium - Need to carefully manage shared utilities to avoid circular dependencies

---

### 4. http.ts (760 lines) - MEDIUM PRIORITY

**Package:** `@ndigo/http`  
**Lines:** 760  
**Exports:** 21 exports, 4 classes  
**Current Structure:**

- HTTP request/response classes
- HTTP method handling
- Content negotiation
- Multiple related utilities

**Issue:** Large but cohesive HTTP module. All exports work together.

**Recommendation:** **EXTRACT CONSTANTS, DEFER CORE LOGIC**

**Proposed Structure:**

```
http.ts (600 lines) - Core HTTP logic
├── http-constants.ts (100 lines) - HTTP-related constants
└── _http-util.ts (60 lines) - Small helper functions
```

**Alternative:** Document as acceptable large file due to framework integration complexity.

**Benefits:**

- Reduced file size moderately
- Constants separated for easy reference

**Risk:** Low - Conservative refactoring

---

### 5. http-headers.ts (725 lines) - ACCEPTABLE (NO REFACTOR)

**Package:** `@ndigo/http`  
**Lines:** 725  
**Exports:** 124 HTTPHeader constants  
**Current Structure:**

- Single cohesive constant collection
- Organized by category (Authentication, Caching, Conditionals, etc.)

**Issue:** None - This is a textbook example of acceptable large file.

**Recommendation:** **KEEP AS-IS**

**Rationale:**

- Single responsibility: HTTP header constants
- High cohesion: All constants related
- Natural grouping: Categories clearly documented
- Matches guideline: "Constant collections can exceed 500 lines if single responsibility"

**Benefits of keeping:**

- Single import for all HTTP headers
- Easy to search and maintain
- Clear organization

**Risk:** None - No refactoring needed

---

### 6. factory.ts (562 lines) - ACCEPTABLE (NO REFACTOR)

**Package:** `@ndigo/factory`  
**Lines:** 562  
**Exports:** Multiple (dependency injection factory)  
**Current Structure:**

- Dependency injection container
- Bean registration and resolution
- Lifecycle management
- Scope handling

**Issue:** None - Single cohesive responsibility (DI container).

**Recommendation:** **KEEP AS-IS**

**Rationale:**

- Single responsibility: Dependency injection
- Complex class with high internal cohesion
- All methods serve DI container functionality
- Splitting would create artificial boundaries

**Benefits of keeping:**

- Maintains DI container as single unit
- All related logic in one place
- Easier to understand complete lifecycle

**Risk:** None - No refactoring needed

---

### 7. route-mapping-info.ts (526 lines) - MEDIUM PRIORITY

**Package:** `@ndigo/dispatcher`  
**Lines:** 526  
**Exports:** Multiple route mapping classes  
**Current Structure:**

- Route metadata handling
- Path parameter extraction
- Query parameter handling
- Route matching logic

**Recommendation:** **REVIEW FOR EXTRACTION**

**Analysis needed:**

- Count distinct responsibilities
- Identify helper functions suitable for `_util.ts`
- Check if naturally splits into multiple route info types

**Risk:** Medium - Need detailed analysis before committing to refactoring

---

### 8. media-type.ts (433 lines) - LOW PRIORITY

**Package:** `@ndigo/core`  
**Lines:** 433  
**Exports:** MediaType constants and class  
**Current Structure:**

- MediaType class implementation
- Common media type constants (APPLICATION_JSON, TEXT_HTML, etc.)
- Media type parsing and comparison

**Recommendation:** **EXTRACT CONSTANTS**

**Proposed Structure:**

```
media-type.ts (250 lines) - MediaType class and logic
└── media-type-constants.ts (183 lines) - Common MediaType constants
```

**Alternative:** Keep as-is if constants are tightly coupled to class usage.

**Risk:** Low - Simple constant extraction

---

### 9. standard-types.ts (422 lines) - MEDIUM PRIORITY

**Package:** `@ndigo/validate`  
**Lines:** 422  
**Exports:** Multiple type validation functions

**Recommendation:** **ANALYZE WITH standard-constraints.ts**

Should be refactored together with standard-constraints.ts as part of validation module reorganization.

**Risk:** Low - Follow same pattern as standard-constraints.ts

---

### 10. context.ts (363 lines) - ACCEPTABLE (NO REFACTOR)

**Package:** `@ndigo/context`  
**Lines:** 363  
**Exports:** ApplicationContext class  
**Current Structure:**

- Application context management
- Lifecycle hooks
- Configuration management
- Environment handling

**Recommendation:** **KEEP AS-IS**

**Rationale:**

- Single responsibility: Application context
- Complex class with high cohesion
- Core framework component

**Risk:** None - No refactoring needed

---

### 11. route-condition.ts (359 lines) - MEDIUM PRIORITY

**Package:** `@ndigo/dispatcher`  
**Lines:** 359  
**Exports:** Route condition matching logic

**Recommendation:** **EXTRACT HELPERS TO \_util.ts**

**Proposed Structure:**

```
route-condition.ts (280 lines) - Core condition logic
└── _condition-util.ts (79 lines) - Helper functions
```

**Risk:** Low - Helper extraction is straightforward

---

### 12. response-statuses.ts (348 lines) - ACCEPTABLE (NO REFACTOR)

**Package:** `@ndigo/http`  
**Lines:** 348  
**Exports:** HTTP status code constants  
**Current Structure:**

- Single cohesive constant collection
- HTTP response status codes

**Recommendation:** **KEEP AS-IS**

**Rationale:**

- Same as http-headers.ts
- Single responsibility: HTTP status constants
- Natural constant collection

**Risk:** None - No refactoring needed

---

### 13. path-matcher.ts (337 lines) - MEDIUM PRIORITY

**Package:** `@ndigo/core`  
**Lines:** 337  
**Exports:** Path matching logic

**Recommendation:** **EXTRACT HELPERS**

**Proposed Structure:**

```
path-matcher.ts (250 lines) - Core matching logic
└── _path-util.ts (87 lines) - Helper functions
```

**Risk:** Low - Helper extraction

---

### 14. configuration.ts (331 lines) - LOW PRIORITY

**Package:** `@ndigo/context`  
**Lines:** 331  
**Exports:** Configuration management

**Recommendation:** **REVIEW THEN DEFER**

Likely single cohesive responsibility. Analyze structure before deciding.

**Risk:** Low - May not need refactoring

---

### 15. transducer.ts (306 lines) - LOW PRIORITY

**Package:** `@ndigo/core`  
**Lines:** 306  
**Exports:** Transducer implementation

**Recommendation:** **DEFER**

Just over threshold. Complex functional programming concept better kept together.

**Risk:** None - No refactoring needed

---

## Refactoring Priority Summary

### Immediate (High Priority)

1. **standard-constraints.ts** (965 lines) → Split by validation category
2. **event-emitter.ts** (771 lines) → Split by mixin functionality

**Estimated Impact:**

- Reduces 2 files totaling 1,736 lines into 10 focused modules
- Improves maintainability, testability, discoverability
- Risk: Low to Medium (requires careful dependency management)

### Planned (Medium Priority)

3. **route-handler-mapping.ts** (884 lines) → Extract helpers
4. **http.ts** (760 lines) → Extract constants
5. **route-mapping-info.ts** (526 lines) → Review and extract
6. **standard-types.ts** (422 lines) → Refactor with constraints
7. **route-condition.ts** (359 lines) → Extract helpers
8. **path-matcher.ts** (337 lines) → Extract helpers

**Estimated Impact:**

- Modest file size reductions (10-30% per file)
- Improved organization without major restructuring

### Acceptable (No Refactoring)

9. **http-headers.ts** (725 lines) - Constant collection ✅
10. **factory.ts** (562 lines) - Single cohesive DI container ✅
11. **context.ts** (363 lines) - Single cohesive context class ✅
12. **response-statuses.ts** (348 lines) - Constant collection ✅

### Deferred (Low Priority)

13. **media-type.ts** (433 lines) - Low priority constant extraction
14. **configuration.ts** (331 lines) - Review first
15. **transducer.ts** (306 lines) - Just over threshold, defer

---

## Implementation Guidelines

### Step-by-Step Process

1. **Plan the Split**

    - Identify natural boundaries
    - Map dependencies
    - Design new structure

2. **Create New Files**

    - Extract one responsibility at a time
    - Maintain imports/exports
    - Keep original file as re-export hub initially

3. **Update Tests**

    - Adjust test imports
    - Split test files to match source structure
    - Verify coverage maintained

4. **Verify Build**

    ```bash
    pnpm build
    nx run @ndigo/validate:build:lib
    ```

5. **Verify Tests**

    ```bash
    pnpm test
    nx run @ndigo/validate:test
    ```

6. **Remove Re-export Hub (if appropriate)**

    - Once consumers updated, can remove original file
    - Or keep as barrel export for backward compatibility

7. **Document Changes**

    ```bash
    git commit -m "refactor(validate): split standard-constraints by category

    - Extract string-constraints.ts (250 lines)
    - Extract number-constraints.ts (200 lines)
    - Extract date-constraints.ts (180 lines)
    - Extract type-constraints.ts (150 lines)
    - Create _constraint-util.ts (85 lines)
    - Maintain backward compatibility via re-exports

    Ref: STYLE_GUIDE.md Section 4.6, FILE_REFACTORING.md"
    ```

---

## Success Metrics

### Before Refactoring

- **15 files** >300 lines
- **Total lines:** 8,088 lines in large files
- **Average:** 539 lines per large file

### Target After Refactoring

- **<10 files** >300 lines (only acceptable large files)
- **Avg reduction:** 20-40% in refactored files
- **New modules:** ~20-30 focused modules created

### Quality Metrics

- ✅ No test coverage loss
- ✅ Build succeeds without errors
- ✅ No circular dependencies introduced
- ✅ Improved discoverability
- ✅ Better separation of concerns

---

## Timeline

### Phase 1: High Priority (Week 1-2)

- standard-constraints.ts refactoring
- event-emitter.ts refactoring
- Testing and validation

### Phase 2: Medium Priority (Week 3-4)

- route-handler-mapping.ts
- http.ts
- route-condition.ts
- path-matcher.ts

### Phase 3: Review and Optimize (Week 5)

- Analyze deferred files
- Document acceptable large files
- Update guidelines based on learnings

---

## Notes

- **Backward Compatibility:** Maintain all existing exports via re-export hubs during transition
- **Testing:** Each refactoring must maintain 100% test coverage
- **Documentation:** Update package README.md files to reflect new structure
- **Migration:** Consider creating migration guide if public API structure changes

---

**Author:** OpenCode AI Agent  
**Last Updated:** February 1, 2025  
**Status:** Ready for Review and Approval
