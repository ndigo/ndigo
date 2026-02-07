# ESLint Plugin Implementation Plan

**Date:** February 1, 2026  
**Status:** Planning - Not Started  
**Priority:** Medium  
**Package:** `@blue/eslint-plugin`

## Overview

This document outlines the plan for creating a custom ESLint plugin to enforce architectural rules in the BlueJS monorepo that cannot be enforced through TypeScript, package.json, or standard ESLint rules.

### Purpose

Provide automated enforcement of architectural constraints to prevent common violations:

1. **Library Integration Layer violations** - Direct imports of encapsulated libraries
2. **Internal file cross-package imports** - Importing `_*.ts` files across package boundaries
3. **Internal file public exports** - Accidentally exporting `_*.ts` files in public API

### Scope

**In Scope:**
- Custom ESLint rules for architectural enforcement
- Integration with existing ESLint configuration
- Documentation and developer guidance
- CI/CD integration

**Out of Scope:**
- General code style rules (use standard ESLint plugins)
- TypeScript type checking (use `tsc`)
- Build-time validation beyond linting

## Use Cases

### Use Case 1: Library Integration Layer Enforcement

**Problem:** Developers accidentally import encapsulated libraries directly instead of through their integration layer packages.

**Reference:** `docs/audits/2026-02-01_DEPENDENCY_AUDIT.md` lines 248-295

**Violations to Prevent:**

```typescript
// ❌ INCORRECT: Direct import bypasses integration layer
import * as R from 'ramda';              // Should use @blue/util
import { format } from 'date-fns';       // Should use @blue/util
import { choice } from 'arcsecond';      // Should use @blue/parser
import { Model } from 'objectmodel';     // Should use @blue/model

// ✅ CORRECT: Import through integration layer
import * as R from '@blue/util';
import { format } from '@blue/util';
import { choice } from '@blue/parser';
import { Model } from '@blue/model';
```

**Rule Name:** `no-direct-integration-imports`

**Configuration:**

```typescript
{
  encapsulatedLibraries: {
    'ramda': '@blue/util',
    'date-fns': '@blue/util',
    'date-fns-tz': '@blue/util',
    'seedrandom': '@blue/util',
    'slug': '@blue/util',
    'arcsecond': '@blue/parser',
    'objectmodel': '@blue/model'
  },
  allowInTests: true,  // Allow direct imports in *.spec.ts, *.test.ts
  allowInIntegrationLayers: true  // Skip check in the integration layer packages themselves
}
```

**Edge Cases:**

1. **Test files** - May import for mocking purposes (allowed)
2. **Integration layer packages** - Must import directly (allowed)
3. **Type-only imports** - Should these be allowed? `import type { Foo } from 'ramda'`

---

### Use Case 2: Internal File Cross-Package Import Prevention

**Problem:** Developers import internal (`_*.ts`) files across package boundaries, exposing implementation details.

**Reference:** `docs/plans/2026-02-01_UTILITY_ORGANIZATION.md` lines 256-269

**Violations to Prevent:**

```typescript
// ❌ INCORRECT: Importing internal file from another package
// In @blue/core/src/container.ts
import { isNotNil } from '@blue/util/_util';           // Internal file!
import { parseQuery } from '@blue/parser/src/_util';   // Internal file!

// ❌ INCORRECT: Relative import across package boundary
import { helper } from '../../blue-util/src/_util';

// ✅ CORRECT: Import from public API only
import { isNotNil } from '@blue/util';
import { parseQuery } from '@blue/parser';
```

**Rule Name:** `no-internal-file-imports`

**Detection Pattern:**

```regex
# Import specifier ends with /_something
@blue/[^/]+/_[^/]+

# Or contains /src/_ anywhere
@blue/[^/]+/src/_[^/]+

# Or relative path contains /_
\.\./.*/_[^/]+
```

**Configuration:**

```typescript
{
  internalFilePattern: '_*.ts',
  allowWithinPackage: true,  // Allow imports within same package
  allowInTests: false  // Even tests shouldn't import internals across packages
}
```

