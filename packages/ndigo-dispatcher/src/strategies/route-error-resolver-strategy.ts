/**
 */

import { ApplicationContext } from '@ndigo/context';
import { Constructable } from '@ndigo/core';
import { MetadataErrorResolver, RouteErrorResolver } from '../route-error-resolver';
import { StrategyInitializer } from './strategy-initializer';

/**
 * Strategy mixin contract for error handling: exposes the ordered
 * `errorResolvers` that turn a thrown error into a response and a key under
 * which the collection is registered.
 */
export interface RouteErrorResolverStrategy {
    errorResolvers: RouteErrorResolver[];
    initErrorResolvers(context: ApplicationContext): void;
}

const ERROR_RESOLVER = 'errorResolver',
    ERROR_RESOLVERS = `${ERROR_RESOLVER}s`,
    defaultRouteErrorResolvers: RouteErrorResolver[] = [new MetadataErrorResolver()];

/**
 * Mixin that installs the error-resolver collection: registers each configured
 * resolver under the collection key and defaults to
 * `MetadataErrorResolver` when the application configures none.
 */
export const AsRouteErrorResolverStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<RouteErrorResolverStrategy> & T =>
    class extends superclass implements RouteErrorResolverStrategy {
        readonly errorResolverKey: string;
        readonly errorResolverCollectionKey: string;

        errorResolvers!: RouteErrorResolver[];

        // oxlint-disable-next-line no-explicit-any -- TS2545: mixin constructor must be exactly (...args: any[]).
        constructor(...args: any[]) {
            super(...args);
            this.errorResolverKey = ERROR_RESOLVER;
            this.errorResolverCollectionKey = ERROR_RESOLVERS;
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
        }
    };
