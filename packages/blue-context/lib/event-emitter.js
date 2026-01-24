/**
 * @author Jeff Rose
 * @see {@link https://nodejs.org/api/events.html#events_class_eventemitter}
 * @see {@link https://github.com/jeffrose/emitter}
 */
import { createNull } from '@blue/core';
import { complement, isFunction, isNil, lastIndexOf, like, propIs } from '@blue/util';
import { likeAwareAnd } from '@blue/factory';
/**
 * A {@link external:Function| function} bound to an emitter {@link module:context.EventType|event type}. Any data transmitted with the event will be passed into the listener as arguments.
 * @callback module:context.EventListener
 * @param {...*} data The arguments passed by the `emit`.
 */
/**
 * An {@link module:context.EventListener| event listener} or a list of event listeners.
 * @callback module:context.EventHandler
 */
/**
 * An {@link external:Object|object} that maps {@link module:context.EventType|event types} to an {@link module:context.EventHandler|event handler}.
 * @typedef {external:Object} module:context.EventHandlers
 */
/**
 * A {@link external:string} or {@link external:symbol} that represents the type of event fired by the Emitter.
 * @typedef {external:string|external:symbol} module:context.EventType
 */
/**
 * @interface module:context.EventEmitter
 */
/**
 * @function module:context.EventEmitter#emit
 * @param {module:context.EventType} type
 * @param {...*} data
 * @returns {external:boolean}
 */
/**
 * @function module:context.EventEmitter#eventTypes
 * @returns {external:Array<module:context.EventType>}
 */
/**
 * @function module:context.EventEmitter#listenerCount
 * @param {module:context.EventType} type
 * @returns {external:number}
 */
/**
 * @function module:context.EventEmitter#listeners
 * @param {module:context.EventType} type
 * @returns {external:Array<external:Function>}
 */
/**
 * @function module:context.EventEmitter#on
 * @param {module:context.EventType} type
 * @param {external:Function} listener
 * @returns {module:context.EventEmitter}
 */
/**
 * @function module:context.EventEmitter#off
 * @param {module:context.EventType} type
 * @param {external:Function} listener
 * @returns {module:context.EventEmitter}
 */
const $events = '@@emitter/events', $every = '@@emitter/every', { defineProperty, deleteProperty, getPrototypeOf } = Reflect, { hasOwnProperty } = Object.prototype, { keys } = Object, { isArray } = Array, onMatcher = /^on(.+)$/, hasFunction = propIs(Function), hasListener = hasFunction('listener'), lastIndexOfColon = lastIndexOf(':');
/**
 * @function module:context.likeApplicationEventEmitterAware
 */
export const likeApplicationEventEmitterAware = likeAwareAnd(like({ setApplicationEventEmitter: Function }));
/**
 * @function module:context.likeEventEmitter
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EventEmitter|EventEmitter}
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
 * @function module:core~addEventHandler
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
 * @function module:core~addEventHandlers
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
 * @function module:core~addEventListener
 * @param {module:context.EventEmitter} emitter The emitter on which the event would be emitted.
 * @param {module:context.EventType} type The event type.
 * @param {module:context.EventListener} listener The event callback.
 * @param {external:number} index
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
 * @function module:core~defineEventsProperty
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
 * @function module:core~emitAllEvents
 * @param {module:context.EventEmitter} emitter The emitter on which the event `type` will be emitted.
 * @param {module:context.EventType} type The event type.
 * @param {external:Array} data The data to be passed with the event.
 * @return {external:boolean} Whether or not a listener for the given event type was executed.
 * @throws {external:Error} If `type` is `error` and no listeners are subscribed.
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
 * @function module:core~emitErrors
 * @param {module:context.EventEmitter} emitter The emitter on which the `errors` will be emitted.
 * @param {external:Array<Error>} errors The array of errors to be emitted.
 */
