/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { ControllerHandlerAdapter, MetadataHandlerAdapter, RouteHandlerAdapter } from '../route-handler-adapter';
import { StrategyInitializer } from './strategy-initializer';

export interface RouteHandlerAdapterStrategy {
    handlerAdapters: RouteHandlerAdapter[];
    initHandlerAdapters(context: ApplicationContext): void;
    getHandlerAdapter(handler): RouteHandlerAdapter;
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

const { defineProperty } = Reflect,
    HANDLER_ADAPTER = 'handlerAdapter',
    HANDLER_ADAPTERS = `${HANDLER_ADAPTER}s`,
    defaultRouteHandlerAdapters: RouteHandlerAdapter[] = [new ControllerHandlerAdapter(), new MetadataHandlerAdapter()];

export const AsRouteHandlerAdapterStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<RouteHandlerAdapterStrategy> & T =>
    class extends superclass implements RouteHandlerAdapterStrategy {
        readonly handlerAdapterKey: string;
        readonly handlerAdapterCollectionKey: string;

        handlerAdapters: RouteHandlerAdapter[];

        constructor(...args: any[]) {
            super(...args);
            defineProperty(this, 'handlerAdapterKey', {
                get: () => HANDLER_ADAPTER,
                configurable: true,
                enumerable: true,
            });
            defineProperty(this, 'handlerAdapterCollectionKey', {
                get: () => HANDLER_ADAPTERS,
                configurable: true,
                enumerable: true,
            });
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

        getHandlerAdapter(handler): RouteHandlerAdapter {
            const handlerAdapter: RouteHandlerAdapter = this.handlerAdapters.find((handlerAdapter) =>
                handlerAdapter.supports(handler)
            );

            if (!handlerAdapter) {
                throw new Error('No handler adapter found for handler');
            }

            return handlerAdapter;
        }
    };
