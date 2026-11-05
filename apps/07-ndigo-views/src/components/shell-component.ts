/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { TagMapping } from '@ndigo/view-webcomponent';

/**
 * The demo's component-module location: a self-registering web component.
 * Loading this module defines the `ndigo-views-shell` element (side effect);
 * the `@TagMapping` metadata lets the resolver map a logical name to the tag.
 */

@TagMapping('ndigo-views-shell')
export class NdigoViewsShell extends HTMLElement {
    #message = '';

    set model(model: { message?: string }) {
        this.#message = model?.message ?? '';
        this._render();
    }

    _render() {
        this.replaceChildren();
        const nav = document.createElement('nav');
        for (const [label, href] of [
            ['Shell', '#/'],
            ['Widget', '#/widget'],
            ['Report', '#/report'],
            ['Client', '#/client'],
        ] as const) {
            const link = document.createElement('a');
            link.href = href;
            link.textContent = label;
            nav.append(link);
        }
        this.append(nav);
        const title = document.createElement('h1');
        title.textContent = this.#message;
        this.append(title);
        const note = document.createElement('p');
        note.textContent = '[resolved by WebComponentViewResolver via TagMapping metadata]';
        this.append(note);
    }
}
