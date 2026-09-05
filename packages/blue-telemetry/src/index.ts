/**
 * @blue/telemetry — isomorphic telemetry core.
 *
 * Platform-specific configuration and instrumentations live behind subpath
 * exports so the root import stays platform-free:
 * - `@blue/telemetry/node` — NodeSDK config + node instrumentations
 * - `@blue/telemetry/web` — browser telemetry config + web instrumentations
 *
 * @module
 */

export * from './trace';
export * from './metrics';
export * from './logger';
export * from './severity';

export * from './instrumentation/base';
export * from './instrumentation/context/context';
export * from './instrumentation/dispatcher/dispatcher';
export * from './instrumentation/counted';