# Regular Expression Naming Convention Plan

**Date:** 2025-02-07  
**Status:** Planning  
**Type:** Breaking Change - Code Style Standardization

---

## Executive Summary

Establish a consistent naming convention for regular expression variables across the BlueJS monorepo. Currently, regex variables inconsistently use `UPPER_SNAKE_CASE` with various suffixes (`*_REGEX`, `*_PATTERN`, `*Matcher`). This plan standardizes on **`camelCase` with `*Rule` suffix** for all regex variables, aligning with the principle that only primitive constants use `UPPER_SNAKE_CASE`.

**Key Decision:** RegExp is an object type (not a primitive), so it should follow `camelCase` naming conventions like other objects, arrays, and functions.

---

## Problem Statement

### Current State

The codebase has **four different naming patterns** for regex variables:

| Pattern | Count | Example | Package(s) |
|:--------|:------|:--------|:-----------|
| `*_REGEX` (UPPER_SNAKE_CASE) | 30+ | `EMAIL_REGEX`, `SSN_FORMAT` | `@blue/validate` |
| `*_PATTERN` (UPPER_SNAKE_CASE) | 6+ | `QUERY_KEY_PATTERN`, `COOKIE_VALUE_PATTERN` | `@blue/http`, parsers |
| `*Matcher` (camelCase) | 8+ | `commaMatcher`, `charMatcher` | `@blue/util`, `@blue/parser` |
| Descriptive (camelCase) | 10+ | `ampersand`, `comma`, `regex` | Various packages |

### Core Issue

**RegExp objects are not primitives.** According to `@blue/core/src/primitive.ts`, primitives are:
- `boolean | null | number | string | symbol | bigint | undefined`

RegExp is an object with methods (`.test()`, `.exec()`, etc.) and should use `camelCase` like other objects, arrays, and functions.

### Broader Context

This is part of a larger inconsistency where other object types also incorrectly use `UPPER_SNAKE_CASE`:
- **Object literals** in `@blue/logger`: `NPMLevelToSeverity`, `CLIColor` (should be camelCase)
- **Record/mapping objects**: Similar issues throughout

However, **this plan focuses only on regex naming**. Object literal naming will be addressed separately.

---

## Proposed Convention

### Standard: `camelCase` with `*Rule` Suffix

All regular expression variables should use:
- **Case:** `camelCase`
- **Suffix:** `Rule`
- **Structure:** `<description>Rule`

### Rationale for `*Rule` Suffix

1. **Semantic clarity:** Regex defines validation/matching rules
2. **Consistent with business logic:** "Rule" is used in domain-driven design for validation logic
3. **Avoids confusion with:**
   - `*Matcher` - Reserved for classes/interfaces (e.g., `PathMatcher`, `URLMatcher`)
   - `*Pattern` - Could be confused with design patterns or pattern matching
   - `*Regex` - Redundant (type makes it obvious)
4. **Clean slate:** Not currently widely used, so minimal confusion during migration

### Examples

```typescript
// ✅ Correct: New convention
export const emailRule = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
export const phoneNorthAmericaRule = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
export const ssnRule = /^\d{9}$|^\d{3}-\d{2}-\d{4}$/;
export const queryKeyRule = /^[A-Za-z+:/?[\]0-9%]+/;
export const cookieValueRule = /^[^;,\s]*/;

// Internal regex (still camelCase)
const commaRule = /,/;
const plusRule = /\+/g;
const leadingSlashRule = /^\//;

// ❌ Wrong: Old conventions
export const EMAIL_REGEX = /...$/i;           // UPPER_SNAKE_CASE
export const QUERY_KEY_PATTERN = /...$/;      // UPPER_SNAKE_CASE
const commaMatcher = /,/;                     // Wrong suffix
const ampersand = /&/;                        // No suffix
```

### Comparison with Other Naming Conventions

