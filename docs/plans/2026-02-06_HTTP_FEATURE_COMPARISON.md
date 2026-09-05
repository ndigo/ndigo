# HTTP Client Feature Comparison

## @blue/http vs Spring Framework vs Axios vs Fetch API vs Node.js http/https

**Date:** 2026-02-06  
**Purpose:** Comprehensive feature survey to identify gaps and prioritize enhancements for @blue/http  
**Context:** Spring MVC Research Plan - HTTP Feature Analysis

---

## Executive Summary

This document compares @blue/http against five major HTTP client implementations:

- **Spring Framework RestClient** - Java enterprise HTTP client (inspiration source)
- **Axios** - Popular JavaScript HTTP client (ecosystem reference)
- **Fetch API** - Web standard (foundation layer)
- **Node.js http/https** - Native Node.js modules (low-level control)

### Key Findings

**@blue/http Strengths:**

- ✅ Built on Fetch API foundation (Request/Response/Headers)
- ✅ Sophisticated 5-hook interceptor system (preInit, preRequest, postResponse, postError, postComplete)
- ✅ 8 built-in interceptors for common use cases
- ✅ URL pattern matching (MappedHTTPInterceptor)
- ✅ Query/Matrix string parsers (RFC compliant)
- ✅ Response status abstractions (62 predefined constants)
- ✅ HTTP header abstractions (124 predefined constants)

**Critical Gaps (High Priority):**

- ❌ No instance system with config defaults
- ✅ **Base URL (Implemented)** - Now supported for resolving relative URLs.
- ❌ No request/response transformation pipeline
- ❌ No progress tracking (upload/download)
- ❌ No XSRF/CSRF protection
- ❌ No HTTP Basic auth helper
- ❌ No `params` config option (query parameters)
- ❌ No custom `validateStatus` function
- ❌ No interceptor management (add/remove at runtime)
- ❌ No form data shortcuts (postForm, putForm)
- ❌ Limited error categorization

**Platform Considerations:**

- @blue/http must work in **both Web browsers AND Node.js**
- Some features are platform-specific (progress tracking, XSRF protection, Node.js networking)

---

## Feature Comparison Matrix

### Legend

- ✅ Fully Supported
- 🟡 Partially Supported / Via Workaround
- ❌ Not Supported
- 🔵 Platform-Specific (Browser-only)
- 🟣 Platform-Specific (Node-only)
- N/A - Not Applicable

---

## 1. Core Architecture

| Feature             | @blue/http                  | Spring RestClient                          | Axios                                         | Fetch API                   | Node http            | Node https           | Priority   | Notes                                       |
| ------------------- | --------------------------- | ------------------------------------------ | --------------------------------------------- | --------------------------- | -------------------- | -------------------- | ---------- | ------------------------------------------- |
| **Foundation**      | Fetch API                   | Java HttpClient / Apache                   | XMLHttpRequest (browser) / http module (Node) | Native                      | Native modules       | Native modules       | N/A        | @blue/http built on Fetch                   |
| **API Style**       | Fluent + Method             | Fluent                                     | Function-based                                | Function-based              | Callback/Stream      | Callback/Stream      | N/A        | Different paradigms                         |
| **Blocking**        | Yes (async/await)           | Yes                                        | Yes (Promise-based)                           | Yes (Promise-based)         | No (Event-driven)    | No (Event-driven)    | N/A        | All use Promises in JS (except Node native) |
| **Thread Safety**   | N/A (single-threaded JS)    | Yes (Java)                                 | N/A                                           | N/A                         | N/A                  | N/A                  | N/A        | Not applicable to JavaScript                |
| **Instance System** | ❌                          | ✅ via `RestClient.builder()`              | ✅ via `axios.create()`                       | ❌                          | ❌                   | ❌                   | **HIGH**   | Critical for config reuse                   |
| **Config Defaults** | 🟡                          | ✅ defaultHeaders, defaultCookies, baseUrl | ✅ Full config merging                        | ❌                          | ✅ via Agent options | ✅ via Agent options | **HIGH**   | Needed with instance system                 |
| **Config Merging**  | 🟡                          | ✅                                         | ✅ Request-level overrides                    | ❌                          | ❌                   | ❌                   | **HIGH**   | Part of instance system                     |
| **Base URL**        | ✅                          | ✅                                         | ✅                                            | ❌                          | ✅ (hostname/path)   | ✅ (hostname/path)   | **HIGH**   | Common requirement                          |
| **URI Templates**   | 🟡 Via string interpolation | ✅ Built-in with variables                 | 🟡 Via string interpolation                   | 🟡 Via string interpolation | ❌                   | ❌                   | **MEDIUM** | Have parsers, need integration              |

**Gap Analysis:**

- **Instance System**: Critical gap. Axios pattern (`axios.create()`) widely adopted. Spring uses builder pattern. Both enable config reuse.
- **Config Defaults**: Essential for DRY principle. Set headers/cookies/baseUrl once, use everywhere. @blue/http `init` supports some defaults, but not comprehensive like `baseURL` was.
- **URI Templates**: @blue/http has powerful parsers but no convenient API for variable substitution.

---

## 2. Request Configuration

| Feature                | @blue/http                      | Spring RestClient           | Axios                              | Fetch API                        | Node http                                    | Node https                                   | Priority   | Notes                               |
| ---------------------- | ------------------------------- | --------------------------- | ---------------------------------- | -------------------------------- | -------------------------------------------- | -------------------------------------------- | ---------- | ----------------------------------- |
| **HTTP Methods**       | ✅ All standard                 | ✅ All standard             | ✅ All standard                    | ✅ All standard                  | ✅ All standard                              | ✅ All standard                              | N/A        | All support GET/POST/PUT/DELETE/etc |
| **URL/URI**            | ✅                              | ✅                          | ✅                                 | ✅                               | ✅                                           | ✅                                           | N/A        | Basic requirement                   |
| **Headers**            | ✅ Via Request/Settings         | ✅ Fluent API               | ✅ `headers` config                | ✅ `headers` option              | ✅ options.headers                           | ✅ options.headers                           | N/A        | All support headers                 |
| **Query Parameters**   | 🟡 Manual construction          | ✅ Via URI builder          | ✅ `params` config                 | 🟡 Manual URL construction       | ❌                                           | ❌                                           | **HIGH**   | Axios `params` very convenient      |
| **Path Variables**     | 🟡 String interpolation         | ✅ URI templates            | 🟡 String interpolation            | 🟡 String interpolation          | ❌                                           | ❌                                           | **MEDIUM** | Have parsers, need API              |
| **Request Body**       | ✅                              | ✅                          | ✅ `data` config                   | ✅ `body` option                 | ✅ `request.write()`                         | ✅ `request.write()`                         | N/A        | All support bodies                  |
| **Timeout**            | ✅ TimeoutInterceptor           | ✅ Via ClientRequestFactory | ✅ `timeout` config                | ✅ `signal` with AbortController | ✅ `options.timeout`, `request.setTimeout()` | ✅ `options.timeout`, `request.setTimeout()` | N/A        | All support timeouts                |
| **Abort/Cancel**       | 🟡 Via AbortController          | ✅ Via signal               | ✅ CancelToken / signal            | ✅ `signal` option               | ✅ `request.abort()`                         | ✅ `request.abort()`                         | N/A        | @blue/http uses Fetch signal        |
| **Request Transform**  | 🟡 Via preRequest interceptor   | ✅ Via interceptors         | ✅ `transformRequest` array        | ❌                               | ❌                                           | ❌                                           | **HIGH**   | Axios pattern widely used           |
| **Response Transform** | 🟡 Via postResponse interceptor | ✅ Via interceptors         | ✅ `transformResponse` array       | ❌                               | ❌                                           | ❌                                           | **HIGH**   | Axios pattern widely used           |
| **Validate Status**    | 🟡 ResponseCodeInterceptor      | ✅ Custom status handlers   | ✅ `validateStatus` function       | ❌                               | ❌                                           | ❌                                           | **MEDIUM** | Useful for custom error logic       |
| **Max Redirects**      | 🟡 Fetch default                | ✅ Via factory              | ✅ `maxRedirects` config (Node)    | ✅ `redirect` option             | ❌                                           | ❌                                           | **LOW**    | Axios (Node) has this               |
| **Proxy**              | ❌                              | ✅ Via factory (Java)       | ✅ `proxy` config (Node)           | ❌                               | ✅ Via Agent options                         | ✅ Via Agent options                         | **MEDIUM** | 🟣 Node-only feature                |
| **HTTP Agent**         | ❌                              | ✅ Via factory              | ✅ `httpAgent`/`httpsAgent` (Node) | ❌                               | ✅ `options.agent`                           | ✅ `options.agent`                           | **MEDIUM** | 🟣 Node-only feature                |
| **Socket Path**        | ❌                              | ❌                          | ✅ `socketPath` (Node)             | ❌                               | ✅ `options.socketPath`                      | ✅ `options.socketPath`                      | **LOW**    | 🟣 Node-only, rare use case         |
| **Response Type**      | 🟡 Via ResponseTypeInterceptor  | ✅ Via message converters   | ✅ `responseType` config           | ✅ `.json()`, `.text()`, etc     | ❌ (streams)                                 | ❌ (streams)                                 | N/A        | Different approaches                |
| **Response Encoding**  | ❌                              | ✅ Via message converters   | ✅ `responseEncoding` (Node)       | ❌                               | ✅ options (stream)                          | ✅ options (stream)                          | **LOW**    | 🟣 Node-only                        |
| **Decompress**         | 🟡 Automatic                    | ✅ Automatic                | ✅ `decompress` config (Node)      | ✅ Automatic                     | ✅ Automatic                                 | ✅ Automatic                                 | N/A        | All handle gzip/deflate             |
| **Max Content Length** | ❌                              | ✅ Via factory              | ✅ `maxContentLength` (Node)       | ❌                               | ✅ `options.maxHeaderSize`                   | ✅ `options.maxHeaderSize`                   | **LOW**    | 🟣 Node-only, safety feature        |
| **Max Body Length**    | ❌                              | ❌                          | ✅ `maxBodyLength` (Node)          | ❌                               | ❌                                           | ❌                                           | **LOW**    | 🟣 Node-only, safety feature        |

