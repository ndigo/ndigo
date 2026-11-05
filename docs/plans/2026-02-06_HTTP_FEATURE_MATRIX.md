# Quick Reference: HTTP Client Feature Matrix

**Date:** 2026-02-06  
**Purpose:** At-a-glance feature comparison table  
**Full Analysis:** [2026-02-06_HTTP_FEATURE_COMPARISON.md](./2026-02-06_HTTP_FEATURE_COMPARISON.md)

---

## Legend

| Symbol | Meaning                              |
| ------ | ------------------------------------ |
| ✅     | Fully Supported                      |
| 🟡     | Partially Supported / Via Workaround |
| ❌     | Not Supported                        |
| 🔵     | Platform-Specific (Browser-only)     |
| 🟣     | Platform-Specific (Node-only)        |

---

## Core Features Comparison

| Feature                         | @ndigo/http | Spring | Axios | Fetch | Node http | Node https | Priority  |
| ------------------------------- | ----------- | ------ | ----- | ----- | --------- | ---------- | --------- |
| **Instance System**             | ❌          | ✅     | ✅    | ❌    | ❌        | ❌         | 🔴 HIGH   |
| **Config Defaults**             | 🟡          | ✅     | ✅    | ❌    | ✅        | ✅         | 🔴 HIGH   |
| **Base URL**                    | ✅          | ✅     | ✅    | ❌    | ✅        | ✅         | 🔴 HIGH   |
| **Query Params Config**         | 🟡          | ✅     | ✅    | 🟡    | ❌        | ❌         | 🔴 HIGH   |
| **Transform Pipeline**          | 🟡          | ✅     | ✅    | ❌    | ❌        | ❌         | 🔴 HIGH   |
| **Basic Auth Helper**           | 🟡          | ✅     | ✅    | 🟡    | ✅        | ✅         | 🔴 HIGH   |
| **XSRF Protection** 🔵          | ❌          | 🟡     | ✅    | ❌    | ❌        | ❌         | 🔴 HIGH   |
| **Upload Progress** 🔵          | ❌          | ❌     | ✅    | 🟡    | ❌        | ❌         | 🔴 HIGH   |
| **Download Progress** 🔵        | ❌          | ❌     | ✅    | 🟡    | ❌        | ❌         | 🔴 HIGH   |
| **Validate Status**             | 🟡          | ✅     | ✅    | ❌    | ✅        | ✅         | 🟠 MEDIUM |
| **Interceptor Management**      | ❌          | 🟡     | ✅    | ❌    | ❌        | ❌         | 🟠 MEDIUM |
| **Form Shortcuts**              | ❌          | ✅     | ✅    | ❌    | ❌        | ❌         | 🟠 MEDIUM |
| **Proxy Support** 🟣            | ❌          | ✅     | ✅    | ❌    | ✅        | ✅         | 🟠 MEDIUM |
| **Error Categorization**        | 🟡          | ✅     | ✅    | ❌    | ❌        | ❌         | 🟠 MEDIUM |
| **Range Request Helper**        | 🟡          | ✅     | 🟡    | 🟡    | ❌        | ❌         | 🟠 MEDIUM |
| **Connection Pooling**          | ❌          | ✅     | ✅    | ❌    | ✅        | ✅         | 🟠 MEDIUM |
| **Client Certificates**         | ❌          | ✅     | ✅    | ❌    | ❌        | ✅         | 🟠 MEDIUM |
| **Custom DNS**                  | ❌          | ✅     | ❌    | ❌    | ✅        | ✅         | 🟢 LOW    |
| **TLS Session Resumption**      | ❌          | ✅     | ❌    | ❌    | ❌        | ✅         | 🟢 LOW    |
| **Socket Timeout**              | ✅          | ✅     | ✅    | 🟡    | ✅        | ✅         | 🟢 LOW    |
| **Streaming (Node.js Streams)** | ❌          | ✅     | 🟡    | ❌    | ✅        | ✅         | 🟢 LOW    |

---

## @ndigo/http Unique Strengths

| Feature                       | Status | Notes                                                                                             |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| **5-Hook Interceptor System** | ✅     | preInit, preRequest, postResponse, postError, postComplete                                        |
| **URL Pattern Matching**      | ✅     | MappedHTTPInterceptor for conditional interceptors                                                |
| **8 Built-in Interceptors**   | ✅     | ContentType, DataParameter, IfModified, NotOk, ResponseClass, ResponseCode, ResponseType, Timeout |
| **Query/Matrix Parsers**      | ✅     | RFC-compliant parser combinators                                                                  |
| **62 Status Constants**       | ✅     | Comprehensive status code abstractions (100-511)                                                  |
| **124 Header Constants**      | ✅     | Type-safe header name constants                                                                   |
| **ResponseStatus Class**      | ✅     | isInformational(), isSuccess(), isRedirection(), isClientError(), isServerError()                 |

---

## Feature Gap Summary

### 🔴 HIGH Priority Gaps (Must Have)

