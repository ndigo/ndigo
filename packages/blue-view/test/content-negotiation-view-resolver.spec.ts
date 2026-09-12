import { describe, expect, test, vi } from 'vitest';
import {
    ContentNegotiationViewResolver,
    MappingMediaTypeFileExtensionResolver,
    FixedContentNegotiationStrategy,
    ContentNegotiationManager,
    likeMediaTypeFileExtensionResolver,
    setCurrentRequest,
    clearCurrentRequest,
} from '../src/content-negotiation-view-resolver';
import { MediaTypes, type MediaType } from '@blue/core';
import type { View, ViewResolver } from '../src/view';

describe('ContentNegotiationViewResolver', () => {
    test('it should delegate media type resolution to the content negotiation manager', () => {
        const request = { path: '/index' };
        const mediaTypes = [{ type: 'text', subtype: 'html' }];
        const manager = {
            resolveMediaTypes: vi.fn().mockReturnValue(mediaTypes),
        } as unknown as ContentNegotiationManager;

        const resolver = new ContentNegotiationViewResolver(manager);

        expect(resolver.getMediaTypes(request)).toBe(mediaTypes);
        expect(manager.resolveMediaTypes).toHaveBeenCalledWith(request);
    });

    test('it should resolve media types and extensions from mapping', () => {
        const mediaTypes = new Map<string, MediaType>([
            ['html', MediaTypes.TEXT_HTML],
            ['json', MediaTypes.APPLICATION_JSON],
        ]);

        const resolver = new MappingMediaTypeFileExtensionResolver(mediaTypes);

        expect(resolver.getAllFileExtenstions()).toEqual(['html', 'json']);
        expect(resolver.lookupMediaType('HTML')).toBe(MediaTypes.TEXT_HTML);
        expect(resolver.resolveFileExtensions(MediaTypes.APPLICATION_JSON)).toEqual(['json']);
    });

    test('it should support likeMediaTypeFileExtensionResolver predicate', () => {
        const candidate = {
            getAllFileExtenstions: () => ['html'],
            resolveFileExtensions: () => ['html'],
        };

        expect(likeMediaTypeFileExtensionResolver(candidate)).toBe(true);
        expect(likeMediaTypeFileExtensionResolver(null)).toBe(false);
    });

    test('fixed content negotiation strategy should return configured media types', () => {
        const strategy = new FixedContentNegotiationStrategy([MediaTypes.TEXT_HTML]);

        expect(strategy.resolveMediaTypes({})).toEqual([MediaTypes.TEXT_HTML]);
    });
});
/** A {@link View} with a fixed media type. */
const view = (mediaType: MediaType | null): View => ({ mediaType, render() {} });

/** A delegate resolver that always returns the same view. */
const staticResolver = (viewToReturn: View): ViewResolver => ({
    resolveViewName: async () => viewToReturn,
});

describe('ContentNegotiationViewResolver.resolveViewName', () => {
    afterEach(() => {
        clearCurrentRequest();
    });
    test('returns null when no delegate resolves and there are no defaults', async () => {
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [{ resolveViewName: async (): Promise<View | null> => null }];

        setCurrentRequest({ headers: {} });
        await expect(resolver.resolveViewName('missing', '')).resolves.toBeNull();
    });

    test('returns the first candidate when no request is active', async () => {
        const html = view(MediaTypes.TEXT_HTML);
        const json = view(MediaTypes.APPLICATION_JSON);
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [staticResolver(html), staticResolver(json)];

        await expect(resolver.resolveViewName('page', '')).resolves.toBe(html);
    });

    test('selects the candidate whose media type matches an accepted type', async () => {
        const html = view(MediaTypes.TEXT_HTML);
        const json = view(MediaTypes.APPLICATION_JSON);
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [MediaTypes.APPLICATION_JSON],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [staticResolver(html), staticResolver(json)];

        setCurrentRequest({ headers: { accept: 'application/json' } });
        await expect(resolver.resolveViewName('page', '')).resolves.toBe(json);
    });

    test('falls back to the first default view when no candidate matches', async () => {
        const html = view(MediaTypes.TEXT_HTML);
        const fallback = view(MediaTypes.APPLICATION_JSON);
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [MediaTypes.APPLICATION_JSON],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [staticResolver(html)];
        resolver.defaultViews = [fallback];

        setCurrentRequest({ headers: { accept: 'application/json' } });
        await expect(resolver.resolveViewName('page', '')).resolves.toBe(fallback);
    });
});
