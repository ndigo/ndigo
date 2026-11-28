/**
 * Media-type to file-extension mapping.
 */
import { MultiValueMap } from '@ndigo/collections';
import { MediaType } from '@ndigo/core';
import type { MediaTypeFileExtensionResolver } from './content-negotiation-types.js';

export class MappingMediaTypeFileExtensionResolver implements MediaTypeFileExtensionResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MappingMediaTypeFileExtensionResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MappingMediaTypeFileExtensionResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'MappingMediaTypeFileExtensionResolver';
    }

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
 *
 * @example
 * ```ts
 * const instance = new FixedContentNegotiationStrategy();
 * ```
 */
