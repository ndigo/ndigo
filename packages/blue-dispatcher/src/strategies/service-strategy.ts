/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { StrategyInitializer } from './strategy-initializer';

export interface ServiceStrategy {
    serviceCalls;
    serviceInterceptors;
    initServiceStrategy( context: ApplicationContext ): void;
}

const
    { defineProperty } = Reflect,
    SERVICE_CALL = 'serviceCall',
    SERVICE_CALLS = `${ SERVICE_CALL }s`,
    SERVICE_INTERCEPTOR = 'serviceInterceptor',
    SERVICE_INTERCEPTORS = `${ SERVICE_INTERCEPTOR }s`,
    defaultServiceInterceptors = [];

export const AsServiceStrategy = <T extends Constructable<StrategyInitializer>>( superclass: T ): Constructable<ServiceStrategy> & T => class extends superclass implements ServiceStrategy {
    readonly serviceCallKey: string;
    readonly serviceCallCollectionKey: string;
    readonly serviceInterceptorKey: string;
    readonly serviceInterceptorCollectionKey: string;

    serviceCalls: any;
    serviceInterceptors;

    constructor( ...args: any[] ){
        super( ...args );
        defineProperty( this, 'serviceCallKey', {
            get: () => SERVICE_CALL,
            configurable: true,
            enumerable: true
        } );
        defineProperty( this, 'serviceCallCollectionKey', {
            get: () => SERVICE_CALLS,
            configurable: true,
            enumerable: true
        } );
        defineProperty( this, 'serviceInterceptorKey', {
            get: () => SERVICE_INTERCEPTOR,
            configurable: true,
            enumerable: true
        } );
        defineProperty( this, 'serviceInterceptorCollectionKey', {
            get: () => SERVICE_INTERCEPTORS,
            configurable: true,
            enumerable: true
        } );
        this.addStrategy( SERVICE_INTERCEPTORS );
    }

    initServiceStrategy( context: ApplicationContext ): void {
        const { serviceCallKey, serviceCallCollectionKey: serivceCallCollectionKey, serviceInterceptorKey, serviceInterceptorCollectionKey: serivceInterceptorCollectionKey } = this;
        this.initCollectionStrategy( context, serivceCallCollectionKey, serviceCallKey, SERVICE_CALLS, defaultServiceInterceptors );
        this.initCollectionStrategy( context, serivceInterceptorCollectionKey, serviceInterceptorKey, SERVICE_INTERCEPTORS, defaultServiceInterceptors );
    }
};