**Gap Analysis:**

- **Query Parameters**: Major convenience gap. Axios `params` object is much cleaner than manual URL construction.
- **Transform Pipeline**: Axios `transformRequest`/`transformResponse` arrays enable composable transformations. @blue/http interceptors can do this but not as ergonomic.
- **Node.js Features**: Proxy, custom agents, socket path are well-supported natively in Node.js, presenting an opportunity for @blue/http to integrate these.

---

## 3. Request Body & Content Types

| Feature                  | @blue/http                  | Spring RestClient              | Axios                                       | Fetch API                | Node http        | Node https       | Priority   | Notes                     |
| ------------------------ | --------------------------- | ------------------------------ | ------------------------------------------- | ------------------------ | ---------------- | ---------------- | ---------- | ------------------------- |
| **JSON**                 | ✅                          | ✅                             | ✅ Auto-converts objects                    | ✅ `JSON.stringify()`    | ❌ (manual)      | ❌ (manual)      | N/A        | All support JSON          |
| **Form Data**            | ✅                          | ✅                             | ✅ Auto-detects                             | ✅ `FormData` object     | ❌ (manual)      | ❌ (manual)      | N/A        | All support forms         |
| **URL Encoded**          | ✅                          | ✅                             | ✅ Auto-converts if data is URLSearchParams | ✅ `URLSearchParams`     | ❌ (manual)      | ❌ (manual)      | N/A        | All support               |
| **Multipart**            | ✅                          | ✅                             | ✅ Auto-converts if data contains File      | ✅ `FormData` with files | ❌ (manual)      | ❌ (manual)      | N/A        | All support               |
| **Binary (Blob/Buffer)** | ✅                          | ✅                             | ✅                                          | ✅                       | ✅ `Buffer`      | ✅ `Buffer`      | N/A        | All support               |
| **Text**                 | ✅                          | ✅                             | ✅                                          | ✅                       | ✅ `string`      | ✅ `string`      | N/A        | All support               |
| **Stream**               | 🟡 Via Fetch ReadableStream | ✅ Via message converters      | ✅ `data` as stream (Node)                  | ✅ Native ReadableStream | ✅ Native Stream | ✅ Native Stream | N/A        | All support streaming     |
| **Content-Type Auto**    | 🟡 Via interceptor          | ✅ Via message converters      | ✅ Automatic based on data type             | 🟡 Manual                | ❌               | ❌               | N/A        | Axios best auto-detection |
| **Form Shortcuts**       | ❌                          | ✅ `.postForEntity()` patterns | ✅ `postForm()`, `putForm()`, `patchForm()` | ❌                       | ❌               | ❌               | **MEDIUM** | Convenience methods       |

**Gap Analysis:**

- **Form Shortcuts**: Axios `postForm()` methods are convenient for form submissions.
- **Content-Type Auto-detection**: Axios excels here. @blue/http could enhance its `ContentTypeInterceptor`.

---

## 4. Response Handling

| Feature             | @blue/http                   | Spring RestClient                      | Axios                                | Fetch API                    | Node http                | Node https               | Priority | Notes                              |
| ------------------- | ---------------------------- | -------------------------------------- | ------------------------------------ | ---------------------------- | ------------------------ | ------------------------ | -------- | ---------------------------------- |
| **Response Object** | ✅ Native Response           | ✅ ResponseEntity                      | ✅ Custom response schema            | ✅ Native Response           | ✅ IncomingMessage       | ✅ IncomingMessage       | N/A      | Different structures               |
| **Status Code**     | ✅ response.status           | ✅ response.getStatusCode()            | ✅ response.status                   | ✅ response.status           | ✅ message.statusCode    | ✅ message.statusCode    | N/A      | All expose status                  |
| **Status Text**     | ✅ response.statusText       | ✅ response.getStatusCode().toString() | ✅ response.statusText               | ✅ response.statusText       | ✅ message.statusMessage | ✅ message.statusMessage | N/A      | All expose status text             |
| **Headers**         | ✅ response.headers          | ✅ response.getHeaders()               | ✅ response.headers                  | ✅ response.headers          | ✅ message.headers       | ✅ message.headers       | N/A      | All expose headers                 |
| **Body**            | ✅ Via .json(), .text(), etc | ✅ Via .body()                         | ✅ response.data                     | ✅ Via .json(), .text(), etc | ✅ Via Stream            | ✅ Via Stream            | N/A      | Different access patterns          |
| **Request Config**  | 🟡 Not attached              | ✅ Via ResponseEntity                  | ✅ response.config                   | ❌                           | ❌                       | ❌                       | **LOW**  | Nice for debugging                 |
| **Request Object**  | 🟡 Not attached              | ✅ Via ResponseEntity                  | ✅ response.request                  | ❌                           | ❌                       | ❌                       | **LOW**  | Nice for debugging                 |
| **Status Checks**   | ✅ ResponseStatus helpers    | ✅ HttpStatus enum                     | 🟡 Manual checks                     | ✅ response.ok               | ❌                       | ❌                       | N/A      | @blue/http has 62 status constants |
| **Auto JSON Parse** | 🟡 ResponseTypeInterceptor   | ✅ Message converters                  | ✅ Automatic for 'json' responseType | 🟡 Manual .json()            | ❌                       | ❌                       | N/A      | Different approaches               |

**Gap Analysis:**

- **Response Schema**: Axios response structure (`data`, `status`, `headers`, `config`, `request`) is comprehensive but @blue/http uses native Response which is standard.
- **Node.js**: Node's native HTTP modules require stream-based processing for the body and manual status checks.

---

## 5. Error Handling

