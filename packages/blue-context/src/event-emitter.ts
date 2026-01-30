/**
 * @author Jeff Rose
 * @see {@link https://nodejs.org/api/events.html#events_class_eventemitter}
 * @see {@link https://github.com/jeffrose/emitter}
 */

import { Constructable, JSONValue, Serializable, Null, createNull } from '@blue/core';
import { __ } from '@blue/util/function';
import { allPass, either } from '@blue/util/logic';
import { equals, gte, propEq } from '@blue/util/relation';
import { is, isFunction, isNil, isNumber, isString, like, propIs } from '@blue/util/types';
import { Aware, Destroyable, likeAwareAnd } from '@blue/factory';

export type EventListener = { (...args: any[]): void; listener?: EventListener };

export type EventHandler = EventListener | EventListener[];

export type EventHandlers = { [type: string]: EventHandler };

export type EventType = string | symbol;

export interface EventEmitter {
    emit(type: EventType, ...data: any[]): boolean;
    eventTypes(): EventType[];
    listenerCount(type: EventType): number;
    listeners(type: EventType): Function[];
    on(type: EventType, listener: Function): this;
    off(type: EventType, listener: Function): this;
}

export interface AsyncEventEmitter extends EventEmitter {
    tick(type: EventType, ...data: any[]): Promise<void>;
}

export interface ConditionalEventEmitter extends EventEmitter {
    many(type: EventType, times: number, listener: Function): this;
    once(type: EventType, listener: Function): this;
    until(type: EventType, listener: Function): this;
}

export interface PositionalEventEmitter extends EventEmitter {
    at(type: EventType, index: number, listener: Function): this;
    first(type: EventType, listener: Function): this;
}

export interface ApplicationEventEmitterAware extends Aware {
    setApplicationEventEmitter(eventEmitter: EventEmitter): void;
}

export const likeApplicationEventEmitterAware = likeAwareAnd(
    like({
        setApplicationEventEmitter: Function,
    }),
) as (value: unknown) => value is ApplicationEventEmitterAware;

export const likeEventEmitter = like({
    emit: Function,
    eventTypes: Function,
    listenerCount: Function,
    listeners: Function,
    off: Function,
    on: Function,
}) as (value: unknown) => value is EventEmitter;

const $events = '@@emitter/events',
    $every = '@@emitter/every',
    onMatcher = /^on(.+)$/;

const { defineProperty, deleteProperty, getPrototypeOf } = Reflect,
    { hasOwnProperty } = Object.prototype,
    { isNaN } = Number,
    { keys } = Object,
    { isArray } = Array,
    greaterThanOrEqualZero = gte(__, 0),
    isSymbol = is(Symbol) as (value: unknown) => value is symbol,
    hasFunction = propIs(Function),
    hasListener = hasFunction('listener'),
    lastIndexOfColon = (value: string): number => value.lastIndexOf(':');

function addConditionalEventListener(emitter: EventEmitter, type: EventType, listener: EventListener): void {
    const conditionalListener: EventListener = function (): void {
        const done = listener.apply(emitter, arguments as any);
        if (done === true) {
            // When a conditional listener removes itself (once/many/until), tests expect
            // ':off' meta events to include only the event type (no listener argument).
            removeEventListener(emitter, type, conditionalListener, false);
        }
    };

    conditionalListener.listener = listener.listener || listener;
    addEventListener(emitter, type, conditionalListener, NaN);
}

function addEventHandler(emitter: EventEmitter, type: EventType, handler: EventHandler): void {
    if (isArray(handler)) {
        for (let index = 0; index < handler.length; index += 1) {
            addEventListener(emitter, type, handler[index], NaN);
        }
    } else {
        addEventListener(emitter, type, handler, NaN);
    }
}

function addEventHandlers(emitter: EventEmitter, mappings: EventHandlers, prefixed: boolean = false): void {
    for (const key in mappings) {
        let type: EventType;

        if (!prefixed) {
            type = key;
        } else {
            const parts = onMatcher.exec(key);
            if (parts) {
                const capitalizedType = parts[1];
                type = `${capitalizedType[0].toLowerCase()}${capitalizedType.slice(1)}`;
            }
        }

        if (type) {
            const handler = mappings[type as string];
            isEventHandler(handler) && addEventHandler(emitter, type, handler);
        }
    }
}

