/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { ReadableModel } from '@blue/reactive';
import { WicketContainer } from './container';
import { FormComponent } from './form-component';

/**
 * A container that processes form submissions by orchestrating
 * validation and model updates across its child {@link FormComponent}s.
 *
 * The processing lifecycle:
 * 1. Collect all nested FormComponents
 * 2. Validate each input
 * 3. If all valid, update models and call {@link onSubmit}
 * 4. If any invalid, call {@link onError}
 *
 * @typeParam T - The type of the form model object.
 */
export class Form<T = unknown> extends WicketContainer<T> {
    _element: Element | null = null;

    get [Symbol.toStringTag](): string {
        return 'Form';
    }

    /**
     * Creates a form with an id and optional model.
     *
     * @param id - The component identifier.
     * @param model - Optional reactive model for this form.
     */
    constructor(id: string, model?: ReadableModel<T>) {
        super(id, model);
    }

    /**
     * Processes form submission by validating all nested form components.
     *
     * If all components are valid, each model is updated and {@link onSubmit}
     * is called. Otherwise, {@link onError} is called.
     */
    process(): void {
        const formComponents = this.#collectFormComponents();
        let allValid = true;

        for (const formComponent of formComponents) {
            formComponent.validate();
            if (!formComponent.valid) {
                allValid = false;
            }
        }

        if (!allValid) {
            this.onError();
            return;
        }

        for (const formComponent of formComponents) {
            formComponent.updateModel();
        }
        this.onSubmit();
    }

    /**
     * Called when all form components are valid and models were updated.
     *
     * Override in subclasses to handle successful submission.
     */
    protected onSubmit(): void {
        // no-op
    }

    /**
     * Called when one or more form components contain validation errors.
     *
     * Override in subclasses to handle validation failure.
     */
    protected onError(): void {
        // no-op
    }

    /**
     * Renders the form and delegates child rendering to the container base.
     *
     * If the incoming container is already an element, it is used directly.
     * Otherwise, a `<form>` element is created and appended first.
     *
     * @param dom - The DOM provider.
     * @param container - The parent element or fragment.
     */
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = this.#resolveElement(dom, container);
        this._element = element;
        super.render(dom, element);
    }

    /**
     * Collects all descendant form components.
     *
     * @returns All nested form components in traversal order.
     */
    #collectFormComponents(): FormComponent[] {
        const result: FormComponent[] = [];
        this.#walkChildren(this, result);
        return result;
    }

    #walkChildren(container: WicketContainer, result: FormComponent[]): void {
        for (const child of container.children.values()) {
            if (child instanceof FormComponent) {
                result.push(child);
            }

            if (child instanceof WicketContainer) {
                this.#walkChildren(child, result);
            }
        }
    }

    #resolveElement(dom: DOMProvider, container: Element | DocumentFragment): Element {
        if ('tagName' in container) {
            return container;
        }

        const form = dom.createElement('form');
        container.appendChild(form);
        return form;
    }
}
