/**
 * @author Jeff Rose
 */
import { MultiValueMap } from '@blue/core';
import { allPass, complement, isFunction, isNil, propSatisfies } from '@blue/util';
/**
 * Strategy to resolve {@link MediaType} to a list of file extensions.
 * For example resolve "application/json" to "json".
 */
const isDefined = complement(isNil), hasFunction = propSatisfies(isFunction), hasGetAllFileExtenstions = hasFunction('getAllFileExtenstions'), hasResolveFileExtensions = hasFunction('resolveFileExtensions');
export const likeMediaTypeFileExtensionResolver = (value) => allPass([isDefined, hasGetAllFileExtenstions, hasResolveFileExtensions])(value);
export class MappingMediaTypeFileExtensionResolver {
    mediaTypes;
    fileExtensions;
    allFileExtensions;
    constructor(mediaTypes) {
        this.mediaTypes = new Map();
        this.fileExtensions = new MultiValueMap();
        this.allFileExtensions = [];
        if (mediaTypes && mediaTypes.size) {
            mediaTypes.forEach(function (mediaType, extension) {
                const lowerCaseExtension = extension.toLowerCase();
                this.mediaTypes.set(lowerCaseExtension, mediaType);
                this.fileExtensions.add(mediaType, lowerCaseExtension);
                this.allFileExtensions.push(lowerCaseExtension);
            }, this);
        }
    }
    getAllFileExtenstions() {
        return this.allFileExtensions;
    }
    getAllMediaTypes() {
        return [...this.mediaTypes.values()];
    }
    lookupMediaType(extension) {
        return this.mediaTypes.get(extension.toLowerCase());
    }
    resolveFileExtensions(mediaType) {
        return this.fileExtensions.get(mediaType);
    }
}
export class FixedContentNegotiationStrategy {
    mediaTypes;
    constructor(mediaTypes) {
        this.mediaTypes = Array.isArray(mediaTypes) ? mediaTypes : [mediaTypes];
    }
    resolveMediaTypes(request) {
        return this.mediaTypes;
    }
}
export class AbstractMappingContentNegotiationStrategy extends MappingMediaTypeFileExtensionResolver {
    resolveMediaTypes(request) {
        throw new Error('Method not implemented.');
    }
    resolveMediaTypeKey(request, key) {
        return null;
    }
}
export class PathExtensionContentNegotiationStrategy {
    resolveMediaTypes(request) {
        throw new Error('Method not implemented.');
    }
}
export class ContentNegotiationManager {
    strategies;
    resolvers;
    constructor(strategies = []) {
        this.resolvers = [];
        this.strategies = strategies;
        this.strategies.forEach(function (strategy) {
            likeMediaTypeFileExtensionResolver(strategy) && this.resolvers.push(strategy);
        }, this);
    }
    getAllFileExtenstions() {
        throw new Error('Method not implemented.');
    }
    resolveFileExtensions(mediaType) {
        throw new Error('Method not implemented.');
    }
    resolveMediaTypes(request) {
        throw new Error('Method not implemented.');
    }
}
export class ContentNegotiationViewResolver {
    contentNegotiationManager;
    defaultViews;
    viewResolvers;
    constructor(manager) {
        this.contentNegotiationManager = manager;
    }
    getMediaTypes(request) {
        this.contentNegotiationManager;
        return null;
    }
    resolveViewName(name, language) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC1uZWdvdGlhdGlvbi12aWV3LXJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnRlbnQtbmVnb3RpYXRpb24tdmlldy1yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBYSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFhbkY7OztHQUdHO0FBRUgsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUMvQixXQUFXLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUN2Qyx3QkFBd0IsR0FBRyxXQUFXLENBQUMsdUJBQXVCLENBQUMsRUFDL0Qsd0JBQXdCLEdBQUcsV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFcEUsTUFBTSxDQUFDLE1BQU0sa0NBQWtDLEdBQUcsQ0FBQyxLQUFVLEVBQTJDLEVBQUUsQ0FDdEcsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLHdCQUF3QixFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUVwRixNQUFNLE9BQU8scUNBQXFDO0lBQzlDLFVBQVUsQ0FBeUI7SUFDbkMsY0FBYyxDQUFtQztJQUNqRCxpQkFBaUIsQ0FBVztJQUU1QixZQUFZLFVBQWtDO1FBQzFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDL0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGFBQWEsRUFBcUIsQ0FBQztRQUM3RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO1FBRTVCLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsU0FB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