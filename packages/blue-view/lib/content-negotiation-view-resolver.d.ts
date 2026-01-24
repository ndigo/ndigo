/**
 * @author Jeff Rose
 */
import { MediaType, MultiValueMap } from '@blue/core';
import { View } from './view';
import { ViewResolver } from './view-resolver';
export interface MediaTypeFileExtensionResolver {
    getAllFileExtenstions(): string[];
    resolveFileExtensions(mediaType: MediaType): string[];
}
export interface ContentNegotiationStrategy {
    resolveMediaTypes(request: any): MediaType[];
}
export declare const likeMediaTypeFileExtensionResolver: (value: any) => value is MediaTypeFileExtensionResolver;
export declare class MappingMediaTypeFileExtensionResolver implements MediaTypeFileExtensionResolver {
    mediaTypes: Map<string, MediaType>;
    fileExtensions: MultiValueMap<MediaType, string>;
    allFileExtensions: string[];
    constructor(mediaTypes: Map<string, MediaType>);
    getAllFileExtenstions(): string[];
    getAllMediaTypes(): MediaType[];
    lookupMediaType(extension: string): MediaType;
    resolveFileExtensions(mediaType: MediaType): string[];
}
export declare class FixedContentNegotiationStrategy implements ContentNegotiationStrategy {
    mediaTypes: MediaType[];
    constructor(mediaTypes: MediaType | MediaType[]);
    resolveMediaTypes(request: any): MediaType[];
}
export declare abstract class AbstractMappingContentNegotiationStrategy extends MappingMediaTypeFileExtensionResolver implements ContentNegotiationStrategy {
    resolveMediaTypes(request: any): MediaType[];
    resolveMediaTypeKey(request: any, key: string): MediaType[];
}
export declare class PathExtensionContentNegotiationStrategy implements ContentNegotiationStrategy {
    resolveMediaTypes(request: any): MediaType[];
}
export declare class ContentNegotiationManager implements ContentNegotiationStrategy, MediaTypeFileExtensionResolver {
    strategies: ContentNegotiationStrategy[];
    resolvers: MediaTypeFileExtensionResolver[];
    constructor(strategies?: ContentNegotiationStrategy[]);
    getAllFileExtenstions(): string[];
    resolveFileExtensions(mediaType: MediaType): string[];
    resolveMediaTypes(request: any): MediaType[];
}
export declare class ContentNegotiationViewResolver implements ViewResolver {
    contentNegotiationManager: ContentNegotiationManager;
    defaultViews: View[];
    viewResolvers: ViewResolver[];
    constructor(manager: ContentNegotiationManager);
    getMediaTypes(request: any): MediaType[];
    resolveViewName(name: string, language?: any): Promise<View>;
}
//# sourceMappingURL=content-negotiation-view-resolver.d.ts.map