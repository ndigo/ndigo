/**
 * `JobRunner` — polls a driver and executes registered handlers.
 */
import { FrameworkError } from '@ndigo/core';
import type { AsyncCloseable } from '@ndigo/factory';
import { getErrorMessage } from '@ndigo/util';
import { getLogger, type Logger } from '@ndigo/log';
import type { ApplicationContext } from '@ndigo/context';
import type { JobRecord } from './job';
import { likeJobDriver, type JobDriver } from './job-driver';
import { JOB_DRIVER, JOB_HANDLER_REGISTRY } from './context-tokens';
import { likeJobHandlerRegistry, type JobHandlerRegistry } from './job-handler-registry';
import { startJobSpan } from './telemetry';

/**
 * Default retry delay: exponential from one second, capped at thirty.
 *
 * @param attempt - The attempt that failed (1-based).
 * @returns The delay in milliseconds.
 */
function defaultBackoffMs(attempt: number): number {
    return Math.min(30_000, 1000 * 2 ** (attempt - 1));
}

/**
 * Options for {@link JobRunner}.
 */
export interface JobRunnerOptions {
    /** The driver to claim from; resolved from the `jobDriver` entry when omitted. */
    driver?: JobDriver;
    /** The handler registry; resolved from the `jobHandlerRegistry` entry when omitted. */
    registry?: JobHandlerRegistry;
    /** Execution slots (max claimed per pass); default 1. */
    concurrency?: number;
    /** Delay between empty polls; default 1000. */
    pollIntervalMs?: number;
    /** Claim lease; also the heartbeat interval base (`leaseMs / 2`); default 30000. */
    leaseMs?: number;
    /** Clock override for deterministic tests; default `Date.now`. */
    clock?: () => number;
    /** Retry backoff (milliseconds until the next attempt); default exponential. */
    backoffMs?: (attempt: number) => number;
    /** Logger override; default `getLogger('@ndigo/jobs')`. */
    logger?: Logger;
    /**
     * Start the poll loop on context refresh (`SmartLifecycle`). Default
     * **false** — a pending poll timer keeps the process alive, so the loop
     * starts explicitly (the `HTTPServer` precedent): worker processes start
     * the runner after boot; API-only processes leave it stopped. Set `true`
     * to opt into refresh-driven start.
     */
    autoStart?: boolean;
}

/**
 * The worker engine (AD-72 D-4): single-flight poll ticks, `concurrency`
 * execution slots, per-execution timeout (cooperative `AbortSignal`), lease
 * heartbeat, exponential-backoff retries until `maxAttempts`, one
 * `jobs.job.<type>` span per execution, and outcome logging via `@ndigo/log`.
 *
 * Lifecycle: `SmartLifecycle`, phase 10 (after the registry scan in phase 0).
 * The poll loop starts explicitly — `start()` after boot, the `HTTPServer`
 * precedent — because a pending poll timer keeps the process alive; pass
 * `autoStart: true` for refresh-driven start (`stop()` stops claiming while
 * in-flight executions continue; `close()` drains — the container closes it
 * on context close).
 *
 * Deterministic tests drive {@link tick} directly with an injected clock.
 */
export class JobRunner implements AsyncCloseable {
    /** SmartLifecycle phase: after the handler-registry scan (phase 0). */
    readonly phase = 10;
    /** Whether the runner starts with the context (`autoStart`). */
    readonly isAutoStartup: boolean;
    #context: ApplicationContext | null = null;
    #driver: JobDriver | null;
    #registry: JobHandlerRegistry | null;
    #started = false;
    #destroyed = false;
    #closed = false;
    #ticking: Promise<number> | null = null;
    #timer: NodeJS.Timeout | null = null;
    readonly #inflight = new Set<Promise<void>>();
    readonly #concurrency: number;
    readonly #pollIntervalMs: number;
    readonly #leaseMs: number;
    readonly #clock: () => number;
    readonly #backoffMs: (attempt: number) => number;
    readonly #logger: Logger;

    /**
     * Creates a runner over a driver/registry or a context that resolves them.
     *
     * @param options - Driver/registry (or context resolution) and tuning.
     */
    constructor(options: JobRunnerOptions = {}) {
        if (options.driver !== undefined && !likeJobDriver(options.driver)) {
            throw new FrameworkError('JobRunner: the provided driver is not a JobDriver');
        }
        this.#driver = options.driver ?? null;
        this.#registry = options.registry ?? null;
        this.#concurrency = assertPositiveInteger(options.concurrency ?? 1, 'concurrency');
        this.#pollIntervalMs = assertPositiveInteger(options.pollIntervalMs ?? 1000, 'pollIntervalMs');
        this.#leaseMs = assertPositiveInteger(options.leaseMs ?? 30_000, 'leaseMs');
        this.#clock = options.clock ?? Date.now;
        this.#backoffMs = options.backoffMs ?? defaultBackoffMs;
        this.#logger = options.logger ?? getLogger('@ndigo/jobs');
        this.isAutoStartup = options.autoStart ?? false;
    }

