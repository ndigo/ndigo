/**
 * Trace decorators, execution, and correlation helpers.
 */
export * from './annotations';
export * from './interceptor';
export { currentTraceContext } from './correlation';
export type { TraceCorrelation } from './correlation';
