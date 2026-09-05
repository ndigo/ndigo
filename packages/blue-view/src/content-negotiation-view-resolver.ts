/**
 * @author Jeff Rose
 */

import { FrameworkError, MediaType, MultiValueMap } from '@blue/core';
import { isFunction, isNotNil } from '@blue/util/types';
import { View } from './view.js';
import { ViewResolver } from './view-resolver.js';

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
    resolveMediaTypes(request: any): MediaType[];
}

/**
 * Resolves {@link MediaType} values to file extensions.
 *
 * For example, it can resolve `application/json` to `json`.
 */

const hasFunction = (prop: string) => (obj: any): boolean => isFunction(obj?.[prop]),
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
    resolveMediaTypes(request: any): MediaType[] {
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
    resolveMediaTypes(request: any): MediaType[] {
        const all = this.getAllMediaTypes();
        const hint = request?.mediaTypeHint as string | undefined;
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
    resolveMediaTypeKey(request: any, key: string): MediaType[] | null {
        return null;
    }
}

/**
 * Content negotiation strategy that is intended to derive media types from the request path extension.
 */
export class PathExtensionContentNegotiationStrategy extends MappingMediaTypeFileExtensionResolver
    implements ContentNegotiationStrategy
{
    /**
     * Resolves media types by inspecting the request path extension.
     *
     * @param request - The current request.
     * @returns Media types matching the file extension extracted from the path.
     */
    resolveMediaTypes(request: any): MediaType[] {
        // Try to extract a path or URI from the request
        const uri = (request?.uri || request?.path) || '';
        if (!uri) return [];

        // Extract the file extension (last segment after the last dot, ignoring query string)
        const pathname = uri.split('?')[0]; // strip query string
        const ext = pathname.match(/\.([^/]+)$/);
        if (!ext) return [];

        const mediaType = this.lookupMediaType(ext[1].toLowerCase());
        return mediaType ? [mediaType] : [];
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
            likeMediaTypeFileExtensionResolver(strategy) && this.resolvers.push(strategy);
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
    resolveMediaTypes(request: any): MediaType[] {
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
    getMediaTypes(request: any): MediaType[] {
        return this.contentNegotiationManager.resolveMediaTypes(request);
    }

    /**
     * Resolves a view name using negotiated media types.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns Never returns normally.
     * @throws {FrameworkError} Always thrown because the method is not implemented.
     */
    resolveViewName(name: string, language?: unknown): Promise<View> {
        throw new FrameworkError('Method not implemented.');
    }
}