```typescript
// Primitives: UPPER_SNAKE_CASE (correct)
const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY';
const MAX_RETRY_COUNT = 3;
const API_TIMEOUT = 5000;

// Value Object Singletons: UPPER_SNAKE_CASE (correct - act like enum members)
const OK = ResponseStatus.for(200, 'OK');
const NOT_FOUND = ResponseStatus.for(404, 'Not Found');
const APPLICATION_JSON = MediaType.for('application', 'json');

// Objects/Arrays/Functions/RegExp: camelCase (correct)
const emailRule = /^[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}$/;
const npmLevelToSeverity = { error: SeverityNumber.ERROR, warn: SeverityNumber.WARN };
const removeSpaces = replace(spaces, '');

// Classes/Interfaces: PascalCase (correct)
class PathMatcher implements PatternMatcher { }
interface URLMatcher extends PatternMatcher { }
```

---

## Scope of Changes

### Packages Affected (11 packages)

| Package | Files | Regex Count | Primary Pattern | Breaking Change? |
|:--------|:------|:------------|:----------------|:-----------------|
| **@blue/validate** | 2 | 30+ | `*_REGEX` exported | ✅ **Yes** - Public API |
| **@blue/http** | 6 | 6+ | `*_PATTERN` internal | ⚠️ Maybe - Check exports |
| **@blue/util** | 6 | 8+ | `*Matcher` internal | ❌ No - Internal only |
| **@blue/parser** | 3 | 5+ | Descriptive internal | ❌ No - Internal only |
| **@blue/platform-web** | 1 | 2+ | `*_PATTERN` internal | ❌ No - Internal only |
| **@blue/logger** | 1 | 1 | Mixed internal | ❌ No - Internal only |
| **@blue/context** | 1 | 1 | `*Matcher` internal | ❌ No - Internal only |
| **@blue/domain** | 2 | 2 | Mixed internal | ❌ No - Internal only |
| **@blue/router** | 1 | 1 | Internal | ❌ No - Internal only |
| **@blue/service** | 1 | 1 | Internal | ❌ No - Internal only |
| **@blue/view** | 1 | 1 | Internal | ❌ No - Internal only |

### Breaking Changes

**Primary Impact: `@blue/validate/src/formats.ts`**

This file exports 28+ regex constants that are part of the public API:

```typescript
// Current exports (BREAKING)
export const EMAIL_REGEX = /...$/;
export const SSN_FORMAT = /...$/;
export const PHONE_NORTH_AMERICA = /...$/;
// ...28 more

// New exports (BREAKING)
export const emailRule = /...$/;
export const ssnRule = /...$/;
export const phoneNorthAmericaRule = /...$/;
// ...28 more
```

**Consumers will need to update imports:**

```typescript
// Before
import { EMAIL_REGEX, SSN_FORMAT } from '@blue/validate';
if (EMAIL_REGEX.test(value)) { ... }

// After
import { emailRule, ssnRule } from '@blue/validate';
if (emailRule.test(value)) { ... }
```

### Secondary Impact: Internal Modules

Internal regex in other packages won't break external consumers but will need updates for internal consistency:
- `@blue/http` parser patterns
- `@blue/util` string utilities
- `@blue/parser` expression parsers
- Others

---

## Migration Strategy

### Phase 1: Documentation Update

**Update:** `STYLE_GUIDE.md` Section 3.1 "Constants"

**Current text (lines 353-382):**
```typescript
// Regular Expression Patterns (primitive regex constants):
const QUERY_KEY_PATTERN = /^[A-Za-z+:/?[\]0-9%]+/;
const ALPHA_REGEX = /^[a-zA-Z]+$/;
```

**New text:**
```typescript
// Regular Expression Variables (object type, use camelCase):
const queryKeyRule = /^[A-Za-z+:/?[\]0-9%]+/;
const alphaRule = /^[a-zA-Z]+$/;
const emailRule = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const phoneNorthAmericaRule = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;

// Used in parser combinators
const queryKey = regex(queryKeyRule).map(replacePlusWithSpace).map(decode);

// ❌ Wrong: UPPER_SNAKE_CASE for non-primitive objects
const QUERY_KEY_PATTERN = /^[A-Za-z+:/?[\]0-9%]+/; // RegExp is an object, not a primitive

// ❌ Wrong: Inconsistent suffixes
const emailMatcher = /...$/;  // Matcher reserved for classes/interfaces
const emailRegex = /...$/;    // Redundant suffix
const email = /...$/;         // Unclear without suffix
```