| Feature                  | @blue/http                 | Spring RestClient          | Axios                             | Fetch API | Node http         | Node https        | Priority   | Notes                                                       |
| ------------------------ | -------------------------- | -------------------------- | --------------------------------- | --------- | ----------------- | ----------------- | ---------- | ----------------------------------------------------------- |
| **Error on 4xx/5xx**     | ✅ NotOkInterceptor        | ✅ Default behavior        | ✅ Default behavior               | ❌        | ❌ (manual check) | ❌ (manual check) | N/A        | Fetch/Node don't reject on HTTP errors                      |
| **Error Object**         | ✅ ResponseError           | ✅ Custom exceptions       | ✅ AxiosError with rich info      | ❌        | ✅ `Error` events | ✅ `Error` events | N/A        | @blue/http has ResponseError                                |
| **Error Response**       | ✅                         | ✅                         | ✅ error.response                 | ❌        | ❌                | ❌                | N/A        | All include response in error (except Fetch/Node native)    |
| **Error Request**        | ✅                         | ✅                         | ✅ error.request                  | ❌        | ❌                | ❌                | N/A        | All include request in error (except Fetch/Node native)     |
| **Error Config**         | ❌                         | ✅                         | ✅ error.config                   | ❌        | ❌                | ❌                | **LOW**    | Nice for retry logic                                        |
| **Error Code**           | 🟡 Via ResponseError       | ✅ Via exception types     | ✅ error.code (ECONNABORTED, etc) | ❌        | ✅ `error.code`   | ✅ `error.code`   | **MEDIUM** | Axios categorizes errors, Node provides network error codes |
| **Custom Validation**    | 🟡 ResponseCodeInterceptor | ✅ Custom status handlers  | ✅ `validateStatus` function      | ❌        | ❌                | ❌                | **MEDIUM** | Axios most flexible                                         |
| **Retry Logic**          | 🟡 Manual via interceptors | 🟡 Manual via interceptors | 🟡 External library (axios-retry) | ❌        | 🟡 Manual         | 🟡 Manual         | **LOW**    | Usually external concern                                    |
| **Error Categorization** | 🟡 Via ResponseStatus      | ✅ Exception hierarchy     | ✅ isAxiosError, isCancel         | ❌        | 🟡 `error.code`   | 🟡 `error.code`   | **MEDIUM** | Helps error handling                                        |

**Gap Analysis:**

- **Error Categorization**: Axios provides `error.code` for network errors (ECONNABORTED, ETIMEDOUT, etc). Node.js native http/https also provide `error.code`. @blue/http could improve error types to better categorize network vs. HTTP errors.
- **Custom Validation**: `validateStatus` function very useful for treating specific status codes as success/failure.

---

## 6. Interceptors & Middleware

| Feature                    | @blue/http                                                              | Spring RestClient               | Axios                                    | Fetch API                | Node http | Node https | Priority   | Notes                                                        |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------- | ---------------------------------------- | ------------------------ | --------- | ---------- | ---------- | ------------------------------------------------------------ |
| **Request Interceptors**   | ✅ preInit, preRequest                                                  | ✅ ClientHttpRequestInterceptor | ✅ request.use()                         | ❌                       | ❌        | ❌         | N/A        | All support request interception (except Fetch/Node native)  |
| **Response Interceptors**  | ✅ postResponse                                                         | ✅ Via interceptors             | ✅ response.use()                        | ❌                       | ❌        | ❌         | N/A        | All support response interception (except Fetch/Node native) |
| **Error Interceptors**     | ✅ postError                                                            | ✅ Via custom handlers          | ✅ response.use(onFulfilled, onRejected) | ❌                       | ❌        | ❌         | N/A        | All support error handling (except Fetch/Node native)        |
| **Completion Handlers**    | ✅ postComplete                                                         | 🟡 Manual finally blocks        | 🟡 Manual finally blocks                 | 🟡 Manual finally blocks | ❌        | ❌         | N/A        | @blue/http unique feature                                    |
| **Multiple Hooks**         | ✅ 5 hooks (preInit, preRequest, postResponse, postError, postComplete) | ✅ Multiple phases              | ✅ 2 hooks per type                      | ❌                       | ❌        | ❌         | N/A        | @blue/http most granular                                     |
| **Async Interceptors**     | ✅                                                                      | ✅                              | ✅                                       | ❌                       | ❌        | ❌         | N/A        | All support async (except Fetch/Node native)                 |
| **Interceptor Order**      | ✅ Registration order                                                   | ✅ Registration order           | ✅ Registration order                    | ❌                       | ❌        | ❌         | N/A        | All deterministic (except Fetch/Node native)                 |
| **Skip Interceptors**      | 🟡 Via condition                                                        | 🟡 Via condition                | 🟡 Via condition                         | ❌                       | ❌        | ❌         | N/A        | All can conditionally skip (except Fetch/Node native)        |
| **URL Pattern Matching**   | ✅ MappedHTTPInterceptor                                                | 🟡 Manual checks                | 🟡 Manual checks                         | ❌                       | ❌        | ❌         | N/A        | **@blue/http unique feature**                                |
| **Interceptor Management** | ❌ Cannot remove                                                        | 🟡 Static after creation        | ✅ `eject()` removes interceptors        | ❌                       | ❌        | ❌         | **MEDIUM** | Axios allows runtime removal                                 |
| **Built-in Interceptors**  | ✅ 8 interceptors                                                       | 🟡 Via configuration            | 🟡 Community libraries                   | ❌                       | ❌        | ❌         | N/A        | **@blue/http strength**                                      |

**Gap Analysis:**

- **Interceptor Management**: Axios `interceptors.request.use()` returns ID, can be ejected with `eject(id)`. Useful for dynamic behavior.
- **Node.js**: Native Node.js `http/https` modules do not have a built-in interceptor system comparable to client libraries. Behavior must be implemented manually using event listeners or by wrapping the request/response objects.

---

## 7. Authentication

| Feature          | @blue/http             | Spring RestClient                 | Axios                   | Fetch API        | Node http        | Node https       | Priority   | Notes                     |
| ---------------- | ---------------------- | --------------------------------- | ----------------------- | ---------------- | ---------------- | ---------------- | ---------- | ------------------------- |
| **Basic Auth**   | 🟡 Manual header       | ✅ `.setBasicAuth()` convenience  | ✅ `auth` config object | 🟡 Manual header | 🟡 Manual header | 🟡 Manual header | **HIGH**   | Spring/Axios have helpers |
| **Bearer Token** | 🟡 Manual header       | ✅ `.setBearerAuth()` convenience | 🟡 Manual header        | 🟡 Manual header | 🟡 Manual header | 🟡 Manual header | **MEDIUM** | Spring has helper         |
| **OAuth 2.0**    | 🟡 Via interceptors    | ✅ Spring Security integration    | 🟡 Via interceptors     | 🟡 Manual        | 🟡 Manual        | 🟡 Manual        | **LOW**    | Usually external library  |
| **API Key**      | 🟡 Manual header/query | 🟡 Manual header/query            | 🟡 Manual header/query  | 🟡 Manual        | 🟡 Manual        | 🟡 Manual        | **LOW**    | Application-specific      |
| **Custom Auth**  | ✅ Via interceptors    | ✅ Via interceptors               | ✅ Via interceptors     | 🟡 Manual        | 🟡 Manual        | 🟡 Manual        | N/A        | All support custom auth   |

**Gap Analysis:**

- **Basic Auth Helper**: Both Spring and Axios provide convenient helpers. @blue/http should add helper method.
- **Bearer Token Helper**: Spring provides convenience method.
- **Node.js**: Authentication must be handled manually by setting headers or implementing custom logic around requests.

---

## 8. Cookies

| Feature             | @blue/http               | Spring RestClient             | Axios                                 | Fetch API                | Node http   | Node https  | Priority   | Notes                                           |
| ------------------- | ------------------------ | ----------------------------- | ------------------------------------- | ------------------------ | ----------- | ----------- | ---------- | ----------------------------------------------- |
| **Send Cookies**    | ✅ Via credentials       | ✅ Default behavior           | ✅ `withCredentials` (CORS)           | ✅ `credentials` option  | ❌ (manual) | ❌ (manual) | N/A        | All support cookies (except Node native)        |
| **Set Cookies**     | ✅ Via Set-Cookie header | ✅ Via ResponseCookie builder | ✅ Via Set-Cookie header              | ✅ Via Set-Cookie header | ❌ (manual) | ❌ (manual) | N/A        | All support setting (except Node native)        |
| **Default Cookies** | 🟡 Manual header         | ✅ `.defaultCookie()`         | 🟡 Manual header                      | 🟡 Manual                | ❌          | ❌          | **MEDIUM** | Spring has convenience                          |
| **Cookie Jar**      | 🟡 Browser automatic     | ✅ Via configuration          | ✅ `jar` option (Node)                | 🟡 Browser automatic     | ❌          | ❌          | **LOW**    | 🟣 Node-only feature (Axios)                    |
| **XSRF Protection** | ❌                       | 🟡 Manual                     | ✅ `xsrfCookieName`, `xsrfHeaderName` | ❌                       | ❌          | ❌          | **HIGH**   | 🔵 **Axios provides automatic XSRF protection** |

**Gap Analysis:**

- **XSRF Protection**: Critical browser security feature. Axios automatically reads XSRF token from cookie and sends as header. @blue/http should implement.
- **Node.js**: Native Node.js http/https modules do not manage cookies automatically. It's a manual process of parsing/setting headers.

