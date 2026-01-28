/**
 * @author Jeff Rose
 */
import { MethodParameterType } from './route-parameter';
import { defaultTo, isNil } from '@blue/util';
/**
 * Strategy interface for resolving method parameters into argument values in the context of a given route.
 */
/**
 * Whether the given {@link
 * @param {*} parameter The method parameter to check.
 * @returns {boolean} Whether or not the given method parameter is supported by this resolver.
 */
/**
 * Resolves a method parameter into an argument value from a given route.
 * @returns {*} The resolved argument value, or `null` if not resolvable.
 */
export class AbstractNamedValueMethodArgumentResolver {
    #factory;
    constructor(factory) {
        this.#factory = factory;
    }
    handleMissingValue(name) {
        throw TypeError(`"${name}" cannot be undefined or null`);
    }
}
/**
 * Abstract base class for resolving method arguments from a named value.
 *
 * Subclasses define how to:
 * * Obtain named value information for a method parameter
 * * Resolve names into argument values
 * * Handle missing argument values when argument values are required
 * * Optionally handle a resolved value
 *
 * A {@link Factory|Factory} must be supplied to the class constructor.
 * @abstract
 * @implements module:dispatcher.HandlerMethodArgumentResolver
 * @param {module:factory.Factory} factory A factory for resolving values
 */
/**
 * @abstract
 * @implements module:dispatcher.HandlerMethodArgumentResolver
 */
/**
 * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
 */
export class MatrixValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    resolveArgument(parameter, route, mapping) {
        const resolveValue = defaultTo(parameter.defaultValue);
        let index = -1, name = mapping.value.slice(1), segment, value;
        while ((segment = route[++index])) {
            if (!segment) {
                break;
            }
            // @ts-ignore: ¯\_(ツ)_/¯
            if (segment.name === name) {
                value = segment.data[parameter.name];
                if (!isNil(value)) {
                    break;
                }
            }
        }
        if (isNil(value)) {
            value = resolveValue(route.data[parameter.name]);
        }
        isNil(value) && parameter.required && this.handleMissingValue(parameter.name);
        return value;
    }
    supportsParameter(parameter) {
        return MethodParameterType.MATRIX.equals(parameter.type);
    }
}
/**
 * @extends module:dispatcher.AbstractNamedValueMethodArgumentResolver
 */
export class QueryValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    resolveArgument(parameter, route, mapping) {
        const resolveValue = defaultTo(parameter.defaultValue), value = resolveValue(route.data[parameter.name]);
        isNil(value) && parameter.required && this.handleMissingValue(parameter.name);
        return value;
    }
    supportsParameter(parameter) {
        return MethodParameterType.QUERY.equals(parameter.type);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQtcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXJndW1lbnQtcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFJSCxPQUFPLEVBQW1CLG1CQUFtQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDekUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFPOUM7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUgsTUFBTSxPQUFnQix3Q0FBd0M7SUFDMUQsUUFBUSxDQUFVO0lBRWxCLFlBQVksT0FBaUI7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQUVELGtCQUFrQixDQUFDLElBQVk7UUFDM0IsTUFBTSxTQUFTLENBQUMsSUFBSSxJQUFJLCtCQUErQixDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUlKO0FBRUQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGlDQUFrQyxTQUFRLHdDQUF3QztJQUMzRixlQUFlLENBQUMsU0FBMEIsRUFBRSxLQUFZLEVBQUUsT0FBTztRQUM3RCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUNWLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDN0IsT0FBTyxFQUNQLEtBQUssQ0FBQztRQUNWLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDWCxNQUFNO1lBQ1YsQ0FBQztZQUNELHdCQUF3QjtZQUN4QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQ3hCLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNoQixNQUFNO2dCQUNWLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDZixLQUFLLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUNELEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUUsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELGlCQUFpQixDQUFDLFNBQTBCO1FBQ3hDLE9BQU8sbUJBQW1CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZ0NBQWlDLFNBQVEsd0NBQXdDO0lBQzFGLGVBQWUsQ0FBQyxTQUEwQixFQUFFLEtBQVksRUFBRSxPQUFPO1FBQzdELE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEVBQ2xELEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRCxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlFLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxTQUEwQjtRQUN4QyxPQUFPLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7Q0FDSiJ9