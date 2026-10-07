/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Constructable } from '@blue/core';

const NAME = 'name';

/**
 * The form-participation surface produced by {@link AsFormAssociated}.
 */
export interface FormAssociatedElement {
    /**
     * The element's `ElementInternals`, or `undefined` on hosts that do not
     * provide them (see {@link AsFormAssociated} for the degradation).
     */
    readonly internals: ElementInternals | undefined;

    /**
     * The form that owns this element, or `null` when it is not
     * form-associated in this host.
     */
    readonly form: HTMLFormElement | null;

    /**
     * The submitted field name (reflects the `name` attribute).
     */
    name: string;

    /**
     * The submitted value; writes route through
     * `ElementInternals.setFormValue` when the host supports it.
     */
    value: string;
}

/**
 * Returns the element's `ElementInternals`, or `undefined` when the host does
 * not support form association.
 *
 * The degradation is deliberate and documented: evergreen browsers provide
 * `attachInternals()` for form-associated custom elements, while SSR (no DOM)
 * and ARIA-only `ElementInternals` shims (e.g. jsdom 30, which lacks
 * `setFormValue`) either have no method or reject the call. In that case the
 * element still reflects `name`/`value`, but nothing is submitted — form
 * participation is a progressive enhancement, never a hard failure.
 */
function acquireInternals(element: HTMLElement): ElementInternals | undefined {
    if (typeof element.attachInternals !== 'function') {
        return undefined;
    }
    try {
        return element.attachInternals();
    } catch {
        return undefined;
    }
}

/**
 * Marks a custom element as form-associated (FACE) and bridges its value into
 * native form submission through `ElementInternals`.
 *
 * BlueJS contract: a form-associated element submits **standard** form data
 * (`name=value`, encoded by the browser exactly like a native control), so the
 * server path is unchanged — `@bodyMapping`/`dataBinderValue` and Zod
 * validation read the same `application/x-www-form-urlencoded` / multipart
 * payload, and a wrapped native `<input>` is not needed. There is **no
 * per-component wrapper**: expose `name`/`value`, write `value`, and the
 * browser does the rest (the element also appears in `form.elements`).
 *
 * The mixin sets the `formAssociated` static flag (required by the platform),
 * acquires `ElementInternals` in the constructor when the host supports it,
 * and exposes `internals`/`form` plus `name`/`value` accessors; assigning
 * `value` calls `ElementInternals.setFormValue`.
 *
 * @param superclass - The base class to extend (typically `HTMLElement` or
 *   `AbstractWebComponent`).
 * @returns A form-associated subclass carrying the {@link FormAssociatedElement} surface.
 *
 * @example
 * ```ts
 * class RatingInput extends AsFormAssociated(AbstractWebComponent) {
 *     set model(model: { score: number }) {
 *         this.value = String(model.score);
 *     }
 *     render(): void { … }
 * }
 * customElements.define('rating-input', RatingInput); // <form><rating-input name="rating">
 * ```
 *
 * @since 1.0.0
 */
export const AsFormAssociated = <T extends Constructable<HTMLElement>>(
    superclass: T
): Constructable<FormAssociatedElement> & T =>
    class extends superclass implements FormAssociatedElement {
        /**
         * Platform flag opting the element into form association; MUST be set
         * before `customElements.define` for the form owner to see it.
         */
        static formAssociated = true;

        #internals: ElementInternals | undefined = acquireInternals(this);
        #value = '';

        get internals(): ElementInternals | undefined {
            return this.#internals;
        }

        get form(): HTMLFormElement | null {
            return this.#internals?.form ?? null;
        }

        get name(): string {
            return this.getAttribute(NAME) ?? '';
        }

        set name(value: string) {
            if (value) {
                this.setAttribute(NAME, value);
            }
        }

        get value(): string {
            return this.#value;
        }

        set value(value: string) {
            this.#value = value;
            // `setFormValue` is absent on ARIA-only ElementInternals shims
            // (jsdom); the optional call keeps that degradation silent.
            this.#internals?.setFormValue?.(value);
        }
    };
