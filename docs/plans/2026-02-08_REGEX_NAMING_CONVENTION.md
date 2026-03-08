# RegExp Naming Convention Standardization Plan

**Date:** 2026-02-08
**Updated:** 2026-02-11
**Status:** Completed
**Type:** Breaking Change - Code Style Standardization
**Total Constants:** 37 across 5 files

---

## Goal

Rename all `UPPER_SNAKE_CASE` RegExp constants to `camelCase` with standardized `Rule` suffix to adhere to the project's style guide.

**Breaking Change Note:** The `@blue/validate/src/formats.ts` exports are public API (exposed via `formats.*` namespace in `@blue/validate`). External consumers will need to update references.

---

## Affected Packages

- `@blue/http` (2 files, 4 constants)
- `@blue/validate` (2 files, 31 constants)
- `@blue/platform-web` (1 file, 2 constants)

---

## Plan

### Phase 1: Rename Constants

#### 1.1 `@blue/http` Package

- **File**: `packages/blue-http/src/parsers/matrix-expression.ts` (file-local, not exported)
    - Rename `MATRIX_KEY_PATTERN` to `matrixKeyRule`
    - Rename `MATRIX_VALUE_PATTERN` to `matrixValueRule`
- **File**: `packages/blue-http/src/parsers/query-expression.ts` (file-local, not exported)
    - Rename `QUERY_KEY_PATTERN` to `queryKeyRule`
    - Rename `QUERY_VALUE_PATTERN` to `queryValueRule`

#### 1.2 `@blue/validate` Package

- **File**: `packages/blue-validate/src/formats.ts` (all exported, public API via `formats.*`)

    - Rename `ADDRESS_LINE_REGEX` to `addressLineRule`
    - Rename `ALPHA_NUMERIC_REGEX` to `alphaNumericRule`
    - Rename `ALPHA_NUMERIC_PLUS_REGEX` to `alphaNumericPlusRule`
    - Rename `ALPHA_REGEX` to `alphaRule`
    - Rename `ANY_ALPHA_NUMERIC_REGEX` to `anyAlphaNumericRule`
    - Rename `BOOLEAN_REGEX` to `booleanRule`
    - Rename `CITY_REGEX` to `cityRule`
    - Rename `EMAIL_REGEX` to `emailRule`
    - Rename `INTEGER_REGEX` to `integerRule`
    - Rename `NAME_REGEX` to `nameRule`
    - Rename `NOT_A_CAPITAL_REGEX` to `notACapitalRule`
    - Rename `NOT_A_NUMBER_REGEX` to `notANumberRule`
    - Rename `NOT_A_PASSWORD_SYMBOL` to `notAPasswordSymbolRule`
    - Rename `NOT_AN_ALPHA_REGEX` to `notAnAlphaRule`
    - Rename `NOT_PHONE_EMAIL_REGEX` to `notPhoneEmailRule`
    - Rename `NUMERIC_REGEX` to `numericRule`
    - Rename `PASSWORD_FORMAT` to `passwordRule`
    - Rename `PHONE_NORTH_AMERICA` to `phoneNorthAmericaRule`
    - Rename `PHONE_OAO_FORMAT` to `phoneOaoRule`
    - Rename `POSTAL_CODE_REGEX` to `postalCodeRule`
    - Rename `REAL_REGEX` to `realRule`
    - Rename `REPEATING_SEQUENCE_REGEX` to `repeatingSequenceRule`
    - Rename `SSN_EXCLUDE_FORMAT` to `ssnExcludeRule`
    - Rename `SSN_FORMAT` to `ssnRule`
    - Rename `SSN_OAO_FORMAT` to `ssnOaoRule`
    - Rename `SSN_VALID_GROUPS_FORMAT` to `ssnValidGroupsRule`
    - Rename `URL_REGEX` to `urlRule`
    - Rename `WHITESPACE_REGEX` to `whitespaceRule`
    - Rename `ZIP_CODE_EXTENSION_REGEX` to `zipCodeExtensionRule`
    - Rename `ZIP_CODE_REGEX` to `zipCodeRule`

- **File**: `packages/blue-validate/src/standard-constraints.ts` (file-local, not exported)
    - Rename `DATE_PATTERN` to `dateRule`
    - Update all 30 import names from `./formats` to match new names

#### 1.3 `@blue/platform-web` Package

- **File**: `packages/blue-platform-web/src/parser/cookie-expression.ts` (file-local, not exported)
    - Rename `COOKIE_VALUE_PATTERN` to `cookieValueRule`
    - Rename `PERCENT_ENCODED_PATTERN` to `percentEncodedRule`

---

## Phase 2: Verification

- [x] Run `pnpm build` to ensure no TypeScript errors
- [x] Run `pnpm test` to ensure all tests pass (no test files reference constants by name)

---

## Phase 3: Commit Changes

- [x] Committed as 7d58ca0: `refactor(validate,http,platform-web): rename UPPER_SNAKE_CASE RegExp constants to camelCase`

---

## Research Notes

- **No test files** reference any of these constants by name (tests use constraint validators, not regex directly)
- **File-local constants** (http, platform-web, standard-constraints.ts): No cross-file references, safe to rename
- **Exported constants** (formats.ts): All 30 are imported in `standard-constraints.ts` and re-exported via `index.ts` as `formats.*` namespace
- **TSDoc comments** in `formats.ts` reference old names in `@constant` tags and should be updated
- `DEFAULT_DATE_FORMAT` (string constant, not RegExp) is NOT included in this rename
