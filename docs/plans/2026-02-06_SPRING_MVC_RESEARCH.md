# Spring MVC Research Plan for Ndigo Framework Enhancement

**Status:** Not Started  
**Created:** 2025-02-01  
**Estimated Duration:** 23-34 hours  
**Purpose:** Evaluate Spring MVC capabilities and identify features suitable for porting to Ndigo framework

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Context & Motivation](#context--motivation)
3. [Research Scope](#research-scope)
4. [Research Methodology](#research-methodology)
5. [Deliverables](#deliverables)
6. [Timeline Estimate](#timeline-estimate)
7. [Success Criteria](#success-criteria)
8. [Questions to Resolve](#questions-to-resolve-during-research)
9. [References](#references)
10. [Appendix: Research Template](#appendix-research-template)

---

## Executive Summary

### Project Goal

Conduct comprehensive research into Spring MVC's feature set to identify patterns, capabilities, and abstractions that can be adapted for the Ndigo framework, with particular attention to platform-appropriate implementations (Web browser vs. Node.js vs. Universal JavaScript).

### Key Principles

1. **Platform-Aware Analysis:** Filter all features through the lens of Web (browser), Node.js (server), and Universal (both) contexts
2. **JavaScript-First Design:** Adapt Java patterns to idiomatic JavaScript/TypeScript conventions
3. **Industry Relevance:** Focus on modern, widely-adopted patterns that remain relevant in 2025+
4. **Ndigo Philosophy Alignment:** Maintain composition-over-inheritance, functional programming, and universal JavaScript principles

### Expected Outcomes

- **Feature Comparison Matrix:** Comprehensive spreadsheet mapping Spring MVC features to potential Ndigo implementations
- **Implementation Roadmap:** Phased plan with effort estimates and priorities
- **Architecture Patterns Document:** Design patterns for adapting Java concepts to JavaScript
- **Decision Log:** Rationale for all major design decisions

### Research Scope

10 Spring MVC feature domains, each analyzed for:

- Spring's implementation approach
- Current Ndigo capabilities
- Platform applicability (Web/Node/Universal)
- JavaScript adaptation strategy
- Priority score (1-10)
- Implementation effort estimate

---

## Context & Motivation

### Ndigo's Current State

Ndigo is a universal JavaScript framework built on the principles of:

- **Composition over inheritance:** Favor functional composition and mixins
- **Functional programming:** Leverage Ramda, immutable data, pure functions
- **Universal JavaScript:** Write once, run in browser or Node.js
- **Platform-appropriate abstractions:** Different APIs for different contexts when necessary

**Current dispatcher capabilities:**

- Route mapping via `@routeMapping` decorator
- Error handling via `@errorHandler` and `@errorMapping`
- Parameter injection via `@routeParams` (query, matrix, cookie values)
- Model and view abstraction via `ModelAndView`
- View resolution strategy pattern
- Basic request/response handling

### Why Spring MVC?

Spring MVC represents decades of battle-tested patterns for web application development. While Spring is Java-based and enterprise-focused, many of its abstractions translate well to JavaScript when adapted thoughtfully.

**Spring MVC's strengths:**

- Comprehensive annotation-based programming model
- Flexible request routing and mapping
- Robust data binding and validation
- Content negotiation and message conversion
- Exception handling hierarchy
- Interceptor/filter patterns
- Testing utilities

**Potential value for Ndigo:**

- Proven patterns for complex web applications
- Inspiration for decorator/annotation design
- Abstraction ideas for universal JavaScript
- Industry-standard conventions to adopt/adapt

### Guiding Example: Platform-Aware Design

**User's insight:** "Ndigo has `@routeMapping` instead of Spring's `@requestMapping` because the Web uses routes."

This exemplifies the research approach:

- **Spring pattern:** `@RequestMapping` maps HTTP requests to handler methods
- **Ndigo's Web adaptation:** `@routeMapping` for browser-based routing (SPA routing, History API)
- **Future Node.js adaptation:** Could add `@requestMapping` for HTTP request/response handling

**Key insight:** The same underlying concept (mapping handlers) has platform-specific semantics:

- **Web:** Think in terms of "routes" (URL paths in SPA)
- **Node.js:** Think in terms of "requests" (HTTP request/response cycle)
- **Universal:** Abstract route matching logic (platform-agnostic)

This pattern should guide the entire research: **identify the underlying concept, then determine platform-appropriate names and APIs**.

---

## Research Scope

### 10 Feature Domains

Each domain will be researched using the template in [Appendix: Research Template](#appendix-research-template).

#### Domain 1: Request Mapping & Routing

**Spring MVC Features:**

- `@RequestMapping` and method-specific variants (`@GetMapping`, `@PostMapping`, etc.)
- Path variables: `@PathVariable` for extracting URL segments
- Request parameters: `@RequestParam` for query strings
- Matrix variables: `@MatrixVariable` for URL matrix parameters
- URI templates: Ant-style patterns (`/users/**`), regex patterns
- Route composition: Class-level + method-level mapping
- HTTP method filtering
- Header/parameter conditional mapping
- Produces/consumes content type filtering

**Research Questions:**

1. How does Spring's routing compare to modern JavaScript router patterns (React Router, Vue Router, etc.)?
2. What's the relevance of matrix variables in modern web applications?
3. Should Ndigo support method-based routing (`@GetMapping` style) or stick with configuration?
4. How should path variable extraction integrate with TypeScript type safety?
5. What patterns from Spring are platform-specific (HTTP-only) vs universal?

**Platform Analysis:**

**Web (Browser):**

- **Routing:** History API, hash routing, client-side navigation
- **Path variables:** Extracted from URL pathname
- **Query parameters:** `URLSearchParams` API
- **Matrix parameters:** Rarely used (`;` syntax in URLs)
- **HTTP methods:** Not directly relevant (browser sends all requests)
- **Constraints:** Security (CORS), browser APIs, no direct HTTP control

**Node.js (Server):**

- **Routing:** Express-style routing, middleware chains
- **Path variables:** Route parameter extraction
- **Query parameters:** `req.query` parsing
- **Matrix parameters:** Can be supported server-side
- **HTTP methods:** Full control (GET, POST, PUT, DELETE, etc.)
- **Constraints:** Server concerns (performance, security, middleware)

**Universal:**

- **Route matching:** Pattern matching logic (Ant-style, regex)
- **Parameter extraction:** Abstract parameter parsing
- **Route composition:** Combine class and method routes
- **Validation:** Parameter validation rules
- **Constraints:** Must work in both contexts

**Ndigo Current State:**

- ✅ `@routeMapping` for route configuration
- ✅ Basic route parsing and matching
- ✅ Query parameter extraction via `@routeParams({ x: queryValue('x') })`
- ✅ Matrix parameter extraction via `matrixValue()`
- ❌ Path variable extraction (e.g., `/users/{id}`)
- ❌ HTTP method filtering
- ❌ Header/content type conditional mapping
- ❌ Method-specific decorators (`@GetMapping` style)

**Priority Assessment:**

- Industry relevance: 5/5 (core feature)
- Platform fit: Universal (with platform-specific variants)
- Architectural fit: 5/5 (aligns with decorator pattern)
- Complexity: 3/5 (moderate - route parsing already exists)
- User demand: 5/5 (frequently needed)
- **Total Priority:** 9/10

**Effort Estimate:**

- Research: 3 hours
- Design: 4 hours
- Implementation: 12 hours
- Testing: 4 hours
- Documentation: 2 hours
- **Total:** 25 hours

**Recommended Phase:** 1 (High Priority)

---

#### Domain 2: Data Binding & Validation

**Spring MVC Features:**

- `@ModelAttribute` for binding form data to objects
- `@RequestBody` for binding request body (JSON, XML)
- `@ResponseBody` for serializing response objects
- `@Valid` and `@Validated` for JSR-303/380 Bean Validation
- Custom validators and `BindingResult`
- Type conversion and formatting
- Data binding error handling

**Research Questions:**

1. How does Spring's data binding compare to modern form libraries (Formik, React Hook Form)?
2. Is JSR-303 annotation-style validation still relevant vs. schema-based (Zod, Yup)?
3. How should Ndigo integrate validation with existing `@Pattern` decorator?
4. Should Ndigo support automatic JSON parsing or require explicit configuration?
5. What's the right balance between magic (automatic binding) and explicit (manual parsing)?

**Platform Analysis:**

**Web (Browser):**

- **Form data:** `FormData` API, controlled vs. uncontrolled inputs
- **JSON parsing:** `response.json()`, `JSON.parse()`
- **Validation:** HTML5 validation, JavaScript validation libraries
- **Type coercion:** String → number/date conversion
- **Constraints:** Client-side only, can't enforce server rules

**Node.js (Server):**

- **Request body:** `body-parser`, `multer` for multipart/form-data
- **JSON parsing:** Middleware-based parsing
- **Validation:** Schema validation (Joi, Yup, Zod), custom validators
- **Type coercion:** Middleware for transformation
- **Constraints:** Server-side enforcement, security concerns

**Universal:**

- **Schema definition:** Define validation rules once
- **Type safety:** Leverage TypeScript for compile-time checks
- **Error messages:** Consistent error formatting
- **Validation logic:** Share between client and server
- **Constraints:** Must serialize validation rules

**Ndigo Current State:**

- ✅ `@Pattern` field decorator for regex validation
- ❌ Object-level validation
- ❌ Request body binding
- ❌ Nested object validation
- ❌ Custom validators
- ❌ Type coercion framework
- ❌ Validation error formatting

**Priority Assessment:**

- Industry relevance: 5/5 (essential feature)
- Platform fit: Universal (different concerns per platform)
- Architectural fit: 4/5 (extends existing validation)
- Complexity: 4/5 (complex - many edge cases)
- User demand: 5/5 (frequently needed)
- **Total Priority:** 9/10

**Effort Estimate:**

- Research: 4 hours
- Design: 6 hours
- Implementation: 20 hours
- Testing: 8 hours
- Documentation: 4 hours
- **Total:** 42 hours

**Recommended Phase:** 1 (High Priority)

---

#### Domain 3: Content Negotiation

**Spring MVC Features:**

- `@ResponseBody` for automatic content serialization
- `produces` attribute for specifying response content types
- `consumes` attribute for specifying accepted request content types
- Message converters: JSON, XML, protobuf, custom formats
- Content negotiation strategies:
    - Accept header-based
    - URL suffix-based (e.g., `/users.json` vs `/users.xml`)
    - Query parameter-based (e.g., `/users?format=json`)
- `HttpMessageConverter` interface for custom converters

**Research Questions:**

1. Is XML support still relevant in 2025? (JSON dominates)
2. How do modern APIs handle content negotiation? (Often JSON-only)
3. Should Ndigo support multiple formats or focus on JSON?
4. What's the role of content negotiation in SPAs? (Often N/A)
5. How does this relate to GraphQL, tRPC, and other modern API patterns?

**Platform Analysis:**

**Web (Browser):**

- **Response parsing:** `response.json()`, `response.text()`, `response.blob()`, `response.arrayBuffer()`
- **Content types:** Accept header sent automatically, often ignored by servers
- **Negotiation:** Usually client-driven (specify format in request)
- **Streaming:** `ReadableStream` for streaming responses
- **Constraints:** Browser security model, CORS

**Node.js (Server):**

- **Content negotiation:** `express-negotiator`, manual Accept header parsing
- **Response formatting:** `res.json()`, `res.send()`, custom serializers
- **Message converters:** Middleware for different formats
- **Streaming:** Node.js streams for large responses
- **Constraints:** Performance (serialization overhead)

**Universal:**

- **Format abstraction:** Define serializers/deserializers once
- **Content type handling:** Abstract content type detection
- **Type safety:** TypeScript interfaces for serialized types
- **Error handling:** Consistent error response format
- **Constraints:** Must support multiple formats

**Ndigo Current State:**

- ✅ `ModelAndView` abstraction for view and data
- ✅ View resolver pattern for rendering
- ❌ Content negotiation (no format detection)
- ❌ JSON serialization configuration
- ❌ Message converter pattern
- ❌ Multiple format support
- ❌ Accept header handling

**Priority Assessment:**

- Industry relevance: 3/5 (less important in 2025, JSON dominates)
- Platform fit: Primarily Node.js (less relevant for Web SPAs)
- Architectural fit: 3/5 (moderate fit)
- Complexity: 3/5 (moderate - mostly configuration)
- User demand: 2/5 (nice-to-have, not essential)
- **Total Priority:** 5/10

**Effort Estimate:**

- Research: 2 hours
- Design: 3 hours
- Implementation: 8 hours
- Testing: 3 hours
- Documentation: 2 hours
- **Total:** 18 hours

**Recommended Phase:** 2 (Medium Priority)

---

#### Domain 4: Exception Handling

**Spring MVC Features:**

- `@ExceptionHandler` for method-level exception handling
- `@ControllerAdvice` for global exception handlers
- `@ResponseStatus` for mapping exceptions to HTTP status codes
- Exception resolution hierarchy (most specific to least specific)
- Default exception handlers
- Exception attribute model (add data to error response)
- `HandlerExceptionResolver` interface

**Research Questions:**

1. How does Spring's exception handling compare to JavaScript error boundaries?
2. Should Ndigo support global error handlers or per-controller only?
3. How should exceptions map to HTTP status codes (Node.js) vs error states (Web)?
4. What's the right granularity for exception handlers?
5. How do modern frameworks handle errors (GraphQL, tRPC error handling)?

**Platform Analysis:**

**Web (Browser):**

- **Error boundaries:** React error boundaries, Vue error handling
- **Global handlers:** `window.onerror`, `window.onunhandledrejection`
- **User feedback:** Error messages, toast notifications
- **Recovery:** Retry mechanisms, fallback UI
- **Constraints:** Can't send HTTP status codes (client-side)

**Node.js (Server):**

- **Exception middleware:** Express error middleware
- **Status codes:** HTTP status code mapping (404, 500, etc.)
- **Error responses:** Structured error JSON
- **Logging:** Error logging, stack traces
- **Constraints:** Security (don't leak stack traces to client)

**Universal:**

- **Error types:** Define error class hierarchy
- **Error handlers:** Abstract error handling logic
- **Error mapping:** Map error types to responses
- **Error context:** Attach metadata to errors
- **Constraints:** Must work in both environments

**Ndigo Current State:**

- ✅ `@errorHandler` class decorator for error handler classes
- ✅ `@errorMapping` method decorator for error class mapping
- ✅ `ErrorResolver` interface for error resolution
- ✅ Error class hierarchy (from @ndigo/core)
- ❌ Global error handlers (`@ControllerAdvice` equivalent)
- ❌ HTTP status code mapping
- ❌ Default error handlers
- ❌ Error response formatting

**Priority Assessment:**

- Industry relevance: 5/5 (critical feature)
- Platform fit: Universal (different concerns per platform)
- Architectural fit: 5/5 (already started, needs enhancement)
- Complexity: 3/5 (moderate - builds on existing)
- User demand: 5/5 (frequently needed)
- **Total Priority:** 9/10

**Effort Estimate:**

- Research: 2 hours
- Design: 3 hours
- Implementation: 10 hours
- Testing: 4 hours
- Documentation: 2 hours
- **Total:** 21 hours

**Recommended Phase:** 1 (High Priority)

---

#### Domain 5: Interceptors & Filters

**Spring MVC Features:**

- `HandlerInterceptor` interface with `preHandle`, `postHandle`, `afterCompletion`
- `Filter` interface for Servlet filter pattern
- Interceptor ordering and registration
- Request/response modification
- Logging interceptors, authentication interceptors, etc.
- `WebMvcConfigurer` for registering interceptors

**Research Questions:**

1. How does Spring's interceptor pattern compare to Express middleware?
2. Should Ndigo support both interceptors and filters, or unify into one concept?
3. What's the right composition pattern for middleware chains?
4. How do modern frameworks handle cross-cutting concerns (HOCs, decorators, middleware)?
5. Should interceptors be declarative (decorators) or imperative (registration)?

**Platform Analysis:**

**Web (Browser):**

- **Service Workers:** Intercept network requests at browser level
- **Fetch interceptors:** Modify requests/responses in fetch calls
- **HOCs/Hooks:** React patterns for cross-cutting concerns
- **Proxy objects:** JavaScript Proxy for method interception
- **Constraints:** Limited control over request pipeline

**Node.js (Server):**

- **Express middleware:** `app.use()`, `router.use()` pattern
- **Koa compose:** Middleware composition with `async/await`
- **Async context:** `AsyncLocalStorage` for request-scoped data
- **Performance:** Middleware overhead considerations
- **Constraints:** Server-side concerns (auth, logging, etc.)

**Universal:**

- **Pipeline pattern:** Abstract request processing pipeline
- **Composition:** Functional composition of interceptors
- **Context passing:** Thread request context through chain
- **Error handling:** Interceptor error handling
- **Constraints:** Must support both sync and async

**Ndigo Current State:**

- ❌ No interceptor pattern
- ❌ No filter pattern
- ❌ No middleware composition
- ❌ No cross-cutting concern support
- ❌ No request pipeline abstraction

**Priority Assessment:**

- Industry relevance: 4/5 (important for real apps)
- Platform fit: Primarily Node.js (less relevant for Web SPAs)
- Architectural fit: 4/5 (fits composition philosophy)
- Complexity: 4/5 (complex - pipeline management)
- User demand: 4/5 (needed for auth, logging, etc.)
- **Total Priority:** 8/10

**Effort Estimate:**

- Research: 3 hours
- Design: 5 hours
- Implementation: 16 hours
- Testing: 6 hours
- Documentation: 3 hours
- **Total:** 33 hours

**Recommended Phase:** 2 (Medium Priority)

---

#### Domain 6: View Resolution

**Spring MVC Features:**

- `ViewResolver` interface for resolving view names to views
- Multiple view resolver types: JSP, Thymeleaf, FreeMarker, Velocity
- View name translation: prefix/suffix configuration
- Content negotiation view resolver
- Redirect views and forward views
- Model data passing to views

**Research Questions:**

1. Is server-side template rendering still relevant in 2025 (vs. SPAs)?
2. Should Ndigo support view resolution or focus on API-first?
3. How does SSR (Next.js, Remix) change view resolution patterns?
4. What's the role of view resolution in universal JavaScript apps?
5. Should Ndigo support template engines or focus on component rendering?

**Platform Analysis:**

**Web (Browser):**

- **Client-side rendering:** React, Vue, Angular, Svelte
- **Component-based:** Component trees, virtual DOM
- **No view resolution:** Direct component rendering
- **Routing:** Client-side routing with views
- **Constraints:** JavaScript-driven rendering

**Node.js (Server):**

- **SSR frameworks:** Next.js, Remix, SvelteKit
- **Template engines:** EJS, Pug, Handlebars
- **View resolution:** Map route → template
- **Data hydration:** Server data → client state
- **Constraints:** Server rendering performance

**Universal:**

- **Isomorphic rendering:** Same components in browser and server
- **View abstraction:** Abstract view resolution logic
- **Data passing:** Consistent data flow pattern
- **SEO:** Server-side rendering for SEO
- **Constraints:** Must support both rendering contexts

**Ndigo Current State:**

- ✅ `ViewResolver` interface
- ✅ `ModelAndView` for view + data
- ✅ `PathViewController` for simple routing
- ❌ Template engine integration
- ❌ Multiple view resolver types
- ❌ SSR support
- ❌ Isomorphic rendering

**Priority Assessment:**

- Industry relevance: 2/5 (declining, SPAs dominate)
- Platform fit: Primarily Node.js (SSR)
- Architectural fit: 3/5 (already started, but limited use case)
- Complexity: 4/5 (complex - many integrations)
- User demand: 2/5 (niche use case)
- **Total Priority:** 4/10

**Effort Estimate:**

- Research: 3 hours
- Design: 4 hours
- Implementation: 12 hours
- Testing: 4 hours
- Documentation: 2 hours
- **Total:** 25 hours

**Recommended Phase:** 3 (Low Priority) or Skip

---

#### Domain 7: REST Features

**Spring MVC Features:**

- `@RestController` for RESTful controllers
- `@ResponseStatus` for HTTP status codes
- `@CrossOrigin` for CORS configuration
- HATEOAS support: `RepresentationModel`, `Link`
- `ResponseEntity` for fine-grained response control
- REST conventions: resource naming, HTTP verbs
- Versioning strategies: URL, header, media type

**Research Questions:**

1. How relevant is traditional REST in 2025 vs. GraphQL, tRPC, gRPC?
2. Should Ndigo embrace REST conventions or be more flexible?
3. Is HATEOAS still relevant? (Rarely used in practice)
4. What's the best API versioning strategy for Ndigo?
5. How should Ndigo handle CORS in universal context?

**Platform Analysis:**

**Web (Browser):**

- **REST client:** Fetch API, Axios, React Query
- **CORS:** Browser enforces CORS policies
- **Conventions:** Consumer of RESTful APIs
- **Versioning:** Usually transparent to client
- **Constraints:** Browser security model

**Node.js (Server):**

- **REST server:** Express REST conventions
- **CORS:** `cors` middleware configuration
- **Status codes:** HTTP status code management
- **Versioning:** URL-based, header-based
- **Constraints:** API design decisions

**Universal:**

- **API contracts:** Define API shape once
- **Type safety:** TypeScript interfaces for API
- **Conventions:** Consistent REST patterns
- **Tooling:** API documentation, OpenAPI
- **Constraints:** Must work for client and server

**Ndigo Current State:**

- ✅ Basic routing (can build REST APIs)
- ✅ Model and view abstraction
- ❌ `@RestController` equivalent
- ❌ Status code management
- ❌ CORS configuration
- ❌ HATEOAS support
- ❌ REST conventions enforcement
- ❌ API versioning

**Priority Assessment:**

- Industry relevance: 3/5 (REST declining, but still common)
- Platform fit: Primarily Node.js
- Architectural fit: 3/5 (moderate fit)
- Complexity: 2/5 (relatively simple)
- User demand: 3/5 (some demand)
- **Total Priority:** 5/10

**Effort Estimate:**

- Research: 2 hours
- Design: 3 hours
- Implementation: 8 hours
- Testing: 3 hours
- Documentation: 2 hours
- **Total:** 18 hours

**Recommended Phase:** 2 (Medium Priority)

---

#### Domain 8: Async & Reactive

**Spring MVC Features:**

- `@Async` for asynchronous method execution
- `DeferredResult` for async request processing
- `CompletableFuture` integration
- `Callable` for async processing
- WebFlux: Reactive programming with Project Reactor
- Backpressure handling
- Server-Sent Events (SSE)
- WebSocket support

**Research Questions:**

1. How does Spring's async model compare to JavaScript's native Promise/async-await?
2. Is reactive programming (RxJS) relevant for Ndigo?
3. What's the best pattern for streaming data (SSE, WebSockets, long polling)?
4. How should Ndigo handle backpressure?
5. What's the role of reactive streams in modern JavaScript?

**Platform Analysis:**

**Web (Browser):**

- **Async:** Promises, async/await (native)
- **Reactive:** RxJS, Observables
- **Streaming:** Server-Sent Events (EventSource), WebSockets
- **Backpressure:** Limited control (browser buffering)
- **Constraints:** Browser concurrency model

**Node.js (Server):**

- **Async:** Promises, async/await (native)
- **Streams:** Node.js Streams (Readable, Writable, Transform)
- **Reactive:** RxJS, Highland
- **Backpressure:** Stream backpressure handling
- **Constraints:** Server performance, memory

**Universal:**

- **Promise abstraction:** Already universal in JavaScript
- **Async patterns:** Consistent async/await usage
- **Event patterns:** EventEmitter abstraction
- **Cancellation:** AbortController pattern
- **Constraints:** Platform-specific streaming

**Ndigo Current State:**

- ✅ `Deferred` class for promise management
- ✅ Promise-based APIs
- ❌ Reactive streams
- ❌ SSE support
- ❌ WebSocket support
- ❌ Backpressure handling
- ❌ Async iterator patterns

**Priority Assessment:**

- Industry relevance: 4/5 (async essential, reactive niche)
- Platform fit: Universal (different implementations)
- Architectural fit: 4/5 (aligns with async patterns)
- Complexity: 5/5 (very complex - streaming, backpressure)
- User demand: 3/5 (async yes, reactive maybe)
- **Total Priority:** 7/10

**Effort Estimate:**

- Research: 4 hours
- Design: 6 hours
- Implementation: 24 hours
- Testing: 8 hours
- Documentation: 4 hours
- **Total:** 46 hours

**Recommended Phase:** 2 (Medium Priority) for async, 3 (Low Priority) for reactive

---

#### Domain 9: Security Integration

**Spring MVC Features:**

- Spring Security annotations: `@PreAuthorize`, `@Secured`, `@RolesAllowed`
- Authentication strategies: Form-based, JWT, OAuth2, SAML
- Authorization: Role-based, permission-based, expression-based
- CSRF protection
- Security context propagation
- Method security
- Remember-me authentication
- Password encoding

**Research Questions:**

1. Should Ndigo provide security features or rely on external libraries?
2. How do modern JavaScript apps handle auth (JWT, OAuth2, etc.)?
3. What's the role of security annotations in Ndigo?
4. Should security be built-in or pluggable?
5. How does auth differ between Web (browser) and Node.js (server)?

**Platform Analysis:**

**Web (Browser):**

- **Authentication:** JWT in localStorage/sessionStorage, cookies
- **Authorization:** Client-side route guards (not secure)
- **CSRF:** Token-based CSRF protection
- **CORS:** Browser enforces, server configures
- **OAuth2:** OAuth2 PKCE flow for SPAs
- **Constraints:** Client-side is inherently insecure

**Node.js (Server):**

- **Authentication:** Passport.js, JWT verification, sessions
- **Authorization:** Middleware-based permission checks
- **CSRF:** CSRF token validation
- **CORS:** Server configuration
- **OAuth2:** Full OAuth2 flows, OpenID Connect
- **Constraints:** Server-side enforcement required

**Universal:**

- **Auth state:** Abstract authentication state
- **Token handling:** JWT parsing and validation
- **Permission checks:** Abstract permission logic
- **Security context:** Request-scoped security info
- **Constraints:** Must work in both contexts

**Ndigo Current State:**

- ❌ No security features
- ❌ No authentication support
- ❌ No authorization support
- ❌ No CSRF protection
- ❌ No security decorators

**Priority Assessment:**

- Industry relevance: 5/5 (critical for real apps)
- Platform fit: Universal (very different per platform)
- Architectural fit: 3/5 (complex integration)
- Complexity: 5/5 (very complex - security is hard)
- User demand: 5/5 (frequently needed)
- **Total Priority:** 7/10

**Effort Estimate:**

- Research: 6 hours
- Design: 8 hours
- Implementation: 40 hours
- Testing: 12 hours
- Documentation: 6 hours
- **Total:** 72 hours

**Recommended Phase:** 2 (Medium Priority) - Large effort, consider external libraries

---

#### Domain 10: Testing Support

**Spring MVC Features:**

- `@WebMvcTest` for controller slice testing
- `MockMvc` for simulating HTTP requests
- `@MockEntry` for mocking dependencies
- `@AutoConfigureMockMvc` for auto-configuration
- `WebTestClient` for reactive testing
- Request builders and result matchers
- JSON path assertions

**Research Questions:**

1. How does Spring's testing compare to JavaScript testing tools (Vitest, Jest)?
2. Should Ndigo provide testing utilities or rely on existing tools?
3. What testing patterns are unique to Ndigo's architecture?
4. How should Ndigo support integration testing?
5. What's the right balance between unit and integration tests?

**Platform Analysis:**

**Web (Browser):**

- **Testing:** Vitest, Jest, Testing Library
- **Component testing:** React Testing Library, Vue Test Utils
- **E2E testing:** Playwright, Cypress
- **Mocking:** MSW (Mock Service Worker), vi.mock()
- **Constraints:** Browser environment simulation

**Node.js (Server):**

- **Testing:** Vitest, Jest, Mocha
- **HTTP testing:** Supertest, node-mocks-http
- **Mocking:** Sinon, vi.mock()
- **Integration:** Test databases, test servers
- **Constraints:** Server environment setup

**Universal:**

- **Test fixtures:** Reusable test data
- **Mocking patterns:** Abstract mocking strategy
- **Assertions:** Custom assertion helpers
- **Test organization:** Consistent test structure
- **Constraints:** Must support both environments

**Ndigo Current State:**

- ✅ Vitest for testing
- ✅ Test files in `test/` directories
- ✅ Some test utilities (test contexts, etc.)
- ❌ Controller testing utilities
- ❌ HTTP mocking helpers
- ❌ Custom matchers/assertions
- ❌ Integration test patterns

**Priority Assessment:**

- Industry relevance: 4/5 (good testing important)
- Platform fit: Universal
- Architectural fit: 4/5 (enhances developer experience)
- Complexity: 3/5 (moderate - build on existing tools)
- User demand: 4/5 (developers want good testing)
- **Total Priority:** 7/10

**Effort Estimate:**

- Research: 2 hours
- Design: 3 hours
- Implementation: 12 hours
- Testing: 4 hours (meta!)
- Documentation: 3 hours
- **Total:** 24 hours

**Recommended Phase:** 2 (Medium Priority)

---

### Cross-Cutting Concerns

Beyond the 10 feature domains, analyze these cross-cutting concerns:

#### Performance Implications

**Research Questions:**

- How does Spring's runtime performance compare to JavaScript frameworks?
- What's the overhead of decorators in JavaScript vs. Java annotations?
- Are there performance anti-patterns to avoid from Spring?
- How does Ndigo's functional approach affect performance?

**Considerations:**

- Java: JIT compilation, JVM optimizations, mature performance tools
- JavaScript: V8 optimizations, single-threaded (Node.js), event loop
- Decorators: Metadata overhead, initialization cost
- Functional: Immutability overhead, function composition cost

#### Type Safety

**Research Questions:**

- How does Java's compile-time type checking compare to TypeScript?
- What Spring patterns rely on runtime reflection vs. compile-time?
- Can Ndigo provide stronger type safety than Spring?
- How should Ndigo leverage TypeScript's advanced types?

**Considerations:**

- Java: Strong compile-time types, generics, reflection
- TypeScript: Structural typing, advanced types, type inference
- Decorators: Metadata vs. type information
- Runtime: Type information available at runtime?

#### Dependency Injection

**Research Questions:**

- How does Spring's DI container compare to Ndigo's context?
- Should Ndigo adopt more Spring DI patterns?
- What's the right granularity for dependency management?
- How does DI interact with functional programming?

**Ndigo Current State:**

- ✅ `ApplicationContext` for DI container
- ✅ `@configuration` and `@entry` for entry registration
- ✅ `@profile` for environment-based configuration
- ✅ Context-aware processors

**Considerations:**

- Spring: Annotation-based DI, complex lifecycle, scopes
- Ndigo: Configuration-based, functional approach
- Integration: How do DI and functional composition coexist?

#### Configuration Management

**Research Questions:**

- How does Spring Boot's auto-configuration compare to Ndigo?
- Should Ndigo support externalized configuration (application.properties)?
- What's the right configuration format (JSON, YAML, TypeScript)?
- How should configuration work in universal JavaScript?

**Ndigo Current State:**

- ✅ `@propertySource` for property sources
- ✅ `@property` for property injection
- ✅ Profile-based configuration
- ❌ Externalized configuration files
- ❌ Auto-configuration

#### Logging and Observability

**Research Questions:**

- How does Spring's logging compare to JavaScript logging?
- Should Ndigo provide structured logging?
- What's the role of observability in universal JavaScript?
- Should Ndigo integrate with OpenTelemetry?

**Considerations:**

- Spring: SLF4J, Logback, Log4j2, extensive logging
- JavaScript: Console, Winston, Pino, Bunyan
- Observability: Metrics, tracing, distributed tracing
- Platform: Different logging concerns (browser vs. server)

#### Developer Experience

**Research Questions:**

- What makes Spring Boot developer-friendly?
- How can Ndigo provide great DX?
- What tooling would improve Ndigo development?
- Should Ndigo provide CLI tools (like Spring CLI)?

**Considerations:**

- Spring: IDE support, auto-configuration, starter packages
- Ndigo: TypeScript IDE support, simple configuration
- Tooling: Code generation, scaffolding, dev server
- Documentation: Examples, guides, API docs

---

## Research Methodology

### Phase 1: Spring MVC Deep Dive (8-12 hours)

**Objective:** Gain comprehensive understanding of Spring MVC's capabilities and design philosophy.

**Activities:**

1. **Read Spring Framework Reference Documentation**

    - Focus: Spring MVC section (Web on Servlet Stack)
    - Version: Spring Framework 6.x (latest)
    - URL: https://docs.spring.io/spring-framework/reference/web/webmvc.html
    - Take detailed notes on each feature domain

2. **Study Spring Boot Auto-Configuration**

    - Focus: How Spring Boot configures Spring MVC automatically
    - Version: Spring Boot 3.x
    - URL: https://docs.spring.io/spring-boot/docs/current/reference/html/
    - Understand conventions and sensible defaults

3. **Analyze Popular Spring MVC Projects on GitHub**

    - Search: "spring-mvc" OR "spring-boot-mvc" with >1000 stars
    - Goal: Identify most-used patterns and conventions
    - Focus: Real-world usage, not toy examples
    - Examples: Spring PetClinic, Spring REST Docs samples

4. **Identify Most-Used Annotations and Patterns**
    - Analyze: Which annotations appear most frequently?
    - Patterns: What patterns are universal vs. niche?
    - Trends: What's being deprecated or replaced?

**Deliverables:**

- Detailed notes on each of the 10 feature domains
- List of most-used annotations with examples
- List of deprecated/outdated patterns to avoid
- Architectural patterns document (initial draft)

---

### Phase 2: Platform Analysis (4-6 hours)

**Objective:** Determine platform applicability for each Spring MVC feature.

**Activities:**

1. **Web Platform Research (Browser)**

    - Review Web APIs: Fetch, History, URLSearchParams, EventSource
    - Review SPA frameworks: React Router, Vue Router patterns
    - Identify browser-specific constraints
    - Document Web-appropriate abstractions

2. **Node.js Platform Research (Server)**

    - Review Node.js patterns: Express, Koa, Fastify
    - Review middleware patterns and conventions
    - Identify server-specific concerns
    - Document Node.js-appropriate abstractions

3. **Universal JavaScript Patterns**

    - Identify features that work in both contexts
    - Define abstraction layer requirements
    - Document platform-agnostic APIs
    - Analyze serialization requirements

4. **Create Platform Compatibility Matrix**
    - For each Spring MVC feature, mark: Web / Node / Universal / None
    - Explain why feature fits or doesn't fit each platform
    - Identify alternative patterns for unsupported features

**Deliverables:**

- Platform compatibility matrix (spreadsheet)
- Web-specific pattern recommendations
- Node.js-specific pattern recommendations
- Universal abstraction guidelines

---

### Phase 3: Ndigo Current State Audit (3-4 hours)

**Objective:** Map existing Ndigo features to Spring MVC features and identify gaps.

**Activities:**

1. **Inventory Ndigo's Existing Features**

    - Review all packages: @ndigo/dispatcher, @ndigo/context, @ndigo/validate
    - Document existing decorators and their purposes
    - Identify patterns already implemented
    - List current capabilities and limitations

2. **Map Ndigo to Spring MVC**

    - Create mapping: Ndigo feature → Spring MVC equivalent
    - Identify: What Spring patterns does Ndigo already have?
    - Compare: How do implementations differ?
    - Assess: Quality and completeness of existing features

3. **Identify Gaps in Functionality**

    - List: What Spring MVC features are missing from Ndigo?
    - Prioritize: Which gaps are critical vs. nice-to-have?
    - Assess: Effort required to close each gap

4. **Evaluate Architectural Consistency**
    - Check: Do existing patterns align with Spring MVC concepts?
    - Identify: Inconsistencies or anti-patterns
    - Document: Architectural improvements needed

**Deliverables:**

- Ndigo feature inventory
- Ndigo → Spring MVC mapping table
- Gap analysis document
- Architectural consistency report

---

### Phase 4: Industry Trends Research (2-3 hours)

**Objective:** Understand how web development has evolved beyond Spring MVC.

**Activities:**

1. **Survey Modern JavaScript Frameworks**

    - Next.js: React-based SSR/SSG framework
    - Remix: React-based full-stack framework
    - tRPC: Type-safe RPC for TypeScript
    - Hono: Lightweight web framework
    - Analyze: What patterns have emerged?

2. **Analyze Evolution from MVC to Modern Patterns**

    - Traditional MVC → Component-based architecture
    - REST APIs → GraphQL / tRPC / gRPC
    - Server-side rendering → Hybrid rendering (SSR + CSR)
    - Template engines → Component frameworks

3. **Evaluate Relevance of Traditional MVC**

    - Question: Is MVC still relevant in 2025?
    - Consider: Microservices, serverless, edge computing
    - Identify: What MVC patterns remain valuable?

4. **Identify Emerging Patterns to Adopt**
    - Modern patterns: Server components, streaming SSR
    - API patterns: Type-safe APIs, code generation
    - DX improvements: File-based routing, convention over configuration

**Deliverables:**

- Modern framework analysis
- MVC relevance assessment
- Emerging patterns report
- Recommendations for Ndigo

---

### Phase 5: Feature Prioritization (2-3 hours)

**Objective:** Score and prioritize all researched features.

**Activities:**

1. **Score Each Feature**

    - **Industry Relevance (1-5):** How important is this feature in 2025?
    - **Platform Applicability:** Web / Node / Universal / None
    - **Architectural Fit (1-5):** How well does it fit Ndigo's architecture?
    - **Implementation Complexity (1-5):** How hard is it to implement?
    - **User Demand (1-5):** How much do users need this feature?

2. **Calculate Priority Score**

    - Formula: (Industry Relevance + Architectural Fit + User Demand) / 15 \* 10
    - Result: Priority score from 1-10
    - Consider: Implementation complexity as factor

3. **Create Prioritization Matrix**

    - High Priority (8-10): Implement in Phase 1
    - Medium Priority (5-7): Implement in Phase 2
    - Low Priority (1-4): Implement in Phase 3 or skip

4. **Estimate Implementation Effort**
    - For each feature: Research + Design + Implementation + Testing + Documentation
    - Total hours per feature
    - Total hours per phase

**Deliverables:**

- Feature scoring spreadsheet
- Prioritization matrix
- Effort estimates by phase
- Phased implementation roadmap

---

## Deliverables

### 5.1 Feature Comparison Matrix

**Format:** Spreadsheet (CSV or Excel)

**Columns:**

- Feature Name
- Feature Domain (1-10)
- Spring MVC Implementation (description)
- Spring MVC Annotations (list)
- Ndigo Current Implementation (description or "None")
- Platform Applicability (Web / Node / Universal / None)
- JavaScript Adaptation Strategy (description)
- Industry Relevance Score (1-5)
- Architectural Fit Score (1-5)
- Implementation Complexity Score (1-5)
- User Demand Score (1-5)
- Priority Score (calculated, 1-10)
- Effort Estimate (hours)
- Recommended Phase (1 / 2 / 3 / Skip)
- Notes (additional context)

**Example Rows:**

| Feature             | Domain | Spring                                    | Spring Annotations                             | Ndigo Current          | Platform  | Adaptation                              | Industry | Arch Fit | Complexity | Demand | Priority | Effort | Phase | Notes                       |
| ------------------- | ------ | ----------------------------------------- | ---------------------------------------------- | ---------------------- | --------- | --------------------------------------- | -------- | -------- | ---------- | ------ | -------- | ------ | ----- | --------------------------- |
| Path Variables      | 1      | Extract URL segments as method parameters | `@PathVariable`                                | None                   | Universal | `@routeParams({ id: pathValue('id') })` | 5        | 5        | 3          | 5      | 10       | 25h    | 1     | Critical for RESTful routes |
| Method Security     | 9      | Secure methods with annotations           | `@PreAuthorize`, `@Secured`                    | None                   | Node      | Middleware + decorators                 | 5        | 3        | 5          | 4      | 7        | 40h    | 2     | Consider external library   |
| JSP View Resolution | 6      | Resolve JSP templates                     | `ViewResolver`, `InternalResourceViewResolver` | Partial (ViewResolver) | Node      | Skip - JSP irrelevant                   | 1        | 2        | 4          | 1      | 2        | N/A    | Skip  | JSP is obsolete             |

**Total:** ~50-100 rows (comprehensive feature list)

---

### 5.2 Implementation Roadmap

**Format:** Markdown document

**Structure:**

#### Phase 1: Core Request Handling (High Priority, 8-10)

**Objective:** Implement essential features for building web applications with Ndigo.

**Features:**

1. Path Variable Extraction (25h)
2. Enhanced Data Binding & Validation (42h)
3. Exception Handling Enhancement (21h)
4. HTTP Method Filtering (12h)
5. Header/Content-Type Conditional Mapping (8h)

**Total Effort:** ~108 hours (~3 weeks)

**Prerequisites:** None

**Deliverables:**

- Path variable decorator: `pathValue()`
- Enhanced `@routeParams` with path variables
- Validation framework with schema support
- Global error handler: `@GlobalErrorHandler`
- HTTP method decorators: `@Get`, `@Post`, etc. (optional)
- Content-type conditional routing

**Success Criteria:**

- Can build RESTful APIs with Ndigo
- Full CRUD operations supported
- Comprehensive validation
- Proper error handling
- Type-safe parameter extraction

---

#### Phase 2: Advanced Patterns (Medium Priority, 5-7)

**Objective:** Add advanced features for production applications.

**Features:**

1. Interceptor & Middleware System (33h)
2. Async & Reactive Patterns (46h for async, defer reactive)
3. Content Negotiation (18h)
4. REST Conventions & Utilities (18h)
5. Testing Support (24h)
6. Security Foundation (72h or external library)

**Total Effort:** ~139-211 hours (~4-6 weeks)

**Prerequisites:** Phase 1 complete

**Deliverables:**

- Middleware composition pattern
- Async request handling
- SSE support (optional)
- Content negotiation framework
- REST decorators: `@RestController`, `@ResponseStatus`
- Testing utilities for Ndigo applications
- Security decorators (or library recommendation)

**Success Criteria:**

- Can build production-grade APIs
- Cross-cutting concerns supported
- Async operations handled properly
- Good testing experience
- Basic security patterns available

---

#### Phase 3: Specialized Features (Low Priority, 1-4)

**Objective:** Add specialized features for specific use cases.

**Features:**

1. SSR View Resolution (25h)
2. HATEOAS Support (15h)
3. WebSocket Support (20h)
4. Reactive Streams (additional 30h beyond async)
5. Advanced Security Patterns (additional work)

**Total Effort:** ~90+ hours (~2-3 weeks)

**Prerequisites:** Phase 2 complete

**Deliverables:**

- Template engine integration (optional)
- HATEOAS utilities (if demand exists)
- WebSocket decorators
- Full reactive streams (RxJS integration)
- Advanced security features

**Success Criteria:**

- Specialized use cases supported
- SSR possible (if needed)
- Real-time communication supported
- Full feature parity with Spring MVC (where relevant)

---

**Total Estimated Effort:** 337-409 hours (~8-10 weeks of full-time work)

**Phasing Strategy:** Iterative delivery with feedback loops between phases

---

### 5.3 Architecture Patterns Document

**Format:** Markdown document with code examples

**Purpose:** For each adopted feature, document how to adapt Spring's Java patterns to idiomatic JavaScript.

**Structure per Pattern:**

```markdown
### Pattern: [Name]

**Spring MVC Approach:**
[Description of how Spring implements this pattern]
[Java code example]

**JavaScript Adaptation:**
[Description of JavaScript-idiomatic approach]
[Explanation of differences from Spring]

**Ndigo Implementation Strategy:**
[Specific design decisions for Ndigo]
[Rationale for design choices]

**Code Example:**
[TypeScript/JavaScript code showing Ndigo's API]

**Design Decisions:**

- [Key decision 1 with rationale]
- [Key decision 2 with rationale]
- [Trade-offs considered]

**Testing Strategy:**
[How to test this pattern]
[Unit vs. integration testing approach]

**Migration Path:**
[How users adopt this feature]
[Before/after examples if replacing existing pattern]

**Related Patterns:**
[Links to related patterns in this document]
```

**Example Patterns to Document:**

1. **Path Variable Extraction**
2. **Parameter Mapping (Query/Matrix/Cookie)**
3. **Request Body Binding**
4. **Validation Framework**
5. **Exception Handling Hierarchy**
6. **Interceptor Composition**
7. **Content Negotiation**
8. **Async Request Processing**
9. **Security Context Propagation**
10. **Testing Utilities**

**Total:** 10-20 detailed pattern documents

---

### 5.4 Decision Log

**Format:** Markdown document

**Purpose:** Track all major design decisions made during research and implementation.

**Structure per Decision:**

```markdown
### Decision: [Title]

**Date:** YYYY-MM-DD

**Status:** Proposed / Accepted / Rejected / Superseded

**Context:**
[What is the situation? What problem are we solving?]

**Decision:**
[What did we decide to do?]

**Rationale:**
[Why did we make this decision?]
[What factors influenced the decision?]

**Consequences:**

- **Positive:** [Benefits of this decision]
- **Negative:** [Drawbacks or limitations]
- **Neutral:** [Other effects]

**Alternatives Considered:**

1. **[Alternative 1]:** [Why rejected]
2. **[Alternative 2]:** [Why rejected]

**Related Decisions:**
[Links to related decisions]
```

**Example Decisions:**

#### Decision: Use @routeMapping Instead of @requestMapping for Web

**Date:** 2025-02-XX

**Status:** Accepted

**Context:**
Spring MVC uses `@RequestMapping` which maps HTTP requests to handler methods. Ndigo needs to support both browser-based routing (SPAs) and Node.js HTTP request handling.

**Decision:**
Ndigo will use `@routeMapping` for browser-based routing and reserve `@requestMapping` for future Node.js HTTP request/response handling.

**Rationale:**

- **Web applications** think in terms of "routes" (SPA routing, History API, URL paths)
- **Node.js applications** think in terms of "requests" (HTTP request/response cycle)
- Separation allows platform-appropriate abstractions
- Consistent with Ndigo's universal JavaScript philosophy
- Users can understand the distinction clearly

**Consequences:**

- **Positive:** Clearer mental model for developers, enables platform-specific optimizations
- **Negative:** Requires documenting the distinction, two decorators instead of one
- **Neutral:** Need to ensure consistency in route matching logic

**Alternatives Considered:**

1. **Use `@requestMapping` for everything:** Rejected because it confuses Web routing with HTTP requests
2. **Use `@routeMapping` for everything:** Rejected because it doesn't match Node.js HTTP semantics
3. **Use `@route` and `@request`:** Rejected for consistency with Spring naming

**Related Decisions:**

- [Decision: Platform-Specific vs. Universal Abstractions]
- [Decision: Decorator Naming Conventions]

---

#### Decision: Parameter Decorators → Method Decorator with Map

**Date:** 2025-02-01

**Status:** Accepted

**Context:**
TC39 decorators do not support parameter decorators. Legacy TypeScript parameter decorators (`@queryValue`, `@matrixValue`, `@cookieValue`) cannot be used in TC39 mode.

**Decision:**
Replace parameter decorators with a method decorator that accepts a parameter map: `@routeParams({ id: queryValue('id') })`.

**Rationale:**

- TC39 doesn't support parameter decorators (no alternative)
- Method decorator + factory functions is the closest equivalent
- Name-based mapping is explicit and order-independent
- Fail-fast validation catches configuration errors early
- Factory functions (queryValue, etc.) remain familiar

**Consequences:**

- **Positive:** TC39 compatible, explicit parameter mapping, type-safe
- **Negative:** Breaking API change, more verbose, requires updating all usage
- **Neutral:** Consistent with TC39 decorator model

**Alternatives Considered:**

1. **Stick with legacy decorators:** Rejected because not TC39 compatible
2. **Use positional array:** `@routeParams([queryValue('id'), matrixValue('v')])` - Rejected for fragility (order-dependent)
3. **Per-parameter method decorators:** `@queryParam('id', 'id')` - Rejected for verbosity (multiple decorators)

**Related Decisions:**

- [Decision: TC39 Decorator Migration Strategy]
- [Decision: Factory Function Design]

---

**Total:** 10-30 decision records documenting the research and design process

---

## Timeline Estimate

| Phase                                  | Duration        | Activities                                                        | Deliverable                                                                  |
| -------------------------------------- | --------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Phase 1: Spring MVC Deep Dive**      | 8-12 hours      | Read documentation, analyze projects, identify patterns           | Domain knowledge, annotation list, initial architecture doc                  |
| **Phase 2: Platform Analysis**         | 4-6 hours       | Research Web/Node APIs, create compatibility matrix               | Platform compatibility matrix, abstraction guidelines                        |
| **Phase 3: Ndigo Current State Audit** | 3-4 hours       | Inventory features, map to Spring, identify gaps                  | Ndigo feature inventory, gap analysis                                        |
| **Phase 4: Industry Trends Research**  | 2-3 hours       | Survey modern frameworks, analyze MVC evolution                   | Modern patterns report, recommendations                                      |
| **Phase 5: Feature Prioritization**    | 2-3 hours       | Score features, estimate effort, create roadmap                   | Prioritization matrix, roadmap                                               |
| **Documentation & Synthesis**          | 4-6 hours       | Compile all deliverables, write patterns doc, create decision log | Feature comparison matrix, architecture patterns, decision log, final report |
| **TOTAL**                              | **23-34 hours** | Complete research + documentation                                 | All deliverables ready for implementation                                    |

**Breakdown by Activity:**

- Reading/Research: 10-15 hours
- Analysis/Mapping: 6-9 hours
- Prioritization/Planning: 3-4 hours
- Documentation Writing: 4-6 hours

**Recommended Schedule:**

- **Week 1:** Phases 1-2 (Spring MVC deep dive + platform analysis)
- **Week 2:** Phases 3-5 (Ndigo audit + trends + prioritization)
- **Week 3:** Documentation synthesis and deliverable creation

---

## Success Criteria

- [ ] All 10 feature domains researched thoroughly
- [ ] Platform analysis complete for each feature (Web/Node/Universal)
- [ ] Feature comparison matrix populated with 50-100 features
- [ ] Implementation roadmap created with 3 phases
- [ ] Architecture patterns documented (10-20 patterns)
- [ ] Decision log maintained (10-30 decisions)
- [ ] Timeline estimates for each implementation phase
- [ ] Ready to begin Phase 1 implementation
- [ ] Stakeholder review and approval obtained
- [ ] Documentation reviewed for clarity and completeness

**Quality Criteria:**

- Research is comprehensive (not surface-level)
- Platform analysis considers real-world constraints
- Prioritization is justified with clear rationale
- Architecture patterns are idiomatic JavaScript
- Decision log captures key trade-offs
- Deliverables are actionable (not just informational)

---

## Questions to Resolve During Research

Document open questions that arise during research. Resolve before implementation.

### Technical Questions

1. **Should Ndigo support JSP/template-style view resolution, or focus on API-first?**

    - Context: SSR is coming back (Next.js), but JSP is dead
    - Consider: Modern SSR frameworks vs. traditional templates
    - Decision pending: [Date]

2. **How much of Spring Security is relevant vs. modern JWT/OAuth2 patterns?**

    - Context: Spring Security is comprehensive but complex
    - Consider: Passport.js, Auth0, Clerk, Supabase Auth
    - Decision pending: [Date]

3. **Should Ndigo embrace GraphQL/tRPC patterns over traditional REST?**

    - Context: REST is declining, type-safe RPC is rising
    - Consider: Industry trends, Ndigo's positioning
    - Decision pending: [Date]

4. **What's the balance between Spring-inspired vs. JavaScript-idiomatic?**
    - Context: Spring has decades of Java patterns
    - Consider: Developer expectations, JavaScript conventions
    - Decision pending: [Date]

### Architectural Questions

5. **Should interceptors be declarative (decorators) or imperative (registration)?**

    - Context: Spring uses registration, middleware uses imperative
    - Consider: Ndigo's decorator philosophy
    - Decision pending: [Date]

6. **How should Ndigo handle backward compatibility for breaking changes?**

    - Context: Parameter decorator migration required breaking changes
    - Consider: Deprecation strategy, migration tooling
    - Decision pending: [Date]

7. **Should security features be built-in or pluggable (external libraries)?**
    - Context: Security is complex and high-stakes
    - Consider: Maintenance burden, security expertise required
    - Decision pending: [Date]

### Strategic Questions

8. **Should Ndigo aim for feature parity with Spring MVC?**

    - Context: Spring MVC has 20+ years of features
    - Consider: Ndigo's scope, target use cases
    - Decision pending: [Date]

9. **What's Ndigo's positioning: framework or library collection?**

    - Context: Spring is a full framework, some JS tools are minimal
    - Consider: Developer experience, flexibility vs. convention
    - Decision pending: [Date]

10. **Should Ndigo prioritize Web (browser) or Node.js (server) features?**
    - Context: Limited development resources
    - Consider: Market demand, Ndigo's current usage
    - Decision pending: [Date]

---

## References

### Spring Framework Documentation

- **Spring Framework Reference:** https://docs.spring.io/spring-framework/reference/
- **Spring MVC Section:** https://docs.spring.io/spring-framework/reference/web/webmvc.html
- **Spring Boot Reference:** https://docs.spring.io/spring-boot/docs/current/reference/html/
- **Spring Security Reference:** https://docs.spring.io/spring-security/reference/index.html

### Ndigo Framework Documentation

- **Ndigo Architecture:** `/home/jeff/workspace/ndigo/ARCHITECTURE.md`
- **Ndigo Style Guide:** `/home/jeff/workspace/ndigo/STYLE_GUIDE.md`
- **Ndigo Agents Guide:** `/home/jeff/workspace/ndigo/AGENTS.md`
- **Decorator Migration Plan:** `/home/jeff/workspace/ndigo/docs/plans/2025-02-01_DECORATOR_MIGRATION.md`
- **TC39 Quick Reference:** `/home/jeff/workspace/ndigo/docs/plans/2025-02-01_TC39_QUICK_REFERENCE.md`

### JavaScript Framework Documentation

- **Next.js:** https://nextjs.org/docs
- **Remix:** https://remix.run/docs
- **tRPC:** https://trpc.io/docs
- **Hono:** https://hono.dev/
- **Express:** https://expressjs.com/
- **Koa:** https://koajs.com/

### Standards and Specifications

- **TC39 Decorators:** https://github.com/tc39/proposal-decorators
- **TypeScript Decorators:** https://www.typescriptlang.org/docs/handbook/decorators.html
- **Web APIs:** https://developer.mozilla.org/en-US/docs/Web/API
- **Node.js API:** https://nodejs.org/docs/latest/api/

### Related Research

- **Modern Web Frameworks Survey:** (to be conducted)
- **REST vs. GraphQL vs. tRPC Analysis:** (to be conducted)
- **JavaScript Security Best Practices:** (to be referenced)

---

## Appendix: Research Template

Use this template for each of the 10 feature domains.

---

### Domain X: [Feature Name]

#### Spring MVC Implementation

**Overview:**
[High-level description of how Spring implements this feature]

**Annotations:**

- `@AnnotationName1` - [Description]
- `@AnnotationName2` - [Description]
- (list all relevant annotations)

**Key Classes/Interfaces:**

- `ClassName1` - [Purpose]
- `InterfaceName1` - [Purpose]
- (list key types)

**Configuration Options:**

- Option 1: [Description]
- Option 2: [Description]
- (list configuration points)

**Example Usage:**

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public User getUser(@PathVariable("id") Long id) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@Valid @RequestBody User user) {
        return userService.save(user);
    }
}
```

**Key Features:**

- Feature 1: [Description]
- Feature 2: [Description]
- (list notable features)

---

#### Platform Analysis

##### Web (Browser)

**Relevant APIs:**

- API 1: [Description and use case]
- API 2: [Description and use case]

**Constraints:**

- Constraint 1: [Description]
- Constraint 2: [Description]

**Patterns:**
[Description of how this feature is typically implemented in browser-based apps]

**Example:**

```typescript
// Browser-based implementation example
```

**Applicability:** ✅ Applicable / ⚠️ Partially Applicable / ❌ Not Applicable

---

##### Node.js (Server)

**Relevant Libraries:**

- Library 1: [Description and use case]
- Library 2: [Description and use case]

**Constraints:**

- Constraint 1: [Description]
- Constraint 2: [Description]

**Patterns:**
[Description of how this feature is typically implemented in Node.js apps]

**Example:**

```typescript
// Node.js-based implementation example
```

**Applicability:** ✅ Applicable / ⚠️ Partially Applicable / ❌ Not Applicable

---

##### Universal (Both)

**Common Abstractions:**

- Abstraction 1: [Description]
- Abstraction 2: [Description]

**Design Considerations:**

- Consideration 1: [Description]
- Consideration 2: [Description]

**Example:**

```typescript
// Universal implementation example (works in both contexts)
```

**Applicability:** ✅ Applicable / ⚠️ Partially Applicable / ❌ Not Applicable

---

#### Ndigo Current State

**Existing Features:**

- Feature 1: [Description of what Ndigo currently has]
- Feature 2: [Description]
- (or "None" if not implemented)

**Gaps:**

- Gap 1: [What's missing compared to Spring MVC]
- Gap 2: [What's missing]

**Compatibility Assessment:**
[How well does Ndigo's current implementation align with Spring MVC? What would need to change?]

---

#### JavaScript Adaptation Strategy

**Naming Decisions:**

- Spring: `@RequestMapping` → Ndigo: `@routeMapping` (Web) / `@requestMapping` (Node)
- Rationale: [Explanation]

**API Design:**
[Description of how to adapt Spring's API to JavaScript idioms]

**Type Safety Strategy:**
[How to leverage TypeScript for better type safety than Spring]

**Example:**

```typescript
// Ndigo's JavaScript-idiomatic API
class UserController {
    @routeMapping('/users/{id}')
    @routeParams({
        id: pathValue('id', { type: 'number' }),
    })
    getUser(id: number): User {
        return this.userService.findById(id);
    }
}
```

**Key Differences from Spring:**

1. Difference 1: [Explanation]
2. Difference 2: [Explanation]

---

#### Priority Assessment

**Scoring:**

- **Industry Relevance:** X/5 - [Justification]
- **Platform Fit:** Web / Node / Universal / None - [Explanation]
- **Architectural Fit:** X/5 - [How well it fits Ndigo's architecture]
- **Complexity:** X/5 - [Implementation difficulty]
- **User Demand:** X/5 - [How much users need this]

**Total Priority:** X/10 (calculated)

**Calculation:** (Industry Relevance + Architectural Fit + User Demand) / 15 \* 10

---

#### Effort Estimate

**Breakdown:**

- **Research:** X hours - [Activities]
- **Design:** X hours - [Activities]
- **Implementation:** X hours - [Activities]
- **Testing:** X hours - [Activities]
- **Documentation:** X hours - [Activities]

**Total:** X hours

**Assumptions:**

- Assumption 1: [Description]
- Assumption 2: [Description]

**Dependencies:**

- Dependency 1: [What needs to be done first]
- Dependency 2: [External library requirements]

---

#### Recommended Phase

**Phase:** 1 (High) / 2 (Medium) / 3 (Low) / Skip

**Rationale:**
[Explanation of why this feature belongs in this phase]

**Prerequisites:**

- Prerequisite 1: [What needs to be complete before this]
- Prerequisite 2: [Dependencies]

---

#### Notes

**Additional Observations:**

- Note 1: [Anything else worth documenting]
- Note 2: [Context, concerns, open questions]

**Concerns:**

- Concern 1: [Potential issues or risks]
- Concern 2: [Trade-offs to consider]

**Alternatives:**

- Alternative 1: [Different approach to consider]
- Alternative 2: [Why not use existing library X?]

**Related Features:**

- Related Feature 1: [Link to other domain]
- Related Feature 2: [Cross-cutting concern]

---

**Template Complete**

Copy this template for each of the 10 feature domains and fill in during research.

---

## End of Research Plan

This document provides a comprehensive framework for researching Spring MVC and adapting its patterns to Ndigo framework. Use this as a guide during the research phase, and update with findings as you progress.

**Next Steps:**

1. Review this plan with stakeholders
2. Schedule research time (23-34 hours)
3. Begin Phase 1: Spring MVC Deep Dive
4. Document findings in each template section
5. Compile deliverables
6. Present results and recommendations

**Questions or Feedback:**
Document any questions or feedback about this plan in the issues or comments.

---

**Document Status:** Ready for Research  
**Last Updated:** 2025-02-01  
**Owner:** [To be assigned]  
**Reviewers:** [To be assigned]
