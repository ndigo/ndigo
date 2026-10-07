/**
 * The lab's unit of instrumented work — the middle of the
 * browser-action → server-span → scheduled-task journey.
 *
 * `compute` is decorated twice, which is the whole point of the demo:
 *
 * - `@traced('lab.work.compute')` opens a span for the call. When a browser
 *   request drove it, that span nests under the request's SERVER span
 *   (`HTTPServer.handleRequest`) and therefore shares the client's trace id.
 *   When the scheduler drove it, the span is a root span.
 * - `@counted('telemetry-lab.work.requests')` records an OpenTelemetry
 *   counter per call (the push view); the aggregator tally (the pull view
 *   behind `GET /metrics`) is written by {@link LabMetrics}.
 *
 * The computation itself is deterministic on purpose: the checksum is a pure
 * function of the payload, so every assertion and transcript is reproducible.
 *
 * @module blue-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
import { counted, traced } from '@blue/telemetry';
import type { LabMetrics } from './lab-metrics';

/**
 * One completed unit of work.
 */
export interface WorkOutcome {
    /** Units of work the payload was multiplied by. */
    readonly units: number;
    /** Deterministic checksum of the payload, scaled by `units`. */
    readonly checksum: number;
    /** Wall-clock duration of the computation, in milliseconds. */
    readonly durationMs: number;
}

/**
 * Deterministic payload checksum (FNV-1a over UTF-16 code units, fixed
 * modulus so the number stays small and stable across platforms).
 *
 * @param text - The payload to hash.
 * @returns The checksum.
 */
export function checksumOf(text: string): number {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash % 1_000_000_007;
}

/**
 * The instrumented work service — one span + one counter per call.
 */
export class WorkService {
    readonly #metrics: LabMetrics;

    /**
     * @param metrics - The lab's counter surface (pull view mirror).
     */
    constructor(metrics: LabMetrics) {
        this.#metrics = metrics;
    }

    /**
     * Computes a deterministic checksum over `payload`, scaled by `units`.
     * `units` is clamped to `[1, 1000]` so a hostile caller cannot pin the CPU.
     *
     * @param payload - The text to checksum.
     * @param units - The work multiplier.
     * @returns The outcome, with the observed duration.
     */
    @counted('telemetry-lab.work.requests')
    @traced('lab.work.compute')
    compute(payload: string, units = 1): WorkOutcome {
        const startedAt = performance.now();
        const bounded = Math.min(Math.max(Math.trunc(units) || 1, 1), 1000);
        // Busy-loop for `bounded` rounds: a real (if cheap) unit of work, so
        // the exported span duration and the recorded duration measure
        // something rather than a no-op.
        let checksum = checksumOf(payload);
        for (let round = 0; round < bounded; round += 1) {
            checksum = (checksum + checksumOf(`${payload}:${round}`)) % 1_000_000_007;
        }

        const durationMs = Number((performance.now() - startedAt).toFixed(3));
        this.#metrics.increment('work.units', bounded);
        this.#metrics.recordDuration('work.durationMs', durationMs);

        return { units: bounded, checksum, durationMs };
    }
}