**Rationale update (line 382):**
```
**Rationale:** Regular expressions are objects (not primitives per `@blue/core/src/primitive.ts`),
so they use `camelCase` like other objects, arrays, and functions. The `Rule` suffix clearly
indicates these are validation/matching rules. This distinguishes regex from `*Matcher` 
classes/interfaces (e.g., `PathMatcher`, `URLMatcher`) and avoids confusion with design patterns.
```

**Add cross-reference to ARCHITECTURE.md:**

Note in STYLE_GUIDE.md:
```
**See also:** ARCHITECTURE.md Section 4.7 "Decorators & Separation of Concerns" for 
discussion of `@pattern({ regex: /.../ })` decorator usage with regex rules.
```

### Phase 2: Create Migration Tracking Document

**Create:** `docs/migrations/2025-02-07_REGEX_NAMING.md`

**Content:**
- Breaking changes summary
- Before/after examples for each package
- Checklist of affected files
- Instructions for downstream consumers

### Phase 3: Code Migration (Breaking Changes)

**Order of operations:**

1. **Update `@blue/validate/src/formats.ts`** (28+ exports)
   - Rename all `*_REGEX`, `*_FORMAT` constants to `*Rule`
   - Update all internal references in the same package
   - Run tests: `nx run @blue/validate:test`

2. **Update cross-package references**
   - Search for imports from `@blue/validate`
   - Update all usages in other packages
   - Common locations: validators, decorators, constraints

3. **Update parser patterns** (`@blue/http`, `@blue/platform-web`)
   - Rename `*_PATTERN` to `*Rule`
   - Update internal references
   - Run tests: `nx run @blue/http:test`

4. **Update utility regex** (`@blue/util`, `@blue/parser`)
   - Rename `*Matcher` to `*Rule`
   - Remove ad-hoc descriptive names, add `Rule` suffix
   - Run tests: `nx run @blue/util:test`, `nx run @blue/parser:test`

5. **Update remaining packages** (`@blue/logger`, `@blue/context`, etc.)
   - Internal regex updates
   - Run package-specific tests

6. **Update test files**
   - Update test expectations and assertions
   - Update mock data

### Phase 4: Validation

**Pre-commit checks:**

```bash
# Verify no UPPER_SNAKE_CASE regex (except legacy)
rg "^export const [A-Z_]+.*=.*/.+/" packages/*/src --type ts

# Verify no *_REGEX suffix
rg "_REGEX\s*=" packages/*/src --type ts

# Verify no *_PATTERN suffix
rg "_PATTERN\s*=" packages/*/src --type ts

# Verify no *Matcher suffix (for regex variables, not classes)
rg "const \w+Matcher\s*=\s*/" packages/*/src --type ts

# Verify *Rule suffix usage
rg "const \w+Rule\s*=\s*/" packages/*/src --type ts
```

**Build and test everything:**

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

### Phase 5: Commit and Release

**Commit message:**
```
BREAKING CHANGE: Standardize regex naming to camelCase with *Rule suffix

RegExp objects are not primitives and should use camelCase naming.
All regex variables now use the *Rule suffix for consistency.

Changes:
- @blue/validate: Rename 28+ exported regex constants (EMAIL_REGEX → emailRule)
- @blue/http: Rename parser patterns (*_PATTERN → *Rule)
- @blue/util: Rename internal regex (*Matcher → *Rule)
- @blue/parser: Rename internal regex (descriptive → *Rule)
- STYLE_GUIDE.md: Update Section 3.1 with new convention

BREAKING CHANGE: Consumers must update imports from @blue/validate:
  Before: import { EMAIL_REGEX, SSN_FORMAT } from '@blue/validate';
  After:  import { emailRule, ssnRule } from '@blue/validate';

See docs/migrations/2025-02-07_REGEX_NAMING.md for full migration guide.
```

**Version bump:** Major version increment for affected packages
- `@blue/validate`: Major bump (public API change)
- Other packages: Patch bump (internal changes only)

---

## Implementation Checklist

### Documentation
- [ ] Update `STYLE_GUIDE.md` Section 3.1 with new convention
- [ ] Add rationale explaining RegExp as object type
- [ ] Add cross-reference to ARCHITECTURE.md
- [ ] Create `docs/migrations/2025-02-07_REGEX_NAMING.md`

