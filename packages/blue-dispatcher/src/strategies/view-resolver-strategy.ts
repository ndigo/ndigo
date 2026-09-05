import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { ImportViewResolver, ViewResolver } from '@blue/view';
import { StrategyInitializer } from './strategy-initializer';

export interface ViewResolverStrategy {
    viewResolvers: ViewResolver[];
    initViewResolvers(context: ApplicationContext): void;
}

/**
 */

const VIEW_RESOLVER = 'viewResolver',
    VIEW_RESOLVERS = `${VIEW_RESOLVER}s`,
    defaultViewResolvers: ViewResolver[] = [new ImportViewResolver()];

export const AsViewResolverStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ViewResolverStrategy> & T =>
    class extends superclass implements ViewResolverStrategy {
        readonly viewResolverKey: string;
        readonly viewResolverCollectionKey: string;

        viewResolvers!: ViewResolver[];

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
