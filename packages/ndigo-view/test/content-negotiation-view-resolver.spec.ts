/**
 * @module ndigo-view
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
    NotAcceptableError,
    PathExtensionContentNegotiationStrategy,
    likeMediaTypeFileExtensionResolver,
} from '../src/content-negotiation-view-resolver';
import { MediaTypes, type MediaType } from '@ndigo/core';
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

    test('throws NotAcceptableError (406) when no candidate matches the accepted type', async () => {
        const html = view(MediaTypes.TEXT_HTML);
        const fallback = view(MediaTypes.APPLICATION_JSON);
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [MediaTypes.APPLICATION_JSON],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [staticResolver(html)];
        resolver.defaultViews = [fallback]; // defaults must NOT mask a 406

        // Pre-fix this returned `null`, which the platform rendered as the
        // same 404 as a missing view. The route/handler resolved — only the
        // representation is unavailable — so it must signal 406 distinctly.
        await expect(
            resolver.resolveViewName('page', '', { headers: { accept: 'application/json' } })
        ).rejects.toBeInstanceOf(NotAcceptableError);
    });

    test('bounds the candidate cache, evicting the oldest names (VIEW-2)', async () => {
        const resolveViewName = vi.fn(async (): Promise<View | null> => view(MediaTypes.APPLICATION_JSON));
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [{ resolveViewName }];

        for (let index = 0; index < 1100; index++) {
            // eslint-disable-next-line no-await-in-loop -- FIFO-eviction assertion needs sequential resolution
            await resolver.resolveViewName(`view-${index}`, '');
        }
        expect(resolveViewName).toHaveBeenCalledTimes(1100);

        // The earliest name was evicted (bounded), so it re-queries the delegate...
        await resolver.resolveViewName('view-0', '');
        expect(resolveViewName).toHaveBeenCalledTimes(1101);

        // ...while a recent name is still cached (no extra delegate call).
        await resolver.resolveViewName('view-1099', '');
        expect(resolveViewName).toHaveBeenCalledTimes(1101);
    });

    test('resolves NUL-bearing (name, language) pairs distinctly (VIEW-3)', async () => {
        const seen: string[] = [];
        const resolver = new ContentNegotiationViewResolver({
            resolveMediaTypes: () => [],
        } as unknown as ContentNegotiationManager);
        resolver.viewResolvers = [
            {
                resolveViewName: async (name, language): Promise<View | null> => {
                    seen.push(`${name}\u0000${String(language ?? '')}`);
                    return view(MediaTypes.APPLICATION_JSON);
                },
            },
        ];

        // eslint-disable-next-line @ndigo/no-unsafe-view-name-literal -- NUL-bearing key probe must reach the resolver
        const first = await resolver.resolveViewName('a\u0000b', '');
        const second = await resolver.resolveViewName('a', '\u0000b');

        // Pre-fix the key `${name}\u0000${language}` collided for these pairs,
        // so the second lookup reused the first view and never queried again.
        expect(seen).toHaveLength(2);
        expect(first).not.toBe(second);

        // A repeat of the first pair is a genuine cache hit.
        // eslint-disable-next-line @ndigo/no-unsafe-view-name-literal -- NUL-bearing cache-hit probe
        await resolver.resolveViewName('a\u0000b', '');
        expect(seen).toHaveLength(2);
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
        ).rejects.toBeInstanceOf(NotAcceptableError);
    });
});

describe('firstServableMediaType shared selection (REU-5)', () => {
    /** Accept header → the media type both the strategy and the resolver must pick. */
    const acceptHeaders: Array<[string, MediaType]> = [
        ['application/json', MediaTypes.APPLICATION_JSON],
        ['application/json;q=0.5, text/html;q=1', MediaTypes.TEXT_HTML],
        ['text/plain;q=0.9, application/json;q=0.8', MediaTypes.TEXT_PLAIN],
        ['*/*', MediaTypes.TEXT_HTML],
        ['text/*', MediaTypes.TEXT_HTML],
    ];

    test('the extension strategy and the resolver final pass pick the same candidate', async () => {
        const registered = new Map<string, MediaType>([
            ['html', MediaTypes.TEXT_HTML],
            ['json', MediaTypes.APPLICATION_JSON],
            ['txt', MediaTypes.TEXT_PLAIN],
        ]);
        const manager = new ContentNegotiationManager([new PathExtensionContentNegotiationStrategy(registered)]);
        const html = view(MediaTypes.TEXT_HTML);
        const json = view(MediaTypes.APPLICATION_JSON);
        const txt = view(MediaTypes.TEXT_PLAIN);

        for (const [accept, expected] of acceptHeaders) {
            // An extensionless path (no `.json`) forces the strategy onto its
            // Accept-hint branch — the shared candidate-vs-range walk.
            const request = { uri: '/page', headers: { accept } };

            // The strategy side (via the manager's Accept bridge) selects...
            const viaStrategy = manager.resolveMediaTypes(request);
            expect(viaStrategy, `strategy for ${JSON.stringify(accept)}`).toEqual([expected]);

            // ...and the resolver's final negotiation pass must agree.
            const resolver = new ContentNegotiationViewResolver(manager);
            resolver.viewResolvers = [staticResolver(html), staticResolver(json), staticResolver(txt)];
            // eslint-disable-next-line no-await-in-loop -- sequential table assertion per Accept header
            const chosen = await resolver.resolveViewName('page', '', request);
            expect(chosen?.mediaType, `resolver for ${JSON.stringify(accept)}`).toEqual(expected);
        }
    });
});
