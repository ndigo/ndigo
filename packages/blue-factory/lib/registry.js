/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
/**
 * Interface that defines a registry for shared instances
 */
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link Registry|Registry}.
 */
export const likeRegistry = like({
    destroyValue: Function,
    getValue: Function,
    hasValue: Function,
    setValue: Function,
});
/**
 * A handler implementation that when applied to a {@link Registry|Registry} instance via {@link external:Proxy|Proxy} causes the registry
 * to behave like a plain object. This is used to implement {@link ProxiedFactory|ProxiedFactory}.
 * @implements external:ProxyHandler
 * @see {@link ProxiedFactory}
 */
export class RegistryProxyHandler {
    deleteProperty(target, key) {
        try {
            target.destroyValue(key);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    get(target, key) {
        return target.getValue(key);
    }
    has(target, key) {
        return target.hasValue(key);
    }
    set(target, key, value) {
        try {
            target.setValue(key, value);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBU2xDOztHQUVHO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixZQUFZLEVBQUUsUUFBUTtJQUN0QixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsUUFBUTtDQUNyQixDQUFpQyxDQUFDO0FBRW5DOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQUM3QixjQUFjLENBQUMsTUFBUyxFQUFFLEdBQWdCO1FBQ3RDLElBQUksQ0FBQztZQUNELE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBYSxDQUFDLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVELEdBQUcsQ0FBVSxNQUFTLEVBQUUsR0FBZ0I7UUFDcEMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFJLEdBQWEsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxHQUFHLENBQUMsTUFBUyxFQUFFLEdBQWdCO1FBQzNCLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFhLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsR0FBRyxDQUFVLE1BQVMsRUFBRSxHQUFnQixFQUFFLEtBQVE7UUFDOUMsSUFBSSxDQUFDO1lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBSSxHQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=