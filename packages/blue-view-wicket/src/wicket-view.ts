/**
 * @author Jeff Rose
 */
import { IllegalStateError, MediaType, MediaTypes } from '@blue/core';
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { StaticModel } from '@blue/reactive';
import type { View, ViewTarget } from '@blue/view';
import { Page } from './page';

/**
 * Constructor type for Page subclasses.
 */
export type PageConstructor<T = unknown> = new (id: string, model?: ReadableModel<T>) => Page<T>;

/**
 * A view that renders a Wicket {@link Page} component tree.
 *
 * Each render call instantiates the page, runs the full lifecycle
 * (initialize → configure → render → detach), and produces a
 * DocumentFragment that is committed to the view target.
 */
export class WicketView implements View {
    #pageClass: PageConstructor;
    #dom: DOMProvider;
    #destroyed = false;

    get [Symbol.toStringTag](): string {
        return 'WicketView';
    }

    /**
     * The media type produced by this view.
     */
    mediaType: MediaType = MediaTypes.TEXT_HTML!.withCharset('UTF-8');

    /**
     * Whether this view has been destroyed.
     */
    get destroyed(): boolean {
        return this.#destroyed;
    }

    /**
     * Creates a new Wicket view backed by the given Page class.
     *
     * @param pageClass - The constructor of the Page subclass to render.
     * @param dom - The DOM provider used for template parsing and element creation.
     */
    constructor(pageClass: PageConstructor, dom: DOMProvider) {
        this.#pageClass = pageClass;
        this.#dom = dom;
    }

    /**
     * Renders the page into the given view target.
     *
     * @param model - The data model passed to the page.
     * @param request - The current request (route).
     * @param target - The view target to render into.
     * @throws {IllegalStateError} When the view has been destroyed.
     * @throws {IllegalStateError} When no target is provided.
     */
    async render(model: any, request: any, target?: ViewTarget): Promise<void> {
        if (this.#destroyed) {
            throw new IllegalStateError('Cannot render a destroyed WicketView.');
        }

        if (!target) {
            throw new IllegalStateError('WicketView requires a ViewTarget to render.');
        }

        await target.prepare(request);

        const pageModel = new StaticModel(model);
        const page = new this.#pageClass('page', pageModel);

        page.initialize();

        const fragment = this.#dom.createFragment();

        page.renderPage(this.#dom, fragment);

        await target.commit(fragment, model, request);
    }

    /**
     * Destroys this view, preventing future renders.
     */
    destroy(): void {
        this.#destroyed = true;
    }
}
