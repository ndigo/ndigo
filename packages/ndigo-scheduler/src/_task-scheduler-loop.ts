/**
 * Wall-clock timer loop for the task scheduler.
 */
import type { TaskState } from './task-scheduler-types.js';

/** The largest delay Node accepts before it clamps to ~1ms. */
const MAX_TIMER_DELAY_MS = 2_147_483_647;

/** The scheduler state the timer loop reads. */
export interface TaskTimerLoopHost {
    /** Registered tasks. */
    readonly tasks: ReadonlyMap<string, TaskState>;
    /** Whether the scheduler was destroyed. */
    readonly destroyed: boolean;
    /** The current time. */
    now(): Date;
    /** Runs the due tasks anchored at the scheduled instant. */
    tickAt(earliest: Date): Promise<number>;
}

/** Owns the started latch and the armed wall-clock timer. */
export class TaskTimerLoop {
    readonly #host: TaskTimerLoopHost;
    #timer: NodeJS.Timeout | null = null;
    /**
     * The delay the armed timer was created with, `null` while unarmed —
     * used to detect re-arms that raced ahead of run completion
     * (fixedDelay anchors land in run `finally` blocks).
     */
    #timerDelayMs: number | null = null;
    #started = false;

    /**
     * @param host - The scheduler state the loop reads.
     */
    constructor(host: TaskTimerLoopHost) {
        this.#host = host;
    }

    /** Whether the loop is started (even with no armed timer). */
    get started(): boolean {
        return this.#started;
    }

    /**
     * Starts the loop (idempotent). The started latch is set even when no
     * tasks are registered, so registering one later arms the loop.
     */
    start(): void {
        if (this.#started || this.#host.destroyed) {
            return;
        }
        this.#started = true;
        this.#scheduleNext();
    }

    /**
     * Stops the loop and clears an armed timer. In-flight runs continue.
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
     * Recomputes the timer after a registry change while the loop is
     * started: clears any armed timer and re-arms for the new earliest due
     * task.
     */
    rearm(): void {
        if (!this.#started || this.#host.destroyed) {
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
     * Arms the timer for the earliest due task.
     *
     * Idempotent while a timer is armed: the loop's liveness depends on
     * re-arming from the timer callback without waiting for in-flight
     * runs to settle.
     */
    #scheduleNext(): void {
        if (this.#host.destroyed || !this.#started || this.#timer !== null) {
            return;
        }
        const now = this.#host.now();
        let earliest: Date | null = null;
        for (const state of this.#host.tasks.values()) {
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
            const pending = this.#host.tickAt(earliest);
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
