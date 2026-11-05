# @ndigo/parser Enhancement Plan

This document outlines the research and implementation strategy for stabilizing and enhancing the `@ndigo/parser` package, specifically focusing on brace expansion and glob pattern matching.

## Objectives

1.  **Resolve Brace Expansion Failures**: Reduce the current 29 failures in `test/brace-expression.spec.ts` to ≤10.
2.  **Ensure Glob/ExtGlob Parity**: Validate core feature parity with industry standards (`fast-glob`, `picomatch`).
3.  **Document Limitations**: Clearly define "acceptable failures" that match or exceed behavior in upstream libraries.
4.  **Maintain 100% Stability**: Ensure no regressions in existing stable parsers (matrix-string, etc.).

---

## Phase 1: Brace Expansion Research (4-6 hours)

**Goal**: Understand why we fail where others fail or succeed.

- **Upstream Analysis**:
    - Compare failing test cases against `braces` and `brace-expansion` npm packages.
    - Identify "Bash-compatible" vs. "Extended" expansion behaviors.
- **Failure Categorization**:
    - Group the 29 failures into: _Nested Recursion_, _Escape Handling_, _Sequence/List Ambiguity_, and _Edge Cases_.
- **Success Criteria**: A documented mapping of our current failures to upstream behavior.

## Phase 2: Glob Pattern Research (1-2 hours)

**Goal**: Define the "Core Feature" set for parity.

- **Feature Matrix**: Compare `@ndigo/parser` against `fast-glob` and `picomatch`.
- **Scope Definition**: Focus on core glob features (stars, question marks, ranges) and the 5 extended glob types (`@()`, `*()`, `?()`, `+()`, `!()`).
- **Success Criteria**: A prioritized list of missing core features.

## Phase 3: Brace Expansion Fixes (3-5 hours)

**Goal**: Achieve the target of ≤10 failures.

- **Implementation Tasks**:
    - Refactor recursion logic in `src/brace-expression.ts` to handle double-nesting (e.g., `{{a,b},c}`).
    - Improve `lookAhead` logic in `sequence-expression.ts` to prevent premature consumption of inputs.
    - Standardize escape character processing across nested boundaries.
- **Target**: ≤10 remaining failures, with documented reasons for each.

## Phase 4: Glob Pattern Enhancements (2-3 hours)

**Goal**: Validate and solidify glob support.

- **Implementation Tasks**:
    - Verify integration between `glob.ts` and `ext-glob.ts`.
    - Add missing "Core" features identified in Phase 2.
    - Add test coverage for complex mixed patterns (e.g., `src/**/*.{js,ts}`).

## Phase 5: Integration & Documentation

- Update `packages/ndigo-parser/README.md` with supported patterns and known limitations.
- Cross-reference this plan in `ARCHITECTURE.md`.
- Provide clear usage examples for all 5 ExtGlob types.

## Phase 6: Testing & Validation

- Run the full `@ndigo/parser` test suite (`pnpm nx test @ndigo/parser`).
- Ensure `@ndigo/util` coverage remains at 100%.
- Perform manual integration tests with a mock file system if necessary.

## Phase 7: Commit Strategy

1.  `docs: add parser enhancement plan and research findings`
2.  `test: document known limitations in brace expansion`
3.  `fix(parser): resolve nested recursion in brace expansion`
4.  `feat(parser): enhance glob parity with core industry standards`

---

## Success Metrics

- **Brace Failures**: ≤ 10 (down from 29)
- **Glob Parity**: 100% of defined "Core Features"
- **Documentation**: Detailed "Known Limitations" section in README.
- **Regressions**: Zero regressions in passing tests.
