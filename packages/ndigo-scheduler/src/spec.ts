/**
 * Schedule specification: duration and cron parsing.
 */

/**
 * A duration: milliseconds, or a compact unit string (`'10s'`, `'5m'`,
 * `'2h'`, `'1d'`).
 */
export type DurationValue = number | string;

const UNIT_MILLIS = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;

const durationPattern = /^(\d+(?:\.\d+)?)(s|m|h|d)$/iu;

/**
 * Parses a {@link DurationValue} into milliseconds.
 *
 * @param value - Milliseconds (number) or a compact unit string.
 * @param label - Field name used in error messages.
 * @param options - When `positive` is set, zero is rejected (used for
 *   intervals, where a zero period can never fire).
 * @returns The duration in milliseconds.
 * @throws When the value is not a finite non-negative number of
 *   milliseconds or a `'10s'`-style string.
 */
export function parseDuration(value: DurationValue, label = 'duration', options: { positive?: boolean } = {}): number {
    if (typeof value === 'number') {
        if (Number.isFinite(value) && value >= 0 && (!options.positive || value > 0)) {
            return value;
        }
        throw new TypeError(
            options.positive && value <= 0
                ? `${label}: expected a positive millisecond value, got ${String(value)}`
                : `${label}: expected a finite non-negative millisecond value, got ${String(value)}`
        );
    }

    const match = durationPattern.exec(value);
    if (!match) {
        throw new TypeError(`${label}: invalid duration '${value}' — use milliseconds or '10s', '5m', '2h', '1d'`);
    }

    const milliseconds = Math.round(Number(match[1]) * UNIT_MILLIS[match[2].toLowerCase() as keyof typeof UNIT_MILLIS]);
    if (options.positive && milliseconds <= 0) {
        throw new TypeError(`${label}: expected a positive duration, got '${value}'`);
    }
    return milliseconds;
}

/**
 * A cron trigger with optional time zone and run-time cap.
 */
export interface CronScheduleSpec {
    /**
     * Cron expression (croner syntax — 5, 6, or 7 fields auto-detected).
     */
    cron: string;
    /**
     * IANA time-zone identifier the schedule is evaluated in.
     */
    timeZone?: string;
    /**
     * Caps a run: the single-flight lock is released and a warning logged
     * when a run exceeds this duration (the task itself is not cancelled).
     */
    maxRunTime?: DurationValue;
    /**
     * Distributed lock key (AD-73): the runner acquires the named lock
     * before each run and releases it after (finally-style), so only one
     * node executes this schedule at a time. Requires a `lockDriver` bean
     * (in-process or `@ndigo/redis/locks`).
     */
    lock?: string;
    /**
     * How long the runner waits for a contended lock before skipping the
     * fire. Omitted (default): skip immediately on contention.
     */
    lockWait?: DurationValue;
    /**
     * Poll interval while waiting for a contended lock (default 100 ms).
     */
    lockWaitStep?: DurationValue;
    /**
     * Lease duration for the acquired lock (default 60 s). Must cover the
     * whole run — a lease that lapses mid-run lets another node take over
     * (at-least-once posture, like the job driver).
     */
    lockTtl?: DurationValue;
}

/**
 * An interval trigger — `fixedRate` (period measured from run start) or
 * `fixedDelay` (period measured from run end). Exactly one is required.
 */
export interface IntervalScheduleSpec {
    /**
     * Run every N milliseconds, starting the interval when a run starts.
     */
    fixedRate?: DurationValue;
    /**
     * Run every N milliseconds, starting the interval when a run finishes.
     */
    fixedDelay?: DurationValue;
    /**
     * Caps a run: the single-flight lock is released and a warning logged
     * when a run exceeds this duration (the task itself is not cancelled).
     */
    maxRunTime?: DurationValue;
    /**
     * Distributed lock key (AD-73) — see the cron spec's `lock` for the
     * contract; the two spec forms share the same lock option set.
     */
    lock?: string;
    /** How long to wait for a contended lock before skipping (see cron spec). */
    lockWait?: DurationValue;
    /** Poll interval while waiting for a contended lock (default 100 ms). */
    lockWaitStep?: DurationValue;
    /** Lease duration for the acquired lock (default 60 s). */
    lockTtl?: DurationValue;
}

/**
 * What `@scheduled` accepts: a bare cron string, a cron spec, or an
 * interval spec.
 */
export type ScheduledSpec = string | CronScheduleSpec | IntervalScheduleSpec;

/**
 * The normalized, validated schedule record written into `Symbol.metadata`
 * by `@scheduled` (AD-20 D1).
 */
export interface NormalizedScheduledSpec {
    readonly cron?: string;
    readonly fixedRateMs?: number;
    readonly fixedDelayMs?: number;
    readonly timeZone?: string;
    readonly maxRunTimeMs?: number;
    /** Distributed lock key (AD-73), when the spec declared `lock`. */
    readonly lockKey?: string;
    /** Contended-lock wait budget in milliseconds (`0` = skip immediately). */
    readonly lockWaitMs?: number;
    /** Contended-lock poll interval in milliseconds. */
    readonly lockWaitStepMs?: number;
    /** Lock lease duration in milliseconds. */
    readonly lockTtlMs?: number;
}
