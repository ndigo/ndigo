/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { Constructable } from '@blue/core';
import { AsFormAssociated } from '../src/form-associated';

class RatingInputElement extends AsFormAssociated(HTMLElement) {}
customElements.define('rating-input', RatingInputElement);

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
        expect(RatingInputElement.formAssociated).toBe(true);
    });

    test('acquires ElementInternals for a defined custom element', () => {
        const element = document.createElement('rating-input');

        expect(element.internals).toBeDefined();
        expect(element.internals?.constructor.name).toBe('ElementInternals');
    });

    test('reflects name from and to the name attribute', () => {
        const element = document.createElement('rating-input');

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
        const element = document.createElement('rating-input');
        // jsdom 30 exposes ARIA-only internals: `setFormValue` (FACE submission)
        // is absent, so the guarded write is a silent no-op.
        expect(typeof element.internals?.setFormValue).not.toBe('function');

        element.value = '5';
        expect(element.value).toBe('5');
    });

    test('a native <input>-free form reports the element via form.elements when supported', () => {
        const form = document.createElement('form');
        const element = document.createElement('rating-input');
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
});
