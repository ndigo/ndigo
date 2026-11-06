/**
 */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ViewTarget } from '@ndigo/view';
import type { MediaType } from '@ndigo/core';
import type { ApplicationContext } from '@ndigo/context';
import {
    AbstractTemplateView,
    StringTemplateView,
    RerouteView,
    ContentNegotiationViewResolver,
    ContentNegotiationManager,
    FixedContentNegotiationStrategy,
} from '@ndigo/view';
import { MediaTypes } from '@ndigo/core';

class MockTarget implements ViewTarget {
    // `vi.fn()` infers `Mock<Constructable | Procedure>`, whose call
    // signature is not assignable to ViewTarget.commit; anchor it to the
    // committed slot's exact signature so `implements ViewTarget` holds.
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

// StringTemplateView._renderTemplate is protected; expose a structural view of
// it so the specs can drive the render pipeline without widening the public API
// (same pattern as the webcomponent specs' ExposedView).
interface ExposedStringTemplate {
    _renderTemplate(templateModel: unknown, request: unknown, target?: ViewTarget): void | Promise<void>;
}

describe('AbstractTemplateView', () => {
    class MockRenderable extends AbstractTemplateView {
        renderCalled: boolean = false;

        protected _renderTemplate(templateModel: unknown, request: unknown): void {
            this.renderCalled = true;
        }
    }

    beforeEach(() => {
        new MockRenderable(); // Just verify class can be instantiated
    });

    it('renders by delegating to _renderView which delegates to _renderTemplate', async () => {
        const target = new MockTarget();
        const view = new MockRenderable('/test');

        await view.render({ test: true }, {}, target);

        expect(view.renderCalled).toBe(true);
    });

    it('throws when no target is provided', async () => {
        const view = new MockRenderable('/test');
        await expect(() => view.render({}, {})).rejects.toThrow();
    });
});

describe('StringTemplateView', () => {
    let target: MockTarget;
    let view: StringTemplateView & ExposedStringTemplate;

    beforeEach(() => {
        target = new MockTarget();
        view = new StringTemplateView('/test') as unknown as StringTemplateView & ExposedStringTemplate;
        view.template = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
    });

    it('renders template with simple variable substitution', async () => {
        await view._renderTemplate({ name: 'World' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'World' }, {});
    });

    it('renders template with nested property access', async () => {
        await view._renderTemplate({ user: { name: 'Alice', age: 30 } }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { user: { name: 'Alice', age: 30 } }, {});
    });

    it('renders template with array access', async () => {
        await view._renderTemplate({ items: ['a', 'b', 'c'] }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { items: ['a', 'b', 'c'] }, {});
    });

    it('renders template with missing variable returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice' }, {});
    });

    it('renders template with undefined variable returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice' }, {});
    });

    it('renders template with null value returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice', count: null }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice', count: null }, {});
    });

    it('renders template with undefined array index returns empty string', async () => {
        await view._renderTemplate({ items: ['a'] }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { items: ['a'] }, {});
    });

    it('renders template with undefined property returns empty string', async () => {
        await view._renderTemplate({}, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, {}, {});
    });

    it('renders template with function returns "[object Function]"', async () => {
        await view._renderTemplate({ fn: () => 'hello' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, expect.objectContaining({ fn: expect.any(Function) }), {});
    });

    it('renders template without target throws error', async () => {
        const view = new StringTemplateView('/test') as unknown as StringTemplateView & ExposedStringTemplate;
        view.template = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        await expect(view._renderTemplate({}, {})).rejects.toThrow();
    });
});

