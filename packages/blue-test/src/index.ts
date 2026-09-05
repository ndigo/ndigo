/**
 * Blue integration test harness — MockMVC-style in-process dispatch.
 *
 * @module
 */

export { MockMVC, MockMVCRequestBuilder } from './mock-mvc';
export type { MockRequest, PreparedRoute } from './request-builder';
export { buildRoute } from './request-builder';
export { createMemoryResponse } from './memory-response';
export type { MemoryResponse, ResponseSink } from './memory-response';
export { bootApp, cachedBootApp, releaseCachedApp } from './blue-test';
export type { BlueTestApp } from './blue-test';
export { bootBrowserApp, BrowserMockMVC } from './browser-mock-mvc';
export type { BrowserTestApp } from './browser-mock-mvc';
export { MemoryViewTarget } from './memory-view-target';
export type { CapturedRender } from './memory-view-target';
