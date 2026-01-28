/**
 * @author Jeff Rose
 * @see {@link https://nodejs.org/api/events.html#events_class_eventemitter}
 * @see {@link https://github.com/jeffrose/emitter}
 */

import { Constructable, createNull } from '@blue/core';
import { complement, either, equals, isFunction, isNil, lastIndexOf, like, propEq, propIs } from '@blue/util';
import { Aware, likeAwareAnd } from '@blue/factory';

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

export interface ApplicationEventEmitterAware extends Aware {
    setApplicationEventEmitter(eventEmitter: EventEmitter): void;
}

/**
 * A {@link external:Function| function} bound to an emitter {@link EventType|event type}. Any data transmitted with the event will be passed into the listener as arguments.
 * @callback module:context.EventListener
 * @param {...*} data The arguments passed by the `emit`.
 */

/**
 * An {@link EventListener| event listener} or a list of event listeners.
 * @callback module:context.EventHandler
 */

/**
 * An {@link external:Object|object} that maps {@link EventType|event types} to an {@link EventHandler|event handler}.
 * @typedef {Object} module:context.EventHandlers
 */

/**
 * A {@link external:string} or {@link external:symbol} that represents the type of event fired by the Emitter.
 * @typedef {string|external:symbol} module:context.EventType
 */

/**
 */

/**
 * @param {module:context.EventType} type
 * @param {...*} data
 * @returns {boolean}
 */

/**
 * @returns {Array<module:context.EventType>}
 */

/**
 * @param {module:context.EventType} type
 * @returns {number}
 */

/**
 * @param {module:context.EventType} type
 * @returns {Array<external:Function>}
 */

/**
 * @param {module:context.EventType} type
 * @param {Function} listener
 * @returns {module:context.EventEmitter}
 */

/**
 * @param {module:context.EventType} type
 * @param {Function} listener
 * @returns {module:context.EventEmitter}
 */

const $events = '@@emitter/events',
    $every = '@@emitter/every',
    { defineProperty, deleteProperty, getPrototypeOf } = Reflect,
    { hasOwnProperty } = Object.prototype,
    { keys } = Object,
    { isArray } = Array,
    onMatcher = /^on(.+)$/,
    hasFunction = propIs(Function),
    hasListener = hasFunction('listener'),
    lastIndexOfColon = lastIndexOf(':') as (value: string) => number;

/**
 */
export const likeApplicationEventEmitterAware = likeAwareAnd(like({ setApplicationEventEmitter: Function })) as (
    value
) => value is ApplicationEventEmitterAware;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link EventEmitter|EventEmitter}
 */
export const likeEventEmitter = like({
    emit: Function,
    eventTypes: Function,
    listener: Function,
    listenerCount: Function,
    listeners: Function,
    off: Function,
    on: Function,
}) as (value) => value is EventEmitter;

/**
 * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
 * @param {module:context.EventType} type The event type.
 * @param {module:context.EventHandler} handler The event handler.
 */
const addEventHandler = (emitter: EventEmitter, type: EventType, handler: EventHandler): void => {
    let index: number, length: number;

    // List of listeners
    if (isArray(handler)) {
        index = 0;
        length = handler.length;

        for (; index < length; index += 1) {
            addEventListener(emitter, type, handler[index], NaN);
        }

        // Single listener
    } else {
        addEventListener(emitter, type, handler, NaN);
    }
};

/**
 * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
 * @param {module:context.EventHandlers} mappings The event mapping.
 */
const addEventHandlers = (emitter: EventEmitter, mappings: EventHandlers, prefixed: boolean = false): void => {
    let handler: EventHandler, parts: RegExpExecArray, type: EventType;

    /**
     * Intentionally using a for-in loop without a hasOwnProperty check in order to
     * check the prototype chain for mappings
     */
    for (const key in mappings) {
        if (!prefixed) {
            type = key;
        } else if ((parts = onMatcher.exec(key))) {
            // Example: if key = "onChange" then parts = [ "onChange", "Change" ] and type = "change"
            const capitalizedType = parts[1];
            type = `${capitalizedType[0].toLowerCase()}${capitalizedType.slice(1)}`;
        }

        if (type) {
            handler = mappings[type as string];
            isEventHandler(handler) && addEventHandler(emitter, type, handler);
        }
    }
};

