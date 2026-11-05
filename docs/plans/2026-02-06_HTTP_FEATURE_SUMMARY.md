# HTTP Feature Survey - Executive Summary

**Date:** 2026-02-06  
**Status:** Research Complete, `baseURL` Implemented, Further Implementation Pending  
**Full Document:** [2026-02-06_HTTP_FEATURE_COMPARISON.md](./2026-02-06_HTTP_FEATURE_COMPARISON.md)

---

## Research Scope

Comprehensive comparison of **@ndigo/http** against:

- **Spring Framework RestClient** (Java enterprise standard, inspiration source)
- **Axios** (JavaScript ecosystem leader)
- **Fetch API** (Web standard, foundation layer)
- **Node.js http/https** (Native Node.js modules for low-level control)

**Total Features Analyzed:** 150+ across 16 categories

---

## Key Findings

### @ndigo/http Strengths ✅

1. **5-Hook Interceptor System** - Most granular lifecycle control
    - `preInit`, `preRequest`, `postResponse`, `postError`, `postComplete`
2. **URL Pattern Matching** - `MappedHTTPInterceptor` for conditional interceptors

3. **8 Built-in Interceptors** - Ready-to-use functionality

    - ContentType, DataParameter, IfModified, NotOk, ResponseClass, ResponseCode, ResponseType, Timeout

4. **RFC-Compliant Parsers** - Query/Matrix string parser combinators

5. **Rich Status Abstractions** - 62 response status constants (100-511)

6. **Rich Header Abstractions** - 124 HTTP header constants

7. **Built on Fetch API** - Leverages native browser/Node.js APIs

8. **Base URL Configuration** - Now supported for resolving relative URLs.

### Critical Gaps ❌

**High Priority (Must Have):**

1. ❌ **Instance System** - No `HTTP.create()` pattern for config reuse
2. ❌ **Query Params Config** - No `params: { key: 'value' }` convenience
3. ❌ **Transform Pipeline** - No `transformRequest`/`transformResponse` arrays
4. ❌ **XSRF Protection** - No automatic CSRF token handling (Browser)
5. ❌ **Progress Tracking** - No upload/download progress callbacks (Browser)
6. ❌ **Basic Auth Helper** - No convenience method for HTTP Basic auth
7. ❌ **Node.js Connection Pooling** - No native `http.Agent`/`https.Agent` integration (Node)
8. ❌ **Node.js Client Certificates** - No native client certificate support (Node)

**Medium Priority (Should Have):**

9. ❌ **Custom Validate Status** - No `validateStatus: (status) => boolean`
10. ❌ **Interceptor Management** - Cannot remove interceptors at runtime
11. ❌ **Form Shortcuts** - No `postForm()`, `putForm()` methods
12. ❌ **Node.js Proxy Support** - No native proxy configuration (Node)
13. ❌ **Error Categorization** - Limited error type discrimination
14. ❌ **Range Request Helper** - No byte range convenience API

---

## Recommended Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

1. ✅ **Base URL Configuration (Implemented)**

    ```typescript
    const api = new HTTP([], { baseURL: 'https://api.example.com/' });
    api.get('users'); // Resolves to https://api.example.com/users
    ```

    - **Complexity:** Low
    - **Impact:** Critical for ergonomic URL handling

2. **Instance System with Config Defaults**

```typescript
const api = HTTP.create({
    baseURL: 'https://api.example.com',
    headers: { Authorization: 'Bearer token' },
    timeout: 5000,
});
```

- **Complexity:** Medium
- **Impact:** Foundation for all other features
- **Alignment:** Axios mental model, Spring builder pattern

---

### Phase 2: Request/Response Enhancement (Weeks 3-4)

3. **Query Params Config**

```typescript
api.get('/search', {
    params: { q: 'typescript', page: 1 },
});
// → GET /search?q=typescript&page=1
```

