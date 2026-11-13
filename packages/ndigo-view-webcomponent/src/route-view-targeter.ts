/**
 * View targeter that selects a destination from the route path.
 */
import { URLGlobPathMatcher, type PathMatcher } from '@ndigo/core';
import type { ViewTargetSelector } from './selector-view-targeter';
import { SelectorViewTargeter, type SelectorViewTargeterOptions } from './selector-view-targeter';

/**
 * Maps a route pattern to a selector.
 *
 * Patterns use the URL glob syntax the router uses (`*`, `**`, `?`,
 * character classes) and are consulted in declaration order — put the most
 * specific pattern first.
 */
export type RouteSelectorMap = Record<string, string> | Map<string, string>;

/**
 * Options for {@link RouteViewTargeter}.
 */
export interface RouteViewTargeterOptions extends SelectorViewTargeterOptions {
    /** The pattern matcher. Defaults to `URLGlobPathMatcher`. */
    pathMatcher?: PathMatcher;
}

/**
 * Targets the element configured for the current route path.
 *
 * @example
 * ```ts
 * new RouteViewTargeter({ '/report/**': '#sidebar', '/': '#app' });
 * ```
 */
export class RouteViewTargeter extends SelectorViewTargeter {
    /**
     * Creates a route-driven targeter.
     *
     * @param routes - Route pattern → selector entries.
     * @param options - Matcher override, mount mode, event map, and document.
     */
    constructor(routes: RouteSelectorMap, options: RouteViewTargeterOptions = {}) {
        const { pathMatcher = new URLGlobPathMatcher(), ...targeterOptions } = options;
        const entries: [string, string][] = routes instanceof Map ? [...routes] : Object.entries(routes);

        const select: ViewTargetSelector = (context) => {
            const path = context.route?.path ?? '',
                length = entries.length;

            for (let index = 0; index < length; index++) {
                const [pattern, selector] = entries[index];
                if (pathMatcher.match(pattern, path)) {
                    return selector;
                }
            }

            return null;
        };

        super(select, targeterOptions);
    }
}
