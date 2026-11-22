/**
 * Lifecycle contracts and structural guards.
 */
import { compareBy, invertComparison, numberComparator } from '@ndigo/core';
import { like } from '@ndigo/util/types';
import { Registry } from './registry';

/**
 * A value whose resources are released permanently.
 *
 * Destruction is terminal: a destroyed value is never reused, and resolving
 * the entry again constructs a new instance. Async teardown bridges to
 * {@link AsyncDestroyable}; the synchronous context close does not await it.
 */
export interface Destroyable {
    /**
     * Releases the value's resources.
     *
     * Guard the body so repeated calls stay safe: teardown is idempotent by
     * contract, not by caller discipline.
     */
    destroy(): void;
}

/**
 * A {@link Destroyable} whose destruction is asynchronous.
 */
export interface AsyncDestroyable extends Destroyable {
    /** Releases the value's resources asynchronously. */
    destroy(): Promise<void>;
}

/**
 * A value with a one-shot `init()` hook.
 *
 * `init()` runs once when the container finishes creating the instance —
 * after property population and aware callbacks — and the instance is never
 * initialized again. It is the irreversible setup half of the lifecycle;
 * {@link Lifecycle.start} is the reversible run phase.
 */
export interface Initializable {
    /**
     * Runs the initialization hook.
     *
     * @param args - Initialization arguments.
     */
    init(...args: unknown[]): void;
}

/**
 * A component with an explicit, reversible start/stop lifecycle.
 *
 * Unlike {@link Initializable.init}, `start()`/`stop()` may cycle: a running
 * component is stopped on context close, and {@link ManagedLifecycle} targets
 * cycle across context refreshes.
 */
export interface Lifecycle {
    /** Whether the component is running. */
    readonly isRunning: boolean;
    /** Starts the component. */
    start(): void;
    /** Stops the component. */
    stop(): void;
}

/**
 * A component that runs in a numeric startup phase.
 */
export interface Phased {
    /** The component's startup phase. */
    readonly phase: number;
}

/**
 * A {@link Lifecycle} the container drives automatically: started in ascending
 * phase order on context refresh, stopped in descending phase order on close.
 */
export interface ManagedLifecycle extends Lifecycle, Phased {
    /** Whether the component starts with the context. */
    readonly isAutoStartup: boolean;
}

/**
 * Drives registered {@link ManagedLifecycle} targets on context refresh and close.
 */
export interface LifecycleCoordinator extends Lifecycle {
    /**
     * Stops running targets on context close.
     *
     * @param registry - The registry of lifecycle targets.
     */
    onClose(registry: Registry): void;
    /**
     * Starts auto-startup targets on context refresh.
     *
     * @param registry - The registry of lifecycle targets.
     */
    onRefresh(registry: Registry): void;
}

/**
 * Narrows a value to the {@link Destroyable} shape.
 *
 * @returns Whether or not the `value` is {@link Destroyable|Destroyable}.
 */
export const likeDestroyable = (value: unknown): value is Destroyable => like({ destroy: Function })(value);

/**
 * Narrows a value to the {@link Initializable} shape.
 *
 * @returns Whether or not the `value` is {@link Initializable|Initializable}.
 */
export const likeInitializable = (value: unknown): value is Initializable => like({ init: Function })(value);

/**
 * Narrows a value to the {@link Lifecycle} shape.
 *
 * @returns Whether or not the `value` is {@link Lifecycle|Lifecycle}.
 */
export const likeLifecycle = (value: unknown): value is Lifecycle =>
    like({ isRunning: Boolean, start: Function, stop: Function })(value);

/**
 * Narrows a value to the {@link Phased} shape.
 *
 * @returns Whether or not the `value` is {@link Phased|Phased}.
 */
export const likePhased = (value: unknown): value is Phased => like({ phase: Number })(value);

const _likeAutoStartup = like({ isAutoStartup: Boolean });

/**
 * Narrows a value to the {@link ManagedLifecycle} shape.
 *
 * @returns Whether or not the `value` is {@link ManagedLifecycle|ManagedLifecycle}.
 */
export const likeManagedLifecycle = (value: unknown): value is ManagedLifecycle =>
    likeLifecycle(value) && likePhased(value) && _likeAutoStartup(value);

/**
 * Default {@link LifecycleCoordinator}: on refresh starts auto-startup targets
 * in ascending phase order; on close stops running targets in descending
 * phase order.
 *
 * @example
 * ```ts
 * const coordinator = new DefaultLifecycleCoordinator();
 * ```
 */
export class DefaultLifecycleCoordinator implements LifecycleCoordinator {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "DefaultLifecycleCoordinator".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object DefaultLifecycleCoordinator]"
     */
    get [Symbol.toStringTag](): string {
        return 'DefaultLifecycleCoordinator';
    }

    /** Whether the coordinator is running. */
    isRunning: boolean;

    constructor() {
        this.isRunning = false;
    }

    /**
     * Stops running targets in descending phase order.
     *
     * @param registry - The registry of lifecycle targets.
     */
    onClose(registry: Registry): void {
        const stopTargets = this._resolveLifecycleTargets(registry)
            .filter(likeManagedLifecycle)
            .sort(invertComparison(compareBy((target) => target.phase, numberComparator.compare)));

        for (const target of stopTargets) {
            if (target.isRunning) {
                target.stop();
            }
        }

        this.stop();
    }

    /**
     * Starts auto-startup targets in ascending phase order.
     *
     * @param registry - The registry of lifecycle targets.
     */
    onRefresh(registry: Registry): void {
        const startTargets = this._resolveLifecycleTargets(registry)
            .filter(likeManagedLifecycle)
            .filter((target) => target.isAutoStartup)
            .sort(compareBy((target) => target.phase, numberComparator.compare));

        for (const target of startTargets) {
            if (!target.isRunning) {
                target.start();
            }
        }

        this.start();
    }

    /** Marks the coordinator running. */
    start(): void {
        this.isRunning = true;
    }

    /** Marks the coordinator stopped. */
    stop(): void {
        this.isRunning = false;
    }

    private _resolveLifecycleTargets(registry: Registry): Lifecycle[] {
        const values: Lifecycle[] = [];

        for (const key of Reflect.ownKeys(registry as object)) {
            if (typeof key !== 'string' || key.startsWith('$') || !registry.hasValue(key)) {
                continue;
            }

            const value = registry.getValue(key);

            if (likeLifecycle(value)) {
                values.push(value);
            }
        }

        return values;
    }
}
