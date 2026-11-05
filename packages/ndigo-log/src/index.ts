/**
 * Isomorphic logging core for Ndigo: logger abstraction, factory, and
 * severity mappings. Depends only on the OpenTelemetry API packages so that
 * low-level framework code can log without pulling in the telemetry stack.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
export * from './logger/index.js';
export * from './severity/index.js';
