/**
 * @author Jeff Rose
 */

import { MediaType, MultiValueMap } from '@blue/core';
import { allPass, complement, isFunction, isNil, propSatisfies } from '@blue/util';
import { View } from './view';
import { ViewResolver } from './view-resolver';

export interface MediaTypeFileExtensionResolver {
    getAllFileExtenstions(): string[];
    resolveFileExtensions(mediaType: MediaType): string[];
}

export interface ContentNegotiationStrategy {
    resolveMediaTypes(request: any): MediaType[];
}

/**
 * Strategy to resolve {@link MediaType} to a list of file extensions.
 * For example resolve "application/json" to "json".
 */

const isDefined = complement(isNil),
    hasFunction = propSatisfies(isFunction),
    hasGetAllFileExtenstions = hasFunction('getAllFileExtenstions'),
    hasResolveFileExtensions = hasFunction('resolveFileExtensions');

export const likeMediaTypeFileExtensionResolver = (value: any): value is MediaTypeFileExtensionResolver =>
    allPass([isDefined, hasGetAllFileExtenstions, hasResolveFileExtensions])(value);

export class MappingMediaTypeFileExtensionResolver implements MediaTypeFileExtensionResolver {
    mediaTypes: Map<string, MediaType>;
    fileExtensions: MultiValueMap<MediaType, string>;
    allFileExtensions: string[];

    constructor(mediaTypes: Map<string, MediaType>) {
        this.mediaTypes = new Map<string, MediaType>();
        this.fileExtensions = new MultiValueMap<MediaType, string>();
        this.allFileExtensions = [];

        if (mediaTypes && mediaTypes.size) {
            mediaTypes.forEach(function (mediaType: MediaType, extension: string) {
                const lowerCaseExtension: string = extension.toLowerCase();
                this.mediaTypes.set(lowerCaseExtension, mediaType);
                this.fileExtensions.add(mediaType, lowerCaseExtension);
                this.allFileExtensions.push(lowerCaseExtension);
            }, this);
        }
    }

    getAllFileExtenstions(): string[] {
        return this.allFileExtensions;
    }

    getAllMediaTypes(): MediaType[] {
        return [...this.mediaTypes.values()];
    }

    lookupMediaType(extension: string): MediaType {
        return this.mediaTypes.get(extension.toLowerCase());
    }

    resolveFileExtensions(mediaType: MediaType): string[] {
        return this.fileExtensions.get(mediaType);
    }
}

export class FixedContentNegotiationStrategy implements ContentNegotiationStrategy {
    mediaTypes: MediaType[];

    constructor(mediaTypes: MediaType | MediaType[]) {
        this.mediaTypes = Array.isArray(mediaTypes) ? mediaTypes : [mediaTypes];
    }

    resolveMediaTypes(request: any): MediaType[] {
        return this.mediaTypes;
    }
}

export abstract class AbstractMappingContentNegotiationStrategy
    extends MappingMediaTypeFileExtensionResolver
    implements ContentNegotiationStrategy
{
    resolveMediaTypes(request: any): MediaType[] {
        throw new Error('Method not implemented.');
    }

    resolveMediaTypeKey(request: any, key: string): MediaType[] {
        return null;
    }
}

export class PathExtensionContentNegotiationStrategy implements ContentNegotiationStrategy {
    resolveMediaTypes(request: any): MediaType[] {
        throw new Error('Method not implemented.');
    }
}

export class ContentNegotiationManager implements ContentNegotiationStrategy, MediaTypeFileExtensionResolver {
    strategies: ContentNegotiationStrategy[];
    resolvers: MediaTypeFileExtensionResolver[];

    constructor(strategies: ContentNegotiationStrategy[] = []) {
        this.resolvers = [];
        this.strategies = strategies;
        this.strategies.forEach(function (strategy) {
            likeMediaTypeFileExtensionResolver(strategy) && this.resolvers.push(strategy);
        }, this);
    }

    getAllFileExtenstions(): string[] {
        throw new Error('Method not implemented.');
    }

    resolveFileExtensions(mediaType: MediaType): string[] {
        throw new Error('Method not implemented.');
    }

    resolveMediaTypes(request: any): MediaType[] {
        throw new Error('Method not implemented.');
    }
}

export class ContentNegotiationViewResolver implements ViewResolver {
    contentNegotiationManager: ContentNegotiationManager;
    defaultViews: View[];
    viewResolvers: ViewResolver[];

    constructor(manager: ContentNegotiationManager) {
        this.contentNegotiationManager = manager;
    }

    getMediaTypes(request: any): MediaType[] {
        this.contentNegotiationManager;
        return null;
    }

    resolveViewName(name: string, language?: any): Promise<View> {
        throw new Error('Method not implemented.');
    }
}
