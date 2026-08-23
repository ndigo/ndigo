import { IllegalStateError } from '@blue/core';
import { ApplicationContext } from '@blue/context';
import { Route } from '@blue/router';
import { isString } from '@blue/util/types';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { AbstractHandlerMapping, MatchableHandlerMapping } from './abstract-handler-mapping';
import { RouteMatchResult } from './route-match-result';
import { resolveHandlerWithContext } from './_shared';
import type { MaybeHandler } from './_shared';
import { pathPatternComparator } from './path-pattern-comparator';

const { isArray } = Array;

/**
 * Base class for path-based handler mappings.
 */
export abstract class AbstractPathHandlerMapping extends AbstractHandlerMapping implements MatchableHandlerMapping {
    /**
     * Handler mapped to the root path.
     */
    rootHandler: object | null = null;

    /**
     * Whether trailing slash variants should be considered matches.
     */
    useTrailingSlashMatch: boolean = false;

    readonly #handlers: Map<string, MaybeHandler>;

    /**
     * Create a path handler mapping with empty path registrations.
     */
    constructor() {
        super();
        this.rootHandler = null;
        this.useTrailingSlashMatch = false;
        this.#handlers = new Map<string, MaybeHandler>();
    }

    /**
     * Look up the handler for a path.
     *
     * @param path - The request path.
     * @param route - The current route.
     * @returns The resolved execution chain, or `null`.
     */
    lookUpHandler(path: string, route: Route): RouteHandlerExecutionChain | null {
        const { applicationContext, pathMatcher, useTrailingSlashMatch } = this,
            _handlers = this.#handlers;
        let handler: MaybeHandler;
        if (_handlers.has(path)) {
            handler = _handlers.get(path)!;

            const resolvedHandler = resolveHandlerWithContext(applicationContext)(handler);
            if (!resolvedHandler) {
                throw new IllegalStateError(`Could not resolve handler: ${handler} for path "${path}"`);
            }

            return new RouteHandlerExecutionChain(resolvedHandler);
        }

        const matchingPatterns: string[] = [];
        for (let pattern of _handlers.keys()) {
            if (pathMatcher.match(pattern, path)) {
                matchingPatterns.push(pattern);
            } else if (useTrailingSlashMatch) {
                if (!pattern.endsWith('/') && pathMatcher.match(`${pattern}/`, path)) {
                    matchingPatterns.push(`${pattern}/`);
                }
            }
        }

        let bestMatch: string | null = null;
        if (matchingPatterns.length) {
            matchingPatterns.sort(pathPatternComparator.compare);
            bestMatch = matchingPatterns[0];
        }

        if (bestMatch) {
            handler = _handlers.get(bestMatch)!;
            if (!handler) {
                if (bestMatch.endsWith('/')) {
                    handler = _handlers.get(bestMatch.substring(0, bestMatch.length - 1))!;
                }
                if (!handler) {
                    throw new IllegalStateError(`Could not find handler for pattern "${bestMatch}"`);
                }
            }

            const resolvedHandler = resolveHandlerWithContext(this.applicationContext)(handler);
            if (!resolvedHandler) {
                throw new IllegalStateError(`Could not resolve handler: ${handler} for path "${path}"`);
            }

            return new RouteHandlerExecutionChain(resolvedHandler);
        }

        return null;
    }

    /**
     * Check whether a route matches a path pattern.
     *
     * @param route - The current route.
     * @param pattern - The pattern to test.
     * @returns A match result, or `null`.
     */
    match(route: Route, pattern: string): RouteMatchResult | null {
        const { pathMatcher, useTrailingSlashMatch } = this,
            path = route.path;
        if (pathMatcher.match(pattern, path)) {
            return new RouteMatchResult(pattern, path);
        } else if (useTrailingSlashMatch) {
            const patternSlash = `${pattern}/`;
            if (!pattern.endsWith('/') && pathMatcher.match(patternSlash, path)) {
                return new RouteMatchResult(patternSlash, path);
            }
        }
        return null;
    }

    /**
     * Resolve the most appropriate handler for a route.
     *
     * @param route - The current route.
     * @returns The execution chain, or `null`.
     */
    protected _getHandler(route: Route): RouteHandlerExecutionChain | null {
        let path = route.path,
            handler = this.lookUpHandler(path, route);
        if (!handler) {
            let rawHandler: MaybeHandler | RouteHandlerExecutionChain | null = null;
            if ('/' === path) {
                rawHandler = this.rootHandler;
            }
            if (!rawHandler) {
                rawHandler = this.defaultHandler;
            }
            if (rawHandler) {
                const resolvedHandler = resolveHandlerWithContext(this.applicationContext)(rawHandler);
                if (resolvedHandler) {
                    handler = new RouteHandlerExecutionChain(resolvedHandler);
                }
            }
        }
        return handler;
    }

    /**
     * Register a handler against one or more paths.
     *
     * @param path - One path or many paths to register.
     * @param handler - The handler instance or application-context name.
     */
    protected _registerHandler(path: string | string[], handler: MaybeHandler): void {
        if (!isArray(path)) {
            path = [path];
        }

        path.forEach((p) => {
            if (typeof p !== 'string') {
                throw new TypeError(`Path must be a string`);
            }
            if (typeof handler === 'undefined') {
                throw new TypeError('Handler must be defined');
            }
            const resolvedHandler = resolveHandlerWithContext(this.applicationContext)(handler);
            if (!resolvedHandler) {
                throw new IllegalStateError(`Could not resolve handler: ${handler} for path "${p}"`);
            }

            const mappedHandler: MaybeHandler | undefined = this.#handlers.get(p);

            if (mappedHandler) {
                if (mappedHandler !== resolvedHandler) {
                    throw new IllegalStateError(
                        `Cannot map handler ${handler} to path "${p}". There is already ${mappedHandler} mapped.`
                    );
                }
            } else {
                switch (p) {
                    case '/':
                        this.rootHandler = resolvedHandler;
                        break;
                    case '/*':
                        this.defaultHandler = resolvedHandler;
                        break;
                    default:
                        this.#handlers.set(p, resolvedHandler);
                        break;
                }
            }
        });
    }
}

/**
 * Base class for path mappings that discover handlers from the application context.
 */
export abstract class AbstractDetectingPathHandlerMapping extends AbstractPathHandlerMapping {
    /**
     * Store the application context and detect handlers immediately.
     *
     * @param context - The application context to use.
     */
    setApplicationContext(context: ApplicationContext): void {
        super.setApplicationContext(context);
        this._detectHandlers();
    }

    /**
     * Scan the application context for handlers and register their paths.
     */
    protected _detectHandlers(): void {
        const names = Object.keys(this.applicationContext);
        names.forEach((name) => {
            const paths = this._determinePathsForHandler(name);
            paths.length && this._registerHandler(paths, name);
        });
    }

    /**
     * Determine the paths for a handler name.
     *
     * @param name - The application-context name.
     * @returns The paths to register.
     */
    protected abstract _determinePathsForHandler(name: string): string[];
}