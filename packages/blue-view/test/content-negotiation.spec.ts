import { describe, it, expect, beforeEach } from 'vitest';
import { ContentType, MediaType } from '@blue/core';
import { ContentNegotiationManager, PathExtensionContentNegotiationStrategy, AbstractMappingContentNegotiationStrategy, FixedContentNegotiationStrategy } from './content-negotiation-view-resolver';

describe('ContentNegotiationManager', () => {
    let manager: ContentNegotiationManager;
    let resolver: any; // Will be a mock

    beforeEach(() => {
        const mediaTypes = new Map<string, MediaType>([
            ['json', ContentType.JSON],
            ['xml', ContentType.XML],
            ['txt', ContentType.TEXT_PLAIN],
        ]);
        resolver = new (global as any).MappingMediaTypeFileExtensionResolver(mediaTypes);
        manager = new ContentNegotiationManager([
            resolver,
            new FixedContentNegotiationStrategy([ContentType.JSON, ContentType.HTML]),
        ]);
    });

    it('getAllFileExtenstions returns unique extensions in order', () => {
        const result = manager.getAllFileExtenstions();
        expect(result).toEqual(['json', 'xml', 'txt']);
    });

    it('resolveFileExtensions returns extensions from first matching resolver', () => {
        const result = manager.resolveFileExtensions(ContentType.JSON);
        expect(result).toEqual(['json']);
    });

    it('resolveMediaTypes returns media types from first strategy that matches', () => {
        // First strategy is the mapping resolver, which doesn't implement resolveMediaTypes via get, 
        // but AbstractMapping...Strategy does delegate to getAllMediaTypes()
        const result = manager.resolveMediaTypes({});
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(ContentType.JSON);
    });

    it('resolveMediaTypes throws when no strategy matches', () => {
        const emptyManager = new ContentNegotiationManager([]);
        expect(() => emptyManager.resolveMediaTypes({})).toThrow();
    });
});

describe('PathExtensionContentNegotiationStrategy', () => {
    it('resolves media type from path extension', () => {
        const mediaTypes = new Map<string, MediaType>([
            ['json', ContentType.JSON],
        ]);
        const strategy = new PathExtensionContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ uri: '/api/data.json?query=1' });
        expect(result).toEqual([ContentType.JSON]);
    });

    it('returns empty when path has no extension', () => {
        const mediaTypes = new Map<string, MediaType>();
        const strategy = new PathExtensionContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ uri: '/api/data' });
        expect(result).toEqual([]);
    });

    it('returns empty when path is undefined', () => {
        const mediaTypes = new Map<string, MediaType>();
        const strategy = new PathExtensionContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({});
        expect(result).toEqual([]);
    });

    it('handles case-insensitive extensions', () => {
        const mediaTypes = new Map<string, MediaType>([
            ['JSON', ContentType.JSON],
        ]);
        const strategy = new PathExtensionContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ uri: '/data.json' });
        expect(result).toEqual([ContentType.JSON]);
    });
});

describe('AbstractMappingContentNegotiationStrategy', () => {
    it('resolves all media types when no hint is provided', () => {
        const mediaTypes = new Map<string, MediaType>([
            ['json', ContentType.JSON],
            ['xml', ContentType.XML],
        ]);
        const strategy = new (global as any).AbstractMappingContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({});
        expect(result).toHaveLength(2);
    });

    it('filters by mediaTypeHint when provided', () => {
        const mediaTypes = new Map<string, MediaType>([
            ['json', ContentType.JSON],
            ['xml', ContentType.XML],
        ]);
        const strategy = new (global as any).AbstractMappingContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ mediaTypeHint: 'application/json' });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(ContentType.JSON);
    });

    it('returns all types when hint doesn't match any', () => {
        const mediaTypes = new Map<string, MediaType>([
            ['json', ContentType.JSON],
        ]);
        const strategy = new (global as any).AbstractMappingContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ mediaTypeHint: 'application/xml' });
        expect(result).toHaveLength(1);
    });
});

describe('FixedContentNegotiationStrategy', () => {
    it('returns configured media types regardless of request', () => {
        const strategy = new FixedContentNegotiationStrategy([ContentType.JSON, ContentType.HTML]);

        const result = strategy.resolveMediaTypes({});
        expect(result).toEqual([ContentType.JSON, ContentType.HTML]);
    });

    it('accepts single media type and wraps in array', () => {
        const strategy = new FixedContentNegotiationStrategy(ContentType.JSON);

        const result = strategy.resolveMediaTypes({});
        expect(result).toEqual([ContentType.JSON]);
    });
});

describe('StringTemplateView', () => {
    it('renders template with variable substitution', async () => {
        class TestTarget {
            commit: jest.fn();
        }
        
        const target = new TestTarget();
        const view = new StringTemplateView('/test');
        await view._renderTemplate({ name: 'World' }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(
            '<!DOCTYPE html>\n<html><body>Test Template View</body></html>',
            { name: 'World' },
            target
        );
    });

    it('renders template with nested property access', async () => {
        class TestTarget {
            commit: jest.fn();
        }

        const target = new TestTarget();
        const view = new StringTemplateView('/test');
        await view._renderTemplate({ user: { name: 'Alice' } }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(
            '<!DOCTYPE html>\n<html><body>Test Template View</body></html>',
            { user: { name: 'Alice' } },
            target
        );
    });

    it('renders template with array access', async () => {
        class TestTarget {
            commit: jest.fn();
        }

        const target = new TestTarget();
        const view = new StringTemplateView('/test');
        await view._renderTemplate({ items: ['a', 'b', 'c'] }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(
            '<!DOCTYPE html>\n<html><body>Test Template View</body></html>',
            { items: ['a', 'b', 'c'] },
            target
        );
    });

    it('renders template without target throws error', () => {
        const view = new StringTemplateView('/test');
        expect(() => view._renderTemplate({} as any, {} as any)).toThrow();
    });
});