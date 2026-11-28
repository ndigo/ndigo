/**
 * View resolution: contracts and the resolver implementations.
 */
import type { View } from './view.js';

/**
 * Should ViewResolver be typed, i.e. `ViewResolver<T extends View>`?
 *
 */

/**
 * Resolves a view name to a concrete {@link View} instance.
 *
 * @example
 * ```ts
 * const value = {} as ViewResolver;
 * ```
 */
export interface ViewResolver {
    /**
     * Resolves the requested view name.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint used during resolution.
     * @param request - Optional per-call request (typically the route) carrying
     *   request-scoped data such as the `Accept` header or path extension.
     *   Threaded explicitly by the dispatcher so negotiation never relies on
     *   shared process state; resolvers that do not negotiate ignore it.
     * @returns A promise that resolves to the matching view, or `null` when none is available.
     */
    resolveViewName(name: string, language?: unknown, request?: unknown): Promise<View | null>;
}

export * from './view-cache.js';
export * from './abstract-caching-view-resolver.js';
export * from './abstract-path-based-view-resolver.js';
export * from './view-resolvers.js';
