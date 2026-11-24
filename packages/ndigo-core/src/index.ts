/**
 * Core primitives and contracts for the Ndigo framework.
 *
 * `@ndigo/core` is the foundation other Ndigo packages build on:
 * comparison/equality/serialization contracts, errors, media types, keypath
 * and wildcard conversion, formatting, and the `ConversionService`. Most data
 * structures live in `@ndigo/collections`; the three the kernel builds on
 * (`RingBuffer`, `Deque`, `BoundedCache`) stay here.
 *
 * @example
 * ```ts
 * import { MediaType, createConversionService } from '@ndigo/core';
 *
 * const service = createConversionService();
 * const mt = MediaType.for('application/json');
 * ```
 */

import './_ndigo.js';
import * as MediaTypes from './media-types.js';

export { MediaTypes };
export * from './ring-buffer.js';
export * from './deque.js';
export * from './bounded-cache.js';
export * from './comparable.js';
export * from './constructable.js';
export * from './data-binder.js';
export * from './enumerable.js';
export * from './equatable.js';
export * from './error.js';
export * from './feature-metric-recorder.js';
export * from './iterable.js';
export * from './matchable.js';
export * from './metadata.js';
export * from './annotation.js';
export * from './server-sent-event.js';
export { MediaType, parseMediaType, SpecificityComparator } from './media-type.js';
export * from './null.js';
export * from './path-matcher.js';
export * from './parser.js';
export * from './converter.js';
export * from './formatter.js';
export * from './primitive.js';
export * from './property-value.js';
export * from './serializable.js';
export * from './shared.js';
export * from './conditional.js';
export * from './profile.js';
export * from './profile-expression.js';
export { WildcardExp } from './wildcard-exp.js';
export { getPath, setPath } from './keypath.js';
export { KeypathConverter } from './keypath-converter.js';
export { WildcardConverter } from './wildcard-converter.js';
export type { KeypathToken } from './keypath-converter.js';
export { parseUrlGlob } from './url-glob.js';
export * from './agent-bridge.js';
