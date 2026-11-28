/**
 * Content-negotiation strategies.
 */
import { MediaType, compareBy, invertComparison, numberComparator } from '@ndigo/core';
import type { ContentNegotiationStrategy } from './content-negotiation-types.js';
import { MappingMediaTypeFileExtensionResolver } from './mapping-media-type-file-extension-resolver.js';

export class FixedContentNegotiationStrategy implements ContentNegotiationStrategy {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "FixedContentNegotiationStrategy".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object FixedContentNegotiationStrategy]"
     */
    get [Symbol.toStringTag](): string {
        return 'FixedContentNegotiationStrategy';
    }

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
 *
 * @example
 * ```ts
 * firstServableMediaType();
 * ```
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
 * Base class for content negotiation strategies that also resolve file extensions.
 *
 * @example
 * ```ts
 * const instance = new AbstractMappingContentNegotiationStrategy();
 * ```
 */
export abstract class AbstractMappingContentNegotiationStrategy
    extends MappingMediaTypeFileExtensionResolver
    implements ContentNegotiationStrategy
{
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AbstractMappingContentNegotiationStrategy".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AbstractMappingContentNegotiationStrategy]"
     */
    get [Symbol.toStringTag](): string {
        return 'AbstractMappingContentNegotiationStrategy';
    }

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
 *
 * @example
 * ```ts
 * const instance = new PathExtensionContentNegotiationStrategy();
 * ```
 */
export class PathExtensionContentNegotiationStrategy
    extends MappingMediaTypeFileExtensionResolver
    implements ContentNegotiationStrategy
{
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "PathExtensionContentNegotiationStrategy".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object PathExtensionContentNegotiationStrategy]"
     */
    get [Symbol.toStringTag](): string {
        return 'PathExtensionContentNegotiationStrategy';
    }

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
 *
 * @example
 * ```ts
 * const instance = new ContentNegotiationManager();
 * ```
 */
