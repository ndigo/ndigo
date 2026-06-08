/**
 * @author Jeff Rose
 */
import type { ReadableModel, WritableModel } from '@blue/reactive';
import { WicketComponent } from './component';

/**
 * Checks whether a model supports mutation.
 *
 * @typeParam T - The model value type.
 * @param model - The model to test.
 * @returns `true` if the model has a `set` method.
 */
function isWritableModel<T>(model: ReadableModel<T>): model is WritableModel<T> {
    return typeof (model as WritableModel<T>).set === 'function';
}

/**
 * Abstract base class for form input components.
 *
 * Form components maintain transient raw input, validate it,
 * and push validated values to their writable model.
 *
 * @typeParam T - The converted value type of the input.
 */
export abstract class FormComponent<T = unknown> extends WicketComponent<T> {
    #rawInput: string | null = null;
    #required = false;
    #validationErrors: string[] = [];
    #valid = true;

    _element: Element | null = null;

    get [Symbol.toStringTag](): string {
        return 'FormComponent';
    }

    /**
     * Whether this field is required for form submission.
     */
    get required(): boolean {
        return this.#required;
    }

    set required(value: boolean) {
        this.#required = value;
    }

    /**
     * Whether the last validation pass succeeded.
     */
    get valid(): boolean {
        return this.#valid;
    }

    /**
     * Validation error messages from the last validation pass.
     */
    get validationErrors(): readonly string[] {
        return this.#validationErrors;
    }

    /**
     * The transient raw input string before conversion and validation.
     */
    get rawInput(): string | null {
        return this.#rawInput;
    }

    set rawInput(value: string | null) {
        this.#rawInput = value;
    }

    /**
     * Converts raw input to the model value type.
     *
     * Subclasses can override this for type-specific conversion.
     * The default implementation returns the raw input value cast to `T`.
     */
    convertInput(): T {
        return this.#rawInput as T;
    }

    /**
     * Validates the current raw input.
     *
     * Populates `validationErrors` and updates `valid`.
     */
    validate(): void {
        this.#validationErrors = [];
        this.#valid = true;

        if (this.#required && (this.#rawInput == null || this.#rawInput === '')) {
            this.#validationErrors.push(`${this.id} is required.`);
            this.#valid = false;
            return;
        }

        this.onValidate();
    }

    /**
     * Updates the model with the converted input value when writable.
     */
    updateModel(): void {
        if (isWritableModel(this.model)) {
            const converted = this.convertInput();
            this.model.set(converted);
        }
    }

    /**
     * Hook for subclasses to add custom validation logic.
     */
    protected onValidate(): void {
        // no-op
    }

    /**
     * Clears validation and transient input state during detach.
     */
    protected onDetach(): void {
        this.#validationErrors = [];
        this.#valid = true;
        this.#rawInput = null;
    }
}
