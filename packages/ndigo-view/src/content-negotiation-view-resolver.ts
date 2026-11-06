/**
 */
import { compareBy, FrameworkError, invertComparison, MediaType, MultiValueMap, numberComparator } from '@ndigo/core';
import { HTTPHeaders } from '@ndigo/http';
import { isFunction, isNotNil } from '@ndigo/util/types';
import { View } from './view.js';
import { BoundedCache, createViewCacheKey, ViewResolver } from './view-resolver.js';

/**
 * Resolves file extensions for a media type and can enumerate all known extensions.
 */
export interface MediaTypeFileExtensionResolver {
    /**
     * Returns every known file extension.
     *
     * @returns The known file extensions.
     */
    getAllFileExtensions(): string[];

    /**
     * Resolves the file extensions associated with the given media type.
     *
     * @param mediaType - The media type to resolve.
     * @returns The matching file extensions.
     */
    resolveFileExtensions(mediaType: MediaType): string[];
}

/**
 * Resolves the media types supported for a request.
 */
export interface ContentNegotiationStrategy {
    /**
     * Resolves the media types requested by the current request.
     *
     * @param request - The current request.
     * @returns The acceptable media types, in priority order.
     */
    resolveMediaTypes(request: unknown): MediaType[];
}

/**
 * Resolves {@link MediaType} values to file extensions.
 *
 * For example, it can resolve `application/json` to `json`.
 */

const hasFunction =
        (prop: string) =>
        (obj: unknown): boolean =>
            isFunction((obj as Record<string, unknown> | null)?.[prop]),
    hasGetAllFileExtensions = hasFunction('getAllFileExtensions'),
    hasResolveFileExtensions = hasFunction('resolveFileExtensions');

/**
 * Structural check for a `MediaTypeFileExtensionResolver`: accepts any value
 * exposing both `getAllFileExtensions` and `resolveFileExtensions`, so a custom
 * resolver needs no class.
 */
export const likeMediaTypeFileExtensionResolver = (value: unknown): value is MediaTypeFileExtensionResolver =>
    isNotNil(value) && hasGetAllFileExtensions(value) && hasResolveFileExtensions(value);

/**
 * Resolves file extensions from a map of extension-to-media-type pairs.
 */
export class MappingMediaTypeFileExtensionResolver implements MediaTypeFileExtensionResolver {
    /**
     * The registered media types by normalized file extension.
     */
    mediaTypes: Map<string, MediaType>;
    /**
     * The reverse lookup from media type to file extensions.
     */
    fileExtensions: MultiValueMap<MediaType, string>;
    /**
     * All registered file extensions in insertion order.
     */
    allFileExtensions: string[];

    /**
     * Creates a resolver from extension-to-media-type mappings.
     *
     * @param mediaTypes - The source map of file extensions to media types.
     */
    constructor(mediaTypes: Map<string, MediaType>) {
        this.mediaTypes = new Map<string, MediaType>();
        this.fileExtensions = new MultiValueMap<MediaType, string>();
        this.allFileExtensions = [];

        if (mediaTypes && mediaTypes.size) {
            mediaTypes.forEach((mediaType: MediaType, extension: string) => {
                const lowerCaseExtension: string = extension.toLowerCase();
                this.mediaTypes.set(lowerCaseExtension, mediaType);
                this.fileExtensions.add(mediaType, lowerCaseExtension);
                this.allFileExtensions.push(lowerCaseExtension);
            });
        }
    }

    /**
     * Returns all known file extensions.
     *
     * @returns The known file extensions.
     */
    getAllFileExtensions(): string[] {
        return this.allFileExtensions;
    }

    /**
     * Returns all media types known to this resolver.
     *
     * @returns The known media types.
     */
    getAllMediaTypes(): MediaType[] {
        return [...this.mediaTypes.values()];
    }

    /**
     * Looks up the media type for the given file extension.
     *
     * @param extension - The file extension to resolve.
     * @returns The matching media type, or `null` when none exists.
     */
    lookupMediaType(extension: string): MediaType | null {
        return this.mediaTypes.get(extension.toLowerCase()) as MediaType | null;
    }

    /**
     * Returns the file extensions associated with the given media type.
     *
     * @param mediaType - The media type to resolve.
     * @returns The matching file extensions.
     */
    resolveFileExtensions(mediaType: MediaType): string[] {
        return this.fileExtensions.get(mediaType) ?? [];
    }
}

/**
 * Returns the same media types for every request.
 */
export class FixedContentNegotiationStrategy implements ContentNegotiationStrategy {
    /**
     * The media types this strategy always returns.
     */
    mediaTypes: MediaType[];

    /**
     * Creates a fixed strategy from one or more media types.
     *
     * @param mediaTypes - The media type or types to return.
     */
    constructor(mediaTypes: MediaType | MediaType[]) {
        this.mediaTypes = Array.isArray(mediaTypes) ? mediaTypes : [mediaTypes];
    }

    /**
     * Returns the configured media types.
     *
     * @param request - The current request.
     * @returns The configured media types.
     */
    resolveMediaTypes(request: unknown): MediaType[] {
        return this.mediaTypes;
    }
}

