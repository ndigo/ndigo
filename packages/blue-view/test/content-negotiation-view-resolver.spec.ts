import { describe, expect, test, vi } from 'vitest';
import {
    ContentNegotiationViewResolver,
    MappingMediaTypeFileExtensionResolver,
    FixedContentNegotiationStrategy,
    ContentNegotiationManager,
    likeMediaTypeFileExtensionResolver,
} from '../src/content-negotiation-view-resolver';
import { MediaTypes, type MediaType } from '@blue/core';

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
