/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { FormComponent } from './form-component';

/**
 * A form input that binds to a `<input type="checkbox">` element.
 */
export class CheckBox extends FormComponent<boolean> {
    get [Symbol.toStringTag](): string {
        return 'CheckBox';
    }

    constructor(id: string, model?: ReadableModel<boolean>) {
        super(id, model);
    }

    /**
     * Converts the raw input string ('true'/'false') to boolean.
     */
    convertInput(): boolean {
        return this.rawInput === 'true';
    }

    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = this.#resolveElement(dom, container);
        element.setAttribute('type', 'checkbox');
        element.setAttribute('name', this.id);
        const checked = !!this.model.get();
        if (checked) {
            element.setAttribute('checked', 'checked');
        } else {
            element.removeAttribute('checked');
        }
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
