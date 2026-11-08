/**
 * Theme-resolver strategy.
 */

import { ApplicationContext } from '@ndigo/context';
import { Constructable } from '@ndigo/core';
import { AbstractThemeResolver, FixedThemeResolver, ThemeResolver } from '../theme-resolver';
import { Route } from '@ndigo/router';
import { StrategyInitializer } from './strategy-initializer';

/**
 * Strategy mixin contract for theme resolution: exposes the active
 * `themeResolver` and an initializer that builds it from the application
 * context (falling back to a context-backed fixed resolver).
 */
export interface ThemeResolverStrategy {
    /** The active theme resolver. */
    themeResolver: ThemeResolver;
    /**
     * Builds and installs the theme resolver.
     *
     * @param context - The application context.
     */
    initThemeResolver(context: ApplicationContext): void;
}

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

/**
 * Mixin that installs the theme resolver: uses the context's `themeName` by
 * default and registers the resolver under its well-known name.
 */
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
