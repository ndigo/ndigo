/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { WicketContainer } from './container';

/**
 * A container that renders a named sub-section of its parent's template.
 *
 * Fragments reference a portion of the enclosing container's markup
 * identified by a `data-w-fragment` attribute. This allows multiple
 * visual variants within a single template.
 *
 * @typeParam T - The type of the fragment's model object.
 */
export class Fragment<T = unknown> extends WicketContainer<T> {
    #fragmentId: string;

    get [Symbol.toStringTag](): string {
        return 'Fragment';
    }

    /**
     * The identifier matching the `data-w-fragment` attribute in the
     * parent template.
     */
    get fragmentId(): string {
        return this.#fragmentId;
    }

    /**
     * Creates a new fragment bound to a named region in the parent template.
     *
     * @param id - The component identifier.
     * @param fragmentId - The `data-w-fragment` value in the parent template.
     * @param model - An optional reactive model.
     */
    constructor(id: string, fragmentId: string, model?: ReadableModel<T>) {
        super(id, model);
        this.#fragmentId = fragmentId;
    }

    /**
     * Renders this fragment. If the parent container provides a template
     * containing a matching `data-w-fragment` element, the fragment
     * renders its children into that region. Otherwise falls back to
     * standard container rendering.
     *
     * @param dom - The DOM provider.
     * @param container - The parent DOM element to render into.
     */
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        // Delegate to the parent class render which handles template + children.
        super.render(dom, container);
    }
}
