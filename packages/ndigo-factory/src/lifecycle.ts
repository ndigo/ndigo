/**
 * Lifecycle contracts and structural guards.
 */
import { compareBy, invertComparison, numberComparator } from '@ndigo/core';
import { like } from '@ndigo/util/types';
import { Registry } from './registry';

/**
 * A value that can be destroyed once it is no longer needed.
 */
export interface Destroyable {
    /** Whether the value has been destroyed. */
    destroyed: boolean;
    /** Releases the value's resources. */
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
 * A value with a post-construction `init()` hook.
 */
export interface Initializable {
    /**
     * Runs the post-construction initialization hook.
     *
     * @param args - Initialization arguments.
     */
    init(...args: unknown[]): void;
}

/**
 * A value that can be closed to release its resources.
 */
export interface Closeable {
    /** Releases the value's resources. */
    close(): void;
}

/**
 * A {@link Closeable} whose close is asynchronous.
 */
export interface AsyncCloseable extends Closeable {
    /** Releases the value's resources asynchronously. */
    close(): Promise<void>;
}

/**
 * A component with an explicit start/stop lifecycle.
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
 * A {@link Lifecycle} that starts automatically and runs in a declared phase.
 */
export interface SmartLifecycle extends Lifecycle, Phased {
    /** Whether the component starts with the context. */
    readonly isAutoStartup: boolean;
}

/**
 * Drives registered {@link SmartLifecycle} targets on context refresh and close.
 */
export interface LifecycleProcessor extends Lifecycle {
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
export const likeDestroyable = (value: unknown): value is Destroyable =>
    like({ destroy: Function, destroyed: Boolean })(value);

/**
 * Narrows a value to the {@link Initializable} shape.
 *
 * @returns Whether or not the `value` is {@link Initializable|Initializable}.
 */
export const likeInitializable = (value: unknown): value is Initializable => like({ init: Function })(value);

/**
 * Narrows a value to the {@link Closeable} shape.
 *
 * @returns Whether or not the `value` is {@link Closeable|Closeable}.
 */
export const likeCloseable = (value: unknown): value is Closeable => like({ close: Function })(value);

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
 * Narrows a value to the {@link SmartLifecycle} shape.
 *
 * @returns Whether or not the `value` is {@link SmartLifecycle|SmartLifecycle}.
 */
export const likeSmartLifecycle = (value: unknown): value is SmartLifecycle =>
    likeLifecycle(value) && likePhased(value) && _likeAutoStartup(value);

/**
 * Default {@link LifecycleProcessor}: on refresh starts auto-startup targets
 * in ascending phase order; on close stops running targets in descending
 * phase order.
 */
export class DefaultLifecycleProcessor implements LifecycleProcessor {
    /** Whether the processor is running. */
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
            .filter(likeSmartLifecycle)
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
            .filter(likeSmartLifecycle)
            .filter((target) => target.isAutoStartup)
            .sort(compareBy((target) => target.phase, numberComparator.compare));

        for (const target of startTargets) {
            if (!target.isRunning) {
                target.start();
            }
        }

        this.start();
    }

    /** Marks the processor running. */
    start(): void {
        this.isRunning = true;
    }

    /** Marks the processor stopped. */
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