### Code Changes - Public API (Breaking)
- [ ] `@blue/validate/src/formats.ts` - Rename 28+ exported regex
- [ ] `@blue/validate/src/standard-constraints.ts` - Update internal references
- [ ] Update all cross-package imports from `@blue/validate`

### Code Changes - Internal (Non-Breaking)
- [ ] `@blue/http/src/parsers/*.ts` - Rename parser patterns (6 files)
- [ ] `@blue/platform-web/src/parser/cookie-expression.ts` - Rename patterns
- [ ] `@blue/util/src/string/*.ts` - Rename utility regex (6 files)
- [ ] `@blue/parser/src/*.ts` - Rename parser regex (3 files)
- [ ] `@blue/context/src/event-emitter.ts` - Rename `onMatcher`
- [ ] `@blue/logger/src/pattern-layout.ts` - Rename pattern regex
- [ ] `@blue/domain`, `@blue/router`, `@blue/service`, `@blue/view` - Rename internal regex

### Testing
- [ ] Update test expectations in `test/**/*.spec.ts`
- [ ] Run `nx run @blue/validate:test`
- [ ] Run `nx run @blue/http:test`
- [ ] Run `nx run @blue/util:test`
- [ ] Run `nx run @blue/parser:test`
- [ ] Run `pnpm test` (all packages)

### Validation
- [ ] Run validation scripts (see Phase 4)
- [ ] Run `pnpm build` (verify no build errors)
- [ ] Run `pnpm lint` (verify no lint errors)
- [ ] Manual review of renamed variables

### Release
- [ ] Commit with breaking change message
- [ ] Bump `@blue/validate` to next major version
- [ ] Bump other packages to next patch version
- [ ] Update CHANGELOG.md files
- [ ] Tag release

---

## Risks and Mitigations

### Risk 1: Downstream Breaking Changes

**Risk:** External consumers of `@blue/validate` will break when importing regex constants.

**Mitigation:**
1. Document breaking changes clearly in `docs/migrations/`
2. Provide before/after examples in migration guide
3. Include clear commit message with `BREAKING CHANGE:` prefix
4. Major version bump signals breaking change to consumers
5. Consider adding deprecation warnings in previous version (if time permits)

### Risk 2: Incomplete Migration

**Risk:** Missing some regex variables during migration, causing inconsistency.

**Mitigation:**
1. Use comprehensive regex search patterns (provided in Phase 4)
2. Run validation scripts before commit
3. Review PR carefully for any missed instances
4. Use TypeScript/ESLint to catch broken imports

### Risk 3: Test Suite Failures

**Risk:** Tests may fail due to renamed constants in assertions/mocks.

**Mitigation:**
1. Run tests after each package update
2. Update test files systematically
3. Use IDE "Find All References" for each renamed constant
4. Manual review of test failures

### Risk 4: Confusion with `*Matcher` Classes

**Risk:** Developers may confuse `*Rule` regex with `*Matcher` classes/interfaces.

**Mitigation:**
1. Clearly document the distinction in STYLE_GUIDE.md
2. Use different suffixes: `*Rule` (regex) vs `*Matcher` (classes)
3. Provide examples in documentation showing both patterns
4. Update ARCHITECTURE.md to reference this convention

---

## Future Considerations

### Related Work: Object Literal Naming

This plan identifies that object literals in `@blue/logger` also incorrectly use `UPPER_SNAKE_CASE`:
- `NPMLevelToSeverity` → should be `npmLevelToSeverity`
- `CLIColor` → should be `cliColor`
- etc.

**Recommendation:** Create a separate plan for object literal naming convention standardization.

### Decorator Integration

The `@pattern` decorator in `@blue/validate` accepts regex in metadata:

```typescript
@pattern({ regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i })
email: string;
```

**Consideration:** Should decorators reference named constants instead?

```typescript
// Current: Inline regex
@pattern({ regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i })
email: string;

// Future: Reference named constant
@pattern({ regex: emailRule })
email: string;
```

**Decision:** Not in scope for this plan. Inline regex in decorators is acceptable for simple patterns. Named constants are better for reusability.

