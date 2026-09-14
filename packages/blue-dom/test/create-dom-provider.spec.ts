/**
 * @module blue-dom
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';

import { createDOMProvider } from '../src/create-dom-provider';

describe('createDOMProvider', () => {
    it('returns a DOMProvider that uses the browser implementation in jsdom', async () => {
        const provider = await createDOMProvider();

        expect(provider[Symbol.toStringTag]).toBe('BrowserDOMProvider');

        const document = provider.parseHTML('<div class="test">hello</div>');
        const div = document.body.querySelector('div');

        expect(div?.className).toBe('test');
        expect(div?.textContent).toBe('hello');
        expect(provider.createElement('span').tagName.toLowerCase()).toBe('span');
        expect(provider.createFragment()).toBeInstanceOf(DocumentFragment);
    });
});
