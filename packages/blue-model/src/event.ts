import { asEventEmitter } from '@blue/context';

// Import internal functions from objectmodel source
// These functions are exported from the source but not typed in the public API
// We use namespace imports with type assertions to work around missing type exports
import * as objectModelInternal from '../node_modules/objectmodel/src/object-model.js';
import * as helpersInternal from '../node_modules/objectmodel/src/helpers.js';

const initModel: any = (objectModelInternal as any).initModel;
const initObjectModel: any = (objectModelInternal as any).initObjectModel;
const getTraps: any = (objectModelInternal as any).getTraps;
const Model: any = (objectModelInternal as any).Model;
const extend: any = (helpersInternal as any).extend;

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
                asEventEmitter(value);
            }
            return value;
        },
        function (model) {
            const traps = getTraps(model, def),
                set = traps.set;
            traps.set = function (o, key, val) {
                const prev = o[key],
                    result = set(o, key, val);
                if (result === true && key !== '@@emitter/events') {
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
