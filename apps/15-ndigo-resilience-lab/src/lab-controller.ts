/**
 * The control plane: set the upstream behaviour, read the lab state, move the
 * clock, reset counters. Everything the lab does is observable and drivable
 * over HTTP — the tests and the README use the same surface a browser would.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { bodyValue, getMapping, parameters, postMapping, queryValue, requestMapping } from '@ndigo/dispatcher';
import { ResponseStatuses } from '@ndigo/http';
import { getErrorMessage } from '@ndigo/util';
import { z } from 'zod';
import { labProblem } from './lab-problem';
import type { ResilienceLab } from './resilience-lab';

/**
 * The `POST /lab/mode` body contract. Every field is optional and numbers are
 * coerced, so the same payload works as JSON (`{"count":2}`) or query string
 * (`?count=2`); ranges are enforced by the simulator, which knows the mode
 * semantics.
 */
const ModeBody = z.object({
    mode: z.string().optional(),
    status: z.coerce.number().optional(),
    count: z.coerce.number().optional(),
    pattern: z.string().optional(),
    delayMs: z.coerce.number().optional(),
});

/** The `POST /lab/clock` body contract. */
const ClockBody = z.object({
    advanceMs: z.coerce.number().optional(),
    reset: z.union([z.boolean(), z.number(), z.string()]).optional(),
});

/**
 * `POST /lab/mode` — put the upstream into a behaviour for subsequent calls.
 * Fields may arrive as a JSON body, as query parameters, or both (body wins):
 *
 * ```text
 * {"mode":"ok"}                      every call succeeds
 * {"mode":"error","status":500}      every call fails with that status
 * {"mode":"fail","count":2}          the next 2 calls fail, then recovery
 * {"mode":"pattern","pattern":"FFS"} outcomes cycle fail, fail, succeed
 * {"mode":"delay","delayMs":250}     every call succeeds after 250 ms
 * ```
 *
 * `GET /lab/state` — the machine-readable lab state (upstream mode, consumer
 * attempts/successes/failures/last errors, breaker state per method, counters).
 *
 * `POST /lab/clock` — `{"advanceMs":2000}` moves every breaker reset window;
 * `{"reset":true}` returns the clock to wall time.
 *
 * `POST /lab/reset` — upstream back to `ok`, counters zeroed, clock reset. The
 * circuit inside `CircuitBreakerInterceptor` is *not* touched: reach its reset
 * window and let a probe close it.
 */
@requestMapping('/lab')
export class LabController {
    readonly #lab: ResilienceLab;

    /**
     * @param lab - The shared lab runtime.
     */
    constructor(lab: ResilienceLab) {
        this.#lab = lab;
    }

    @postMapping('/mode')
    @parameters({
        mode: queryValue('mode'),
        count: queryValue('count'),
        pattern: queryValue('pattern'),
        delayMs: queryValue('delayMs'),
        status: queryValue('status'),
        spec: bodyValue(),
    })
    setMode(
        mode?: string | null,
        count?: string | null,
        pattern?: string | null,
        delayMs?: string | null,
        status?: string | null,
        spec?: unknown
    ) {
        const parsed = ModeBody.safeParse(spec ?? {});
        if (!parsed.success) {
            return labProblem({
                status: ResponseStatuses.BAD_REQUEST,
                title: 'Bad Request',
                detail: parsed.error.issues.map((issue) => issue.message).join(', '),
                extensions: { error: 'invalid_body' },
            });
        }
        const body = parsed.data;
        try {
            const applied = this.#lab.setMode({
                mode: body.mode ?? mode,
                count: body.count ?? count,
                pattern: body.pattern ?? pattern,
                delayMs: body.delayMs ?? delayMs,
                status: body.status ?? status,
            });
            return { applied, note: 'applies from the next upstream request; counters keep accumulating' };
        } catch (error) {
            return labProblem({
                status: ResponseStatuses.BAD_REQUEST,
                title: 'Bad Request',
                detail: getErrorMessage(error),
                extensions: { error: 'invalid_mode' },
            });
        }
    }

    @getMapping('/state')
    state() {
        return this.#lab.snapshot();
    }

    @postMapping('/clock')
    @parameters({ advanceMs: queryValue('advanceMs'), reset: queryValue('reset'), spec: bodyValue() })
    advanceClock(advanceMs?: string | null, reset?: string | null, spec?: unknown) {
        const parsed = ClockBody.safeParse(spec ?? {});
        if (!parsed.success) {
            return labProblem({
                status: ResponseStatuses.BAD_REQUEST,
                title: 'Bad Request',
                detail: parsed.error.issues.map((issue) => issue.message).join(', '),
                extensions: { error: 'invalid_body' },
            });
        }
        const body = parsed.data;
        const advance = body.advanceMs ?? advanceMs;
        const wantedReset = body.reset ?? reset;
        try {
            if (wantedReset === true || wantedReset === 1 || wantedReset === 'true' || wantedReset === '1') {
                this.#lab.clock.reset();
            }
            if (advance !== undefined && advance !== null && advance !== '') {
                this.#lab.advanceClock(Number(advance));
            }
        } catch (error) {
            return labProblem({
                status: ResponseStatuses.BAD_REQUEST,
                title: 'Bad Request',
                detail: getErrorMessage(error),
                extensions: { error: 'invalid_clock' },
            });
        }
        const snapshot = this.#lab.snapshot();
        return { clock: snapshot.clock, circuits: snapshot.circuits };
    }

    @postMapping('/reset')
    reset() {
        return this.#lab.reset();
    }
}
