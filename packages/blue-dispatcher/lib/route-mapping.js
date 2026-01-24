/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
import { compose, isString, mergeRight, objOf, when } from '@blue/util';
const ROUTE_MAPPING = 'route:mapping', defaultMapping = {
    value: '/**',
    private: false,
}, { defineMetadata, getMetadata, hasMetadata } = Reflect, withDefaults = mergeRight(defaultMapping), configurationOf = objOf('value'), toRouteMappingConfiguration = when(isString, compose(withDefaults, configurationOf));
/**
 * @function module:dispatcher.defineRouteMapping
 * @param {*} value
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 */
export const defineRouteMapping = (value, target, propertyKey = void 0) => defineMetadata(ROUTE_MAPPING, value, target, propertyKey);
/**
 * @function module:dispatcher.getRouteMapping
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {*}
 */
export const getRouteMapping = (target, propertyKey = void 0) => getMetadata(ROUTE_MAPPING, target, propertyKey);
/**
 * @function module:dispatcher.hasRouteMapping
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {external:boolean} Whether or not the `target` and optional `propertyKey` has a route mapping defined.
 */
export const hasRouteMapping = (target, propertyKey = void 0) => hasMetadata(ROUTE_MAPPING, target, propertyKey);
/**
 * @function module:router.RouteMapping
 * @param {external:string} route
 */
export const routeMapping = (route = defaultMapping) => {
    const conf = toRouteMappingConfiguration(route);
    return function (target, propertyKey, descriptor) {
        if (propertyKey) {
            defineRouteMapping(conf, target, propertyKey);
            descriptor.enumerable = true;
            console.log('@RouteMapping', conf, target, propertyKey);
            return descriptor;
        }
        else {
            defineRouteMapping(conf, target);
            console.log('@RouteMapping', conf, target);
            return target;
        }
    };
};
export const publicMapping = (route) => routeMapping({ value: route, private: false });
export const privateMapping = (route) => routeMapping({ value: route, private: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtbWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZS1tYXBwaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQVl4RSxNQUFNLGFBQWEsR0FBRyxlQUFlLEVBQ2pDLGNBQWMsR0FBOEI7SUFDeEMsS0FBSyxFQUFFLEtBQUs7SUFDWixPQUFPLEVBQUUsS0FBSztDQUNqQixFQUNELEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLEVBQ3RELFlBQVksR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLEVBQ3pDLGVBQWUsR0FBRyxLQUFLLENBQVMsT0FBTyxDQUF5QyxFQUNoRiwyQkFBMkIsR0FBRyxJQUFJLENBQzlCLFFBQVEsRUFDUixPQUFPLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUN6QyxDQUFDO0FBRU47Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsY0FBK0IsS0FBSyxDQUFDLEVBQVEsRUFBRSxDQUM3RixjQUFjLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFOUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxNQUFNLEVBQUUsY0FBK0IsS0FBSyxDQUFDLEVBQU8sRUFBRSxDQUNsRixXQUFXLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztBQUVwRDs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxjQUErQixLQUFLLENBQUMsRUFBVyxFQUFFLENBQ3RGLFdBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBRXBEOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxDQUFDLFFBQTRDLGNBQWMsRUFBRSxFQUFFO0lBQ3ZGLE1BQU0sSUFBSSxHQUFHLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELE9BQU8sVUFBVSxNQUFjLEVBQUUsV0FBNkIsRUFBRSxVQUErQjtRQUMzRixJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2Qsa0JBQWtCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM5QyxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7YUFBTSxDQUFDO1lBQ0osa0JBQWtCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQyxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRS9GLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyJ9