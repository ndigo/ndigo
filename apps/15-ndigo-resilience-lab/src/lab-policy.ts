/**
 * The lab's fixed policy settings — the numbers the README, the control plane
 * and the tests all quote. Kept small and deterministic on purpose: three retry
 * attempts, three consecutive failures to open a circuit, and a 1.5 s reset
 * window the control-plane clock can advance instantly.
 */
import { exponentialBackoff } from '@ndigo/resilience';

/** The `@service` name the consumer presents to the upstream. */
export const LAB_SERVICE_NAME = 'upstream-lab';

/** The telemetry feature every counter and duration is recorded under. */
export const LAB_FEATURE = 'resilience-lab';

/**
 * The service's *logical* origin. The lab's transport maps it onto the real
 * loopback listener when the process runs, and onto the in-process dispatcher
 * in tests — so the service contract never depends on how it is hosted.
 */
export const UPSTREAM_ORIGIN = 'http://upstream-lab.local';

/** Total call attempts per `@retry`ed invocation (the first attempt included). */
export const LAB_RETRY_ATTEMPTS = 3;

/** Backoff between retry attempts: 25 ms, 50 ms, capped at 200 ms. */
export const LAB_BACKOFF = exponentialBackoff({ initialMs: 25, factor: 2, maxMs: 200 });

/** Human-readable backoff description for `/lab/state` and the README. */
export const LAB_BACKOFF_LABEL = 'exponentialBackoff(initialMs=25, factor=2, maxMs=200)';

/** Consecutive failing chain passes that open the circuit. */
export const LAB_FAILURE_THRESHOLD = 3;

/** Milliseconds the circuit stays open before the next call becomes a probe. */
export const LAB_RESET_MS = 1500;
