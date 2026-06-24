# Wave 4: Service Boundary Implementation Specification

## Overview

This document outlines the implementation plan for Wave 4 of the Client-First Roadmap, focusing on porting legacy service interceptors into `@blue/http` and `@blue/platform-web`, and enhancing `@blue/service`.

## Goals

1. Port legacy interceptors from `header.legacy.js`, `error.legacy.js`, `cache.legacy.js`, `status.legacy.js`, and `offline.legacy.js`
2. Push CSRF, retry, error normalization, cache, and offline-detection into `@blue/http` as interceptors
3. Enhance `@blue/service` with service registry, telemetry hooks, and request-id correlation

## Interceptor Implementations

### 1. HeaderInterceptor (@blue/http)

#### Architectural Decision
- Implements HTTP header management for CSRF token, channel-id, and client-request-id
- Uses interceptor pattern to modify outgoing requests
- Integrates with existing HTTP client configuration system

#### API Signature
```typescript
interface HeaderInterceptorConfig {
  csrfToken?: string;
  channelId?: string;
  generateRequestId?: boolean;
}

class HeaderInterceptor implements HttpInterceptor {
  constructor(config: HeaderInterceptorConfig);
  
  intercept(request: HttpRequest, next: HttpHandler): Observable<HttpResponse>;
}
```

#### Implementation Details
- **CSRF Token**: Automatically adds `X-CSRF-Token` header from configuration or session storage
- **Channel ID**: Adds `X-Channel-ID` header for request tracking
- **Client Request ID**: Generates unique UUID for each request when enabled

#### Edge Cases
- Missing CSRF token: Graceful fallback to empty header or error
- Invalid channel ID: Validate format before adding to header
- Request ID generation failure: Fall back to timestamp-based ID

### 2. ErrorNormalizationInterceptor (@blue/http)

#### Architectural Decision
- Standardizes error responses from HTTP calls into consistent shape
- Handles both network errors and HTTP status code errors
- Integrates with existing error handling system in `@blue/service`

#### API Signature
```typescript
interface ErrorNormalizationInterceptorConfig {
  defaultErrorType?: string;
}

class ErrorNormalizationInterceptor implements HttpInterceptor {
  constructor(config: ErrorNormalizationInterceptorConfig);
  
  intercept(request: HttpRequest, next: HttpHandler): Observable<HttpResponse>;
}
```

#### Implementation Details
- **Network Errors**: Converts network failures to standardized error objects
- **HTTP Status Codes**: Maps common HTTP status codes to consistent error types
- **Response Parsing**: Parses JSON error responses and normalizes structure

#### Edge Cases
- Malformed error responses: Graceful fallback to generic error
- Missing error fields: Populate with defaults or empty values
- Non-JSON responses: Attempt to parse as text or fall back gracefully

### 3. CacheInterceptor (@blue/http)

#### Architectural Decision
- Implements response caching with TTL and cache-busting capabilities
- Uses in-memory cache with LRU eviction policy for performance
- Supports both automatic and manual cache control headers

#### API Signature
```typescript
interface CacheInterceptorConfig {
  defaultTtl?: number; // milliseconds
  maxCacheSize?: number;
  cacheBustingHeaders?: string[];
}

class CacheInterceptor implements HttpInterceptor {
  constructor(config: CacheInterceptorConfig);
  
  intercept(request: HttpRequest, next: HttpHandler): Observable<HttpResponse>;
}
```

#### Implementation Details
- **TTL Management**: Configurable time-to-live for cached responses
- **Cache Busting**: Supports cache-busting headers to invalidate entries
- **LRU Eviction**: Automatic removal of least recently used entries when size limit is reached

#### Edge Cases
- Cache overflow: Implement LRU eviction strategy
- Invalid TTL values: Default to safe value or throw error
- Concurrent requests for same resource: Handle race conditions properly

### 4. StatusInterceptor (@blue/http)

#### Architectural Decision
- Normalizes HTTP status codes into consistent application-level status representations
- Handles common status code mappings and custom status handling
- Provides hooks for application-specific status processing

#### API Signature
```typescript
interface StatusInterceptorConfig {
  statusMappings?: Record<number, string>;
  defaultStatus?: string;
}

class StatusInterceptor implements HttpInterceptor {
  constructor(config: StatusInterceptorConfig);
  
  intercept(request: HttpRequest, next: HttpHandler): Observable<HttpResponse>;
}
```

#### Implementation Details
- **Status Code Mapping**: Maps HTTP status codes to application-specific status strings
- **Custom Handling**: Allows custom processing for specific status codes
- **Default Handling**: Provides fallback behavior for unmapped status codes

#### Edge Cases
- Unmapped status codes: Use default or throw error based on configuration
- Invalid status mappings: Validate and handle gracefully
- Status code conflicts: Define clear precedence rules

### 5. OfflineInterceptor (@blue/platform-web)

#### Architectural Decision
- Uses browser-native `navigator.onLine` API for offline detection
- Provides observable stream of online/offline state changes
- Integrates with existing service layer for automatic retry logic

#### API Signature
```typescript
interface OfflineInterceptorConfig {
  checkInterval?: number; // milliseconds
}

class OfflineInterceptor implements HttpInterceptor {
  constructor(config: OfflineInterceptorConfig);
  
  intercept(request: HttpRequest, next: HttpHandler): Observable<HttpResponse>;
}
```

