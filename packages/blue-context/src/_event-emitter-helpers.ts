/**
 * Internal helper functions for the event emitter.
 * * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { is, isFunction, isNil, isNumber, isString } from '@blue/util/types';
import { createNull } from '@blue/core';
import type { EventEmitter, EventHandler, EventListener, EventType } from './event-emitter';

/** Internal symbol property for storing event data. */
export const $events = '@@emitter/events';
/** Internal symbol property for catch-all listener. */
export const $every = '@@emitter/every';
/** Matcher for `onEventName` style handler keys. */
export const onMatcher = /^on(.+)$/;

/**
 * The per-emitter listener registry.
 *
 * @internal
 */
export type EventRegistry = {
    [type: string]: EventHandler | undefined;
    [type: symbol]: EventHandler | undefined;
};

/**
 * An event emitter carrying its listener registry under `$events`.
 *
 * @internal
 */
export type EmitterWithStore = { [$events]?: EventRegistry } & EventEmitter;

/** Reads an emitter's listener registry (or `undefined` when not initialized). */
const getEvents = (emitter: EventEmitter): EventRegistry | undefined => (emitter as EmitterWithStore)[$events];

export const { defineProperty, deleteProperty } = Reflect;
export const { keys } = Object;
const { getPrototypeOf } = Reflect,
    { hasOwnProperty } = Object.prototype,
    { isNaN: isNan } = Number;

const greaterThanOrEqualZero = (value: number): boolean => value >= 0,
    { isArray } = Array,
    isSymbol = is(Symbol) as (value: unknown) => value is symbol,
    lastIndexOfColon = (value: string): number => value.lastIndexOf(':');

export function addConditionalEventListener(emitter: EventEmitter, type: EventType, listener: EventListener): void {
    const conditionalListener: EventListener = function (this: EventEmitter): void {
        // `arguments` is not an array; coerce it so the listener can forward its args.
        // Conditional listeners return a boolean at runtime even though the type is `void`.
        const done = listener.apply(this, Array.prototype.slice.call(arguments) as unknown[]) as unknown;
        if (done) {
            // When a conditional listener removes itself (once/many/until), tests expect
            // ':off' meta events to include only the event type (no listener argument).
            removeEventListener(emitter, type, conditionalListener, false);
        }
    };

    conditionalListener.listener = listener.listener || listener;
    addEventListener(emitter, type, conditionalListener, NaN);
}

export function addEventHandler(emitter: EventEmitter, type: EventType, handler: EventHandler): void {
    if (Array.isArray(handler)) {
        for (let index = 0; index < handler.length; index += 1) {
            addEventListener(emitter, type, handler[index], NaN);
        }
    } else {
        addEventListener(emitter, type, handler, NaN);
    }
}

export function addEventHandlers(
    emitter: EventEmitter,
    mappings: Record<string, EventHandler>,
    prefixed: boolean = false
): void {
    for (const key in mappings) {
        let type: EventType | undefined;

        if (!prefixed) {
            type = key;
        } else {
            const parts = onMatcher.exec(key);
            if (parts) {
                const capitalizedType = parts[1];
                type = `${capitalizedType[0].toLowerCase()}${capitalizedType.slice(1)}`;
            }
        }

        if (type != null) {
            const handler = mappings[type as string];
            // eslint-disable-next-line no-unused-expressions -- guarded dispatch: only register the handler when the predicate passes
            isEventHandler(handler) && addEventHandler(emitter, type, handler);
        }
    }
}

