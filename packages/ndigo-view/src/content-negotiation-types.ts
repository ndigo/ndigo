/**
 * Content-negotiation contracts.
 */
import { MediaType } from '@ndigo/core';
import { isFunction, isNotNil } from '@ndigo/util/types';

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
 *
 * @example
 * ```ts
 * const value = {} as ContentNegotiationStrategy;
 * ```
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
 *
 * @example
 * ```ts
 * const instance = new MappingMediaTypeFileExtensionResolver();
 * ```
 */
