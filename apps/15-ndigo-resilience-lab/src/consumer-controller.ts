/**
 * The consumer routes: `/consumer/data` runs the typed client through
 * `@retry` + `@circuitBreaker`, `/consumer/direct` runs the same call with no
 * policy at all, so the two are directly comparable from one control plane.
 * @module ndigo-resilience-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getMapping, requestMapping } from '@ndigo/dispatcher';
import { ResponseStatuses } from '@ndigo/http';
import { ProblemTypes, ResponseEntity } from '@ndigo/platform-node';
import { CircuitOpenError } from '@ndigo/resilience';
import { getErrorMessage } from '@ndigo/util';
import { labProblem } from './lab-problem';
import type { ConsumerPath } from './lab-types';
import type { ResilienceLab } from './resilience-lab';

/**
 * Consumer endpoints. Both answer the same envelope on success:
 *
 * - `200 { ok: true, path, policy, upstreamAttempts, data }`.
 *
 * Failures are RFC 9457 problem documents (AD-10) carrying the same fields as
 * extension members:
 *
 * - `502 { ok: false, …, error: { name, message } }` — the upstream failed and
 *   retries were exhausted (or, on `/consumer/direct`, failed immediately).
 * - `503 { ok: false, failFast: true, …, error: { name: "CircuitOpenError" } }`
 *   — the circuit was open, so the call never reached the upstream.
 */
@requestMapping('/consumer')
export class ConsumerController {
    readonly #lab: ResilienceLab;

    /**
     * @param lab - The shared lab runtime.
     */
    constructor(lab: ResilienceLab) {
        this.#lab = lab;
    }

    /**
     * Policy-advised call.
     *
     * @returns The call envelope described on the class.
     */
    @getMapping('/data')
    async data() {
        return this.#invoke('resilient');
    }

    /**
     * The same call with the policies bypassed.
     *
     * @returns The call envelope described on the class.
     */
    @getMapping('/direct')
    async direct() {
        return this.#invoke('direct');
    }

    async #invoke(path: ConsumerPath) {
        const lab = this.#lab;
        const policy = path === 'resilient' ? 'retry+circuitBreaker' : 'none';
        const before = lab.upstreamAttempts();
        const startedAt = Date.now();

        try {
            const data = path === 'resilient' ? await lab.client.data() : await lab.client.direct();
            const upstreamAttempts = lab.upstreamAttempts() - before;
            lab.recordConsumerCall(path, { ok: true, attempts: upstreamAttempts }, Date.now() - startedAt);
            return new ResponseEntity({ ok: true, path, policy, upstreamAttempts, data }, ResponseStatuses.OK);
        } catch (error) {
            const upstreamAttempts = lab.upstreamAttempts() - before;
            const failFast = error instanceof CircuitOpenError;
            const name = failFast ? 'CircuitOpenError' : error instanceof Error ? error.constructor.name : 'Error';
            const message = getErrorMessage(error);
            lab.recordConsumerCall(
                path,
                { ok: false, attempts: upstreamAttempts, error: { name, message } },
                Date.now() - startedAt
            );
            return labProblem({
                status: failFast ? ResponseStatuses.SERVICE_UNAVAILABLE : ResponseStatuses.BAD_GATEWAY,
                type: failFast ? ProblemTypes.serviceUnavailable : undefined,
                title: failFast ? 'Service Unavailable' : 'Bad Gateway',
                detail: message,
                extensions: { ok: false, path, policy, failFast, upstreamAttempts, error: { name, message } },
            });
        }
    }
}
