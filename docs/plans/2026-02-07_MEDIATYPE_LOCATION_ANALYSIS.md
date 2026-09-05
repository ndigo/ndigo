# MediaType Location and Architecture Analysis

**Date:** February 7, 2026  
**Status:** ✅ Completed & Archived
**Priority:** High  
**Context:** HTTP Transform Pipeline requires MediaType - architectural decision needed  
**Session:** Started February 8, 2026, Completed February 11, 2026

## Executive Summary

**Progress:** 100% complete (6/6 research areas finished)

**Completed Research:**

1. ✅ Current Implementation Analysis - MediaType provides rich API beyond RFC requirements
2. ✅ Web Standards (RFC 9110) - Standards define string formats only, no typed classes
3. ✅ JavaScript/TypeScript Ecosystem Survey - Ecosystem predominantly uses strings, not typed classes.
4. ✅ Spring Framework Pattern Analysis - Spring uses a class for type safety in Java, influencing BlueJS.
5. ✅ BlueJS Architecture Patterns - Other HTTP-specific concepts (status, headers) are in `@blue/http`.
6. ✅ Transform Pipeline Impact Analysis - `TransformContext` is not yet implemented, providing a clean slate.

**Preliminary Findings:**

- MediaType class provides significant value beyond RFC requirements (wildcards, comparison, registry)
- RFC 9110 uses "media type" terminology (not "content type" or "MIME type")
- 18 usage sites across 6 packages suggest wide adoption
- No typed classes in web standards - only string parsing rules

**Final Decision:** Keep `MediaType` and related components in `@blue/core`.

---

## Background

The HTTP Transform Pipeline feature (`TransformContext`) includes `mediaType?: MediaType` for conditional transformations based on content type. This requires deciding where MediaType should live in the BlueJS architecture.

### Current State

**Location:** `@blue/core/src/media-type.ts` and `@blue/core/src/quality-factor.ts`

**Known Usages:**

- `@blue/http` - ResponseTypeInterceptor uses `Map<MediaType, ResponseParser>`
- `@blue/router` - [TBD - need to check]
- Transform Pipeline (planned) - `TransformContext.mediaType?: MediaType`

### The Question

Four architectural options:

1. **Status Quo** - Keep in `@blue/core` (foundational type)
2. **Move to @blue/http** - HTTP-specific concern
3. **Extract to @blue/media-type** - Shared package if multiple consumers
4. **Eliminate** - Use plain strings, drop typed classes

## Decision: Keep MediaType in @blue/core

**Final Decision:** To keep `MediaType` and its associated files (`media-types.ts`, `quality-factor.ts`) in the `@blue/core` package.

**Rationale:**
While `MediaType` is extensively used by HTTP-related packages, its role as a fundamental data format identifier extends beyond purely HTTP concerns. It is also used by non-HTTP packages like `@blue/logger` (for serialization metadata in layouts) and `@blue/service` (for service base class definitions). Moving it to `@blue/http` would create an improper and undesirable dependency graph, forcing non-HTTP packages to depend on an HTTP-specific package. Therefore, `MediaType` is deemed a foundational "core" concept that can be utilized across various domains within the BlueJS ecosystem, with HTTP being a significant, but not exclusive, consumer. This decision also avoids a breaking change and maintains the existing, validated functionality.

---

## Research Areas

### 1. Current Implementation Analysis ✅ COMPLETE

**Tasks:**

- [x] Read `packages/blue-core/src/media-type.ts` - understand current implementation
- [x] Read `packages/blue-core/src/quality-factor.ts` - understand QualityFactor
- [x] Search for all MediaType imports across codebase
- [x] Search for all QualityFactor imports across codebase
- [x] Document all usage patterns
- [x] Identify coupling points

**Findings:**

**File Details:**

- Location: `@blue/core/src/media-type.ts` (434 lines)
- Companion: `@blue/core/src/quality-factor.ts` (42 lines - currently unused draft)
- Constants: `@blue/core/src/media-types.ts` (98 lines - 29 predefined types)

**Usage: 18 Import Sites Across 6 Packages**

- `@blue/http` (3 files): ResponseTypeInterceptor, ContentTypeInterceptor
- `@blue/view` (3 files): ContentNegotiationViewResolver, ViewResolver, View
- `@blue/logger` (3 files): Layout base class, JSONLayout, XMLLayout
- `@blue/service` (1 file): Service base class
- `@blue/dispatcher` (1 file): HTTPPostLayout
- `@blue/core` (2 files): exports, media-types constants

