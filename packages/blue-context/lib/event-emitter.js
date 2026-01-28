/**
 * @author Jeff Rose
 * @see {@link https://nodejs.org/api/events.html#events_class_eventemitter}
 * @see {@link https://github.com/jeffrose/emitter}
 */
import { createNull } from '@blue/core';
import { complement, isFunction, isNil, lastIndexOf, like, propIs } from '@blue/util';
import { likeAwareAnd } from '@blue/factory';
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
const $events = '@@emitter/events', $every = '@@emitter/every', { defineProperty, deleteProperty, getPrototypeOf } = Reflect, { hasOwnProperty } = Object.prototype, { keys } = Object, { isArray } = Array, onMatcher = /^on(.+)$/, hasFunction = propIs(Function), hasListener = hasFunction('listener'), lastIndexOfColon = lastIndexOf(':');
/**
 */
export const likeApplicationEventEmitterAware = likeAwareAnd(like({ setApplicationEventEmitter: Function }));
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
});
/**
 * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
 * @param {module:context.EventType} type The event type.
 * @param {module:context.EventHandler} handler The event handler.
 */
const addEventHandler = (emitter, type, handler) => {
    let index, length;
    // List of listeners
    if (isArray(handler)) {
        index = 0;
        length = handler.length;
        for (; index < length; index += 1) {
            addEventListener(emitter, type, handler[index], NaN);
        }
        // Single listener
    }
    else {
        addEventListener(emitter, type, handler, NaN);
    }
};
/**
 * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
 * @param {module:context.EventHandlers} mappings The event mapping.
 */
