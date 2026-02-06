# Quick Reference: HTTP Client Feature Matrix

**Date:** 2025-02-06  
**Purpose:** At-a-glance feature comparison table  
**Full Analysis:** [2025-02-06_HTTP_FEATURE_COMPARISON.md](./2025-02-06_HTTP_FEATURE_COMPARISON.md)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully Supported |
| 🟡 | Partially Supported / Via Workaround |
| ❌ | Not Supported |
| 🔵 | Platform-Specific (Browser-only) |
| 🟣 | Platform-Specific (Node-only) |

---

## Core Features Comparison

| Feature | @blue/http | Spring | Axios | Fetch | Priority |
|---------|-----------|--------|-------|-------|----------|
| **Instance System** | ❌ | ✅ | ✅ | ❌ | 🔴 HIGH |
| **Config Defaults** | ❌ | ✅ | ✅ | ❌ | 🔴 HIGH |
| **Base URL** | ❌ | ✅ | ✅ | ❌ | 🔴 HIGH |
| **Query Params Config** | 🟡 | ✅ | ✅ | 🟡 | 🔴 HIGH |
| **Transform Pipeline** | 🟡 | ✅ | ✅ | ❌ | 🔴 HIGH |
| **Basic Auth Helper** | 🟡 | ✅ | ✅ | 🟡 | 🔴 HIGH |
| **XSRF Protection** 🔵 | ❌ | 🟡 | ✅ | ❌ | 🔴 HIGH |
| **Upload Progress** 🔵 | ❌ | ❌ | ✅ | 🟡 | 🔴 HIGH |
| **Download Progress** 🔵 | ❌ | ❌ | ✅ | 🟡 | 🔴 HIGH |
| **Validate Status** | 🟡 | ✅ | ✅ | ❌ | 🟠 MEDIUM |
| **Interceptor Management** | ❌ | 🟡 | ✅ | ❌ | 🟠 MEDIUM |
| **Form Shortcuts** | ❌ | ✅ | ✅ | ❌ | 🟠 MEDIUM |
| **Proxy Support** 🟣 | ❌ | ✅ | ✅ | ❌ | 🟠 MEDIUM |
| **Error Categorization** | 🟡 | ✅ | ✅ | ❌ | 🟠 MEDIUM |
| **Range Request Helper** | 🟡 | ✅ | 🟡 | 🟡 | 🟠 MEDIUM |

---

## @blue/http Unique Strengths

| Feature | Status | Notes |
|---------|--------|-------|
| **5-Hook Interceptor System** | ✅ | preInit, preRequest, postResponse, postError, postComplete |
| **URL Pattern Matching** | ✅ | MappedHTTPInterceptor for conditional interceptors |
| **8 Built-in Interceptors** | ✅ | ContentType, DataParameter, IfModified, NotOk, ResponseClass, ResponseCode, ResponseType, Timeout |
| **Query/Matrix Parsers** | ✅ | RFC-compliant parser combinators |
| **62 Status Constants** | ✅ | Comprehensive status code abstractions (100-511) |
| **124 Header Constants** | ✅ | Type-safe header name constants |
| **ResponseStatus Class** | ✅ | isInformational(), isSuccess(), isRedirection(), isClientError(), isServerError() |

---

## Feature Gap Summary

### 🔴 HIGH Priority Gaps (Must Have)

1. ❌ **Instance System** - No `HTTP.create()` for config reuse
2. ❌ **Query Params** - No `params: {}` convenience
3. ❌ **Transform Pipeline** - No composable transformations
4. ❌ **XSRF Protection** 🔵 - No automatic CSRF handling
5. ❌ **Progress Tracking** 🔵 - No upload/download progress
6. 🟡 **Basic Auth** - No convenience helper

### 🟠 MEDIUM Priority Gaps (Should Have)

7. 🟡 **Validate Status** - Fixed 4xx/5xx logic
8. ❌ **Interceptor Management** - Cannot remove at runtime
9. ❌ **Form Shortcuts** - No `postForm()` methods
10. ❌ **Proxy** 🟣 - No Node.js proxy config
11. 🟡 **Error Categories** - Limited error discrimination
12. 🟡 **Range Requests** - No convenience API

---

## Platform-Specific Features

### Browser-Only 🔵

| Feature | @blue/http | Axios | Priority |
|---------|-----------|-------|----------|
| XSRF Protection | ❌ | ✅ | 🔴 HIGH |
| Upload Progress | ❌ | ✅ | 🔴 HIGH |
| Download Progress | ❌ | ✅ | 🔴 HIGH |
| CORS Credentials | ✅ | ✅ | ✅ Supported |

