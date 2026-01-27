import { asEventEmitter } from '@blue/context';
import { Model } from 'objectmodel';

// Import internal functions from objectmodel source
// These functions are exported from the source but not typed in the public API
// We use namespace imports with type assertions to work around missing type exports
import * as objectModelInternal from '../node_modules/objectmodel/src/object-model.js';
import * as helpersInternal from '../node_modules/objectmodel/src/helpers.js';

const initModel: any = (objectModelInternal as any).initModel;
const getTraps: any = (objectModelInternal as any).getTraps;
const extend: any = (helpersInternal as any).extend;
const merge: any = (helpersInternal as any).merge;

const initEventModel = function (obj, model, _this) {
    if (obj instanceof model) {
        return obj;
    }
    merge(_this, model.default);
    if (model.parentClass) {
        merge(obj, new model.parentClass(obj));
    }
    merge(_this, obj);
    asEventEmitter.call(_this);
    return _this;
};

/**
 * @extends module:model.Model
 */

export function EventModel(def) {
    return initModel(
        def,
        EventModel,
        Object,
        initEventModel,
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
