/**
 * HTTP client with interceptor support and convenience verb helpers.
 *
 * Public API of `@ndigo/http`: the `HTTP` client, header value objects,
 * interceptors, status codes, and execution chain.
 *
 * @example
 * ```ts
 * import { HTTP } from '@ndigo/http';
 * const http = new HTTP([], { baseURL: '/api' });
 * ```
 */

import * as HTTPHeaders from './http-headers';
import * as ResponseStatuses from './response-statuses';
import ResponseStatus from './response-status';

export * from './http';
export * from './http-header';
export * from './authorization-header';
export * from './content-type-header';
export * from './set-cookie-header';
export * from './interceptors';
export { ResponseStatus };
export { ResponseStatuses };
export * from './problem-types';
export * from './transformers';
export * from './http-headers';
export { HTTPHeaders };
export { default as QueryString } from './query-string';
export { default as MatrixString } from './matrix-string';
export * from './context-tokens';
export { AsHTTPAware, likeHTTPAware, type HTTPAware } from './http-client';