### Node.js-Only 🟣

| Feature | @blue/http | Axios | Priority |
|---------|-----------|-------|----------|
| Proxy Support | ❌ | ✅ | 🟠 MEDIUM |
| HTTP Agent | ❌ | ✅ | 🟠 MEDIUM |
| Socket Path | ❌ | ✅ | 🟢 LOW |
| Max Content Length | ❌ | ✅ | 🟢 LOW |

---

## Implementation Priority Matrix

| Priority | Count | Features |
|----------|-------|----------|
| 🔴 HIGH | 6 | Instance System, Query Params, Transforms, XSRF, Progress (2), Basic Auth |
| 🟠 MEDIUM | 6 | Validate Status, Interceptor Mgmt, Form Shortcuts, Proxy, Error Categories, Range Helper |
| 🟢 LOW | 5 | MediaType w/ Quality, CacheControl Builder, Content-Disposition Parser, HTTP Agent, Max Lengths |

**Total Identified Gaps:** 17 features

---

## Quick Decision Matrix

### Should I Use @blue/http Today?

| Use Case | Recommendation | Reason |
|----------|---------------|--------|
| Simple GET/POST requests | ✅ Yes | Works great, built on Fetch |
| Need config reuse across requests | ❌ Wait | Missing instance system |
| File uploads with progress | ❌ Wait | Missing progress tracking |
| CSRF-protected web app | ❌ Wait | Missing XSRF protection |
| Need query param convenience | 🟡 Maybe | Manual URL construction works |
| Complex request transformations | 🟡 Maybe | Interceptors can do it, but less ergonomic |
| Node.js server-side app | 🟡 Maybe | Missing proxy support |
| Advanced interceptor needs | ✅ Yes | Best-in-class interceptor system |
| RFC-compliant URL parsing | ✅ Yes | Excellent parser infrastructure |

### Should I Wait for Improvements?

**Wait if you need:**
- Instance system with config defaults
- XSRF protection
- Upload/download progress tracking

**Use now if you need:**
- Sophisticated interceptor system
- URL pattern matching
- Query/matrix string parsing
- Built on Fetch API

---

## Migration Paths

### From Axios

| Axios Pattern | @blue/http Current | @blue/http Future |
|---------------|-------------------|-------------------|
| `axios.create({ baseURL })` | ❌ | `HTTP.create({ baseURL })` |
| `params: { key: 'value' }` | Manual URL | `params: { key: 'value' }` |
| `transformRequest: []` | Via interceptors | `transformRequest: []` |
| `auth: { username, password }` | Manual header | `auth: { username, password }` |
| `onUploadProgress` | ❌ | `onUploadProgress` |
| `xsrfCookieName` | ❌ | `xsrfCookieName` |

### From Fetch API

| Fetch Pattern | @blue/http | Improvement |
|---------------|-----------|-------------|
| `fetch(url, options)` | `http.get(url, settings)` | Interceptors + helpers |
| Manual headers | Same | 124 header constants |
| Manual status check | `ResponseStatus` helpers | isSuccess(), isClientError(), etc |
| Manual error on 4xx/5xx | `NotOkInterceptor` | Automatic error throwing |
| Manual timeout | `TimeoutInterceptor` | Built-in timeout support |

---

## Ecosystem Comparison

| Library | Paradigm | Strengths | Best For |
|---------|----------|-----------|----------|
| **@blue/http** | Fetch + Interceptors | Advanced interceptors, URL parsers, status/header constants | Complex request/response pipelines, Spring developers |
| **Spring RestClient** | Builder + Message Converters | Enterprise patterns, type safety, rich abstractions | Java/Spring ecosystem |
| **Axios** | Promise + Config | Simple API, progress tracking, XSRF protection | General web apps, file uploads |
| **Fetch API** | Promise + Options | Web standard, no dependencies, streaming | Native browser/Node.js, minimal overhead |

---

## Recommended Reading Order

1. **Quick Start:** This document (you are here)
2. **Executive Summary:** [2025-02-06_HTTP_FEATURE_SUMMARY.md](./2025-02-06_HTTP_FEATURE_SUMMARY.md)
3. **Full Analysis:** [2025-02-06_HTTP_FEATURE_COMPARISON.md](./2025-02-06_HTTP_FEATURE_COMPARISON.md)
4. **Implementation:** (Future document with detailed API designs)

---

**Last Updated:** 2025-02-06  
**Status:** Research Complete, Implementation Pending
