/**
 * View target that renders into a same-origin iframe's document.
 */
import { IllegalStateError } from '@ndigo/core';
import { EventEmitter } from '@ndigo/context';

import type { Destroyable } from '@ndigo/factory';
import { DOMElementViewTarget, type DOMViewTarget, type RenderHost } from './engine';

/**
 * A view target that renders into the document of a same-origin `<iframe>`.
 *
 * Cross-origin (or sandboxed-without-`allow-same-origin`) iframes cannot be
 * rendered into and throw `IllegalStateError`.
 */
export class IframeViewTarget implements DOMViewTarget, Destroyable {
    #iframe: HTMLIFrameElement;
    #eventMap: Record<string, string>;
    #applicationContext: EventEmitter | null;
    #inner: DOMElementViewTarget | null;
    #loadPromise: Promise<void> | null;
    #destroyed: boolean;

    /**
     * Creates an iframe-backed view target.
     *
     * @param iframe - The iframe whose document will host rendered content.
     * @param options - Event mapping used to bridge DOM events to the application context.
     * @throws When `iframe` is null/undefined.
     */
    constructor(iframe: HTMLIFrameElement | null, options: { eventMap?: Record<string, string> } = {}) {
        if (!iframe) {
            throw new TypeError('IframeViewTarget requires an iframe element.');
        }
        this.#iframe = iframe;
        this.#eventMap = options.eventMap ?? {};
        this.#applicationContext = null;
        this.#inner = null;
        this.#loadPromise = null;
        this.#destroyed = false;
    }

    /** The host node that receives rendered content (the iframe, until loaded). */
    get container(): RenderHost {
        const body = this.#iframe.contentDocument?.body;
        return (body ?? this.#iframe) as RenderHost;
    }

    /** Whether the target has been destroyed. */
    get destroyed(): boolean {
        return this.#destroyed;
    }

    /**
     * Ensures the iframe's document is available, waiting for `load` if needed.
     *
     * @throws When the iframe is cross-origin (no accessible document).
     */
    async #ensureLoaded(): Promise<void> {
        if (this.#iframe.contentDocument) {
            return;
        }
        if (!this.#loadPromise) {
            this.#loadPromise = new Promise<void>((resolve, reject) => {
                const onLoad = () => {
                    this.#iframe.removeEventListener('load', onLoad);
                    this.#iframe.removeEventListener('error', onError);
                    resolve();
                };
                const onError = () => {
                    this.#iframe.removeEventListener('load', onLoad);
                    this.#iframe.removeEventListener('error', onError);
                    reject(new IllegalStateError('IframeViewTarget: iframe failed to load.'));
                };
                this.#iframe.addEventListener('load', onLoad);
                this.#iframe.addEventListener('error', onError);
            });
        }
        await this.#loadPromise;
        if (!this.#iframe.contentDocument) {
            throw new IllegalStateError('IframeViewTarget requires a same-origin iframe.');
        }
    }

    /**
     * Resolves (or creates) the inner target over the iframe's document body.
     */
    #innerTarget(): DOMElementViewTarget {
        if (this.#inner) {
            return this.#inner;
        }
        const doc = this.#iframe.contentDocument;
        if (!doc) {
            throw new IllegalStateError('IframeViewTarget requires a same-origin iframe.');
        }
        const host = doc.body ?? doc.documentElement;
        const inner = new DOMElementViewTarget(host, { eventMap: this.#eventMap });
        if (this.#applicationContext) {
            inner.setApplicationContext(this.#applicationContext);
        }
        this.#inner = inner;
        return inner;
    }

    /**
     * Stores the application context and forwards it to the inner target.
     *
     * The iframe document may not exist yet, so the context is stored and
     * applied when the inner target is created.
     *
     * @param applicationContext - The application event emitter.
     */
    setApplicationContext(applicationContext: EventEmitter): void {
        if (this.#destroyed) {
            return;
        }
        this.#applicationContext = applicationContext;
        if (this.#inner) {
            this.#inner.setApplicationContext(applicationContext);
        }
    }

    /**
     * Stores the DOM event map and forwards it to the inner target.
     *
     * @param eventMap - DOM event name → application event name mapping.
     */
    setEventMap(eventMap: Record<string, string>): void {
        if (this.#destroyed) {
            return;
        }
        this.#eventMap = eventMap;
        if (this.#inner) {
            this.#inner.setEventMap(eventMap);
        }
    }

    /**
     * Re-installs the inner target's DOM event listeners.
     */
    listen(): void {
        if (this.#destroyed || !this.#inner) {
            return;
        }
        this.#inner.listen();
    }

    /**
     * Removes the inner target's DOM event listeners.
     */
    unlisten(): void {
        if (this.#inner) {
            this.#inner.unlisten();
        }
    }

    /**
     * Prepares the iframe document for a new render pass, loading it first.
     *
     * @param route - The route being rendered.
     * @returns A promise that resolves once the document is ready.
     */
    async prepare(route: Parameters<DOMViewTarget['prepare']>[0]): Promise<void> {
        if (this.#destroyed) {
            throw new IllegalStateError('Cannot prepare a destroyed IframeViewTarget.');
        }
        await this.#ensureLoaded();
        this.#innerTarget().prepare(route);
    }

    /**
     * Commits rendered output to the iframe document, loading it first.
     *
     * @param output - The rendered output (DOM subtree or markup string).
     * @param model - The model passed through from the view engine.
     * @param route - The route being rendered.
     * @returns A promise that resolves once the output is committed.
     */
    async commit(output: unknown, model: unknown, route: Parameters<DOMViewTarget['commit']>[2]): Promise<void> {
        if (this.#destroyed) {
            throw new IllegalStateError('Cannot commit to a destroyed IframeViewTarget.');
        }
        await this.#ensureLoaded();
        this.#innerTarget().commit(output, model, route);
    }

    /**
     * Clears the iframe document without destroying the target.
     */
    clear(): void {
        if (this.#destroyed) {
            return;
        }
        if (this.#inner) {
            this.#inner.clear();
        }
    }

    /**
     * Destroys the target and releases the iframe document's listeners.
     */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }
        if (this.#inner) {
            this.#inner.destroy();
            this.#inner = null;
        }
        this.#applicationContext = null;
        this.#destroyed = true;
    }
}
