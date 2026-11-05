/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Constructable } from '@ndigo/core';

const NAME = 'name';
const VALUE = 'value';

/**
 * The attribute a {@link FormAssociatedElement} reflects the platform-pushed
 * disabled state to (`formDisabledCallback`). Framework-namespaced so it never
 * collides with a component's own `disabled` attribute semantics.
 */
const DISABLED_ATTRIBUTE = 'data-ndigo-disabled';

/**
 * The form-participation surface produced by {@link AsFormAssociated}.
 *
 * Value semantics mirror a native form control: the `value` **content
 * attribute** is the default (the `form.reset()` target, and it participates
 * in submission from upgrade time), while `.value` is the live submitted
 * value. The platform lifecycle callbacks — `formResetCallback` (restore the
 * default and re-publish it), `formDisabledCallback` (a `<fieldset disabled>`
 * ancestor toggled), `formStateRestoreCallback` (browser restore/autofill) —
 * are implemented by the mixin; see {@link AsFormAssociated} for the full
 * lifecycle table.
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
     * The submitted field name (reflects the `name` attribute; assigning an
     * empty string removes the attribute).
     */
    name: string;

    /**
     * The live submitted value; writes route through
     * `ElementInternals.setFormValue` when the host supports it.
     */
    value: string;

    /**
     * The value `form.reset()` restores: the last `value` **content
     * attribute**, or `''` when there is none. Assigning `.value` in script
     * changes the live value only — mirroring native `input.value` versus
     * `input.defaultValue`.
     */
    readonly defaultValue: string;

    /**
     * `true` while the platform has disabled this control (a `<fieldset
     * disabled>` ancestor); reflects to the `data-ndigo-disabled` attribute.
     */
    readonly disabled: boolean;
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
 * Ndigo contract: a form-associated element submits **standard** form data
 * (`name=value`, encoded by the browser exactly like a native control), so the
 * server path is unchanged — `@bodyMapping`/`dataBinderValue` and Zod
 * validation read the same `application/x-www-form-urlencoded` / multipart
 * payload, and a wrapped native `<input>` is not needed. There is **no
 * per-component wrapper**: expose `name`/`value`, write `value`, and the
 * browser does the rest (the element also appears in `form.elements`).
 *
 * The mixin sets the `formAssociated` static flag (required by the platform),
 * observes the `value` attribute, acquires `ElementInternals` in the
 * constructor when the host supports it, and exposes `internals`/`form`,
 * `name`/`value`/`defaultValue`/`disabled` plus the FACE lifecycle callbacks.
 *
 * ## Value semantics
 *
 * Like a native `<input>`, the **content attribute is the default** and the
 * **IDL property is the live value**. A server-rendered or declarative
 * `<rating-input name="rating" value="5">` therefore both submits `5` and
 * makes `5` the reset target; assigning `.value = '9'` in script changes only
 * the live/submitted value. `formResetCallback()` restores the default and
 * re-publishes it through `setFormValue`, so a stale value is never submitted
 * after `form.reset()`.
 *
 * ## Lifecycle
 *
 * | Callback                   | When the platform invokes it                     | Effect                                             |
 * | :------------------------- | :----------------------------------------------- | :------------------------------------------------- |
 * | `attributeChangedCallback` | `value` attribute set/removed (incl. SSR parse)  | records the default, publishes the value           |
 * | `formResetCallback`        | owning form `reset()`                            | restores the default value, re-`setFormValue`      |
 * | `formDisabledCallback`     | a `<fieldset disabled>` ancestor toggles         | sets `disabled`, reflects `data-ndigo-disabled`     |
 * | `formStateRestoreCallback` | browser restore / autofill                       | adopts a string state as the live value            |
 *
 * Assigning `value` calls `setFormValue`; the property never reflects back to
 * the attribute, so there is no feedback loop.
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
 * customElements.define('rating-input', RatingInput); // <form><rating-input name="rating" value="5">
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

        /**
         * The `value` attribute is observed so server-rendered / declarative
         * values participate in submission (WC-D). Subclasses that declare
         * their own `observedAttributes` MUST keep `'value'` in the list.
         */
        static observedAttributes = [VALUE];

        #internals: ElementInternals | undefined = acquireInternals(this);
        #value = '';
        #defaultValue = '';
        #disabled = false;

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
            } else if (this.hasAttribute(NAME)) {
                // WC-H: an empty assignment clears the attribute so the
                // control stops contributing to the submission.
                this.removeAttribute(NAME);
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

        get defaultValue(): string {
            return this.#defaultValue;
        }

        get disabled(): boolean {
            return this.#disabled;
        }

        /**
         * Reflects the observed `value` attribute into the submitted value and
         * records it as the reset default (WC-D). The platform fires this for
         * the server-rendered attribute at upgrade time and on later
         * `setAttribute('value', …)` / `removeAttribute('value')` calls.
         *
         * @param name - The attribute name (only `value` is observed).
         * @param _oldValue - The previous attribute value (unused).
         * @param newValue - The new attribute value, or `null` when removed.
         */
        attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
            if (name !== VALUE) {
                return;
            }
            this.#defaultValue = newValue ?? '';
            this.value = this.#defaultValue;
        }

        /**
         * Restores the default value when the owning form is reset (HI-3) and
         * re-publishes it through `setFormValue`, so the next submission
         * carries the reset value instead of the stale one.
         */
        formResetCallback(): void {
            this.value = this.#defaultValue;
        }

        /**
         * Tracks the disabled state the platform pushes when a `<fieldset
         * disabled>` ancestor toggles, reflecting it to the
         * `data-ndigo-disabled` attribute for styling and JS inspection.
         *
         * The custom element has no platform-level `disabled` attribute, so
         * this callback is the only signal of the platform state.
         *
         * @param disabled - `true` while the control is disabled.
         */
        formDisabledCallback(disabled: boolean): void {
            this.#disabled = disabled;
            this.toggleAttribute(DISABLED_ATTRIBUTE, disabled);
        }

        /**
         * Adopts a browser-restored / autofilled state as the live value.
         *
         * @param state - The saved state: a string is adopted as `value`; a
         *   `File`/`FormData` payload is forwarded straight to `setFormValue`.
         * @param _mode - `'restore'` (history/back) or `'autocomplete'` (autofill).
         */
        formStateRestoreCallback(state: string | File | FormData | null, _mode: 'restore' | 'autocomplete'): void {
            if (typeof state === 'string') {
                this.value = state;
                return;
            }
            this.#internals?.setFormValue?.(state);
        }
    };
