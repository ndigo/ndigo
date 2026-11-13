import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route } from '@ndigo/router';
import type { ViewTargetingContext } from '@ndigo/view';
import { AttributeViewTargeter } from '../src/attribute-view-targeter';
import { DOMElementViewTarget } from '../src/engine';
import { NameViewTargeter } from '../src/name-view-targeter';
import { RouteViewTargeter } from '../src/route-view-targeter';
import { SelectorViewTargeter, idSelector } from '../src/selector-view-targeter';

const route = (path: string, attributes: Record<string, unknown> = {}): Route =>
    ({ path, attributes }) as unknown as Route;

const context = (overrides: Partial<ViewTargetingContext> = {}): ViewTargetingContext => ({
    route: route('/'),
    viewName: null,
    view: null,
    model: null,
    language: 'en',
    ...overrides,
});

const mount = (id: string): HTMLElement => {
    const element = document.createElement('div');
    element.id = id;
    document.body.append(element);
    return element;
};

describe('SelectorViewTargeter', () => {
    beforeEach(() => {
        document.body.replaceChildren();
    });

    it('creates a target for the selected element', () => {
        const host = mount('main');
        const targeter = new SelectorViewTargeter(() => '#main');

        const target = targeter.resolveViewTarget(context());

        expect(target).not.toBeNull();
        expect((target as DOMElementViewTarget).container).toBe(host);
    });

    it('reuses one target instance per selector', () => {
        mount('main');
        const targeter = new SelectorViewTargeter(() => '#main');

        const first = targeter.resolveViewTarget(context()),
            second = targeter.resolveViewTarget(context());

        expect(first).toBe(second);
    });

    it('caches by selector, creating distinct targets per destination', () => {
        mount('one');
        mount('two');
        const selector = vi.fn<(context: ViewTargetingContext) => string>().mockReturnValue('#one'),
            targeter = new SelectorViewTargeter(selector);

        const first = targeter.resolveViewTarget(context());
        selector.mockReturnValue('#two');

        expect(targeter.resolveViewTarget(context())).not.toBe(first);
    });

    it('declines when the selector matches nothing', () => {
        const targeter = new SelectorViewTargeter(() => '#missing');

        expect(targeter.resolveViewTarget(context())).toBeNull();
    });

    it('declines for a detached element', () => {
        const host = document.createElement('div');
        host.id = 'detached';
        const targeter = new SelectorViewTargeter(() => '#detached');

        expect(host.isConnected).toBe(false);
        expect(targeter.resolveViewTarget(context())).toBeNull();
    });

    it('declines a malformed selector instead of throwing', () => {
        const targeter = new SelectorViewTargeter(() => '#bad[');

        expect(() => targeter.resolveViewTarget(context())).not.toThrow();
        expect(targeter.resolveViewTarget(context())).toBeNull();
    });

    it('declines when the selector function throws', () => {
        const targeter = new SelectorViewTargeter(() => {
            throw new Error('selector bug');
        });

        expect(targeter.resolveViewTarget(context())).toBeNull();
    });

    it('declines empty and non-string selectors', () => {
        expect(new SelectorViewTargeter(() => '').resolveViewTarget(context())).toBeNull();
        expect(new SelectorViewTargeter(() => undefined).resolveViewTarget(context())).toBeNull();
    });

    it('applies a context stored before the first render to later targets', () => {
        mount('main');
        const setContext = vi.spyOn(DOMElementViewTarget.prototype, 'setApplicationContext'),
            targeter = new SelectorViewTargeter(() => '#main'),
            applicationContext = { emit: vi.fn() } as never;

        // No target exists yet: forwarding alone would lose the context.
        targeter.setApplicationContext(applicationContext);
        targeter.resolveViewTarget(context());

        expect(setContext).toHaveBeenCalledWith(applicationContext);
        setContext.mockRestore();
    });

    it('destroys cached targets on destroy', () => {
        mount('main');
        const targeter = new SelectorViewTargeter(() => '#main'),
            target = targeter.resolveViewTarget(context()) as DOMElementViewTarget;

        targeter.destroy();

        expect(target.destroyed).toBe(true);
        expect(targeter.destroyed).toBe(true);
        expect(targeter.resolveViewTarget(context())).toBeNull();
    });

    it('mounts into a shadow root when configured', () => {
        const host = mount('shadowed');
        const targeter = new SelectorViewTargeter(() => '#shadowed', { mount: 'shadow' });

        targeter.resolveViewTarget(context());

        expect(host.shadowRoot).not.toBeNull();
    });
});

