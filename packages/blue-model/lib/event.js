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
/**
 * @extends module:model.Model
 */
export function EventModel(def) {
    return initModel(def, EventModel, Object, null, function (model) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVwQyxvREFBb0Q7QUFDcEQsK0VBQStFO0FBQy9FLG9GQUFvRjtBQUNwRixPQUFPLEtBQUssbUJBQW1CLE1BQU0saURBQWlELENBQUM7QUFDdkYsT0FBTyxLQUFLLGVBQWUsTUFBTSw0Q0FBNEMsQ0FBQztBQUU5RSxNQUFNLFNBQVMsR0FBUyxtQkFBMkIsQ0FBQyxTQUFTLENBQUM7QUFDOUQsTUFBTSxRQUFRLEdBQVMsbUJBQTJCLENBQUMsUUFBUSxDQUFDO0FBQzVELE1BQU0sTUFBTSxHQUFTLGVBQXVCLENBQUMsTUFBTSxDQUFDO0FBQ3BELE1BQU0sS0FBSyxHQUFTLGVBQXVCLENBQUMsS0FBSyxDQUFDO0FBRWxEOztHQUVHO0FBRUgsTUFBTSxVQUFVLFVBQVUsQ0FBQyxHQUFHO0lBQzFCLE9BQU8sU0FBUyxDQUNaLEdBQUcsRUFDSCxVQUFVLEVBQ1YsTUFBTSxFQUNOLElBQUksRUFDSixVQUFVLEtBQUs7UUFDWCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUM5QixHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUNwQixLQUFLLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHO1lBQzdCLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDZixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxrQkFBa0IsRUFBRSxDQUFDO2dCQUNoRCxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUM7UUFDRixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDLEVBQ0QsSUFBSSxDQUNQLENBQUM7QUFDTixDQUFDO0FBRUQsTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUU7SUFDdEIsSUFBSSxFQUFFLFlBQVk7Q0FDckIsQ0FBQyxDQUFDO0FBRUgsZUFBZSxVQUFVLENBQUMifQ==