---

## 9. Progress Tracking

| Feature               | @blue/http | Spring RestClient | Axios                            | Fetch API             | Node http | Node https | Priority | Notes                           |
| --------------------- | ---------- | ----------------- | -------------------------------- | --------------------- | --------- | ---------- | -------- | ------------------------------- |
| **Upload Progress**   | ❌         | ❌                | ✅ `onUploadProgress` callback   | 🟡 Via ReadableStream | ❌        | ❌         | **HIGH** | 🔵 **Critical browser feature** |
| **Download Progress** | ❌         | ❌                | ✅ `onDownloadProgress` callback | 🟡 Via ReadableStream | ❌        | ❌         | **HIGH** | 🔵 **Critical browser feature** |
| **Bandwidth Limit**   | ❌         | 🟡 Via factory    | ✅ `maxRate` config (Node)       | ❌                    | ❌        | ❌         | **LOW**  | 🟣 Node-only, rare use case     |

**Gap Analysis:**

- **Progress Callbacks**: Major gap for browser use cases. File uploads/downloads need progress tracking. Axios provides simple callbacks. Fetch requires manual ReadableStream handling.
- **Node.js**: Native Node.js streams allow for progress tracking by listening to `'data'` events, but there are no high-level callbacks like Axios.

---

## 10. Caching

| Feature                  | @blue/http                | Spring RestClient       | Axios             | Fetch API                                                                            | Node http | Node https | Priority   | Notes                                    |
| ------------------------ | ------------------------- | ----------------------- | ----------------- | ------------------------------------------------------------------------------------ | --------- | ---------- | ---------- | ---------------------------------------- |
| **Cache Control**        | 🟡 Manual headers         | ✅ CacheControl builder | 🟡 Manual headers | ✅ `cache` option                                                                    | ❌        | ❌         | **MEDIUM** | Spring has builder, Fetch has options    |
| **Conditional Requests** | ✅ IfModifiedInterceptor  | ✅ Built-in support     | 🟡 Manual headers | 🟡 Manual headers                                                                    | ❌        | ❌         | N/A        | **@blue/http has IfModifiedInterceptor** |
| **ETag Support**         | ✅ Via headers            | ✅ Built-in support     | ✅ Via headers    | ✅ Via headers                                                                       | ❌        | ❌         | N/A        | All support ETags                        |
| **If-Modified-Since**    | ✅ IfModifiedInterceptor  | ✅ Built-in support     | 🟡 Manual headers | 🟡 Manual headers                                                                    | ❌        | ❌         | N/A        | **@blue/http has interceptor**           |
| **Cache Modes**          | 🟡 Via Fetch cache option | 🟡 Via factory          | ❌                | ✅ `cache` option (default, no-store, reload, no-cache, force-cache, only-if-cached) | ❌        | ❌         | **LOW**    | Fetch provides modes                     |

**Gap Analysis:**

- **Cache Control Builder**: Spring provides fluent CacheControl builder. Could be convenience addition.
- **@blue/http Strength**: IfModifiedInterceptor is sophisticated - handles ETags and Last-Modified automatically.
- **Node.js**: Native http/https modules do not offer high-level caching abstractions; this is typically handled by proxy servers or application-level logic.

---

## 11. Content Negotiation

| Feature                    | @blue/http                | Spring RestClient               | Axios                     | Fetch API | Node http | Node https | Priority | Notes                                    |
| -------------------------- | ------------------------- | ------------------------------- | ------------------------- | --------- | --------- | ---------- | -------- | ---------------------------------------- |
| **Accept Header**          | 🟡 Manual                 | ✅ `.accept()` convenience      | 🟡 Manual                 | 🟡 Manual | ❌        | ❌         | **LOW**  | Spring has convenience                   |
| **Content-Type**           | ✅ ContentTypeInterceptor | ✅ `.contentType()` convenience | ✅ Auto-set based on data | ✅ Manual | ❌        | ❌         | N/A      | All support                              |
| **MediaType with Quality** | 🟡 Manual                 | ✅ MediaType with `q` parameter | 🟡 Manual                 | 🟡 Manual | ❌        | ❌         | **LOW**  | Spring has sophisticated MediaType class |
| **Accept-Language**        | 🟡 Manual                 | ✅ Built-in support             | 🟡 Manual                 | 🟡 Manual | ❌        | ❌         | **LOW**  | Spring has support                       |
| **Accept-Charset**         | 🟡 Manual                 | ✅ Built-in support             | 🟡 Manual                 | 🟡 Manual | ❌        | ❌         | **LOW**  | Spring has support                       |
| **Message Converters**     | 🟡 Via interceptors       | ✅ Rich infrastructure          | 🟡 Via transforms         | ❌        | ❌        | ❌         | **LOW**  | Spring strength                          |

**Gap Analysis:**

- **MediaType Class**: Spring's MediaType with quality parameters is sophisticated for enterprise scenarios. Overkill for typical JS use cases.
- **Node.js**: Native http/https modules require manual header setting for content negotiation.

---

## 12. Range Requests

| Feature                 | @blue/http        | Spring RestClient            | Axios     | Fetch API | Node http | Node https | Priority   | Notes                          |
| ----------------------- | ----------------- | ---------------------------- | --------- | --------- | --------- | ---------- | ---------- | ------------------------------ |
| **Range Header**        | 🟡 Manual         | ✅ `.setRange()` convenience | 🟡 Manual | 🟡 Manual | ❌        | ❌         | **MEDIUM** | Spring has convenience         |
| **HttpRange Class**     | ❌                | ✅ HttpRange abstraction     | ❌        | ❌        | ❌        | ❌         | **MEDIUM** | Useful for byte range requests |
| **Accept-Ranges**       | 🟡 Manual         | ✅ Built-in support          | 🟡 Manual | 🟡 Manual | ❌        | ❌         | **LOW**    | Spring has support             |
| **Content-Range**       | 🟡 Manual parsing | ✅ Built-in parsing          | 🟡 Manual | 🟡 Manual | ❌        | ❌         | **LOW**    | Spring has support             |
| **206 Partial Content** | ✅                | ✅                           | ✅        | ✅        | ✅        | ✅         | N/A        | All support status             |

**Gap Analysis:**

- **Range Request Helper**: Spring's HttpRange class provides convenient byte range specification. Could be useful for streaming scenarios.
- **Node.js**: Native http/https modules require manual header setting and parsing for range requests.

---

## 13. HTTP/2 & Modern Features

| Feature         | @blue/http                  | Spring RestClient         | Axios               | Fetch API                | Node http        | Node https       | Priority | Notes                   |
| --------------- | --------------------------- | ------------------------- | ------------------- | ------------------------ | ---------------- | ---------------- | -------- | ----------------------- |
| **HTTP/2**      | ✅ Via Fetch                | ✅ Via factory            | ✅ Via Node http2   | ✅ Automatic             | ✅ Via `http2`   | ✅ Via `http2`   | N/A      | All support HTTP/2      |
| **Server Push** | 🟡 Fetch support            | ✅ Via factory            | 🟡 Node support     | 🟡 Some browsers         | ✅ Via `http2`   | ✅ Via `http2`   | **LOW**  | Limited use cases       |
| **Streaming**   | ✅ Via Fetch ReadableStream | ✅ Via message converters | ✅ Via Node streams | ✅ Native ReadableStream | ✅ Native Stream | ✅ Native Stream | N/A      | All support streaming   |
| **Compression** | ✅ Automatic                | ✅ Automatic              | ✅ Automatic        | ✅ Automatic             | ✅ Automatic     | ✅ Automatic     | N/A      | All handle gzip/deflate |

**Gap Analysis:**

- No significant gaps. All clients support modern HTTP/2 features.

---

## 14. Testing & Debugging

| Feature                         | @blue/http           | Spring RestClient      | Axios                 | Fetch API      | Node http     | Node https    | Priority | Notes                        |
| ------------------------------- | -------------------- | ---------------------- | --------------------- | -------------- | ------------- | ------------- | -------- | ---------------------------- |
| **Mock Support**                | 🟡 Via Fetch mocking | ✅ MockMvc integration | 🟡 axios-mock-adapter | 🟡 fetch-mock  | 🟡 (nock)     | 🟡 (nock)     | **LOW**  | External testing tools       |
| **Logging**                     | 🟡 Via interceptors  | 🟡 Via interceptors    | 🟡 Via interceptors   | 🟡 Manual      | 🟡 Manual     | 🟡 Manual     | **LOW**  | All support custom logging   |
| **Request/Response Inspection** | ✅ Via interceptors  | ✅ Via interceptors    | ✅ Via interceptors   | 🟡 Manual      | ✅ Via events | ✅ Via events | N/A      | All support                  |
| **Debug Info**                  | 🟡 Via logging       | 🟡 Via logging         | 🟡 Via logging        | 🟡 Via logging | 🟡 Manual     | 🟡 Manual     | **LOW**  | All support custom debugging |

