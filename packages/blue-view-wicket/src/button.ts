/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { WicketComponent } from './component';

/**
 * A button component for form submission or custom actions.
 *
 * Buttons can override form submission behavior. If placed inside
 * a {@link Form}, the form will call the button's `onSubmit` or
 * `onError` instead of its own when the button is the submitter.
 */
export class Button extends WicketComponent<unknown> {
    _element: Element | null = null;

    get [Symbol.toStringTag](): string {
        return 'Button';
    }

    constructor(id: string, model?: ReadableModel<unknown>) {
        super(id, model);
    }

    /**
     * Called on successful form submission. Override to handle submit.
     */
    onSubmit(): void {
        // no-op
    }

    /**
     * Called when form validation fails. Override to handle errors.
     */
    onError(): void {
        // no-op
    }

    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = this.#resolveElement(dom, container);
        const value = this.model.get();
        element.textContent = value == null ? '' : String(value);
        element.setAttribute('type', 'button');
        if (!this.enabled) {
            element.setAttribute('disabled', 'disabled');
        }
        this._element = element;
    }

    #resolveElement(dom: DOMProvider, container: Element | DocumentFragment): Element {
        if ('tagName' in container) {
            return container;
        }
        const button = dom.createElement('button');
        container.appendChild(button);
        return button;
    }
}
