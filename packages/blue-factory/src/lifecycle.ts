import { like } from '@blue/util/types';
import { Registry } from './registry';

export interface Destroyable {
    destroyed: boolean;
    destroy(): void;
}

export interface AsyncDestroyable extends Destroyable {
    destroy(): Promise<void>;
}

export interface Initializable {
    init(...args: unknown[]): void;
}

export interface Closeable {
    close(): void;
}

export interface AsyncCloseable extends Closeable {
    close(): Promise<void>;
}

export interface Lifecycle {
    readonly isRunning: boolean;
    start(): void;
    stop(): void;
}

export interface Phased {
    readonly phase: number;
}

export interface SmartLifecycle extends Lifecycle, Phased {
    readonly isAutoStartup: boolean;
}

export interface LifecycleProcessor extends Lifecycle {
    onClose(registry: Registry): void;
    onRefresh(registry: Registry): void;
}

/**
 * @property {boolean} destroyed
 */

/**
 */

/**
 * @returns {Promise}
 */

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

export class DefaultLifecycleProcessor implements LifecycleProcessor {
    isRunning: boolean;

    constructor() {
        this.isRunning = false;
    }

    onClose(registry: Registry): void {
        const stopTargets = this._resolveLifecycleTargets(registry)
            .filter(likeSmartLifecycle)
            .sort((a, b) => b.phase - a.phase);

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
            .sort((a, b) => a.phase - b.phase);

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