**Gap Analysis:**

- No significant gaps. All clients support testing and debugging through interceptors/mocking (or events for Node.js native).

---

## 15. Platform-Specific Features

### Browser-Only Features

| Feature               | @blue/http   | Spring | Axios        | Fetch        | Node http | Node https | Priority | Notes                                |
| --------------------- | ------------ | ------ | ------------ | ------------ | --------- | ---------- | -------- | ------------------------------------ |
| **XSRF Protection**   | ❌           | N/A    | ✅           | ❌           | N/A       | N/A        | **HIGH** | 🔵 **Critical for browser security** |
| **Upload Progress**   | ❌           | N/A    | ✅           | 🟡           | N/A       | N/A        | **HIGH** | 🔵 **File upload UX requirement**    |
| **Download Progress** | ❌           | N/A    | ✅           | 🟡           | N/A       | N/A        | **HIGH** | 🔵 **File download UX requirement**  |
| **CORS Credentials**  | ✅           | N/A    | ✅           | ✅           | N/A       | N/A        | N/A      | All support `withCredentials`        |
| **Preflight Cache**   | ✅ Automatic | N/A    | ✅ Automatic | ✅ Automatic | N/A       | N/A        | N/A      | Browser handles                      |

### Node.js-Only Features

| Feature                         | @blue/http | Spring | Axios | Fetch | Node http | Node https | Priority   | Notes                                          |
| ------------------------------- | ---------- | ------ | ----- | ----- | --------- | ---------- | ---------- | ---------------------------------------------- |
| **Proxy**                       | ❌         | ✅     | ✅    | ❌    | ✅        | ✅         | **MEDIUM** | 🟣 **Common Node requirement**                 |
| **HTTP Agent**                  | ❌         | ✅     | ✅    | ❌    | ✅        | ✅         | **MEDIUM** | 🟣 **Connection pooling**                      |
| **HTTPS Agent**                 | ❌         | ✅     | ✅    | ❌    | N/A       | ✅         | **MEDIUM** | 🟣 **Custom certs**                            |
| **Socket Path**                 | ❌         | ❌     | ✅    | ❌    | ✅        | ✅         | **LOW**    | 🟣 Unix socket communication                   |
| **Max Redirects**               | 🟡         | ✅     | ✅    | 🟡    | ✅        | ✅         | **LOW**    | 🟣 Safety feature                              |
| **Max Content/Body Length**     | ❌         | ✅     | ✅    | ❌    | ✅        | ✅         | **LOW**    | 🟣 Safety feature                              |
| **Response Encoding**           | ❌         | ✅     | ✅    | ❌    | ✅        | ✅         | **LOW**    | 🟣 Charset handling                            |
| **Bandwidth Limit**             | ❌         | ❌     | ✅    | ❌    | ❌        | ❌         | **LOW**    | 🟣 Rate limiting (Axios)                       |
| **Connection Pooling**          | ❌         | ✅     | ✅    | ❌    | ✅        | ✅         | **MEDIUM** | 🟣 Via `http.Agent`/`https.Agent`              |
| **Client Certificates**         | ❌         | ✅     | ✅    | ❌    | ❌        | ✅         | **MEDIUM** | 🟣 Via `https.Agent` options                   |
| **Custom DNS**                  | ❌         | ✅     | ❌    | ❌    | ✅        | ✅         | **LOW**    | 🟣 Via `dns.lookup` / `agent.createConnection` |
| **TLS Session Resumption**      | ❌         | ✅     | ❌    | ❌    | ❌        | ✅         | **LOW**    | 🟣 Via `https.Agent` options                   |
| **Streaming (Node.js Streams)** | ❌         | ✅     | 🟡    | ❌    | ✅        | ✅         | **LOW**    | 🟣 Native Node.js streams                      |

**Gap Analysis:**

- **Browser Features**: XSRF protection and progress tracking are critical gaps.
- **Node Features**: Proxy, custom agents, TLS/SSL configuration, streaming are important for server-side Node.js applications. @blue/http needs to add explicit support or provide integration points for these native Node.js capabilities.

---

## 16. Unique Features by Library

### @blue/http Unique Strengths

1. ✅ **5-Hook Interceptor System** - Most granular lifecycle control (preInit, preRequest, postResponse, postError, postComplete)
2. ✅ **URL Pattern Matching** - MappedHTTPInterceptor conditionally applies interceptors based on URL patterns
3. ✅ **Query/Matrix String Parsers** - RFC-compliant parser combinators for URL parsing
4. ✅ **8 Built-in Interceptors** - ContentType, DataParameter, IfModified, NotOk, ResponseClass, ResponseCode, ResponseType, Timeout
5. ✅ **62 Response Status Constants** - Comprehensive status code abstractions (100-511)
6. ✅ **124 HTTP Header Constants** - Type-safe header name constants
7. ✅ **ResponseStatus Class** - Sophisticated status checking with `isInformational()`, `isSuccess()`, `isRedirection()`, `isClientError()`, `isServerError()`
8. ✅ **Base URL Configuration** - Now supported for resolving relative URLs.

### Spring RestClient Unique Strengths

1. ✅ **HttpEntity/RequestEntity/ResponseEntity** - Rich wrapper objects with headers + body
2. ✅ **HttpHeaders Multi-Value Management** - Case-insensitive, multi-value header operations
3. ✅ **MediaType with Quality Parameters** - `application/json;q=0.9` support
4. ✅ **CacheControl Builder** - Fluent API for cache directives
5. ✅ **ContentDisposition Builder** - Parse and build Content-Disposition headers
6. ✅ **HttpRange Class** - Byte range request abstraction
7. ✅ **Message Converter Infrastructure** - Pluggable serialization/deserialization
8. ✅ **HTTP Service Clients** - Generate type-safe clients from annotated interfaces (unique paradigm)

### Axios Unique Strengths

1. ✅ **Instance System** - `axios.create()` with config defaults and merging
2. ✅ **Transform Arrays** - `transformRequest`/`transformResponse` composable transformation pipeline
3. ✅ **XSRF Protection** - Automatic XSRF token handling
4. ✅ **Progress Events** - `onUploadProgress`/`onDownloadProgress` callbacks
5. ✅ **Form Shortcuts** - `postForm()`, `putForm()`, `patchForm()` convenience methods
6. ✅ **Params Config** - Clean query parameter object (`params: {key: 'value'}`)
7. ✅ **Error Categorization** - `error.code` for network errors (ECONNABORTED, ETIMEDOUT, etc)
8. ✅ **Interceptor Management** - `eject()` removes interceptors at runtime
9. ✅ **isAxiosError()** - Type guard for error handling

### Fetch API Unique Strengths

1. ✅ **Web Standard** - Built into browsers and Node.js, no dependencies
2. ✅ **Native Streaming** - ReadableStream for request/response bodies
3. ✅ **Cache Modes** - Fine-grained cache control (default, no-store, reload, etc)
4. ✅ **CORS Modes** - Explicit CORS mode control (cors, no-cors, same-origin)
5. ✅ **Redirect Modes** - Control redirect behavior (follow, error, manual)
6. ✅ **Subresource Integrity** - Built-in SRI support
7. ✅ **Request.clone()** - Clone requests for retry scenarios
8. ✅ **Response.clone()** - Clone responses for caching

### Node.js http/https Unique Strengths

1. ✅ **Socket-Level Control** - Direct access and configuration of underlying TCP sockets (e.g., `setNoDelay`, `setKeepAlive`)
2. ✅ **Fine-grained Timeout Control** - Multiple timeout types (socket, headers, request) for precise control
3. ✅ **Connection Pooling via Agents** - Efficient management and reuse of connections using `http.Agent` and `https.Agent`
4. ✅ **Advanced TLS Configuration** - Comprehensive options for client certificates, CA bundles, SNI, ciphers, and TLS session resumption
5. ✅ **Native Streaming** - Full support for Node.js Streams API for efficient handling of large request/response bodies with backpressure
6. ✅ **Proxy Integration** - Built-in proxy support via environment variables and configurable agents
7. ✅ **Custom DNS Resolution** - Ability to provide custom DNS lookup functions for requests
8. ✅ **Network Interface Binding** - Bind requests to specific local IP addresses and ports (`localAddress`, `localPort`)
9. ✅ **HTTP/2 Support** - Native support via the `http2` module for high-performance applications.

