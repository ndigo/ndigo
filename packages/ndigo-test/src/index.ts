/**
 * Ndigo integration test harness — MockHTTP-style in-process dispatch.
 * @module ndigo-test
 * @since 1.0.0
 * @author Jeff Rose
 */
export { MockHTTP, MockHTTPRequestBuilder } from './mock-http';
export type { MockRequest, PreparedRoute } from './request-builder';
export { buildRoute } from './request-builder';
export { createMemoryResponse } from './memory-response';
export type { MemoryResponse, ResponseSink } from './memory-response';
export { bootApp, cachedBootApp, releaseCachedApp } from './ndigo-test';
export type { NdigoTestApp } from './ndigo-test';
export { bootBrowserApp, BrowserMockClient } from './browser-mock-client';
export type { BrowserTestApp } from './browser-mock-client';
export { MemoryViewTarget } from './memory-view-target';
export type { CapturedRender } from './memory-view-target';
export { delay, installSynchronousAnimationFrames } from './timing';