/**
 * Parses an `Accept` header value into ordered media ranges for negotiation.
 *
 * Comma-splits the header, drops `q=0` ("never") ranges, and sorts by
 * descending q-value with the header order breaking ties (RFC 9110 §12.4.2 —
 * a stable sort keeps first-listed preference for equal weights).
 *
 * @param accept - The raw `Accept` header value.
 * @returns The accepted media types in client-preference order.
 */
const parseAcceptedRanges = (accept: string): MediaType[] => {
    const ranges = MediaType.parseAccept(accept).filter((mediaType) => mediaType.qualityFactor > 0);
    return ranges.sort(invertComparison(compareBy((range) => range.qualityFactor, numberComparator.compare)));
};

/**
 * Whether a candidate media type can serve an accepted media range, honoring
 * type/subtype inclusion and wildcard semantics. Single source of truth for
 * the candidate-vs-range check shared by the extension strategy and the
 * resolver's final negotiation pass.
 *
 * @param candidate - The media type a view produces.
 * @param accepted - The client-accepted range.
 * @returns `true` when the candidate satisfies the range.
 */
export const canServeMediaType = (candidate: MediaType, accepted: MediaType): boolean =>
    candidate.includes(accepted) || accepted.includes(candidate) || candidate.matches(accepted);

/**
 * Returns the first candidate media type that can serve one of the accepted
 * ranges, honoring the client's priority order (accepted ranges are already
 * ordered by descending q-value).
 *
 * Single source of truth for the candidate-vs-range walk shared by the
 * extension negotiation strategy and the resolver's final negotiation pass,
 * so both select the same representation for the same `Accept` header.
 *
 * @param candidates - The media types the server can produce, in registration order.
 * @param acceptedRanges - The client-accepted ranges, in client-priority order.
 * @returns The first servable candidate, or `undefined` when none matches.
 */
export function firstServableMediaType(candidates: MediaType[], acceptedRanges: MediaType[]): MediaType | undefined {
    for (const accepted of acceptedRanges) {
        for (const candidate of candidates) {
            if (canServeMediaType(candidate, accepted)) {
                return candidate;
            }
        }
    }
    return undefined;
}

/**
 * Raised when a view name resolves to candidate representations but none
 * satisfies the request's accepted media types (HTTP 406 — the route/handler
 * exists, only the representation is unavailable). Distinct from a missing
 * view, which stays `NoViewFoundError`/404.
 */
export class NotAcceptableError extends FrameworkError {
    /**
     * The view name whose candidates were unacceptable.
     */
    readonly viewName: string;
    /**
     * The accepted media types considered, in client-priority order.
     */
    readonly acceptedMediaTypes: MediaType[];

    /**
     * Creates a not-acceptable signal for the resolved view name.
     *
     * @param viewName - The view name whose representations were refused.
     * @param acceptedMediaTypes - The request's accepted media types.
     */
    constructor(viewName: string, acceptedMediaTypes: MediaType[]) {
        super(
            `No acceptable representation for view "${viewName}"; accepted: ${
                acceptedMediaTypes.map((mediaType) => String(mediaType)).join(', ') || '(none)'
            }`
        );
        this.viewName = viewName;
        this.acceptedMediaTypes = acceptedMediaTypes;
    }
}

/**
 * Base class for content negotiation strategies that also resolve file extensions.
 */
export abstract class AbstractMappingContentNegotiationStrategy
    extends MappingMediaTypeFileExtensionResolver
    implements ContentNegotiationStrategy
{
    /**
     * Resolves the media types for a request.

     * @param request - The current request.
     * @returns Media types from this resolver, optionally filtered by request params.
     */
    resolveMediaTypes(request: unknown): MediaType[] {
        const all = this.getAllMediaTypes();
        const hint = (request as { mediaTypeHint?: string } | undefined)?.mediaTypeHint;
        if (!hint) return all;

        // Parse the FULL Accept header (not merely the first range, stripped
        // at its `;`) into ordered, q-value-prioritized media ranges. The
        // client's preference order, not the server's registration order,
        // drives negotiation; ranges the client rejects (q=0) are dropped, and
        // an accepted set nothing matches yields the resolver's 406 path.
        return parseAcceptedRanges(hint);
    }

    /**
     * Resolves media types for a specific key within the request.
     *
     * @param request - The current request.
     * @param key - The request key to inspect.
     * @returns The matching media types, or `null` when none are found.
     */
    resolveMediaTypeKey(request: unknown, key: string): MediaType[] | null {
        return null;
    }
}

/**
 * Content negotiation strategy that is intended to derive media types from the request path extension.
 */
