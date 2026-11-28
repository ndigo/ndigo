/**
 * Task scheduler: drives scheduled task execution.
 */
import { FrameworkError } from '@ndigo/core';
import type { AsyncDestroyable } from '@ndigo/factory';
import { getLogger } from '@ndigo/log';
import type { ApplicationContext } from '@ndigo/context';
import { TaskLockManager } from './_task-scheduler-lock.js';
import { TaskExecutor } from './_task-scheduler-executor.js';
import { TaskTimerLoop } from './_task-scheduler-loop.js';

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
import type { ScheduledTaskDefinition, TaskSchedulerOptions, TaskStats, TaskState } from './task-scheduler-types';

// Re-export moved contracts for backward compat.
export * from './task-scheduler-types';

/**
 * Task scheduler: drives scheduled task execution.
 *
 * @example
 * ```ts
 * const scheduler = new TaskScheduler();
 * ```
 */
export class TaskScheduler implements AsyncDestroyable {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "TaskScheduler".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object TaskScheduler]"
     */
    get [Symbol.toStringTag](): string {
        return 'TaskScheduler';
    }

    readonly #clock: () => Date;
    readonly #warn: (message: string) => void;
    readonly #tasks = new Map<string, TaskState>();
    readonly #locks: TaskLockManager;
    readonly #executor: TaskExecutor;
    readonly #loop: TaskTimerLoop;
    /** Set once {@link destroy} runs; new registrations are rejected. */
    destroyed = false;
    /** The injected application context (lockDriver entry resolution). */
    #context: ApplicationContext | null = null;

    /**
     * Creates a task scheduler.
     *
     * @param options - Clock, warning-sink, and lock-driver injection.
     */
    constructor(options: TaskSchedulerOptions = {}) {
        this.#clock = options.clock ?? (() => new Date());
        this.#warn = options.warn ?? ((message: string) => logger.warn(message));
        const schedulerDestroyed = (): boolean => this.destroyed;
        this.#locks = new TaskLockManager({
            get destroyed(): boolean {
                return schedulerDestroyed();
            },
            warn: this.#warn,
            now: this.#clock,
            context: (): ApplicationContext | null => this.#context,
            lockDriverOption: (): typeof options.lockDriver => options.lockDriver,
            defaultTtlMs: DEFAULT_LOCK_TTL_MS,
            defaultWaitStepMs: DEFAULT_LOCK_WAIT_STEP_MS,
        });
        this.#executor = new TaskExecutor({ clock: this.#clock, warn: this.#warn, locks: this.#locks });
        this.#loop = new TaskTimerLoop({
            tasks: this.#tasks,
            get destroyed(): boolean {
                return schedulerDestroyed();
            },
            now: this.#clock,
            tickAt: (earliest: Date): Promise<number> => this.tick(earliest),
        });
    }

    /**
     * Container injection (`ApplicationContextAware`): the context is used
     * to resolve the `lockDriver` entry for locked tasks when no driver was
     * passed to the constructor.
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
     * @throws On duplicate names or after `destroy()`.
     */
    register(definition: ScheduledTaskDefinition): void {
        if (this.destroyed) {
            throw new FrameworkError(
                `TaskScheduler: cannot register '${definition.name}' — the scheduler is destroyed`
            );
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
        this.#loop.rearm();
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
            this.#loop.rearm();
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

            started.push(this.#executor.run(state));
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
        return this.#loop.started;
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
        this.#loop.start();
    }

    /**
     * Stops the wall-clock timer loop. In-flight runs continue; call
     * {@link TaskScheduler.destroy} to drain.
     */
    stop(): void {
        this.#loop.stop();
    }
    /**
     * Destroys the scheduler: stops the loop, drains in-flight runs, and
     * clears the registry. The container does not await the drain (context
     * close is synchronous); in-flight runs finish in the background and
     * the scheduler rejects new registrations immediately.
     */
    async destroy(): Promise<void> {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        this.stop();
        await this.#executor.drain();
        this.#tasks.clear();
    }
}
