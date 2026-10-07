/**
 * The instrumented HTTP surface: `GET /work` and `POST /work`.
 *
 * Both handlers answer with the same envelope, and both echo the trace context
 * they ran under (`currentTraceContext()`): with the server instrumentation
 * enabled the handler executes inside the request's SERVER span, so a browser
 * that propagated its own span as `traceparent` sees its **own** trace id come
 * back — the continuation, visible in one response body.
 *
 * @module blue-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { bodyValue, getMapping, parameters, postMapping, queryValue, requestMapping } from '@blue/dispatcher';
import { ResponseStatuses } from '@blue/http';
import { ResponseEntity } from '@blue/platform-node';
import { currentTraceContext } from '@blue/telemetry';
import { z } from 'zod';
import type { LabMetrics } from './lab-metrics';
import type { LabTicker } from './lab-ticker';
import type { WorkService } from './work-service';

/**
 * The `POST /work` body contract. Both fields are optional — the lab is about
 * telemetry, not validation — but the ranges keep a hostile payload from
 * pinning the CPU (the service clamps `units` too).
 */
const WorkBodySchema = z.object({
    payload: z.string().min(1).max(200).optional(),
    units: z.coerce.number().int().positive().max(1000).optional(),
});

/**
 * The shared success envelope both work routes answer with.
 */
export interface WorkResponse {
    readonly ok: true;
    readonly route: string;
    readonly payload: string;
    readonly units: number;
    readonly checksum: number;
    readonly durationMs: number;
    /** The trace context the handler ran under, or `null` without instrumentation. */
    readonly trace: { readonly traceId: string; readonly spanId: string } | null;
    /** How many scheduled ticks had run when the request was served. */
    readonly ticks: number;
}

/**
 * Serves the lab's instrumented work routes.
 */
@requestMapping('/')
export class WorkController {
    readonly #metrics: LabMetrics;
    readonly #work: WorkService;
    readonly #ticker: LabTicker;

    /**
     * @param metrics - The lab's counter surface.
     * @param work - The instrumented work service.
     * @param ticker - Read for the tick count in the response.
     */
    constructor(metrics: LabMetrics, work: WorkService, ticker: LabTicker) {
        this.#metrics = metrics;
        this.#work = work;
        this.#ticker = ticker;
    }

    /**
     * `GET /work?payload=blue&units=1` — instrumented work with query
     * parameters.
     *
     * @param payload - The text to checksum (default `blue`).
     * @param units - The work multiplier (default `1`).
     * @returns The work envelope.
     */
    @getMapping('/work')
    @parameters({ payload: queryValue('payload'), units: queryValue('units') })
    getWork(payload?: string | null, units?: string | null): WorkResponse {
        return this.#run('GET /work', payload ?? 'blue', Number(units ?? '1'));
    }

    /**
     * `POST /work` with a JSON body (`{"payload":"…","units":2}`) — the route
     * the browser page drives.
     *
     * @param spec - The bound JSON body.
     * @returns The work envelope, or a `400` problem document.
     */
    @postMapping('/work')
    @parameters({ spec: bodyValue() })
    postWork(spec?: unknown): WorkResponse | ResponseEntity<Record<string, unknown>> {
        const parsed = WorkBodySchema.safeParse(spec ?? {});
        if (!parsed.success) {
            return new ResponseEntity(
                {
                    status: ResponseStatuses.BAD_REQUEST.code,
                    title: 'Bad Request',
                    detail: parsed.error.issues.map((issue) => issue.message).join(', '),
                    error: 'invalid_body',
                },
                ResponseStatuses.BAD_REQUEST
            );
        }
        return this.#run('POST /work', parsed.data.payload ?? 'blue', parsed.data.units ?? 1);
    }

    /**
     * Runs the work, records the route-specific counter, and assembles the
     * envelope.
     *
     * @param route - The route label used in the envelope and counters.
     * @param payload - The text to checksum.
     * @param units - The work multiplier.
     * @returns The work envelope.
     */
    #run(route: string, payload: string, units: number): WorkResponse {
        this.#metrics.increment(`work.requests.${route.split(' ')[0]?.toLowerCase() ?? 'unknown'}`);
        const outcome = this.#work.compute(payload, units);
        return {
            ok: true,
            route,
            payload,
            units: outcome.units,
            checksum: outcome.checksum,
            durationMs: outcome.durationMs,
            trace: currentTraceContext() ?? null,
            ticks: this.#ticker.ticks,
        };
    }
}
