/**
 * Route-handler mapping strategy.
 */

import { ApplicationContext } from '@ndigo/context';
import { Constructable } from '@ndigo/core';
import { NamePathHandlerMapping, RouteHandlerMapping } from '../route-handler-mapping';
import { RadixMetadataHandlerMapping } from '../radix-metadata-handler-mapping';
import RouteHandlerExecutionChain from '../route-handler-execution-chain';
import { MappedHandlerInterceptor, RouteHandlerInterceptor } from '../route-handler-interceptor';
import type { PathMatcher } from '@ndigo/core';
import { Route } from '@ndigo/router';
import { StrategyInitializer } from './strategy-initializer';

/**
 * Strategy mixin contract for handler mappings: exposes the ordered mappings a
 * route is resolved against, and an initializer that installs them from the
 * application context.
 */
export interface RouteHandlerMappingStrategy {
    /** The ordered mappings a route is resolved against. */
    handlerMappings: RouteHandlerMapping[];
    /**
     * Installs the handler mappings from the context or the defaults.
     *
     * @param context - The application context.
     */
    initHandlerMappings(context: ApplicationContext): void;
    /**
     * Resolves a route to its execution chain.
     *
     * @param route - The route to resolve.
     * @returns The execution chain for the route.
     */
    getHandler(route: Route): RouteHandlerExecutionChain;
}

const HANDLER_MAPPING = 'handlerMapping',
    HANDLER_MAPPINGS = `${HANDLER_MAPPING}s`,
    defaultRouteHandlerMappings: RouteHandlerMapping[] = [
        new NamePathHandlerMapping(),
        new RadixMetadataHandlerMapping(),
    ];

/**
 * Mixin that installs the handler-mapping collection, defaulting to the
 * framework's metadata-backed mappings when the application configures none.
 */
export const AsRouteHandlerMappingStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<RouteHandlerMappingStrategy> & T =>
    class extends superclass implements RouteHandlerMappingStrategy {
        readonly handlerMappingKey: string;
        readonly handlerMappingCollectionKey: string;

        handlerMappings!: RouteHandlerMapping[];

        // oxlint-disable-next-line no-explicit-any -- TS2545: mixin constructor must be exactly (...args: any[]).
        constructor(...args: any[]) {
            super(...args);
            this.handlerMappingKey = HANDLER_MAPPING;
            this.handlerMappingCollectionKey = HANDLER_MAPPINGS;
            this.addStrategy(HANDLER_MAPPINGS);
        }

        initHandlerMappings(context: ApplicationContext) {
            const { handlerMappingKey, handlerMappingCollectionKey } = this;

            this.initCollectionStrategy(
                context,
                handlerMappingCollectionKey,
                handlerMappingKey,
                HANDLER_MAPPINGS,
                defaultRouteHandlerMappings
            );

            // A user-supplied `handlerMappings` collection supplements — never
            // replaces — the platform mapping: append the singular mapping as
            // the final fallback so routes not claimed by contributors (e.g.
            // `ManagementAutoConfiguration`'s guard-carrying collection) still
            // resolve through the platform default.
            if (context.hasValue(handlerMappingKey)) {
                const platform = context.getValue<RouteHandlerMapping>(handlerMappingKey);
                const current = this.handlerMappings;
                if (current && !current.some((mapping) => mapping === platform)) {
                    this.handlerMappings = [...current, platform];
                }
            }
        }

        getHandler(route: Route): RouteHandlerExecutionChain {
            const { handlerMappings } = this,
                length = handlerMappings.length;
            for (let index = 0; index < length; index++) {
                const handler = handlerMappings[index].getHandler(route);
                if (handler) {
                    return handler;
                }
            }

            // No mapping matched: return an empty handler chain that still
            // carries the mappings' interceptors, so interceptor-only
            // concerns (e.g. CORS preflight short-circuiting) can finalize
            // unhandled routes.
            const fallback = new RouteHandlerExecutionChain({});
            for (let index = 0; index < length; index++) {
                // NOTE: bridging to { — the source type is wider than this consumer's contract.
                const mapping = handlerMappings[index] as unknown as {
                    interceptors?: RouteHandlerInterceptor[];
                    pathMatcher?: PathMatcher;
                };
                const { interceptors, pathMatcher } = mapping;
                for (const interceptor of interceptors ?? []) {
                    if (interceptor instanceof MappedHandlerInterceptor) {
                        if (interceptor.matches(route.path, pathMatcher)) {
                            fallback.addInterceptor(interceptor.interceptor);
                        }
                    } else {
                        fallback.addInterceptor(interceptor);
                    }
                }
            }
            return fallback;
        }
    };
