/**
 * Schedule registry: collects and manages declared schedules.
 */
import { FrameworkError, getSymbolMetadata } from '@ndigo/core';
import type { ApplicationContext } from '@ndigo/context';
import { TASK_SCHEDULER } from './context-tokens';
import { SCHEDULED_METADATA_PREFIX } from './scheduled';
import { NormalizedScheduledSpec } from './spec';
import { scheduleFromSpec } from './schedule';
import { ScheduledTaskDefinition, TaskScheduler, likeTaskScheduler } from './task-scheduler';
import { instrumentTask } from './telemetry';

/**
 * Narrows metadata values to normalized schedule specs. The value was
 * validated and written by `@scheduled` at decoration time; this guard is
 * the boundary check before reading its fields.
 *
 * @param value - The metadata value to test.
 * @returns Whether the value is a normalized schedule spec with a trigger.
 */
const likeNormalizedSpec = (value: unknown): value is NormalizedScheduledSpec => {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const spec = value as NormalizedScheduledSpec; // written by @scheduled after decoration-time validation
    return spec.cron !== undefined || spec.fixedRateMs !== undefined || spec.fixedDelayMs !== undefined;
};

/**
 * Discovers `@scheduled` methods on application-context beans, registers
 * them (telemetry-wrapped) with the context's `taskScheduler` bean, and
 * manages the scheduler's lifecycle.
 *
 * As a container bean it is driven by the factory lifecycle (AD-20 D2):
 * registered by `NodeAutoConfiguration`, injected with the context via
 * `ApplicationContextAware`, **auto-started on refresh** (`SmartLifecycle`),
 * and stopped/destroyed on context close — zero extra wiring for Node apps.
 *
 * Scan model mirrors the handler-mapping scan (`Object.keys(context)` →
 * per-name value): every bean instance's class metadata is read through
 * `Symbol.metadata`, and each `schedule:<method>` entry is bound to its
 * owner instance. A `@scheduled` class registered as a prototype (not an
 * instance) has no resolvable owner and fails start loudly (AD-20 D5.5).
 */
export class ScheduleRegistry {
    #applicationContext: ApplicationContext | null = null;
    #scheduler: TaskScheduler | null = null;
    #tasks: ScheduledTaskDefinition[] = [];

    /**
     * Whether the lifecycle has started the scheduler runtime.
     */
    isRunning = false;

