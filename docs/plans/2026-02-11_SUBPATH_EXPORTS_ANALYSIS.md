# Architectural Plan: Subpath Export Analysis

**Date:** February 11, 2026
**Status:** 📝 DRAFT
**Priority:** Medium
**Context:** The `@blue/http/transformers` subpath export introduced in the Transform Pipeline plan is a modern, clean pattern. This plan evaluates applying this pattern to other packages in the monorepo.

---

## 1. Executive Summary

This plan outlines a research initiative to identify and evaluate opportunities for using **subpath exports** across the BlueJS monorepo. The goal is to improve API clarity, enhance modularity, and provide consumers with more granular import options.

The analysis will focus on identifying cohesive, optional feature sets currently exported through the main package entry point that would be better served by a dedicated subpath (e.g., `@blue/logger/layouts`).

**This is a read-only analysis and planning task.** No code will be modified during the execution of this plan. The deliverable is a documented list of recommended subpath exports for future implementation.

---

## 2. Rationale & Goals

### Why Use Subpath Exports?

1.  **API Clarity:** Separates core functionality from optional, specialized modules. `import { CoreThing } from '@blue/pkg';` vs `import { SpecializedThing } from '@blue/pkg/specialized';`
2.  **Improved Discoverability:** Makes feature sets explicit in the import path.
3.  **Encapsulation:** Prevents consumers from deep-importing internal file paths, which are brittle and can break between versions.
4.  **Potential Performance:** Can improve tree-shaking and reduce bundle sizes by making dependencies more explicit to build tools.

### Goals of this Plan

- Identify all packages that have distinct, cohesive sub-feature sets.
- Evaluate which of these feature sets are good candidates for a subpath export.
- Produce a clear, actionable list of recommended changes.
- Document the rationale for each recommendation.

---

## 3. Analysis Plan

### Phase 1: Candidate Identification (Read-Only)

**Objective:** Systematically scan all packages to find potential candidates for subpath exports.

**Methodology:**

1.  **List All Packages:** Generate a complete list of packages in the `packages/` directory.
2.  **Analyze `src` Directory Structure:** For each package, inspect its `src/` directory for subdirectories containing multiple files. These often represent a distinct feature set.
3.  **Apply Evaluation Criteria:** A subdirectory is a strong candidate if it meets these criteria:
    - **Cohesive:** Contains a group of highly related modules (e.g., a set of specific layouts, parsers, or validators).
    - **Optional:** The modules are not part of the package's primary, essential API. A consumer should be able to use the main package entry point without ever needing the subpath.
    - **Clarity:** A subpath export would make the intended use of the modules clearer (e.g., `@blue/logger/layouts`).

### Phase 2: Detailed Evaluation & Recommendation

**Objective:** For each identified candidate, create a specific recommendation and rationale.

**Methodology:**

1.  **Review Module Exports:** For each candidate subdirectory, review the modules it contains and how they are currently exported from the main `index.ts`.
2.  **Assess Consumer Impact:** Consider how consumers would benefit from the new subpath. Would it simplify their imports or reduce cognitive load?
3.  **Document Recommendations:** For each recommended subpath export, document the following:
    - **Package:** e.g., `@blue/logger`
    - **Proposed Subpath:** e.g., `@blue/logger/layouts`
    - **Directory:** e.g., `packages/blue-logger/src/layouts/`
    - **Rationale:** A brief explanation of why this change aligns with the project's architectural goals (e.g., "Separates optional logging layouts from the core logger configuration, improving clarity.").

### Phase 3: Implementation Blueprint (For Future Work)

**Objective:** Create a generic, high-level blueprint for how to implement a subpath export once a recommendation is approved.

**Blueprint Steps:**

1.  Create an `index.ts` file within the target subdirectory (e.g., `src/layouts/index.ts`) that exports all public modules from that directory.
2.  Update the package's main `index.ts` to _remove_ the direct exports of the modules that are now in the subpath. (This is a breaking change and must be documented).
3.  Modify the `package.json` to add the new entry to the `"exports"` map.
4.  Update all internal project imports to use the new, cleaner subpath.
5.  Document the new subpath in the package's `README.md`.

---

## 4. Deliverable

The final output of this plan will be this document, updated with a new "Recommendations" section containing a table of proposed subpath exports and their rationales.