#### Implementation Details
- **Browser Detection**: Leverages `navigator.onLine` and `online/offline` events
- **State Management**: Maintains current online/offline state with observable updates
- **Retry Logic**: Integrates with retry interceptor for automatic request queuing

#### Edge Cases
- Browser compatibility: Fallback behavior for older browsers
- Network flakiness: Debounce rapid state changes
- Manual override: Allow manual state setting for testing

## @blue/service Enhancements

### Service Registry

#### Architectural Decision
- Implements token-based service endpoint mapping
- Supports both static and dynamic registration
- Integrates with existing dependency injection system

#### API Signature
```typescript
interface ServiceRegistry {
  register(token: string, endpoint: string): void;
  getEndpoint(token: string): string | null;
  getAllEndpoints(): Map<string, string>;
}

class ServiceRegistryImpl implements ServiceRegistry {
  constructor();
}
```

#### Implementation Details
- **Token Resolution**: Maps service tokens to their endpoints
- **Dynamic Registration**: Allows runtime registration of new services
- **Validation**: Validates endpoint URLs and token formats

### Telemetry Hooks

#### Architectural Decision
- Integrates with `@blue/telemetry` for request tracing and metrics
- Provides hooks for request/response lifecycle events
- Supports correlation of telemetry data with service calls

#### API Signature
```typescript
interface TelemetryHooks {
  onRequest(request: HttpRequest): void;
  onResponse(response: HttpResponse): void;
  onError(error: Error): void;
}

class TelemetryHooksImpl implements TelemetryHooks {
  constructor(telemetryService: TelemetryService);
}
```

### Request-ID Correlation

#### Architectural Decision
- Automatically generates and propagates request IDs through service calls
- Integrates with existing logging and tracing systems
- Supports correlation of logs across distributed services

#### API Signature
```typescript
interface RequestIdCorrelation {
  generateRequestId(): string;
  getCorrelationId(): string;
  setCorrelationId(id: string): void;
}

class RequestIdCorrelationImpl implements RequestIdCorrelation {
  constructor();
}
```

## Testing Strategy

### Unit Tests
- Each interceptor tested in isolation with mocked HTTP requests/responses
- Edge case scenarios covered with parameterized tests
- Configuration validation tests for all interceptor options

### Integration Tests
- End-to-end testing of interceptors in HTTP client context
- Service registry integration with dependency injection system
- Telemetry hooks integration with telemetry service

### Performance Tests
- Cache performance under concurrent load
- Interceptor chain overhead measurement
- Memory usage monitoring for cache implementations

## Implementation Timeline

### Phase 1: Core Interceptors (Week 1)
- Implement HeaderInterceptor in @blue/http
- Implement ErrorNormalizationInterceptor in @blue/http
- Implement CacheInterceptor in @blue/http
- Implement StatusInterceptor in @blue/http

### Phase 2: Platform-Specific Interceptor (Week 2)
- Implement OfflineInterceptor in @blue/platform-web
- Integrate with existing platform detection mechanisms

### Phase 3: Service Enhancements (Week 3)
- Implement ServiceRegistry in @blue/service
- Add TelemetryHooks integration
- Implement RequestIdCorrelation in @blue/service

### Phase 4: Testing & Validation (Week 4)
- Comprehensive unit testing
- Integration testing with existing services
- Performance benchmarking
- Documentation and examples

## Migration Considerations

### Legacy Code Porting
- Extract functionality from `header.legacy.js`, `error.legacy.js`, `cache.legacy.js`, `status.legacy.js`, and `offline.legacy.js`
- Maintain backward compatibility where possible
- Update tests to cover new implementations

### Breaking Changes
- Existing service interceptors may need refactoring to use new patterns
- Configuration options may change to align with new interceptor system
- API signatures for telemetry hooks may differ from legacy versions

## Dependencies

### Required Packages
- `@blue/http` - Core HTTP client and interceptor infrastructure
- `@blue/platform-web` - Browser-specific functionality for offline detection
- `@blue/service` - Service layer enhancements
- `@blue/telemetry` - Telemetry integration

### External Dependencies
- `uuid` - For generating request IDs
- `lru-cache` - For cache implementation (if not using built-in solution)

## Risk Mitigation

### Technical Risks
- **Cache Invalidation**: Implement comprehensive cache invalidation strategies
- **Error Handling**: Ensure all error paths are properly handled and logged
- **Performance Impact**: Profile interceptors to ensure minimal overhead

### Compatibility Risks
- **Legacy Behavior**: Maintain backward compatibility where possible
- **Configuration Changes**: Provide migration paths for existing configurations
- **API Breaking Changes**: Document breaking changes clearly in migration guide

## Acceptance Criteria

1. All legacy interceptor functionality is ported and working
2. New interceptors integrate seamlessly with existing HTTP client
3. Service registry provides reliable token-to-endpoint mapping
4. Telemetry hooks properly correlate service calls with telemetry data
5. Request ID correlation works across service boundaries
6. All tests pass with 90%+ code coverage
7. Performance impact is within acceptable thresholds
8. Documentation and examples are provided for all new features
