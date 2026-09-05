/**
 * @blue/telemetry — isomorphic telemetry core.
 *
 * API-only: logger, metrics, severity, tracing decorators, and platform-free
 * instrumentation bases. Installing/importing this package pulls no Node SDK
 * exporters and no browser SDK.
 *
 * Platform setup lives in sibling packages:
 * - `@blue/telemetry-node` — NodeSDK config + Node platform instrumentations
 * - `@blue/telemetry-web` — browser config + web instrumentations
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
