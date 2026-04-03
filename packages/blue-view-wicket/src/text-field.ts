/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { FormComponent } from './form-component';

/**
 * A form input that binds to a text `<input>` element.
 *
 * Renders the model value into the input's `value` attribute
 * and stores user input for later validation and model update.
 *
 * @typeParam T - The model value type (typically `string`).
 */
export class TextField<T = string> extends FormComponent<T> {
    #type: string;

    get [Symbol.toStringTag](): string {
        return 'TextField';
    }

    /**
     * The HTML input type attribute (e.g., 'text', 'email', 'password').
     */
    get type(): string {
        return this.#type;
    }

    constructor(id: string, model?: ReadableModel<T>, type = 'text') {
        super(id, model);
        this.#type = type;
    }

    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = this.#resolveElement(dom, container);
        const value = this.model.get();
        element.setAttribute('value', value == null ? '' : String(value));
        element.setAttribute('type', this.#type);
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
        const input = dom.createElement('input');
        container.appendChild(input);
        return input;
    }
}