describe('idSelector', () => {
    it('builds an escaped id selector', () => {
        expect(idSelector('site-footer')).toBe('#site-footer');
        expect(idSelector('a b')).toBe('#a\\ b');
    });
});

describe('NameViewTargeter', () => {
    beforeEach(() => {
        document.body.replaceChildren();
    });

    it('maps a view name to a selector', () => {
        const host = mount('site-footer');
        const targeter = new NameViewTargeter({ footer: '#site-footer' });

        const target = targeter.resolveViewTarget(context({ viewName: 'footer' }));

        expect((target as DOMElementViewTarget).container).toBe(host);
    });

    it('declines an unmapped view name', () => {
        const targeter = new NameViewTargeter({ footer: '#site-footer' });

        expect(targeter.resolveViewTarget(context({ viewName: 'other' }))).toBeNull();
        expect(targeter.resolveViewTarget(context())).toBeNull();
    });

    it('supports the convention form through idSelector', () => {
        mount('hello');
        const targeter = new NameViewTargeter(idSelector);

        expect(targeter.resolveViewTarget(context({ viewName: 'hello' }))).not.toBeNull();
    });

    it('does not interpolate a view name into selector text', () => {
        // A view name is a lookup key; an unknown name is a decline, never a
        // selector that could escape the map.
        const targeter = new NameViewTargeter({ footer: '#site-footer' });

        expect(targeter.resolveViewTarget(context({ viewName: 'body, script' }))).toBeNull();
    });
});

describe('RouteViewTargeter', () => {
    beforeEach(() => {
        document.body.replaceChildren();
    });

    it('matches glob patterns in declaration order', () => {
        mount('sidebar');
        mount('app');
        const targeter = new RouteViewTargeter({ '/report/**': '#sidebar', '/**': '#app' });

        expect(targeter.resolveViewTarget(context({ route: route('/report/q1') }))).not.toBeNull();
        const fallback = targeter.resolveViewTarget(context({ route: route('/other') })) as DOMElementViewTarget;

        expect((fallback.container as Element).id).toBe('app');
    });

    it('declines when no pattern matches', () => {
        const targeter = new RouteViewTargeter({ '/report/**': '#sidebar' });

        expect(targeter.resolveViewTarget(context({ route: route('/other') }))).toBeNull();
    });

    it('declines a pattern whose selector is missing', () => {
        const targeter = new RouteViewTargeter({ '/report/**': '#nowhere' });

        expect(targeter.resolveViewTarget(context({ route: route('/report') }))).toBeNull();
    });
});

describe('AttributeViewTargeter', () => {
    beforeEach(() => {
        document.body.replaceChildren();
    });

    it('reads the configured route attribute', () => {
        const host = mount('footer');
        const targeter = new AttributeViewTargeter();

        const target = targeter.resolveViewTarget(context({ route: route('/', { viewTarget: '#footer' }) }));

        expect((target as DOMElementViewTarget).container).toBe(host);
    });

    it('supports a custom attribute key', () => {
        mount('footer');
        const targeter = new AttributeViewTargeter({ attribute: 'region' });

        expect(targeter.resolveViewTarget(context({ route: route('/', { region: '#footer' }) }))).not.toBeNull();
        expect(targeter.resolveViewTarget(context({ route: route('/', { viewTarget: '#footer' }) }))).toBeNull();
    });

    it('declines when the attribute is absent or not a string', () => {
        const targeter = new AttributeViewTargeter();

        expect(targeter.resolveViewTarget(context())).toBeNull();
        expect(targeter.resolveViewTarget(context({ route: route('/', { viewTarget: { bad: true } }) }))).toBeNull();
    });
});
