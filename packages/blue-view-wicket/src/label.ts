/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { WicketComponent } from './component';

/**
 * A component that renders its model value as text content
 * into the DOM element matched by its `data-w-id`.
 *
 * The Label reads its model, converts the value to a string,
 * and sets it as the `textContent` of the rendered element.
 *
 * @typeParam T - The type of the label's model value.
 */
export class Label<T = unknown> extends WicketComponent<T> {
    /**
     * Internal reference to the rendered element for behaviors.
     */
    _element: Element | null = null;

    get [Symbol.toStringTag](): string {
        return 'Label';
    }

    /**
     * Creates a new label component.
     *
     * @param id - The component identifier.
     * @param model - The optional reactive model for the label value.
     */
    constructor(id: string, model?: ReadableModel<T>) {
        super(id, model);
    }

    /**
     * Renders the label into the provided container.
     *
     * @param dom - The DOM provider.
     * @param container - The element or fragment to render into.
     */
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = this.#resolveElement(dom, container);
        const value = this.model.get();
        element.textContent = value == null ? '' : String(value);
        this._element = element;
    }

    #resolveElement(dom: DOMProvider, container: Element | DocumentFragment): Element {
        if ('tagName' in container) {
            return container;
        }

        const span = dom.createElement('span');
        container.appendChild(span);
        return span;
    }
}