1. ❌ **Instance System** - No `HTTP.create()` for config reuse
2. ✅ **Base URL** - Now supported for resolving relative URLs.
3. ❌ **Query Params** - No `params: {}` convenience
4. ❌ **Transform Pipeline** - No composable transformations
5. ❌ **XSRF Protection** 🔵 - No automatic CSRF handling
6. ❌ **Progress Tracking** 🔵 - No upload/download progress
7. 🟡 **Basic Auth** - No convenience helper

### 🟠 MEDIUM Priority Gaps (Should Have)

8. 🟡 **Validate Status** - Fixed 4xx/5xx logic
9. ❌ **Interceptor Management** - Cannot remove at runtime
10. ❌ **Form Shortcuts** - No `postForm()` methods
11. ❌ **Proxy** 🟣 - No Node.js proxy config (though Node.js native http/https support this)
12. 🟡 **Error Categories** - Limited error discrimination
13. 🟡 **Range Requests** - No convenience API
14. ❌ **Connection Pooling** 🟣 - No Node.js http.Agent integration
15. ❌ **Client Certificates** 🟣 - No Node.js https client cert support

### 🟢 LOW Priority Gaps (Could Have)

16. ❌ **Custom DNS** 🟣 - No Node.js custom DNS resolution
17. ❌ **TLS Session Resumption** 🟣 - No Node.js TLS session caching
18. ❌ **Streaming (Node.js Streams)** 🟣 - No native Node.js streams integration

**Total Identified Gaps:** 18 features

---

## Quick Decision Matrix

### Should I Use @ndigo/http Today?

| Use Case                          | Recommendation | Reason                                     |
| --------------------------------- | -------------- | ------------------------------------------ |
| Simple GET/POST requests          | ✅ Yes         | Works great, built on Fetch                |
| Need config reuse across requests | ❌ Wait        | Missing instance system                    |
| File uploads with progress        | ❌ Wait        | Missing progress tracking                  |
| CSRF-protected web app            | ❌ Wait        | Missing XSRF protection                    |
| Need query param convenience      | 🟡 Maybe       | Manual URL construction works              |
| Complex request transformations   | 🟡 Maybe       | Interceptors can do it, but less ergonomic |
| Node.js server-side app           | 🟡 Maybe       | Missing proxy support                      |
| Advanced interceptor needs        | ✅ Yes         | Best-in-class interceptor system           |
| RFC-compliant URL parsing         | ✅ Yes         | Excellent parser infrastructure            |

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

| Axios Pattern                  | @ndigo/http Current | @ndigo/http Future             |
| ------------------------------ | ------------------- | ------------------------------ |
| `axios.create({ baseURL })`    | ❌                  | `HTTP.create({ baseURL })`     |
| `params: { key: 'value' }`     | Manual URL          | `params: { key: 'value' }`     |
| `transformRequest: []`         | Via interceptors    | `transformRequest: []`         |
| `auth: { username, password }` | Manual header       | `auth: { username, password }` |
| `onUploadProgress`             | ❌                  | `onUploadProgress`             |
| `xsrfCookieName`               | ❌                  | `xsrfCookieName`               |

### From Fetch API

| Fetch Pattern           | @ndigo/http               | Improvement                       |
| ----------------------- | ------------------------- | --------------------------------- |
| `fetch(url, options)`   | `http.get(url, settings)` | Interceptors + helpers            |
| Manual headers          | Same                      | 124 header constants              |
| Manual status check     | `ResponseStatus` helpers  | isSuccess(), isClientError(), etc |
| Manual error on 4xx/5xx | `NotOkInterceptor`        | Automatic error throwing          |
| Manual timeout          | `TimeoutInterceptor`      | Built-in timeout support          |

---

## Ecosystem Comparison

| Library                | Paradigm                     | Strengths                                                   | Best For                                              |
| ---------------------- | ---------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| **@ndigo/http**        | Fetch + Interceptors         | Advanced interceptors, URL parsers, status/header constants | Complex request/response pipelines, Spring developers |
| **Spring RestClient**  | Builder + Message Converters | Enterprise patterns, type safety, rich abstractions         | Java/Spring ecosystem                                 |
| **Axios**              | Promise + Config             | Simple API, progress tracking, XSRF protection              | General web apps, file uploads                        |
| **Fetch API**          | Promise + Options            | Web standard, no dependencies, streaming                    | Native browser/Node.js, minimal overhead              |
| **Node.js http/https** | Callback/Stream + Low-level  | Fine-grained control over sockets, TLS, proxies, streaming  | Node.js backend services, custom networking           |

---

## Recommended Reading Order

1. **Quick Start:** This document (you are here)
2. **Executive Summary:** [2026-02-06_HTTP_FEATURE_SUMMARY.md](./2026-02-06_HTTP_FEATURE_SUMMARY.md)
3. **Full Analysis:** [2026-02-06_HTTP_FEATURE_COMPARISON.md](./2026-02-06_HTTP_FEATURE_COMPARISON.md)
4. **Implementation:** (Future document with detailed API designs)

---

**Last Updated:** 2026-02-06  
**Status:** Research Complete, `baseURL` Implemented, Further Implementation Pending
