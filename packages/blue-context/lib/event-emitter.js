/**
 * @author Jeff Rose
 */
import { EventEmitter as BaseEventEmitter } from '@blue/platform';
import { either, complement } from '@blue/util/logic';
import { lastIndexOf } from '@blue/util/list';
import { prop } from '@blue/util/object';
import { propEq } from 'ramda';
import { isFunction, isNil, like, is } from '@blue/util/types';
// propIs helper since it's not exported from @blue/util/types
const propIs = (type) => (name) => (obj) => is(type, prop(name, obj));
const { freeze, keys } = Object, { defineProperty } = Reflect, isNotNil = complement(isNil);
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is {@link Emittable|Emittable}.
 */
export const likeEmittable = like({ addEventListener: Function, removeEventListener: Function });
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is {@link Listener|Listener}.
 */
export const likeListener = either(isFunction, like({ fn: Function }));
/**
 * @template T
 * @param {module:core.Constructable<T>} [superclass=Object] The superclass to extend
 * @returns {module:core.Constructable<T>} A class definition
 */
export const AsEventEmitter = (superclass) => class extends superclass {
    #events;
    #maxListeners;
    constructor(...args) {
        super(...args);
        defineProperty(this, '_events', {
            value: new Map(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, '_maxListeners', {
            value: 10,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
    /**
     * @param {*} event The event type
     * @param {...*} data The event payload
     * @returns {boolean} Returns `true` if the event had listeners, `false` otherwise
     */
    emit(event, ...data) {
        if (this.#events.has(event)) {
            const listeners = this.#events.get(event), length = listeners.length;
            let index = 0;
            for (; index < length; index++) {
                const listener = listeners[index], fn = likeListener(listener) ? listener.fn : listener;
                fn.apply(this, data);
                if (listener.once) {
                    this.off(event, listener);
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * @returns {Array} A list of events for which the emitter has registered listeners
     */
    eventNames() {
        return [...this.#events.keys()];
    }
    /**
     * @returns {number} The current max listener value for the `EventEmitter`, which is either set by {@link setMaxListeners} or defaults to 10.
     */
    getMaxListeners() {
        return this.#maxListeners;
    }
    /**
     * @param {*} event The event type
     * @param {Function} [fn] The listener
     * @returns {number} The number of listeners listening to the event named `event`.
     */
    listenerCount(event, fn) {
        let count = 0;
        if (this.#events.has(event)) {
            const listeners = this.#events.get(event), filter = isFunction(fn) ? propEq('fn', fn) : () => true, length = listeners.length;
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
    listeners(event) {
        const listeners = this.#events.get(event);
        return listeners ? [...listeners] : [];
    }
    /**
     * @param {*} event The event type
     * @param {Function} fn The listener
     * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
     */
    off(event, fn) {
        if (this.#events.has(event)) {
            const listeners = this.#events.get(event);
            const listener = likeListener(fn) ? fn : { fn };
            const index = lastIndexOf(listener, listeners);
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
    on(event, fn, once = false) {
        if (isNotNil(event)) {
            if (!isFunction(fn)) {
                throw new TypeError('Listener must be a function');
            }
            const listener = { fn, once };
            if (!this.#events.has(event)) {
                this.#events.set(event, []);
            }
            const listeners = this.#events.get(event);
            const index = lastIndexOf(listener, listeners);
            if (index === -1) {
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
    once(event, fn) {
        return this.on(event, fn, true);
    }
    /**
     * @param {*} [event] The event type
     * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
     */
    removeAllListeners(event) {
        if (isNotNil(event)) {
            this.#events.delete(event);
        }
        else {
            this.#events.clear();
        }
        return this;
    }
    /**
     * @param {*} event The event type
     * @param {Function} fn The listener
     * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
     */
    removeListener(event, fn) {
        return this.off(event, fn);
    }
    /**
     * @param {number} n The number of listeners
     * @returns {module:context.EventEmitter} A reference to the `EventEmitter`, so that calls can be chained.
     */
    setMaxListeners(n) {
        this.#maxListeners = n;
        return this;
    }
    toJSON() {
        const keys = this.eventNames(), length = keys.length, result = {};
        let index = 0;
        for (; index < length; index++) {
            const key = keys[index];
            result[String(key)] = this.listenerCount(key);
        }
        return result;
    }
};
export class EventEmitter extends AsEventEmitter(BaseEventEmitter) {
}
export default EventEmitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ldmVudC1lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFFLFlBQVksSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRS9CLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUUvRCw4REFBOEQ7QUFDOUQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFeEYsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQzNCLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1QixRQUFRLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBNEJqQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxDQUV4RSxDQUFDO0FBRXhCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLElB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