### Testing Strategy Patterns

Consider adding lint rules to enforce the convention:

```typescript
// ESLint custom rule (future enhancement)
'bluejs/regex-naming': {
  'suffix': 'Rule',
  'case': 'camelCase'
}
```

---

## Appendix A: Complete File List

### Files Requiring Changes (by package)

**@blue/validate** (2 files, 30+ changes)
- `src/formats.ts` - 28+ exported regex constants
- `src/standard-constraints.ts` - Internal usage

**@blue/http** (6 files, 6+ changes)
- `src/parsers/query-expression.ts` - Query parsing regex
- `src/parsers/matrix-expression.ts` - Matrix parsing regex
- `src/parsers/cookie-expression.ts` - Cookie parsing regex
- `src/url-matcher.ts` - URL matching (classes, not regex - verify)
- Related parser files

**@blue/platform-web** (1 file, 2 changes)
- `src/parser/cookie-expression.ts` - Cookie value patterns

**@blue/util** (6 files, 8+ changes)
- `src/string/encode-uri-component.ts` - Character matching
- `src/string/decode-uri-component.ts` - Token matching
- `src/string/to-reg-exp.ts` - RegExp parsing
- `src/string/to-proper.ts` - Case conversion
- `src/string/to-sentence.ts` - Sentence parsing
- `src/string/interpolate.ts` - Template parsing
- `src/string/replace-diacritics.ts` - Diacritic matching
- `src/string/remove-non-printable.ts` - Printable character matching

**@blue/parser** (3 files, 5+ changes)
- `src/matrix-string.ts` - Matrix delimiters
- `src/from-piped-string.ts` - Delimiter parsing
- Related parser utilities

**@blue/logger** (1 file, 1 change)
- `src/pattern-layout.ts` - Log pattern regex

**@blue/context** (1 file, 1 change)
- `src/event-emitter.ts` - Event name matching

**@blue/domain** (2 files, 2 changes)
- Limited regex usage (verify specifics)

**@blue/router**, **@blue/service**, **@blue/view** (1 file each, 1 change each)
- Internal regex (verify specifics)

---

## Appendix B: Detailed Regex Inventory

### @blue/validate/src/formats.ts (28 exports)

**Format Validation Rules:**
- `ADDRESS_LINE_REGEX` → `addressLineRule`
- `ALPHA_NUMERIC_REGEX` → `alphaNumericRule`
- `ALPHA_NUMERIC_PLUS_REGEX` → `alphaNumericPlusRule`
- `ALPHA_REGEX` → `alphaRule`
- `ANY_ALPHA_NUMERIC_REGEX` → `anyAlphaNumericRule`
- `BOOLEAN_REGEX` → `booleanRule`
- `CITY_REGEX` → `cityRule`
- `EMAIL_REGEX` → `emailRule`
- `INTEGER_REGEX` → `integerRule`
- `NAME_REGEX` → `nameRule`
- `NOT_A_CAPITAL_REGEX` → `notACapitalRule`
- `NOT_A_NUMBER_REGEX` → `notANumberRule`
- `NOT_A_PASSWORD_SYMBOL` → `notAPasswordSymbolRule`
- `NOT_AN_ALPHA_REGEX` → `notAnAlphaRule`
- `NOT_PHONE_EMAIL_REGEX` → `notPhoneEmailRule`
- `NUMERIC_REGEX` → `numericRule`
- `PASSWORD_FORMAT` → `passwordRule`
- `PHONE_NORTH_AMERICA` → `phoneNorthAmericaRule`
- `PHONE_OAO_FORMAT` → `phoneOaoRule`
- `POSTAL_CODE_REGEX` → `postalCodeRule`
- `REAL_REGEX` → `realRule`
- `REPEATING_SEQUENCE_REGEX` → `repeatingSequenceRule`
- `SSN_FORMAT` → `ssnRule`
- `SSN_EXCLUDE_FORMAT` → `ssnExcludeRule`
- `SSN_OAO_FORMAT` → `ssnOaoRule`
- `SSN_VALID_GROUPS_FORMAT` → `ssnValidGroupsRule`
- `URL_REGEX` → `urlRule`
- `ZIP_CODE_EXTENSION_REGEX` → `zipCodeExtensionRule`
- `ZIP_CODE_REGEX` → `zipCodeRule`

