/**
 * The lab's composition root: one shared `ResilienceLab` (upstream simulator +
 * clock + intercepted client) handed to every controller, so the control plane
 * and the consumer routes always observe the same state.
 */
import '@tsmetadata/polyfill';
import { configuration, entry, getEnv } from '@ndigo/context';
import { ConsumerController } from './consumer-controller';
import { LabController } from './lab-controller';
import { ResilienceLab, RESILIENCE_LAB } from './resilience-lab';
import { UpstreamController } from './upstream-controller';

/**
 * Wires the lab runtime and its three controllers.
 *
 * The lab entry is created once (a field, not per entry call) and returned both
 * from the `RESILIENCE_LAB` entry and to each controller constructor: the
 * container registers exactly one instance, and `context.getValue(RESILIENCE_LAB)`
 * hands out that same one.
 */
@configuration
export class ResilienceLabConfiguration {
    readonly #lab = new ResilienceLab(getEnv('PORT') ?? '3080');

    /** The lab runtime, addressable as `context.getValue(RESILIENCE_LAB)`. */
    @entry(RESILIENCE_LAB)
    resilienceLab() {
        return this.#lab;
    }

    /** `GET /upstream/data` — the controllable flaky upstream. */
    @entry()
    upstreamController() {
        return new UpstreamController(this.#lab);
    }

    /** `GET /consumer/data` and `GET /consumer/direct`. */
    @entry()
    consumerController() {
        return new ConsumerController(this.#lab);
    }

    /** `POST /lab/mode`, `GET /lab/state`, `POST /lab/clock`, `POST /lab/reset`. */
    @entry()
    labController() {
        return new LabController(this.#lab);
    }
}
