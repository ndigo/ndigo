import { describe, expect, it, vi } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { MediaTypes } from '@blue/core';
import { Page } from '../src/page';
import { WicketView } from '../src/wicket-view';
import { WicketViewEngine } from '../src/wicket-view-engine';

class TestPage extends Page {
    // no extra behavior needed for rendering
}

describe('WicketViewEngine', () => {
    it('exposes Symbol.toStringTag', () => {
        const engine = new WicketViewEngine();

        expect(Object.prototype.toString.call(engine)).toBe('[object WicketViewEngine]');
    });

    it('delegates render to the view with model, route, and target', async () => {
        const engine = new WicketViewEngine();
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);
        const target = {
            prepare: vi.fn(),
            commit: vi.fn(),
            clear: vi.fn(),
        };
        const route = { path: '/test' };
        const model = { id: 1 };
        const renderSpy = vi.spyOn(view, 'render').mockResolvedValue();

        await engine.render(view, model, target, route);

        expect(renderSpy).toHaveBeenCalledWith(model, route, target);
    });

    it('throws TypeError when view is not a WicketView', async () => {
        const engine = new WicketViewEngine();
        const target = {
            prepare: vi.fn(),
            commit: vi.fn(),
            clear: vi.fn(),
        };

        await expect(engine.render({} as WicketView, {}, target, {} as any)).rejects.toThrow(TypeError);
        await expect(engine.render({} as WicketView, {}, target, {} as any)).rejects.toThrow(
            'WicketViewEngine can only render WicketView instances.'
        );
    });

    it('throws TypeError for a plain View implementation', async () => {
        const engine = new WicketViewEngine();
        const target = {
            prepare: vi.fn(),
            commit: vi.fn(),
            clear: vi.fn(),
        };
        const plainView = {
            mediaType: MediaTypes.TEXT_HTML,
            render: vi.fn(),
        };

        await expect(engine.render(plainView as any, {}, target, {} as any)).rejects.toThrow(TypeError);
    });

    it('renders a real WicketView with a mocked ViewTarget', async () => {
        const engine = new WicketViewEngine();
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);
        const target = {
            prepare: vi.fn().mockResolvedValue(undefined),
            commit: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn().mockResolvedValue(undefined),
        };
        const route = { path: '/wicket' };
        const model = { title: 'Hello' };

        await engine.render(view, model, target, route);

        expect(target.prepare).toHaveBeenCalledWith(route);
        expect(target.commit).toHaveBeenCalledWith(expect.any(Object), model, route);

        const [fragment] = target.commit.mock.calls[0];
        expect(fragment).toMatchObject({ nodeType: 11 });
    });
});