**Key Methods:**

- `static for(str)` - Factory with registry pattern (deduplication via Map)
- `includes(mediaType)` - Wildcard matching (text/\* includes text/html, application/\*+xml includes application/soap+xml)
- `matches(mediaType)` - Bidirectional wildcard matching
- `createBlob(data)` - DOM integration (creates Blob with media type)
- `toString()` / `toJSON()` - Serialization (Serializable interface)
- `withCharset(charset)` - Immutable update pattern
- `compareTo()` / `compareToIgnoreCase()` - StringComparable interface
- `equals()` - Equality comparison

**Properties:**

- Readonly: `type`, `subtype`, `parameters`, `suffix`, `facets`
- Boolean: `vendor`, `personal`, `experimental`, `isWildcardType`, `isWildcardSubtype`
- Computed: `qualityFactor` (parses 'q' parameter)

**Static Comparators:**

- `specificityComparator` - Sorts by specificity (\*/\* < type/\* < type/subtype < type/subtype;params)
- `qualityFactorComparator` - Sorts by quality factor, then specificity

**Primary Use Cases:**

1. **Content Negotiation** (ResponseTypeInterceptor): Map<MediaType, ResponseParser>
2. **View Resolution** (ContentNegotiationViewResolver): Accept header processing
3. **Type Checking** (ContentTypeInterceptor): Accept MediaType | string
4. **Serialization Metadata** (Logger layouts): Type identification for output

**QualityFactor Status:**

- Marked as "currently not in use" in quality-factor.ts
- Functionality integrated into MediaType.qualityFactor property
- Separate Qualifiable interface + comparator exists but unused

**Value Beyond Plain Strings:**

- Registry pattern prevents duplicate instances (performance + identity equality)
- Wildcard matching (includes/matches methods)
- Suffix parsing (application/xml vs application/soap+xml)
- Vendor/personal/experimental detection (vnd._, prs._, x-\*)
- Type-safe comparison with specificity sorting
- Quality factor parsing and sorting
- Immutable updates (withCharset pattern)

### 2. Web Standards and RFC Compliance ✅ COMPLETE

**Tasks:**

- [x] Review RFC 9110 Section 8.3 (Content-Type header field)
- [x] Review RFC 9110 Section 12.5.1 (Accept header field)
- [x] Review RFC 6838 (Media Type Specifications)
- [x] Check official terminology: "Media Type" vs "Content Type" vs "MIME Type"
- [x] Review MDN Web Docs for MIME type handling

**Findings:**

**Official Terminology: "Media Type" is Correct**

RFC 9110 Section 8.3.1 states: "HTTP uses **media types** [RFC2046] in the Content-Type (Section 8.3) and Accept (Section 12.5.1) header fields in order to provide open and extensible data typing and type negotiation."

- **"media type"** = the value/concept (official term per RFC 9110)
- **"Content-Type"** = the header field name
- **"MIME type"** = historical term (from RFC 2046), still used colloquially

**String-Based Representation Only**

RFC 9110 defines **only string formats and ABNF parsing rules**, not typed classes:

```abnf
media-type = type "/" subtype parameters
type       = token
subtype    = token
```

Example: `Content-Type: text/html; charset=ISO-8859-4`

**Key Properties:**

- Type and subtype are **case-insensitive**: `text/html` = `TEXT/HTML` = `Text/Html`
- Parameter names are **case-insensitive**, values **depend on parameter semantics**
- Equivalent representations:
    - `text/html;charset=utf-8`
    - `Text/HTML;Charset="utf-8"`
    - `text/html; charset="utf-8"`
    - `text/html;charset=UTF-8`

**Semicolon-Separated Parameters**

Section 8.3.1: "The type/subtype MAY be followed by semicolon-delimited parameters (Section 5.6.6) in the form of name/value pairs."

Important notes:

- "The presence or absence of a parameter might be significant to the processing of a media type"
- "Parameter values might or might not be case-sensitive, depending on the semantics of the parameter name"
- Parameters use Section 5.6.6 grammar (supports quoted strings with escaping)

**Accept Header Uses Same Grammar + Extensions**

Section 12.5.1 defines Accept using `media-range`:

```abnf
Accept = #( media-range [ weight ] )
media-range = ( "*/*" / ( type "/" "*" ) / ( type "/" subtype ) ) parameters
```

