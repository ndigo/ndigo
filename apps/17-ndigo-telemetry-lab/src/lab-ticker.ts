/**
 * The lab's `@scheduled` task — the server-side half of the observability
 * journey.
 *
 * `tick` is decorated three times:
 *
 * - `@scheduled` with the every-five-seconds cron registers it with the scheduler
 *   auto-discovery (`ScheduleRegistry`) — zero wiring on a registered bean
 *   (AD-20, guides 05).
 * - `@counted('telemetry-lab.scheduled.ticks')` records one OpenTelemetry
 *   counter per run (push view).
 * - `@traced('lab.ticker.tick')` opens a root span per run (the task runs
 *   outside any request context), with the nested `lab.work.compute` span
 *   underneath.
 *
 * `tick()` is a plain method: the scheduler calls it on a timer, and tests
 * (and the socket push) call it directly — no timers, no sleeping.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { scheduled } from '@ndigo/scheduler';
import { counted, traced } from '@ndigo/telemetry';
import { getLogger } from '@ndigo/log';
import type { LabMetrics } from './lab-metrics';
import type { WorkOutcome, WorkService } from './work-service';

const logger = getLogger('ndigo-telemetry-lab:ticker');

/** The cron the lab's ticker runs on (every 5 seconds). */
export const TICK_CRON = '*/5 * * * * *';

/**
 * Emits one span pair and two counter increments per run.
 */
export class LabTicker {
    #ticks = 0;
    readonly #metrics: LabMetrics;
    readonly #work: WorkService;

    /**
     * @param metrics - The lab's counter surface (pull view mirror).
     * @param work - The instrumented work service each tick exercises.
     */
    constructor(metrics: LabMetrics, work: WorkService) {
        this.#metrics = metrics;
        this.#work = work;
    }

    /** How many ticks have run since boot — the health/state probe value. */
    get ticks(): number {
        return this.#ticks;
    }

    /**
     * One tick: a nested span pair, a counter increment in both metric views,
     * a duration sample, and a log line (which the configured log exporter
     * ships, correlated by trace id when logging is context-aware).
     *
     * @returns The work outcome, so callers can assert on the run.
     */
    @scheduled(TICK_CRON)
    @counted('telemetry-lab.scheduled.ticks')
    @traced('lab.ticker.tick')
    tick(): WorkOutcome {
        this.#ticks += 1;
        const outcome = this.#work.compute(`tick-${this.#ticks}`, 1);
        this.#metrics.increment('scheduled.ticks');
        this.#metrics.setGauge('scheduled.ticks.total', this.#ticks);
        logger.info(`tick #${this.#ticks} — checksum ${outcome.checksum} in ${outcome.durationMs}ms`);
        return outcome;
    }
}
