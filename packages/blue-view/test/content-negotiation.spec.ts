import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MediaType, MediaTypes } from '@blue/core';
import {
    ContentNegotiationManager,
    PathExtensionContentNegotiationStrategy,
    AbstractMappingContentNegotiationStrategy,
    FixedContentNegotiationStrategy,
    StringTemplateView,
} from '@blue/view';

describe('ContentNegotiationManager', () => {
    let manager: ContentNegotiationManager;
    let resolver: any; // Will be a mock

    beforeEach(() => {
        const mediaTypes = new Map<string, MediaType>([
            ['json', MediaTypes.APPLICATION_JSON],
            ['xml', MediaTypes.APPLICATION_XML],
            ['txt', MediaTypes.TEXT_PLAIN],
        ]);
        resolver = new PathExtensionContentNegotiationStrategy(mediaTypes);
        manager = new ContentNegotiationManager([
            resolver,
            new FixedContentNegotiationStrategy([MediaTypes.APPLICATION_JSON, MediaTypes.TEXT_HTML]),
        ]);
    });

    it('getAllFileExtenstions returns unique extensions in order', () => {
        const result = manager.getAllFileExtenstions();
        expect(result).toEqual(['json', 'xml', 'txt']);
    });

    it('resolveFileExtensions returns extensions from first matching resolver', () => {
        const result = manager.resolveFileExtensions(MediaTypes.APPLICATION_JSON);
        expect(result).toEqual(['json']);
    });

    it('resolveMediaTypes returns media types from first strategy that matches', () => {
        const result = manager.resolveMediaTypes({});
        expect(result).toEqual([MediaTypes.APPLICATION_JSON, MediaTypes.TEXT_HTML]);
    });

    it('resolveMediaTypes throws when no strategy matches', () => {
        const emptyManager = new ContentNegotiationManager([]);
        expect(() => emptyManager.resolveMediaTypes({})).toThrow();
    });
});

describe('PathExtensionContentNegotiationStrategy', () => {
    it('resolves media type from path extension', () => {
        const mediaTypes = new Map<string, MediaType>([['json', MediaTypes.APPLICATION_JSON]]);
        const strategy = new PathExtensionContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ uri: '/api/data.json?query=1' });
        expect(result).toEqual([MediaTypes.APPLICATION_JSON]);
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
        const mediaTypes = new Map<string, MediaType>([['JSON', MediaTypes.APPLICATION_JSON]]);
        const strategy = new PathExtensionContentNegotiationStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ uri: '/data.json' });
        expect(result).toEqual([MediaTypes.APPLICATION_JSON]);
    });
});

describe('AbstractMappingContentNegotiationStrategy', () => {
    it('resolves all media types when no hint is provided', () => {
        class TestMappingStrategy extends AbstractMappingContentNegotiationStrategy {
            // Concrete subclass for testing the abstract class
        }

        const mediaTypes = new Map<string, MediaType>([
            ['json', MediaTypes.APPLICATION_JSON],
            ['xml', MediaTypes.APPLICATION_XML],
        ]);
        const strategy = new TestMappingStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({});
        expect(result).toHaveLength(2);
    });

    it('filters by mediaTypeHint when provided', () => {
        class TestMappingStrategy extends AbstractMappingContentNegotiationStrategy {
            // Concrete subclass for testing the abstract class
        }

        const mediaTypes = new Map<string, MediaType>([
            ['json', MediaTypes.APPLICATION_JSON],
            ['xml', MediaTypes.APPLICATION_XML],
        ]);
        const strategy = new TestMappingStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ mediaTypeHint: 'application/json' });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(MediaTypes.APPLICATION_JSON);
    });

    it('returns all types when hint does not match any', () => {
        class TestMappingStrategy extends AbstractMappingContentNegotiationStrategy {
            // Concrete subclass for testing the abstract class
        }

        const mediaTypes = new Map<string, MediaType>([['json', MediaTypes.APPLICATION_JSON]]);
        const strategy = new TestMappingStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ mediaTypeHint: 'application/xml' });
        expect(result).toHaveLength(1);
    });
});

describe('FixedContentNegotiationStrategy', () => {
    it('returns configured media types regardless of request', () => {
        const strategy = new FixedContentNegotiationStrategy([MediaTypes.APPLICATION_JSON, MediaTypes.TEXT_HTML]);

        const result = strategy.resolveMediaTypes({});
        expect(result).toEqual([MediaTypes.APPLICATION_JSON, MediaTypes.TEXT_HTML]);
    });

    it('accepts single media type and wraps in array', () => {
        const strategy = new FixedContentNegotiationStrategy(MediaTypes.APPLICATION_JSON);

        const result = strategy.resolveMediaTypes({});
        expect(result).toEqual([MediaTypes.APPLICATION_JSON]);
    });
});

describe('StringTemplateView', () => {
    const TEMPLATE = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';

    it('renders template with variable substitution', async () => {
        class TestTarget {
            commit: ReturnType<typeof vi.fn>;
            constructor() {
                this.commit = vi.fn();
            }
        }

        const target = new TestTarget();
        const view = new StringTemplateView('/test');
        view.template = TEMPLATE;
        await view._renderTemplate({ name: 'World' }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(TEMPLATE, { name: 'World' }, {});
    });

    it('renders template with nested property access', async () => {
        class TestTarget {
            commit: ReturnType<typeof vi.fn>;
            constructor() {
                this.commit = vi.fn();
            }
        }

        const target = new TestTarget();
        const view = new StringTemplateView('/test');
        view.template = TEMPLATE;
        await view._renderTemplate({ user: { name: 'Alice' } }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(TEMPLATE, { user: { name: 'Alice' } }, {});
    });

    it('renders template with array access', async () => {
        class TestTarget {
            commit: ReturnType<typeof vi.fn>;
            constructor() {
                this.commit = vi.fn();
            }
        }

        const target = new TestTarget();
        const view = new StringTemplateView('/test');
        view.template = TEMPLATE;
        await view._renderTemplate({ items: ['a', 'b', 'c'] }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(TEMPLATE, { items: ['a', 'b', 'c'] }, {});
    });

    it('renders template without target throws error', async () => {
        const view = new StringTemplateView('/test');
        view.template = TEMPLATE;
        await expect(view._renderTemplate({} as any, {} as any)).rejects.toThrow();
    });
});
