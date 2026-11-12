/**
 * The producer facade: `JobQueue` wraps a driver for enqueueing.
 */
import { FrameworkError } from '@ndigo/core';
import type { ApplicationContext } from '@ndigo/context';
import type { JobRecord, JobRequest } from './job';
import { likeJobDriver, type JobDriver } from './job-driver';
import { DEFAULT_MAX_ATTEMPTS } from './request';
import { JOB_DRIVER } from './context-tokens';

/**
 * Options for {@link JobQueue}.
 */
export interface JobQueueOptions {
    /**
     * The driver jobs are enqueued on. When omitted, the queue resolves the
     * `jobDriver` entry from its application context at first use.
     */
    driver?: JobDriver;
    /** Default `maxAttempts` for requests that do not set one; default 3. */
    maxAttempts?: number;
}

/**
 * The producer-facing queue: `enqueue` one job, inspect `size` — nothing else
 * (claiming and completion belong to {@link "job-runner".JobRunner | JobRunner}).
 *
 * Produces, per AD-72 D-3, a single place where defaults live: drivers
 * normalize and validate, the queue only fills in the configured default
 * `maxAttempts` and forwards.
 */
export class JobQueue {
    #driver: JobDriver | null;
    #context: ApplicationContext | null = null;
    readonly #maxAttempts: number;

    /**
     * Creates a queue over a driver or a context-resolved driver.
     *
     * @param options - Driver (or context resolution) and default attempts.
     */
    constructor(options: JobQueueOptions = {}) {
        if (options.driver !== undefined) {
            if (!likeJobDriver(options.driver)) {
                throw new FrameworkError('JobQueue: the provided driver is not a JobDriver');
            }
            this.#driver = options.driver;
        } else {
            this.#driver = null;
        }
        const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
        if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) {
            throw new TypeError(`JobQueue: maxAttempts must be a positive integer, got ${String(options.maxAttempts)}`);
        }
        this.#maxAttempts = maxAttempts;
    }

    /**
     * Container injection: the context the queue resolves its driver from
     * when none was passed to the constructor.
     *
     * @param applicationContext - The application context.
     */
    setApplicationContext(applicationContext: ApplicationContext): void {
        this.#context = applicationContext;
    }

    /**
     * Enqueues one job.
     *
     * @param request - The job to enqueue (see {@link JobRequest}).
     * @returns The stored record.
     */
    async enqueue(request: JobRequest): Promise<JobRecord> {
        const maxAttempts = request.maxAttempts ?? this.#maxAttempts;
        return this.#resolveDriver().enqueue({ ...request, maxAttempts });
    }

    /**
     * Number of jobs pending delivery (queued plus leased).
     *
     * @returns The pending count.
     */
    async size(): Promise<number> {
        return this.#resolveDriver().size();
    }

    #resolveDriver(): JobDriver {
        if (this.#driver !== null) {
            return this.#driver;
        }
        const context = this.#context;
        if (context !== null && context.hasValue(JOB_DRIVER)) {
            const driver = context.getValue(JOB_DRIVER);
            if (!likeJobDriver(driver)) {
                throw new FrameworkError(`JobQueue: '${JOB_DRIVER.description}' entry is not a JobDriver`);
            }
            this.#driver = driver;
            return driver;
        }
        throw new FrameworkError(
            `JobQueue: no job driver — pass one to the constructor or register a '${JOB_DRIVER.description}' entry ` +
                '(NodeAutoConfiguration provides the in-process default)'
        );
    }
}
