/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { RouteHandlerAdapter } from '../route-handler-adapter';
import { StrategyInitializer } from './strategy-initializer';
export interface RouteHandlerAdapterStrategy {
    handlerAdapters: RouteHandlerAdapter[];
    initHandlerAdapters(context: ApplicationContext): void;
    getHandlerAdapter(handler: any): RouteHandlerAdapter;
}
export declare const AsRouteHandlerAdapterStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<RouteHandlerAdapterStrategy> & T;
//# sourceMappingURL=route-handler-adapter-strategy.d.ts.map