/**
 * Timing helpers for specs — re-exported from `@blue/util`.
 *
 * The implementation lives in the `@blue/util` leaf (the harness's own
 * dependency graph must stay acyclic); this module is the harness-facing
 * entry point so `@blue/test` consumers get the shared helpers in one place.
 *
 * @module blue-test
 * @since 1.0.0
 * @author Jeff Rose
 */
export { delay } from '@blue/util';