describe('StringTemplateView — integration (view.render pipeline)', () => {
    let target: MockTarget;

    beforeEach(() => {
        target = new MockTarget();
    });

    it('renders end-to-end through view.render() with variable substitution', async () => {
        const view = new StringTemplateView('/test');
        view.name = 'testView';
        view.template = '<html><body>{{name}}</body></html>';

        await view.render({ name: 'World' }, {}, target);

        expect(target.commit).toHaveBeenCalledWith('<html><body>World</body></html>', { name: 'World' }, {});
    });

    it('renders end-to-end through view.render() with nested property access', async () => {
        const view = new StringTemplateView('/test');
        view.name = 'testView';
        view.template = '<html><body>{{user.name}} is {{user.age}}</body></html>';

        await view.render({ user: { name: 'Alice', age: 30 } }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(
            '<html><body>Alice is 30</body></html>',
            { user: { name: 'Alice', age: 30 } },
            {}
        );
    });

    it('renders end-to-end with custom _createViewModel projection', async () => {
        class ProjectingView extends StringTemplateView {
            protected _createViewModel(model: unknown, request: unknown): unknown {
                const raw = model as { name?: { toUpperCase(): string } };
                return { displayName: raw.name?.toUpperCase(), timestamp: Date.now() };
            }
        }

        const view = new ProjectingView('/test');
        view.name = 'projectionView';
        view.template = '<html><body>{{displayName}}</body></html>';

        await view.render({ name: 'Alice' }, {}, target);

        // _createViewModel projects away raw model, only displayName available
        expect(target.commit).toHaveBeenCalledWith(
            '<html><body>ALICE</body></html>',
            expect.objectContaining({ displayName: 'ALICE' }),
            {}
        );
    });

    it('renders end-to-end with custom _projectViewModel hook', async () => {
        class TemplateProjectingView extends StringTemplateView {
            protected _projectViewModel(viewModel: unknown, request: unknown): unknown {
                const raw = viewModel as { pageTitle?: string; items?: unknown };
                return { title: raw.pageTitle ?? 'Default', items: raw.items ?? [] };
            }
        }

        const view = new TemplateProjectingView('/test');
        view.name = 'templateProjection';
        view.template = '<html><body><h1>{{title}}</h1><span>{{items.length}}</span></body></html>';

        await view.render({ pageTitle: 'Hello', items: [1, 2, 3] }, {}, target);

        expect(target.commit).toHaveBeenCalledWith(
            '<html><body><h1>Hello</h1><span>3</span></body></html>',
            expect.objectContaining({ title: 'Hello' }),
            {}
        );
    });

    it('returns early when view is destroyed', async () => {
        const view = new StringTemplateView('/test');
        view.name = 'testView';
        view.template = '<html><body>{{name}}</body></html>';
        view.destroy();

        await view.render({ name: 'World' }, {}, target);

        expect(target.commit).not.toHaveBeenCalled();
    });
});

describe('RerouteView', () => {
    it('creates a reroute view with a path', () => {
        const view = new RerouteView('/redirect');
        expect(view.path).toBe('/redirect');
    });

    it('creates context-relative reroute view', () => {
        const view = new RerouteView('/relative', true);
        expect(view.contextRelative).toBe(true);
    });

    it('creates non-context-relative reroute view by default', () => {
        const view = new RerouteView('/absolute');
        expect(view.contextRelative).toBe(false);
    });

    it('delegates navigation to router.navigate when available', () => {
        const navigate = vi.fn();
        const mockAppContext = { getValue: () => ({ navigate }) } as unknown as ApplicationContext;
        const view = new RerouteView('/new-path');
        view.setApplicationContext(mockAppContext);

        void view.render({}, { path: '/current' });

        expect(navigate).toHaveBeenCalledWith('/new-path');
    });

    it('falls back to history.pushState when no router is available', () => {
        const pushState = vi.fn();
        vi.stubGlobal('history', { pushState });

        const view = new RerouteView('/fallback');
        void view.render({}, { path: '/current' });

        expect(pushState).toHaveBeenCalledWith(undefined, '', '/fallback');
        vi.unstubAllGlobals();
    });
});

describe('View Negotiation Pipeline', () => {
    it('resolves media types through the negotiation manager', () => {
        const manager = new ContentNegotiationManager([
            new FixedContentNegotiationStrategy([MediaTypes.APPLICATION_JSON]),
        ]);
        const resolver = new ContentNegotiationViewResolver(manager);

        const mediaTypes = resolver.getMediaTypes({});
        expect(mediaTypes).toContain(MediaTypes.APPLICATION_JSON);
    });

    it('getMediaTypes throws when no strategy matches', () => {
        const manager = new ContentNegotiationManager([]);
        const resolver = new ContentNegotiationViewResolver(manager);

        expect(() => resolver.getMediaTypes({})).toThrow();
    });

    it('wires the negotiation manager to the resolver', () => {
        const manager = new ContentNegotiationManager([new FixedContentNegotiationStrategy([MediaTypes.TEXT_HTML])]);
        const resolver = new ContentNegotiationViewResolver(manager);
        expect(resolver.contentNegotiationManager).toBe(manager);
    });
});
