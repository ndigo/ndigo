/**
 * @module blue-view-webcomponent
 * @since 1.0.0
 * @author Jeff Rose
 */
import { EventBridgeViewTarget } from '@blue/view';
import { Route } from '@blue/router';
import { IllegalStateError } from '@blue/core';
import { EventEmitter } from '@blue/context';
import { ModelAwareElement } from './view';
import { DOMEventBinder } from './_dom-event-binder';

/**
 * A DOM node that can host a rendered subtree: an element, a shadow root,
 * an iframe document, or a fragment.
 */
export type RenderHost = Element | ShadowRoot | DocumentFragment | Document;

/**
 * View target contract for DOM-backed render destinations.
 *
 * It extends the shared event-bridge target with a concrete host node so the
 * target can reuse or replace the rendered subtree.
 */
export interface DOMViewTarget extends EventBridgeViewTarget {
    /**
     * The host node that receives rendered output.
     */
    readonly container: RenderHost;
}

/**
 * Detects whether a value implements the DOM-specific view target contract.
 *
 * @param value - The value to inspect.
 * @returns `true` when the value behaves like a DOM view target.
 */
export const likeDOMViewTarget = (value: unknown): value is DOMViewTarget => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const target = value as Partial<DOMViewTarget>;

    return (
        typeof target.prepare === 'function' &&
        typeof target.commit === 'function' &&
        typeof target.clear === 'function' &&
        typeof target.setEventMap === 'function' &&
        target.container instanceof Node
    );
};

/**
 * View target implementation that renders into a host DOM node.
 */
export class DOMElementViewTarget implements DOMViewTarget {
    #host: RenderHost;
    #eventMap: Record<string, string>;
    #applicationContext: EventEmitter | null;
    #binder: DOMEventBinder;
    destroyed: boolean;

    /**
     * Creates a DOM-backed view target for the provided host node.
     *
     * @param host - The host node that will contain rendered content.
     * @param options - Event mapping used to bridge DOM events to the application context.
     * @throws {TypeError} When `host` is null or undefined.
     */
    constructor(
        host: RenderHost | null,
        options: {
            eventMap?: Record<string, string>;
        } = {}
    ) {
        if (!host) {
            throw new TypeError('DOMElementViewTarget requires a container node.');
        }

        this.#host = host;
        this.#eventMap = options.eventMap ?? {};
        this.#applicationContext = null;
        this.#binder = new DOMEventBinder(host);
        this.destroyed = false;
    }

    get container(): RenderHost {
        return this.#host;
    }

    /**
     * Connects the target to the application event emitter so DOM events can be forwarded.
     *
     * @param applicationContext - The application event emitter used for event bridging.
     */
    setApplicationContext(applicationContext: EventEmitter): void {
        if (this.destroyed) {
            return;
        }
        this.#applicationContext = applicationContext;
        this.listen();
    }

    /**
     * Replaces the DOM-to-application event map and refreshes listeners.
     *
     * @param eventMap - Mapping from DOM event names to application event names.
     */
    setEventMap(eventMap: Record<string, string>): void {
        if (this.destroyed) {
            return;
        }
        this.#eventMap = eventMap;
        this.listen();
    }

    /**
     * Installs DOM event listeners for the current event map.
     *
     * Existing listeners are removed first so repeated calls stay idempotent.
     */
    listen(): void {
        if (this.destroyed) {
            return;
        }
        this.unlisten();

        const applicationContext = this.#applicationContext;
        if (!applicationContext) {
            return;
        }

        Object.entries(this.#eventMap).forEach(([domEventName, contextEventName]) => {
            this.#binder.bind(domEventName, (event: Event) => {
                const { detail } = event as CustomEvent;
                applicationContext.emit(contextEventName, detail);
            });
        });
    }

    /**
     * Removes all installed DOM event listeners from the host node.
     */
    unlisten(): void {
        this.#binder.unbindAll();
    }

    /**
     * Prepares the target for a new render pass by clearing existing content.
     *
     * @param route - The active route associated with the render pass.
     * @throws {IllegalStateError} When the target has already been destroyed.
     */
    prepare(route: Route): void {
        void route;
        if (this.destroyed) {
            throw new IllegalStateError('Cannot prepare a destroyed DOMElementViewTarget.');
        }
        this.unlisten();
        this.#host.replaceChildren();
    }

    /**
     * Commits rendered output to the host node and re-enables event bridging.
     *
     * A single existing child whose tag name matches the output is reused by
     * updating its model instead of being replaced, so web component model
     * updates drive re-rendering in place.
     *
     * @param output - The rendered DOM subtree to attach.
     * @param model - The model passed through from the view engine.
     * @param route - The active route associated with the render pass.
     * @throws {IllegalStateError} When the target has already been destroyed.
     */
    commit(output: HTMLElement, model: unknown, route: Route): void {
        if (this.destroyed) {
            throw new IllegalStateError('Cannot commit to a destroyed DOMElementViewTarget.');
        }

        const children = this.#host.children;
        if (children.length === 1) {
            const existing = children[0] as HTMLElement;
            if (existing.tagName !== undefined && existing.tagName.toLowerCase() === output.tagName.toLowerCase()) {
                (existing as ModelAwareElement).model = model;
                this.listen();
                return;
            }
        }

        this.prepare(route);
        this.#host.appendChild(output);
        this.listen();
    }

    /**
     * Clears rendered content without permanently destroying the target.
     */
    clear(): void {
        if (this.destroyed) {
            return;
        }
        this.unlisten();
        this.#host.replaceChildren();
    }

    /**
     * Permanently disables the target and releases its event listeners.
     */
    destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.unlisten();
        this.#host.replaceChildren();
        this.#applicationContext = null;
        this.destroyed = true;
    }
}
