/**
 * Blue integration test harness — MockMvc-style in-process dispatch.
 *
 * @module
 */

export { MockMvc, MockMvcRequestBuilder } from './mock-mvc';
export type { MockRequest, PreparedRoute } from './request-builder';
export { buildRoute } from './request-builder';
export { createMemoryResponse } from './memory-response';
export type { MemoryResponse, ResponseSink } from './memory-response';
export { bootApp } from './blue-test';
export type { BlueTestApp } from './blue-test';