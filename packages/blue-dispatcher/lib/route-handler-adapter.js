/**
 * @author Jeff Rose
 */
import { complement, like } from '@blue/util';
import { Null, isNotPrimitive } from '@blue/core';
import { $aware } from '@blue/factory';
import { RouteHandlerMethod } from './route-handler-method';
import { AsApplicationContextAware } from '@blue/context';
import { getRouteMapping, hasRouteMapping } from './route-mapping';
import { MatrixValueMethodArgumentResolver, QueryValueMethodArgumentResolver, } from './argument-resolver';
/**
 * Interface that must be implemented for each handler type to handle a route. This interface is used to allow the {@link Dispatcher} to be extensible. The `Dispatcher` accesses all installed handlers through this interface, meaning that it does not contain code specific to any handler type.
 *
 * This interface is not intended for application developers. It is available to developers who want to create their own workflow.
 */
/**
 * Use the given handler to handle this route.
 * @param {module:router.Route} route
 * @param {*} handler The handler to use. It must have previously been passed to the `supports` method of this interface, which must have returned `true`.
 * @returns {Promise<module:dispatcher.ModelAndView>}
 */
/**
 * Given a handler instance, return whether or not this `HandlerAdapter` can support it. Typical RouteHandlerAdapters will base the decision on the handler type. RouteHandlerAdapters will usually only support one handler type each.
 * @param {*} handler The handler to check
 * @returns {boolean} Whether or not the given handler is supported
 * @example
 * class MyHandlerAdapter {
 *  supports( handler ){
 *      return handler instanceof MyHandler;
 *  }
 * }
 */
const { getPrototypeOf } = Reflect, { assign, keys } = Object, isNotArray = complement(Array.isArray);
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is a {@link Controller|Controller}
 */
export const likeController = like({ handleRoute: Function });
export class AbstractHandlerMethodAdapter extends AsApplicationContextAware(Null) {
    applicationContext;
    get [Symbol.toStringTag]() {
        return 'HandlerMethodAdapter';
    }
    supports(handler) {
        return handler instanceof RouteHandlerMethod && this._supports(handler);
    }
}
/**
 * @abstract
 * @implements module:dispatcher.HandlerAdapter
 */
/**
 * This implementation expects the handler to be a {@link HandlerMethod|HandlerMethod}.
 * @param handler The handler instance to check
 * @returns Whether or not this adapter can adapt the given handler
 */
/**
 * @implements module:dispatcher.HandlerAdapter
 */
export class ControllerHandlerAdapter {
    get [Symbol.toStringTag]() {
        return 'ControllerHandlerAdapter';
    }
    async handle(route, handler) {
        return await handler.handleRoute(route);
    }
    supports(handler) {
        return likeController(handler);
    }
}
/**
 * Implementation of {@link AbstractHandlerMethodAdapter} that supports {@link HandlerMethod|HandlerMethods} decorated with `route:mapping` metadata. This is usually applied using {@link RouteMapping|@RouteMapping}.
 * @extends module:dispatcher.AbstractHandlerMethodAdapter
 * @implements module:core.Initializable
 */
export class MetadataHandlerAdapter extends AbstractHandlerMethodAdapter {
    argumentResolvers;
    handlers;
    get [Symbol.toStringTag]() {
        return 'MetadataHandlerAdapter';
    }
    get defaultArgumentResolvers() {
        return [new MatrixValueMethodArgumentResolver(), new QueryValueMethodArgumentResolver()];
    }
    get [$aware]() {
        return true;
    }
    async handle(route, handler) {
        console.log('MetadataHandlerAdapter::handle', route, handler);
        handler.argumentResolvers = this.argumentResolvers;
        return await handler.invoke(route);
    }
    init(...args) {
        const { applicationContext } = this, contextKeys = keys(applicationContext), contextKeysLength = contextKeys.length, handlers = [];
        if (contextKeysLength) {
            for (let contextKeyIndex = 0; contextKeyIndex < contextKeysLength; contextKeyIndex++) {
                const contextKey = contextKeys[contextKeyIndex], contextValue = applicationContext.getValue(contextKey);
                if (isNotPrimitive(contextValue)) {
                    const valuePrototype = getPrototypeOf(contextValue), valueConstructor = valuePrototype.constructor;
                    if (hasRouteMapping(valueConstructor)) {
                        const constructorMapping = getRouteMapping(valueConstructor), valueKeys = keys(valuePrototype), valueKeysLength = valueKeys.length;
                        if (valueKeysLength) {
                            for (let valueKeyIndex = 0; valueKeyIndex < valueKeysLength; valueKeyIndex++) {
                                const valueKey = valueKeys[valueKeyIndex];
                                if (hasRouteMapping(valuePrototype, valueKey)) {
                                    const methodMapping = getRouteMapping(valuePrototype, valueKey), mapping = assign({}, constructorMapping, methodMapping);
                                    mapping.path = `${constructorMapping.value}${methodMapping.value}`;
                                    handlers.push(mapping);
                                }
                            }
                        }
                    }
                }
            }
        }
        if (isNotArray(this.argumentResolvers)) {
            this.argumentResolvers = this.defaultArgumentResolvers;
        }
        this.handlers = handlers;
    }
    _supports(handler) {
        return handler instanceof RouteHandlerMethod;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLWhhbmRsZXItYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSTlDLE9BQU8sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xELE9BQU8sRUFBaUIsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzVELE9BQU8sRUFBRSx5QkFBeUIsRUFBc0IsTUFBTSxlQUFlLENBQUM7QUFDOUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRSxPQUFPLEVBRUgsaUNBQWlDLEVBQ2pDLGdDQUFnQyxHQUNuQyxNQUFNLHFCQUFxQixDQUFDO0FBTzdCOzs7O0dBSUc7QUFFSDs7Ozs7R0FLRztBQUVIOzs7Ozs7Ozs7O0dBVUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQ3pCLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRTNDOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQW1DLENBQUM7QUFFaEcsTUFBTSxPQUFnQiw0QkFDbEIsU0FBUSx5QkFBeUIsQ0FBQyxJQUFJLENBQUM7SUFHdkMsa0JBQWtCLENBQXFCO0lBRXZDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sc0JBQXNCLENBQUM7SUFDbEMsQ0FBQztJQUVELFFBQVEs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