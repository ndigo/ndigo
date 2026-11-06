/**
 * `JobHandlerRegistry` — discovers `@jobHandler` methods and holds handlers.
 */
import { FrameworkError, getSymbolMetadata } from '@ndigo/core';
import { like } from '@ndigo/util/types';
import type { ApplicationContext } from '@ndigo/context';
import { JOB_HANDLER_METADATA_PREFIX, type JobHandler, type JobHandlerMetadata } from './job-handler';

/**
 * One registered handler, ready to execute.
 */
export interface RegisteredJobHandler {
    /** The job type served. */
    type: string;
    /** `<beanName>.<methodName>` — diagnostics and spans. */
    name: string;
    maxAttempts?: number;
    timeoutMs?: number;
    run: JobHandler;
}

/**
 * Holds the job-type → handler mapping. Two registration paths (AD-72 D-5):
 *
 * - **Declarative** — `@jobHandler('type')` methods on beans are discovered
 *   when the registry starts (container lifecycle: `SmartLifecycle`, phase 0,
 *   auto-start; the runner starts in phase 10, after the scan).
 * - **Programmatic** — {@link register} for functional handlers and tests.
 *
 * Duplicate types, handlers on class (not instance) registrations, and
 * non-callable members all fail loud at start.
 */
export class JobHandlerRegistry {
    #applicationContext: ApplicationContext | null = null;
    readonly #handlers = new Map<string, RegisteredJobHandler>();

    /**
     * Whether the lifecycle has started the scan.
     */
    isRunning = false;

    /**
     * Lifecycle ordering: scanned before the runner (phase 10).
     */
    readonly phase = 0;

    /**
     * Auto-start on refresh (factory `SmartLifecycle` contract).
     */
    readonly isAutoStartup = true;

    /**
     * Whether this registry has been destroyed.
     */
    destroyed = false;

    /**
     * The registered handlers, in registration order.
     *
     * @returns The handlers.
     */
    get handlers(): readonly RegisteredJobHandler[] {
        return [...this.#handlers.values()];
    }

    /**
     * Container injection: stores the context for the auto-start scan.
     *
     * @param applicationContext - The application context.
     */
    setApplicationContext(applicationContext: ApplicationContext): void {
        this.#applicationContext = applicationContext;
    }

    /**
     * Registers one handler for a job type.
     *
     * @param type - The job type.
     * @param handler - The handler.
     * @param options - Optional `maxAttempts`/`timeoutMs` overrides.
     * @param name - Diagnostics name (defaults to `type`).
     * @throws When the type is already registered.
     */
    register(type: string, handler: JobHandler, options: JobHandlerMetadata = { type }, name = type): void {
        if (this.#handlers.has(type)) {
            throw new FrameworkError(
                `JobHandlerRegistry: duplicate handler for job type '${type}' — ` +
                    `'${name}' collides with '${this.#handlers.get(type)?.name}'`
            );
        }
        this.#handlers.set(type, {
            type,
            name,
            ...(options.maxAttempts !== undefined ? { maxAttempts: options.maxAttempts } : {}),
            ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
            run: handler,
        });
    }

    /**
     * Looks up the handler for a job type.
     *
     * @param type - The job type.
     * @returns The handler, or `undefined` when unregistered.
     */
    get(type: string): RegisteredJobHandler | undefined {
        return this.#handlers.get(type);
    }

    /**
     * SmartLifecycle start: scans the bound context for `@jobHandler`
     * methods and registers them. Idempotent.
     *
     * @throws When no context is bound or a registration is
     *   invalid (class instead of instance, non-callable member, duplicate type).
     */
    start(): void {
        if (this.isRunning) {
            return;
        }
        if (this.destroyed) {
            throw new FrameworkError('JobHandlerRegistry has been destroyed — a destroyed registry cannot restart');
        }
        const context = this.#applicationContext;
        if (context === null) {
            throw new FrameworkError(
                'JobHandlerRegistry: no application context — the container injects it via ApplicationContextAware before start'
            );
        }
        for (const name of Object.keys(context)) {
            const value = context.getValue(name);
            if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
                continue;
            }
            this.#scanValue(name, value);
        }
        this.isRunning = true;
    }

    /**
     * SmartLifecycle stop: clears the discovered registrations. Programmatic
     * registrations made before `start` are re-added on the next scan only if
     * they live on scanned beans; functional handlers must be re-registered.
     */
    stop(): void {
        if (!this.isRunning) {
            return;
        }
        // Map iterators tolerate deleting the current entry; every key is
        // visited exactly once, and stop() must clear them all.
        for (const type of this.#handlers.keys()) {
            this.#handlers.delete(type);
        }
        this.isRunning = false;
    }

    /**
     * Container teardown: releases the context and registrations.
     */
    async destroy(): Promise<void> {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        this.stop();
        this.#applicationContext = null;
    }

    #scanValue(name: string, value: unknown): void {
        const metadata = getSymbolMetadata(value);

        if (typeof value === 'function') {
            const hasHandlers = Object.keys(metadata).some((key) => key.startsWith(JOB_HANDLER_METADATA_PREFIX));
            if (hasHandlers) {
                throw new FrameworkError(
                    `JobHandlerRegistry: bean '${name}' has @jobHandler methods but is registered as a class, not an ` +
                        'instance — register an instance so the handler owner can be resolved'
                );
            }
            return;
        }

        const owner = value as Record<string, unknown>;
        for (const [key, raw] of Object.entries(metadata)) {
            if (!key.startsWith(JOB_HANDLER_METADATA_PREFIX)) {
                continue;
            }
            const registration = raw as JobHandlerMetadata; // written by @jobHandler at decoration time
            if (registration === null || typeof registration !== 'object' || typeof registration.type !== 'string') {
                continue;
            }
            const methodName = key.substring(JOB_HANDLER_METADATA_PREFIX.length);
            const method = owner[methodName];
            if (typeof method !== 'function') {
                throw new FrameworkError(
                    `JobHandlerRegistry: '${name}.${methodName}' is marked @jobHandler but is not a callable method`
                );
            }
            const handlerName = `${name}.${methodName}`;
            this.register(
                registration.type,
                (payload, context) => (method as JobHandler).call(owner, payload, context),
                registration,
                handlerName
            );
        }
    }
}

/**
 * Structural type guard for {@link JobHandlerRegistry} — the `like*`
 * convention used where a bean or option is verified before use (sibling of
 * {@link "job-driver".likeJobDriver | likeJobDriver}).
 *
 * @param value - The candidate value.
 * @returns Whether it exposes the registry seam (`get` + `register`).
 */
export const likeJobHandlerRegistry = (value: unknown): value is JobHandlerRegistry =>
    like({ get: Function, register: Function })(value);