    /**
     * Lifecycle ordering (factory `Phased` contract).
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
     * The tasks discovered by the last scan.
     */
    get tasks(): readonly ScheduledTaskDefinition[] {
        return [...this.#tasks];
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
     * SmartLifecycle start: scans the context, registers telemetry-wrapped
     * tasks with the `taskScheduler` bean, and starts the timer loop.
     *
     * Idempotent; scans once per lifecycle (double-init guard on the
     * underlying scan).
     *
     * @throws {FrameworkError} When no context is bound or the context has
     *   no `taskScheduler` bean (the node platform provides one).
     */
    start(): void {
        if (this.isRunning) {
            return;
        }
        if (this.destroyed) {
            throw new FrameworkError('ScheduleRegistry has been destroyed — a destroyed registry cannot restart');
        }
        const context = this.#applicationContext;
        if (context === null) {
            throw new FrameworkError(
                'ScheduleRegistry: no application context — the container injects it via ApplicationContextAware before start'
            );
        }
        if (!context.hasValue(TASK_SCHEDULER)) {
            throw new FrameworkError(
                `ScheduleRegistry: no '${TASK_SCHEDULER.description}' bean — register the Node auto-configuration (NodeAutoConfiguration) to provision the scheduler`
            );
        }
        const scheduler = context.getValue(TASK_SCHEDULER);
        if (!likeTaskScheduler(scheduler)) {
            throw new FrameworkError(`ScheduleRegistry: '${TASK_SCHEDULER.description}' is not a TaskScheduler`);
        }

        this.#scheduler = scheduler;
        this.#registerAll(context, scheduler);
        scheduler.start();
        this.isRunning = true;
    }

    /**
     * SmartLifecycle stop: stops the timer loop and unregisters the scanned
     * tasks. In-flight runs continue; `destroy` drains them.
     *
     * Unlike {@link ScheduleRegistry.close}, stop keeps the context and
     * scheduler bindings so a subsequent `start()` can re-scan and resume —
     * lifecycle stop/start cycles on the same registry are supported.
     */
    stop(): void {
        if (!this.isRunning) {
            return;
        }
        this.#scheduler?.stop();
        this.#unregisterTasks();
        this.isRunning = false;
    }

    /**
     * Container teardown: stops and drains, then marks destroyed. The
     * container does not await the drain (context close is synchronous).
     */
    async destroy(): Promise<void> {
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;
        // Drain in the background — the container's close is synchronous and
        // will not await this (graceful shutdown reaps it via the resources).
        void this.#scheduler?.destroy();
        this.close();
        this.isRunning = false;
    }

    /**
     * Scans the application context and registers every scheduled method
     * with the given scheduler (manual alternative to the lifecycle start).
     *
     * Named `scan`, not `init` — the DI container auto-invokes `init` on
     * any bean implementing that shape (Initializable), which would collide.
     *
     * @param applicationContext - The context whose beans are scanned.
     * @param scheduler - The scheduler tasks are registered with.
     * @throws {FrameworkError} When already initialized or a scheduled
     *   method's owner cannot be resolved.
     */
    scan(applicationContext: ApplicationContext, scheduler: TaskScheduler): void {
        if (this.#tasks.length > 0) {
            throw new FrameworkError(
                'ScheduleRegistry has already been initialized — call close() first or create a fresh instance'
            );
        }
        this.#applicationContext = applicationContext;
        this.#scheduler = scheduler;
        this.#registerAll(applicationContext, scheduler);
    }

    /**
     * Unregisters the discovered tasks and releases the bound context —
     * full teardown; the registry can be re-bound via
     * `setApplicationContext` (or a fresh lifecycle pass).
     */
    close(): void {
        this.#unregisterTasks();
        this.#applicationContext = null;
        this.#scheduler = null;
    }

    /**
     * Removes the scanned tasks from the bound scheduler.
     */
    #unregisterTasks(): void {
        if (this.#scheduler !== null) {
            for (const task of this.#tasks) {
                this.#scheduler.unregister(task.name);
            }
        }
        this.#tasks = [];
    }

    #registerAll(applicationContext: ApplicationContext, scheduler: TaskScheduler): void {
        this.#tasks = [];
        for (const name of Object.keys(applicationContext)) {
            const value = applicationContext.getValue(name);
            if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
                continue;
            }
            this.#scanValue(name, value, scheduler);
        }
    }

    /**
     * Reads one context value's schedule metadata and registers matched
     * methods, binding each run to its owner instance.
     *
     * @param name - The context bean name (task names are `<name>.<method>`).
     * @param value - The bean value.
     * @param scheduler - The scheduler to register with.
     */
    #scanValue(name: string, value: unknown, scheduler: TaskScheduler): void {
        const metadata = getSymbolMetadata(value);

        if (typeof value === 'function') {
            const hasScheduledMethods = Object.keys(metadata).some((key) => key.startsWith(SCHEDULED_METADATA_PREFIX));
            if (hasScheduledMethods) {
                throw new FrameworkError(
                    `ScheduleRegistry: bean '${name}' has @scheduled methods but is registered as a class, not an ` +
                        'instance — register an instance so the task owner can be resolved (AD-20 D5.5)'
                );
            }
            return;
        }

        const owner = value as Record<string, unknown>;
        for (const [key, raw] of Object.entries(metadata)) {
            if (!key.startsWith(SCHEDULED_METADATA_PREFIX) || !likeNormalizedSpec(raw)) {
                continue;
            }
            const methodName = key.substring(SCHEDULED_METADATA_PREFIX.length);
            const method = owner[methodName];
            if (typeof method !== 'function') {
                throw new FrameworkError(
                    `ScheduleRegistry: '${name}.${methodName}' is marked @scheduled but is not a callable method`
                );
            }

            const definition: ScheduledTaskDefinition = {
                name: `${name}.${methodName}`,
                schedule: scheduleFromSpec(raw),
                maxRunTimeMs: raw.maxRunTimeMs,
                lockKey: raw.lockKey,
                lockWaitMs: raw.lockWaitMs,
                lockWaitStepMs: raw.lockWaitStepMs,
                lockTtlMs: raw.lockTtlMs,
                run: () => (method as Function).call(owner),
            };
            scheduler.register(instrumentTask(definition));
            this.#tasks.push(definition);
        }
    }
}
