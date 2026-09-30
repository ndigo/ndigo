/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest';
import { hydrateIslands } from '../src/hydrate';
import { serializeModel } from '@blue/view';
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

    test('hydrates entity literals as original content, not a live element', () => {
        // Fresh class + name: jsdom's registry persists across tests and
        // rejects re-registering a constructor under another name.
        class ModelElement extends HTMLElement {}
        customElements.define('entity-island', ModelElement);
        // The model carries entity *literals* as data: a literal `&lt;b&gt;`
        // and a literal `&lt;script&gt;alert(1)&lt;/script&gt;` string that must
        // survive hydration as inert text — never a real element, never null.
        const model = { count: 42, html: '<b>&amp; &lt;b&gt;</b>' };
        document.body.innerHTML = `<entity-island data-blue-island data-blue-model="${serializeModel(model)}"></entity-island>`;

        const n = hydrateIslands(document);
        expect(n).toBe(1);

        const live = document.querySelector('entity-island') as HTMLElement & { model?: unknown };
        expect(live.model).toEqual(model);
        // No real `<script>` / `<b>` element was injected by hydration.
        expect(live.querySelector('script, b')).toBeNull();
    });

    test('leaves undefined elements as inert markup', () => {
        document.body.innerHTML = '<unknown-island data-blue-island data-blue-model="{}"></unknown-island>';

        const n = hydrateIslands(document);
        expect(n).toBe(0);
        expect(document.querySelector('unknown-island')).toBeTruthy(); // untouched
    });

    test('assigns the negotiated locale before the element connects', () => {
        class LocaleAwareElement extends HTMLElement {}
        customElements.define('locale-island', LocaleAwareElement);
        document.body.innerHTML =
            '<locale-island data-blue-island data-blue-locale="fr-CA" data-blue-model="{}"></locale-island>';

        const n = hydrateIslands(document);
        expect(n).toBe(1);

        const live = document.querySelector('locale-island') as HTMLElement & { locale?: string };
        expect(live.locale).toBe('fr-CA');
    });

    test('returns 0 when no islands present', () => {
        document.body.innerHTML = '<div>plain</div>';
        expect(hydrateIslands(document)).toBe(0);
    });
});
