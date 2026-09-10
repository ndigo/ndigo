// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest';
import { hydrateIslands, parseModel } from '../src/hydrate';
import { AbstractWebComponent } from '../src/abstract-web-component';

/**
 * Islands hydration: inert SSR markup (from IslandView) is replaced with a
 * live, model-connected custom element — without re-rendering the whole page.
 */

class CounterElement extends AbstractWebComponent {
    static get observedAttributes() {
        return [];
    }
    #count = 0;
    set model(m: unknown) {
        this.#count = (m as { count?: number })?.count ?? 0;
        this.render();
    }
    render(): void {
        if (this.shadowRoot) return;
        this.textContent = String(this.#count);
    }
}

describe('hydrateIslands', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('hydrates a defined island element with its parsed model', () => {
        customElements.define('counter-island', CounterElement);
        const serialized = JSON.stringify({ count: 42 }).replace(/"/g, '&quot;');
        document.body.innerHTML = `<counter-island data-blue-island data-blue-model="${serialized}"></counter-island>`;

        const n = hydrateIslands(document);

        expect(n).toBe(1);
        const live = document.querySelector('counter-island');
        if (!live) {
            throw new Error('expected a hydrated counter-island element');
        }
        expect(live.textContent).toBe('42'); // model set → render ran
        expect(live.hasAttribute('data-blue-island')).toBe(true);
    });

    test('leaves undefined elements as inert markup', () => {
        document.body.innerHTML = '<unknown-island data-blue-island data-blue-model="{}"></unknown-island>';

        const n = hydrateIslands(document);
        expect(n).toBe(0);
        expect(document.querySelector('unknown-island')).toBeTruthy(); // untouched
    });

    test('returns 0 when no islands present', () => {
        document.body.innerHTML = '<div>plain</div>';
        expect(hydrateIslands(document)).toBe(0);
    });
});