export function defineEventsProperty(target: EventEmitter, value: EventRegistry): EventRegistry {
    const hasEvents: boolean = hasOwnProperty.call(target, $events),
        targetPrototype = getPrototypeOf(target);

    if (!hasEvents || (targetPrototype && getEvents(target) === getEvents(targetPrototype as EventEmitter))) {
        defineProperty(target, $events, {
            value,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    return getEvents(target) ?? value;
}

export function addEventListener(emitter: EventEmitter, type: EventType, listener: EventListener, index: number): void {
    const _events = defineEventsProperty(emitter, createNull() as EventRegistry);

    if (_events[':on']) {
        emitEvent(emitter, ':on', [type], false);

        // Emitting ':on' may have changed the registry.
        _events[':on'] = getEvents(emitter)?.[':on'];
    }

    if (!_events[type]) {
        _events[type] = listener;
    } else if (Array.isArray(_events[type])) {
        switch (isNan(index) || index) {
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
}

export function addFiniteEventListener(
    emitter: EventEmitter,
    type: EventType,
    times: number,
    listener: EventListener
): void {
    const finiteListener: EventListener = function (this: EventEmitter): boolean {
        // Coerce `arguments` so the listener can forward its args.
        listener.apply(this, Array.prototype.slice.call(arguments) as unknown[]);
        return --times === 0;
    };

    finiteListener.listener = listener.listener || listener;
    addConditionalEventListener(emitter, type, finiteListener);
}

export function emitAllEvents(emitter: EventEmitter, type: EventType, data: unknown[]): boolean {
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

export function emitErrors(emitter: EventEmitter, errors: Error[]): void {
    for (let index = 0; index < errors.length; index += 1) {
        emitEvent(emitter, 'error', [errors[index]], false);
    }
}

export function emitEvent(emitter: EventEmitter, type: EventType, data: unknown[], emitEvery: boolean): boolean {
    const _events = getEvents(emitter);
    let executed = false;

    if (!isNil(_events)) {
        if (type === 'error' && !_events.error) {
            if (data[0] instanceof Error) {
                throw data[0];
            }
            throw new Error('Uncaught, unspecified "error" event.');
        }

        let listener: EventHandler | undefined = _events[type];
        if (!isNil(listener)) {
            executeHandler(listener, data, emitter);
            executed = true;
        }

        if (emitEvery) {
            listener = _events[$every];
            if (!isNil(listener)) {
                executeHandler(listener, data, emitter);
                executed = true;
            }
        }
    }

    return executed;
}

export function eventListenerEquals(handler: EventListener | undefined, listener: EventListener): boolean {
    if (typeof handler === 'undefined') {
        return false;
    }

    if (handler === listener) {
        return true;
    }

    return typeof handler.listener !== 'undefined' && handler.listener === listener;
}

export function executeHandler(handler: EventHandler, data: unknown[], scope: EventEmitter): void {
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

export const getEventTypes = (emitter: EventEmitter): EventType[] => {
    const events = getEvents(emitter);
    return events ? (keys(events) as EventType[]) : [];
};

export const isEventHandler = (value: unknown): value is EventHandler => isFunction(value) || isArray(value);

export const isEventType = (value: unknown): value is EventType => isString(value) || isSymbol(value);

export const isPositiveNumber = ((value: unknown) => isNumber(value) && greaterThanOrEqualZero(value)) as (
    value: unknown
) => value is number;

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

function handleOne(handler: EventHandler, isFn: boolean, emitter: EventEmitter, arg1: unknown): void {
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

function handleTwo(handler: EventHandler, isFn: boolean, emitter: EventEmitter, arg1: unknown, arg2: unknown): void {
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

function handleThree(
    handler: EventHandler,
    isFn: boolean,
    emitter: EventEmitter,
    arg1: unknown,
    arg2: unknown,
    arg3: unknown
): void {
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

function handleMany(handler: EventHandler, isFn: boolean, emitter: EventEmitter, args: unknown[]): void {
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

export function removeEventHandler(emitter: EventEmitter, type: EventType, handler: EventHandler): void {
    if (typeof handler === 'function') {
        removeEventListener(emitter, type, handler);
    } else if (isArray(handler)) {
        let index = handler.length;
        while (index--) {
            removeEventListener(emitter, type, handler[index]);
        }
    }
}

export function removeAllEventListeners(emitter: EventEmitter, type?: EventType): void {
    const events = getEvents(emitter);

    if (events) {
        if (!events[':off']) {
            if (isEventType(type)) {
                (emitter as EmitterWithStore)[$events] = createNull() as EventRegistry;
            } else if (type && events[type]) {
                deleteProperty(events, type);
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
            (emitter as EmitterWithStore)[$events] = createNull() as EventRegistry;
        } else {
            if (type != null) {
                const handler: EventHandler | undefined = events[type];
                // Absent handler: nothing to remove; the delete below still clears the entry.
                if (handler != null) {
                    removeEventHandler(emitter, type, handler);
                }
                deleteProperty(events, type);
            }
        }
    }
}

function spliceList<T = unknown>(list: T[], index: number): void {
    const length = list.length;
    let i = index,
        j = i + 1;

    for (; j < length; i += 1, j += 1) {
        list[i] = list[j];
    }

    list.pop();
}

export function removeEventListener(
    emitter: EventEmitter,
    type: EventType,
    listener: EventListener,
    includeListenerInMeta: boolean = true
): void {
    const events = getEvents(emitter);

    if (!events) {
        return;
    }

    const handler: EventHandler | undefined = events[type];

    if (eventListenerEquals(handler as EventListener, listener)) {
        deleteProperty(events, type);
        if (events[':off']) {
            emitEvent(emitter, ':off', includeListenerInMeta ? [type, listener] : [type], false);
        }
    } else if (isArray(handler)) {
        let index = -1;

        for (let i = handler.length; i-- > 0;) {
            if (eventListenerEquals(handler[i], listener)) {
                index = i;
                break;
            }
        }

        if (index > -1) {
            if (handler.length === 1) {
                handler.length = 0;
                deleteProperty(events, type);
            } else {
                spliceList(handler, index);
            }

            if (events[':off']) {
                emitEvent(emitter, ':off', includeListenerInMeta ? [type, listener] : [type], false);
            }
        }
    }
}

export function tickAllEvents(emitter: EventEmitter, type: EventType, data: unknown[]): Promise<void> {
    return new Promise<void>(function (resolve, reject): void {
        queueMicrotask(() => (emitAllEvents(emitter, type, data) ? resolve() : reject()));
    });
}