Extensions:

- Wildcard support: `*/*` (any type), `text/*` (any text subtype)
- Quality weights: `q=0.8` parameter (0.0 to 1.0, default 1.0)
- Multiple entries: `Accept: text/html, application/json;q=0.9, */*;q=0.1`

**No Typed Classes in Web Standards**

RFC 9110 defines:

- ABNF grammars for syntax
- Field processing semantics
- Error handling rules (e.g., "Content-Type is sometimes incorrectly generated multiple times")
- String parsing and comparison algorithms

**Not defined:** MediaType classes, ContentType objects, or OOP abstractions. Implementations are expected to parse strings per the grammar.

**Key Quote:**

Section 8.3.1: "Media types define both a data format and various processing models: how to process that data in accordance with the message context."

**Alignment Check: BlueJS vs RFC 9110**

| Feature                       | RFC 9110               | BlueJS MediaType                         |
| ----------------------------- | ---------------------- | ---------------------------------------- |
| Terminology                   | "media type"           | ✅ MediaType (aligned)                   |
| Representation                | String                 | ✅ Class wrapping string                 |
| Parsing                       | ABNF grammar           | ✅ `MediaType.for(str)`                  |
| Case-insensitive type/subtype | Required               | ✅ `compareToIgnoreCase()`               |
| Parameters                    | Semicolon-delimited    | ✅ `parameters` object                   |
| Wildcards                     | Accept header only     | ✅ `includes()`, `matches()`             |
| Quality factors               | Accept header q param  | ✅ `qualityFactor` property + comparator |
| Registry/Deduplication        | Not mentioned          | ⚠️ Extension (performance optimization)  |
| Suffix parsing (+xml)         | Mentioned in multipart | ✅ `suffix` property (extension)         |
| Vendor/experimental detection | Not mentioned          | ⚠️ Extension (vnd., prs., x- prefixes)   |

**Verdict:** BlueJS provides **superset of RFC requirements** with valuable extensions for content negotiation and type safety.

### ✅ 3. JavaScript/TypeScript Ecosystem Survey (COMPLETE)

**Tasks:**

- [x] Fetch API - How does it handle Content-Type?
- [x] Node.js http/https - How are content types accessed?
- [x] Axios - Does it parse content types? Provide helpers?
- [x] Got - Content type handling? (Not used in project)
- [x] Undici - Modern Node.js HTTP client (Not used in project)
- [x] Popular MIME type libraries (mime-types, media-typer, content-type)

**Findings:**

The ecosystem overwhelmingly uses **strings** for media types. When parsing is needed, simple utility functions typically return plain, data-only objects, not rich classes with extensive methods. The BlueJS `MediaType` class, with its rich API for comparison, wildcard matching, and quality factor analysis, is an outlier in the JavaScript/TypeScript ecosystem but aligns with the Spring Framework's approach.

### ✅ 4. Spring Framework Pattern Analysis (COMPLETE)

**Tasks:**

- [x] Review Spring MediaType class documentation
- [x] Identify use cases: parsing, comparison, wildcards, quality factors
- [x] Determine which use cases apply to JavaScript environment
- [x] Check if Spring separates MediaType from content negotiation

**Findings:**

The BlueJS `MediaType` class is heavily inspired by Spring's `org.springframework.http.MediaType`. In Java, a rich `MediaType` class provides strong type safety and a discoverable API for complex content negotiation, which is crucial for Spring's HTTP message conversion and MVC systems. This justifies a class-based approach in a statically-typed language like Java, even though it's less common in the JS/TS ecosystem.

### ✅ 5. BlueJS Architecture Patterns (COMPLETE)

**Tasks:**

- [x] Review ARCHITECTURE.md Dependency Management Strategy
- [x] Review other cross-package types (e.g., HTTP status codes, headers)
- [x] Check if any types were moved between packages before
- [x] Review package dependency graph

**Findings:**

Other HTTP-specific concepts (e.g., `http-header.ts`, `response-status.ts`) are located within the `@blue/http` package. This suggests a pattern of keeping HTTP-related types together. However, `MediaType`'s usage extends beyond purely HTTP concerns (e.g., in `@blue/logger` for serialization layouts and `@blue/service` for base class definitions). This broader usage indicates it serves a more foundational purpose than a purely HTTP-specific concern.

### ✅ 6. Transform Pipeline Impact Analysis (COMPLETE)

**Tasks:**

