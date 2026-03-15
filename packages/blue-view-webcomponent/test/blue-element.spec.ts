import { describe, expect, test } from 'vitest';
import { AsBlueElement } from '../src/blue-element';

class TestHTMLElement {
    #attributes = new Map<string, string>();

    getAttribute(name: string): string | null {
        return this.#attributes.has(name) ? (this.#attributes.get(name) as string) : null;
    }

    setAttribute(name: string, value: string): void {
        this.#attributes.set(name, value);
    }
}

class TestBlueElement extends AsBlueElement(TestHTMLElement as any) {}

describe('AsBlueElement', () => {
    test('it should read name from attribute', () => {
        const element = new TestBlueElement();
        element.setAttribute('name', 'dashboard');

        expect(element.name).toBe('dashboard');
    });

    test('it should write name to attribute', () => {
        const element = new TestBlueElement();

        element.name = 'profile';

        expect(element.getAttribute('name')).toBe('profile');
    });

    test('it should ignore empty names', () => {
        const element = new TestBlueElement();
        element.name = 'before';

        element.name = '';

        expect(element.getAttribute('name')).toBe('before');
    });
});
