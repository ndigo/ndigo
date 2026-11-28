/**
 * Media-type negotiation and extension mapping for view resolvers.
 */
import { BoundedCache, MediaType } from '@ndigo/core';
import { isNotNil } from '@ndigo/util/types';
import type { View } from './view.js';
import { MAX_VIEW_CACHE_ENTRIES, createViewCacheKey } from './view-cache.js';
import type { ViewResolver } from './view-resolver.js';
import { ContentNegotiationManager } from './content-negotiation-manager.js';
import { firstServableMediaType } from './content-negotiation-strategies.js';
import { NotAcceptableError } from './not-acceptable-error.js';

export class ContentNegotiationViewResolver implements ViewResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ContentNegotiationViewResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ContentNegotiationViewResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'ContentNegotiationViewResolver';
    }

    /**
     * The manager used to derive acceptable media types.
     */
    contentNegotiationManager: ContentNegotiationManager;
    /**
     * The fallback views used when negotiation cannot resolve a specific one.
     */
    defaultViews!: View[];
    /**
     * The delegate resolvers queried after negotiation.
     */
    viewResolvers!: ViewResolver[];

    /**
     * Candidate views per logical view name + language. Candidate aggregation
     * (the `Promise.all` over every delegate resolver) is request-independent
     * — only the final negotiation passes are per-request — so each name is
     * aggregated once and reused. Delegates must be configured before the
     * first resolution.
     *
     * Bounded FIFO ({@link BoundedCache}): view names are request-derived
     * (`route.path`), so an unauthenticated scanner would otherwise grow this
     * map without limit — the same eviction contract as
     * {@link AbstractCachingViewResolver}.
     */
    readonly #candidates = new BoundedCache<string, View[]>({ maxSize: MAX_VIEW_CACHE_ENTRIES, policy: 'fifo' });

    /**
     * Creates a resolver backed by the given negotiation manager.
     *
     * @param manager - The negotiation manager to consult.
     */
    constructor(manager: ContentNegotiationManager) {
        this.contentNegotiationManager = manager;
    }

    /**
     * Returns the media types supported by the current request.
     *
     * @param request - The current request.
     * @returns The negotiated media types.
     */
    getMediaTypes(request: unknown): MediaType[] {
        return this.contentNegotiationManager.resolveMediaTypes(request);
    }

    /**
     * Resolves a view name by aggregating candidate views from every delegate
     * resolver and selecting one by the given request's negotiated media types
     * — the content-negotiating view resolver model.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @param request - Optional per-call request (typically the route) carrying
     *   the negotiation data — `Accept` header, path extension. Passed
     *   explicitly so interleaved async resolutions never share state; when
     *   omitted, the first candidate is served without negotiation.
     * @returns The matching view, or `null` when no resolver/default produced one.
     * @throws When candidates exist but none serves the
     *   request's accepted media types (HTTP 406).
     */
    async resolveViewName(name: string, language?: unknown, request?: unknown): Promise<View | null> {
        // 1. Aggregate candidate views from every delegate resolver — once
        //    per view name: aggregation never depends on the request.
        const cacheKey = createViewCacheKey(name, language);
        let candidates = this.#candidates.get(cacheKey);
        if (candidates === undefined) {
            const results = await Promise.all(
                this.viewResolvers.map((resolver) => resolver.resolveViewName(name, language))
            );
            candidates = results.filter(isNotNil);
            this.#candidates.set(cacheKey, candidates);
        }

        // 2. Nothing resolved — fall back to configured default views.
        if (candidates.length === 0) {
            return this.defaultViews?.[0] ?? null;
        }

        // 3. Without a per-call request there is nothing to negotiate — serve
        //    the first candidate.
        if (request === undefined) {
            return candidates[0];
        }

        // 4. Resolve the request's accepted media types, already ordered by
        //    client priority (descending q-value, header order breaking ties).
        const requested = this.#resolveRequestedMediaTypes(request);
        if (requested.length === 0) {
            // A live request whose accepted set could not be determined:
            // degrade to the first candidate rather than refusing.
            return candidates[0];
        }

        // 5. Pick the first candidate matching the HIGHEST-priority accepted
        //    range — the client's preference order drives the choice, not the
        //    server's registration order. Shares the candidate-vs-range walk
        //    with the extension strategy via `firstServableMediaType`.
        const servable = candidates.filter(
            (candidate): candidate is View & { mediaType: MediaType } => candidate.mediaType != null
        );
        const chosen = firstServableMediaType(
            servable.map((candidate) => candidate.mediaType),
            requested
        );
        if (chosen) {
            const winner = servable.find((candidate) => candidate.mediaType === chosen);
            if (winner) {
                return winner;
            }
        }

        // 6. Candidates exist but no representation matched the accepted
        //    ranges: signal 406 (not acceptable representation). Throwing
        //    rather than returning `null` keeps this distinct from "no such
        //    view" (404) — the route/handler resolved, only the representation
        //    is unavailable — and stops the resolver chain from silently
        //    falling through to an unrelated view.
        throw new NotAcceptableError(name, requested);
    }

    /**
     * Resolves the accepted media types for the given request, or an empty
     * array when no strategy matched. Degrades gracefully so negotiation never
     * breaks resolution.
     *
     * @param request - The per-call request to negotiate for.
     */
    #resolveRequestedMediaTypes(request: unknown): MediaType[] {
        try {
            return this.contentNegotiationManager.resolveMediaTypes(request) ?? [];
        } catch {
            return [];
        }
    }
}

export * from './content-negotiation-types.js';
export * from './mapping-media-type-file-extension-resolver.js';
export * from './content-negotiation-strategies.js';
export * from './content-negotiation-manager.js';
