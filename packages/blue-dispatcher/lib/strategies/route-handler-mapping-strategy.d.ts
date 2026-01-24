/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { RouteHandlerMapping } from '../route-handler-mapping';
import RouteHandlerExecutionChain from '../route-handler-execution-chain';
import { Route } from '@blue/router';
import { StrategyInitializer } from './strategy-initializer';
export interface RouteHandlerMappingStrategy {
    handlerMappings: RouteHandlerMapping[];
    initHandlerMappings(context: ApplicationContext): void;
    getHandler(route: Route): RouteHandlerExecutionChain;
}
/**
 * @interface module:dispatcher.RouteHandlerMappingStrategy
 */
export declare const AsRouteHandlerMappingStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<RouteHandlerMappingStrategy> & T;
//# sourceMappingURL=route-handler-mapping-strategy.d.ts.map