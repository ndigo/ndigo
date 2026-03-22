/**
 * @author Jeff Rose
 */

import { ViewTarget, ViewEngine, View } from '@blue/view';
import { Route } from '@blue/router';
import { WebComponentView } from './view';

interface ApplicationEventEmitter {
    emit(type: string | symbol, ...data: unknown[]): boolean;
}

interface ModelAwareElement extends HTMLElement {
    model: unknown;
}

export class DOMElementViewTarget implements ViewTarget {
    #element: HTMLElement;
    #eventMap: Record<string, string>;
    #applicationContext: ApplicationEventEmitter | null;
    #listeners: Map<string, EventListener>;

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
    }

    get container(): HTMLElement {
        return this.#element;
    }

    setApplicationContext(applicationContext: ApplicationEventEmitter): void {
        this.#applicationContext = applicationContext;
        this.listen();
    }

    setEventMap(eventMap: Record<string, string>): void {
        this.#eventMap = eventMap;
        this.listen();
    }

    listen(): void {
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
        this.unlisten();
        this.#element.innerHTML = '';
    }

    commit(output: HTMLElement, model: any, route: Route): void {
        this.#element.appendChild(output);
        this.listen();
    }

    clear(): void {
        this.unlisten();
        this.#element.innerHTML = '';
    }
}

export class WebComponentViewEngine implements ViewEngine {
    async render(view: View, model: any, target: ViewTarget, route: Route): Promise<void> {
        if (!(view instanceof WebComponentView)) {
            throw new TypeError('WebComponentViewEngine can only render WebComponentView instances.');
        }

        let element: HTMLElement | null = null;

        if (target instanceof DOMElementViewTarget) {
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
