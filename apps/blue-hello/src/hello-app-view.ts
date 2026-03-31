/**
 * @author opencode
 */

export default class HelloApp extends HTMLElement {
    set model(model: { message?: string }) {
        this.#message = model?.message ?? 'Hello, World!';
        this._render();
    }

    #message = 'Hello, World!';

    connectedCallback() {
        this._render();
    }

    _render() {
        this.innerHTML = `<h1>${this.#message}</h1><p>Welcome to BlueJS</p>`;
    }
}

window.customElements.define('hello-app', HelloApp);
