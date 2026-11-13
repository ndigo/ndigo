/**
 * Selector-driven view targeter: the engine behind name, route, and attribute targeting.
 */
import { ApplicationContext, likeApplicationContextAware } from '@ndigo/context';
import { Destroyable, likeDestroyable } from '@ndigo/factory';
import { getLogger } from '@ndigo/log';
import { BoundedCache, ViewTargeter, ViewTargetingContext, ViewTarget } from '@ndigo/view';

import { DOMElementViewTarget, type DOMViewTarget } from './engine';
import { IframeViewTarget } from './iframe-view-target';
import { ShadowRootViewTarget } from './shadow-root-view-target';

const logger = getLogger('ndigo-view-webcomponent:selector-view-targeter');

/**
 * Resolves a CSS selector for one render pass.
 *
 * Returning `null` or `undefined` declines. The function may throw; the
 * targeter catches the error, logs at debug level, and declines, so a buggy
 * selector can never fail a render.
 *
 * Selector text must come from static configuration. A selector derived from
 * request data must be escaped (`CSS.escape`) before interpolation.
 */
export type ViewTargetSelector = (context: ViewTargetingContext) => string | null | undefined;

/**
 * Where a selected element receives rendered content.
 *
 * - `element` — the element's own children (default).
 * - `shadow` — an open shadow root attached to the element.
 * - `iframe` — a same-origin iframe's document.
 */
export type ViewTargetMount = 'element' | 'shadow' | 'iframe';

/**
 * Options for {@link SelectorViewTargeter}.
 */
export interface SelectorViewTargeterOptions {
    /** Mount mode for resolved elements. Defaults to `element`. */
    mount?: ViewTargetMount;
    /** DOM event → application event map bridged by cached targets. */
    eventMap?: Record<string, string>;
    /** Document searched for selectors. Defaults to the global `document`. */
    document?: Document;
}

/**
 * Resolves a selector to a cached DOM view target.
 *
 * Targets are created once per `selector + mount` pair and reused, so event
 * bridging and rendered state survive across renders. Evicted targets are
 * destroyed (their listeners released) and `destroy()` clears the cache.
 *
 * A selector that matches nothing, matches a disconnected element, or throws
 * declines (`null`) — assignment never breaks routing. Cached targets are
 * keyed by selector, so selectors should be stable per destination; a
 * selector derived from unbounded request data will churn the cache.
 */
export class SelectorViewTargeter implements ViewTargeter, Destroyable {
    readonly #select: ViewTargetSelector;
    readonly #mount: ViewTargetMount;
    readonly #eventMap: Record<string, string>;
    readonly #document: Document | undefined;
    #applicationContext: ApplicationContext | null = null;
    #destroyed = false;

    readonly #cache: BoundedCache<DOMViewTarget & Destroyable>;

    /**
     * Creates a selector-driven targeter.
     *
     * @param select - Resolves the selector for a render pass.
     * @param options - Mount mode, event map, and document override.
     */
    constructor(select: ViewTargetSelector, options: SelectorViewTargeterOptions = {}) {
        this.#select = select;
        this.#mount = options.mount ?? 'element';
        this.#eventMap = options.eventMap ?? {};
        this.#document = options.document;
        this.#cache = new BoundedCache<DOMViewTarget & Destroyable>((target) => target.destroy());
    }

    /** Whether the targeter has been destroyed. */
    get destroyed(): boolean {
        return this.#destroyed;
    }

    /**
     * Stores the application context for targets that do not exist yet.
     *
     * Targets are created lazily, so forwarding to current entries is not
     * enough — each target created later receives the stored context.
     *
     * @param applicationContext - The application event emitter.
     */
    setApplicationContext(applicationContext: ApplicationContext): void {
        if (this.#destroyed) {
            return;
        }
        this.#applicationContext = applicationContext;
    }

    /**
     * Resolves the target for a render pass.
     *
     * @param context - The render pass being targeted.
     * @returns The cached (or newly created) target, or `null` to decline.
     */
    resolveViewTarget(context: ViewTargetingContext): ViewTarget | null {
        if (this.#destroyed) {
            return null;
        }

        const selector = this.#resolveSelector(context);
        if (!selector) {
            return null;
        }

        const key = JSON.stringify([this.#mount, selector]),
            cached = this.#cache.get(key);

        if (cached) {
            return cached;
        }

        const target = this.#createTarget(selector);
        if (!target) {
            return null;
        }

        this.#cache.set(key, target);
        return target;
    }

    /**
     * Destroys every cached target and stops resolving new ones.
     */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }
        this.#destroyed = true;
        this.#cache.clear();
    }

    /**
     * Runs the selector function, turning any failure into a decline.
     */
    #resolveSelector(context: ViewTargetingContext): string | null {
        let selector: string | null | undefined;

        try {
            selector = this.#select(context);
        } catch (error) {
            logger.debug(`Declining a throwing view-target selector: ${String(error)}`);
            return null;
        }

        if (typeof selector !== 'string' || selector.length === 0) {
            return null;
        }

        return selector;
    }

    /**
     * Creates a target for `selector`, or declines when the element is missing
     * or detached.
     */
    #createTarget(selector: string): (DOMViewTarget & Destroyable) | null {
        let host: Element | null;

        try {
            host = (this.#document ?? document).querySelector(selector);
        } catch (error) {
            // A malformed selector is a configuration bug, not a render failure.
            logger.debug(`Declining malformed view-target selector "${selector}": ${String(error)}`);
            return null;
        }

        if (!host || !host.isConnected) {
            return null;
        }

        let target: DOMViewTarget & Destroyable;

        switch (this.#mount) {
            case 'shadow':
                target = new ShadowRootViewTarget(host, { eventMap: this.#eventMap });
                break;
            case 'iframe':
                target = new IframeViewTarget(host as HTMLIFrameElement, { eventMap: this.#eventMap });
                break;
            default:
                target = new DOMElementViewTarget(host, { eventMap: this.#eventMap });
        }

        if (this.#applicationContext && likeApplicationContextAware(target)) {
            target.setApplicationContext(this.#applicationContext);
        }

        return target;
    }
}

/**
 * Escapes an identifier for use in a CSS selector.
 *
 * Uses the platform `CSS.escape` when present (browsers, jsdom) and falls back
 * to a conservative backslash escape so the helper is safe in bare Node too.
 */
const escapeIdentifier = (value: string): string => {
    const cssEscape = (globalThis as { CSS?: { escape?: (text: string) => string } }).CSS?.escape;
    if (typeof cssEscape === 'function') {
        return cssEscape(value);
    }
    return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
};

/**
 * Builds a selector for an element id.
 *
 * The safe short form for the convention `view "hello" → element #hello`:
 * escapes the name so a request-derived value cannot break out of the
 * selector. Prefer this (or an explicit map) over interpolating a name.
 *
 * @param name - The element id.
 * @returns An escaped id selector.
 */
export const idSelector = (name: string): string => `#${escapeIdentifier(name)}`;

/**
 * Destroys every targeter in `targeters` that owns cached targets.
 *
 * @param targeters - The installed chain.
 */
export const destroyViewTargeters = (targeters: readonly ViewTargeter[] | undefined): void => {
    for (const targeter of targeters ?? []) {
        if (likeDestroyable(targeter)) {
            targeter.destroy();
        }
    }
};
