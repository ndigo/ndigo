/**
 * Event emitter mixins: async, conditional, positional, and core emitter
 * behavior added to a base class.
 */
import { Constructable } from '@ndigo/core';
import {
    $every,
    addConditionalEventListener,
    addEventHandlers,
    addEventListener,
    addFiniteEventListener,
    emitAllEvents,
    getEventTypes,
    isPositiveNumber,
    removeEventListener,
    getEvents,
    tickAllEvents,
} from './_event-emitter-helpers';
import type {
    EventEmitter,
    AsyncEventEmitter,
    ConditionalEventEmitter,
    PositionalEventEmitter,
    EventListener,
    EventHandler,
    EventType,
    EventHandlers,
} from './event-emitter-types';

/**
 * Adds async event dispatch behavior to a base class.
 */ export const AsAsyncEventEmitter = <T extends Constructable<EventEmitter>>(
    superclass: T
): Constructable<AsyncEventEmitter> & T =>
    class extends superclass implements AsyncEventEmitter {
        /**
         * Dispatches an event on the next microtask.
         *
         * @param type - The event type.
         * @param data - Event payload values.
         * @returns A promise that resolves after dispatch.
         */
        async tick(type: string | symbol, ...data: unknown[]): Promise<void> {
            return tickAllEvents(this, type, data);
        }
    };

/**
 * Adds conditional and finite-listener helpers to a base class.
 */
export const AsConditionalEventEmitter = <T extends Constructable<EventEmitter>>(
    superclass: T
): Constructable<ConditionalEventEmitter> & T =>
    class extends superclass implements ConditionalEventEmitter {
        /**
         * Registers a listener that fires a fixed number of times.
         *
         * @param type - The event type.
         * @param times - The number of invocations to allow.
         * @param listener - The listener to register.
         * @returns This emitter.
         */
        many(type: string | symbol = $every, times: number, listener: Function): this {
            if (typeof type === 'number' && typeof times === 'function' && typeof listener === 'undefined') {
                listener = times;
                times = type;
                type = $every;
            }

            if (!isPositiveNumber(times)) {
                throw new TypeError('times must be a positive number');
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addFiniteEventListener(this, type, times, listener as EventListener);
            return this;
        }

        /**
         * Registers a listener that fires once.
         *
         * @param type - The event type.
         * @param listener - The listener to register.
         * @returns This emitter.
         */
        once(type: string | symbol = $every, listener: Function): this {
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addFiniteEventListener(this, type, 1, listener as EventListener);
            return this;
        }

        /**
         * Registers a listener that removes itself when it returns `true`.
         *
         * @param type - The event type.
         * @param listener - The listener to register.
         * @returns This emitter.
         */
        until(type: string | symbol = $every, listener: Function): this {
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addConditionalEventListener(this, type, listener as EventListener);
            return this;
        }
    };

/**
 * Adds positional listener insertion helpers to a base class.
 */
export const AsPositionalEventEmitter = <T extends Constructable<EventEmitter>>(
    superclass: T
): Constructable<PositionalEventEmitter> & T =>
    class extends superclass implements PositionalEventEmitter {
        /**
         * Inserts a listener at a specific position.
         *
         * @param type - The event type.
         * @param index - The insertion index.
         * @param listener - The listener to register.
         * @returns This emitter.
         */
        at(type: string | symbol = $every, index: number, listener: Function): this {
            if (typeof type === 'number' && typeof index === 'function' && typeof listener === 'undefined') {
                listener = index;
                index = type;
                type = $every;
            }

            if (!isPositiveNumber(index)) {
                throw new TypeError('index must be a positive number');
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addEventListener(this, type, listener as EventListener, index);
            return this;
        }

        /**
         * Inserts a listener at the beginning of the listener list.
         *
         * @param type - The event type.
         * @param listener - The listener to register.
         * @returns This emitter.
         */
        first(type: string | symbol = $every, listener: Function): this {
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addEventListener(this, type, listener as EventListener, 0);
            return this;
        }
    };

/**
 * Adds the core event emitter API to a base class.
 */
export const AsEventEmitter = <T extends Constructable>(superclass: T): Constructable<EventEmitter> & T =>
    class extends superclass implements EventEmitter {
        /**
         * Identifies the instance as an event emitter.
         */
        get [Symbol.toStringTag](): string {
            return 'EventEmitter';
        }

        /**
         * Emits an event to the registered listeners.
         *
         * @param type - The event type.
         * @param data - Event payload values.
         * @returns `true` when at least one listener ran.
         */
        emit(type: string | symbol, ...data: unknown[]): boolean {
            return emitAllEvents(this, type, data);
        }

        /**
         * Returns the event types that currently have listeners.
         *
         * @returns The registered event types.
         */
        eventTypes(): (string | symbol)[] {
            return getEventTypes(this);
        }

        /**
         * Returns the number of listeners for an event type.
         *
         * @param type - The event type.
         * @returns The listener count.
         */
        listenerCount(type: string | symbol): number {
            const registered = getEvents(this)?.[type];
            let count: number;
            if (!registered) {
                count = 0;
            } else if (typeof registered === 'function') {
                count = 1;
            } else {
                count = registered.length;
            }
            return count;
        }

        /**
         * Returns a snapshot of listeners for an event type.
         *
         * @param type - The event type.
         * @returns The registered listeners.
         */
        listeners(type: string | symbol): Function[] {
            let listeners: EventListener[];

            const handler: EventHandler | undefined = getEvents(this)?.[type];

            if (typeof handler === 'undefined') {
                listeners = [];
            } else if (typeof handler === 'function') {
                listeners = [handler];
            } else {
                listeners = handler.slice();
            }

            return listeners;
        }

        /**
         * Adds a listener for an event type.
         *
         * @param type - The event type.
         * @param listener - The listener to register.
         * @returns This emitter.
         */
        on(type: EventType | EventHandlers = $every, listener?: Function): this {
            if (typeof listener === 'undefined') {
                if (typeof type === 'function') {
                    listener = type;
                    type = $every;
                } else if (typeof type === 'object') {
                    addEventHandlers(this, type as EventHandlers, false);
                    return this;
                }
            }

            addEventListener(this, type as EventType, listener as EventListener, NaN);
            return this;
        }

        /**
         * Removes a listener for an event type.
         *
         * @param type - The event type.
         * @param listener - The listener to remove.
         * @returns This emitter.
         */
        off(type: string | symbol, listener: Function): this {
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            if (!getEvents(this)?.[type]) {
                return this;
            }

            removeEventListener(this, type, listener as EventListener);
            return this;
        }
    };
