/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { StrategyInitializer } from './strategy-initializer';
export interface ServiceStrategy {
    serviceCalls: any;
    serviceInterceptors: any;
    initServiceStrategy(context: ApplicationContext): void;
}
export declare const AsServiceStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<ServiceStrategy> & T;
//# sourceMappingURL=service-strategy.d.ts.map