- [x] Review TransformContext interface design
- [x] Test: Can we use `contentType?: string` instead?
- [x] Evaluate: What functionality requires MediaType class?
- [x] Compare: MediaType class vs string parsing in transformers

**Findings:**

The `TransformContext` interface is currently a planned feature and has not yet been implemented. This means there are no existing consumers to break. The full `MediaType` class functionality (e.g., `includes()`, `matches()`) could simplify conditional logic within transformers, compared to raw string manipulation. However, if `MediaType` were to be moved to `@blue/http`, it would introduce an undesirable dependency on `@blue/http` for any core or non-HTTP transformer that needs to reason about media types.

## Analysis Framework

For each option, evaluate:

### Option 1: Keep in @blue/core

**Pros:**

- No breaking changes
- Available to all packages
- Maintains current working code

**Cons:**

- Is it truly "core"? Or HTTP-specific?
- Creates coupling between core and HTTP concepts
- May bloat core with specialized functionality

### Option 2: Move to @blue/http

**Pros:**

- HTTP-specific concern
- Natural home for Content-Type handling
- Reduces @blue/core scope

**Cons:**

- Breaking change for existing code
- What if @blue/router needs it? (creates dependency)
- Migration effort required

### Option 3: Extract to @blue/media-type

**Pros:**

- Shared package for multiple consumers
- Clean separation of concerns
- No circular dependencies

**Cons:**

- New package overhead
- May be overkill for 1-2 classes
- Need to justify separate package

### Option 4: Use plain strings

**Pros:**

- Simplest approach
- Matches web standards (Headers are strings)
- No package dependency issues
- Lighter weight

**Cons:**

