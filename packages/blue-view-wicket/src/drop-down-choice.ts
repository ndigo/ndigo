/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { FormComponent } from './form-component';

/**
 * A form input that renders a `<select>` element with options
 * derived from a choices model.
 *
 * @typeParam T - The type of each choice value.
 */
export class DropDownChoice<T = string> extends FormComponent<T> {
    #choices: ReadableModel<T[]>;
    #displayValue: (item: T) => string;

    get [Symbol.toStringTag](): string {
        return 'DropDownChoice';
    }

    /**
     * The reactive list of available choices.
     */
    get choices(): ReadableModel<T[]> {
        return this.#choices;
    }

    /**
     * Creates a drop-down choice selector.
     *
     * @param id - The component identifier.
     * @param model - The selected value model.
     * @param choices - A reactive model providing the list of available choices.
     * @param displayValue - Optional function to convert a choice to its display string.
     *   Defaults to `String(item)`.
     */
    constructor(id: string, model: ReadableModel<T>, choices: ReadableModel<T[]>, displayValue?: (item: T) => string) {
        super(id, model);
        this.#choices = choices;
        this.#displayValue = displayValue ?? ((item: T) => String(item));
    }

    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const select = this.#resolveElement(dom, container);
        select.setAttribute('name', this.id);
        if (!this.enabled) {
            select.setAttribute('disabled', 'disabled');
        }

        // Clear any existing options
        select.innerHTML = '';

        const items = this.#choices.get() ?? [];
        const currentValue = this.model.get();

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const option = dom.createElement('option');
            option.setAttribute('value', String(i));
            option.textContent = this.#displayValue(item);
            if (item === currentValue) {
                option.setAttribute('selected', 'selected');
            }
            select.appendChild(option);
        }

        this._element = select;
    }

    #resolveElement(dom: DOMProvider, container: Element | DocumentFragment): Element {
        if ('tagName' in container) {
            return container;
        }
        const select = dom.createElement('select');
        container.appendChild(select);
        return select;
    }
}
