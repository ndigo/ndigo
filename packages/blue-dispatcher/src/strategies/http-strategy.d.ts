/**
 * @author Jeff Rose
 */
import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { Fetch, HTTP, HTTPInterceptor, HTTPInit } from '@blue/http';
import { StrategyInitializer } from './strategy-initializer';
export interface HTTPStrategy {
    httpInterceptors: HTTPInterceptor[];
    httpSettings: HTTPInit;
    initHTTP(context: ApplicationContext): void;
    getHTTP(fetch?: Fetch): HTTP;
}
export declare const AsHTTPStrategy: <T extends Constructable<StrategyInitializer>>(superclass: T) => Constructable<HTTPStrategy> & T;
//# sourceMappingURL=http-strategy.d.ts.map