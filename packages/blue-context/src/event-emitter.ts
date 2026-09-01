/**
 * @author Jeff Rose
 * @see {@link https://nodejs.org/api/events.html#events_class_eventemitter}
 * @see {@link https://github.com/jeffrose/emitter}
 */

import { Constructable, JSONValue, Serializable, Null, createNull } from '@blue/core';
import { is, isFunction, isNil, isNumber, isString, like } from '@blue/util/types';
import { Aware, Destroyable, likeAwareAnd } from '@blue/factory';
import {
    $events,
    $every,
    defineProperty,
    deleteProperty,
    keys,
    addConditionalEventListener,
    addEventHandler,
    addEventHandlers,
    defineEventsProperty,
    addEventListener,
    addFiniteEventListener,
    emitAllEvents,
    emitErrors,
    emitEvent,
    eventListenerEquals,
    executeHandler,
    getEventTypes,
    isEventHandler,
    isEventType,
    isPositiveNumber,
    removeEventHandler,
    removeAllEventListeners,
    removeEventListener,
    tickAllEvents,
} from './_event-emitter-helpers';

/**
 * Listener function shape used by the emitter implementation.
 */
export type EventListener = { (...args: any[]): void; listener?: EventListener };

/**
 * A single listener or a listener list for an event type.
 */
export type EventHandler = EventListener | EventListener[];

/**
 * Mapping from event type to handler(s).
 */
export type EventHandlers = { [type: string]: EventHandler };

/**
 * Event type supported by the emitter.
 */
export type EventType = string | symbol;

/**
 * Emits and manages event listeners.
 */
export interface EventEmitter {
    /**
     * Emits an event to the listeners registered for the given type.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     * @returns `true` when at least one listener ran.
     */
    emit(type: EventType, ...data: any[]): boolean;
    /**
     * Returns the event types with registered listeners.
     *
     * @returns The registered event types.
     */
    eventTypes(): EventType[];
    /**
     * Returns the number of listeners for a type.
     *
     * @param type - The event type.
     * @returns The listener count.
     */
    listenerCount(type: EventType): number;
    /**
     * Returns a snapshot of listeners for a type.
     *
     * @param type - The event type.
     * @returns The registered listeners.
     */
    listeners(type: EventType): Function[];
    /**
     * Adds a listener for an event type.
     *
     * @param type - The event type.
     * @param listener - The listener to register.
     * @returns This emitter.
     */
    on(type: EventType | EventHandlers, listener?: Function): this;
    /**
     * Removes a listener for an event type.
     *
     * @param type - The event type.
     * @param listener - The listener to remove.
     * @returns This emitter.
     */
    off(type: EventType, listener: Function): this;
}

/**
 * Event emitter with microtask-based dispatch.
 */
export interface AsyncEventEmitter extends EventEmitter {
    /**
     * Dispatches an event in a microtask.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     * @returns A promise that resolves after dispatch.
     */
    tick(type: EventType, ...data: any[]): Promise<void>;
}

/**
 * Event emitter with conditional and finite listeners.
 */
export interface ConditionalEventEmitter extends EventEmitter {
    /**
     * Registers a listener that fires a fixed number of times.
     *
     * @param type - The event type.
     * @param times - The number of invocations to allow.
     * @param listener - The listener to register.
     * @returns This emitter.
     */
    many(type: EventType, times: number, listener: Function): this;
    /**
     * Registers a listener that fires once.
     *
     * @param type - The event type.
     * @param listener - The listener to register.
     * @returns This emitter.
     */
    once(type: EventType, listener: Function): this;
    /**
     * Registers a listener that removes itself when it returns `true`.
     *
     * @param type - The event type.
     * @param listener - The listener to register.
     * @returns This emitter.
     */
    until(type: EventType, listener: Function): this;
}

/**
 * Event emitter that supports listener insertion positions.
 */
export interface PositionalEventEmitter extends EventEmitter {
    /**
     * Inserts a listener at a specific position.
     *
     * @param type - The event type.
     * @param index - The insertion index.
     * @param listener - The listener to register.
     * @returns This emitter.
     */
    at(type: EventType, index: number, listener: Function): this;
    /**
     * Inserts a listener at the beginning of the listener list.
     *
     * @param type - The event type.
     * @param listener - The listener to register.
     * @returns This emitter.
     */
    first(type: EventType, listener: Function): this;
}

/**
 * Receives the application event emitter during initialization.
 */
export interface ApplicationEventEmitterAware extends Aware {
    /**
     * Receives the application event emitter.
     *
     * @param eventEmitter - The event emitter to inject.
     */
    setApplicationEventEmitter(eventEmitter: EventEmitter): void;
}

/**
 * Returns whether a value can receive an application event emitter.
 */
