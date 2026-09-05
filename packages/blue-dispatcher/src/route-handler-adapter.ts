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
    AttributeValueMethodArgumentResolver,
    likeArgumentResolver,
} from './argument-resolver';
import { IllegalStateError } from '@blue/core';

/**
 * Adapts a handler instance into route execution.
 *
 * Implementations decide whether they support a handler type and how to invoke it for the current route.
 */
export interface RouteHandlerAdapter {
    /**
     * Handle a route with the given handler.
     *
     * The handler should already have been accepted by {@link RouteHandlerAdapter.supports}.
     *
     * @param route - The current route.
     * @param handler - The handler instance selected for the route.
     * @returns The model and view produced by handler execution.
     */
    handle(route: Route, handler: object | undefined): Promise<ModelAndView>;

    /**
     * Tests whether this adapter supports the given handler.
     *
     * @param handler - The handler instance to test.
     * @returns `true` when the handler is supported.
     */
    supports(handler: object | undefined): boolean;
}

const { getPrototypeOf } = Reflect,
    { assign, keys } = Object,
    isNotArray = (value: unknown) => !Array.isArray(value);

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is a {@link Controller|Controller}
 */
export const likeController = like({ handleRoute: Function }) as (value: unknown) => value is Controller;

export abstract class AbstractHandlerMethodAdapter
    extends AsApplicationContextAware(Null)
    implements RouteHandlerAdapter
{
    /**
     * Application context used to discover handlers and argument resolvers.
     */
    applicationContext!: ApplicationContext | null;

    get [Symbol.toStringTag](): string {
        return 'HandlerMethodAdapter';
    }

    supports(handler: object | undefined): boolean {
        return handler instanceof RouteHandlerMethod && this._supports(handler);
    }

    /**
     * Handle a route with a method-backed handler.
     *
     * @param route - The current route.
     * @param handler - The resolved route handler method.
     * @returns The model and view produced by invoking the handler.
     */
    abstract handle(route: Route, handler: RouteHandlerMethod): Promise<ModelAndView>;
    protected abstract _supports(handler: RouteHandlerMethod): boolean;
}

/**
 * This implementation expects the handler to be a `HandlerMethod`.
 */
export class ControllerHandlerAdapter implements RouteHandlerAdapter {
    get [Symbol.toStringTag](): string {
        return 'ControllerHandlerAdapter';
    }

    /**
     * Invoke a controller's {@link Controller.handleRoute} method for the current route.
     *
     * @param route - The current route.
     * @param handler - The controller instance.
     * @returns The model and view returned by the controller.
     */
    async handle(route: Route, handler: object | undefined): Promise<ModelAndView> {
        return await (handler as Controller).handleRoute(route);
    }

    /**
     * Controllers are supported when they expose a `handleRoute` method.
     *
     * @param handler - The handler instance to test.
     * @returns `true` when the handler is controller-like.
     */
    supports(handler: object | undefined): boolean {
        return likeController(handler);
    }
}

/**
 * Implementation of {@link AbstractHandlerMethodAdapter} that supports `HandlerMethods` decorated with `route:mapping` metadata. This is usually applied using `@RouteMapping`.
 * @extends module:dispatcher.AbstractHandlerMethodAdapter

 */
export class MetadataHandlerAdapter extends AbstractHandlerMethodAdapter implements Initializable {
    /**
     * Argument resolvers used to convert route values into handler method arguments.
     */
    argumentResolvers!: HandlerMethodArgumentResolver[];

    /**
     * Cached handler descriptors discovered from application context metadata.
     */
    handlers!: any[];

    get [Symbol.toStringTag](): string {
        return 'MetadataHandlerAdapter';
    }

    /**
     * Built-in argument resolvers used when no custom resolver collection is present.
     *
     * @returns The default resolver chain.
     */
    get defaultArgumentResolvers(): HandlerMethodArgumentResolver[] {
        return [
            new PathValueMethodArgumentResolver(),
            new MatrixValueMethodArgumentResolver(),
            new QueryValueMethodArgumentResolver(),
            new AttributeValueMethodArgumentResolver(),
        ];
    }

