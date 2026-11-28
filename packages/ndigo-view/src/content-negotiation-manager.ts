/**
 * Content-negotiation manager.
 */
import { FrameworkError, MediaType } from '@ndigo/core';
import { HTTPHeaders } from '@ndigo/http';
import type { ContentNegotiationStrategy, MediaTypeFileExtensionResolver } from './content-negotiation-types.js';
import { likeMediaTypeFileExtensionResolver } from './content-negotiation-types.js';
import { MappingMediaTypeFileExtensionResolver } from './mapping-media-type-file-extension-resolver.js';

export class ContentNegotiationManager implements ContentNegotiationStrategy, MediaTypeFileExtensionResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ContentNegotiationManager".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ContentNegotiationManager]"
     */
    get [Symbol.toStringTag](): string {
        return 'ContentNegotiationManager';
    }

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
 *
 * @example
 * ```ts
 * const instance = new ContentNegotiationViewResolver();
 * ```
 */
