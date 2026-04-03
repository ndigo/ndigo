/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { WicketContainer } from './container';

/**
 * An abstract container that renders an anchor (`<a>`) element.
 *
 * Subclasses implement {@link onClick} to respond when the link is activated.
 * Child components (like a Label) can be nested inside.
 *
 * @typeParam T - The type of the link's model object.
 */
export abstract class Link<T = unknown> extends WicketContainer<T> {
    /**
     * Internal reference to the rendered anchor element.
     */
    _element: Element | null = null;

    get [Symbol.toStringTag](): string {
        return 'Link';
    }

    /**
     * Creates a new link component.
     *
     * @param id - The component identifier.
     * @param model - The optional reactive model.
     */
    constructor(id: string, model?: ReadableModel<T>) {
        super(id, model);
    }

    /**
     * Called when the link is clicked.
     * Subclasses must implement this method.
     */
    abstract onClick(): void;

    /**
     * Renders the link and all child components.
     *
     * @param dom - The DOM provider.
     * @param container - The element or fragment to render into.
     */
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = this.#resolveElement(dom, container);
        this._element = element;

        for (const child of this.children.values()) {
            child.renderComponent(dom, element);
        }
    }

    #resolveElement(dom: DOMProvider, container: Element | DocumentFragment): Element {
        if ('tagName' in container) {
            return container;
        }

        const anchor = dom.createElement('a');
        anchor.setAttribute('href', '#');
        container.appendChild(anchor);
        return anchor;
    }
}
