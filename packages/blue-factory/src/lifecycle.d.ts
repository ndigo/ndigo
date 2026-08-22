import { Registry } from './registry';
export interface Destroyable {
    destroyed: boolean;
    destroy(): void;
}
export interface AsyncDestroyable extends Destroyable {
    destroy(): Promise<void>;
}
export interface Initializable {
    init(...args: any[]): void;
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
 * @extends module:factory.Destroyable
 */
/**
 * @returns {Promise}
 */
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Destroyable|Destroyable}.
 */
export declare const likeDestroyable: (value: any) => value is Destroyable;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Initializable|Initializable}.
 */
export declare const likeInitializable: (value: any) => value is Initializable;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Closeable|Closeable}.
 */
export declare const likeCloseable: (value: any) => value is Closeable;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Lifecycle|Lifecycle}.
 */
export declare const likeLifecycle: (value: any) => value is Lifecycle;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Phased|Phased}.
 */
export declare const likePhased: (value: any) => value is Phased;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link SmartLifecycle|SmartLifecycle}.
 */
export declare const likeSmartLifecycle: (value: any) => value is SmartLifecycle;
export declare class DefaultLifecycleProcessor implements LifecycleProcessor {
    isRunning: boolean;
    constructor();
    onClose(registry: Registry): void;
    onRefresh(registry: Registry): void;
    start(): void;
    stop(): void;
    private _resolveLifecycleTargets;
}
