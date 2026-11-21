/**
 * Task scheduler contracts.
 */
import { like } from '@ndigo/util/types';
import { type LockDriver } from '@ndigo/locks';
import type { Schedule } from './schedule';
import type { TaskScheduler } from './task-scheduler';

export interface ScheduledTaskDefinition {
    /**
     * Unique task name (used in diagnostics and stats).
     */
    readonly name: string;
    /**
     * The schedule deciding when the task fires.
     */
    readonly schedule: Schedule;
    /**
     * Optional cap: when a run exceeds this duration the single-flight slot
     * is released and a warning is emitted. The task itself is not
     * cancelled — Node has no preemptive cancellation.
     */
    readonly maxRunTimeMs?: number;
    /**
     * Distributed lock key: the scheduler acquires the named lock
     * before each run and releases it after (finally-style), so only one
     * node executes this task at a time.
     */
    readonly lockKey?: string;
    /**
     * How long to wait for a contended lock before skipping the fire
     * (ms; `0`/absent = skip immediately on contention).
     */
    readonly lockWaitMs?: number;
    /**
     * Poll interval while waiting for a contended lock (ms).
     */
    readonly lockWaitStepMs?: number;
    /**
     * Lock lease duration (ms). Must cover the whole run — a lease that
     * lapses mid-run lets another node take over (at-least-once posture).
     */
    readonly lockTtlMs?: number;
    /**
     * Executes the task once.
     */
    run(): void | Promise<void>;
}

/**
 * Options for constructing a {@link TaskScheduler}.
 */
export interface TaskSchedulerOptions {
    /**
     * Injectable clock; defaults to the system clock. Used for all
     * bookkeeping (next-fire anchors, completion times).
     */
    clock?: () => Date;
    /**
     * Warning sink (e.g. `maxRunTime` violations); defaults to the
     * `ndigo-scheduler:task-scheduler` `@ndigo/log` warning channel.
     */
    warn?: (message: string) => void;
    /**
     * The distributed lock driver for `@scheduled({ lock })` tasks
     *. `undefined` (default) resolves the `lockDriver` entry from
     * the injected application context; pass `null` to leave locked tasks
     * failing loudly when no entry exists.
     */
    lockDriver?: LockDriver | null;
}

/**
 * Observable statistics for a registered task.
 */
export interface TaskStats {
    /**
     * Runs started.
     */
    readonly runs: number;
    /**
     * Runs that threw (exceptions are isolated per run).
     */
    readonly failures: number;
    /**
     * Whether the previous run is still in flight (single-flight — the next
     * tick skips while this is set).
     */
    readonly inFlight: boolean;
    /**
     * When the most recent run started, if any.
     */
    readonly lastStartedAt: Date | null;
    /**
     * The most recent run error, if any.
     */
    readonly lastError: Error | null;
}

export interface TaskState {
    /** The task definition. */
    readonly definition: ScheduledTaskDefinition;
    /** Whether a run is currently in flight. */
    inFlight: boolean;
    /** The next scheduled run time, or null when none. */
    nextRunAt: Date | null;
    /** The number of runs completed. */
    runs: number;
    /** The number of failed runs. */
    failures: number;
    /** The last error, or null when none. */
    lastError: Error | null;
    /** When the last run started, or null. */
    lastStartedAt: Date | null;
    /** When the last run completed, or null. */
    lastCompletedAt: Date | null;
}

/**
 * Largest delay `setTimeout` accepts — beyond this Node fires the timer
 * after ~1ms instead, which would turn far-future schedules into a busy
 * re-arm loop. The engine caps at this and lets the early wake re-arm.
 */

export const likeTaskScheduler = like({
    register: Function,
    tick: Function,
    start: Function,
    stop: Function,
}) as (value: unknown) => value is TaskScheduler;

/**
 * The task-execution engine: next-fire tracking, single-flight runs, error
 * isolation, `maxRunTime` races, and drain on destroy.
 *
 * The engine is driven two ways:
 * - `tick(now)` — deterministic, testable, and suited to an application
 *   loop: fires every due task and awaits the runs it started.
 * - `start()`/`stop()` — a wall-clock timer chain that calls `tick` at each
 *   computed next-fire time (fire-and-forget; single-flight guards overlap).
 */
