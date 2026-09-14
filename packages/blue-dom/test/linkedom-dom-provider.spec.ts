/**
 * @module blue-dom
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';

import { LinkedomDOMProvider } from '../src/linkedom-dom-provider';

describe('LinkedomDOMProvider', () => {
    it('parses HTML into a Document with expected structure', () => {
        const provider = new LinkedomDOMProvider();
        const document = provider.parseHTML('<div>hello</div>');

        expect(document.nodeType).toBe(9);
        const div = document.querySelector('div');
        expect(div?.textContent).toBe('hello');
    });

    it('parses HTML with attributes', () => {
        const provider = new LinkedomDOMProvider();
        const document = provider.parseHTML('<div id="root" data-test="value"></div>');

        const div = document.querySelector('div');
        expect(div).not.toBeNull();
        expect(div?.getAttribute('id')).toBe('root');
        expect(div?.getAttribute('data-test')).toBe('value');
    });

    it('creates elements by tag name', () => {
        const provider = new LinkedomDOMProvider();

        const div = provider.createElement('div');
        const span = provider.createElement('span');

        expect(div.tagName.toLowerCase()).toBe('div');
        expect(span.tagName.toLowerCase()).toBe('span');
    });

    it('creates a fragment that can accept children', () => {
        const provider = new LinkedomDOMProvider();
        const fragment = provider.createFragment();
        const child = provider.createElement('div');

        fragment.appendChild(child);

        expect(fragment.nodeType).toBe(11);
        expect(fragment.childNodes.length).toBe(1);
        expect(fragment.firstChild).toBe(child);
    });

    it('exposes the correct toStringTag', () => {
        const provider = new LinkedomDOMProvider();

        expect(Object.prototype.toString.call(provider)).toBe('[object LinkedomDOMProvider]');
        expect(provider[Symbol.toStringTag]).toBe('LinkedomDOMProvider');
    });
});
