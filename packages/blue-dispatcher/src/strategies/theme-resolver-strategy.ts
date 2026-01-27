/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { FixedThemeResolver, ThemeResolver } from '../theme-resolver';
import { StrategyInitializer } from './strategy-initializer';

export interface ThemeResolverStrategy {
    themeResolver: ThemeResolver;
    initThemeResolver(context: ApplicationContext): void;
}

/**
 */

const { defineProperty } = Reflect,
    THEME_RESOLVER = 'themeResolver',
    defaultThemeResolver: ThemeResolver = new FixedThemeResolver('');

export const AsThemeResolverStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ThemeResolverStrategy> & T =>
    class extends superclass implements ThemeResolverStrategy {
        readonly themeResolverKey: string;

        themeResolver: ThemeResolver;

        constructor(...args: any[]) {
            super(...args);
            defineProperty(this, 'themeResolverKey', {
                get: () => THEME_RESOLVER,
                configurable: true,
                enumerable: true,
            });
            this.addStrategy(THEME_RESOLVER);
        }

        initThemeResolver(context: ApplicationContext) {
            const { themeResolverKey } = this;

            this.initStrategy(context, themeResolverKey, THEME_RESOLVER, defaultThemeResolver);

            console.log('Dispatcher::initThemeResolver', this.themeResolver);
        }
    };
