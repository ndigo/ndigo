import { ObjectModel } from 'objectmodel';

const $events = '@@emitter/events';

function emitEvent(target: any, type: string, data: any[]): boolean {
    const events = target[$events];
    if (!events || !events[type]) {
        return false;
    }

    const handler = events[type];
    if (typeof handler === 'function') {
        handler.apply(target, data);
    } else if (Array.isArray(handler)) {
        const listeners = handler.slice();
        for (let index = 0; index < listeners.length; index += 1) {
            listeners[index].apply(target, data);
        }
    }

    return true;
}

function asMinimalEventEmitter(target: any): void {
    if (typeof target.emit === 'function' && typeof target.on === 'function' && typeof target.off === 'function') {
        return;
    }

    Object.defineProperty(target, $events, {
        value: Object.create(null),
        configurable: true,
        enumerable: false,
        writable: true,
    });

    Object.defineProperty(target, 'emit', {
        value: function (type: string, ...data: any[]): boolean {
            let executed = emitEvent(this, type, data);

            let index = type.lastIndexOf(':');
            while (index > 0) {
                type = type.substring(0, index);
                executed = emitEvent(this, type, data) || executed;
                index = type.lastIndexOf(':');
            }

            return executed;
        },
        configurable: true,
        enumerable: false,
        writable: true,
    });

    Object.defineProperty(target, 'on', {
        value: function (type: string, listener: Function): any {
            const events = this[$events];
            if (!events[type]) {
                events[type] = listener;
            } else if (Array.isArray(events[type])) {
                events[type].push(listener);
            } else {
                events[type] = [events[type], listener];
            }
            return this;
        },
        configurable: true,
        enumerable: false,
        writable: true,
    });

    Object.defineProperty(target, 'off', {
        value: function (type: string, listener: Function): any {
            const events = this[$events];
            if (!events || !events[type]) {
                return this;
            }

            if (events[type] === listener) {
                delete events[type];
            } else if (Array.isArray(events[type])) {
                const index = events[type].indexOf(listener);
                if (index > -1) {
                    events[type].splice(index, 1);
                    if (events[type].length === 0) {
                        delete events[type];
                    }
                }
            }

            return this;
        },
        configurable: true,
        enumerable: false,
        writable: true,
    });
}

/**
 * Creates a model constructor that emits change events for assigned properties.
 *
 * Uses the public ObjectModel API and wraps each instance in a Proxy that
 * intercepts successful property sets and fires `change:<key>` events (which
 * bubble up through colon-delimited prefixes, e.g. `change`).
 *
 * @param def - ObjectModel definition used to validate values.
 * @returns A model constructor with minimal `emit`, `on`, and `off` support.
 */
export function EventModel(def: any): any {
    const BaseModel = (ObjectModel as any)(def);

    function EventModelConstructor(this: any, val?: any) {
        // Create a validated, proxified ObjectModel instance
        const instance = new BaseModel(val);

        // Mix event emitter methods into the underlying object
        asMinimalEventEmitter(instance);

        // Wrap with an outer Proxy that emits on successful sets
        return new Proxy(instance, {
            set(target: any, key: string | symbol, value: any): boolean {
                if (typeof key !== 'string' || key === $events) {
                    return Reflect.set(target, key, value);
                }
                const prev = target[key];
                const result = Reflect.set(target, key, value);
                if (result) {
                    target.emit(`change:${key}`, prev, value);
                }
                return result;
            },
        });
    }

    return EventModelConstructor;
}

export default EventModel;