function defineEventsProperty(target: any, value: any): void {
    const hasEvents: boolean = hasOwnProperty.call(target, $events),
        targetPrototype = getPrototypeOf(target);

    if (!hasEvents || (targetPrototype && target[$events] === targetPrototype[$events])) {
        defineProperty(target, $events, {
            value,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
}

function addEventListener(emitter: EventEmitter, type: EventType, listener: EventListener, index: number): void {
    defineEventsProperty(emitter as any, createNull());

    const _events = (emitter as any)[$events];

    if (_events[':on']) {
        emitEvent(emitter, ':on', [type], false);

        // Emitting ':on' may have changed the registry.
        _events[':on'] = (emitter as any)[$events][':on'];
    }

    if (!_events[type]) {
        _events[type] = listener;
    } else if (isArray(_events[type])) {
        switch (isNaN(index) || index) {
            case true:
                _events[type].push(listener);
                break;
            case 0:
                _events[type].unshift(listener);
                break;
            default:
                _events[type].splice(index, 0, listener);
                break;
        }
    } else {
        _events[type] = index === 0 ? [listener, _events[type]] : [_events[type], listener];
    }

    (emitter as any)[$events] = _events;
}

function addFiniteEventListener(emitter: EventEmitter, type: EventType, times: number, listener: EventListener): void {
    const finiteListener: EventListener = function (): boolean {
        listener.apply(this, arguments as any);
        return --times === 0;
    };

    finiteListener.listener = listener.listener || listener;
    addConditionalEventListener(emitter, type, finiteListener);
}

function emitAllEvents(emitter: EventEmitter, type: EventType, data: any[]): boolean {
    let executed = false,
        index = typeof type === 'string' ? lastIndexOfColon(type) : -1;

    while (index > 0) {
        executed = (type && emitEvent(emitter, type, data, false)) || executed;
        type = (type as string).substring(0, index);
        index = lastIndexOfColon(type as string);
    }

    executed = (type && emitEvent(emitter, type, data, type !== $every)) || executed;
    return executed;
}

function emitErrors(emitter: EventEmitter, errors: Error[]): void {
    for (let index = 0; index < errors.length; index += 1) {
        emitEvent(emitter, 'error', [errors[index]], false);
    }
}

function emitEvent(emitter: EventEmitter, type: EventType, data: any[], emitEvery: boolean): boolean {
    const _events = (emitter as any)[$events];
    let executed = false;

    if (!isNil(_events)) {
        if (type === 'error' && !_events.error) {
            if (data[0] instanceof Error) {
                throw data[0];
            }
            throw new Error('Uncaught, unspecified "error" event.');
        }

        let listener: EventListener = _events[type];
        if (!isNil(listener)) {
            executeHandler(listener as any, data, emitter);
            executed = true;
        }

        if (emitEvery) {
            listener = _events[$every];
            if (!isNil(listener)) {
                executeHandler(listener as any, data, emitter);
                executed = true;
            }
        }
    }

    return executed;
}

function eventListenerEquals(handler: EventListener | undefined, listener: EventListener): boolean {
    if (typeof handler === 'undefined') {
        return false;
    }

    if (handler === listener) {
        return true;
    }

    return typeof (handler as any).listener !== 'undefined' && (handler as any).listener === listener;
}

function executeHandler(handler: EventHandler, data: any[], scope: any): void {
    const isFn = isFunction(handler);

    switch (data.length) {
        case 0:
            handleEmpty(handler, isFn, scope);
            break;
        case 1:
            handleOne(handler, isFn, scope, data[0]);
            break;
        case 2:
            handleTwo(handler, isFn, scope, data[0], data[1]);
            break;
        case 3:
            handleThree(handler, isFn, scope, data[0], data[1], data[2]);
            break;
        default:
            handleMany(handler, isFn, scope, data);
            break;
    }
}

const getEventTypes = (emitter: EventEmitter): EventType[] => ((emitter as any)[$events] ? (keys((emitter as any)[$events]) as any) : []);

const isEventHandler = either(isFunction, isArray) as (value: unknown) => value is EventHandler;

const isEventType = either(isString, isSymbol) as (value: unknown) => value is EventType;

const isPositiveNumber = allPass([isNumber, greaterThanOrEqualZero]) as (value: unknown) => value is number;

function handleEmpty(handler: EventHandler, isFn: boolean, emitter: EventEmitter): void {
    const errors: Error[] = [];

    if (isFn) {
        try {
            (handler as EventListener).call(emitter);
        } catch (error) {
            errors.push(error as Error);
        }
    } else {
        const listeners: EventListener[] = (handler as EventListener[]).slice();
        for (let index = 0; index < listeners.length; index += 1) {
            try {
                listeners[index].call(emitter);
            } catch (error) {
                errors.push(error as Error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
}

function handleOne(handler: EventHandler, isFn: boolean, emitter: EventEmitter, arg1: any): void {
    const errors: Error[] = [];

    if (isFn) {
        try {
            (handler as EventListener).call(emitter, arg1);
        } catch (error) {
            errors.push(error as Error);
        }
    } else {
        const listeners: EventListener[] = (handler as EventListener[]).slice();
        for (let index = 0; index < listeners.length; index += 1) {
            try {
                listeners[index].call(emitter, arg1);
            } catch (error) {
                errors.push(error as Error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
}

function handleTwo(handler: EventHandler, isFn: boolean, emitter: EventEmitter, arg1: any, arg2: any): void {
    const errors: Error[] = [];

    if (isFn) {
        try {
            (handler as EventListener).call(emitter, arg1, arg2);
        } catch (error) {
            errors.push(error as Error);
        }
    } else {
        const listeners: EventListener[] = (handler as EventListener[]).slice();
        for (let index = 0; index < listeners.length; index += 1) {
            try {
                listeners[index].call(emitter, arg1, arg2);
            } catch (error) {
                errors.push(error as Error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
}

function handleThree(handler: EventHandler, isFn: boolean, emitter: EventEmitter, arg1: any, arg2: any, arg3: any): void {
    const errors: Error[] = [];

    if (isFn) {
        try {
            (handler as EventListener).call(emitter, arg1, arg2, arg3);
        } catch (error) {
            errors.push(error as Error);
        }
    } else {
        const listeners: EventListener[] = (handler as EventListener[]).slice();
        for (let index = 0; index < listeners.length; index += 1) {
            try {
                listeners[index].call(emitter, arg1, arg2, arg3);
            } catch (error) {
                errors.push(error as Error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
}

function handleMany(handler: EventHandler, isFn: boolean, emitter: EventEmitter, args: any[]): void {
    const errors: Error[] = [];

    if (isFn) {
        try {
            (handler as EventListener).apply(emitter, args);
        } catch (error) {
            errors.push(error as Error);
        }
    } else {
        const listeners: EventListener[] = (handler as EventListener[]).slice();
        for (let index = 0; index < listeners.length; index += 1) {
            try {
                listeners[index].apply(emitter, args);
            } catch (error) {
                errors.push(error as Error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
}

function removeEventHandler(emitter: EventEmitter, type: EventType, handler: EventHandler): void {
    if (typeof handler === 'function') {
        removeEventListener(emitter, type, handler);
    } else if (isArray(handler)) {
        let index = handler.length;
        while (index--) {
            removeEventListener(emitter, type, handler[index]);
        }
    }
}

function removeAllEventListeners(emitter: EventEmitter, type?: EventType): void {
    if ((emitter as any)[$events]) {
        if (!(emitter as any)[$events][':off']) {
            if (isEventType(type)) {
                (emitter as any)[$events] = createNull();
            } else if (type && (emitter as any)[$events][type]) {
                deleteProperty((emitter as any)[$events], type);
            }
        } else if (isEventType(type)) {
            const types: EventType[] = getEventTypes(emitter);
            for (let index = 0; index < types.length; index += 1) {
                if (types[index] === ':off') {
                    continue;
                }
                removeAllEventListeners(emitter, types[index]);
            }

            removeAllEventListeners(emitter, ':off');
            (emitter as any)[$events] = createNull();
        } else {
            const handler: EventHandler = (emitter as any)[$events][type];
            removeEventHandler(emitter, type, handler);
            deleteProperty((emitter as any)[$events], type);
        }
    }
}

function spliceList<T = any>(list: T[], index: number): void {
    const length = list.length;
    let i = index,
        j = i + 1;

    for (; j < length; i += 1, j += 1) {
        list[i] = list[j];
    }

    list.pop();
}

function removeEventListener(
    emitter: EventEmitter,
    type: EventType,
    listener: EventListener,
    includeListenerInMeta: boolean = true,
): void {
    const handler: EventHandler = (emitter as any)[$events][type];

    if (eventListenerEquals(handler as EventListener, listener)) {
        deleteProperty((emitter as any)[$events], type);
        if ((emitter as any)[$events][':off']) {
            emitEvent(emitter, ':off', includeListenerInMeta ? [type, listener] : [type], false);
        }
    } else if (isArray(handler)) {
        let index = -1;

        for (let i = handler.length; i-- > 0; ) {
            if (eventListenerEquals(handler[i], listener)) {
                index = i;
                break;
            }
        }

        if (index > -1) {
            if (handler.length === 1) {
                handler.length = 0;
                deleteProperty((emitter as any)[$events], type);
            } else {
                spliceList(handler, index);
            }

            if ((emitter as any)[$events][':off']) {
                emitEvent(emitter, ':off', includeListenerInMeta ? [type, listener] : [type], false);
            }
        }
    }
}

async function tickAllEvents(emitter: EventEmitter, type: EventType, data: any[]): Promise<void> {
    return new Promise<void>(function (resolve, reject): void {
        queueMicrotask(() => (emitAllEvents(emitter, type, data) ? resolve() : reject()));
    });
}

export const AsAsyncEventEmitter = <T extends Constructable<EventEmitter>>(
    superclass: T,
): Constructable<AsyncEventEmitter> & T =>
    class extends superclass implements AsyncEventEmitter {
        async tick(type: string | symbol, ...data: any[]): Promise<void> {
            return tickAllEvents(this as unknown as EventEmitter, type, data);
        }
    };

export const AsConditionalEventEmitter = <T extends Constructable<EventEmitter>>(
    superclass: T,
): Constructable<ConditionalEventEmitter> & T =>
    class extends superclass implements ConditionalEventEmitter {
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

            addFiniteEventListener(this as unknown as EventEmitter, type, times, listener as EventListener);
            return this;
        }

        once(type: string | symbol = $every, listener: Function): this {
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addFiniteEventListener(this as unknown as EventEmitter, type, 1, listener as EventListener);
            return this;
        }

        until(type: string | symbol = $every, listener: Function): this {
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addConditionalEventListener(this as unknown as EventEmitter, type, listener as EventListener);
            return this;
        }
    };

export const AsPositionalEventEmitter = <T extends Constructable<EventEmitter>>(
    superclass: T,
): Constructable<PositionalEventEmitter> & T =>
    class extends superclass implements PositionalEventEmitter {
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

            addEventListener(this as unknown as EventEmitter, type, listener as EventListener, index);
            return this;
        }

        first(type: string | symbol = $every, listener: Function): this {
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addEventListener(this as unknown as EventEmitter, type, listener as EventListener, 0);
            return this;
        }
    };

export const AsEventEmitter = <T extends Constructable>(superclass: T): Constructable<EventEmitter> & T =>
    class extends superclass implements EventEmitter {
        get [Symbol.toStringTag](): string {
            return 'EventEmitter';
        }

        emit(type: string | symbol, ...data: any[]): boolean {
            return emitAllEvents(this as unknown as EventEmitter, type, data);
        }

        eventTypes(): (string | symbol)[] {
            return getEventTypes(this as unknown as EventEmitter);
        }

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

        on(type: string | symbol = $every, listener: Function): this {
            if (typeof listener === 'undefined') {
                if (typeof type === 'function') {
                    listener = type;
                    type = $every;
                } else if (typeof type === 'object') {
                    addEventHandlers(this as unknown as EventEmitter, type as unknown as EventHandlers, false);
                    return this;
                }
            }

            addEventListener(this as unknown as EventEmitter, type, listener as EventListener, NaN);
            return this;
        }

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

            removeEventListener(this as unknown as EventEmitter, type, listener as EventListener);
            return this;
        }
    };

export class Emitter extends AsEventEmitter(Null) implements Destroyable, Serializable {
    static readonly every: string = $every;
    static readonly version: string = '3.0.0';

    destroyed: boolean;

    constructor(mapping?: EventHandlers) {
        super();

        defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        typeof mapping !== 'undefined' && addEventHandlers(this as unknown as EventEmitter, mapping, false);
    }

    clear(type?: EventType): this {
        removeAllEventListeners(this as unknown as EventEmitter, type);
        return this;
    }

    toJSON(): JSONValue {
        const json: { listenerCount?: { [type: string]: number } } = createNull();
        const types = keys((this as any)[$events] || createNull());

        json.listenerCount = createNull();
        for (let index = 0; index < types.length; index += 1) {
            const type = types[index];
            json.listenerCount[type] = this.listenerCount(type);
        }

        return json as unknown as JSONValue;
    }

    toString(): string {
        return `${this[Symbol.toStringTag]} ${JSON.stringify(this.toJSON())}`.trim();
    }

    destroy(): void {
        if (!this.destroyed) {
            defineProperty(this, 'destroyed', {
                value: true,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            emitEvent(this as unknown as EventEmitter, ':destroy', [], false);
            this.clear();
            this.toJSON = () => 'destroyed';
        }
    }
}

// Back-compat alias: older API exposed `EventEmitter` behavior as a function mixin name.
// The current mixin is `AsEventEmitter` and the public class is `Emitter`.

export type EventEmitterTarget = EventEmitter & {
    '@@emitter/events'?: Emitter;
};

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
        function (this: EventEmitterTarget, ...args: any[]) {
            return (this[$events] as any)[key](...args);
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
