/**
 * @author Jeff Rose
 */

import { JSONValue } from '@blue/core';
import { EventEmitter as BaseEventEmitter } from 'events';
import { Constructable } from '@blue/core';
import { either, complement } from '@blue/util/logic';
import { lastIndexOf } from '@blue/util/list';
import { prop } from '@blue/util/object';
import { equals } from '@blue/util/relation';
import { propEq } from '@blue/util/relation';
import { isFunction, isNil, like, is } from '@blue/util/types';
import { Aware, likeAwareAnd } from '@blue/factory';

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

export type EventType = PropertyKey;

export interface EventEmitter<T = EventType> {
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

export interface ApplicationEventEmitterAware extends Aware {
    setApplicationEventEmitter(eventEmitter: EventEmitter<EventType>): void;
}

export const likeApplicationEventEmitterAware = likeAwareAnd(like({
    setApplicationEventEmitter: Function,
})) as (value: unknown) => value is ApplicationEventEmitterAware;

/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is {@link EventEmitter|EventEmitter}.
 */
export const likeEventEmitter = like({
    emit: Function,
    eventNames: Function,
    getMaxListeners: Function,
    listenerCount: Function,
    listeners: Function,
    off: Function,
    on: Function,
    once: Function,
    removeAllListeners: Function,
    removeListener: Function,
    setMaxListeners: Function,
}) as (value: unknown) => value is EventEmitter;

/**
 * @template T
 * @param {module:core.Constructable<T>} [superclass=Object] The superclass to extend
 * @returns {module:core.Constructable<T>} A class definition
 */
export const AsEventEmitter = <TEvent = EventType, TBase extends Constructable = Constructable>(
    superclass: TBase,
): TBase & Constructable<EventEmitter<TEvent>> =>
    class extends superclass implements EventEmitter<TEvent> {
        #events: Map<TEvent, Listener[]>;
        #maxListeners: number;

        constructor(...args: any[]) {
            super(...args);
            // Private fields are not enumerable; direct assignment is sufficient.
            this.#events = new Map<TEvent, Listener[]>();
            this.#maxListeners = 10;
        }

        /**
         * @param {*} event The event type
         * @param {...*} data The event payload
         * @returns {boolean} Returns `true` if the event had listeners, `false` otherwise
         */
        emit(event: TEvent, ...data: unknown[]): boolean {
            if (this.#events.has(event)) {
                const listeners = this.#events.get(event),
                    length = listeners.length;
                let index = 0;
                for (; index < length; index++) {
                    const listener = listeners[index],
                        fn = listener.fn;
                    fn.apply(this, data);
                    if (listener.once) {
                        this.off(event, listener.fn);
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
        eventNames(): TEvent[] {
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
        listenerCount(event: TEvent, fn?: (...args: unknown[]) => unknown): number {
            let count = 0;
            if (this.#events.has(event)) {
                const listeners = this.#events.get(event),
                    filter = isFunction(fn) ? (listener: Listener) => listener.fn === fn : () => true,
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
        listeners(event: TEvent): Listener[] {
            const listeners = this.#events.get(event);
            return listeners ? [...listeners] : [];
        }

        /**
         * @param {*} event The event type
         * @param {Function} fn The listener
         * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
         */
        off(event: TEvent, fn: (...args: unknown[]) => unknown): this {
            if (this.#events.has(event)) {
                const listeners = this.#events.get(event);
                const index = listeners.findIndex(listener => listener.fn === fn);
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
        on(event: TEvent, fn: (...args: unknown[]) => unknown, once = false): this {
            if (isNotNil(event)) {
                if (!isFunction(fn)) {
                    throw new TypeError('Listener must be a function');
                }

                const listener = { fn, once };

                if (!this.#events.has(event)) {
                    this.#events.set(event, []);
                }

                const listeners = this.#events.get(event);
                // Only add if not already present based on the function reference
                if (!listeners.some(l => l.fn === fn)) {
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
        once(event: TEvent, fn: (...args: unknown[]) => unknown): this {
            return this.on(event, fn, true);
        }

        /**
         * @param {*} [event] The event type
         * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
         */
        removeAllListeners(event?: TEvent): this {
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
        removeListener(event: TEvent, fn: (...args: unknown[]) => unknown): this {
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
            const eventNames = this.eventNames(),
                length = eventNames.length,
                result: Record<string, JSONValue> = {};
            let index = 0;
            for (; index < length; index++) {
                const key = eventNames[index];
                result[String(key)] = this.listenerCount(key);
            }
            return result;
        }
    };

export class EventEmitterClass extends AsEventEmitter(Object as Constructable) {}

const internalEmitterKey = '@@emitter/events';

export type EventEmitterTarget<TEvent = EventType> = EventEmitter<TEvent> & {
    '@@emitter/events'?: EventEmitter<TEvent>;
};

/**
 * Function mixin that applies {@link EventEmitter} behavior to an existing object.
 */
export const asEventEmitter = <TTarget extends object, TEvent = EventType>(target: TTarget): TTarget & EventEmitter<TEvent> => {
    if (!target || typeof target !== 'object') {
        throw new TypeError('asEventEmitter target must be an object');
    }

    if (likeEventEmitter(target)) {
        return target as TTarget & EventEmitter<TEvent>;
    }

    const t = target as EventEmitterTarget<TEvent>;
    const emitter: EventEmitter<TEvent> = new EventEmitterClass() as unknown as EventEmitter<TEvent>;

    defineProperty(t, internalEmitterKey, {
        value: emitter,
        configurable: true,
        enumerable: false,
        writable: false,
    });

    const forward = <K extends keyof EventEmitter<TEvent>>(key: K) =>
        function (this: EventEmitterTarget<TEvent>, ...args: any[]) {
            return (this[internalEmitterKey] as any)[key](...args);
        };

    ([
        'emit',
        'eventNames',
        'getMaxListeners',
        'listenerCount',
        'listeners',
        'off',
        'on',
        'once',
        'removeAllListeners',
        'removeListener',
        'setMaxListeners',
    ] as (keyof EventEmitter<TEvent>)[]).forEach((key) => {
        defineProperty(t, key, {
            value: forward(key),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    });

    return target as TTarget & EventEmitter<TEvent>;
};

export default EventEmitterClass;