const emitErrors = (emitter, errors) => {
    const length = errors.length;
    for (let index = 0; index < length; index += 1) {
        emitEvent(emitter, 'error', [errors[index]], false);
    }
};
/**
 * @function module:core~emitEvent
 * @param {module:context.EventEmitter} emitter The emitter on which the event `type` will be emitted.
 * @param {module:context.EventType} type The event type.
 * @param {external:Array} data The data to be passed with the event.
 * @param {external:boolean} emitEvery Whether or not listeners for all types will be executed.
 * @return {external:boolean} Whether or not a listener for the given event type was executed.
 * @throws {external:Error} If `type` is `error` and no listeners are subscribed.
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
 * @function module:core~eventListenerEquals
 * @param {module:context.EventListener} l1
 * @param {module:context.EventListener} l2
 * @returns {external:boolean} Whether or not the listeners are equal
 */
const eventListenerEquals = (l1, l2) => {
    // Check if l1 equals l2 directly, or if l1.listener equals l2
    return l1 === l2 || (hasListener(l1) && l1.listener === l2);
};
/**
 * Executes a listener using the internal `execute*` functions based on the number of arguments.
 * @function module:core~executeHandler
 * @param {module:context.EventHandler} handler
 * @param {external:Array} data
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
 * @function module:core~getEventTypes
 * @param {module:context.EventEmitter} emitter The emitter on which event types will be retrieved.
 * @return {external:Array<module:context.EventType>} The list of event types registered to the emitter.
 */
const getEventTypes = (emitter) => keys(emitter[$events]);
/**
 * Execute a listener with no arguments.
 * @function module:core~handleMany
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
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
 * @function module:core~handleOne
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
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
 * @function module:core~handleTwo
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
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
 * @function module:core~handleThree
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
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
 * @function module:core~handleMany
 * @param {module:context.EventHandler} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link Function|function}.
 * @param {module:context.EventEmitter} emitter The emitter.
 * @param {external:Array} args Four or more arguments.
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
 * @function module:core~isEventHandler
 * @param {*} value The value to be tested.
 * @return {external:boolean} Whether or not the value is an event handler.
 */
const isEventHandler = (value) => isFunction(value) || isArray(value);
/**
 * @function module:core~removeEventListener
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
 * @function module:core~spliceList
 * @param {external:Array} list
 * @param {external:number} index
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
 * @mixin module:context.AsEventEmitter
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
         * @function module:context.AsEventEmitter#emit
         * @param {module:context.EventType} type The event type.
         * @param {...*} [data] The data passed into the listeners.
         * @return {external:boolean} Whether or not the event had listeners.
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
         * @function module:context.AsEventEmitter#eventTypes
         * @return {external:Array<module:context.EventType>} The list of event types registered to the emitter.
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
         * @function module:context.AsEventEmitter#listenerCount
         * @param {module:context.EventType} type The event type.
         * @return {external:number} The number of listeners for that event type within the given emitter.
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
         * @function module:context.AsEventEmitter#listeners
         * @param {module:context.EventType} type The event type.
         * @return {external:number} The number of listeners for that event type within the given emitter.
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
         * @function module:context.AsEventEmitter#on
         * @param {module:context.EventType} [type] The event type.
         * @param {module:context.EventListener} listener The event callback.
         * @return {module:context.EventEmitter} The emitter.
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
         * @function module:context.AsEventEmitter#off
         * @param {module:context.EventType} type The event type.
         * @param {module:context.EventListener} listener The event callback.
         * @return {module:context.EventEmitter} The emitter.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ldmVudC1lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxPQUFPLEVBQWlCLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFrQixVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQVUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzlHLE9BQU8sRUFBUyxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUF1QnBEOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7R0FLRztBQUVIOzs7OztHQUtHO0FBRUgsTUFBTSxPQUFPLEdBQUcsa0JBQWtCLEVBQzlCLE1BQU0sR0FBRyxpQkFBaUIsRUFDMUIsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUQsRUFBRSxjQUFjLEVBQUUsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUNyQyxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sRUFDakIsRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQ25CLFNBQVMsR0FBRyxVQUFVLEVBQ3RCLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQzlCLFdBQVcsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQ3JDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQThCLENBQUM7QUFFckU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQ0FBZ0MsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsMEJBQTBCLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FFakUsQ0FBQztBQUUzQzs7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