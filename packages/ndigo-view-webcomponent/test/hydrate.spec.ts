/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest';
import { hydrateIslands } from '../src/hydrate';
import { serializeModel } from '@ndigo/view';
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
        document.body.innerHTML = `<counter-island data-ndigo-island data-ndigo-model="${serialized}"></counter-island>`;

        const n = hydrateIslands(document);

        expect(n).toBe(1);
        const live = document.querySelector('counter-island');
        if (!live) {
            throw new Error('expected a hydrated counter-island element');
        }
        expect(live.textContent).toBe('42'); // model set → render ran
        expect(live.hasAttribute('data-ndigo-island')).toBe(true);
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
        document.body.innerHTML = `<entity-island data-ndigo-island data-ndigo-model="${serializeModel(model)}"></entity-island>`;

        const n = hydrateIslands(document);
        expect(n).toBe(1);

        const live = document.querySelector('entity-island') as HTMLElement & { model?: unknown };
        expect(live.model).toEqual(model);
        // No real `<script>` / `<b>` element was injected by hydration.
        expect(live.querySelector('script, b')).toBeNull();
    });

    test('leaves undefined elements as inert markup', () => {
        document.body.innerHTML = '<unknown-island data-ndigo-island data-ndigo-model="{}"></unknown-island>';

        const n = hydrateIslands(document);
        expect(n).toBe(0);
        expect(document.querySelector('unknown-island')).toBeTruthy(); // untouched
    });

    test('assigns the negotiated locale before the element connects', () => {
        class LocaleAwareElement extends HTMLElement {}
        customElements.define('locale-island', LocaleAwareElement);
        document.body.innerHTML =
            '<locale-island data-ndigo-island data-ndigo-locale="fr-CA" data-ndigo-model="{}"></locale-island>';

        const n = hydrateIslands(document);
        expect(n).toBe(1);

        const live = document.querySelector('locale-island') as HTMLElement & { locale?: string };
        expect(live.locale).toBe('fr-CA');
    });

    test('returns 0 when no islands present', () => {
        document.body.innerHTML = '<div>plain</div>';
        expect(hydrateIslands(document)).toBe(0);
    });

    test('adopts a parser-created (DSD) shadow root in place instead of re-creating the element', () => {
        // First render replaces the server-rendered fallback in the root the
        // browser parsed from `<template shadowrootmode="open">`. jsdom does
        // not parse DSD, so emulate the parsed state by attaching a root.
        class DsdIsland extends AbstractWebComponent {
            static get observedAttributes() {
                return [];
            }
            set model(m: unknown) {
                const count = typeof m === 'object' && m !== null && 'count' in m ? String(m.count) : '0';
                this.ensureShadowRoot().innerHTML = `<p>client ${count}</p>`;
            }
            render(): void {}
        }
        customElements.define('dsd-island', DsdIsland);

        document.body.innerHTML =
            '<dsd-island data-ndigo-island data-ndigo-model="{&quot;count&quot;:7}"></dsd-island>';
        const marker = document.querySelector('dsd-island');
        if (!marker) {
            throw new Error('expected a dsd-island marker');
        }
        const parsedRoot = marker.attachShadow({ mode: 'open' });
        parsedRoot.innerHTML = '<p>server fallback</p>';

        const n = hydrateIslands(document);

        expect(n).toBe(1);
        // The very same element is kept (no replaceWith) and it keeps the root
        // that hydration adopted rather than attaching a second one.
        expect(document.querySelector('dsd-island')).toBe(marker);
        expect(marker.shadowRoot).toBe(parsedRoot);
        // The component's first render replaced the server fallback.
        expect(parsedRoot.textContent).toBe('client 7');
        // WC-B: the marker is tagged so a repeat scan skips it.
        expect(marker.hasAttribute('data-ndigo-hydrated')).toBe(true);
    });

    test('isolates a throwing island so the next marker still hydrates (HI-2)', () => {
        class BadIsland extends HTMLElement {
            set model(_model: unknown) {
                throw new Error('boom');
            }
        }
        class GoodIsland extends HTMLElement {
            model?: unknown;
        }
        customElements.define('bad-island', BadIsland);
        customElements.define('good-island', GoodIsland);
        document.body.innerHTML =
            '<bad-island data-ndigo-island data-ndigo-model="{&quot;count&quot;:1}"></bad-island>' +
            '<good-island data-ndigo-island data-ndigo-model="{&quot;count&quot;:2}"></good-island>';

        let hydrated = 0;
        expect(() => {
            hydrated = hydrateIslands(document);
        }).not.toThrow();

        // Only the healthy island counts as a success…
        expect(hydrated).toBe(1);
        const good = document.querySelector('good-island') as GoodIsland;
        expect(good.model).toEqual({ count: 2 });
        // …the failing marker keeps its server fallback and is not marked
        // hydrated, so it is untouched rather than half-upgraded.
        const bad = document.querySelector('bad-island');
        expect(bad?.hasAttribute('data-ndigo-hydrated')).toBe(false);
    });

    test('skips an unparseable model without invoking the setter or aborting others (WC-A)', () => {
        const seen: unknown[] = [];
        class CaptureIsland extends HTMLElement {
            set model(model: unknown) {
                seen.push(model);
            }
        }
        customElements.define('capture-island', CaptureIsland);
        document.body.innerHTML =
            '<capture-island data-ndigo-island data-ndigo-model="{not json"></capture-island>' +
            '<capture-island data-ndigo-island data-ndigo-model="{&quot;ok&quot;:true}"></capture-island>';

        const hydrated = hydrateIslands(document);

        expect(hydrated).toBe(1);
        // The malformed payload never reached a component as `null`.
        expect(seen).toEqual([{ ok: true }]);
        const [malformed, healthy] = document.querySelectorAll('capture-island');
        expect(malformed.hasAttribute('data-ndigo-hydrated')).toBe(false);
        expect(healthy.hasAttribute('data-ndigo-hydrated')).toBe(true);
    });

    test('is idempotent: a second scan re-runs no setter (WC-B)', () => {
        let calls = 0;
        class OnceIsland extends HTMLElement {
            set model(_model: unknown) {
                calls += 1;
            }
        }
        customElements.define('once-island', OnceIsland);
        document.body.innerHTML = '<once-island data-ndigo-island data-ndigo-model="{}"></once-island>';

        expect(hydrateIslands(document)).toBe(1);
        expect(calls).toBe(1);

        expect(hydrateIslands(document)).toBe(0);
        expect(calls).toBe(1);
    });
});
