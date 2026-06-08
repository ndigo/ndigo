/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { RouteToViewNameTranslator } from '../route-to-view-name-translator';
import { Route } from '@blue/router';
import { StrategyInitializer } from './strategy-initializer';
export interface RouteToViewNameTranslatorStrategy {
    routeToViewNameTranslator: RouteToViewNameTranslator;
    initRouteToViewNameTranslator(context: ApplicationContext): void;
    getDefaultViewName(route: Route): string;
}
export declare const AsRouteToViewNameTranslatorStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<RouteToViewNameTranslatorStrategy> & T;
//# sourceMappingURL=route-to-view-name-translator-strategy.d.ts.map