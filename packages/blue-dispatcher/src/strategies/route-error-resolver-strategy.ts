/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { MetadataErrorResolver, RouteErrorResolver } from '../route-error-resolver';
import { StrategyInitializer } from './strategy-initializer';

export interface RouteErrorResolverStrategy {
    errorResolvers: RouteErrorResolver[];
    initErrorResolvers(context: ApplicationContext): void;
}

/**
 */

const { defineProperty } = Reflect,
    ERROR_RESOLVER = 'errorResolver',
    ERROR_RESOLVERS = `${ERROR_RESOLVER}s`,
    defaultRouteErrorResolvers: RouteErrorResolver[] = [new MetadataErrorResolver()];

export const AsRouteErrorResolverStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<RouteErrorResolverStrategy> & T =>
    class extends superclass implements RouteErrorResolverStrategy {
        readonly errorResolverKey: string;
        readonly errorResolverCollectionKey: string;

        errorResolvers: RouteErrorResolver[];

        constructor(...args: any[]) {
            super(...args);
            defineProperty(this, 'errorResolverKey', {
                get: () => ERROR_RESOLVER,
                configurable: true,
                enumerable: true,
            });
            defineProperty(this, 'errorResolverCollectionKey', {
                get: () => ERROR_RESOLVERS,
                configurable: true,
                enumerable: true,
            });
            this.addStrategy(ERROR_RESOLVERS);
        }

        initErrorResolvers(context: ApplicationContext) {
            const { errorResolverKey, errorResolverCollectionKey } = this;

            this.initCollectionStrategy(
                context,
                errorResolverCollectionKey,
                errorResolverKey,
                ERROR_RESOLVERS,
                defaultRouteErrorResolvers
            );

            console.log('Dispatcher::initRouteErrorResolvers', this.errorResolvers);
        }
    };