export class PathExtensionContentNegotiationStrategy
    extends MappingMediaTypeFileExtensionResolver
    implements ContentNegotiationStrategy
{
    /**
     * Resolves media types by inspecting the request path extension.
     *
     * @param request - The current request.
     * @returns Media types matching the file extension extracted from the path.
     */
    resolveMediaTypes(request: unknown): MediaType[] {
        // Try to extract a path or URI from the request
        const req = request as { uri?: string; path?: string } | undefined;
        const uri = req?.uri || req?.path || '';
        if (!uri) return [];

        // Extract the file extension (last segment after the last dot, ignoring query string)
        const pathname = uri.split('?')[0]; // strip query string
        const ext = pathname.match(/\.([^/]+)$/);
        if (ext) {
            const mediaType = this.lookupMediaType(ext[1].toLowerCase());
            return mediaType ? [mediaType] : [];
        }

        // No extension: honor an Accept-header hint (set by the negotiation
        // manager) so the same logical view can be requested by media type.
        // Mirrors AbstractMappingContentNegotiationStrategy — this class does
        // not extend it (sibling hierarchy). Walk the parsed, q-prioritized
        // ranges in order and return the highest-priority one this resolver
        // can serve (wildcards cannot name an extension).
        const hint = (request as { mediaTypeHint?: string } | undefined)?.mediaTypeHint;
        if (hint) {
            const mediaType = firstServableMediaType(this.getAllMediaTypes(), parseAcceptedRanges(hint));
            return mediaType ? [mediaType] : [];
        }
        return [];
    }
}

/**
 * Aggregates content-negotiation strategies and file-extension resolvers.
 */
export class ContentNegotiationManager implements ContentNegotiationStrategy, MediaTypeFileExtensionResolver {
    /**
     * The strategies consulted to resolve media types.
     */
    strategies: ContentNegotiationStrategy[];
    /**
     * The strategies capable of resolving file extensions.
     */
    resolvers: MediaTypeFileExtensionResolver[];

    /**
     * Creates a manager with the supplied strategies.
     *
     * @param strategies - The strategies to manage.
     */
    constructor(strategies: ContentNegotiationStrategy[] = []) {
        this.resolvers = [];
        this.strategies = strategies;
        this.strategies.forEach((strategy) => {
            if (likeMediaTypeFileExtensionResolver(strategy)) {
                this.resolvers.push(strategy);
            }
        });
    }

    /**
     * Returns every file extension known to the registered resolvers.
     *
     * @returns The union of all extensions from every resolver, deduplicated by insertion order.
     */
    getAllFileExtensions(): string[] {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const resolver of this.resolvers) {
            if (!(resolver instanceof MappingMediaTypeFileExtensionResolver)) continue;
            for (const ext of resolver.getAllFileExtensions()) {
                if (!seen.has(ext)) {
                    seen.add(ext);
                    result.push(ext);
                }
            }
        }
        return result;
    }

    /**
     * Resolves file extensions for the given media type.
     *
     * @param mediaType - The media type to resolve.
     * @returns Extensions from the first resolver that supports this media type, or empty array.
     */
    resolveFileExtensions(mediaType: MediaType): string[] {
        for (const resolver of this.resolvers) {
            if (!(resolver instanceof MappingMediaTypeFileExtensionResolver)) continue;
            const exts = resolver.resolveFileExtensions(mediaType);
            if (exts.length > 0) return exts;
        }
        return [];
    }

    /**
     * Resolves the media types requested by the current request.
     *
     * @param request - The current request.
     * @returns Media types in priority order from the first strategy that matches.
     */
    resolveMediaTypes(request: unknown): MediaType[] {
        // Node requests carry headers but not the strategy protocol's
        // `mediaTypeHint` — bridge the Accept header here so header-driven
        // negotiation works for every app (the strategies are unchanged).
        // `HTTPHeaders.ACCEPT` folds case and joins multi-value entries.
        // The negotiation request is an untyped protocol object, so cast it
        // once here (rather than per member access) and probe the members.
        //
        // The bridge MUST NOT mutate the caller's request: a reused route
        // would otherwise keep a stale hint and negotiate against the first
        // request's Accept forever. When a hint must be derived, inject it on
        // a shallow copy and negotiate with that.
        const nodeRequest = request as
            | { headers?: Record<string, string | string[] | undefined>; mediaTypeHint?: string }
            | undefined;
        let hint = nodeRequest?.mediaTypeHint;
        if (!hint && nodeRequest?.headers && typeof nodeRequest.headers === 'object') {
            hint = HTTPHeaders.ACCEPT.get(nodeRequest.headers) || undefined;
        }
        const negotiationRequest =
            hint === nodeRequest?.mediaTypeHint || hint === undefined
                ? request
                : Object.assign({}, request as object, { mediaTypeHint: hint });

        for (const strategy of this.strategies) {
            const result = strategy.resolveMediaTypes(negotiationRequest);
            if (result && result.length > 0) return result;
        }
        throw new FrameworkError('No content negotiation strategy could resolve media types');
    }
}

/**
 * Resolves views using content negotiation results.
 */
export class ContentNegotiationViewResolver implements ViewResolver {
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
    readonly #candidates = new BoundedCache<View[]>();

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
        const requested = this.resolveRequestedMediaTypes(request);
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
    private resolveRequestedMediaTypes(request: unknown): MediaType[] {
        try {
            return this.contentNegotiationManager.resolveMediaTypes(request) ?? [];
        } catch {
            return [];
        }
    }
}
