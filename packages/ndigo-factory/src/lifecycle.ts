/**
 */
import { compareBy, invertComparison, numberComparator } from '@ndigo/core';
import { like } from '@ndigo/util/types';
import { Registry } from './registry';

/**
 * A value that can be destroyed once it is no longer needed.
 */
export interface Destroyable {
    destroyed: boolean;
    destroy(): void;
}

/**
 * A {@link Destroyable} whose destruction is asynchronous.
 */
export interface AsyncDestroyable extends Destroyable {
    destroy(): Promise<void>;
}

/**
 * A value with a post-construction `init()` hook.
 */
export interface Initializable {
    init(...args: unknown[]): void;
}

/**
 * A value that can be closed to release its resources.
 */
export interface Closeable {
    close(): void;
}

/**
 * A {@link Closeable} whose close is asynchronous.
 */
export interface AsyncCloseable extends Closeable {
    close(): Promise<void>;
}

/**
 * A component with an explicit start/stop lifecycle.
 */
export interface Lifecycle {
    readonly isRunning: boolean;
    start(): void;
    stop(): void;
}

/**
 * A component that runs in a numeric startup phase.
 */
export interface Phased {
    readonly phase: number;
}

/**
 * A {@link Lifecycle} that starts automatically and runs in a declared phase.
 */
export interface SmartLifecycle extends Lifecycle, Phased {
    readonly isAutoStartup: boolean;
}

/**
 * Drives registered {@link SmartLifecycle} targets on context refresh and close.
 */
export interface LifecycleProcessor extends Lifecycle {
    onClose(registry: Registry): void;
    onRefresh(registry: Registry): void;
}

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Destroyable|Destroyable}.
 */
export const likeDestroyable = (value: unknown): value is Destroyable =>
    like({ destroy: Function, destroyed: Boolean })(value);

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Initializable|Initializable}.
 */
export const likeInitializable = (value: unknown): value is Initializable => like({ init: Function })(value);

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Closeable|Closeable}.
 */
export const likeCloseable = (value: unknown): value is Closeable => like({ close: Function })(value);

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Lifecycle|Lifecycle}.
 */
export const likeLifecycle = (value: unknown): value is Lifecycle =>
    like({ isRunning: Boolean, start: Function, stop: Function })(value);

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Phased|Phased}.
 */
export const likePhased = (value: unknown): value is Phased => like({ phase: Number })(value);

const _likeAutoStartup = like({ isAutoStartup: Boolean });

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link SmartLifecycle|SmartLifecycle}.
 */
export const likeSmartLifecycle = (value: unknown): value is SmartLifecycle =>
    likeLifecycle(value) && likePhased(value) && _likeAutoStartup(value);

/**
 * Default {@link LifecycleProcessor}: on refresh starts auto-startup targets
 * in ascending phase order; on close stops running targets in descending
 * phase order.
 */
export class DefaultLifecycleProcessor implements LifecycleProcessor {
    isRunning: boolean;

    constructor() {
        this.isRunning = false;
    }

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

    start(): void {
        this.isRunning = true;
    }

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
