/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import { WicketComponent } from './component';
import { WicketContainer } from './container';
import { Form } from './form';
import { FormComponent } from './form-component';

/**
 * A component that displays validation errors from form components.
 *
 * Renders an unordered list (`<ul>`) with one list item per error.
 * If there are no errors, nothing is rendered.
 */
export class FeedbackPanel extends WicketComponent<unknown> {
    _element: Element | null = null;

    get [Symbol.toStringTag](): string {
        return 'FeedbackPanel';
    }

    /**
     * Renders validation errors into the provided container.
     *
     * @param dom - The DOM provider.
     * @param container - The parent element or fragment.
     */
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const errors = this.#collectErrors();
        if (errors.length === 0) {
            return;
        }

        const ul = dom.createElement('ul');
        ul.setAttribute('class', 'feedback-panel');

        for (const error of errors) {
            const li = dom.createElement('li');
            li.textContent = error;
            ul.appendChild(li);
        }

        container.appendChild(ul);
        this._element = ul;
    }

    #collectErrors(): string[] {
        const errors: string[] = [];
        const root = this.#findCollectionRoot();
        if (root) {
            this.#walkForErrors(root, errors);
        }
        return errors;
    }

    #findCollectionRoot(): WicketContainer | null {
        let current: WicketComponent | null = this.parent;
        let lastContainer: WicketContainer | null = null;

        while (current) {
            if (current instanceof WicketContainer) {
                lastContainer = current;
            }

            if (current instanceof Form) {
                return current;
            }

            current = current.parent;
        }

        return lastContainer;
    }

    #walkForErrors(container: WicketContainer, errors: string[]): void {
        for (const child of container.children.values()) {
            if (child instanceof FormComponent) {
                errors.push(...child.validationErrors);
            }

            if (child instanceof WicketContainer) {
                this.#walkForErrors(child, errors);
            }
        }
    }
}
