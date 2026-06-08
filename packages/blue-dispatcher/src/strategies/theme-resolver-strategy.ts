/**
 * @author Jeff Rose
 */

import { ApplicationContext } from '@blue/context';
import { Constructable } from '@blue/core';
import { AbstractThemeResolver, FixedThemeResolver, ThemeResolver } from '../theme-resolver';
import { Route } from '@blue/router';
import { StrategyInitializer } from './strategy-initializer';

export interface ThemeResolverStrategy {
    themeResolver: ThemeResolver;
    initThemeResolver(context: ApplicationContext): void;
}

/**
 */

const { defineProperty } = Reflect,
    THEME_RESOLVER = 'themeResolver';

class ContextThemeResolver extends AbstractThemeResolver {
    readonly #context: ApplicationContext;

    constructor(context: ApplicationContext) {
        super(context.themeName || 'default');
        this.#context = context;
    }

    resolveTheme(route: Route): string {
        return this.#context.getTheme().name;
    }
}

const createDefaultThemeResolver = (context: ApplicationContext): ThemeResolver => {
    try {
        const theme = context.getTheme();
        return new FixedThemeResolver(theme?.name || context.themeName || 'default');
    } catch {
        return new ContextThemeResolver(context);
    }
};

export const AsThemeResolverStrategy = <T extends Constructable<StrategyInitializer>>(
    superclass: T
): Constructable<ThemeResolverStrategy> & T =>
    class extends superclass implements ThemeResolverStrategy {
        readonly themeResolverKey: string;

        themeResolver!: ThemeResolver;

        constructor(...args: any[]) {
            super(...args);
            this.themeResolverKey = THEME_RESOLVER;
            this.addStrategy(THEME_RESOLVER);
        }

        initThemeResolver(context: ApplicationContext) {
            const { themeResolverKey } = this;

            this.initStrategy(context, themeResolverKey, THEME_RESOLVER, createDefaultThemeResolver(context));
        }
    };
