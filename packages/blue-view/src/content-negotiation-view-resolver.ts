/**
 * @module blue-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError, MediaType, MultiValueMap } from '@blue/core';
import { isFunction, isNotNil } from '@blue/util/types';
import { View } from './view.js';
import { ViewResolver } from './view-resolver.js';
/**
 * Per-request context for content negotiation.
 *
 * `ViewResolver.resolveViewName` receives only a name and language, never the
 * live request. Spring supplies it through a request-scoped holder; this mirrors
 * that model. The dispatcher stores the current request (typically the platform
 * request carrying `Accept` headers, or the {@link Route}) around dispatch and
 * clears it afterwards, so negotiation strategies can read request data.
 *
 * This is shared per-process state: it must be set and cleared around a single
 * request's resolution. Concurrency-safe deployments should scope it to the
 * async request context rather than a module-level variable.
 */
let currentRequest: unknown = undefined;

/**
 * Stores the current request used for content negotiation.
 *
 * @param request - The current request (or route).
 */
export function setCurrentRequest(request: unknown): void {
    currentRequest = request;
}

/**
 * Returns the current request, or `undefined` when none is active.
 */
export function getCurrentRequest(): unknown {
    return currentRequest;
}

/**
 * Clears the current request. Call once a dispatch completes.
 */
export function clearCurrentRequest(): void {
    currentRequest = undefined;
}

/**
 * Resolves file extensions for a media type and can enumerate all known extensions.
 */
export interface MediaTypeFileExtensionResolver {
    /**
     * Returns every known file extension.
     *
     * @returns The known file extensions.
     */
    getAllFileExtenstions(): string[];

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
    hasGetAllFileExtenstions = hasFunction('getAllFileExtenstions'),
    hasResolveFileExtensions = hasFunction('resolveFileExtensions');

export const likeMediaTypeFileExtensionResolver = (value: unknown): value is MediaTypeFileExtensionResolver =>
    isNotNil(value) && hasGetAllFileExtenstions(value) && hasResolveFileExtensions(value);

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
    getAllFileExtenstions(): string[] {
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

        // Filter by media type hint from the request (e.g., Accept header).
        // Compare the primary media type (parameters stripped, lower-cased)
        // against either the top-level type or the full base type.
        const primary = hint.split(';')[0].trim().toLowerCase();
        for (const mediaType of all) {
            if (mediaType.type === primary || mediaType.baseType === primary) return [mediaType];
        }
        return all;
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
        // Mirrors AbstractMappingContentNegotiationStrategy's filter — this
        // class does not extend it (sibling hierarchy).
        const hint = (request as { mediaTypeHint?: string } | undefined)?.mediaTypeHint;
        if (hint) {
            const primary = hint.split(';')[0].trim().toLowerCase();
            for (const mediaType of this.getAllMediaTypes()) {
                if (mediaType.type === primary || mediaType.baseType === primary) {
                    return [mediaType];
                }
            }
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
    getAllFileExtenstions(): string[] {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const resolver of this.resolvers) {
            if (!(resolver instanceof MappingMediaTypeFileExtensionResolver)) continue;
            for (const ext of resolver.getAllFileExtenstions()) {
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
        const nodeHeaders = (request as { headers?: Record<string, string> } | undefined)?.headers;
        const hint = (request as { mediaTypeHint?: string } | undefined)?.mediaTypeHint;
        if (!hint && nodeHeaders && typeof nodeHeaders === 'object') {
            const accept = Array.isArray(nodeHeaders) ? nodeHeaders.join(', ') : nodeHeaders['accept'];
            if (accept) {
                (request as { mediaTypeHint?: string }).mediaTypeHint = accept;
            }
        }

        for (const strategy of this.strategies) {
            const result = strategy.resolveMediaTypes(request);
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
     */
    readonly #candidates = new Map<string, View[]>();

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
     * resolver and selecting one by the request's negotiated media types — the
     * Spring ContentNegotiatingViewResolver model.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns The matching view, or `null` when none is available.
     */
    async resolveViewName(name: string, language?: unknown): Promise<View | null> {
        // 1. Aggregate candidate views from every delegate resolver — once
        //    per view name: aggregation never depends on the request.
        const cacheKey = `${name}\u0000${language ?? ''}`;
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

        // 3. Negotiate the request's accepted media types. Without an active
        //    request (non-HTTP context, or no strategy matched) take the first.
        const requested = this.resolveRequestedMediaTypes();
        if (requested.length === 0) {
            return candidates[0];
        }

        // 4. Pick the first candidate whose media type is compatible with an accepted type.
        for (const view of candidates) {
            const mediaType = view.mediaType;
            if (!mediaType) {
                continue;
            }
            const supported = requested.some(
                (accepted) =>
                    mediaType.includes(accepted) || accepted.includes(mediaType) || mediaType.matches(accepted)
            );
            if (supported) {
                return view;
            }
        }

        // 5. No representation matched — use the first default, else the last candidate.
        return this.defaultViews?.[0] ?? candidates[candidates.length - 1];
    }

    /**
     * Resolves the accepted media types for the current request, or an empty
     * array when none can be determined (no active request, or no strategy
     * matched). Degrades gracefully so negotiation never breaks resolution.
     */
    private resolveRequestedMediaTypes(): MediaType[] {
        const request = getCurrentRequest();
        if (request === undefined) {
            return [];
        }
        try {
            return this.contentNegotiationManager.resolveMediaTypes(request) ?? [];
        } catch {
            return [];
        }
    }
}