    get [$aware](): boolean {
        return true;
    }

    /**
     * Execute a metadata-mapped handler method.
     *
     * @param route - The current route.
     * @param handler - The resolved route handler method.
     * @returns The model and view produced by the handler.
     */
    async handle(route: Route, handler: RouteHandlerMethod | undefined): Promise<ModelAndView> {
        if (!handler) {
            throw new IllegalStateError('Handler is undefined');
        }
        handler.argumentResolvers = this.argumentResolvers;

        return await handler.invoke<ModelAndView>(route);
    }

    /**
     * Discover handler methods and argument resolvers from the application context.
     *
     * @param args - Reserved for framework initialization hooks.
     */
    init(...args: any[]): void {
        const { applicationContext } = this,
            contextKeys = keys(applicationContext!),
            contextKeysLength = contextKeys.length,
            handlers = [];

        if (contextKeysLength) {
            for (let contextKeyIndex = 0; contextKeyIndex < contextKeysLength; contextKeyIndex++) {
                const contextKey = contextKeys[contextKeyIndex],
                    contextValue = applicationContext!.getValue<object>(contextKey);

                if (isNotPrimitive(contextValue)) {
                    const valuePrototype = getPrototypeOf(contextValue);

                    // Handle case where valuePrototype could be null
                    if (valuePrototype !== null) {
                        const valueConstructor = valuePrototype.constructor;

                        if (hasRouteMapping(valueConstructor)) {
                            const constructorMapping = getRouteMapping(valueConstructor);

                            // Check that constructorMapping is defined before using it
                            if (constructorMapping !== undefined) {
                                const valueKeys = keys(valuePrototype),
                                    valueKeysLength = valueKeys.length;

                                if (valueKeysLength) {
                                    for (let valueKeyIndex = 0; valueKeyIndex < valueKeysLength; valueKeyIndex++) {
                                        const valueKey = valueKeys[valueKeyIndex];
                                        if (hasRouteMapping(valuePrototype, valueKey)) {
                                            const methodMapping = getRouteMapping(valuePrototype, valueKey);

                                            // Check that methodMapping is defined before using it
                                            if (methodMapping !== undefined) {
                                                const mapping = assign({}, constructorMapping, methodMapping);
                                                mapping.path = `${constructorMapping.value}${methodMapping.value}`;
                                                handlers.push(mapping);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (isNotArray(this.argumentResolvers)) {
            this.argumentResolvers = [...this._discoverArgumentResolvers(), ...this.defaultArgumentResolvers];
        }

        this.handlers = handlers;
    }

    /**
     * Metadata adapters only support {@link RouteHandlerMethod} instances.
     *
     * @param handler - The handler instance to test.
     * @returns `true` when the handler is a route handler method.
     */
    _supports(handler: RouteHandlerMethod): boolean {
        return handler instanceof RouteHandlerMethod;
    }

    private _discoverArgumentResolvers(): HandlerMethodArgumentResolver[] {
        const { applicationContext } = this;
        const resolvers: HandlerMethodArgumentResolver[] = [];

        if (!applicationContext) {
            return resolvers;
        }

        if (applicationContext.hasValue('argumentResolvers')) {
            const resolverCollection = applicationContext.getValue<any>('argumentResolvers');

            if (Array.isArray(resolverCollection)) {
                for (let index = 0; index < resolverCollection.length; index++) {
                    const resolver = resolverCollection[index];
                    if (likeArgumentResolver(resolver) && !resolvers.includes(resolver)) {
                        resolvers.push(resolver);
                    }
                }
            }
        }

        if (applicationContext.hasValue('argumentResolver')) {
            const resolver = applicationContext.getValue<any>('argumentResolver');
            if (likeArgumentResolver(resolver) && !resolvers.includes(resolver)) {
                resolvers.push(resolver);
            }
        }

        return resolvers;
    }
}
