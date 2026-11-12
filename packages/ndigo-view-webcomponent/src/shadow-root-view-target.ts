/**
 * View target that renders into an element's (open) shadow root.
 */
import { IllegalStateError } from '@ndigo/core';
import { EventEmitter } from '@ndigo/context';
import type { Destroyable } from '@ndigo/factory';
import { DOMElementViewTarget, type DOMViewTarget, type RenderHost } from './engine';

/**
 * A view target that renders into a shadow root.
 *
 * If constructed with a host element, an open shadow root is attached on demand
 * (reusing an existing open shadow root when present). Closed shadow roots
 * cannot be rendered into and throw.
 */
export class ShadowRootViewTarget implements DOMViewTarget, Destroyable {
    #inner: DOMElementViewTarget;

    /**
     * Creates a shadow-root-backed view target.
     *
     * @param host - The host element (an open shadow root is attached if missing)
     *   or an existing `ShadowRoot`.
     * @param options - Event mapping used to bridge DOM events to the application context.
     * @throws When `host` is null/undefined or lacks `attachShadow`.
     * @throws When the host already has a closed shadow root.
     */
    constructor(host: Element | ShadowRoot | null, options: { eventMap?: Record<string, string> } = {}) {
        if (!host) {
            throw new TypeError('ShadowRootViewTarget requires a host element or shadow root.');
        }
        const shadowRoot = this.#resolveShadowRoot(host);
        this.#inner = new DOMElementViewTarget(shadowRoot, options);
    }

    /** The host node that receives rendered content. */
    get container(): RenderHost {
        return this.#inner.container;
    }

    /** Whether the target has been destroyed. */
    get destroyed(): boolean {
        return this.#inner.destroyed;
    }

    /**
     * Resolves (or attaches) the open shadow root for `host`.
     */
    #resolveShadowRoot(host: Element | ShadowRoot): ShadowRoot {
        if (host instanceof ShadowRoot) {
            return host;
        }
        const element = host as Element & { attachShadow?: (init: ShadowRootInit) => ShadowRoot };
        if (typeof element.attachShadow !== 'function') {
            throw new TypeError('ShadowRootViewTarget requires an element that supports attachShadow.');
        }
        if (element.shadowRoot) {
            return element.shadowRoot;
        }
        try {
            return element.attachShadow({ mode: 'open' });
        } catch {
            throw new IllegalStateError(
                'ShadowRootViewTarget cannot attach a shadow root — the host may already have a closed shadow root.'
            );
        }
    }

    setApplicationContext(applicationContext: EventEmitter): void {
        this.#inner.setApplicationContext(applicationContext);
    }

    setEventMap(eventMap: Record<string, string>): void {
        this.#inner.setEventMap(eventMap);
    }

    listen(): void {
        this.#inner.listen();
    }

    unlisten(): void {
        this.#inner.unlisten();
    }

    prepare(route: Parameters<DOMViewTarget['prepare']>[0]): void {
        this.#inner.prepare(route);
    }

    commit(output: unknown, model: unknown, route: Parameters<DOMViewTarget['commit']>[2]): void {
        this.#inner.commit(output as HTMLElement, model, route);
    }

    clear(): void {
        this.#inner.clear();
    }

    destroy(): void {
        this.#inner.destroy();
    }
}
