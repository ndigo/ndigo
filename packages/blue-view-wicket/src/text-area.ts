/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { FormComponent } from './form-component';

/**
 * A form input that binds to a `<textarea>` element.
 *
 * @typeParam T - The model value type (typically `string`).
 */
export class TextArea<T = string> extends FormComponent<T> {
    get [Symbol.toStringTag](): string {
        return 'TextArea';
    }

    constructor(id: string, model?: ReadableModel<T>) {
        super(id, model);
    }

    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = this.#resolveElement(dom, container);
        const value = this.model.get();
        element.textContent = value == null ? '' : String(value);
        element.setAttribute('name', this.id);
        if (!this.enabled) {
            element.setAttribute('disabled', 'disabled');
        }
        this._element = element;
    }

    #resolveElement(dom: DOMProvider, container: Element | DocumentFragment): Element {
        if ('tagName' in container) {
            return container;
        }
        const textarea = dom.createElement('textarea');
        container.appendChild(textarea);
        return textarea;
    }
}