**Additional Constant:**
- `DATE_PATTERN` → `dateRule` (in `standard-constraints.ts`)

### @blue/http Parser Patterns (6 instances)

**Query Expression:**
- `QUERY_KEY_PATTERN` → `queryKeyRule`
- `QUERY_VALUE_PATTERN` → `queryValueRule`

**Matrix Expression:**
- `MATRIX_KEY_PATTERN` → `matrixKeyRule`
- `MATRIX_VALUE_PATTERN` → `matrixValueRule`

**Cookie Expression:**
- `COOKIE_VALUE_PATTERN` → `cookieValueRule`
- `PERCENT_ENCODED_PATTERN` → `percentEncodedRule`

### @blue/util String Utilities (8 instances)

**URI Encoding/Decoding:**
- `charMatcher` → `charRule` (encode-uri-component.ts)
- `singleMatcher` → `singleRule` (decode-uri-component.ts)
- `multiMatcher` → `multiRule` (decode-uri-component.ts)
- `plusMatcher` → `plusRule` (decode-uri-component.ts)

**RegExp Parsing:**
- `regExpFlags` → `regExpFlagsRule` (to-reg-exp.ts)
- `leadingSlash` → `leadingSlashRule` (to-reg-exp.ts)
- `trailingSlashAndFlags` → `trailingSlashAndFlagsRule` (to-reg-exp.ts)
- `patternWithTrailingSlashAndFlags` → `patternWithTrailingSlashAndFlagsRule` (to-reg-exp.ts)

**String Manipulation:**
- `regex` → `wordBoundaryRule` (to-proper.ts)
- `regex` → `sentenceBoundaryRule` (to-sentence.ts)
- `stache` → `mustacheRule` (interpolate.ts)
- `accented` → `accentedRule` (replace-diacritics.ts)
- `nonPrintable` → `nonPrintableRule` (remove-non-printable.ts)

### @blue/parser Delimiters (5 instances)

**Matrix String:**
- `commaMatcher` → `commaRule`
- `prefixMatcher` → `prefixRule`

**Piped String:**
- `ampersand` → `ampersandRule`
- `comma` → `commaRule`

### @blue/context Event Handling (1 instance)

**Event Emitter:**
- `onMatcher` → `onPrefixRule` (event-emitter.ts)

---

## Appendix C: Search and Replace Patterns

For automated migration, use these search patterns:

### Find UPPER_SNAKE_CASE Regex Exports

```bash
# Find all exported regex constants with UPPER_SNAKE_CASE
rg "^export const [A-Z_]+(REGEX|PATTERN|FORMAT|RULE)\s*=" packages/*/src --type ts -A 1
```

### Find Internal Regex with Wrong Suffix

```bash
# Find camelCase variables ending in Matcher that are regex
rg "const \w+Matcher\s*=\s*/.*/" packages/*/src --type ts

# Find descriptive regex without suffix
rg "const (ampersand|comma|plus|regex|accented|nonPrintable|stache)\s*=\s*/.*/" packages/*/src --type ts
```

### Verify New Convention

```bash
# After migration, verify all regex use *Rule suffix
rg "const \w+Rule\s*=\s*/.*/" packages/*/src --type ts

# Verify no old patterns remain
rg "(REGEX|PATTERN|FORMAT)(?!Rule)\s*=\s*/.*/" packages/*/src --type ts
```

---

## Success Criteria

Migration is complete when:

1. ✅ All regex variables use `camelCase` with `*Rule` suffix
2. ✅ No `UPPER_SNAKE_CASE` regex variables remain
3. ✅ STYLE_GUIDE.md documents the new convention
4. ✅ Migration guide exists in `docs/migrations/`
5. ✅ All tests pass (`pnpm test`)
6. ✅ Build succeeds (`pnpm build`)
7. ✅ Linting passes (`pnpm lint`)
8. ✅ Validation scripts return no violations
9. ✅ Major version bump for `@blue/validate`
10. ✅ Breaking changes documented in commit message and CHANGELOG

---

**End of Plan**
