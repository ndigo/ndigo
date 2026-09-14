/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix

// Barrel: `http.ts` is the public module re-exported by the @blue/http index.
// The HTTP client, execution chain, interceptor contract, and shared settings
// were split into cohesive modules; this file re-exports the exact original
// public API so consumers and interceptor files importing '../http' are
// unaffected.

export type {
    HTTPMethod,
    HTTPInit,
    HTTPConfig,
    Fetch,
    CompletionAwareHTTPInterceptor,
    ErrorAwareHTTPInterceptor,
    InitializationAwareHTTPInterceptor,
    RequestAwareHTTPInterceptor,
    ResponseAwareHTTPInterceptor,
    HTTPInterceptor,
    HTTPAware,
} from './http-types';
export {
    likeCompletionAwareHTTPInterceptor,
    likeErrorAwareHTTPInterceptor,
    likeInitializationAwareHTTPInterceptor,
    likeRequestAwareHTTPInterceptor,
    likeResponseAwareHTTPInterceptor,
    likeHTTPInterceptor,
} from './http-interceptor-guards';
export { assign, freeze, defineProperty, defaults, patternCache, isRequest } from './http-shared';
export { WildcardMatcher, MappedHTTPInterceptor } from './http-mapped-interceptor';
export { HTTPExecutionChain } from './http-execution-chain';
export { HTTP } from './http-client';