**Edge Cases:**

1. **Same package** - Internal files within same package are allowed
2. **Test directory** - `test/_*.ts` files should also be protected
3. **Build output** - Should `lib/_*.js` imports be blocked? (Yes, but rare)

---

### Use Case 3: Internal File Public Export Prevention

**Problem:** Developers accidentally export internal files in `index.ts`, making them part of the public API.

**Reference:** `docs/plans/2026-02-01_UTILITY_ORGANIZATION.md` lines 271-279

**Violations to Prevent:**

```typescript
// ❌ INCORRECT: In packages/blue-util/src/index.ts
export * from './_util';
export { helper } from './_util';
export type { Config } from './_config';

// ✅ CORRECT: Only export public modules
export * from './types';
export * from './logic';
export { Deferred } from './deferred';
```

**Rule Name:** `no-internal-file-exports`

**Detection Pattern:**

```typescript
// In src/index.ts files:
// - export * from './_anything'
// - export { foo } from './_anything'
// - export type { bar } from './_anything'

// Pattern: any export statement with source starting with './_'
```

**Configuration:**

```typescript
{
  internalFilePattern: '_*.ts',
  indexFilePattern: '**/src/index.ts',
  allowReExport: false  // Even re-exporting specific members is not allowed
}
```

**Edge Cases:**

1. **Type-only exports** - `export type { Foo } from './_util'` (still violation)
2. **Named re-exports** - `export { helper } from './_util'` (still violation)
3. **Test index files** - `test/index.ts` exporting test helpers (allowed)

---

## Plugin Architecture

### Package Structure

```
packages/blue-eslint-plugin/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                           # Plugin entry point
│   ├── rules/
│   │   ├── no-direct-integration-imports.ts
│   │   ├── no-internal-file-imports.ts
│   │   └── no-internal-file-exports.ts
│   ├── configs/
│   │   └── recommended.ts                 # Recommended config preset
│   └── utils/
│       ├── package-detection.ts           # Detect which package a file is in
│       └── path-resolution.ts             # Resolve import paths
├── test/
│   └── rules/
│       ├── no-direct-integration-imports.spec.ts
│       ├── no-internal-file-imports.spec.ts
│       └── no-internal-file-exports.spec.ts
└── README.md
```

### Rule Structure Template

```typescript
// src/rules/example-rule.ts
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/bluelibs/blue/blob/main/docs/eslint-rules/${name}.md`
);

