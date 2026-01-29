/**
 * @author Jeff Rose
 */
import { Constructable } from '@blue/core';
export interface Listener {
    once?: boolean;
    fn(...data: unknown[]): void;
}
export type ListenerResult = void | boolean | Promise<void> | Promise<boolean>;
export interface EventEmitter<T> extends EventEmitter {
    emit(event: T, ...data: unknown[]): boolean;
    eventNames(): T[];
    getMaxListeners(): number;
    listenerCount(event: T, fn?: (...args: any[]) => any): number;
    listeners(event: T): Listener[];
    off(event: T, fn: (...args: any[]) => any): this;
    on(event: T, fn: (...args: any[]) => any, once?: boolean): this;
    once(event: T, fn: (...args: any[]) => any): this;
    removeAllListeners(event?: T): this;
    removeListener(event: T, fn: (...args: any[]) => any): this;
    setMaxListeners(n: number): this;
}
export interface Emittable<T = any> {
    addEventListener(event: T, listener: (...args: any[]) => any): void;
    removeEventListener(event: T, listener: (...args: any[]) => any): void;
}
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is {@link Emittable|Emittable}.
 */
export declare const likeEmittable: (value: any) => value is Emittable;
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is {@link Listener|Listener}.
 */
export declare const likeListener: (value: any) => value is Listener;
/**
 * @template T
 * @param {module:core.Constructable<T>} [superclass=Object] The superclass to extend
 * @returns {module:core.Constructable<T>} A class definition
 */
export declare const AsEventEmitter: <T extends Constructable>(superclass: T) => T & Constructable<EventEmitter>;
declare const EventEmitter_base: any;
export declare class EventEmitter extends EventEmitter_base {
}
export default EventEmitter;
//# sourceMappingURL=event-emitter.d.ts.map