/**
 * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
 * @param {module:context.EventType} type The event type.
 * @param {module:context.EventListener} listener The event callback.
 * @param {number} index
 */
const addEventListener = (emitter: EventEmitter, type: EventType, listener: EventListener, index: number): void => {
    // Define the event registry if it does not exist
    defineEventsProperty(emitter, createNull());

    const _events = emitter[$events];

    if (_events[':on']) {
        emitEvent(emitter, ':on', [type, hasListener(listener) ? listener.listener : listener], false);

        // Emitting "on" may have changed the registry.
        _events[':on'] = emitter[$events][':on'];
    }

    // Single listener
    if (!_events[type]) {
        _events[type] = listener;

        // Multiple listeners
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

        // Transition from single to multiple listeners
    } else {
        _events[type] = index === 0 ? [listener, _events[type]] : [_events[type], listener];
    }

    emitter[$events] = _events;
};

/**
 * @param {*} target The target on which the property will be created.
 * @param {module:context.EventHandlers} value The initial value of the event map.
 */
const defineEventsProperty = (target: any, value: EventHandlers): void => {
    const hasEvents: boolean = hasOwnProperty.call(target, $events),
        targetPrototype = getPrototypeOf(target);

    if (!hasEvents || (targetPrototype && target[$events] === targetPrototype[$events])) {
        defineProperty(target, $events, {
            value: value,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
};

/**
 * @param {module:context.EventEmitter} emitter The emitter on which the event `type` will be emitted.
 * @param {module:context.EventType} type The event type.
 * @param {Array} data The data to be passed with the event.
 * @returns {boolean} Whether or not a listener for the given event type was executed.
 * @throws {Error} If `type` is `error` and no listeners are subscribed.
 */
const emitAllEvents = (emitter: EventEmitter, type: EventType, data: any[]): boolean => {
    let executed = false,
        index = typeof type === 'string' ? lastIndexOfColon(type) : -1;

    // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar"
    while (index > 0) {
        executed = (type && emitEvent(emitter, type, data, false)) || executed;
        type = (type as string).substring(0, index);
        index = lastIndexOfColon(type);
    }

    // Emit single event or the namespaced event root, e.g. "foo", ":bar", Symbol( "@@qux" )
    executed = (type && emitEvent(emitter, type, data, type !== $every)) || executed;

    return executed;
};

/**
 * @param {module:context.EventEmitter} emitter The emitter on which the `errors` will be emitted.
 * @param {Array<Error>} errors The array of errors to be emitted.
 */
const emitErrors = (emitter: EventEmitter, errors: Error[]): void => {
    const length = errors.length;
    for (let index = 0; index < length; index += 1) {
        emitEvent(emitter, 'error', [errors[index]], false);
    }
};

/**
 * @param {module:context.EventEmitter} emitter The emitter on which the event `type` will be emitted.
 * @param {module:context.EventType} type The event type.
 * @param {Array} data The data to be passed with the event.
 * @param {boolean} emitEvery Whether or not listeners for all types will be executed.
 * @returns {boolean} Whether or not a listener for the given event type was executed.
 * @throws {Error} If `type` is `error` and no listeners are subscribed.
 */
const emitEvent = (emitter: EventEmitter, type: EventType, data: any[], emitEvery: boolean): boolean => {
    const _events = emitter[$events],
        isDefined = complement(isNil);

    let executed: boolean = false,
        listener: EventListener;

    if (isDefined(_events)) {
        if (type === 'error' && !_events.error) {
            if (data[0] instanceof Error) {
                throw data[0];
            } else {
                throw new Error('Uncaught, unspecified "error" event.');
            }
        }

        // Execute listeners for the given type of event
        listener = _events[type];
        if (isDefined(listener)) {
            executeHandler(listener, data, emitter);
            executed = true;
        }

        // Execute listeners listening for all types of events
        if (emitEvery) {
            listener = _events[$every];
            if (isDefined(listener)) {
                executeHandler(listener, data, emitter);
                executed = true;
            }
        }
    }

    return executed;
};

/**
 * @param {module:context.EventListener} l1
 * @param {module:context.EventListener} l2
 * @returns {boolean} Whether or not the listeners are equal
 */
const eventListenerEquals = (l1: EventListener, l2: EventListener): boolean => {
    // Check if l1 equals l2 directly, or if l1.listener equals l2
    return l1 === l2 || (hasListener(l1) && l1.listener === l2);
};

/**
 * Executes a listener using the internal `execute*` functions based on the number of arguments.
 * @param {module:context.EventHandler} handler
 * @param {Array} data
 * @param {*} scope
 */
const executeHandler = (handler: EventHandler, data: any[], scope): void => {
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
};

/**
 * @param {module:context.EventEmitter} emitter The emitter on which event types will be retrieved.
 * @returns {Array<module:context.EventType>} The list of event types registered to the emitter.
 */
const getEventTypes = (emitter: EventEmitter): EventType[] => keys(emitter[$events]);

/**
 * Execute a listener with no arguments.
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
 * @param {module:context.EventEmitter} emitter The emitter.
 */
const handleEmpty = (handler: EventHandler, isFunction: boolean, emitter: EventEmitter): void => {
    const errors: Error[] = [];

    if (isFunction) {
        try {
            (handler as EventListener).call(emitter);
        } catch (error) {
            errors.push(error);
        }
    } else {
        const length = handler.length,
            listeners: EventListener[] = (handler as EventListener[]).slice();

        let index = 0;

        for (; index < length; index += 1) {
            try {
                listeners[index].call(emitter);
            } catch (error) {
                errors.push(error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
};

/**
 * Execute a listener with one argument.
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
 * @param {module:context.EventEmitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 */
const handleOne = (handler: EventHandler, isFunction: boolean, emitter: EventEmitter, arg1: any): void => {
    const errors: Error[] = [];

    if (isFunction) {
        try {
            (handler as EventListener).call(emitter, arg1);
        } catch (error) {
            errors.push(error);
        }
    } else {
        const length = handler.length,
            listeners: EventListener[] = (handler as EventListener[]).slice();

        let index = 0;

        for (; index < length; index += 1) {
            try {
                listeners[index].call(emitter, arg1);
            } catch (error) {
                errors.push(error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
};

/**
 * Execute a listener with two arguments.
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
 * @param {module:context.EventEmitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 * @param {*} arg2 The second argument.
 */
const handleTwo = (handler: EventHandler, isFunction: boolean, emitter: EventEmitter, arg1: any, arg2: any): void => {
    const errors: Error[] = [];

    if (isFunction) {
        try {
            (handler as EventListener).call(emitter, arg1, arg2);
        } catch (error) {
            errors.push(error);
        }
    } else {
        const length = handler.length,
            listeners: EventListener[] = (handler as EventListener[]).slice();

        let index = 0;

        for (; index < length; index += 1) {
            try {
                listeners[index].call(emitter, arg1, arg2);
            } catch (error) {
                errors.push(error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
};

/**
 * Execute a listener with three arguments.
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
 * @param {module:context.EventEmitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 * @param {*} arg2 The second argument.
 * @param {*} arg3 The third argument.
 */
const handleThree = (
    handler: EventHandler,
    isFunction: boolean,
    emitter: EventEmitter,
    arg1: any,
    arg2: any,
    arg3: any
): void => {
    const errors: Error[] = [];

    if (isFunction) {
        try {
            (handler as EventListener).call(emitter, arg1, arg2, arg3);
        } catch (error) {
            errors.push(error);
        }
    } else {
        const length = handler.length,
            listeners: EventListener[] = (handler as EventListener[]).slice();

        let index = 0;

        for (; index < length; index += 1) {
            try {
                listeners[index].call(emitter, arg1, arg2, arg3);
            } catch (error) {
                errors.push(error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
};

/**
 * Execute a listener with four or more arguments.
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
 * @param {module:context.EventEmitter} emitter The emitter.
 * @param {Array} args Four or more arguments.
 */
const handleMany = (handler: EventHandler, isFunction: boolean, emitter: EventEmitter, args: any[]): void => {
    const errors: Error[] = [];

    if (isFunction) {
        try {
            (handler as EventListener).apply(emitter, args);
        } catch (error) {
            errors.push(error);
        }
    } else {
        const length = handler.length,
            listeners: EventListener[] = (handler as EventListener[]).slice();

        let index = 0;

        for (; index < length; index += 1) {
            try {
                listeners[index].apply(emitter, args);
            } catch (error) {
                errors.push(error);
            }
        }
    }

    if (errors.length) {
        emitErrors(emitter, errors);
    }
};

/**
 * Checks whether or not a value is an event handler.
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not the value is an event handler.
 */
const isEventHandler = (value: any): value is EventHandler => isFunction(value) || isArray(value);

/**
 * @param {module:context.EventEmitter} emitter The emitter from which the listener would be removed.
 * @param {module:context.EventType} type The event type.
 * @param {module:context.EventListener} listener The event callback.
 */
const removeEventListener = (emitter: EventEmitter, type: EventType, listener: EventListener): void => {
    const handler: EventHandler = emitter[$events][type];

    if (eventListenerEquals(handler as EventListener, listener)) {
        deleteProperty(emitter[$events], type);
        if (emitter[$events][':off']) {
            emitEvent(emitter, ':off', [type, listener], false);
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
                deleteProperty(emitter[$events], type);
            } else {
                spliceList(handler, index);
            }

            if (emitter[$events][':off']) {
                emitEvent(emitter, ':off', [type, listener], false);
            }
        }
    }
};

/**
 * Faster than `Array.prototype.splice`
 * @param {Array} list
 * @param {number} index
 */
const spliceList = <T = any>(list: T[], index: number): void => {
    const length = list.length;
    let i = index,
        j = i + 1;

    for (; j < length; i += 1, j += 1) {
        list[i] = list[j];
    }

    list.pop();
};

/**
 * @see module:context.AsEventEmitter
 * @implements module:context.EventEmitter
 * @returns {module:core.Constructable<module:context.EventEmitter>}
 * @example
 * const
 *  MyEmitter = AsEventEmitter( {} ),
 *  greeter = new MyEmitter();
 * greeter.on( 'hello', () => console.log( 'Hello!' ) );
 * greeter.emtest( 'hello' ); // true
 * // Hello!
 */
export const AsEventEmitter = <T extends Constructable>(superclass: T): Constructable<EventEmitter> & T => {
    // TypeScript 5.7 requires explicit type assertion for mixin pattern
    const EmitterClass = class extends (superclass as new (...args: any[]) => any) implements EventEmitter {
        get [Symbol.toStringTag](): string {
            return 'EventEmitter';
        }

        /**
         * Execute the listeners for the specified event `type` with the supplied arguments.
         *
         * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
         *
         * Returns `true` if the event had listeners, `false` otherwise.
         * @param {module:context.EventType} type The event type.
         * @param {...*} [data] The data passed into the listeners.
         * @returns {boolean} Whether or not the event had listeners.
         * @since 1.0.0
         * @example <caption>Emitting an event</caption>
         * const greeter = new Emitter();
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * greeter.emtest( 'hello' );     // true
         * // Hello!
         * greeter.emtest( 'goodbye' );   // false
         * @example <caption>Emitting an event with data</caption>
         * const greeter = new Emitter();
         * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.emtest( 'hello', 'World' );
         * // Hello, World!
         * @example <caption>Emitting a namespaced event</caption>
         * const greeter = new Emitter();
         * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
         * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
         *
         * // This event will not be triggered by emitting "greeting:hello"
         * greeter.on( 'hello', ( name ) => console.log( `Hello again, ${ name }` );
         *
         * greeter.emtest( 'greeting:hi', 'Mark' );
         * // Hi, Mark!
         * // Mark was greeted.
         *
         * greeter.emtest( 'greeting:hello', 'Jeff' );
         * // Hello, Jeff!
         * // Jeff was greeted.
         */
        emit(type: string | symbol, ...data: any[]): boolean {
            return emitAllEvents(this, type, data);
        }

        /**
         * @returns {Array<module:context.EventType>} The list of event types registered to the emitter.
         * @since 2.0.0
         * @example
         * const greeter = new Emitter();
         * greeter.on( 'hello', () => console.log( `Hello` ) );
         * greeter.on( 'hi', () => console.log( `Hi` ) );
         *
         * console.log( greeter.eventTypes() );
         * // [ 'hello', 'hi' ]
         */
        eventTypes(): (string | symbol)[] {
            return getEventTypes(this);
        }

        /**
         * @param {module:context.EventType} type The event type.
         * @returns {number} The number of listeners for that event type within the given emitter.
         * @since 1.0.0
         * @example
         * const greeter = new Emitter();
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * console.log( greeter.listenerCount( 'hello' ) );
         * // 1
         * console.log( greeter.listenerCount( 'goodbye' ) );
         * // 0
         */
        listenerCount(type: string | symbol): number {
            let count: number;

            // Empty
            if (!this[$events] || !this[$events][type]) {
                count = 0;

                // Function
            } else if (typeof this[$events][type] === 'function') {
                count = 1;

                // Array
            } else {
                count = this[$events][type].length;
            }

            return count;
        }

        /**
         * @param {module:context.EventType} type The event type.
         * @returns {number} The number of listeners for that event type within the given emitter.
         * @since 1.0.0
         * @example
         * const hello = function(){
         *  console.log( 'Hello!' );
         * },
         *  greeter = new Emitter();
         *
         * greeter.on( 'hello', hello );
         * greeter.emtest( 'hello' );
         * // Hello!
         *
         * console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
         * // true
         */
        listeners(type: string | symbol): Function[] {
            let listeners: EventListener[];

            if (!this[$events] || !this[$events][type]) {
                listeners = [];
            } else {
                const handler: EventHandler = this[$events][type];

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
         * Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.
         *
         * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
         * @param {module:context.EventType} [type] The event type.
         * @param {module:context.EventListener} listener The event callback.
         * @returns {module:context.EventEmitter} The emitter.
         * @since 1.0.0
         * @emits {:on} when listeners are added
         * @example <caption>Listen to all event types</caption>
         * const greeter = new Emitter();
         * greeter.on( () => console.log( 'Greeted' ) );
         * greeter.emtest( 'hello' );
         * // Greeted
         * greeter.emtest( 'goodbye' );
         * // Greeted
         * @example <caption>Listener to a specified event type</caption>
         * const greeter = new Emitter();
         * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.emtest( 'hello', 'World' );
         * // Hello, World!
         * greeter.emtest( 'hi', 'World' );
         */
        on(type: string | symbol = $every, listener: Function): this {
            if (typeof listener === 'undefined') {
                // Type not provided, fall back to "$every"
                if (typeof type === 'function') {
                    listener = type;
                    type = $every;

                    // Plain object of event bindings
                } else if (typeof type === 'object') {
                    addEventHandlers(this, type, false);

                    return this;
                }
            }

            addEventListener(this, type, listener as EventListener, NaN);

            return this;
        }

        /**
         * Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.
         *
         * If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.
         * @param {module:context.EventType} type The event type.
         * @param {module:context.EventListener} listener The event callback.
         * @returns {module:context.EventEmitter} The emitter.
         * @since 1.0.0
         * @emits {:off} when listeners are removed
         * @example <caption>Remove a listener from any event type</caption>
         * function greet( name ){
         *  console.log( `Greetings, ${ name }!` );
         * }
         *
         * const greeter = new Emitter();
         * greeter.on( greet );
         * greeter.emtest( 'hello' 'Jeff' );
         * // Greetings, Jeff!
         * greeter.emtest( 'hi' 'Jeff' );
         * // Greetings, Jeff!
         * greeter.off( greet );
         * greeter.emtest( 'yo', 'Jeff' );
         * @example <caption>Remove a listener from a specified event type</caption>
         * function hello( name ){
         *  console.log( `Hello, ${ name }!` );
         * }
         *
         * const greeter = new Emitter();
         * greeter.on( 'hello', hello );
         * greeter.emtest( 'hello', 'Jeff' );
         * // Hello, Jeff!
         * greeter.off( 'hello', hello );
         * greeter.emtest( 'hello', 'Jeff' );
         */
        off(type: string | symbol, listener: Function): this {
            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            if (!this[$events] || !this[$events][type]) {
                return this;
            }

            removeEventListener(this, type, listener as EventListener);

            return this;
        }
    };
    return EmitterClass as unknown as Constructable<EventEmitter> & T;
};

export const asEventEmitter = (target: any): EventEmitter => {
    const emitter = new Emitter(); // Create a concrete Emitter instance
    // Copy methods from the Emitter instance to the target
    target.emit = emitter.emit.bind(target);
    target.eventTypes = emitter.eventTypes.bind(target);
    target.listenerCount = emitter.listenerCount.bind(target);
    target.listeners = emitter.listeners.bind(target);
    target.on = emitter.on.bind(target);
    target.off = emitter.off.bind(target);
    // Also copy the internal events property if needed for proper functioning
    target[$events] = emitter[$events];
    return target as EventEmitter;
};

// Additional interfaces and types for async and conditional event emitters
export interface AsyncEventEmitter extends EventEmitter {
    tick(type: EventType, ...data: any[]): Promise<void>;
}

export interface ConditionalEventEmitter extends EventEmitter {
    once(type: EventType, listener: Function): this;
    many(type: EventType, times: number, listener: Function): this;
    until(type: EventType, listener: Function): this;
}

// Helper function for async emission
async function tickAllEvents(emitter: EventEmitter, type: EventType, data: any[]): Promise<void> {
    return new Promise<void>(function (resolve, reject): void {
        queueMicrotask(() => {
            const result = emitter.emit(type, ...data);
            result ? resolve() : reject();
        });
    });
}

// AsAsyncEventEmitter mixin
export const AsAsyncEventEmitter = <T extends Constructable<EventEmitter>>(superclass: T) => {
    const result = class extends (superclass as any) {
        async tick(type: string | symbol, ...data: any[]): Promise<void> {
            return tickAllEvents(this as unknown as EventEmitter, type, data);
        }
    };
    return result as Constructable<AsyncEventEmitter> & T;
};

// AsConditionalEventEmitter mixin
export const AsConditionalEventEmitter = <T extends Constructable<EventEmitter>>(superclass: T) => {
    const result = class extends (superclass as any) {
        many(type: string | symbol, times: number, listener: Function): this {
            // Shift arguments if type is not provided
            if (typeof type === 'number' && typeof times === 'function' && typeof listener === 'undefined') {
                listener = times;
                times = type as number;
                type = (this.constructor as any).every || '*';
            }

            if (typeof times !== 'number' || times <= 0) {
                throw new TypeError('times must be a positive number');
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            let count = 0;
            const wrapper: EventListener = (...args: any[]) => {
                count++;
                listener(...args);
                if (count >= times) {
                    (this as any).off(type, wrapper);
                }
            };
            (wrapper as any).listener = listener;

            (this as any).on(type, wrapper);
            return this;
        }

        once(type: string | symbol, listener: Function): this {
            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = (this.constructor as any).every || '*';
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            const wrapper: EventListener = (...args: any[]) => {
                (this as any).off(type, wrapper);
                listener(...args);
            };
            (wrapper as any).listener = listener;

            (this as any).on(type, wrapper);
            return this;
        }

        until(type: string | symbol, listener: Function): this {
            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = (this.constructor as any).every || '*';
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            const wrapper: EventListener = (...args: any[]) => {
                const result = listener(...args);
                if (result) {
                    (this as any).off(type, wrapper);
                }
            };
            (wrapper as any).listener = listener;

            (this as any).on(type, wrapper);
            return this;
        }
    };
    return result as Constructable<ConditionalEventEmitter> & T;
};

// Concrete Emitter class
const Null = class {};
const EmitterBase = AsEventEmitter(Null);

export class Emitter extends EmitterBase {
    static readonly every: string = '*';
    static readonly version: string = '3.0.0';

    destroyed: boolean = false;

    constructor(mapping?: EventHandlers) {
        super();
        Object.defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    clear(type?: EventType): this {
        if (type) {
            const events = (this as any)[$events];
            if (events && events[type]) {
                delete events[type];
            }
        } else {
            (this as any)[$events] = createNull();
        }
        return this;
    }

    toJSON(): any {
        if (this.destroyed) {
            return 'destroyed';
        }
        const json: any = {};
        const types = (this as any).eventTypes();
        json.listenerCount = {};
        for (const type of types) {
            json.listenerCount[type.toString()] = (this as any).listenerCount(type);
        }
        return json;
    }

    toString(): string {
        return `EventEmitter ${JSON.stringify(this.toJSON())}`.trim();
    }

    destroy(): void {
        if (!this.destroyed) {
            Object.defineProperty(this, 'destroyed', {
                value: true,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            (this as any).emit(':destroy');
            this.clear();
        }
    }
}
