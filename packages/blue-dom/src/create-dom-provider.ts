/**
 * @author Jeff Rose
 */

import type { DOMProvider } from './dom-provider';

/**
 * Creates an appropriate `DOMProvider` based on the current runtime environment.
 * Returns a `BrowserDOMProvider` when a browser DOM is available, or a
 * `LinkedomDOMProvider` for server-side environments.
 *
 * @returns A `DOMProvider` suitable for the current environment.
 */
export async function createDOMProvider(): Promise<DOMProvider> {
    if (typeof globalThis.document !== 'undefined' && typeof globalThis.DOMParser !== 'undefined') {
        const { BrowserDOMProvider } = await import('./browser-dom-provider');
        return new BrowserDOMProvider();
    }
    const { LinkedomDOMProvider } = await import('./linkedom-dom-provider');
    return new LinkedomDOMProvider();
}
