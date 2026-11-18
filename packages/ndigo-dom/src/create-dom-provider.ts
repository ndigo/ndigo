/**
 * Runtime-aware DOM provider factory.
 */
import type { DOMProvider } from './dom-provider';

/**
 * Creates an appropriate `DOMProvider` based on the current runtime environment.
 * Returns a `BrowserDOMProvider` when a browser DOM is available, or a
 * `LinkedomDOMProvider` for server-side environments.
 *
 * @returns A `DOMProvider` suitable for the current environment.
 *
 * @example
 * ```ts
 * const provider = await createDOMProvider();
 * const doc = provider.parseHTML('<h1>Title</h1>');
 * console.log(doc.querySelector('h1')?.textContent); // "Title"
 * ```
 */
export async function createDOMProvider(): Promise<DOMProvider> {
    if (typeof globalThis.document !== 'undefined' && typeof globalThis.DOMParser !== 'undefined') {
        const { BrowserDOMProvider } = await import('./browser-dom-provider');
        return new BrowserDOMProvider();
    }
    const { LinkedomDOMProvider } = await import('./linkedom-dom-provider');
    return new LinkedomDOMProvider();
}