- **Complexity:** Low (leverage existing parsers)
- **Impact:** Major DX improvement
- **Alignment:** Axios API

4. **Transform Pipeline**

```typescript
const api = HTTP.create({
    transformRequest: [(data) => ({ ...data, timestamp: Date.now() })],
    transformResponse: [(data) => parseCustomFormat(data)],
});
```

- **Complexity:** Medium
- **Impact:** Composable data transformations
- **Alignment:** Axios pattern

5. **HTTP Basic Auth Helper**

```typescript
api.get('/protected', {
    auth: { username: 'user', password: 'pass' },
});
```

- **Complexity:** Low
- **Impact:** Convenience for common use case
- **Alignment:** Axios + Spring patterns

---

### Phase 3: Browser Features (Weeks 5-6)

6. **XSRF Protection** 🔵 Browser-only

```typescript
const api = HTTP.create({
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});
```

- **Complexity:** Low
- **Impact:** Critical security feature
- **Implementation:** Built-in interceptor

7. **Progress Tracking** 🔵 Browser-only

```typescript
api.post('/upload', formData, {
    onUploadProgress: (event) => {
        console.log(`${(event.loaded / event.total) * 100}%`);
    },
});
```

- **Complexity:** High (requires XHR wrapper)
- **Impact:** Essential for file uploads
- **Trade-off:** XHR for uploads, ReadableStream for downloads

---

### Phase 4: Polish & Node.js (Weeks 7-8)

8. **Custom Validate Status**
9. **Interceptor Management**
10. **Form Shortcuts**
11. **Node.js Proxy Support** 🟣 Node-only
12. **Error Categorization**
13. **Range Request Helper**
14. **Node.js Connection Pooling** 🟣 Node-only
15. **Node.js Client Certificates** 🟣 Node-only

---

## Platform Compatibility

### Universal Features ✅

- Instance system, query params, transforms, auth helper, validate status, interceptor management, form shortcuts, error categorization, range helper

### Browser-Only Features 🔵

- XSRF protection
- Upload/download progress tracking

### Node-Only Features 🟣

- Proxy configuration
- Custom HTTP agents
- Socket path support
- Connection pooling
- Client certificates
- Custom DNS resolution
- TLS session resumption
- Native streaming integration
- Max content/body length

**Detection Strategy:**

```typescript
const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined';
```

---

## Migration Strategy

### Backward Compatibility

**Approach:** Additive changes (recommended)

- Keep existing API intact
- Add new features as optional config
- Gradual migration path

```typescript
// Old API (still works)
const http = new HTTP();
http.get('https://api.example.com/users');

// New API (opt-in)
const api = HTTP.create({
    baseURL: 'https://api.example.com',
});
api.get('/users');
```

### From Axios

Migration guide for developers coming from Axios:

| Axios                             | @ndigo/http (Proposed)            |
| --------------------------------- | --------------------------------- |
| `axios.create(config)`            | `HTTP.create(config)`             |
| `axios.get(url, { params })`      | `api.get(url, { params })`        |
| `auth: { username, password }`    | `auth: { username, password }`    |
| `transformRequest: [...]`         | `transformRequest: [...]`         |
| `validateStatus: (status) => ...` | `validateStatus: (status) => ...` |
| `onUploadProgress`                | `onUploadProgress`                |
| `interceptors.request.use()`      | `interceptors.request.use()`      |

---

## Performance Targets

| Metric              | Target         | Critical Path               |
| ------------------- | -------------- | --------------------------- |
| Request Overhead    | < 1ms          | Config merge + interceptors |
| Transform Pipeline  | < 0.5ms per fn | Array iteration             |
| Memory per Instance | < 1KB          | Shared default configs      |
| Bundle Size (core)  | < 5KB gzipped  | Tree-shaking                |
| Bundle Size (full)  | < 10KB gzipped | Optional features           |

---

## Testing Requirements

### Coverage Areas

