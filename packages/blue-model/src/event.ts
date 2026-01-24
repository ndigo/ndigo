import { asEventEmitter } from '@blue/context';
import { Model, initModel, getTraps } from '../node_modules/objectmodel/src/object-model';
import { extend, merge } from '../node_modules/objectmodel/src/helpers';

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
 * @class module:model.EventModel
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
