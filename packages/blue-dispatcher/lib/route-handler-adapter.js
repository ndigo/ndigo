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
 * Interface that must be implemented for each handler type to handle a route. This interface is used to allow the {@link module:dispatcher.Dispatcher} to be extensible. The `Dispatcher` accesses all installed handlers through this interface, meaning that it does not contain code specific to any handler type.
 *
 * This interface is not intended for application developers. It is available to developers who want to create their own workflow.
 * @interface module:dispatcher.HandlerAdapter
 */
/**
 * Use the given handler to handle this route.
 * @function module:dispatcher.HandlerAdapter#handle
 * @param {module:router.Route} route
 * @param {*} handler The handler to use. It must have previously been passed to the `supports` method of this interface, which must have returned `true`.
 * @returns {external:Promise<module:dispatcher.ModelAndView>}
 */
/**
 * Given a handler instance, return whether or not this `HandlerAdapter` can support it. Typical RouteHandlerAdapters will base the decision on the handler type. RouteHandlerAdapters will usually only support one handler type each.
 * @function module:dispatcher.HandlerAdapter#supports
 * @param {*} handler The handler to check
 * @returns {external:boolean} Whether or not the given handler is supported
 * @example
 * class MyHandlerAdapter {
 *  supports( handler ){
 *      return handler instanceof MyHandler;
 *  }
 * }
 */
const { getPrototypeOf } = Reflect, { assign, keys } = Object, isNotArray = complement(Array.isArray);
/**
 * @function module:dispatcher.likeController
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:dispatcher.Controller|Controller}
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
 * @class module:dispatcher.AbstractHandlerMethodAdapter
 * @implements module:dispatcher.HandlerAdapter
 */
/**
 * This implementation expects the handler to be a {@linkcode module:dispatcher.HandlerMethod|HandlerMethod}.
 * @function module:dispatcher.AbstractHandlerMethodAdapter#supports
 * @param handler The handler instance to check
 * @returns Whether or not this adapter can adapt the given handler
 */
/**
 * @class module:dispatcher.ControllerHandlerAdapter
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
 * Implementation of {@link module:dispatcher.AbstractHandlerMethodAdapter} that supports {@linkcode module:dispatcher.HandlerMethod|HandlerMethods} decorated with `route:mapping` metadata. This is usually applied using {@linkcode module:router.RouteMapping|@RouteMapping}.
 * @class module:dispatcher.MetadataHandlerAdapter
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlLWhhbmRsZXItYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSTlDLE9BQU8sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xELE9BQU8sRUFBaUIsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzVELE9BQU8sRUFBRSx5QkFBeUIsRUFBc0IsTUFBTSxlQUFlLENBQUM7QUFDOUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRSxPQUFPLEVBRUgsaUNBQWlDLEVBQ2pDLGdDQUFnQyxHQUNuQyxNQUFNLHFCQUFxQixDQUFDO0FBTzdCOzs7OztHQUtHO0FBRUg7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7Ozs7O0dBV0c7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQ3pCLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRTNDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFtQyxDQUFDO0FBRWhHLE1BQU0sT0FBZ0IsNEJBQ2xCLFNBQVEseUJBQXlCLENBQUMsSUFBSSxDQUFDO0lBR3ZDLGtCQUFrQixDQUFxQjtJQUV2QyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLHNCQUFzQixDQUFDO0lBQ2xDLENBQUM7SUFFRCxR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