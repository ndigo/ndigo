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

export interface DOMViewTarget extends EventBridgeViewTarget {
    readonly container: HTMLElement;
}

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

export class DOMElementViewTarget implements DOMViewTarget {
    #element: HTMLElement;
    #eventMap: Record<string, string>;
    #applicationContext: ApplicationEventEmitter | null;
    #listeners: Map<string, EventListener>;
    destroyed: boolean;

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

    setApplicationContext(applicationContext: ApplicationEventEmitter): void {
        if (this.destroyed) {
            return;
        }
        this.#applicationContext = applicationContext;
        this.listen();
    }

    setEventMap(eventMap: Record<string, string>): void {
        if (this.destroyed) {
            return;
        }
        this.#eventMap = eventMap;
        this.listen();
    }

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

    unlisten(): void {
        this.#listeners.forEach((listener, domEventName) => {
            this.#element.removeEventListener(domEventName, listener);
        });

        this.#listeners.clear();
    }

    prepare(route: Route): void {
        if (this.destroyed) {
            throw new IllegalStateError('Cannot prepare a destroyed DOMElementViewTarget.');
        }
        this.unlisten();
        this.#element.innerHTML = '';
    }

    commit(output: HTMLElement, model: any, route: Route): void {
        if (this.destroyed) {
            throw new IllegalStateError('Cannot commit to a destroyed DOMElementViewTarget.');
        }
        this.#element.appendChild(output);
        this.listen();
    }

    clear(): void {
        if (this.destroyed) {
            return;
        }
        this.unlisten();
        this.#element.innerHTML = '';
    }

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

export class WebComponentViewEngine implements ViewEngine {
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
