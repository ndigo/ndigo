/**
 */

import { ApplicationContext } from '@ndigo/context';
import { Constructable } from '@ndigo/core';
import { ImportViewResolver, ViewResolver } from '@ndigo/view';
import { StrategyInitializer } from './strategy-initializer';

/**
 * Strategy mixin contract for view resolution: exposes the ordered
 * `viewResolvers` that resolve a view name to a rendered result, and an
 * initializer that installs them from the application context.
 */
export interface ViewResolverStrategy {
    viewResolvers: ViewResolver[];
    initViewResolvers(context: ApplicationContext): void;
}

const VIEW_RESOLVER = 'viewResolver',
    VIEW_RESOLVERS = `${VIEW_RESOLVER}s`,
    defaultViewResolvers: ViewResolver[] = [new ImportViewResolver()];

/**
 * Mixin that installs the view-resolver chain, defaulting to the import-based
 * resolver when the application configures none.
 */
export const AsViewResolverStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ViewResolverStrategy> & T =>
    class extends superclass implements ViewResolverStrategy {
        readonly viewResolverKey: string;
        readonly viewResolverCollectionKey: string;

        viewResolvers!: ViewResolver[];

        // oxlint-disable-next-line no-explicit-any -- TS2545: mixin constructor must be exactly (...args: any[]).
        constructor(...args: any[]) {
            super(...args);
            this.viewResolverKey = VIEW_RESOLVER;
            this.viewResolverCollectionKey = VIEW_RESOLVERS;
            this.addStrategy(VIEW_RESOLVERS);
        }

        initViewResolvers(context: ApplicationContext) {
            const { viewResolverKey, viewResolverCollectionKey } = this;

            this.initCollectionStrategy(
                context,
                viewResolverCollectionKey,
                viewResolverKey,
                VIEW_RESOLVERS,
                defaultViewResolvers
            );
        }
    };
