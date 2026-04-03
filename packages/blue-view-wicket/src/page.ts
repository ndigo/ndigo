/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { WicketContainer } from './container';

/**
 * A top-level Wicket component that represents an entire page.
 *
 * Pages are the root of the component hierarchy. They own the
 * document and serve as the entry point for rendering.
 *
 * @typeParam T - The type of the page's model object.
 */
export class Page<T = unknown> extends WicketContainer<T> {
    get [Symbol.toStringTag](): string {
        return 'Page';
    }

    /**
     * Creates a new page with the given id and optional model.
     *
     * @param id - The page identifier.
     * @param model - An optional reactive model.
     */
    constructor(id: string, model?: ReadableModel<T>) {
        super(id, model);
    }

    /**
     * Renders the entire page. Runs the full lifecycle for this
     * component tree: initialize → configure → render → detach.
     *
     * TODO: Introduce PageStore/session persistence support in Phase 5.
     *
     * @param dom - The DOM provider used for element creation and parsing.
     * @param container - The root DOM element to render into.
     */
    renderPage(dom: DOMProvider, container: Element | DocumentFragment): void {
        this.configure();
        this.renderComponent(dom, container);
        this.detach();
    }
}
