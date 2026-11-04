/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ApplicationContext } from '@ndigo/context';
import { Constructable } from '@ndigo/core';
import { AbstractThemeResolver, FixedThemeResolver, ThemeResolver } from '../theme-resolver';
import { Route } from '@ndigo/router';
import { StrategyInitializer } from './strategy-initializer';

export interface ThemeResolverStrategy {
    themeResolver: ThemeResolver;
    initThemeResolver(context: ApplicationContext): void;
}

/**
 */

const THEME_RESOLVER = 'themeResolver';

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

        // oxlint-disable-next-line no-explicit-any -- TS2545: mixin constructor must be exactly (...args: any[]).
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
