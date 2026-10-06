/**
 * Blue integration test harness — MockHTTP-style in-process dispatch.
 * @module blue-test
 * @since 1.0.0
 * @author Jeff Rose
 */
export { MockHTTP, MockHTTPRequestBuilder } from './mock-http';
export type { MockRequest, PreparedRoute } from './request-builder';
export { buildRoute } from './request-builder';
export { createMemoryResponse } from './memory-response';
export type { MemoryResponse, ResponseSink } from './memory-response';
export { bootApp, cachedBootApp, releaseCachedApp } from './blue-test';
export type { BlueTestApp } from './blue-test';
export { bootBrowserApp, BrowserMockClient } from './browser-mock-client';
export type { BrowserTestApp } from './browser-mock-client';
export { MemoryViewTarget } from './memory-view-target';
export type { CapturedRender } from './memory-view-target';
