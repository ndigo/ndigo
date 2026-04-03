import { describe, expect, it, beforeEach, vi } from 'vitest';
import { IllegalStateError, MediaTypes } from '@blue/core';
import type { DOMProvider } from '@blue/dom';
import { LinkedomDOMProvider } from '@blue/dom';
import { StaticModel } from '@blue/reactive';
import type { ViewTarget } from '@blue/view';
import { Page } from '../src/page';
import { WicketView } from '../src/wicket-view';

let lastPage: TestPage | null = null;

class TestPage extends Page<any> {
    initializeCalls = 0;
    configureCalls = 0;
    renderComponentCalls = 0;
    detachCalls = 0;
    renderPageCalls = 0;
    renderDom: DOMProvider | null = null;
    renderContainer: Element | DocumentFragment | null = null;

    constructor(id: string, model?: StaticModel<any>) {
        super(id, model);
        lastPage = this;
    }

    protected onInitialize(): void {
        this.initializeCalls += 1;
    }

    configure(): void {
        this.configureCalls += 1;
        super.configure();
    }

    renderComponent(dom: unknown, container: unknown): void {
        this.renderComponentCalls += 1;
        super.renderComponent(dom, container);
    }

    detach(): void {
        this.detachCalls += 1;
        super.detach();
    }

    renderPage(dom: DOMProvider, container: Element | DocumentFragment): void {
        this.renderPageCalls += 1;
        this.renderDom = dom;
        this.renderContainer = container;
        super.renderPage(dom, container);
    }
}

describe('WicketView', () => {
    beforeEach(() => {
        lastPage = null;
    });

    it('starts with destroyed set to false', () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);

        expect(view.destroyed).toBe(false);
    });

    it('sets the media type to text/html with UTF-8 charset', () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);

        expect(view.mediaType.type).toBe(MediaTypes.TEXT_HTML.type);
        expect(view.mediaType.subtype).toBe(MediaTypes.TEXT_HTML.subtype);
        expect(view.mediaType.parameters.charset).toBe('UTF-8');
    });

    it('exposes Symbol.toStringTag', () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);

        expect(view[Symbol.toStringTag]).toBe('WicketView');
        expect(Object.prototype.toString.call(view)).toBe('[object WicketView]');
    });

    it('constructs a page and runs the full render lifecycle', async () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);
        const target: ViewTarget = {
            prepare: vi.fn().mockResolvedValue(undefined),
            commit: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
        };
        const model = { name: 'Alpha' };
        const request = { path: '/index' };

        await view.render(model, request, target);

        expect(target.prepare).toHaveBeenCalledWith(request);
        expect(target.commit).toHaveBeenCalledTimes(1);
        expect(lastPage).not.toBeNull();
        expect(lastPage?.id).toBe('page');
        expect(lastPage?.model).toBeInstanceOf(StaticModel);
        expect((lastPage?.model as StaticModel<any>).get()).toBe(model);
        expect(lastPage?.initializeCalls).toBe(1);
        expect(lastPage?.renderPageCalls).toBe(1);
        expect(lastPage?.configureCalls).toBe(1);
        expect(lastPage?.renderComponentCalls).toBe(1);
        expect(lastPage?.detachCalls).toBe(1);
        expect(lastPage?.renderDom).toBe(dom);

        const [fragment, committedModel, committedRequest] = (target.commit as any).mock.calls[0];
        expect(fragment).toBe(lastPage?.renderContainer);
        expect(fragment.nodeType).toBe(11);
        expect(committedModel).toBe(model);
        expect(committedRequest).toBe(request);
    });

    it('throws when rendering after being destroyed', async () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);
        const target = { prepare: vi.fn(), commit: vi.fn(), clear: vi.fn() } as ViewTarget;

        view.destroy();

        await expect(view.render({}, {}, target)).rejects.toThrow(IllegalStateError);
    });

    it('throws when rendering without a target', async () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);

        await expect(view.render({}, {})).rejects.toThrow('WicketView requires a ViewTarget to render.');
    });

    it('passes request and model to the target lifecycle', async () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);
        const target: ViewTarget = {
            prepare: vi.fn().mockResolvedValue(undefined),
            commit: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
        };
        const model = { ready: true };
        const request = { path: '/details' };

        await view.render(model, request, target);

        expect(target.prepare).toHaveBeenCalledWith(request);
        const [fragment, committedModel, committedRequest] = (target.commit as any).mock.calls[0];
        expect(fragment.nodeType).toBe(11);
        expect(committedModel).toBe(model);
        expect(committedRequest).toBe(request);
    });

    it('sets destroyed to true when destroy is called', () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);

        view.destroy();

        expect(view.destroyed).toBe(true);
    });

    it('prevents future renders after destroy', async () => {
        const dom = new LinkedomDOMProvider();
        const view = new WicketView(TestPage, dom);
        const target: ViewTarget = {
            prepare: vi.fn().mockResolvedValue(undefined),
            commit: vi.fn().mockResolvedValue(undefined),
            clear: vi.fn(),
        };

        view.destroy();

        await expect(view.render({ value: 1 }, { path: '/blocked' }, target)).rejects.toThrow(
            'Cannot render a destroyed WicketView.'
        );
    });
});
