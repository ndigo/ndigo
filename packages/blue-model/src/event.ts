// Import internal functions from objectmodel source
// These functions are exported from the source but not typed in the public API
// We use namespace imports with type assertions to work around missing type exports
import * as objectModelInternal from 'objectmodel/src/object-model.js';
import * as helpersInternal from 'objectmodel/src/helpers.js';

const initModel: any = (objectModelInternal as any).initModel;
const initObjectModel: any = (objectModelInternal as any).initObjectModel;
const getTraps: any = (objectModelInternal as any).getTraps;
const Model: any = (objectModelInternal as any).Model;
const extend: any = (helpersInternal as any).extend;
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
 * @extends module:model.Model
 */

export function EventModel(def) {
    return initModel(
        def,
        EventModel,
        Object,
        function (obj, model, _this) {
            const value = initObjectModel(obj, model, _this);
            if (value && (typeof value === 'object' || typeof value === 'function')) {
                asMinimalEventEmitter(value);
            }
            return value;
        },
        function (model) {
            const traps = getTraps(model, def),
                set = traps.set;
            traps.set = function (o, key, val) {
                const prev = o[key],
                    result = set(o, key, val);
                if (result === true && key !== $events) {
                    o.emit(`change:${key}`, prev, val);
                }
                return result;
            };
            return traps;
        },
        true
    );
}

extend(EventModel, Model, {
    name: 'EventModel',
});

export default EventModel;