export const exampleRule = createRule({
  name: 'example-rule',
  meta: {
    type: 'problem',
    docs: {
      description: 'Rule description',
      recommended: 'error'
    },
    messages: {
      violation: 'Error message with {{placeholder}}'
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Rule options
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [{}],
  create(context, [options]) {
    return {
      ImportDeclaration(node) {
        // Rule logic
      }
    };
  }
});
```

### Plugin Entry Point

```typescript
// src/index.ts
import { noDirectIntegrationImports } from './rules/no-direct-integration-imports';
import { noInternalFileImports } from './rules/no-internal-file-imports';
import { noInternalFileExports } from './rules/no-internal-file-exports';
import recommended from './configs/recommended';

export = {
  rules: {
    'no-direct-integration-imports': noDirectIntegrationImports,
    'no-internal-file-imports': noInternalFileImports,
    'no-internal-file-exports': noInternalFileExports
  },
  configs: {
    recommended
  }
};
```

### Recommended Config

```typescript
// src/configs/recommended.ts
export default {
  plugins: ['@blue'],
  rules: {
    '@blue/no-direct-integration-imports': 'error',
    '@blue/no-internal-file-imports': 'error',
    '@blue/no-internal-file-exports': 'error'
  }
};
```

---

## Implementation Plan

### Phase 1: Setup and Infrastructure (2-3 hours)

**1.1: Create Package**

```bash
cd packages
mkdir blue-eslint-plugin
cd blue-eslint-plugin
pnpm init
```

**1.2: Configure package.json**

```json
{
  "name": "@blue/eslint-plugin",
  "version": "0.1.0",
  "description": "Custom ESLint rules for BlueJS architectural enforcement",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": ["lib"],
  "scripts": {
    "build:lib": "tsc -b",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@typescript-eslint/utils": "^6.0.0"
  },
  "devDependencies": {
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/rule-tester": "^6.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.7.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "eslint": "^8.0.0"
  }
}
```

**1.3: Setup TypeScript Configuration**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./lib",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib", "test"]
}
```

**1.4: Create Directory Structure**

```bash
mkdir -p src/{rules,configs,utils}
mkdir -p test/rules
```

---

### Phase 2: Implement Rules (8-10 hours)

**2.1: Rule 1 - `no-direct-integration-imports`**

**File:** `src/rules/no-direct-integration-imports.ts`

**Implementation Steps:**
1. Define encapsulated library mapping
2. Parse import declarations
3. Check if import source matches encapsulated library
4. Detect current package (skip if in integration layer)
5. Detect test files (skip if configured)
6. Report violation with suggested fix

**Test Cases:**
- ✅ Valid: Import from integration layer
- ✅ Valid: Direct import in integration layer package
- ✅ Valid: Direct import in test file (if configured)
- ❌ Invalid: Direct import in regular source file
- ❌ Invalid: Direct import with type-only syntax (if configured)

**2.2: Rule 2 - `no-internal-file-imports`**

**File:** `src/rules/no-internal-file-imports.ts`

**Implementation Steps:**
1. Parse import declarations
2. Check if import source contains `/_` pattern
3. Detect if import is from same package (allow)
4. Detect if import is cross-package (violation)
5. Report violation with explanation

**Test Cases:**
- ✅ Valid: Internal file import within same package
- ✅ Valid: Public API import from another package
- ❌ Invalid: Internal file import via `@blue/pkg/_util`
- ❌ Invalid: Internal file import via relative path
- ❌ Invalid: Internal file import in test file

**2.3: Rule 3 - `no-internal-file-exports`**

**File:** `src/rules/no-internal-file-exports.ts`

**Implementation Steps:**
1. Check if current file is `index.ts` in `src/`
2. Parse export declarations with sources
3. Check if export source starts with `./_`
4. Report violation for any internal file exports

**Test Cases:**
- ✅ Valid: Export from public module
- ✅ Valid: Export from subdirectory (non-underscore)
- ✅ Valid: Internal file export in test/index.ts
- ❌ Invalid: `export * from './_util'` in src/index.ts
- ❌ Invalid: `export { foo } from './_util'` in src/index.ts
- ❌ Invalid: `export type { Bar } from './_util'` in src/index.ts

---

### Phase 3: Integration and Testing (3-4 hours)

**3.1: Update Root ESLint Configuration**

**File:** `eslint.config.mjs`

```javascript
import bluePlugin from '@blue/eslint-plugin';

export default [
  // ... existing config
  {
    plugins: {
      '@blue': bluePlugin
    },
    rules: {
      '@blue/no-direct-integration-imports': 'error',
      '@blue/no-internal-file-imports': 'error',
      '@blue/no-internal-file-exports': 'error'
    }
  }
];
```

**3.2: Run Full Lint and Fix Violations**

```bash
# Check for violations
pnpm lint

# Expected violations from audit:
# - 2 packages with direct ramda imports
# - Check for any _*.ts cross-package imports
# - Check for any _*.ts exports in index.ts
```

**3.3: Update CI/CD Pipeline**

Ensure lint runs in CI:

```yaml
# .github/workflows/ci.yml
- name: Lint
  run: pnpm lint
```

**3.4: Verify All Tests Pass**

```bash
pnpm test
```

---

### Phase 4: Documentation (2 hours)

**4.1: Create Rule Documentation**

**Files:**
- `docs/eslint-rules/no-direct-integration-imports.md`
- `docs/eslint-rules/no-internal-file-imports.md`
- `docs/eslint-rules/no-internal-file-exports.md`

**Template:**

```markdown
# Rule: no-example-rule

## Rule Details

This rule [description].

## Examples

### ❌ Incorrect

[code examples]

### ✅ Correct

[code examples]

## Options

[configuration options]

## When Not To Use It

[edge cases where rule should be disabled]
```

**4.2: Additional Enforcement Mechanisms**

Beyond ESLint rules, implement complementary validation mechanisms:

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

**Periodic Validation Script:**

```bash
#!/bin/bash
# Find all internal files and verify they contain local utilities
find packages -name "_*.ts" -path "*/src/*" | while read file; do
  echo "Checking: $file"
  # Could integrate with custom validation logic
done
```

**Reference:** `docs/plans/2026-02-01_UTILITY_ORGANIZATION.md` lines 277-313

**4.3: Update Plugin README**

**File:** `packages/blue-eslint-plugin/README.md`

Include:
- Installation instructions
- Usage examples
- Rule list with descriptions
- Configuration options
- Troubleshooting

**4.4: Update Project Documentation**

Update the following files to mention ESLint enforcement:

- `AGENTS.md` - Section 4 (Library Integration Layer)
- `ARCHITECTURE.md` - Dependency Management Strategy
- This plan replaces validation mechanisms from `docs/plans/2026-02-01_UTILITY_ORGANIZATION.md`

---

## Testing Strategy

### Unit Tests (Per Rule)

**Structure:**

```typescript
// test/rules/no-direct-integration-imports.spec.ts
import { RuleTester } from '@typescript-eslint/rule-tester';
import { noDirectIntegrationImports } from '../../src/rules/no-direct-integration-imports';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-direct-integration-imports', noDirectIntegrationImports, {
  valid: [
    {
      code: "import * as R from '@blue/util';",
      filename: 'packages/blue-core/src/container.ts'
    },
    {
      code: "import * as R from 'ramda';",
      filename: 'packages/blue-util/src/index.ts'  // Integration layer
    },
    {
      code: "import * as R from 'ramda';",
      filename: 'packages/blue-core/test/container.spec.ts'  // Test file
    }
  ],
  invalid: [
    {
      code: "import * as R from 'ramda';",
      filename: 'packages/blue-core/src/container.ts',
      errors: [{
        messageId: 'directImport',
        data: {
          library: 'ramda',
          integrationLayer: '@blue/util'
        }
      }]
    }
  ]
});
```

### Integration Tests

**Manual verification checklist:**
1. Run lint on entire monorepo
2. Verify expected violations are caught
3. Verify no false positives
4. Test auto-fix (if applicable)
5. Verify performance on large codebase

### Edge Case Tests

For each rule, test:
- **Namespace imports** - `import * as R`
- **Named imports** - `import { map }`
- **Default imports** - `import R`
- **Type imports** - `import type { Foo }`
- **Mixed imports** - `import R, { map }`
- **Dynamic imports** - `await import('ramda')`
- **Require (if CJS)** - `const R = require('ramda')`

---

## Success Criteria

### Functional Requirements

- ✅ All 3 rules implemented and tested
- ✅ Rules catch all known violations from audit
- ✅ Rules produce zero false positives on valid code
- ✅ Integration with existing ESLint configuration
- ✅ CI/CD pipeline enforces rules

### Quality Requirements

- ✅ >90% test coverage for rule logic
- ✅ All rules have clear error messages
- ✅ All rules have comprehensive documentation
- ✅ Plugin follows ESLint plugin best practices

### Performance Requirements

- ✅ Lint time increase <10% compared to baseline
- ✅ Rules execute efficiently on large files (>1000 lines)

### Documentation Requirements

- ✅ README with usage instructions
- ✅ Individual rule documentation pages
- ✅ Integration guides for developers
- ✅ Updates to AGENTS.md, ARCHITECTURE.md

---

## Open Questions

### 1. Severity Levels

**Question:** Should violations be errors or warnings initially?

**Options:**
- **A: Errors** - Enforce strictly from day one
- **B: Warnings** - Allow time for gradual adoption
- **C: Mixed** - Errors for new code, warnings for existing

**Recommendation:** Start with warnings, then promote to errors after cleanup sprint.

### 2. Type-Only Imports

**Question:** Should `import type { Foo } from 'ramda'` be allowed?

**Considerations:**
- Type imports don't add runtime dependencies
- But they still create coupling to the library's type definitions
- Type imports could be allowed in integration layers only

**Recommendation:** Treat type imports the same as value imports (disallow).

### 3. Dynamic Imports

**Question:** How to handle `await import('ramda')`?

**Considerations:**
- Dynamic imports are harder to detect statically
- Less common in BlueJS codebase
- Could be deferred to future enhancement

**Recommendation:** Phase 1 focuses on static imports. Add dynamic import detection in Phase 2.

### 4. Additional Rules

**Question:** Should we add more architectural rules beyond these 3?

**Candidates:**
- Prevent circular dependencies
- Enforce naming conventions (kebab-case files)
- Require JSDoc on public APIs
- Prevent `any` type usage

**Recommendation:** Start with 3 core rules. Evaluate additional rules based on pain points that emerge.

---

## Rollout Strategy

### Phase 1: Silent Mode (1 week)

1. Install plugin in dev environment
2. Run lint to identify all violations
3. Document violation patterns
4. Do NOT block builds

**Goal:** Understand scope of work required

### Phase 2: Warnings (2 weeks)

1. Enable rules as warnings
2. Fix violations incrementally
3. Track progress in tickets
4. Educate team on rules

**Goal:** Fix existing violations without blocking development

### Phase 3: Enforcement (Ongoing)

1. Promote rules to errors
2. Enable in CI/CD to block PRs
3. Monitor for false positives
4. Iterate on rule configurations

**Goal:** Maintain architectural compliance going forward

---

## Alternatives Considered

### Alternative 1: Manual Code Review

**Pros:**
- No tooling overhead
- Flexible interpretation

**Cons:**
- Inconsistent enforcement
- Wastes reviewer time
- Violations slip through

**Decision:** Rejected - Automation is more reliable

### Alternative 2: TypeScript Path Mapping Restrictions

**Pros:**
- Enforce at compile time
- No ESLint dependency

**Cons:**
- Can't distinguish test files
- Can't provide helpful error messages
- Doesn't handle all cases

**Decision:** Rejected - ESLint provides better UX

### Alternative 3: Pre-commit Hooks

**Pros:**
- Catch issues before commit
- Fast feedback loop

**Cons:**
- Can be bypassed with --no-verify
- Not enforced in CI
- Less discoverable

**Decision:** Complementary - Use BOTH hooks AND CI

---

## Future Enhancements

### Rule Improvements

1. **Auto-fix support** - Automatically replace direct imports with integration layer imports
2. **Custom error messages** - Per-library guidance on correct usage
3. **Allowlist support** - Temporary exceptions for migration period

### Additional Rules

4. **Circular dependency detection** - Prevent package import cycles
5. **File naming enforcement** - Ensure kebab-case.ts convention
6. **Export organization** - Enforce alphabetical ordering in index.ts

### Developer Experience

7. **IDE integration** - Real-time feedback in VS Code
8. **Interactive fixers** - Suggest correct import path
9. **Metrics dashboard** - Track compliance over time

---

## References

- **Library Integration Layer:** `AGENTS.md` Section 4, `ARCHITECTURE.md`
- **Internal Files:** `docs/plans/2026-02-01_UTILITY_ORGANIZATION.md`
- **Dependency Audit:** `docs/audits/2026-02-01_DEPENDENCY_AUDIT.md` lines 248-295
- **ESLint Plugin Guide:** https://eslint.org/docs/latest/extend/custom-rules
- **TypeScript ESLint:** https://typescript-eslint.io/developers/custom-rules

---

**Status:** Planning Complete - Ready for Implementation  
**Author:** OpenCode AI Agent  
**Last Updated:** February 1, 2025
