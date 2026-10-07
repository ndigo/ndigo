/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { AbstractWebComponent } from '../src/abstract-web-component';

class DeclarativeShadowHost extends AbstractWebComponent {
    static get observedAttributes() {
        return [];
    }

    render(): void {}

    acquire(init?: ShadowRootInit): ShadowRoot {
        return this.ensureShadowRoot(init);
    }
}
customElements.define('declarative-host', DeclarativeShadowHost);

describe('AbstractWebComponent.ensureShadowRoot', () => {
    test('attaches an open shadow root when none exists', () => {
        const element = document.createElement('declarative-host') as DeclarativeShadowHost;

        const root = element.acquire();

        expect(root).toBe(element.shadowRoot);
        expect(root.mode).toBe('open');
    });

    test('honours the requested mode', () => {
        const element = document.createElement('declarative-host') as DeclarativeShadowHost;

        const root = element.acquire({ mode: 'closed' });

        expect(root.mode).toBe('closed');
        expect(element.shadowRoot).toBeNull();
    });

    test('adopts a pre-existing (declarative) shadow root instead of throwing', () => {
        const element = document.createElement('declarative-host') as DeclarativeShadowHost;
        // Emulate the HTML parser having created the root from a
        // `<template shadowrootmode="open">` before the element was defined.
        const parsed = element.attachShadow({ mode: 'open' });
        parsed.innerHTML = '<p>server fallback</p>';

        let acquired: ShadowRoot | undefined;
        expect(() => {
            acquired = element.acquire();
        }).not.toThrow();

        // The parsed root is reused (a second attachShadow would throw
        // "shadow root already exists") and its fallback content is untouched.
        expect(acquired).toBe(parsed);
        expect(parsed.textContent).toBe('server fallback');
    });
});
