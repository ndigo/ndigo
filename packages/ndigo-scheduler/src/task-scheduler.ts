/**
 */
import { FrameworkError } from '@ndigo/core';
import type { AsyncCloseable, AsyncDestroyable } from '@ndigo/factory';
import { like } from '@ndigo/util/types';
import { LOCK_DRIVER, likeLockDriver, type LockDriver, type LockHandle } from '@ndigo/locks';
import { Schedule } from './schedule';
import { getLogger } from '@ndigo/log';
import type { ApplicationContext } from '@ndigo/context';

const logger = getLogger('ndigo-scheduler:task-scheduler');

/**
 * Default lease duration for `@scheduled({ lock })` acquisitions.
 */
export const DEFAULT_LOCK_TTL_MS = 60_000;

/**
 * Default poll interval while waiting for a contended lock.
 */
export const DEFAULT_LOCK_WAIT_STEP_MS = 100;

/**
 * A runnable scheduled task as registered with {@link TaskScheduler}.
 */
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
     * cancelled — Node has no preemptive cancellation (AD-20 D4).
     */
    readonly maxRunTimeMs?: number;
    /**
     * Distributed lock key (AD-73): the scheduler acquires the named lock
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
     * (AD-73). `undefined` (default) resolves the `lockDriver` bean from
     * the injected application context; pass `null` to leave locked tasks
     * failing loudly when no bean exists.
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
     * Runs that threw (exceptions are isolated per run — AD-20 D4).
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

interface TaskState {
    readonly definition: ScheduledTaskDefinition;
    inFlight: boolean;
    nextRunAt: Date | null;
    runs: number;
    failures: number;
    lastError: Error | null;
    lastStartedAt: Date | null;
    lastCompletedAt: Date | null;
}

/**
 * Largest delay `setTimeout` accepts — beyond this Node fires the timer
 * after ~1ms instead, which would turn far-future schedules into a busy
 * re-arm loop. The engine caps at this and lets the early wake re-arm.
 */
const MAX_TIMER_DELAY_MS = 2_147_483_647;

/**
 * Tests whether a value looks like a {@link TaskScheduler}.
 *
 * @param value - The value to test.
 * @returns Whether the value matches the scheduler shape.
 */
export const likeTaskScheduler = like({
    register: Function,
    tick: Function,
    start: Function,
    stop: Function,
}) as (value: unknown) => value is TaskScheduler;

/**
 * The task-execution engine: next-fire tracking, single-flight runs, error
 * isolation, `maxRunTime` races, and drain-on-close (AD-20 D4).
 *
 * The engine is driven two ways:
 * - `tick(now)` — deterministic, testable, and suited to an application
 *   loop: fires every due task and awaits the runs it started.
 * - `start()`/`stop()` — a wall-clock timer chain that calls `tick` at each
 *   computed next-fire time (fire-and-forget; single-flight guards overlap).
 */
export class TaskScheduler implements AsyncCloseable, AsyncDestroyable {
    readonly #clock: () => Date;
    readonly #warn: (message: string) => void;
    readonly #tasks = new Map<string, TaskState>();
    readonly #active = new Set<Promise<void>>();
    #timer: NodeJS.Timeout | null = null;
    /**
     * The delay the armed timer was created with, `null` while unarmed —
     * used to detect re-arms that raced ahead of run completion
     * (fixedDelay anchors land in run `finally` blocks).
     */
    #timerDelayMs: number | null = null;
    /**
     * The started latch — set by {@link TaskScheduler.start} and cleared by
     * {@link TaskScheduler.stop}. Kept separate from `#timer` because a
     * started loop with no (or only far-future) tasks has no armed timer:
     * `#timer === null` must not be mistaken for "not started", or
     * registering a task after `start()` would never arm the loop.
     */
    #started = false;
    #closed = false;
    destroyed = false;
    /** Constructor-provided lock driver; `undefined` = resolve from context. */
    readonly #lockDriverOption: LockDriver | null | undefined;
    /** The injected application context (lockDriver bean resolution). */
    #context: ApplicationContext | null = null;

    /**
     * Creates a task scheduler.
     *
     * @param options - Clock, warning-sink, and lock-driver injection.
     */
    constructor(options: TaskSchedulerOptions = {}) {
        this.#clock = options.clock ?? (() => new Date());
        this.#warn = options.warn ?? ((message: string) => logger.warn(message));
        this.#lockDriverOption = options.lockDriver;
    }

