/**
 * Public API of `@ndigo/view` — view resolution, targets, and renderers.
 *
 * Provides view resolution, view targets, and renderer contracts for
 * content-negotiated responses.
 */
export * from './view.js';
export * from './view-mapping.js';
export * from './view-resolver.js';
export * from './view-target.js';
export * from './view-targeter.js';
export * from './producer-view.js';
export * from './abstract-serializing-view.js';
export * from './json-view.js';
export * from './a2ui-view.js';
export * from './text-view.js';
export * from './csv-view.js';
export * from './octet-stream-view.js';
export * from './content-negotiation-view-resolver.js';
export * from './not-acceptable-error.js';
// Explicit, not `export *`: `customElementNamePattern` is resolver-internal
// (only `IslandViewResolver` uses the raw regex); consumers get the
// `isValidCustomElementName` predicate instead.
export { serializeModel, parseModel, isValidCustomElementName, IslandView } from './island-view.js';
export type { IslandViewOptions } from './island-view.js';
export * from './island-view-resolver.js';
export * from './like-view.js';