---

## Summary of Critical Gaps

### High Priority (Must Have)

1. **Instance System with Config Defaults**

    - Pattern: `HTTP.create({ baseURL, headers, ... })`
    - Enables config reuse, DRY principle
    - Spring/Axios both provide this

2. **Query Params Config**

    - Pattern: `params: { key: 'value' }`
    - Much cleaner than manual URL construction
    - Axios provides excellent API

3. **Request/Response Transform Pipeline**

    - Pattern: `transformRequest: [(data) => transformed]`
    - Composable transformations
    - Axios pattern widely adopted

4. **XSRF Protection** (Browser-only)

    - Automatic XSRF token cookie → header
    - Critical security feature for web apps
    - Axios provides out-of-box

5. **Progress Tracking** (Browser-only)

    - Upload/download progress callbacks
    - Essential for file upload UX
    - Axios provides simple callbacks

6. **HTTP Basic Auth Helper**

    - Convenience method for common auth pattern
    - Spring: `.setBasicAuth(user, pass)`
    - Axios: `auth: { username, password }`

7. **Node.js Connection Pooling** (Node-only)

    - Integration with `http.Agent`/`https.Agent`
    - Essential for high-performance server-side applications.

8. **Node.js Client Certificates** (Node-only)
    - Support for `cert`, `key`, `ca` options in `https.Agent`
    - Critical for secure enterprise communication.

### Medium Priority (Should Have)

9. **Validate Status Customization**

    - Pattern: `validateStatus: (status) => status < 500`
    - More flexible than fixed "4xx/5xx = error" logic
    - Axios provides as config option

10. **Interceptor Management**

    - Add/remove interceptors at runtime
    - Pattern: `const id = http.interceptors.request.use(...); http.interceptors.request.eject(id)`
    - Useful for dynamic behavior

11. **Form Submit Shortcuts**

    - Pattern: `http.postForm(url, formData)`
    - Convenience for common operation
    - Axios: `postForm()`, `putForm()`, `patchForm()`

12. **Node.js Proxy Support** (Node-only)

    - Pattern: `proxy: { host, port, auth }`
    - Common requirement for server-side apps
    - Axios/Spring both support

13. **Error Categorization**

    - Distinguish network errors from HTTP errors
    - Pattern: `error.code` (ECONNABORTED, ETIMEDOUT, etc)
    - Axios provides comprehensive error codes, Node.js native also provides error codes.

14. **Range Request Helper**
    - Convenience for byte range requests
    - Spring provides HttpRange class
    - Useful for streaming/resumable downloads

### Low Priority (Nice to Have)

15. **MediaType with Quality Parameters**

    - Spring's sophisticated MediaType class
    - Overkill for most JS use cases
    - Could be simple utility functions

16. **CacheControl Builder**

    - Fluent API for cache directives
    - Spring provides rich builder
    - Manual headers sufficient for most cases

17. **Content-Disposition Parser**

    - Parse Content-Disposition headers
    - Spring provides parser/builder
    - Niche use case

18. **Node.js Custom DNS Resolution** (Node-only)

    - Ability to provide custom DNS lookup functions
    - Useful for specialized network configurations.

19. **Node.js TLS Session Resumption** (Node-only)

    - Enhance HTTPS performance by reusing TLS sessions.

20. **Node.js Native Streaming Integration** (Node-only)

    - Full integration with Node.js Streams API for advanced streaming use cases.

21. **Node.js Max Content/Body Length** (Node-only)
    - Safety limits for request/response size
    - Good practice for production.

**Total Identified Gaps:** 21 features

---

## Implementation Recommendations

### Phase 1: Critical Features (High Priority)

1. **Base URL Configuration** (Implemented)

    - Now supported via `init` parameter in `HTTP` constructor.

2. **Instance System with Config Defaults**

```typescript
// API Design Proposal
interface HTTPConfig {
    baseURL?: string;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
    timeout?: number;
    withCredentials?: boolean;
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    validateStatus?: (status: number) => boolean;
    transformRequest?: Array<(data: any, headers: Headers) => any>;
    transformResponse?: Array<(data: any, headers: Headers) => any>;
}

class HTTP {
    static create(config: HTTPConfig): HTTP {
        return new HTTP(config);
    }

    constructor(private readonly config: HTTPConfig) {}

    // Merge with request-level config
    request(url: string, requestConfig?: HTTPConfig): Promise<Response> {
        const mergedConfig = { ...this.config, ...requestConfig };
        // ... implementation
    }
}

// Usage
const api = HTTP.create({
    baseURL: 'https://api.example.com',
    headers: {
        Authorization: 'Bearer token123',
    },
    timeout: 5000,
});

// All requests use merged config
api.get('/users'); // → https://api.example.com/users with auth header
```

**Benefits:**

- DRY principle - configure once, use everywhere
- Aligns with Axios mental model (widely adopted)
- Enables per-API-client configuration
- Foundation for other features (XSRF, transforms, etc)

**Implementation Complexity:** Medium

- Need config merging logic
- Need to integrate with existing interceptor system
- Backward compatibility with current API

---

**3. Query Params Config**

```typescript
// API Design Proposal
interface RequestOptions {
    params?: Record<string, string | number | boolean | Array<string | number>>;
    paramsSerializer?: (params: Record<string, any>) => string;
}

// Usage
http.get('/search', {
    params: {
        q: 'typescript',
        page: 1,
        tags: ['web', 'framework'], // Array support
    },
});
// → GET /search?q=typescript&page=1&tags=web&tags=framework

// Custom serialization
http.get('/search', {
    params: { filter: { status: 'active' } },
    paramsSerializer: (params) => qs.stringify(params), // Use qs library
});
```

**Benefits:**

- Much cleaner than manual URL construction
- Automatic URL encoding
- Array parameter support
- Custom serialization for complex params
- Aligns with Axios API

**Implementation Complexity:** Low

- Leverage existing query string parsers in @blue/parser
- Add convenience API wrapper
- Integrate with URL builder

---

**4. Request/Response Transform Pipeline**

```typescript
// API Design Proposal
interface HTTPConfig {
    transformRequest?: Array<(data: any, headers: Headers) => any>;
    transformResponse?: Array<(data: any, headers: Headers) => any>;
}

// Usage
const api = HTTP.create({
    transformRequest: [
        // Transform 1: Convert dates to ISO strings
        (data, headers) => {
            if (data instanceof Date) return data.toISOString();
            return data;
        },
        // Transform 2: Add timestamp
        (data, headers) => {
            return { ...data, timestamp: Date.now() };
        },
    ],
    transformResponse: [
        // Transform 1: Parse JSON
        (data, headers) => {
            if (headers.get('content-type')?.includes('application/json')) {
                return JSON.parse(data);
            }
            return data;
        },
        // Transform 2: Convert ISO strings to Dates
        (data, headers) => {
            // ... date conversion logic
            return data;
        },
    ],
});
```

**Benefits:**

- Composable transformations (separation of concerns)
- Reusable transform functions
- Clean pipeline architecture
- Aligns with Axios API
- Can replace some existing interceptors

**Implementation Complexity:** Medium

- Integrate with existing interceptor system
- Determine order of execution (transforms before/after interceptors?)
- Array execution logic

**Integration with Interceptors:**

- `transformRequest` → Run in preInit/preRequest phase
- `transformResponse` → Run in postResponse phase
- Keep interceptors for cross-cutting concerns (logging, auth)
- Transforms for data serialization/deserialization

---

**5. XSRF Protection (Browser-only)**