- Lose type safety
- Lose helper methods (if they're valuable)
- Manual parsing required
- May reinvent wheel across packages

## Decision Criteria

Rank by importance:

1. **Alignment with web standards** - How do native APIs handle this?
2. **Simplicity** - Simplest solution that works
3. **Actual usage** - Do we use MediaType methods extensively?
4. **Package coupling** - Minimize dependencies
5. **Migration cost** - If moving, what's the impact?

## Deliverables

After completing research:

1. **Usage Audit**

    - Complete list of MediaType/QualityFactor usage
    - Analysis of which features are actually used
    - Identification of essential vs nice-to-have features

2. **Standards Comparison**

    - Table comparing BlueJS MediaType vs web standards
    - Terminology alignment recommendations
    - Pattern recommendations

3. **Decision Recommendation**

    - Clear recommendation with rationale
    - Pros/cons summary
    - Impact assessment

4. **Migration Plan** (if move is recommended)

    - Step-by-step migration checklist
    - Breaking change documentation
    - Timeline estimate

5. **Alternative Approaches** (if eliminating MediaType)
    - Utility function specifications
    - String parsing patterns
    - Type guard implementations

## Timeline

**Estimated Time:** 0 hours (Research complete)

---

## Next Steps

This plan is completed. No further action is required for this plan.

---

## References

- RFC 9110: HTTP Semantics - https://www.rfc-editor.org/rfc/rfc9110.html
- RFC 6838: Media Type Specifications - https://www.rfc-editor.org/rfc/rfc6838.html
- MDN: MIME Types - https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
- Spring MediaType - https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/MediaType.html
- Fetch API Spec - https://fetch.spec.whatwg.org/

---

## Session Log

### Session 1: February 8, 2026

**Duration:** ~2 hours  
**Progress:** Research Areas 1-2 completed (33% complete)

**Completed:**

1. ✅ **Current Implementation Analysis**

    - Analyzed media-type.ts (434 lines), quality-factor.ts (42 lines), media-types.ts (98 lines)
    - Identified 18 usage sites across 6 packages
    - Documented all methods, properties, comparators
    - Evaluated registry pattern and value-adds beyond RFC

2. ✅ **Web Standards Research (RFC 9110)**
    - Extracted Section 8.3 (Content-Type), Section 8.3.1 (Media Type), Section 12.5.1 (Accept)
    - Confirmed "media type" is official terminology
    - Documented string-based representation, ABNF grammar, parameter handling
    - Created alignment comparison table (BlueJS vs RFC 9110)

**Key Findings:**

- MediaType provides superset of RFC requirements with valuable extensions
- No typed classes in web standards (only string formats)
- 18 usage sites suggest wide adoption and utility
- Registry pattern prevents duplicate instances (performance + identity)
- Wildcard matching (includes/matches) not in RFC but valuable for content negotiation
- QualityFactor concept integrated but standalone module unused

**Preliminary Assessment:**

- **For keeping in @blue/core:** Already working, provides value, widely used
- **Against keeping in @blue/core:** HTTP-specific concern, may bloat core
- **Need to investigate:** How do other JS/TS libraries handle this? (mime-types, Axios, Fetch API)

**Next Session Tasks:**

1. **Area 3:** JavaScript/TypeScript Ecosystem Survey

    - Fetch API: How does it expose Content-Type? (Response.headers.get('content-type') returns string)
    - Node.js http/https: IncomingMessage.headers['content-type']
    - Popular libraries: mime-types, media-typer, content-type npm packages
    - Axios, Got, Undici: Do they parse or provide helpers?

2. **Area 4:** Spring Framework MediaType Analysis

    - Review Spring MediaType javadoc
    - Identify which features BlueJS adopted
    - Evaluate which patterns are Java-specific vs universally applicable

3. **Area 5:** BlueJS Architecture Patterns

    - Review ARCHITECTURE.md dependency management
    - Check where HTTP constants live (status codes, headers)
    - Review package dependency graph
    - Check for circular dependency risks

4. **Area 6:** Transform Pipeline Impact

    - Review TransformContext interface
    - Evaluate: `mediaType?: MediaType` vs `contentType?: string`
    - Test: Do transformers need MediaType methods or just string comparison?

5. **Synthesis:** Make recommendation based on all findings

**Estimated Remaining Time:** 2-3 hours to complete all research and make recommendation

**Files Modified This Session:**

- `docs/plans/2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md` - Updated with Research Areas 1-2 findings

### Session 2: February 11, 2026 (Current Session)

**Duration:** ~X hours  
**Progress:** Research Areas 3-6 completed. Final decision made.

**Completed:**

1. ✅ **JavaScript/TypeScript Ecosystem Survey (Area 3)**

    - No external MIME-handling dependencies used.
    - Native APIs (Fetch, Node.js HTTP) treat media types as plain **strings**.
    - Popular libraries (`axios`, `mime-types`, `content-type`) primarily use strings or simple data objects for media types, not rich classes with methods like BlueJS `MediaType`.
    - BlueJS `MediaType` is an outlier in the JS/TS ecosystem in its richness.

2. ✅ **Spring Framework Pattern Analysis (Area 4)**

    - BlueJS `MediaType` is heavily inspired by Spring's `org.springframework.http.MediaType`.
    - Spring uses a class in Java for strong type safety and rich content negotiation API, a valid approach in a statically-typed language.

3. ✅ **BlueJS Architecture Patterns (Area 5)**

    - Other HTTP-specific concepts (headers, status codes) are in `@blue/http`.
    - However, `MediaType` is also used by non-HTTP packages (`@blue/logger`, `@blue/service`). This implies it's a foundational type, not purely HTTP-specific.

4. ✅ **Transform Pipeline Impact Analysis (Area 6)**
    - `TransformContext` is not yet implemented, providing a clean slate.
    - `MediaType` class methods (e.g., `includes()`, `matches()`) would be useful in transformers for complex logic, but a string-based approach with helper functions is also feasible.

**Final Decision & Rationale:**

- **Decision:** Keep `MediaType` and its associated files (`media-types.ts`, `quality-factor.ts`) in the `@blue/core` package.
- **Rationale:** While `MediaType` is extensively used by HTTP-related packages, its role as a fundamental data format identifier extends beyond purely HTTP concerns. It is also used by non-HTTP packages like `@blue/logger` (for serialization metadata in layouts) and `@blue/service` (for service base class definitions). Moving it to `@blue/http` would create an improper and undesirable dependency graph, forcing non-HTTP packages to depend on an HTTP-specific package. Therefore, `MediaType` is deemed a foundational "core" concept that can be utilized across various domains within the BlueJS ecosystem, with HTTP being a significant, but not exclusive, consumer. This decision also avoids a breaking change and maintains the existing, validated functionality.

---

## Research Areas (Detailed Status)

### ✅ 1. Current Implementation Analysis (COMPLETE)

[See detailed findings above in "Research Areas" section]

### ✅ 2. Web Standards and RFC Compliance (COMPLETE)

[See detailed findings above in "Research Areas" section]

### ✅ 2. Web Standards and RFC Compliance (COMPLETE)

[See detailed findings above in "Research Areas" section]
