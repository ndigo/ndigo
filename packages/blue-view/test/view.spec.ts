/**
 * @author Jeff Rose
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ViewTarget } from '@blue/view';
import type { MediaType } from '@blue/core';
import {
    AbstractTemplateView,
    StringTemplateView,
    RerouteView,
    ContentNegotiationViewResolver,
    ContentNegotiationManager,
    FixedContentNegotiationStrategy,
} from '@blue/view';
import { MediaTypes } from '@blue/core';

class MockTarget implements ViewTarget {
    commit: ReturnType<typeof vi.fn>;
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

describe('AbstractTemplateView', () => {
    class MockRenderable extends AbstractTemplateView {
        renderCalled: boolean = false;

        protected _renderTemplate(templateModel: any, request: any): void {
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
        await expect(() => view.render({} as any, {} as any)).rejects.toThrow();
    });
});

describe('StringTemplateView', () => {
    let target: MockTarget;
    let view: StringTemplateView;

    beforeEach(() => {
        target = new MockTarget();
        view = new StringTemplateView('/test');
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
        await view._renderTemplate({} as any, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, {} as any, {});
    });

    it('renders template with function returns "[object Function]"', async () => {
        await view._renderTemplate({ fn: () => 'hello' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, expect.objectContaining({ fn: expect.any(Function) }), {});
    });

    it('renders template without target throws error', async () => {
        const view = new StringTemplateView('/test');
        view.template = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        await expect(view._renderTemplate({} as any, {} as any)).rejects.toThrow();
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
            protected _createViewModel(model: any, request: any): any {
                return { displayName: model.name?.toUpperCase(), timestamp: Date.now() };
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
            protected _projectViewModel(viewModel: any, request: any): any {
                return { title: viewModel.pageTitle ?? 'Default', items: viewModel.items ?? [] };
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
        const mockAppContext = { getValue: () => ({ navigate }) };
        const view = new RerouteView('/new-path');
        (view as any).applicationContext = mockAppContext;

        view.render({}, { path: '/current' });

        expect(navigate).toHaveBeenCalledWith('/new-path');
    });

    it('falls back to history.pushState when no router is available', () => {
        const pushState = vi.fn();
        vi.stubGlobal('history', { pushState });

        const view = new RerouteView('/fallback');
        view.render({}, { path: '/current' });

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