```typescript
// API Design Proposal
interface HTTPConfig {
    xsrfCookieName?: string; // Default: 'XSRF-TOKEN'
    xsrfHeaderName?: string; // Default: 'X-XSRF-TOKEN'
}

// Implementation as built-in interceptor
class XSRFInterceptor implements HTTPInterceptor {
    constructor(
        private cookieName: string = 'XSRF-TOKEN',
        private headerName: string = 'X-XSRF-TOKEN'
    ) {}

    async preRequest(request: Request, http: HTTP): Promise<Request> {
        // Only for same-origin requests
        if (this.isSameOrigin(request.url)) {
            const token = this.getCookie(this.cookieName);
            if (token) {
                request.headers.set(this.headerName, token);
            }
        }
        return request;
    }

    private getCookie(name: string): string | null {
        // Parse document.cookie
        const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
        return match ? decodeURIComponent(match[3]) : null;
    }

    private isSameOrigin(url: string): boolean {
        const urlObj = new URL(url, window.location.href);
        return urlObj.origin === window.location.origin;
    }
}

// Usage
const api = HTTP.create({
    xsrfCookieName: 'CSRF-TOKEN', // Customize if needed
    xsrfHeaderName: 'X-CSRF-TOKEN',
});
```

**Benefits:**

- Critical security feature for browser apps
- Automatic - no manual cookie handling
- Configurable cookie/header names
- Same-origin check prevents leaking tokens
- Aligns with Axios behavior

**Implementation Complexity:** Low

- Implement as HTTPInterceptor
- Browser-only (check `typeof document !== 'undefined'`)
- Cookie parsing straightforward
- Automatic registration when config present

**Security Considerations:**

- Only send token to same-origin requests
- Never send over non-HTTPS in production
- Respect secure/httpOnly cookie flags

---

**6. Progress Tracking (Browser-only)**

```typescript
// API Design Proposal
interface RequestOptions {
    onUploadProgress?: (event: ProgressEvent) => void;
    onDownloadProgress?: (event: ProgressEvent) => void;
}

// Usage
http.post('/upload', formData, {
    onUploadProgress: (event) => {
        const percent = (event.loaded / event.total) * 100;
        console.log(`Upload progress: ${percent}%`);
    },
});

http.get('/download', {
    onDownloadProgress: (event) => {
        const percent = (event.loaded / event.total) * 100;
        console.log(`Download progress: ${percent}%`);
    },
});
```

**Implementation:**

```typescript
// For upload progress, use XMLHttpRequest wrapper
class ProgressUploadRequest {
    async send(url: string, body: BodyInit, onProgress?: (event: ProgressEvent) => void): Promise<Response> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (onProgress) onProgress(e);
            });

            xhr.addEventListener('load', () => {
                resolve(
                    new Response(xhr.response, {
                        status: xhr.status,
                        statusText: xhr.statusText,
                    })
                );
            });

            xhr.addEventListener('error', () => reject(new Error('Network error')));

            xhr.open('POST', url);
            xhr.send(body);
        });
    }
}

// For download progress, use ReadableStream
async function trackDownloadProgress(
    response: Response,
    onProgress: (event: ProgressEvent) => void
): Promise<Response> {
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const stream = new ReadableStream({
        async start(controller) {
            const reader = response.body!.getReader();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                loaded += value.byteLength;
                onProgress(new ProgressEvent('progress', { loaded, total }));
                controller.enqueue(value);
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
    });
}
```

**Benefits:**

- Essential for file upload UX (show progress bar)
- Essential for large file download UX
- Aligns with Axios API (simple callbacks)
- Browser-only feature

**Implementation Complexity:** High

