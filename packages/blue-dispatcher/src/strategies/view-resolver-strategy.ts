/**
 * @author Jeff Rose
 */

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

const { defineProperty } = Reflect,
    VIEW_RESOLVER = 'viewResolver',
    VIEW_RESOLVERS = `${VIEW_RESOLVER}s`,
    defaultViewResolvers: ViewResolver[] = [new ImportViewResolver()];

export const AsViewResolverStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ViewResolverStrategy> & T =>
    class extends superclass implements ViewResolverStrategy {
        readonly viewResolverKey: string;
        readonly viewResolverCollectionKey: string;

        viewResolvers: ViewResolver[];

        constructor(...args: any[]) {
            super(...args);
            defineProperty(this, 'viewResolverKey', {
                get: () => VIEW_RESOLVER,
                configurable: true,
                enumerable: true,
            });
            defineProperty(this, 'viewResolverCollectionKey', {
                get: () => VIEW_RESOLVERS,
                configurable: true,
                enumerable: true,
            });
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

            console.log('Dispatcher::initViewResolvers', this.viewResolvers);
        }
    };