    /**
     * Whether the poll loop is running.
     */
    get isRunning(): boolean {
        return this.#started;
    }

    /**
     * Executions currently in flight.
     */
    get inFlight(): number {
        return this.#inflight.size;
    }

    /**
     * Container injection: the context drivers and registries are resolved
     * from when not passed to the constructor.
     *
     * @param applicationContext - The application context.
     */
    setApplicationContext(applicationContext: ApplicationContext): void {
        this.#context = applicationContext;
    }

    /**
     * SmartLifecycle start: resolves collaborators (fail loud when missing)
     * and arms the poll loop.
     */
    start(): void {
        if (this.#started || this.#closed) {
            return;
        }
        this.#resolveDriver();
        this.#resolveRegistry();
        this.#started = true;
        this.#scheduleNext(0);
    }

    /**
     * SmartLifecycle stop: stops claiming; in-flight executions continue.
     */
    stop(): void {
        this.#started = false;
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }

    /**
     * Container teardown: stops claiming and drains in-flight executions.
     *
     * @returns A promise that resolves once the drain completes.
     */
    async close(): Promise<void> {
        if (this.#destroyed) {
            return;
        }
        this.#destroyed = true;
        this.#closed = true;
        this.stop();
        await this.drain();
    }

    /**
     * Awaits all in-flight executions (retry-safe: executions do not claim
     * new work, so the set only shrinks).
     *
     * **Cooperative-handler contract:** `drain()` waits for every in-flight
     * handler to settle. A handler registered without `timeoutMs` that never
     * resolves (e.g. a hanging network call) blocks `close()`/shutdown
     * indefinitely — there is no forced-abort at the drain level. Set a
     * `timeoutMs` on each handler (or job) whose work can stall; the runner
     * then aborts late handlers and settles them as failed, and the drain
     * completes.
     *
     * @returns A promise that resolves when no executions are in flight.
     */
    async drain(): Promise<void> {
        while (this.#inflight.size > 0) {
            // The iterable is consumed synchronously; settled executions
            // remove themselves from the set while this awaits.
            // eslint-disable-next-line no-await-in-loop -- re-check the set after each settle round
            await Promise.allSettled(this.#inflight);
        }
    }

    /**
     * One poll pass: claims up to the free execution slots and starts their
     * executions. Single-flight — concurrent calls share one pass.
     *
     * @returns Number of jobs claimed in this pass.
     */
    async tick(): Promise<number> {
        if (this.#closed) {
            throw new FrameworkError('JobRunner is closed — a closed runner claims no work');
        }
        if (this.#ticking !== null) {
            return this.#ticking;
        }
        this.#ticking = this.#tickInternal().finally(() => {
            this.#ticking = null;
        });
        return this.#ticking;
    }

    async #tickInternal(): Promise<number> {
        const driver = this.#resolveDriver();
        const registry = this.#resolveRegistry();
        let claimedTotal = 0;
        for (;;) {
            const free = this.#concurrency - this.#inflight.size;
            if (free <= 0) {
                break;
            }
            // Sequential passes: the free-slot count must reflect the
            // executions started by the previous claim before claiming again.
            // eslint-disable-next-line no-await-in-loop -- serialized claim passes keep slot accounting exact
            const claimed = await driver.claim({ limit: free, leaseMs: this.#leaseMs });
            if (claimed.length === 0) {
                break;
            }
            claimedTotal += claimed.length;
            for (const record of claimed) {
                this.#track(this.#execute(record, driver, registry));
            }
        }
        return claimedTotal;
    }

    #track(execution: Promise<void>): void {
        this.#inflight.add(execution);
        void execution.then(
            () => this.#inflight.delete(execution),
            () => this.#inflight.delete(execution)
        );
    }

    async #execute(record: JobRecord, driver: JobDriver, registry: JobHandlerRegistry): Promise<void> {
        const handler = registry.get(record.type);
        const span = startJobSpan(record);

        if (handler === undefined) {
            const reason = `no handler is registered for job type '${record.type}'`;
            this.#logger.error(`[jobs] ${reason} — failing job ${record.id}`);
            span.end('error', new Error(reason));
            await driver.fail(record.id, reason);
            return;
        }

        const timeoutMs = handler.timeoutMs ?? record.timeoutMs;
        const maxAttempts = handler.maxAttempts ?? record.maxAttempts;
        const controller = new AbortController();
        const heartbeatState = { current: Promise.resolve() };
        const heartbeat = this.#startHeartbeat(record.id, driver, heartbeatState);
        let error: unknown;

        try {
            await runWithTimeout(
                () =>
                    handler.run(record.payload, {
                        jobId: record.id,
                        type: record.type,
                        attempt: record.attempts,
                        signal: controller.signal,
                    }),
                timeoutMs,
                controller
            );
        } catch (caught) {
            error = caught;
        } finally {
            clearInterval(heartbeat);
            // The final in-flight heartbeat may still be on the wire in a
            // durable driver. Settle it BEFORE the terminal transition so a
            // heartbeat can never land after complete()/retry()/fail() and
            // re-extend a lease the driver just released or requeued
            // (AD72-M3: lease-extension racing a terminal state change).
            // Callback-level `.catch` swallows driver failures, so awaiting
            // is safe.
            await heartbeatState.current;
        }

        if (error === undefined) {
            span.end('success');
            await driver.complete(record.id);
            return;
        }

        span.end('error', error);
        const message = getErrorMessage(error);
        if (record.attempts >= maxAttempts) {
            this.#logger.error(
                `[jobs] job ${record.id} ('${record.type}') failed terminally after ${record.attempts} of ` +
                    `${maxAttempts} attempt(s): ${message}`
            );
            await driver.fail(record.id, message);
            return;
        }
        const runAt = this.#clock() + this.#backoffMs(record.attempts);
        this.#logger.warn(
            `[jobs] job ${record.id} ('${record.type}') attempt ${record.attempts} of ${maxAttempts} failed: ` +
                `${message} — retrying at ${new Date(runAt).toISOString()}`
        );
        await driver.retry(record.id, runAt, message);
    }

    #startHeartbeat(id: string, driver: JobDriver, state: { current: Promise<void> }): NodeJS.Timeout | undefined {
        const intervalMs = Math.floor(this.#leaseMs / 2);
        if (intervalMs < 1) {
            return undefined;
        }
        return setInterval(() => {
            // The promise is tracked (not fire-and-forget) so #execute can
            // await the last in-flight beat before the terminal transition
            // (AD72-M3). Failures are swallowed here: a lost heartbeat must
            // not fail the job — the lease simply lapses and the next claim
            // reclaims it.
            state.current = driver.heartbeat(id, this.#leaseMs).catch((error: unknown) => {
                this.#logger.warn(`[jobs] heartbeat failed for job ${id}: ${getErrorMessage(error)}`);
            });
        }, intervalMs);
    }

    #scheduleNext(delayMs: number): void {
        if (!this.#started || this.#closed || this.#timer !== null) {
            return;
        }
        this.#timer = setTimeout(() => {
            this.#timer = null;
            void this.#runCycle();
        }, delayMs);
    }

    async #runCycle(): Promise<void> {
        let claimed = 0;
        try {
            claimed = await this.tick();
        } catch (error) {
            this.#logger.error(`[jobs] poll cycle failed: ${getErrorMessage(error)}`);
        }
        this.#scheduleNext(claimed > 0 ? 0 : this.#pollIntervalMs);
    }

    #resolveDriver(): JobDriver {
        if (this.#driver !== null) {
            return this.#driver;
        }
        const context = this.#context;
        if (context !== null && context.hasValue(JOB_DRIVER)) {
            const driver = context.getValue(JOB_DRIVER);
            if (!likeJobDriver(driver)) {
                throw new FrameworkError(`JobRunner: '${JOB_DRIVER.description}' entry is not a JobDriver`);
            }
            this.#driver = driver;
            return driver;
        }
        throw new FrameworkError(
            `JobRunner: no job driver — pass one to the constructor or register a '${JOB_DRIVER.description}' entry ` +
                '(NodeAutoConfiguration provides the in-process default)'
        );
    }

    #resolveRegistry(): JobHandlerRegistry {
        if (this.#registry !== null) {
            return this.#registry;
        }
        const context = this.#context;
        if (context !== null && context.hasValue(JOB_HANDLER_REGISTRY)) {
            const registry = context.getValue(JOB_HANDLER_REGISTRY);
            if (!likeJobHandlerRegistry(registry)) {
                throw new FrameworkError(
                    `JobRunner: '${JOB_HANDLER_REGISTRY.description}' entry is not a JobHandlerRegistry`
                );
            }
            this.#registry = registry;
            return registry;
        }
        throw new FrameworkError(
            `JobRunner: no handler registry — pass one to the constructor or register a ` +
                `'${JOB_HANDLER_REGISTRY.description}' entry (NodeAutoConfiguration provides one)`
        );
    }
}

/**
 * Validates a positive-integer option.
 *
 * @param value - The value to check.
 * @param label - Option name for the error message.
 * @returns The value.
 */
function assertPositiveInteger(value: number, label: string): number {
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new TypeError(`JobRunner: ${label} must be a positive integer, got ${String(value)}`);
    }
    return value;
}

/**
 * Runs one handler invocation, enforcing the timeout cooperatively: the
 * abort signal fires, and the execution settles as failed even when the
 * handler ignores it (its eventual settlement is swallowed).
 *
 * @param fn - The handler invocation.
 * @param timeoutMs - Timeout in milliseconds, when configured.
 * @param controller - The abort controller whose signal the handler receives.
 */
async function runWithTimeout(
    fn: () => void | Promise<void>,
    timeoutMs: number | undefined,
    controller: AbortController
): Promise<void> {
    const execution = Promise.resolve(fn());
    if (timeoutMs === undefined) {
        await execution;
        return;
    }
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
            controller.abort();
            reject(new Error(`job timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    try {
        await Promise.race([execution, timeout]);
    } finally {
        clearTimeout(timer);
        void execution.catch(() => undefined);
    }
}
