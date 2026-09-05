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

const SERVICE_CALL = 'serviceCall',
    SERVICE_CALLS = `${SERVICE_CALL}s`,
    SERVICE_INTERCEPTOR = 'serviceInterceptor',
    SERVICE_INTERCEPTORS = `${SERVICE_INTERCEPTOR}s`,
    defaultServiceInterceptors: any[] = [];

export const AsServiceStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ServiceStrategy> & T =>
    class extends superclass implements ServiceStrategy {
        readonly serviceCallKey: string;
        readonly serviceCallCollectionKey: string;
        readonly serviceInterceptorKey: string;
        readonly serviceInterceptorCollectionKey: string;

        serviceCalls!: any;
        serviceInterceptors!: any;

        constructor(...args: any[]) {
            super(...args);
            this.serviceCallKey = SERVICE_CALL;
            this.serviceCallCollectionKey = SERVICE_CALLS;
            this.serviceInterceptorKey = SERVICE_INTERCEPTOR;
            this.serviceInterceptorCollectionKey = SERVICE_INTERCEPTORS;
            this.addStrategy(SERVICE_INTERCEPTORS);
        }

        initServiceStrategy(context: ApplicationContext): void {
            const {
                serviceCallKey,
                serviceCallCollectionKey: serivceCallCollectionKey,
                serviceInterceptorKey,
                serviceInterceptorCollectionKey: serivceInterceptorCollectionKey,
            } = this;
            this.initCollectionStrategy(
                context,
                serivceCallCollectionKey,
                serviceCallKey,
                SERVICE_CALLS,
                defaultServiceInterceptors
            );
            this.initCollectionStrategy(
                context,
                serivceInterceptorCollectionKey,
                serviceInterceptorKey,
                SERVICE_INTERCEPTORS,
                defaultServiceInterceptors
            );
        }
    };
