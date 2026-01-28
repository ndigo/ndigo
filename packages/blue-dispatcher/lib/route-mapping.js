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
 * @param {*} value
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 */
export const defineRouteMapping = (value, target, propertyKey = void 0) => defineMetadata(ROUTE_MAPPING, value, target, propertyKey);
/**
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 * @returns {*}
 */
export const getRouteMapping = (target, propertyKey = void 0) => getMetadata(ROUTE_MAPPING, target, propertyKey);
/**
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 * @returns {boolean} Whether or not the `target` and optional `propertyKey` has a route mapping defined.
 */
export const hasRouteMapping = (target, propertyKey = void 0) => hasMetadata(ROUTE_MAPPING, target, propertyKey);
/**
 * @param {string} route
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtbWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZS1tYXBwaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQVl4RSxNQUFNLGFBQWEsR0FBRyxlQUFlLEVBQ2pDLGNBQWMsR0FBOEI7SUFDeEMsS0FBSyxFQUFFLEtBQUs7SUFDWixPQUFPLEVBQUUsS0FBSztDQUNqQixFQUNELEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLEVBQ3RELFlBQVksR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLEVBQ3pDLGVBQWUsR0FBRyxLQUFLLENBQVMsT0FBTyxDQUF5QyxFQUNoRiwyQkFBMkIsR0FBRyxJQUFJLENBQzlCLFFBQVEsRUFDUixPQUFPLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUN6QyxDQUFDO0FBRU47Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxjQUErQixLQUFLLENBQUMsRUFBUSxFQUFFLENBQzdGLGNBQWMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztBQUU5RDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFFLGNBQStCLEtBQUssQ0FBQyxFQUFPLEVBQUUsQ0FDbEYsV0FBVyxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFcEQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxjQUErQixLQUFLLENBQUMsRUFBVyxFQUFFLENBQ3RGLFdBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBRXBEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLENBQUMsUUFBNEMsY0FBYyxFQUFFLEVBQUU7SUFDdkYsTUFBTSxJQUFJLEdBQUcsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEQsT0FBTyxVQUFVLE1BQWMsRUFBRSxXQUE2QixFQUFFLFVBQStCO1FBQzNGLElBQUksV0FBVyxFQUFFLENBQUM7WUFDZCxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzlDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDeEQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQzthQUFNLENBQUM7WUFDSixrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFL0YsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDIn0=