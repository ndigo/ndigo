/**
 */
import { describe, expect, it } from 'vitest';

import { createDOMProvider } from '../src/create-dom-provider';

describe('createDOMProvider', () => {
    it('returns a DOMProvider that uses the browser implementation in jsdom', async () => {
        const provider = await createDOMProvider();

        // DOMProvider does not declare Symbol.toStringTag in its interface, but
        // every concrete implementation (browser and linkedom) sets it to a
        // stable discriminator string; read it through a named type so the
        // instanceof-style check below stays explicit.
        type ProviderWithTag = { [Symbol.toStringTag]?: string };
        const providerTag = provider as ProviderWithTag;

        expect(providerTag[Symbol.toStringTag]).toBe('BrowserDOMProvider');

        const document = provider.parseHTML('<div class="test">hello</div>');
        const div = document.body.querySelector('div');

        expect(div?.className).toBe('test');
        expect(div?.textContent).toBe('hello');
        expect(provider.createElement('span').tagName.toLowerCase()).toBe('span');
        expect(provider.createFragment()).toBeInstanceOf(DocumentFragment);
    });
});
