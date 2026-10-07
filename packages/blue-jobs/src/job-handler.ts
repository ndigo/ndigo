/**
 * `@jobHandler` — declarative, Node-only job handler registration.
 *
 * @module blue-jobs
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { FrameworkError } from '@blue/core';

/**
 * Metadata key prefix under which `@jobHandler` writes its per-method
 * registration (`jobs:handler:<methodName>`).
 */
export const JOB_HANDLER_METADATA_PREFIX = 'jobs:handler:';

/**
 * Per-handler policy overrides. Either value, when set, wins over the
 * per-request value stored on the job record (AD-72 D-4).
 *
 * @since 1.0.0
 */
export interface JobHandlerOptions {
    /** Attempts allowed before the job is failed terminally. */
    maxAttempts?: number;
    /** Per-execution timeout handed to the handler as an abort signal. */
    timeoutMs?: number;
}

/**
 * The registration `@jobHandler` records for a method.
 *
 * @since 1.0.0
 */
export interface JobHandlerMetadata extends JobHandlerOptions {
    /** Job type this handler serves. */
    type: string;
}

/**
 * Execution context handed to a handler alongside the payload.
 *
 * @since 1.0.0
 */
export interface JobHandlerContext {
    /** The claimed job's identifier. */
    jobId: string;
    /** The job type. */
    type: string;
    /** The attempt being executed (1 for the first). */
    attempt: number;
    /**
     * Aborted when the execution exceeds `timeoutMs`. Cooperative: a handler
     * that ignores the signal is still settled as failed by the runner.
     */
    signal: AbortSignal;
}

/**
 * A job handler: receives the payload and execution context, resolves when
 * the work is done. Failures (throw / rejection) drive the retry policy.
 *
 * @since 1.0.0
 */
export type JobHandler = (payload: unknown, context: JobHandlerContext) => void | Promise<void>;

/**
 * Marks a method as the handler for one job type (AD-72 D-5).
 *
 * Node-only: the decorator refuses to apply in environments without a
 * `process` global (genuine browsers) — jobs run on the server.
 *
 * @param type - Non-empty job type string; duplicates fail loud at scan time.
 * @param options - Optional `maxAttempts`/`timeoutMs` overrides.
 * @returns The class method decorator.
 */
export function jobHandler(type: string, options: JobHandlerOptions = {}) {
    if (typeof type !== 'string' || type.trim().length === 0) {
        throw new TypeError(`@jobHandler: type must be a non-empty string, got ${JSON.stringify(type)}`);
    }
    const { maxAttempts, timeoutMs } = options;
    if (maxAttempts !== undefined && (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1)) {
        throw new TypeError(
            `@jobHandler('${type}'): maxAttempts must be a positive integer, got ${String(maxAttempts)}`
        );
    }
    if (timeoutMs !== undefined && (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1)) {
        throw new TypeError(`@jobHandler('${type}'): timeoutMs must be a positive integer, got ${String(timeoutMs)}`);
    }

    if (typeof process === 'undefined') {
        throw new FrameworkError(
            '@jobHandler is a Node-only decorator — job handlers cannot run in the browser. Move the handler to a server-side class.'
        );
    }

    return function (value: Function, context: ClassMethodDecoratorContext): void {
        if (context.kind !== 'method') {
            throw new TypeError(`@jobHandler can only be applied to a method — received '${context.kind}'.`);
        }
        void value;
        context.metadata[`${JOB_HANDLER_METADATA_PREFIX}${String(context.name)}`] = {
            type,
            ...(maxAttempts !== undefined ? { maxAttempts } : {}),
            ...(timeoutMs !== undefined ? { timeoutMs } : {}),
        } satisfies JobHandlerMetadata;
    };
}

/**
 * Reads the registration recorded by `@jobHandler` for a method.
 *
 * @param target - The decorated class constructor (or an instance).
 * @param methodName - The decorated method name.
 * @returns The registration, or `undefined` when not a job handler.
 */
export function getJobHandlerMetadata(target: object, methodName: string): JobHandlerMetadata | undefined {
    const metadata = (target as { [Symbol.metadata]?: Record<string, unknown> })?.[Symbol.metadata] ?? {};
    return metadata[`${JOB_HANDLER_METADATA_PREFIX}${methodName}`] as JobHandlerMetadata | undefined;
}
