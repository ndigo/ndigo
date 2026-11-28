/**
 * Distributed-lock acquisition for scheduled tasks.
 */
import { FrameworkError } from '@ndigo/core';
import { LOCK_DRIVER, likeLockDriver, type LockDriver, type LockHandle } from '@ndigo/locks';
import { delay } from '@ndigo/util';
import type { ApplicationContext } from '@ndigo/context';
import type { ScheduledTaskDefinition } from './task-scheduler-types.js';

/** The scheduler state lock acquisition reads. */
export interface TaskLockHost {
    /** Whether the scheduler was destroyed (skip any further waiting). */
    readonly destroyed: boolean;
    /** Whether the fire should be skipped after a contention wait. */
    readonly warn: (message: string) => void;
    /** The current time. */
    now(): Date;
    /** The injected application context. */
    context(): ApplicationContext | null;
    /** The constructor-provided driver (`undefined` = resolve from context). */
    lockDriverOption(): LockDriver | null | undefined;
    /** Default lease duration for a locked task. */
    readonly defaultTtlMs: number;
    /** Default poll interval while waiting for a contended lock. */
    readonly defaultWaitStepMs: number;
}

/**
 * Acquires and releases task leases, resolving the driver from the option or
 * the application-context `lockDriver` entry.
 */
export class TaskLockManager {
    readonly #host: TaskLockHost;

    /**
     * @param host - The scheduler state lock acquisition reads.
     */
    constructor(host: TaskLockHost) {
        this.#host = host;
    }

    /**
     * Acquires a task's distributed lock, honoring the definition's wait
     * budget. Skips (returns `null`) when the key stays contended beyond
     * `lockWaitMs`.
     *
     * @param definition - The task definition.
     * @returns The lease, or `null` when the fire is skipped.
     * @throws When `lockKey` is set but no lock driver is configured
     *   (fail-loud: running unguarded would defeat the feature).
     */
    async acquire(definition: ScheduledTaskDefinition): Promise<LockHandle | null> {
        const driver = this.#lockDriver();
        if (driver === null) {
            throw new FrameworkError(
                `TaskScheduler: task '${definition.name}' declares lock '${definition.lockKey}' but no LockDriver is ` +
                    "configured — register a lockDriver entry or pass one to the scheduler's options"
            );
        }
        if (definition.lockKey === undefined) {
            return null;
        }
        const ttlMs = definition.lockTtlMs ?? this.#host.defaultTtlMs;
        const startedAt = this.#host.now().getTime();
        const budgetMs = definition.lockWaitMs ?? 0;
        const stepMs = Math.max(1, definition.lockWaitStepMs ?? this.#host.defaultWaitStepMs);
        const key = definition.lockKey;
        for (;;) {
            // oxlint-disable-next-line no-await-in-loop -- a contended-lock poll is inherently sequential: each probe must observe the previous wait
            const lease = await driver.acquire(key, { ttlMs });
            if (lease !== null) {
                return lease;
            }
            if (this.#host.destroyed) {
                return null;
            }
            const elapsed = this.#host.now().getTime() - startedAt;
            if (elapsed >= budgetMs) {
                this.#host.warn(`TaskScheduler: task '${definition.name}' skipped — lock '${key}' is held`);
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
    async release(lease: LockHandle | null): Promise<void> {
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
     * application context's `lockDriver` entry.
     *
     * @returns The driver, or `null` when none is configured.
     */
    #lockDriver(): LockDriver | null {
        const option = this.#host.lockDriverOption();
        if (option !== undefined) {
            return option;
        }
        const context = this.#host.context();
        if (context !== null && context.hasValue(LOCK_DRIVER)) {
            const driver = context.getValue(LOCK_DRIVER);
            if (!likeLockDriver(driver)) {
                throw new FrameworkError(`TaskScheduler: the '${LOCK_DRIVER.description}' entry is not a LockDriver`);
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
        await delay(ms);
    }
}