const addEventHandlers = (emitter, mappings, prefixed = false) => {
    let handler, parts, type;
    /**
     * Intentionally using a for-in loop without a hasOwnProperty check in order to
     * check the prototype chain for mappings
     */
    for (const key in mappings) {
        if (!prefixed) {
            type = key;
        }
        else if ((parts = onMatcher.exec(key))) {
            // Example: if key = "onChange" then parts = [ "onChange", "Change" ] and type = "change"
            const capitalizedType = parts[1];
            type = `${capitalizedType[0].toLowerCase()}${capitalizedType.slice(1)}`;
        }
        if (type) {
            handler = mappings[type];
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
const addEventListener = (emitter, type, listener, index) => {
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
    }
    else if (isArray(_events[type])) {
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
    }
    else {
        _events[type] = index === 0 ? [listener, _events[type]] : [_events[type], listener];
    }
    emitter[$events] = _events;
};
/**
 * @param {*} target The target on which the property will be created.
 * @param {module:context.EventHandlers} value The initial value of the event map.
 */
const defineEventsProperty = (target, value) => {
    const hasEvents = hasOwnProperty.call(target, $events), targetPrototype = getPrototypeOf(target);
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
const emitAllEvents = (emitter, type, data) => {
    let executed = false, index = typeof type === 'string' ? lastIndexOfColon(type) : -1;
    // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar"
    while (index > 0) {
        executed = (type && emitEvent(emitter, type, data, false)) || executed;
        type = type.substring(0, index);
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
const emitErrors = (emitter, errors) => {
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
const emitEvent = (emitter, type, data, emitEvery) => {
    const _events = emitter[$events], isDefined = complement(isNil);
    let executed = false, listener;
    if (isDefined(_events)) {
        if (type === 'error' && !_events.error) {
            if (data[0] instanceof Error) {
                throw data[0];
            }
            else {
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
const eventListenerEquals = (l1, l2) => {
    // Check if l1 equals l2 directly, or if l1.listener equals l2
    return l1 === l2 || (hasListener(l1) && l1.listener === l2);
};
/**
 * Executes a listener using the internal `execute*` functions based on the number of arguments.
 * @param {module:context.EventHandler} handler
 * @param {Array} data
 * @param {*} scope
 */
const executeHandler = (handler, data, scope) => {
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
const getEventTypes = (emitter) => keys(emitter[$events]);
/**
 * Execute a listener with no arguments.
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
 * @param {module:context.EventEmitter} emitter The emitter.
 */
const handleEmpty = (handler, isFunction, emitter) => {
    const errors = [];
    if (isFunction) {
        try {
            handler.call(emitter);
        }
        catch (error) {
            errors.push(error);
        }
    }
    else {
        const length = handler.length, listeners = handler.slice();
        let index = 0;
        for (; index < length; index += 1) {
            try {
                listeners[index].call(emitter);
            }
            catch (error) {
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
const handleOne = (handler, isFunction, emitter, arg1) => {
    const errors = [];
    if (isFunction) {
        try {
            handler.call(emitter, arg1);
        }
        catch (error) {
            errors.push(error);
        }
    }
    else {
        const length = handler.length, listeners = handler.slice();
        let index = 0;
        for (; index < length; index += 1) {
            try {
                listeners[index].call(emitter, arg1);
            }
            catch (error) {
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
const handleTwo = (handler, isFunction, emitter, arg1, arg2) => {
    const errors = [];
    if (isFunction) {
        try {
            handler.call(emitter, arg1, arg2);
        }
        catch (error) {
            errors.push(error);
        }
    }
    else {
        const length = handler.length, listeners = handler.slice();
        let index = 0;
        for (; index < length; index += 1) {
            try {
                listeners[index].call(emitter, arg1, arg2);
            }
            catch (error) {
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
const handleThree = (handler, isFunction, emitter, arg1, arg2, arg3) => {
    const errors = [];
    if (isFunction) {
        try {
            handler.call(emitter, arg1, arg2, arg3);
        }
        catch (error) {
            errors.push(error);
        }
    }
    else {
        const length = handler.length, listeners = handler.slice();
        let index = 0;
        for (; index < length; index += 1) {
            try {
                listeners[index].call(emitter, arg1, arg2, arg3);
            }
            catch (error) {
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
const handleMany = (handler, isFunction, emitter, args) => {
    const errors = [];
    if (isFunction) {
        try {
            handler.apply(emitter, args);
        }
        catch (error) {
            errors.push(error);
        }
    }
    else {
        const length = handler.length, listeners = handler.slice();
        let index = 0;
        for (; index < length; index += 1) {
            try {
                listeners[index].apply(emitter, args);
            }
            catch (error) {
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
const isEventHandler = (value) => isFunction(value) || isArray(value);
/**
 * @param {module:context.EventEmitter} emitter The emitter from which the listener would be removed.
 * @param {module:context.EventType} type The event type.
 * @param {module:context.EventListener} listener The event callback.
 */
const removeEventListener = (emitter, type, listener) => {
    const handler = emitter[$events][type];
    if (eventListenerEquals(handler, listener)) {
        deleteProperty(emitter[$events], type);
        if (emitter[$events][':off']) {
            emitEvent(emitter, ':off', [type, listener], false);
        }
    }
    else if (isArray(handler)) {
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
                deleteProperty(emitter[$events], type);
            }
            else {
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
const spliceList = (list, index) => {
    const length = list.length;
    let i = index, j = i + 1;
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
export const AsEventEmitter = (superclass) => {
    // TypeScript 5.7 requires explicit type assertion for mixin pattern
    const EmitterClass = class extends superclass {
        get [Symbol.toStringTag]() {
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
        emit(type, ...data) {
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
        eventTypes() {
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
        listenerCount(type) {
            let count;
            // Empty
            if (!this[$events] || !this[$events][type]) {
                count = 0;
                // Function
            }
            else if (typeof this[$events][type] === 'function') {
                count = 1;
                // Array
            }
            else {
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
        listeners(type) {
            let listeners;
            if (!this[$events] || !this[$events][type]) {
                listeners = [];
            }
            else {
                const handler = this[$events][type];
                if (typeof handler === 'undefined') {
                    listeners = [];
                }
                else if (typeof handler === 'function') {
                    listeners = [handler];
                }
                else {
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
        on(type = $every, listener) {
            if (typeof listener === 'undefined') {
                // Type not provided, fall back to "$every"
                if (typeof type === 'function') {
                    listener = type;
                    type = $every;
                    // Plain object of event bindings
                }
                else if (typeof type === 'object') {
                    addEventHandlers(this, type, false);
                    return this;
                }
            }
            addEventListener(this, type, listener, NaN);
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
        off(type, listener) {
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
            removeEventListener(this, type, listener);
            return this;
        }
    };
    return EmitterClass;
};
export const asEventEmitter = (target) => {
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
    return target;
};
// Helper function for async emission
async function tickAllEvents(emitter, type, data) {
    return new Promise(function (resolve, reject) {
        queueMicrotask(() => {
            const result = emitter.emit(type, ...data);
            result ? resolve() : reject();
        });
    });
}
// AsAsyncEventEmitter mixin
export const AsAsyncEventEmitter = (superclass) => {
    const result = class extends superclass {
        async tick(type, ...data) {
            return tickAllEvents(this, type, data);
        }
    };
    return result;
};
// AsConditionalEventEmitter mixin
export const AsConditionalEventEmitter = (superclass) => {
    const result = class extends superclass {
        many(type, times, listener) {
            // Shift arguments if type is not provided
            if (typeof type === 'number' && typeof times === 'function' && typeof listener === 'undefined') {
                listener = times;
                times = type;
                type = this.constructor.every || '*';
            }
            if (typeof times !== 'number' || times <= 0) {
                throw new TypeError('times must be a positive number');
            }
            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }
            let count = 0;
            const wrapper = (...args) => {
                count++;
                listener(...args);
                if (count >= times) {
                    this.off(type, wrapper);
                }
            };
            wrapper.listener = listener;
            this.on(type, wrapper);
            return this;
        }
        once(type, listener) {
            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = this.constructor.every || '*';
            }
            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }
            const wrapper = (...args) => {
                this.off(type, wrapper);
                listener(...args);
            };
            wrapper.listener = listener;
            this.on(type, wrapper);
            return this;
        }
        until(type, listener) {
            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = this.constructor.every || '*';
            }
            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }
            const wrapper = (...args) => {
                const result = listener(...args);
                if (result) {
                    this.off(type, wrapper);
                }
            };
            wrapper.listener = listener;
            this.on(type, wrapper);
            return this;
        }
    };
    return result;
};
// Concrete Emitter class
const Null = class {
};
const EmitterBase = AsEventEmitter(Null);
export class Emitter extends EmitterBase {
    static every = '*';
    static version = '3.0.0';
    destroyed = false;
    constructor(mapping) {
        super();
        Object.defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
    clear(type) {
        if (type) {
            const events = this[$events];
            if (events && events[type]) {
                delete events[type];
            }
        }
        else {
            this[$events] = createNull();
        }
        return this;
    }
    toJSON() {
        if (this.destroyed) {
            return 'destroyed';
        }
        const json = {};
        const types = this.eventTypes();
        json.listenerCount = {};
        for (const type of types) {
            json.listenerCount[type.toString()] = this.listenerCount(type);
        }
        return json;
    }
    toString() {
        return `EventEmitter ${JSON.stringify(this.toJSON())}`.trim();
    }
    destroy() {
        if (!this.destroyed) {
            Object.defineProperty(this, 'destroyed', {
                value: true,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            this.emit(':destroy');
            this.clear();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ldmVudC1lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxPQUFPLEVBQWlCLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFrQixVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQVUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzlHLE9BQU8sRUFBUyxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUF1QnBEOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDtHQUNHO0FBRUg7Ozs7R0FJRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sR0FBRyxrQkFBa0IsRUFDOUIsTUFBTSxHQUFHLGlCQUFpQixFQUMxQixFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1RCxFQUFFLGNBQWMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQ3JDLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxFQUNqQixFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDbkIsU0FBUyxHQUFHLFVBQVUsRUFDdEIsV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFDOUIsV0FBVyxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFDckMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBOEIsQ0FBQztBQUVyRTtHQUNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0NBQWdDLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLDBCQUEwQixFQUFFLFFBQVEsRUFBRSxDQUFDLENBRWpFLENBQUM7QUFFM0M7OztHQUdHO0FB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