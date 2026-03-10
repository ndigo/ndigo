/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { MetadataHandlerMapping, NamePathHandlerMapping, RouteHandlerMapping } from '../route-handler-mapping';
import RouteHandlerExecutionChain from '../route-handler-execution-chain';
import { Route } from '@blue/router';
import { StrategyInitializer } from './strategy-initializer';

export interface RouteHandlerMappingStrategy {
    handlerMappings: RouteHandlerMapping[];
    initHandlerMappings(context: ApplicationContext): void;
    getHandler(route: Route): RouteHandlerExecutionChain;
}

const { defineProperty } = Reflect,
    HANDLER_MAPPING = 'handlerMapping',
    HANDLER_MAPPINGS = `${HANDLER_MAPPING}s`,
    defaultRouteHandlerMappings: RouteHandlerMapping[] = [new NamePathHandlerMapping(), new MetadataHandlerMapping()];

/**
 */

export const AsRouteHandlerMappingStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<RouteHandlerMappingStrategy> & T =>
    class extends superclass implements RouteHandlerMappingStrategy {
        readonly handlerMappingKey: string;
        readonly handlerMappingCollectionKey: string;

        handlerMappings: RouteHandlerMapping[];

        constructor(...args: any[]) {
            super(...args);
            defineProperty(this, 'handlerMappingKey', {
                get: () => HANDLER_MAPPING,
                configurable: true,
                enumerable: true,
            });
            defineProperty(this, 'handlerMappingCollectionKey', {
                get: () => HANDLER_MAPPINGS,
                configurable: true,
                enumerable: true,
            });
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

            return null;
        }
    };
