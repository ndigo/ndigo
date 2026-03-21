/**
 * @author Jeff Rose
 */

import { ViewTarget, ViewEngine, View } from '@blue/view';
import { Route } from '@blue/router';
import { WebComponentView } from './view';

export class DOMElementViewTarget implements ViewTarget {
    #element: HTMLElement;

    constructor(element: HTMLElement | null) {
        if (!element) {
            throw new TypeError('DOMElementViewTarget requires a root HTMLElement.');
        }

        this.#element = element;
    }

    prepare(route: Route): void {
        this.#element.innerHTML = '';
    }

    commit(output: HTMLElement, model: any, route: Route): void {
        this.#element.appendChild(output);
    }

    clear(): void {
        this.#element.innerHTML = '';
    }
}

export class WebComponentViewEngine implements ViewEngine {
    async render(view: View, model: any, target: ViewTarget, route: Route): Promise<void> {
        if (!(view instanceof WebComponentView)) {
            throw new TypeError('WebComponentViewEngine can only render WebComponentView instances.');
        }

        await target.prepare(route);

        const element = document.createElement(view.tagName);

        (element as any).model = model;

        await target.commit(element, model, route);
    }
}
