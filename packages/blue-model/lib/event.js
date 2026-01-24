import { asEventEmitter } from '@blue/context';
import { Model } from 'objectmodel';
// Import internal functions from objectmodel source
// These functions are exported from the source but not typed in the public API
// We use namespace imports with type assertions to work around missing type exports
import * as objectModelInternal from '../node_modules/objectmodel/src/object-model.js';
import * as helpersInternal from '../node_modules/objectmodel/src/helpers.js';
const initModel = objectModelInternal.initModel;
const getTraps = objectModelInternal.getTraps;
const extend = helpersInternal.extend;
const merge = helpersInternal.merge;
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
    return initModel(def, EventModel, Object, initEventModel, function (model) {
        const traps = getTraps(model, def), set = traps.set;
        traps.set = function (o, key, val) {
            const prev = o[key], result = set(o, key, val);
            if (result === true && key !== '@@emitter/events') {
                o.emit(`change:${key}`, prev, val);
            }
            return result;
        };
        return traps;
    }, true);
}
extend(EventModel, Model, {
    name: 'EventModel',
});
export default EventModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRXBDLG9EQUFvRDtBQUNwRCwrRUFBK0U7QUFDL0Usb0ZBQW9GO0FBQ3BGLE9BQU8sS0FBSyxtQkFBbUIsTUFBTSxpREFBaUQsQ0FBQztBQUN2RixPQUFPLEtBQUssZUFBZSxNQUFNLDRDQUE0QyxDQUFDO0FBRTlFLE1BQU0sU0FBUyxHQUFTLG1CQUEyQixDQUFDLFNBQVMsQ0FBQztBQUM5RCxNQUFNLFFBQVEsR0FBUyxtQkFBMkIsQ0FBQyxRQUFRLENBQUM7QUFDNUQsTUFBTSxNQUFNLEdBQVMsZUFBdUIsQ0FBQyxNQUFNLENBQUM7QUFDcEQsTUFBTSxLQUFLLEdBQVMsZUFBdUIsQ0FBQyxLQUFLLENBQUM7QUFFbEQsTUFBTSxjQUFjLEdBQUcsVUFBVSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUs7SUFDOUMsSUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFLENBQUM7UUFDdkIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ0QsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUIsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEIsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0QsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsQixjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUVGOzs7R0FHRztBQUVILE1BQU0sVUFBVSxVQUFVLENBQUMsR0FBRztJQUMxQixPQUFPLFNBQVMsQ0FDWixHQUFHLEVBQ0gsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsVUFBVSxLQUFLO1FBQ1gsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFDOUIsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDcEIsS0FBSyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUM3QixNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ2YsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssa0JBQWtCLEVBQUUsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN2QyxDQUFDO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQyxFQUNELElBQUksQ0FDUCxDQUFDO0FBQ04sQ0FBQztBQUVELE1BQU0sQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFO0lBQ3RCLElBQUksRUFBRSxZQUFZO0NBQ3JCLENBQUMsQ0FBQztBQUVILGVBQWUsVUFBVSxDQUFDIn0=