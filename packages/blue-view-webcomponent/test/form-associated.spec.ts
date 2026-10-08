/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { Constructable } from '@blue/core';
import { AsFormAssociated, FormAssociatedElement } from '../src/form-associated';

class RatingInputElement extends AsFormAssociated(HTMLElement) {}
customElements.define('rating-input', RatingInputElement);

// `document.createElement('rating-input')` returns the generic HTMLElement
// type, but the mixin extends it with the FormAssociatedElement surface plus
// the FACE lifecycle callbacks (which the FormAssociatedElement interface
// deliberately omits; they are only meaningful on a real element). Mirror
// that full surface here so the specs can drive the callbacks directly.
interface RatingInputInstance extends HTMLElement, FormAssociatedElement {
    formResetCallback(): void;
    formDisabledCallback(disabled: boolean): void;
    formStateRestoreCallback(state: string | File | FormData | null, mode: 'restore' | 'autocomplete'): void;
}

// The mixin's declared return type (Constructable<FormAssociatedElement> & T)
// does not surface its static members, so expose them here for the specs that
// assert the platform-facing flags.
const RatingInputClass = RatingInputElement as typeof RatingInputElement & {
    readonly formAssociated: boolean;
    readonly observedAttributes: string[];
};

const createRatingInput = (): RatingInputInstance =>
    document.createElement('rating-input') as unknown as RatingInputInstance;

/**
 * A host without `attachInternals` — the SSR / legacy-shim degradation path.
 */
class NoInternalsHost {
    #attributes: Record<string, string> = {};

    getAttribute(name: string): string | null {
        return this.#attributes[name] ?? null;
    }

    setAttribute(name: string, value: string): void {
        this.#attributes[name] = value;
    }
}

class NoInternalsElement extends AsFormAssociated(NoInternalsHost as unknown as Constructable<HTMLElement>) {}

describe('AsFormAssociated', () => {
    test('marks the element form-associated via the static flag', () => {
        expect(RatingInputClass.formAssociated).toBe(true);
    });

    test('acquires ElementInternals for a defined custom element', () => {
        const element = createRatingInput();

        expect(element.internals).toBeDefined();
        expect(element.internals?.constructor.name).toBe('ElementInternals');
    });

    test('reflects name from and to the name attribute', () => {
        const element = createRatingInput();

        element.name = 'rating';
        expect(element.getAttribute('name')).toBe('rating');
        expect(element.name).toBe('rating');
    });

    test('degrades to no internals (and never throws) when attachInternals is unavailable', () => {
        const element = new NoInternalsElement();

        expect(element.internals).toBeUndefined();
        expect(element.form).toBeNull();
        expect(() => {
            element.value = '5';
        }).not.toThrow();
        expect(element.value).toBe('5');
    });

    test('writes value without throwing on ARIA-only ElementInternals (jsdom has no setFormValue)', () => {
        const element = createRatingInput();
        // jsdom 30 exposes ARIA-only internals: `setFormValue` (FACE submission)
        // is absent, so the guarded write is a silent no-op.
        expect(typeof element.internals?.setFormValue).not.toBe('function');

        element.value = '5';
        expect(element.value).toBe('5');
    });

    test('a native <input>-free form reports the element via form.elements when supported', () => {
        const form = document.createElement('form');
        const element = createRatingInput();
        element.name = 'rating';
        element.value = '5';
        form.append(element);
        document.body.append(form);

        if ([...form.elements].includes(element)) {
            // FACE-capable host: the element is a form control and its value
            // serializes into standard form data like a native field.
            expect(new FormData(form).get('rating')).toBe('5');
        } else {
            // jsdom 30: no form association, so the element is not a control.
            expect(element.form).toBeNull();
        }
    });

    test('observes the value attribute and records it as the reset default (WC-D)', () => {
        expect(RatingInputClass.observedAttributes).toContain('value');

        const element = createRatingInput();
        element.setAttribute('value', '5');

        expect(element.value).toBe('5');
        expect(element.defaultValue).toBe('5');
    });

    test('formResetCallback restores the default value and re-publishes it (HI-3)', () => {
        // jsdom-only claim: the restored value/default are asserted here;
        // `setFormValue` is absent in jsdom, so the re-publication to FormData
        // is only observable in the Chromium probe.
        const element = createRatingInput();
        element.setAttribute('value', '5');
        element.value = '9';

        element.formResetCallback();

        expect(element.value).toBe('5');
        expect(element.defaultValue).toBe('5');
    });

    test('formResetCallback clears a property-only value back to the empty default (HI-3)', () => {
        const element = createRatingInput();
        element.value = '9';

        element.formResetCallback();

        expect(element.value).toBe('');
    });

    test('reflects the platform disabled state to data-blue-disabled', () => {
        // jsdom-only claim: jsdom implements no FACE disabled semantics, so the
        // callback is invoked directly; the platform-driven invocation
        // (`<fieldset disabled>`) is verified in the Chromium probe.
        const element = createRatingInput();
        expect(element.disabled).toBe(false);

        element.formDisabledCallback(true);
        expect(element.disabled).toBe(true);
        expect(element.hasAttribute('data-blue-disabled')).toBe(true);

        element.formDisabledCallback(false);
        expect(element.disabled).toBe(false);
        expect(element.hasAttribute('data-blue-disabled')).toBe(false);
    });

    test('adopts a restored string state as the live value', () => {
        const element = createRatingInput();

        element.formStateRestoreCallback('3', 'restore');

        expect(element.value).toBe('3');
    });

    test('clears the name attribute on an empty assignment (WC-H)', () => {
        const element = createRatingInput();
        element.name = 'rating';
        expect(element.getAttribute('name')).toBe('rating');

        element.name = '';

        expect(element.hasAttribute('name')).toBe(false);
        expect(element.name).toBe('');
    });
});
