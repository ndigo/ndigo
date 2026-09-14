/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable, IllegalStateError } from '@blue/core';
import { ControllerHandlerAdapter, MetadataHandlerAdapter, RouteHandlerAdapter } from '../route-handler-adapter';
import { StrategyInitializer } from './strategy-initializer';

export interface RouteHandlerAdapterStrategy {
    handlerAdapters: RouteHandlerAdapter[];
    initHandlerAdapters(context: ApplicationContext): void;
    getHandlerAdapter(handler: object | undefined): RouteHandlerAdapter;
}

/**
 */

/**
 */

/**
 * Initialize the handler adapters used by the class. If no handler adapters are defined, it defaults to {@link ControllerHandlerAdapter|ControllerHandlerAdapter}.
 * @param {module:core.ApplicationContext} context
 */

/**
 * Return the handler adapter for the given handler.
 * @param {module:dispatcher.MaybeHandler} handler The handler to find an adapter for.
 * @returns {module:dispatcher.HandlerAdapter} The adapter for the handler.
 * @throws {Error} If no adapter can be found for the handler.
 */

const HANDLER_ADAPTER = 'handlerAdapter',
    HANDLER_ADAPTERS = `${HANDLER_ADAPTER}s`,
    defaultRouteHandlerAdapters: RouteHandlerAdapter[] = [new ControllerHandlerAdapter(), new MetadataHandlerAdapter()];

export const AsRouteHandlerAdapterStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<RouteHandlerAdapterStrategy> & T =>
    class extends superclass implements RouteHandlerAdapterStrategy {
        readonly handlerAdapterKey: string;
        readonly handlerAdapterCollectionKey: string;

        handlerAdapters!: RouteHandlerAdapter[];

        // oxlint-disable-next-line no-explicit-any -- TS2545: mixin constructor must be exactly (...args: any[]).
        constructor(...args: any[]) {
            super(...args);
            this.handlerAdapterKey = HANDLER_ADAPTER;
            this.handlerAdapterCollectionKey = HANDLER_ADAPTERS;
            this.addStrategy(HANDLER_ADAPTERS);
        }

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
