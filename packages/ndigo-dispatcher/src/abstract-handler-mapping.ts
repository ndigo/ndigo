/**
 * Abstract handler-mapping registry.
 */

import { Null, PathMatcher, URLGlobPathMatcher } from '@ndigo/core';
import { AsNameAware } from '@ndigo/factory';
import { ApplicationContext, AsApplicationContextAware } from '@ndigo/context';
import { Route } from '@ndigo/router';
import { RouteHandlerInterceptor, MappedHandlerInterceptor } from './route-handler-interceptor';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { RouteMatchResult } from './route-match-result';
import { resolveHandlerWithContext } from './_shared';
import type { Maybe, MaybeHandler } from './_shared';

/**
 * A value that may be supplied directly or by name through the application context.
 */
export type { Maybe };

/**
 * A handler value that may be supplied directly or by name.
 */
export type { MaybeHandler };

const { defineProperty } = Reflect;

/**
 * Resolves a route to a handler execution chain.
 */
export interface RouteHandlerMapping {
    /**
     * Resolve the handler for a route.
     *
     * @param route - The current route.
     * @returns The execution chain for the chosen handler, or `null`.
     */
    getHandler(route: Route): RouteHandlerExecutionChain | null;
}

/**
 * A handler mapping that can also report whether a route matches a pattern.
 */
export interface MatchableHandlerMapping extends RouteHandlerMapping {
    /**
     * Check whether the route matches a pattern.
     *
     * @param route - The current route.
     * @param pattern - The pattern to test.
     * @returns A match result, or `null`.
     */
    match(route: Route, pattern: string): RouteMatchResult | null;
}

/**
 * Base class for handler mappings that resolve a route to a handler.
 */
export abstract class AbstractHandlerMapping
    extends AsNameAware(AsApplicationContextAware(Null))
    implements RouteHandlerMapping
{
    /**
     * Application context used to resolve named handlers.
     */
    applicationContext!: ApplicationContext;

    /**
     * Default handler used when no specific mapping matches.
     */
    defaultHandler: object | null = null;

    /**
     * Interceptors applied to matched handlers.
     */
    interceptors!: RouteHandlerInterceptor[];

    /**
     * Path matcher used by path-based mappings.
     */
    pathMatcher!: PathMatcher;

    /**
     * Pre-bound resolver for handlers with context.
     */
    #resolveHandler: (handler: MaybeHandler) => object | undefined = (handler) => handler as object;

    get [Symbol.toStringTag](): string {
        return 'HandlerMapping';
    }

    /**
     * Create a handler mapping with default path matching behavior.
     */
    constructor() {
        super();
        this.defaultHandler = null;
        this.interceptors = [];
        this.pathMatcher = new URLGlobPathMatcher();
    }

    /**
     * Store the application context for later handler resolution.
     *
     * @param applicationContext - The application context to use.
     */
    setApplicationContext(applicationContext: ApplicationContext): void {
        defineProperty(this, 'applicationContext', {
            value: applicationContext,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.#resolveHandler = resolveHandlerWithContext(applicationContext);
    }

    /**
     * Resolve a route to a handler execution chain.
     *
     * @param route - The current route.
     * @returns The execution chain, or `null` when no handler matches.
     */
    getHandler(route: Route): RouteHandlerExecutionChain | null {
        let handler: object | null = this._getHandler(route) ?? this.defaultHandler;

        if (!handler) {
            return null;
        }

        const resolvedHandler = this.#resolveHandler(handler);
        if (!resolvedHandler) {
            return null;
        }

        return this._getHandlerExecutionChain(resolvedHandler, route);
    }

    /**
     * Build an execution chain for a resolved handler and route.
     *
     * @param handler - The resolved handler or existing execution chain.
     * @param route - The current route.
     * @returns The execution chain to invoke.
     */
    protected _getHandlerExecutionChain(
        handler: object | RouteHandlerExecutionChain,
        route: Route
    ): RouteHandlerExecutionChain {
        const chain = handler instanceof RouteHandlerExecutionChain ? handler : new RouteHandlerExecutionChain(handler),
            { interceptors, pathMatcher } = this,
            length = interceptors?.length;

        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (interceptor instanceof MappedHandlerInterceptor) {
                    if (interceptor.matches(route.path, pathMatcher)) {
                        chain.addInterceptor(interceptor.interceptor);
                    }
                } else {
                    chain.addInterceptor(interceptor);
                }
            }
        }

        return chain;
    }

    /**
     * Resolve the handler for a route without applying defaults or interceptors.
     *
     * @param route - The current route.
     * @returns The handler or execution chain, or `null`.
     */
    protected abstract _getHandler(route: Route): object | null;
}
