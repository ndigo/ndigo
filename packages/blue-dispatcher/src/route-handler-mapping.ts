/**
 * @author Jeff Rose
 *
 * Barrel file — re-exports all public types from the split handler-mapping modules.
 * Module-level constants used by multiple split files live here.
 */

export * from './abstract-handler-mapping';
export * from './abstract-handler-method-mapping';
export * from './abstract-path-handler-mapping';
export * from './name-path-handler-mapping';
export * from './linear-metadata-handler-mapping';
export * from './simple-path-handler-mapping';
export * from './route-match-result';

export { doesNotStartWithSlash, kindOf, resolveHandlerWithContext } from './_shared';
