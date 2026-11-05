/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { MediaType, MediaTypes } from '@ndigo/core';
import {
    ContentNegotiationManager,
    PathExtensionContentNegotiationStrategy,
    AbstractMappingContentNegotiationStrategy,
    FixedContentNegotiationStrategy,
    StringTemplateView,
    ViewTarget,
} from '@ndigo/view';

// StringTemplateView._renderTemplate is protected; expose a structural view of
// it so the specs can drive the render pipeline without widening the public API
// (same pattern as the webcomponent specs' ExposedView).
interface ExposedStringTemplate {
    _renderTemplate(templateModel: unknown, request: unknown, target?: ViewTarget): void | Promise<void>;
}

describe('ContentNegotiationManager', () => {
    let manager: ContentNegotiationManager;
    let resolver: PathExtensionContentNegotiationStrategy;

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

    it('getAllFileExtensions returns unique extensions in order', () => {
        const result = manager.getAllFileExtensions();
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

    it('bridges a canonically-cased Accept header into mediaTypeHint (HT-9)', () => {
        class TestMappingStrategy extends AbstractMappingContentNegotiationStrategy {}
        const strategy = new TestMappingStrategy(
            new Map<string, MediaType>([
                ['json', MediaTypes.APPLICATION_JSON],
                ['xml', MediaTypes.APPLICATION_XML],
            ])
        );
        const headerManager = new ContentNegotiationManager([strategy]);

        const result = headerManager.resolveMediaTypes({ headers: { Accept: 'application/xml' } });

        expect(result).toEqual([MediaTypes.APPLICATION_XML]);
    });

    it('joins multi-value Accept header entries into mediaTypeHint (HT-9)', () => {
        class TestMappingStrategy extends AbstractMappingContentNegotiationStrategy {}
        const strategy = new TestMappingStrategy(
            new Map<string, MediaType>([
                ['json', MediaTypes.APPLICATION_JSON],
                ['xml', MediaTypes.APPLICATION_XML],
            ])
        );
        const headerManager = new ContentNegotiationManager([strategy]);

        const result = headerManager.resolveMediaTypes({
            headers: { accept: ['application/json', 'application/xml'] },
        });

        expect(result.map((mediaType) => mediaType.baseType)).toEqual(['application/json', 'application/xml']);
    });

    it('does not mutate the caller request; a reused request re-derives Accept (DSV-VIEW-2)', () => {
        class TestMappingStrategy extends AbstractMappingContentNegotiationStrategy {}
        const strategy = new TestMappingStrategy(
            new Map<string, MediaType>([
                ['json', MediaTypes.APPLICATION_JSON],
                ['xml', MediaTypes.APPLICATION_XML],
            ])
        );
        const headerManager = new ContentNegotiationManager([strategy]);
        const request: { headers: Record<string, string>; mediaTypeHint?: string } = {
            headers: { accept: 'application/xml' },
        };

        expect(headerManager.resolveMediaTypes(request)).toEqual([MediaTypes.APPLICATION_XML]);
        // Pre-fix the bridge wrote `mediaTypeHint` onto the request, so the
        // second call below resolved against the stale XML hint.
        expect(request.mediaTypeHint).toBeUndefined();

        request.headers.accept = 'application/json';
        expect(headerManager.resolveMediaTypes(request)).toEqual([MediaTypes.APPLICATION_JSON]);
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

    it('returns the parsed accepted range even when the server does not register it', () => {
        class TestMappingStrategy extends AbstractMappingContentNegotiationStrategy {
            // Concrete subclass for testing the abstract class
        }

        const mediaTypes = new Map<string, MediaType>([['json', MediaTypes.APPLICATION_JSON]]);
        const strategy = new TestMappingStrategy(mediaTypes);

        // The hint names an unregistered type — the strategy still reports the
        // client's requested range (in priority order); the resolver translates
        // "accepted but unservable" into a 406 rather than a silent default.
        const result = strategy.resolveMediaTypes({ mediaTypeHint: 'application/xml' });
        expect(result).toEqual([MediaTypes.APPLICATION_XML]);
    });

    it('orders multi-range hints by q-value with header order breaking ties', () => {
        class TestMappingStrategy extends AbstractMappingContentNegotiationStrategy {
            // Concrete subclass for testing the abstract class
        }

        const mediaTypes = new Map<string, MediaType>([['json', MediaTypes.APPLICATION_JSON]]);
        const strategy = new TestMappingStrategy(mediaTypes);

        const result = strategy.resolveMediaTypes({ mediaTypeHint: 'application/json;q=0.5, text/html;q=1' });
        expect(result.map((mediaType) => mediaType.baseType)).toEqual(['text/html', 'application/json']);
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
            commit: Mock<ViewTarget['commit']>;
            constructor() {
                this.commit = vi.fn();
            }

            prepare(): void {
                // do nothing
            }

            clear(): void {
                // do nothing
            }
        }

        const target = new TestTarget();
        const view = new StringTemplateView('/test') as unknown as StringTemplateView & ExposedStringTemplate;
        view.template = TEMPLATE;
        await view._renderTemplate({ name: 'World' }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(TEMPLATE, { name: 'World' }, {});
    });

    it('renders template with nested property access', async () => {
        class TestTarget {
            commit: Mock<ViewTarget['commit']>;
            constructor() {
                this.commit = vi.fn();
            }

            prepare(): void {
                // do nothing
            }

            clear(): void {
                // do nothing
            }
        }

        const target = new TestTarget();
        const view = new StringTemplateView('/test') as unknown as StringTemplateView & ExposedStringTemplate;
        view.template = TEMPLATE;
        await view._renderTemplate({ user: { name: 'Alice' } }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(TEMPLATE, { user: { name: 'Alice' } }, {});
    });

    it('renders template with array access', async () => {
        class TestTarget {
            commit: Mock<ViewTarget['commit']>;
            constructor() {
                this.commit = vi.fn();
            }

            prepare(): void {
                // do nothing
            }

            clear(): void {
                // do nothing
            }
        }

        const target = new TestTarget();
        const view = new StringTemplateView('/test') as unknown as StringTemplateView & ExposedStringTemplate;
        view.template = TEMPLATE;
        await view._renderTemplate({ items: ['a', 'b', 'c'] }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(TEMPLATE, { items: ['a', 'b', 'c'] }, {});
    });

    it('renders template without target throws error', async () => {
        const view = new StringTemplateView('/test') as unknown as StringTemplateView & ExposedStringTemplate;
        view.template = TEMPLATE;
        await expect(view._renderTemplate({}, {})).rejects.toThrow();
    });
});
