import { describe, expect, it } from 'vitest';

import { BrowserDOMProvider } from '../src/browser-dom-provider';

describe('BrowserDOMProvider', () => {
    it('parses HTML into a Document', () => {
        const provider = new BrowserDOMProvider();
        const document = provider.parseHTML('<div class="test">content</div>');

        expect(document).toBeInstanceOf(Document);
        const div = document.body.querySelector('div');
        expect(div?.className).toBe('test');
        expect(div?.textContent).toBe('content');
    });

    it('creates elements and fragments', () => {
        const provider = new BrowserDOMProvider();

        const div = provider.createElement('div');
        const fragment = provider.createFragment();

        expect(div.tagName.toLowerCase()).toBe('div');
        expect(fragment).toBeInstanceOf(DocumentFragment);
    });

    it('exposes the correct toStringTag', () => {
        const provider = new BrowserDOMProvider();

        expect(Object.prototype.toString.call(provider)).toBe('[object BrowserDOMProvider]');
        expect(provider[Symbol.toStringTag]).toBe('BrowserDOMProvider');
    });
});
