/**
 * @author Jeff Rose
 */

import { JSONValue } from '@blue/core';
import { EventEmitter as BaseEventEmitter } from '@blue/platform';
import { Constructable } from '@blue/core';
import { either, complement } from '@blue/util/logic';
import { lastIndexOf } from '@blue/util/list';
import { prop } from '@blue/util/object';
import { propEq } from 'ramda';
import { equals } from '@blue/util/relation';
import { isFunction, isNil, like, is } from '@blue/util/types';

// propIs helper since it's not exported from @blue/util/types
const propIs = (type: any) => (name: string) => (obj: any) => is(type, prop(name, obj));

const { freeze, keys } = Object,
    { defineProperty } = Reflect,
    isNotNil = complement(isNil);

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
export const likeEmittable = like({ addEventListener: Function, removeEventListener: Function }) as (
    value
) => value is Emittable;

/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is {@link Listener|Listener}.
 */
export const likeListener = either(isFunction, like({ fn: Function })) as (value) => value is Listener;

/**
 * @template T
 * @param {module:core.Constructable<T>} [superclass=Object] The superclass to extend
 * @returns {module:core.Constructable<T>} A class definition
 */
export const AsEventEmitter = <T extends Constructable>(superclass: T): T & Constructable<EventEmitter> =>
    class extends superclass {
        #events: Map<PropertyKey, Listener[]>;
        #maxListeners: number;

        constructor(...args: any[]) {
            super(...args);
            defineProperty(this, '_events', {
                value: new Map(),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, '_maxListeners', {
                value: 10,
                configurable: true,
                enumerable: false,
                writable: true,
            });
        }

        /**
         * @param {*} event The event type
         * @param {...*} data The event payload
         * @returns {boolean} Returns `true` if the event had listeners, `false` otherwise
         */
        emit(event, ...data: unknown[]): boolean {
            if (this.#events.has(event)) {
                const listeners = this.#events.get(event),
                    length = listeners.length;
                let index = 0;
                for (; index < length; index++) {
                    const listener = listeners[index],
                        fn = likeListener(listener) ? listener.fn : listener;
                    fn.apply(this, data);
                    if (listener.once) {
                        this.off(event, listener);
                    }
                }
                return true;
            } else {
                return false;
            }
        }

        /**
         * @returns {Array} A list of events for which the emitter has registered listeners
         */
        eventNames(): PropertyKey[] {
            return [...this.#events.keys()];
        }

        /**
         * @returns {number} The current max listener value for the `EventEmitter`, which is either set by {@link setMaxListeners} or defaults to 10.
         */
        getMaxListeners(): number {
            return this.#maxListeners;
        }

        /**
         * @param {*} event The event type
         * @param {Function} [fn] The listener
         * @returns {number} The number of listeners listening to the event named `event`.
         */
        listenerCount(event, fn?: (...args: unknown[]) => unknown): number {
            let count = 0;
            if (this.#events.has(event)) {
                const listeners = this.#events.get(event),
                    filter = isFunction(fn) ? propEq('fn', fn) : () => true,
                    length = listeners.length;
                let index = 0;
                for (; index < length; index++) {
                    if (filter(listeners[index])) {
                        count++;
                    }
                }
            }
            return count;
        }

        /**
         * @param {*} event The event type
         * @returns {Array<module:context.Listener>} A copy of the array of listeners for the event named `event`.
         */
        listeners(event): Listener[] {
            const listeners = this.#events.get(event);
            return listeners ? [...listeners] : [];
        }

        /**
         * @param {*} event The event type
         * @param {Function} fn The listener
         * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
         */
        off(event, fn: (...args: unknown[]) => unknown): this {
            if (this.#events.has(event)) {
                const listeners = this.#events.get(event);
                const listener = likeListener(fn) ? fn : { fn };
                const index = lastIndexOf(listener, listeners);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
                if (!listeners.length) {
                    this.#events.delete(event);
                }
            }
            return this;
        }

        /**
         * @param {*} event The event type
         * @param {Function} fn The listener
         * @param {boolean} [once=false] `true` if the listener should be automatically removed when first invoked.
         * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
         */
        on(event, fn: (...args: unknown[]) => unknown, once = false): this {
            if (isNotNil(event)) {
                if (!isFunction(fn)) {
                    throw new TypeError('Listener must be a function');
                }

                const listener = { fn, once };

                if (!this.#events.has(event)) {
                    this.#events.set(event, []);
                }

                const listeners = this.#events.get(event);
                const index = lastIndexOf(listener, listeners);
                if (index === -1) {
                    listeners.push(listener);
                }
            }
            return this;
        }

        /**
         * @param {*} event The event type
         * @param {Function} fn The listener
         * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
         */
        once(event, fn: (...args: unknown[]) => unknown): this {
            return this.on(event, fn, true);
        }

        /**
         * @param {*} [event] The event type
         * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
         */
        removeAllListeners(event?: PropertyKey): this {
            if (isNotNil(event)) {
                this.#events.delete(event);
            } else {
                this.#events.clear();
            }
            return this;
        }

        /**
         * @param {*} event The event type
         * @param {Function} fn The listener
         * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
         */
        removeListener(event, fn: (...args: unknown[]) => unknown): this {
            return this.off(event, fn);
        }

        /**
         * @param {number} n The number of listeners
         * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
         */
        setMaxListeners(n: number): this {
            this.#maxListeners = n;
            return this;
        }

        toJSON(): JSONValue {
            const keys = this.eventNames(),
                length = keys.length,
                result: Record<string, JSONValue> = {};
            let index = 0;
            for (; index < length; index++) {
                const key = keys[index];
                result[String(key)] = this.listenerCount(key);
            }
            return result;
        }
    };

export class EventEmitter extends AsEventEmitter(BaseEventEmitter) {}

export default EventEmitter;
