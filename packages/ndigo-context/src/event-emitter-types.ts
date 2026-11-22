/**
 * Event emitter contracts: listener/handler types, emitter interfaces,
 * and duck-typing guards.
 */
import { like } from '@ndigo/util/types';
import { Aware, likeAwareAnd } from '@ndigo/factory';

/**
 * A listener callback for an emitted event.
 *
 * @example
 * ```ts
 * const listener: EventListener = (value) => console.log(value);
 * ```
 */
export type EventListener = { (...args: unknown[]): void; listener?: EventListener };

/**
 * A single listener or a listener list for an event type.
 *
 * @example
 * ```ts
 * const handler: EventHandler = (v) => console.log(v);
 * ```
 */
export type EventHandler = EventListener | EventListener[];

/**
 * Mapping from event type to handler(s).
 *
 * @example
 * ```ts
 * const handlers: EventHandlers = { change: (v) => console.log(v) };
 * ```
 */
export type EventHandlers = { [type: string]: EventHandler };

/**
 * Event type supported by the emitter.
 *
 * @example
 * ```ts
 * const type: EventType = 'change';
 * ```
 */
export type EventType = string | symbol;

/**
 * Emits and manages event listeners.
 *
 * @example
 * ```ts
 * const emitter: EventEmitter = new Emitter();
 * emitter.on('change', (v) => console.log(v));
 * emitter.emit('change', 42);
 * ```
 */
export interface EventEmitter {
    /**
     * Emits an event to the listeners registered for the given type.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     * @returns `true` when at least one listener ran.
     */
    emit(type: EventType, ...data: unknown[]): boolean;
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
 *
 * @example
 * ```ts
 * const emitter: AsyncEventEmitter = new Emitter();
 * emitter.emit('change', 42);
 * ```
 */
export interface AsyncEventEmitter extends EventEmitter {
    /**
     * Dispatches an event in a microtask.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     * @returns A promise that resolves after dispatch.
     */
    tick(type: EventType, ...data: unknown[]): Promise<void>;
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

/** Tests whether a value behaves like an `EventEmitter`. */
export const likeEventEmitter = like({
    emit: Function,
    eventTypes: Function,
    listenerCount: Function,
    listeners: Function,
    off: Function,
    on: Function,
}) as (value: unknown) => value is EventEmitter;
