/**
 * @author Jeff Rose
 */
import { MultiValueMap } from '@blue/core';
import { allPass, complement, isFunction, isNil, propSatisfies } from '@blue/util';
/**
 * Strategy to resolve {@link module:core.MediaType} to a list of file extensions.
 * For example resolve "application/json" to "json".
 * @interface module:view.MediaTypeFileExtensionResolver
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC1uZWdvdGlhdGlvbi12aWV3LXJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnRlbnQtbmVnb3RpYXRpb24tdmlldy1yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBYSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFhbkY7Ozs7R0FJRztBQUVILE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFDL0IsV0FBVyxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFDdkMsd0JBQXdCLEdBQUcsV0FBVyxDQUFDLHVCQUF1QixDQUFDLEVBQy9ELHdCQUF3QixHQUFHLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRXBFLE1BQU0sQ0FBQyxNQUFNLGtDQUFrQyxHQUFHLENBQUMsS0FBVSxFQUEyQyxFQUFFLENBQ3RHLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFcEYsTUFBTSxPQUFPLHFDQUFxQztJQUM5QyxVQUFVLENBQXlCO0lBQ25DLGNBQWMsQ0FBbUM7SUFDakQsaUJBQWlCLENBQVc7SUFFNUIsWUFBWSxVQUFrQztRQUMxQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFxQixDQUFDO1FBQy9DLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxhQUFhLEVBQXFCLENBQUM7UUFDN0QsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUU1QixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLFNB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