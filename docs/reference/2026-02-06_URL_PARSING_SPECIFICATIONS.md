# URL Parsing Specifications - BlueJS Implementation

**Created:** 2025-02-06  
**Status:** Reference Documentation  
**Related Packages:** `@blue/http`, `@blue/router`

---

## Table of Contents

1. [Overview](#overview)
2. [Specification Summaries](#specification-summaries)
3. [Query String Implementation](#query-string-implementation)
4. [Matrix String Implementation](#matrix-string-implementation)
5. [Compliance Matrix](#compliance-matrix)
6. [Intentional Deviations](#intentional-deviations)
7. [Examples](#examples)
8. [References](#references)

---

## Overview

This document describes BlueJS's implementation of URL query string and matrix string parsing/stringification, documenting compliance with relevant specifications and any intentional deviations.

### Key Implementation Files

- **Query Strings:**

    - Parser + stringifier: `packages/blue-http/src/query-string.ts`
      (parsing delegates to the WHATWG `URLSearchParams` parser)
    - Tests: `packages/blue-http/test/query-string*.spec.ts`

- **Matrix Strings:**
    - Parser + stringifier: `packages/blue-http/src/matrix-string.ts`
    - Tests: `packages/blue-http/test/matrix-string*.spec.ts`

---

## Specification Summaries

### RFC 3986 - URI Generic Syntax

**URL:** https://tools.ietf.org/html/rfc3986

**Relevant Sections:**

- **Section 2:** Characters (percent-encoding)
- **Section 3.3:** Path component (matrix parameters)
- **Section 3.4:** Query component

**Key Points:**

1. **Reserved Characters (Section 2.2):**

    - Gen-delims: `:` `/` `?` `#` `[` `]` `@`
    - Sub-delims: `!` `$` `&` `'` `(` `)` `*` `+` `,` `;` `=`

2. **Unreserved Characters (Section 2.3):**

    - ALPHA, DIGIT, `-`, `.`, `_`, `~`
    - Should NOT be percent-encoded

3. **Query Component (Section 3.4):**

    - Both `&` and `;` are valid delimiters (in sub-delims)
    - No standard for array representation
    - No standard for empty value semantics

4. **Path Component (Section 3.3):**
    - Matrix parameters use `;` delimiter within path segments
    - Syntax: `/path;param1=value1;param2=value2/segment2`

### WHATWG URL Standard

**URL:** https://url.spec.whatwg.org/

**Relevant Sections:**

- Section 5: `application/x-www-form-urlencoded`
- Section 6.1: URL class
- Section 6.2: URLSearchParams class

**Key Points:**

1. **URLSearchParams Interface:**

    - Primary delimiter: `&`
    - Multiple values: Repeated keys (`key=val1&key=val2`)
    - Order preservation: Maintained during parsing

2. **application/x-www-form-urlencoded:**

    - Space encoding: `+` (not `%20`)
    - Newline normalization: CR/LF → CR+LF
    - Percent-encoding for special characters

3. **Empty Values:**
    - `key=` represents empty string `""`
    - `key` alone is not standard (implementation-defined)

### Tim Berners-Lee's Matrix URIs

**URL:** https://www.w3.org/DesignIssues/MatrixURIs.html

**Key Points:**

1. **Purpose:** Path-segment-specific parameters
2. **Delimiter:** Semicolon (`;`)
3. **Parameter Order:** Should be insignificant (logically unordered)
4. **Relative URLs:** `;param=value` changes only specified parameters
5. **Array Format:** No standard defined

### JAX-RS Matrix Parameters

**URL:** https://jakarta.ee/specifications/restful-ws/

**Common Patterns:**

- Semicolon delimiter
- Comma-separated arrays: `foo=1,2,3`
- Per-segment scoping

---

## Query String Implementation

### Parsing Rules

**Input:** `string`  
**Output:** `JSONObject` (key-value pairs)

**Supported Formats:**

```
?foo=bar              → { foo: 'bar' }
&foo=bar              → { foo: 'bar' }
foo=bar               → { foo: 'bar' }
foo=bar&baz=qux       → { foo: 'bar', baz: 'qux' }
foo=bar;baz=qux       → { foo: 'bar;baz=qux' }      // ';' is a value character
foo=bar&foo=baz       → { foo: ['bar', 'baz'] }     // Multiple values
foo                   → { foo: '' }                 // No value
foo=                  → { foo: '' }                 // Empty value
foo[]=a&foo[]=b       → { 'foo[]': ['a', 'b'] }     // Brackets are literal
foo+bar=baz+qux       → { 'foo bar': 'baz qux' }    // Plus-to-space
```

**Parser Behavior (2026-09-13: aligned with WHATWG `URLSearchParams`):**

1. **Delimiter Support:**

    - Sole delimiter: `&` (ampersand), per the WHATWG parser
    - Empty parts between delimiters are dropped (`a=1&&b=2` → `{'a': '1', 'b': '2'}`)
    - A single leading `?` is stripped by the standard itself
    - `#` and `;` are ordinary characters: `#foo=bar` → `{ '#foo': 'bar' }`

2. **Space Encoding:**

    - `+` decoded as space (application/x-www-form-urlencoded) in keys and values
    - `%20` also decoded as space

3. **Multiple Values:**

    - Repeated keys aggregated into arrays
    - Order preserved

4. **Empty Values:**

    - `key=` → `''`
    - `key` → `''`
    - Values are always strings; there is no `null` in parse output

5. **Percent-Encoding:**
    - Standard WHATWG percent-decoding applied
    - Invalid sequences preserved literally (e.g., `%ZZ`)
    - Invalid byte sequences decode as `U+FFFD`

6. **Prototype Safety:**
    - The result record has a null prototype, so keys like `__proto__` are
      preserved as ordinary data

### Stringification Rules

**Input:** `JSONObject`  
**Output:** `string`

**Encoding Behavior:**

1. **Key Sorting:** Alphabetically ascending
2. **Delimiter:** `&` only (no semicolon in output)
3. **Empty Values:**
    - `null` → `key` (no equals)
    - `undefined` → omitted
    - Empty string `""` → `key=`
    - Parse→stringify of a bare key shifts shape: `parse('a')` → `{'a': ''}` →
      `stringify` → `'a='`
4. **Arrays:** Repeated keys (`foo=bar&foo=baz`)
5. **Percent-Encoding:** `encodeURIComponent` for keys and values

**Example:**

```typescript
QueryString.stringify({
    z: 'last',
    a: 'first',
    foo: ['bar', 'baz'],
    empty: null,
    skip: undefined,
});
// → "a=first&empty&foo=bar&foo=baz&z=last"
```

---

## Matrix String Implementation

### Parsing Rules

**Input:** `string`  
**Output:** `JSONObject`

**Supported Formats:**

```
;foo=bar              → { foo: 'bar' }
foo=bar               → { foo: 'bar' }
foo=bar;baz=qux       → { foo: 'bar', baz: 'qux' }
foo=1,2,3             → { foo: ['1', '2', '3'] }    // Comma-separated array
foo                   → { foo: null }                // No value
foo=                  → { foo: null }                // Empty value
foo=,                 → { foo: [null, null] }        // Empty array elements
```

**Parser Behavior:**

1. **Delimiter:** Semicolon (`;`) only
2. **Array Format:** Comma-separated values in single parameter
    - `foo=1,2,3` → `{ foo: ['1', '2', '3'] }`
    - Empty elements become `null`: `foo=1,,3` → `['1', null, '3']`
3. **Empty Values:** Same as query strings (`null`)
4. **Percent-Encoding:** Standard decoding
5. **Space Encoding:** `+` → space (for consistency with query strings)

### Stringification Rules

**Input:** `JSONObject`  
**Output:** `string`

**Encoding Behavior:**

1. **Key Sorting:** Alphabetically ascending (natural order)
2. **Delimiter:** `;` for parameters
3. **Arrays:** Comma-separated (`foo=bar,baz`)
4. **Empty Values:**
    - `null` → `key` (no equals)
    - `undefined` → omitted
    - Empty array `[]` → `key=` (no values after equals)
5. **Percent-Encoding:** `encodeURIComponent` for keys and values

**Example:**

```typescript
MatrixString.stringify({
    z: 'last',
    a: 'first',
    foo: ['bar', 'baz'],
    empty: null,
});
// → "a=first;empty;foo=bar,baz;z=last"
```

---

## Compliance Matrix

### Query String Compliance

| Feature                         | RFC 3986 | WHATWG | BlueJS | Status              |
| ------------------------------- | -------- | ------ | ------ | ------------------- |
| Ampersand delimiter             | ✓        | ✓      | ✓      | ✅ Compliant        |
| Semicolon delimiter             | ✓        | ✗      | ✗      | ✅ Aligned (WHATWG) |
| Percent-encoding                | ✓        | ✓      | ✓      | ✅ Compliant        |
| Plus-to-space                   | —        | ✓      | ✓      | ✅ Compliant        |
| Multiple values (repeated keys) | —        | ✓      | ✓      | ✅ Compliant        |
| Empty value semantics           | —        | `""`   | `""`   | ✅ Aligned (WHATWG) |
| Missing value semantics         | —        | N/A    | `""`   | ✅ Aligned (WHATWG) |
| Key sorting                     | —        | ✗      | ✓      | ℹ️ Extension        |
| Bracket arrays (`foo[]`)        | —        | ✗      | ✗      | ℹ️ Not implemented  |
| Indexed arrays (`foo[0]`)       | —        | ✗      | ✗      | ℹ️ Not implemented  |

### Matrix String Compliance

| Feature                | RFC 3986 | Tim BL | JAX-RS | BlueJS | Status         |
| ---------------------- | -------- | ------ | ------ | ------ | -------------- |
| Semicolon delimiter    | ✓        | ✓      | ✓      | ✓      | ✅ Compliant   |
| Comma-separated arrays | —        | —      | ✓      | ✓      | ✅ Compliant   |
| Empty value semantics  | —        | —      | —      | `null` | ℹ️ Extension   |
| Key sorting            | —        | ✗      | —      | ✓      | ℹ️ Extension   |
| Per-segment scoping    | ✓        | ✓      | ✓      | —      | ℹ️ Parser only |
| Multiple same-key      | —        | —      | —      | ✓      | ℹ️ Supported   |

**Legend:**

- ✅ Compliant: Matches specification
- ⚠️ Deviation: Intentional difference from spec
- ℹ️ Extension: Additional feature not in spec
- — : Not specified

---

## Intentional Deviations

### 1. Space Encoding with Plus Sign

**Specification:** RFC 3986 uses `%20`, WHATWG form encoding uses `+`

**BlueJS Implementation:** Decodes `+` as space (form encoding style)

**Rationale:**

- **HTML Form Compatibility:** Matches form submission behavior
- **Common Practice:** Most web frameworks decode `+` as space
- **User Expectations:** Users expect `foo+bar=baz+qux` to decode with spaces

**Impact:** None - This is standard practice for query strings

### 3. Key Sorting in Output

**Specification:** No specification requires key sorting

**BlueJS Implementation:** Keys are alphabetically sorted in stringification

**Rationale:**

- **Predictability:** Same input always produces same output
- **Testing:** Easier to write assertions
- **Caching:** Enables cache key normalization
- **Debugging:** Easier to visually inspect

**Impact:** None - Order is preserved where it matters (array values)

### 4. Bracket Array Notation Not Supported

**Common Pattern:** `foo[]=bar&foo[]=baz` or `foo[0]=bar&foo[1]=baz`

**BlueJS Implementation:** Not supported, brackets treated as literal characters

**Rationale:**

- **Not Standardized:** No RFC or WHATWG specification for this
- **Framework-Specific:** PHP/Rails convention, not universal
- **Complexity:** Adds parser complexity for uncommon use case
- **Workaround:** Use repeated keys instead (`foo=bar&foo=baz`)

**Impact:** Low - Repeated keys achieve the same result

**Status:** Can be added as opt-in feature if demand exists

### 5. Representation: Repeated Keys

`URLSearchParams` keeps duplicate pairs; `QueryString.parse` aggregates
repeated keys into arrays (`{'foo': ['bar', 'baz']}`). A plain record cannot
hold duplicate keys, and `getAll()`-style access is the framework's shape.

---

## Examples

### Query String Round-trips

```typescript
import QueryString from '@blue/http/query-string';

// Basic parsing
QueryString.parse('foo=bar&baz=qux');
// → { foo: 'bar', baz: 'qux' }

// Semicolon belongs to a value (WHATWG)
QueryString.parse('foo=bar;baz=qux');
// → { foo: 'bar;baz=qux' }

// Multiple values
QueryString.parse('foo=bar&foo=baz&foo=qux');
// → { foo: ['bar', 'baz', 'qux'] }

// Empty values are empty strings (WHATWG)
QueryString.parse('foo=&bar');
// → { foo: '', bar: '' }

// Percent-encoding
QueryString.parse('message=Hello%20World&emoji=%F0%9F%92%A9');
// → { message: 'Hello World', emoji: '💩' }

// Plus to space
QueryString.parse('foo+bar=baz+qux');
// → { 'foo bar': 'baz qux' }

// Stringify with sorting
QueryString.stringify({ z: 'last', a: 'first', m: 'middle' });
// → "a=first&m=middle&z=last"

// Arrays stringified as repeated keys
QueryString.stringify({ foo: ['bar', 'baz', 'qux'] });
// → "foo=bar&foo=baz&foo=qux"

// Round-trip preservation
const input = 'z=3&a=1&foo=x&foo=y';
const parsed = QueryString.parse(input);
const output = QueryString.stringify(parsed);
// output → "a=1&foo=x&foo=y&z=3" (sorted, but values preserved)
```

### Matrix String Round-trips

```typescript
import MatrixString from '@blue/http/matrix-string';

// Basic parsing
MatrixString.parse('foo=bar;baz=qux');
// → { foo: 'bar', baz: 'qux' }

// Comma-separated arrays
MatrixString.parse('colors=red,green,blue');
// → { colors: ['red', 'green', 'blue'] }

// Empty array elements
MatrixString.parse('values=1,,3');
// → { values: ['1', null, '3'] }

// Empty values
MatrixString.parse('foo=;bar');
// → { foo: null, bar: null }

// Stringify with arrays
MatrixString.stringify({ colors: ['red', 'green', 'blue'] });
// → "colors=red,green,blue"

// Sorting
MatrixString.stringify({ z: 'last', a: 'first', m: 'middle' });
// → "a=first;m=middle;z=last"

// Round-trip preservation
const input = 'z=3;a=1;colors=red,green,blue';
const parsed = MatrixString.parse(input);
const output = MatrixString.stringify(parsed);
// output → "a=1;colors=red,green,blue;z=3" (sorted, values preserved)
```

### URLSearchParams Comparison

```typescript
// Native URLSearchParams
const native = new URLSearchParams('foo=bar&baz=qux&foo=123');
native.get('foo'); // → "bar" (first value only)
native.getAll('foo'); // → ["bar", "123"] (all values)
Array.from(native.keys()); // → ["foo", "baz", "foo"] (not deduplicated)

// BlueJS QueryString
const ours = QueryString.parse('foo=bar&baz=qux&foo=123');
ours.foo; // → ["bar", "123"] (array of all values)
Object.keys(ours); // → ["foo", "baz"] (deduplicated)

// Key difference: We aggregate repeated keys into arrays
// URLSearchParams keeps separate entries
```

### Special Characters

```typescript
// Reserved characters
QueryString.parse('url=https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue');
// → { url: 'https://example.com/path?query=value' }

// Unicode
QueryString.parse('emoji=%F0%9F%8D%95&chinese=%E4%B8%AD%E6%96%87');
// → { emoji: '🍕', chinese: '中文' }

MatrixString.parse('emoji=%F0%9F%8D%95;chinese=%E4%B8%AD%E6%96%87');
// → { emoji: '🍕', chinese: '中文' }
```

---

## References

### Specifications

1. **RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax**

    - https://tools.ietf.org/html/rfc3986
    - January 2005, Internet Standard

2. **WHATWG URL Standard**

    - https://url.spec.whatwg.org/
    - Living Standard

3. **W3C URL Specification (Historical)**

    - https://www.w3.org/TR/2012/WD-url-20120524/
    - Working Draft 24 May 2012

4. **Tim Berners-Lee's Matrix URIs**

    - https://www.w3.org/DesignIssues/MatrixURIs.html
    - Design Note, December 1996

5. **HTML5 - application/x-www-form-urlencoded**

    - https://www.w3.org/TR/html52/sec-forms.html#urlencoded-form-data

6. **Jakarta RESTful Web Services (JAX-RS)**
    - https://jakarta.ee/specifications/restful-ws/

### Related Documentation

- **BlueJS Architecture:** `ARCHITECTURE.md`
- **BlueJS Style Guide:** `STYLE_GUIDE.md`
- **Consolidation Plan:** `docs/plans/2025-02-03_QUERY_MATRIX_STRING_CONSOLIDATION.md`
- **Test Suites:**
    - `packages/blue-http/test/query-string.spec.ts`
    - `packages/blue-http/test/query-string-spec-compliance.spec.ts`
    - `packages/blue-http/test/matrix-string.spec.ts`
    - `packages/blue-http/test/matrix-string-spec-compliance.spec.ts`
    - `packages/blue-http/test/url-search-params-compat.spec.ts`

---

## Maintenance Notes

### When to Update This Document

1. **Implementation Changes:** If parser/stringifier behavior changes
2. **Specification Updates:** When RFC or WHATWG specs are revised
3. **New Features:** If bracket notation or other features are added
4. **Deviation Changes:** If intentional deviations are reconsidered

### Version History

- **2025-02-06:** Initial version documenting Phase 5 consolidation results
- **2026-09-13:** Query parsing aligned with WHATWG `URLSearchParams`
  (empty values `''`, `&`-only splitting, lenient percent-decoding);
  parser modules folded into `query-string.ts` / `matrix-string.ts`

---

**Document Status:** Complete  
**Last Updated:** 2026-09-13  
**Maintained By:** BlueJS Core Team