    /**
     * Container injection (`ApplicationContextAware`): the context is used
     * to resolve the `lockDriver` bean for {@link ScheduledTaskDefinition
     * locked} tasks when no driver was passed to the constructor (AD-73).
     *
     * @param context - The application context.
     */
    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * Registers a task; its first fire is computed from the current clock.
     *
     * When the loop is already started, the timer is re-armed so a task
     * registered after `start()` (or one due earlier than the armed timer)
     * fires on time.
     *
     * @param definition - The task to register.
     * @throws {FrameworkError} On duplicate names or after `close()`.
     */
    register(definition: ScheduledTaskDefinition): void {
        if (this.#closed) {
            throw new FrameworkError(`TaskScheduler: cannot register '${definition.name}' — the scheduler is closed`);
        }
        if (this.#tasks.has(definition.name)) {
            throw new FrameworkError(`TaskScheduler: duplicate task '${definition.name}'`);
        }
        this.#tasks.set(definition.name, {
            definition,
            inFlight: false,
            nextRunAt: definition.schedule.next(this.#clock()),
            runs: 0,
            failures: 0,
            lastError: null,
            lastStartedAt: null,
            lastCompletedAt: null,
        });
        this.#rearm();
    }

    /**
     * Removes a task.
     *
     * When the loop is started, the timer is re-armed so the next wake
     * reflects the remaining tasks (a removed earliest task no longer
     * leaves a stale timer).
     *
     * @param name - The task name.
     * @returns Whether a task was removed.
     */
    unregister(name: string): boolean {
        const removed = this.#tasks.delete(name);
        if (removed) {
            this.#rearm();
        }
        return removed;
    }

    /**
     * The names of all registered tasks.
     *
     * @returns The task names in registration order.
     */
    taskNames(): string[] {
        return [...this.#tasks.keys()];
    }

    /**
     * Observable statistics for a task.
     *
     * @param name - The task name.
     * @returns The task statistics, or `undefined` when not registered.
     */
    getStats(name: string): TaskStats | undefined {
        const state = this.#tasks.get(name);
        if (!state) {
            return undefined;
        }
        return {
            runs: state.runs,
            failures: state.failures,
            inFlight: state.inFlight,
            lastStartedAt: state.lastStartedAt,
            lastError: state.lastError,
        };
    }

    /**
     * Advances the scheduler to `now` and fires every due task.
     *
     * Overlapping runs are skipped (single-flight): the task's next fire is
     * slid forward. Runs started by this tick are awaited before it returns,
     * so tests are deterministic; run failures never propagate.
     *
     * @param now - The time to advance to; defaults to the injected clock.
     * @returns How many runs started.
     */
    async tick(now?: Date): Promise<number> {
        const current = now ?? this.#clock();
        const started: Promise<void>[] = [];

        for (const state of this.#tasks.values()) {
            if (state.nextRunAt === null || state.nextRunAt > current) {
                continue;
            }
            if (state.inFlight) {
                // Single-flight: skip, then ensure the task comes due again
                // without a re-fire storm.
                state.nextRunAt = state.definition.schedule.next(current);
                continue;
            }

            state.inFlight = true;
            state.runs += 1;
            state.lastStartedAt = current;

            const { schedule } = state.definition;
            if (schedule.intervalMs !== undefined && schedule.kind === 'fixedRate') {
                // Start-anchored: the next fire is one interval after THIS run starts.
                state.nextRunAt = new Date(current.getTime() + schedule.intervalMs);
            } else if (schedule.kind === 'cron') {
                // Time-sequence: the next fire follows the fire time, not the run.
                state.nextRunAt = schedule.next(current);
            }
            // fixedDelay: end-anchored — set when the run completes (finally).

            started.push(this.#run(state));
        }

        if (started.length > 0) {
            await Promise.allSettled(started);
        }
        return started.length;
    }

    /**
     * Whether the wall-clock timer loop is started.
     *
     * True from `start()` until `stop()` even while no timer is armed — a
     * started loop with no registered tasks has nothing to wake for, but it
     * will arm as soon as a task is registered.
     */
    get isRunning(): boolean {
        return this.#started;
    }

    /**
     * Starts the wall-clock timer loop (idempotent). Fire-and-forget: ticks
     * are not awaited, so long runs never delay the loop — single-flight
     * prevents same-task overlap.
     *
     * The started latch is set even when no tasks are registered, so
     * registering one later arms the loop.
     */
    start(): void {
        if (this.#started || this.#closed) {
            return;
        }
        this.#started = true;
        this.#scheduleNext();
    }

    /**
     * Stops the wall-clock timer loop. In-flight runs continue; call
     * {@link TaskScheduler.close} to drain.
     */
    stop(): void {
        this.#started = false;
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
            this.#timerDelayMs = null;
        }
    }

    /**
     * Recomputes the timer after a registry change (register/unregister)
     * while the loop is started: clears any armed timer and re-arms for the
     * new earliest due task, so a task due sooner than the previous earliest
     * does not wait behind a stale timer.
     */
    #rearm(): void {
        if (!this.#started || this.#closed) {
            return;
        }
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
            this.#timerDelayMs = null;
        }
        this.#scheduleNext();
    }

    /**
     * Stops the loop, drains in-flight runs, and clears the registry.
     *
     * Tasks are cleared on close; the scheduler is closed for further
     * registration.
     */
    async close(): Promise<void> {
        if (this.#closed) {
            return;
        }
        this.#closed = true;
        this.stop();
        if (this.#active.size > 0) {
            await Promise.allSettled(this.#active);
        }
        this.#tasks.clear();
    }

    /**
     * Container contract (AD-20): stops the loop, drains in-flight runs, and
     * clears the registry — the same work as {@link TaskScheduler.close}.
     *
     * The container does not await the drain (context close is synchronous);
     * in-flight runs finish in the background and the scheduler rejects new
     * registrations immediately.
     */
    async destroy(): Promise<void> {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        await this.close();
    }

    /**
     * Executes one run with single-flight release, error isolation, and the
     * optional `maxRunTime` race.
     *
     * @param state - The task state to run.
     * @returns A promise resolving when the run (or its timeout race) settles.
     */
    async #run(state: TaskState): Promise<void> {
        const promise = this.#execute(state);
        this.#active.add(promise);
        void promise.finally(() => {
            this.#active.delete(promise);
        });
        return promise;
    }

    async #execute(state: TaskState): Promise<void> {
        const { definition } = state;
        let lease: LockHandle | null = null;
        try {
            if (definition.lockKey !== undefined) {
                lease = await this.#acquireTaskLock(definition);
                if (lease === null) {
                    // Contended (or the wait budget expired): this fire is
                    // skipped. The finally normalizes bookkeeping exactly
                    // like a completed run, so the task stays schedulable.
                    return;
                }
            }
            const runPromise = Promise.resolve(definition.run());
            if (definition.maxRunTimeMs === undefined) {
                await runPromise;
            } else {
                await this.#raceMaxRunTime(state, runPromise, definition.maxRunTimeMs);
            }
        } catch (error) {
            this.#recordFailure(state, error);
        } finally {
            await this.#releaseTaskLock(lease);
            state.inFlight = false;
            state.lastCompletedAt = this.#clock();
            const { schedule } = definition;
            if (schedule.intervalMs !== undefined && schedule.kind === 'fixedDelay') {
                // End-anchored: the next fire is one interval after completion.
                state.nextRunAt = new Date(state.lastCompletedAt.getTime() + schedule.intervalMs);
            }
        }
    }

    /**
     * Acquires a task's distributed lock, honoring the definition's wait
     * budget. Skips (returns `null`) when the key stays contended beyond
     * `lockWaitMs` — the default behavior on contention.
     *
     * @param definition - The task definition.
     * @returns The lease, or `null` when the fire is skipped.
     * @throws {FrameworkError} When `lockKey` is set but no lock driver is
     *   configured (fail-loud: running unguarded would defeat the feature).
     */
    async #acquireTaskLock(definition: ScheduledTaskDefinition): Promise<LockHandle | null> {
        const driver = this.#lockDriver();
        if (driver === null) {
            throw new FrameworkError(
                `TaskScheduler: task '${definition.name}' declares lock '${definition.lockKey}' but no LockDriver is ` +
                    "configured — register a lockDriver bean or pass one to the scheduler's options"
            );
        }
        if (definition.lockKey === undefined) {
            return null;
        }
        const ttlMs = definition.lockTtlMs ?? DEFAULT_LOCK_TTL_MS;
        const startedAt = this.#clock().getTime();
        const budgetMs = definition.lockWaitMs ?? 0;
        const stepMs = Math.max(1, definition.lockWaitStepMs ?? DEFAULT_LOCK_WAIT_STEP_MS);
        const key = definition.lockKey;
        for (;;) {
            // oxlint-disable-next-line no-await-in-loop -- a contended-lock poll is inherently sequential: each probe must observe the previous wait
            const lease = await driver.acquire(key, { ttlMs });
            if (lease !== null) {
                return lease;
            }
            if (this.#closed) {
                return null;
            }
            const elapsed = this.#clock().getTime() - startedAt;
            if (elapsed >= budgetMs) {
                this.#warn(`TaskScheduler: task '${definition.name}' skipped — lock '${key}' is held`);
                return null;
            }
            // oxlint-disable-next-line no-await-in-loop -- same poll loop: wait between attempts, never parallel
            await this.#sleep(Math.min(stepMs, budgetMs - elapsed));
        }
    }

    /**
     * Releases a task's lease in the run `finally` — a throw never leaks
     * the lease. Failures are warnings: the fence already prevents any
     * successor damage, and the bookkeeping must proceed.
     *
     * @param lease - The acquired lease, or `null` when none was acquired.
     */
    async #releaseTaskLock(lease: LockHandle | null): Promise<void> {
        if (lease === null) {
            return;
        }
        try {
            await lease.release();
        } catch {
            // The driver may already be closed (scheduler shutdown); the
            // lease expires by TTL regardless — nothing further to do.
        }
    }

    /**
     * Resolves the lock driver: constructor option wins, then the
     * application context's `lockDriver` bean.
     *
     * @returns The driver, or `null` when none is configured.
     */
    #lockDriver(): LockDriver | null {
        if (this.#lockDriverOption !== undefined) {
            return this.#lockDriverOption;
        }
        const context = this.#context;
        if (context !== null && context.hasValue(LOCK_DRIVER)) {
            const driver = context.getValue(LOCK_DRIVER);
            if (!likeLockDriver(driver)) {
                throw new FrameworkError(`TaskScheduler: the '${LOCK_DRIVER.description}' bean is not a LockDriver`);
            }
            return driver;
        }
        return null;
    }

    /**
     * Waits without busy-looping the CPU.
     *
     * @param ms - The delay in milliseconds (positive; no-op on zero).
     */
    async #sleep(ms: number): Promise<void> {
        if (ms <= 0) {
            return;
        }
        await new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Records a run failure on the task state.
     *
     * @param state - The task state to update.
     * @param error - The failure.
     */
    #recordFailure(state: TaskState, error: unknown): void {
        state.failures += 1;
        state.lastError = error instanceof Error ? error : new Error(String(error));
    }

    /**
     * Races a run against the `maxRunTime` cap.
     *
     * When the cap wins first, the single-flight slot is released and a
     * warning is emitted; a rejection arriving afterwards can no longer be
     * observed by the caller (the race has already settled), so it is
     * recorded here instead of being swallowed.
     *
     * The cap's timer is cleared as soon as the race settles, so a run that
     * finishes first never pins the event loop for the remainder of the cap.
     *
     * @param state - The task state.
     * @param runPromise - The running task.
     * @param maxRunTimeMs - The cap in milliseconds.
     */
    async #raceMaxRunTime(state: TaskState, runPromise: Promise<void>, maxRunTimeMs: number): Promise<void> {
        let timedOut = false;
        let capTimer: NodeJS.Timeout | undefined;
        const timer = new Promise<void>((resolve) => {
            capTimer = setTimeout(() => resolve(), maxRunTimeMs);
        });

        try {
            await Promise.race([
                runPromise.catch((error) => {
                    if (timedOut) {
                        this.#recordFailure(state, error);
                        return;
                    }
                    throw error;
                }),
                timer.then(() => {
                    timedOut = true;
                }),
            ]);
        } finally {
            // The race settled: an armed cap has no remaining purpose and
            // would keep the process alive until it fired (clearing an
            // already-fired timer is a no-op).
            clearTimeout(capTimer);
        }

        if (timedOut) {
            this.#warn(
                `TaskScheduler: task '${state.definition.name}' exceeded maxRunTime (${maxRunTimeMs}ms) — ` +
                    'released the single-flight slot; the task continues running in the background'
            );
        }
    }

    /**
     * Arms the timer for the earliest due task.
     *
     * Idempotent while a timer is armed: the loop's liveness depends on
     * re-arming from the timer callback without waiting for in-flight
     * runs to settle.
     */
    #scheduleNext(): void {
        if (this.#closed || !this.#started || this.#timer !== null) {
            return;
        }
        const now = this.#clock();
        let earliest: Date | null = null;
        for (const state of this.#tasks.values()) {
            if (state.nextRunAt !== null && (earliest === null || state.nextRunAt < earliest)) {
                earliest = state.nextRunAt;
            }
        }
        if (earliest === null) {
            return;
        }

        // Node fires delays over 2^31-1 ms (~24.8 days) after ~1ms — without
        // the cap, farther-out schedules (yearly crons, >24.8d intervals)
        // would re-arm in a ~1ms busy loop. The capped timer wakes early and
        // re-arms until the remaining delay fits.
        const delayMs = Math.min(MAX_TIMER_DELAY_MS, Math.max(0, earliest.getTime() - now.getTime()));
        this.#timerDelayMs = delayMs;
        this.#timer = setTimeout(() => {
            this.#timer = null;
            this.#timerDelayMs = null;
            // Tick at the scheduled time without blocking the loop; the run
            // updates nextRunAt synchronously before the loop re-arms.
            const pending = this.tick(earliest);
            this.#scheduleNext();
            // A 0-delay re-arm means the earliest task was in flight: its
            // fixedDelay anchor lands in the run's finally only after the
            // tick settles. Re-arm from the settled state instead of
            // wasting a zero-delay wake.
            if (this.#timerDelayMs === 0) {
                void pending.then(() => {
                    if (this.#timer !== null) {
                        clearTimeout(this.#timer);
                        this.#timer = null;
                        this.#timerDelayMs = null;
                        this.#scheduleNext();
                    }
                });
            }
        }, delayMs);
    }
}
