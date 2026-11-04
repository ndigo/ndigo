/**
 * @module ndigo-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { Constructable } from '@ndigo/core';
import { AsNdigoElement } from '../src/ndigo-element';

class TestHTMLElement {
    #attributes = new Map<string, string>();

    getAttribute(name: string): string | null {
        return this.#attributes.has(name) ? (this.#attributes.get(name) as string) : null;
    }

    setAttribute(name: string, value: string): void {
        this.#attributes.set(name, value);
    }
}

class TestNdigoElement extends AsNdigoElement(TestHTMLElement as unknown as Constructable<HTMLElement>) {}

describe('AsNdigoElement', () => {
    test('it should read name from attribute', () => {
        const element = new TestNdigoElement();
        element.setAttribute('name', 'dashboard');

        expect(element.name).toBe('dashboard');
    });

    test('it should write name to attribute', () => {
        const element = new TestNdigoElement();

        element.name = 'profile';

        expect(element.getAttribute('name')).toBe('profile');
    });

    test('it should ignore empty names', () => {
        const element = new TestNdigoElement();
        element.name = 'before';

        element.name = '';

        expect(element.getAttribute('name')).toBe('before');
    });
});
