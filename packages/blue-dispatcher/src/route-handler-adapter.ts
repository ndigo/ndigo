/**
 * @author Jeff Rose
 */

import { complement } from '@blue/util/logic';
import { like } from '@blue/util/types';
import { ModelAndView } from './model-and-view';
import { Controller } from './controller';
import { Route } from '@blue/router';
import { Null, isNotPrimitive } from '@blue/core';
import { Initializable, $aware } from '@blue/factory';
import { RouteHandlerMethod } from './route-handler-method';
import { AsApplicationContextAware, ApplicationContext } from '@blue/context';
import { getRouteMapping, hasRouteMapping } from './route-mapping';
import {
    HandlerMethodArgumentResolver,
    MatrixValueMethodArgumentResolver,
    PathValueMethodArgumentResolver,
    QueryValueMethodArgumentResolver,
} from './argument-resolver';

export interface RouteHandlerAdapter {
    handle(route: Route, handler): Promise<ModelAndView>;
    supports(handler): boolean;
}

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

const { getPrototypeOf } = Reflect,
    { assign, keys } = Object,
    isNotArray = complement(Array.isArray);

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is a {@link Controller|Controller}
 */
export const likeController = like({ handleRoute: Function }) as (value) => value is Controller;

export abstract class AbstractHandlerMethodAdapter
    extends AsApplicationContextAware(Null)
    implements RouteHandlerAdapter
{
    applicationContext: ApplicationContext;

    get [Symbol.toStringTag](): string {
        return 'HandlerMethodAdapter';
    }

    supports(handler): boolean {
        return handler instanceof RouteHandlerMethod && this._supports(handler);
    }

    abstract handle(route: Route, handler: RouteHandlerMethod): Promise<ModelAndView>;
    protected abstract _supports(handler: RouteHandlerMethod): boolean;
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
export class ControllerHandlerAdapter implements RouteHandlerAdapter {
    get [Symbol.toStringTag](): string {
        return 'ControllerHandlerAdapter';
    }

    async handle(route: Route, handler): Promise<ModelAndView> {
        return await (handler as Controller).handleRoute(route);
    }

    supports(handler): boolean {
        return likeController(handler);
    }
}

/**
 * Implementation of {@link AbstractHandlerMethodAdapter} that supports {@link HandlerMethod|HandlerMethods} decorated with `route:mapping` metadata. This is usually applied using {@link RouteMapping|@RouteMapping}.
 * @extends module:dispatcher.AbstractHandlerMethodAdapter
 * @implements module:core.Initializable
 */
export class MetadataHandlerAdapter extends AbstractHandlerMethodAdapter implements Initializable {
    argumentResolvers: HandlerMethodArgumentResolver[];
    handlers: any[];

    get [Symbol.toStringTag](): string {
        return 'MetadataHandlerAdapter';
    }

    get defaultArgumentResolvers(): HandlerMethodArgumentResolver[] {
        return [
            new PathValueMethodArgumentResolver(),
            new MatrixValueMethodArgumentResolver(),
            new QueryValueMethodArgumentResolver(),
        ];
    }

    get [$aware](): boolean {
        return true;
    }

    async handle(route: Route, handler: RouteHandlerMethod): Promise<ModelAndView> {
        handler.argumentResolvers = this.argumentResolvers;

        return await handler.invoke<ModelAndView>(route);
    }

    init(...args: any[]): void {
        const { applicationContext } = this,
            contextKeys = keys(applicationContext),
            contextKeysLength = contextKeys.length,
            handlers = [];

        if (contextKeysLength) {
            for (let contextKeyIndex = 0; contextKeyIndex < contextKeysLength; contextKeyIndex++) {
                const contextKey = contextKeys[contextKeyIndex],
                    contextValue = applicationContext.getValue<object>(contextKey);

                if (isNotPrimitive(contextValue)) {
                    const valuePrototype = getPrototypeOf(contextValue),
                        valueConstructor = valuePrototype.constructor;

                    if (hasRouteMapping(valueConstructor)) {
                        const constructorMapping = getRouteMapping(valueConstructor),
                            valueKeys = keys(valuePrototype),
                            valueKeysLength = valueKeys.length;

                        if (valueKeysLength) {
                            for (let valueKeyIndex = 0; valueKeyIndex < valueKeysLength; valueKeyIndex++) {
                                const valueKey = valueKeys[valueKeyIndex];
                                if (hasRouteMapping(valuePrototype, valueKey)) {
                                    const methodMapping = getRouteMapping(valuePrototype, valueKey),
                                        mapping = assign({}, constructorMapping, methodMapping);
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

    _supports(handler: RouteHandlerMethod): boolean {
        return handler instanceof RouteHandlerMethod;
    }
}
