/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Cron } from 'croner';
import { FrameworkError } from '@ndigo/core';
import { getErrorMessage } from '@ndigo/util';
import { NormalizedScheduledSpec } from './spec';

/**
 * A schedule's trigger kind. The engine anchors interval bookkeeping
 * differently per kind (start-anchored rate, end-anchored delay, and pure
 * time-sequence cron).
 */
export type ScheduleKind = 'cron' | 'fixedRate' | 'fixedDelay';

/**
 * A stateless schedule: given a reference event, when does it fire next?
 *
 * The engine passes the current time when establishing the next fire and the
 * relevant anchor afterwards — the fire time for cron and fixed-rate, the
 * completion time for fixed-delay. `next()` must return a time strictly
 * after the reference (or `null` when it never fires again).
 */
export interface Schedule {
    /**
     * The trigger kind (drives engine bookkeeping).
     */
    readonly kind: ScheduleKind;
    /**
     * The interval in milliseconds — set for `fixedRate`/`fixedDelay`
     * schedules, `undefined` for cron.
     */
    readonly intervalMs: number | undefined;
    /**
     * Computes the next fire time after the reference event.
     *
     * @param after - The reference event time.
     * @returns The next fire time, or `null` when the schedule never fires
     *   again (after this reference).
     */
    next(after: Date): Date | null;
}

/**
 * A cron-expression schedule (croner syntax — 5, 6, or 7 fields
 * auto-detected, optional time zone).
 *
 * Stateless: cron fires at the expression's time sequence, independent of
 * run duration. Construction validates the expression (croner throws on
 * malformed patterns); time-zone validity is enforced earlier by the
 * `@scheduled` decorator's `Intl` probe.
 */
export class CronSchedule implements Schedule {
    /**
     * The schedule kind — always `cron`.
     */
    readonly kind: ScheduleKind = 'cron';

    /**
     * No interval — cron fires per its expression.
     */
    readonly intervalMs: number | undefined = undefined;

    readonly #cron: Cron;

    /**
     * Creates a cron schedule.
     *
     * @param expression - The cron expression.
     * @param timeZone - Optional IANA time zone the expression is evaluated
     *   in; when omitted the schedule uses the **system time zone** (pass an
     *   explicit zone for deterministic behavior).
     * @throws {TypeError} When the expression does not parse.
     */
    constructor(expression: string, timeZone?: string) {
        try {
            this.#cron = new Cron(expression, timeZone === undefined ? undefined : { timezone: timeZone });
        } catch (error) {
            throw new TypeError(`CronSchedule: invalid cron expression '${expression}' — ${getErrorMessage(error)}`, {
                cause: error,
            });
        }
    }

    /**
     * Computes the next fire time after the reference.
     *
     * @param after - The reference event time.
     * @returns The next cron fire, or `null` when the pattern never fires
     *   again (e.g. Feb 30 past the reference).
     */
    next(after: Date): Date | null {
        return this.#cron.nextRun(after) ?? null;
    }
}

/**
 * A fixed-interval schedule: every `intervalMs` from an anchor.
 *
 * The anchor depends on the kind — `fixedRate` anchors at run start,
 * `fixedDelay` at run completion — which the engine applies; this schedule
 * only answers "the anchor plus the interval".
 */
export class IntervalSchedule implements Schedule {
    /**
     * The trigger kind — `fixedRate` or `fixedDelay`.
     */
    readonly kind: ScheduleKind;

    /**
     * The interval in milliseconds.
     */
    readonly intervalMs: number;

    /**
     * Creates an interval schedule.
     *
     * @param kind - `fixedRate` (start-anchored) or `fixedDelay`
     *   (end-anchored).
     * @param intervalMs - The interval in milliseconds; must be positive.
     * @throws {TypeError} When the interval is not positive.
     */
    constructor(kind: 'fixedRate' | 'fixedDelay', intervalMs: number) {
        if (typeof intervalMs !== 'number' || !Number.isFinite(intervalMs) || intervalMs <= 0) {
            throw new TypeError(`IntervalSchedule: intervalMs must be a positive number, got ${String(intervalMs)}`);
        }
        this.kind = kind;
        this.intervalMs = intervalMs;
    }

    /**
     * Computes the next fire time: the reference plus the interval.
     *
     * @param after - The anchor event time (run start or completion).
     * @returns The next fire time.
     */
    next(after: Date): Date | null {
        return new Date(after.getTime() + this.intervalMs);
    }
}

/**
 * Builds the {@link Schedule} for a normalized schedule spec.
 *
 * @param spec - The normalized spec produced by `@scheduled`.
 * @returns The schedule implementation for the spec's trigger.
 * @throws {FrameworkError} When the spec has no trigger — it should have
 *   been rejected at decoration time; this is defense in depth.
 */
export function scheduleFromSpec(spec: NormalizedScheduledSpec): Schedule {
    if (spec.cron !== undefined) {
        return new CronSchedule(spec.cron, spec.timeZone);
    }
    if (spec.fixedRateMs !== undefined) {
        return new IntervalSchedule('fixedRate', spec.fixedRateMs);
    }
    if (spec.fixedDelayMs !== undefined) {
        return new IntervalSchedule('fixedDelay', spec.fixedDelayMs);
    }
    throw new FrameworkError('scheduleFromSpec: spec has no trigger — expected cron, fixedRate, or fixedDelay');
}
