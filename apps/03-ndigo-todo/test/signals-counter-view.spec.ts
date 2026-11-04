/**
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom

import { beforeEach, describe, expect, test } from 'vitest';
import '../src/signals-counter-view';

interface SignalsCounterElement extends HTMLElement {
    count: number;
    doubled: number;
}

describe('signals-counter view', () => {
    let element: SignalsCounterElement;

    beforeEach(() => {
        document.body.innerHTML = '';
        element = document.createElement('signals-counter') as SignalsCounterElement;
        document.body.appendChild(element);
    });

    test('attaches a shadow root and renders the initial count/doubled values', () => {
        expect(element.shadowRoot).not.toBeNull();
        expect(element.shadowRoot?.getElementById('count-value')?.textContent).toBe('0');
        expect(element.shadowRoot?.getElementById('doubled-value')?.textContent).toBe('0');
    });

    test('increment button raises the count and doubles it', () => {
        const shadow = element.shadowRoot as ShadowRoot;
        const increment = shadow.getElementById('increment') as HTMLButtonElement;

        increment.click();

        expect(element.count).toBe(1);
        expect(element.doubled).toBe(2);
        expect(shadow.getElementById('count-value')?.textContent).toBe('1');
        expect(shadow.getElementById('doubled-value')?.textContent).toBe('2');
    });

    test('decrement and reset buttons drive the count back down', () => {
        const shadow = element.shadowRoot as ShadowRoot;
        const increment = shadow.getElementById('increment') as HTMLButtonElement;
        const decrement = shadow.getElementById('decrement') as HTMLButtonElement;
        const reset = shadow.getElementById('reset') as HTMLButtonElement;

        increment.click();
        increment.click();
        decrement.click();
        expect(element.count).toBe(1);
        expect(shadow.getElementById('doubled-value')?.textContent).toBe('2');

        reset.click();
        expect(element.count).toBe(0);
        expect(shadow.getElementById('count-value')?.textContent).toBe('0');
        expect(shadow.getElementById('doubled-value')?.textContent).toBe('0');
    });
});
