/**
 * Task execution: single-flight tracking, lock release, failure recording,
 * and the maxRunTime race.
 */
import { toError } from '@ndigo/util';
import type { LockHandle } from '@ndigo/locks';
import type { TaskLockManager } from './_task-scheduler-lock.js';
import type { TaskState } from './task-scheduler-types.js';

/** The scheduler state execution reads. */
export interface TaskExecutorHost {
    /** The current time. */
    readonly clock: () => Date;
    /** The warning sink. */
    readonly warn: (message: string) => void;
    /** Lock acquisition/release. */
    readonly locks: TaskLockManager;
}

/** Runs tasks with single-flight tracking and failure isolation. */
export class TaskExecutor {
    readonly #host: TaskExecutorHost;
    readonly #active = new Set<Promise<void>>();

    /**
     * @param host - The scheduler state execution reads.
     */
    constructor(host: TaskExecutorHost) {
        this.#host = host;
    }

    /**
     * Executes one run with single-flight release, error isolation, and the
     * optional `maxRunTime` race.
     *
     * @param state - The task state to run.
     * @returns A promise resolving when the run (or its timeout race) settles.
     */
    async run(state: TaskState): Promise<void> {
        const promise = this.#execute(state);
        this.#active.add(promise);
        void promise.finally(() => {
            this.#active.delete(promise);
        });
        return promise;
    }

    /**
     * Waits for every in-flight run to settle.
     */
    async drain(): Promise<void> {
        if (this.#active.size > 0) {
            await Promise.allSettled(this.#active);
        }
    }

    async #execute(state: TaskState): Promise<void> {
        const { definition } = state;
        let lease: LockHandle | null = null;
        try {
            if (definition.lockKey !== undefined) {
                lease = await this.#host.locks.acquire(definition);
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
            await this.#host.locks.release(lease);
            state.inFlight = false;
            state.lastCompletedAt = this.#host.clock();
            const { schedule } = definition;
            if (schedule.intervalMs !== undefined && schedule.kind === 'fixedDelay') {
                // End-anchored: the next fire is one interval after completion.
                state.nextRunAt = new Date(state.lastCompletedAt.getTime() + schedule.intervalMs);
            }
        }
    }

    /**
     * Records a run failure on the task state.
     *
     * @param state - The task state to update.
     * @param error - The failure.
     */
    #recordFailure(state: TaskState, error: unknown): void {
        state.failures += 1;
        state.lastError = toError(error);
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
            this.#host.warn(
                `TaskScheduler: task '${state.definition.name}' exceeded maxRunTime (${maxRunTimeMs}ms) — ` +
                    'released the single-flight slot; the task continues running in the background'
            );
        }
    }
}
