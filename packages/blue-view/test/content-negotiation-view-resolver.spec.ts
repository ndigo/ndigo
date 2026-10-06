/**
 * @module blue-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import {
    AbstractMappingContentNegotiationStrategy,
    ContentNegotiationViewResolver,
    MappingMediaTypeFileExtensionResolver,
    FixedContentNegotiationStrategy,
    ContentNegotiationManager,
    likeMediaTypeFileExtensionResolver,
} from '../src/content-negotiation-view-resolver';
import { MediaTypes, type MediaType } from '@blue/core';
import type { View } from '../src/view';
import type { ViewResolver } from '../src/view-resolver';

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

        expect(resolver.getAllFileExtensions()).toEqual(['html', 'json']);
        expect(resolver.lookupMediaType('HTML')).toBe(MediaTypes.TEXT_HTML);
        expect(resolver.resolveFileExtensions(MediaTypes.APPLICATION_JSON)).toEqual(['json']);
    });

    test('it should support likeMediaTypeFileExtensionResolver predicate', () => {
        const candidate = {
            getAllFileExtensions: () => ['html'],
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
    test('returns null when no delegate resolves and there are no defaults', async () => {
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [{ resolveViewName: async (): Promise<View | null> => null }];

        await expect(resolver.resolveViewName('missing', '', { headers: {} })).resolves.toBeNull();
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

    test('asks delegate resolvers once per view name across requests', async () => {
        const json = view(MediaTypes.APPLICATION_JSON);
        const resolveViewName = vi.fn(async (): Promise<View | null> => json);
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [MediaTypes.APPLICATION_JSON],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [{ resolveViewName }];

        // Two different per-call requests still share the per-name candidate
        // aggregation — delegates are queried once per name, not per request.
        await resolver.resolveViewName('report', '', { headers: { accept: 'application/json' } });
        await resolver.resolveViewName('report', '', { headers: { accept: 'text/html' } });

        expect(resolveViewName).toHaveBeenCalledTimes(1);
    });

    test('selects the candidate whose media type matches an accepted type', async () => {
        const html = view(MediaTypes.TEXT_HTML);
        const json = view(MediaTypes.APPLICATION_JSON);
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [MediaTypes.APPLICATION_JSON],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [staticResolver(html), staticResolver(json)];

        await expect(resolver.resolveViewName('page', '', { headers: { accept: 'application/json' } })).resolves.toBe(
            json
        );
    });

    test('returns null (406) when no candidate matches the accepted type', async () => {
        const html = view(MediaTypes.TEXT_HTML);
        const fallback = view(MediaTypes.APPLICATION_JSON);
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [MediaTypes.APPLICATION_JSON],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [staticResolver(html)];
        resolver.defaultViews = [fallback]; // defaults must NOT mask a 406

        await expect(
            resolver.resolveViewName('page', '', { headers: { accept: 'application/json' } })
        ).resolves.toBeNull();
    });
});

/** A concrete mapping strategy for end-to-end Accept-header tests. */
class AcceptStrategy extends AbstractMappingContentNegotiationStrategy {}

/** Builds a manager with a single mapping strategy over the given types. */
const mappingManager = (map: Map<string, MediaType>): ContentNegotiationManager =>
    new ContentNegotiationManager([new AcceptStrategy(map)]);

describe('ContentNegotiationViewResolver Accept-header negotiation', () => {
    test('honors the highest-priority range across a multi-range Accept header', async () => {
        const html = view(MediaTypes.TEXT_HTML);
        const json = view(MediaTypes.APPLICATION_JSON);
        const txt = view(MediaTypes.TEXT_PLAIN);
        const resolver = new ContentNegotiationViewResolver(
            mappingManager(
                new Map([
                    ['html', MediaTypes.TEXT_HTML],
                    ['json', MediaTypes.APPLICATION_JSON],
                    ['txt', MediaTypes.TEXT_PLAIN],
                ])
            )
        );
        resolver.viewResolvers = [staticResolver(html), staticResolver(json), staticResolver(txt)];

        // `application/json, text/plain, */*` — JSON is listed first (and
        // highest specificity) so it beats HTML despite HTML's registration.
        await expect(
            resolver.resolveViewName('page', '', { headers: { accept: 'application/json, text/plain, */*' } })
        ).resolves.toBe(json);
    });

    test('serves the q-value-preferred type, not the first registered one', async () => {
        const json = view(MediaTypes.APPLICATION_JSON);
        const html = view(MediaTypes.TEXT_HTML);
        const resolver = new ContentNegotiationViewResolver(
            mappingManager(
                new Map([
                    ['json', MediaTypes.APPLICATION_JSON],
                    ['html', MediaTypes.TEXT_HTML],
                ])
            )
        );
        // JSON is registered (and would win under first-registered semantics)
        // but the client prefers HTML.
        resolver.viewResolvers = [staticResolver(json), staticResolver(html)];

        await expect(
            resolver.resolveViewName('page', '', { headers: { accept: 'application/json;q=0.5, text/html;q=1' } })
        ).resolves.toBe(html);
    });

    test('rejects with 406 when no candidate matches any accepted range', async () => {
        const html = view(MediaTypes.TEXT_HTML);
        const resolver = new ContentNegotiationViewResolver(
            mappingManager(
                new Map([
                    ['html', MediaTypes.TEXT_HTML],
                    ['json', MediaTypes.APPLICATION_JSON],
                ])
            )
        );
        resolver.viewResolvers = [staticResolver(html)];

        await expect(
            resolver.resolveViewName('page', '', { headers: { accept: 'application/xml' } })
        ).resolves.toBeNull();
    });
});
