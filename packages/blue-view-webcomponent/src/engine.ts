/**
 * @author Jeff Rose
 */

import { EventBridgeViewTarget, ViewEngine, View, ViewTarget } from '@blue/view';
import { Route } from '@blue/router';
import { IllegalStateError } from '@blue/core';
import { WebComponentView } from './view';

interface ApplicationEventEmitter {
    emit(type: string | symbol, ...data: unknown[]): boolean;
}

interface ModelAwareElement extends HTMLElement {
    model: unknown;
}

/**
 * View target contract for DOM-backed render destinations.
 *
 * It extends the shared event-bridge target with a concrete container element so the
 * engine can reuse or replace the rendered subtree.
 */
export interface DOMViewTarget extends EventBridgeViewTarget {
    /**
     * The host element that receives rendered output.
     */
    readonly container: HTMLElement;
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
        target.container instanceof HTMLElement
    );
};

/**
 * View target implementation that renders into a host HTMLElement.
 */
export class DOMElementViewTarget implements DOMViewTarget {
    #element: HTMLElement;
    #eventMap: Record<string, string>;
    #applicationContext: ApplicationEventEmitter | null;
    #listeners: Map<string, EventListener>;
    destroyed: boolean;

    /**
     * Creates a DOM-backed view target for the provided element.
     *
     * @param element - The root element that will host rendered content.
     * @param options - Event mapping used to bridge DOM events to the application context.
     * @throws {TypeError} When `element` is null or undefined.
     */
    constructor(
        element: HTMLElement | null,
        options: {
            eventMap?: Record<string, string>;
        } = {}
    ) {
        if (!element) {
            throw new TypeError('DOMElementViewTarget requires a root HTMLElement.');
        }

        this.#element = element;
        this.#eventMap = options.eventMap ?? {};
        this.#applicationContext = null;
        this.#listeners = new Map();
        this.destroyed = false;
    }

    get container(): HTMLElement {
        return this.#element;
    }

    /**
     * Connects the target to the application event emitter so DOM events can be forwarded.
     *
     * @param applicationContext - The application event emitter used for event bridging.
     */
    setApplicationContext(applicationContext: ApplicationEventEmitter): void {
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

        if (!this.#applicationContext) {
            return;
        }

        Object.entries(this.#eventMap).forEach(([domEventName, contextEventName]) => {
            const listener = (event: Event) => {
                const { detail } = event as CustomEvent;
                this.#applicationContext!.emit(contextEventName, detail);
            };

            this.#element.addEventListener(domEventName, listener);
            this.#listeners.set(domEventName, listener);
        });
    }

    /**
     * Removes all installed DOM event listeners from the host element.
     */
    unlisten(): void {
        this.#listeners.forEach((listener, domEventName) => {
            this.#element.removeEventListener(domEventName, listener);
        });

        this.#listeners.clear();
    }

    /**
     * Prepares the target for a new render pass by clearing existing content.
     *
     * @param route - The active route associated with the render pass.
     * @throws {IllegalStateError} When the target has already been destroyed.
     */
    prepare(route: Route): void {
        if (this.destroyed) {
            throw new IllegalStateError('Cannot prepare a destroyed DOMElementViewTarget.');
        }
        this.unlisten();
        this.#element.innerHTML = '';
    }

    /**
     * Appends rendered output to the host element and re-enables event bridging.
     *
     * @param output - The rendered DOM subtree to attach.
     * @param model - The model passed through from the view engine.
     * @param route - The active route associated with the render pass.
     * @throws {IllegalStateError} When the target has already been destroyed.
     */
    commit(output: HTMLElement, model: any, route: Route): void {
        if (this.destroyed) {
            throw new IllegalStateError('Cannot commit to a destroyed DOMElementViewTarget.');
        }
        this.#element.appendChild(output);
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
        this.#element.innerHTML = '';
    }

    /**
     * Permanently disables the target and releases its event listeners.
     */
    destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.unlisten();
        this.#element.innerHTML = '';
        this.#applicationContext = null;
        this.destroyed = true;
    }
}

/**
 * View engine that renders BlueJS views as custom elements.
 */
export class WebComponentViewEngine implements ViewEngine {
    /**
     * Renders a web component view into the target, reusing an existing matching element when possible.
     *
     * @param view - The view to render.
     * @param model - The view model passed to the component.
     * @param target - The destination for rendered output.
     * @param route - The active route for the render pass.
     * @returns A promise that resolves when rendering completes.
     * @throws {TypeError} When `view` is not a `WebComponentView`.
     */
    async render(view: View, model: any, target: ViewTarget, route: Route): Promise<void> {
        if (!(view instanceof WebComponentView)) {
            throw new TypeError('WebComponentViewEngine can only render WebComponentView instances.');
        }

        let element: HTMLElement | null = null;

        if (likeDOMViewTarget(target)) {
            const existingElement = target.container.firstElementChild;

            if (
                existingElement instanceof HTMLElement &&
                target.container.children.length === 1 &&
                existingElement.tagName.toLowerCase() === view.tagName.toLowerCase()
            ) {
                element = existingElement;
            }
        }

        if (!element) {
            await target.prepare(route);
            const output = document.createElement(view.tagName) as ModelAwareElement;
            output.model = model;
            await target.commit(output, model, route);
            return;
        }

        (element as ModelAwareElement).model = model;
    }
}