- Upload: Need XMLHttpRequest wrapper (Fetch doesn't support upload progress)
- Download: Need ReadableStream wrapper
- Need to detect when to use XHR vs Fetch
- Need to convert XHR response back to Fetch Response

**Trade-offs:**

- XHR for upload progress means losing some Fetch benefits
- Increased complexity for progress tracking
- Browser-only (Node.js would need different implementation)

---

**7. HTTP Basic Auth Helper**

```typescript
// API Design Proposal
interface RequestOptions {
    auth?: {
        username: string;
        password: string;
    };
}

// Helper method
class HTTP {
    setBasicAuth(username: string, password: string): this {
        const credentials = btoa(`${username}:${password}`);
        this.config.headers['Authorization'] = `Basic ${credentials}`;
        return this;
    }
}

// Usage - Axios style
http.get('/protected', {
    auth: {
        username: 'user',
        password: 'pass',
    },
});

// Usage - Spring style
http.setBasicAuth('user', 'pass').get('/protected');

// Usage - Manual (existing)
http.get('/protected', {
    headers: {
        Authorization: 'Basic ' + btoa('user:pass'),
    },
});
```

**Benefits:**

- Convenience for common auth pattern
- No need to manually base64 encode
- Aligns with both Axios and Spring patterns
- Simple to implement

**Implementation Complexity:** Low

- Simple helper function
- Base64 encoding via `btoa()` (browser) or `Buffer.toString('base64')` (Node)
- Add to config options

---

**8. Node.js Connection Pooling** (Node-only)

```typescript
// API Design Proposal (Node-only)
interface HTTPConfig {
    agent?: http.Agent | https.Agent | boolean; // false to disable pooling
}

// Usage
import * as http from 'node:http';
import * as https from 'node:https';

const agent = new http.Agent({ keepAlive: true });
const api = HTTP.create({
    baseURL: 'http://localhost',
    agent: agent,
});

// Automatically uses the agent for connection pooling
await api.get('/data');
```

**Benefits:**

- Essential for high-performance server-side Node.js applications
- Manages persistent connections efficiently
- Configurable pooling parameters (max sockets, keep-alive timeout)

**Implementation Complexity:** Medium

- Node.js-only (`typeof process !== 'undefined'`)
- Integrate with Node.js `http.Agent`/`https.Agent`
- May require custom `fetch` implementation that uses these agents.

---

**9. Node.js Client Certificates** (Node-only)

```typescript
// API Design Proposal (Node-only)
interface HTTPConfig {
    httpsAgentOptions?: {
        key?: string | Buffer;
        cert?: string | Buffer;
        ca?: string | Buffer | Array<string | Buffer>;
        pfx?: string | Buffer;
        passphrase?: string;
        // ... other TLS options
    };
}

// Usage
import * as fs from 'node:fs';

const api = HTTP.create({
    baseURL: 'https://secure.example.com',
    httpsAgentOptions: {
        key: fs.readFileSync('./client-key.pem'),
        cert: fs.readFileSync('./client-cert.pem'),
        ca: fs.readFileSync('./ca-cert.pem'),
        passphrase: 'password',
    },
});

await api.get('/secure-data');
```

**Benefits:**

- Critical for secure enterprise communication (mTLS)
- Provides explicit control over client-side TLS certificates
- Aligns with native Node.js `https.Agent` options

**Implementation Complexity:** High

- Node.js-only
- Requires creating and configuring `https.Agent` instances
- Needs careful handling of certificate files/buffers.

---

### Phase 2: Important Features (Medium Priority)

10. **Validate Status Customization**

```typescript
// API Design Proposal
interface HTTPConfig {
    validateStatus?: (status: number) => boolean;
}

// Default behavior (current)
const defaultValidateStatus = (status: number) => status >= 200 && status < 300;

// Custom validation - treat 404 as success
const api = HTTP.create({
    validateStatus: (status) => {
        return (status >= 200 && status < 300) || status === 404;
    },
});

// Per-request override
api.get('/optional-resource', {
    validateStatus: (status) => status < 500, // Any 4xx is ok
});
```

**Implementation:**

- Integrate with NotOkInterceptor
- Replace fixed status check with custom function
- Provide sensible default

---

11. **Interceptor Management**

```typescript
// API Design Proposal
interface InterceptorManager {
    use(interceptor: HTTPInterceptor): number;
    eject(id: number): void;
    clear(): void;
}

class HTTP {
    readonly interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager(),
    };
}

// Usage
const requestId = http.interceptors.request.use({
    preRequest: (request) => {
        console.log('Making request:', request.url);
        return request;
    },
});

// Later, remove interceptor
http.interceptors.request.eject(requestId);
```

**Implementation Complexity:** Medium

- Need to track interceptor IDs
- Need to handle removal during execution
- Maintain insertion order

---

12. **Form Submit Shortcuts**

```typescript
// API Design Proposal
class HTTP {
    postForm(url: string, data: Record<string, any>, config?: RequestOptions): Promise<Response> {
        return this.post(url, data, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }

    putForm(url: string, data: Record<string, any>, config?: RequestOptions): Promise<Response> {
        return this.put(url, data, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }

    patchForm(url: string, data: Record<string, any>, config?: RequestOptions): Promise<Response> {
        return this.patch(url, data, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }
}

// Usage
http.postForm('/login', { username: 'user', password: 'pass' });
// → POST /login with Content-Type: application/x-www-form-urlencoded
// → Body: username=user&password=pass
```

**Implementation Complexity:** Low

- Simple wrapper methods
- Convert object to URLSearchParams
- Set appropriate Content-Type

---

13. **Node.js Proxy Support**

```typescript
// API Design Proposal (Node-only)
interface HTTPConfig {
    proxy?:
        | {
              protocol?: 'http' | 'https';
              host: string;
              port: number;
              auth?: {
                  username: string;
                  password: string;
              };
          }
        | false; // false = explicitly disable proxy
}

// Usage
const api = HTTP.create({
    proxy: {
        host: 'proxy.example.com',
        port: 8080,
        auth: {
            username: 'proxyuser',
            password: 'proxypass',
        },
    },
});
```

**Implementation:**

- Node.js only (check `typeof process !== 'undefined'`)
- Use Node's `http.Agent` / `https.Agent`
- Or delegate to underlying library (node-fetch, undici)

---

14. **Error Categorization**

```typescript
// API Design Proposal
class HTTPError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly request: Request,
        public readonly response?: Response
    ) {
        super(message);
        this.name = 'HTTPError';
    }
}

// Error codes
const ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'ECONNABORTED',
    CONNECTION_REFUSED: 'ECONNREFUSED',
    NOT_FOUND: 'ERR_BAD_REQUEST',
    BAD_REQUEST: 'ERR_BAD_REQUEST',
    SERVER_ERROR: 'ERR_BAD_RESPONSE',
};

// Type guard
function isHTTPError(error: any): error is HTTPError {
    return error instanceof HTTPError;
}

// Usage
try {
    await http.get('/api/resource');
} catch (error) {
    if (isHTTPError(error)) {
        if (error.code === 'ECONNABORTED') {
            console.log('Request timed out');
        } else if (error.response?.status === 404) {
            console.log('Resource not found');
        }
    }
}
```

**Benefits:**

- Distinguish network errors from HTTP errors
- Programmatic error handling
- Aligns with Axios error codes

---

15. **Range Request Helper**

```typescript
// API Design Proposal
class HttpRange {
    static ofBytes(start: number, end?: number): HttpRange {
        return new HttpRange(start, end);
    }

    toString(): string {
        if (this.end !== undefined) {
            return `bytes=${this.start}-${this.end}`;
        }
        return `bytes=${this.start}-`;
    }
}

// Usage
const range = HttpRange.ofBytes(0, 1023);
http.get('/file.pdf', {
    headers: {
        Range: range.toString(), // → "bytes=0-1023"
    },
});

// Or convenience method
http.get('/file.pdf', {
    range: [0, 1023], // Automatically converted to Range header
});
```

**Benefits:**

- Convenient for byte range requests
- Useful for resumable downloads
- Aligns with Spring HttpRange class

---

### Phase 3: Nice-to-Have Features (Low Priority)

16. **MediaType with Quality Parameters**
17. **CacheControl Builder**
18. **Content-Disposition Parser**
19. **Node.js Custom DNS Resolution**
20. **Node.js TLS Session Resumption**
21. **Node.js Native Streaming Integration**
22. **Node.js Max Content/Body Length**

These are lower priority and can be implemented as utilities or optional enhancements after core features are complete.

---

## Platform Compatibility Strategy

### Universal Features (Work Everywhere)

- Instance system with config defaults ✅
- Query params config ✅
- Transform pipeline ✅
- HTTP Basic auth helper ✅
- Validate status customization ✅
- Interceptor management ✅
- Form shortcuts ✅
- Error categorization ✅
- Range request helper ✅

### Browser-Only Features

- XSRF protection 🔵
    - Implementation: Check `typeof document !== 'undefined'`
    - Gracefully no-op in Node.js
- Upload progress 🔵
    - Implementation: Check `typeof XMLHttpRequest !== 'undefined'`
    - Fall back to regular Fetch if not available
- Download progress 🔵
    - Implementation: Use ReadableStream (available in both, but more useful in browser)

### Node-Only Features

- Proxy support 🟣
    - Implementation: Check `typeof process !== 'undefined'`
    - Use Node's http.Agent / https.Agent
- Custom HTTP agents 🟣
    - Implementation: Node-specific configuration
- Max content/body length 🟣
    - Implementation: Check request size before sending

### Detection Strategy

```typescript
// Platform detection
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions?.node;

// Feature detection
const hasXMLHttpRequest = typeof XMLHttpRequest !== 'undefined';
const hasReadableStream = typeof ReadableStream !== 'undefined';

// Conditional feature enablement
class HTTP {
    constructor(config: HTTPConfig) {
        if (isBrowser && config.xsrfCookieName) {
            this.interceptors.request.use(new XSRFInterceptor(config));
        }

        if (isNode && config.proxy) {
            this.requestFactory = new ProxyRequestFactory(config.proxy);
        }
    }
}
```

---

## Migration Path from Current @blue/http

### Backward Compatibility Approach

**Option 1: Additive Changes (Recommended)**

- Keep existing API intact
- Add new features as optional config
- Existing code continues to work
- Gradual migration path

```typescript
// Old API (still works)
const http = new HTTP();
http.get('https://api.example.com/users');

// New API (opt-in)
const api = HTTP.create({
    baseURL: 'https://api.example.com',
    headers: { Authorization: 'Bearer token' },
});
api.get('/users');
```

**Option 2: Major Version Bump**

- Break existing API for cleaner design
- Provide migration guide
- Only if necessary for fundamental changes

### Migration Steps

1. **Phase 1**: Add instance system (non-breaking)

    - Keep existing constructor
    - Add `HTTP.create()` static method
    - Both APIs coexist

2. **Phase 2**: Add config options (non-breaking)

    - Add optional config to existing methods
    - Example: `http.get(url, { params, auth })`

3. **Phase 3**: Add interceptor management (potentially breaking)

    - May need to change interceptor registration API
    - Provide migration path for custom interceptors

4. **Phase 4**: Platform-specific features (non-breaking)
    - Add as opt-in features
    - Automatic detection and graceful fallback

---

## Testing Strategy

### Test Coverage Requirements

1. **Unit Tests**

    - Each new feature in isolation
    - Config merging logic
    - Transform pipeline execution
    - XSRF token extraction
    - Progress event emission

2. **Integration Tests**

    - Full request/response flow
    - Interceptor interaction
    - Error handling paths
    - Platform-specific features

3. **Platform Tests**

    - Browser environment (jsdom or real browser)
    - Node.js environment
    - Feature detection

4. **Compatibility Tests**
    - Axios API parity (for migration)
    - Fetch API behavior preservation
    - Existing @blue/http interceptors

### Test Environment Setup

```typescript
// Browser environment mock
global.document = {
    cookie: 'XSRF-TOKEN=abc123',
};

global.XMLHttpRequest = MockXMLHttpRequest;

// Node environment mock
global.process = {
    versions: { node: '18.0.0' },
};
```

---

## Performance Considerations

### Benchmark Targets

1. **Request Overhead**

    - Target: < 1ms overhead per request
    - Measure: Time from method call to Fetch API call
    - Critical path: Config merging + interceptor execution

2. **Transform Pipeline**

    - Target: < 0.5ms per transform function
    - Measure: Array iteration and function execution
    - Optimize: Avoid unnecessary cloning

3. **Memory Usage**

    - Target: < 1KB per HTTP instance
    - Measure: Instance memory footprint
    - Optimize: Share default configs

4. **Bundle Size**
    - Target: < 5KB gzipped for core
    - Target: < 10KB gzipped with all features
    - Optimize: Tree-shaking for optional features

### Optimization Strategies

1. **Lazy Loading**

    - Load platform-specific features only when needed
    - Example: XHR wrapper only when progress tracking used

2. **Config Caching**

    - Cache merged configs to avoid repeated merging
    - Invalidate cache on instance config change

3. **Interceptor Optimization**
    - Skip interceptors that don't apply (URL pattern matching)
    - Early exit from interceptor chain when possible

---

## Documentation Requirements

### User Guide Updates

1. **Migration Guide**

    - New API usage for all features
    - Guidance for migrating existing code
    - Comparison of @blue/http current vs future

2. **API Reference**

    - TSDoc for all public APIs
    - Auto-generated documentation (TypeDoc)
    - Detailed examples for each feature

3. **Conceptual Guides**
    - Explanations of core architecture (interceptors, execution chain)
    - Best practices for common use cases
    - Performance optimization tips

---

**Last Updated:** 2026-02-06  
**Status:** Research Complete, `baseURL` Implemented, Further Implementation Pending
