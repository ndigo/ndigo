/**
 * @internal
 *
 * Internal helper functions for the event emitter.
 * Extracted from event-emitter.ts to reduce file size.
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
        const done: any = listener.apply(this, arguments as any);
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

export function defineEventsProperty(target: any, value: any): void {
    const hasEvents: boolean = hasOwnProperty.call(target, $events),
        targetPrototype = getPrototypeOf(target);

    if (!hasEvents || (targetPrototype && (target as any)[$events] === (targetPrototype as any)[$events])) {
        defineProperty(target, $events, {
            value,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
}

export function addEventListener(emitter: EventEmitter, type: EventType, listener: EventListener, index: number): void {
    defineEventsProperty(emitter as any, createNull());

    const _events = (emitter as any)[$events];

    if (_events[':on']) {
        emitEvent(emitter, ':on', [type], false);

        // Emitting ':on' may have changed the registry.
        _events[':on'] = (emitter as any)[$events][':on'];
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

    (emitter as any)[$events] = _events;
}

export function addFiniteEventListener(
    emitter: EventEmitter,
    type: EventType,
    times: number,
    listener: EventListener
): void {
    const finiteListener: EventListener = function (this: EventEmitter): boolean {
        listener.apply(this, arguments as any);
        return --times === 0;
    };

    finiteListener.listener = listener.listener || listener;
    addConditionalEventListener(emitter, type, finiteListener);
}

export function emitAllEvents(emitter: EventEmitter, type: EventType, data: any[]): boolean {
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

export function emitEvent(emitter: EventEmitter, type: EventType, data: any[], emitEvery: boolean): boolean {
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

export function eventListenerEquals(handler: EventListener | undefined, listener: EventListener): boolean {
    if (typeof handler === 'undefined') {
        return false;
    }

    if (handler === listener) {
        return true;
    }

    return typeof (handler as any).listener !== 'undefined' && (handler as any).listener === listener;
}

export function executeHandler(handler: EventHandler, data: any[], scope: any): void {
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

export const getEventTypes = (emitter: EventEmitter): EventType[] =>
    (emitter as any)[$events] ? (keys((emitter as any)[$events]) as any) : [];

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

function handleThree(
    handler: EventHandler,
    isFn: boolean,
    emitter: EventEmitter,
    arg1: any,
    arg2: any,
    arg3: any
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
            if (type != null) {
                const handler: EventHandler = (emitter as any)[$events][type];
                removeEventHandler(emitter, type, handler);
                deleteProperty((emitter as any)[$events], type);
            }
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

export function removeEventListener(
    emitter: EventEmitter,
    type: EventType,
    listener: EventListener,
    includeListenerInMeta: boolean = true
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

export function tickAllEvents(emitter: EventEmitter, type: EventType, data: any[]): Promise<void> {
    return new Promise<void>(function (resolve, reject): void {
        queueMicrotask(() => (emitAllEvents(emitter, type, data) ? resolve() : reject()));
    });
}