export const likeApplicationEventEmitterAware = likeAwareAnd(
    like({
        setApplicationEventEmitter: Function,
    })
) as (value: unknown) => value is ApplicationEventEmitterAware;

export const likeEventEmitter = like({
    emit: Function,
    eventTypes: Function,
    listenerCount: Function,
    listeners: Function,
    off: Function,
    on: Function,
}) as (value: unknown) => value is EventEmitter;

/**
 * Adds async event dispatch behavior to a base class.
 */export const AsAsyncEventEmitter = <T extends Constructable<EventEmitter>>(
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
        async tick(type: string | symbol, ...data: any[]): Promise<void> {
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
        emit(type: string | symbol, ...data: any[]): boolean {
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
            let count: number;
            if (!(this as any)[$events] || !(this as any)[$events][type]) {
                count = 0;
            } else if (typeof (this as any)[$events][type] === 'function') {
                count = 1;
            } else {
                count = (this as any)[$events][type].length;
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

            if (!(this as any)[$events] || !(this as any)[$events][type]) {
                listeners = [];
            } else {
                const handler: EventHandler = (this as any)[$events][type];

                if (typeof handler === 'undefined') {
                    listeners = [];
                } else if (typeof handler === 'function') {
                    listeners = [handler];
                } else {
                    listeners = handler.slice();
                }
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

            if (!(this as any)[$events] || !(this as any)[$events][type]) {
                return this;
            }

            removeEventListener(this, type, listener as EventListener);
            return this;
        }
    };

/**
 * Standalone event emitter with destroy and serialization support.
 */
export class Emitter extends AsEventEmitter(Null) implements Destroyable, Serializable {
    static readonly every: string = $every;
    static readonly version: string = '3.0.0';

    destroyed: boolean = false;

    /**
     * Creates an emitter and optionally seeds it with listeners.
     *
     * @param mapping - Optional initial event mappings.
     */
    constructor(mapping?: EventHandlers) {
        super();

        defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });

            typeof mapping !== 'undefined' && addEventHandlers(this, mapping, false);
    }

    /**
     * Removes listeners for one type or for all types.
     *
     * @param type - Optional event type to clear.
     * @returns This emitter.
     */
    clear(type?: EventType): this {
            removeAllEventListeners(this, type);
        return this;
    }

    /**
     * Serializes the listener counts to JSON.
     *
     * @returns A JSON representation of the emitter state.
     */
    toJSON(): JSONValue {
        const json: { listenerCount?: { [type: string]: number } } = createNull();
        const types = keys((this as any)[$events] || createNull());

        const listenerCount: { [type: string]: number } = createNull();
        for (let index = 0; index < types.length; index += 1) {
            const type = types[index];
            listenerCount[type] = this.listenerCount(type);
        }
        json.listenerCount = listenerCount;

        return json as JSONValue;
    }

    /**
     * Returns a compact textual summary of the emitter.
     *
     * @returns A string representation.
     */
    toString(): string {
        return `${(this as any)[Symbol.toStringTag]} ${JSON.stringify(this.toJSON())}`.trim();
    }

    /**
     * Destroys the emitter and clears its listeners.
     */
    destroy(): void {
        if (!this.destroyed) {
            defineProperty(this, 'destroyed', {
                value: true,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            emitEvent(this, ':destroy', [], false);
            this.clear();
            this.toJSON = () => 'destroyed';
        }
    }
}

// Back-compat alias: older API exposed `EventEmitter` behavior as a function mixin name.
// The current mixin is `AsEventEmitter` and the public class is `Emitter`.

/**
 * Internal target shape used by the object mixin helper.
 */
export type EventEmitterTarget = EventEmitter & {
    '@@emitter/events'?: Emitter;
};

/**
 * Mixes event emitter behavior into an existing object.
 */
/**
 * Mixes event emitter behavior into an existing object.
 *
 * @param target - The object to augment.
 * @returns The augmented object.
 */
export const asEventEmitter = <TTarget extends object>(target: TTarget): TTarget & EventEmitter => {
    if (!target || typeof target !== 'object') {
        throw new TypeError('asEventEmitter target must be an object');
    }

    if (likeEventEmitter(target)) {
        return target as TTarget & EventEmitter;
    }

    const t = target as unknown as EventEmitterTarget;
    const emitter = new Emitter();

    defineProperty(t, $events, {
        value: emitter,
        configurable: true,
        enumerable: false,
        writable: false,
    });

    const forward = (key: keyof EventEmitter) =>
        function (this: EventEmitter, ...args: any[]) {
            return ((this as any)[$events] as any)[key](...args);
        };

    (['emit', 'eventTypes', 'listenerCount', 'listeners', 'off', 'on'] as (keyof EventEmitter)[]).forEach((key) => {
        defineProperty(t, key, {
            value: forward(key),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    });

    return target as TTarget & EventEmitter;
};

export default Emitter;
