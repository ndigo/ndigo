/**
 * The simulated upstream endpoint: every response is produced by the lab's
 * behaviour engine, so the control plane decides what the consumer sees.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getMapping, requestMapping } from '@ndigo/dispatcher';
import { ResponseStatus, ResponseStatuses } from '@ndigo/http';
import { labProblem } from './lab-problem';
import type { ResilienceLab } from './resilience-lab';

/**
 * `GET /upstream/data` — a `200` with `{ value, servedAt, mode }` while the
 * active mode succeeds, otherwise the configured failure status with an
 * `{ error, mode, upstreamStatus }` problem document.
 */
@requestMapping('/upstream')
export class UpstreamController {
    readonly #lab: ResilienceLab;

    /**
     * @param lab - The shared lab runtime.
     */
    constructor(lab: ResilienceLab) {
        this.#lab = lab;
    }

    /**
     * Serves one simulated upstream call.
     *
     * @returns The simulated body, or the failure problem document.
     */
    @getMapping('/data')
    async data() {
        const outcome = await this.#lab.serveUpstream();
        if (outcome.ok) {
            return outcome.body;
        }
        const mode = String(outcome.body['mode']);
        return labProblem({
            status:
                ResponseStatus.for(outcome.status, 'Simulated Upstream Failure') ??
                ResponseStatuses.SERVICE_UNAVAILABLE,
            title: 'Simulated Upstream Failure',
            detail: `the upstream was in '${mode}' mode and answered ${outcome.status}`,
            extensions: { error: 'upstream_failure', mode, upstreamStatus: outcome.status },
        });
    }
}
