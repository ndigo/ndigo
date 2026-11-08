/**
 * Route-handler adapter strategy.
 */

import { ApplicationContext } from '@ndigo/context';
import { Constructable, IllegalStateError } from '@ndigo/core';
import { ControllerHandlerAdapter, MetadataHandlerAdapter, RouteHandlerAdapter } from '../route-handler-adapter';
import { StrategyInitializer } from './strategy-initializer';

/**
 * Strategy mixin contract for handler adapters: exposes the ordered adapters
 * that turn a matched handler into a response, and an initializer that installs
 * them from the application context.
 */
export interface RouteHandlerAdapterStrategy {
    /** The ordered adapters consulted for a handler. */
    handlerAdapters: RouteHandlerAdapter[];
    /**
     * Installs the handler adapters from the context or the defaults.
     *
     * @param context - The application context.
     */
    initHandlerAdapters(context: ApplicationContext): void;
    /**
     * Finds the adapter that supports a handler.
     *
     * @param handler - The resolved handler.
     * @returns The supporting adapter.
     */
    getHandlerAdapter(handler: object | undefined): RouteHandlerAdapter;
}

const HANDLER_ADAPTER = 'handlerAdapter',
    HANDLER_ADAPTERS = `${HANDLER_ADAPTER}s`,
    defaultRouteHandlerAdapters: RouteHandlerAdapter[] = [new ControllerHandlerAdapter(), new MetadataHandlerAdapter()];

/**
 * Mixin that installs the handler-adapter collection, defaulting to the
 * controller and metadata adapters when the application configures none.
 */
export const AsRouteHandlerAdapterStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<RouteHandlerAdapterStrategy> & T =>
    class extends superclass implements RouteHandlerAdapterStrategy {
        /** The context key holding a single handler adapter. */
        readonly handlerAdapterKey: string;
        /** The context key holding the adapter collection. */
        readonly handlerAdapterCollectionKey: string;

        /** The ordered adapters consulted for a handler. */
        handlerAdapters!: RouteHandlerAdapter[];

        // oxlint-disable-next-line no-explicit-any -- TS2545: mixin constructor must be exactly (...args: any[]).
        constructor(...args: any[]) {
            super(...args);
            this.handlerAdapterKey = HANDLER_ADAPTER;
            this.handlerAdapterCollectionKey = HANDLER_ADAPTERS;
            this.addStrategy(HANDLER_ADAPTERS);
        }

        /**
         * Initializes the handler adapters, defaulting to the controller and
         * metadata adapters when the context configures none.
         *
         * @param context - The application context.
         */
        initHandlerAdapters(context: ApplicationContext) {
            const { handlerAdapterKey, handlerAdapterCollectionKey } = this;

            this.initCollectionStrategy(
                context,
                handlerAdapterCollectionKey,
                handlerAdapterKey,
                HANDLER_ADAPTERS,
                defaultRouteHandlerAdapters
            );
        }

        /**
         * Return the handler adapter for the given handler.
         *
         * @param handler - The handler to find an adapter for.
         * @returns The adapter for the handler.
         * @throws If no adapter can be found for the handler.
         */
        getHandlerAdapter(handler: object | undefined): RouteHandlerAdapter {
            const handlerAdapter: RouteHandlerAdapter | undefined = this.handlerAdapters.find((adapter) => {
                // The interface declares supports(); the typeof check guards
                // against duck-typed entries entering the collection.
                if (typeof adapter.supports === 'function') {
                    return adapter.supports(handler);
                }
                return false;
            });

            if (!handlerAdapter) {
                throw new IllegalStateError('No handler adapter found for handler');
            }

            return handlerAdapter;
        }
    };
