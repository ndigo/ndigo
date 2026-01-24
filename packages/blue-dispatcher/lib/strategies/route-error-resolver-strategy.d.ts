/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { RouteErrorResolver } from '../route-error-resolver';
import { StrategyInitializer } from './strategy-initializer';
export interface RouteErrorResolverStrategy {
    errorResolvers: RouteErrorResolver[];
    initErrorResolvers(context: ApplicationContext): void;
}
export declare const AsRouteErrorResolverStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<RouteErrorResolverStrategy> & T;
//# sourceMappingURL=route-error-resolver-strategy.d.ts.map