1. **Unit Tests** - Each feature in isolation
2. **Integration Tests** - Full request/response flow
3. **Platform Tests** - Browser + Node.js environments
4. **Compatibility Tests** - Axios API parity

### Test Environments

- Browser: jsdom or real browser (Playwright)
- Node.js: Native Node environment
- Feature detection mocks

---

## Documentation Deliverables

1. **Migration Guide**

    - Axios → @ndigo/http
    - Old @ndigo/http API → New API
    - Spring concepts → @ndigo/http equivalents

2. **Feature Documentation**

    - Instance system examples
    - Config options reference
    - Transform pipeline patterns
    - XSRF protection setup
    - Progress tracking examples

3. **API Reference**

    - TypeScript interfaces
    - Method signatures
    - Error types

4. **Examples**
    - Common use cases
    - Authentication patterns
    - File upload with progress
    - Error handling strategies

---

## Success Metrics

### Developer Experience

- ✅ DRY configuration (instance system)
- ✅ Intuitive query params (no manual URL construction)
- ✅ Composable transformations (clean data pipeline)
- ✅ Secure by default (XSRF protection)
- ✅ File upload UX (progress tracking)

### Technical Goals

- ✅ 100% backward compatible (additive changes)
- ✅ Platform-agnostic core (browser + Node.js)
- ✅ < 10KB bundle size with all features
- ✅ < 1ms request overhead
- ✅ 95%+ test coverage for new features

### Ecosystem Alignment

- ✅ Axios migration path (familiar API)
- ✅ Spring patterns adapted for JavaScript
- ✅ Fetch API foundation preserved
- ✅ Industry best practices adopted

---

## Decision Points

### 1. Instance System API

**Options:**

- A) `HTTP.create(config)` - Axios style (recommended)
- B) `new HTTP(config)` - Constructor style
- C) Both supported

**Recommendation:** A (matches Axios, clear distinction from base class)

### 2. Progress Tracking Implementation

**Options:**

- A) XHR wrapper for uploads + ReadableStream for downloads (recommended)
- B) ReadableStream for both (loses upload progress in some browsers)
- C) External library integration

**Recommendation:** A (best browser compatibility)

### 3. Transform Pipeline Integration

**Options:**

- A) Replace some existing interceptors (breaking change)
- B) Coexist with interceptors (recommended)
- C) Transform as special interceptor type

**Recommendation:** B (backward compatible, clear separation)

---

## Next Steps

1. ✅ **Review and approve** priority ordering
2. ⏳ **Design TypeScript interfaces** for Phase 1 features
3. ⏳ **Prototype instance system** with config merging
4. ⏳ **Implement query params** leveraging existing parsers
5. ⏳ **Validate approach** with stakeholders

**Estimated Timeline:** 8 weeks for all phases (aggressive), 12 weeks (realistic)

---

## Related Documents

- **Full Analysis:** [2026-02-06_HTTP_FEATURE_COMPARISON.md](./2026-02-06_HTTP_FEATURE_COMPARISON.md)
- **Spring Research Plan:** (Reference to research plan document)
- **ARCHITECTURE.md:** HTTP Client Architecture section
- **@ndigo/http README:** Package documentation

---

## Questions for Review

1. **Priority Ordering:** Agree with High/Medium/Low classification?
2. **Phase 1 Scope:** Instance system + query params in 2 weeks realistic?
3. **Backward Compatibility:** Additive approach acceptable, or major version bump preferred?
4. **Platform Strategy:** Browser-first, Node-first, or parallel development?
5. **Progress Tracking:** Accept XHR trade-off for upload progress?
6. **Bundle Size:** 10KB target acceptable for full-featured HTTP client?

---

**End of Executive Summary**

For detailed feature-by-feature comparison, implementation details, code examples, and API design proposals, see the full document: [2026-02-06_HTTP_FEATURE_COMPARISON.md](./2026-02-06_HTTP_FEATURE_COMPARISON.md)
