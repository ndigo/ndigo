import { AbstractWebComponent } from '@blue/view-webcomponent';

export default class TodoItem extends AbstractWebComponent {
    #checked: boolean = false;
    #index: number = 0;
    #text: string = '';

    private $item!: HTMLElement;
    private $checkbox!: HTMLInputElement;
    private $text!: HTMLElement;

    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['text'];
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string) {
        if (name === 'text') {
            this.#text = newValue;
            this.requestUpdate();
        }
    }

    set index(value: number) {
        this.#index = value;
    }

    get index(): number {
        return this.#index;
    }

    set checked(value: boolean) {
        this.#checked = Boolean(value);
        this.requestUpdate();
    }

    get checked(): boolean {
        return this.hasAttribute('checked');
    }

    handleConnect(): void {
        this.$item = this.create('li', { className: 'item' });

        const view = this.create('div', { className: 'view' });
        const checkbox = this.create('input', { className: 'toggle', type: 'checkbox' });
        const label = this.create('label', { textContent: this.#text });
        const destroy = this.create('button', { className: 'destroy' });

        view.append(checkbox, label, destroy);
        this.$item.appendChild(view);
        this.appendChild(this.$item);

        this.$checkbox = checkbox as HTMLInputElement;
        this.$text = label;

        this.bindEvents({
            'click .destroy': 'handleRemove',
            'click .toggle': 'handleToggle',
        });

        this.render();
    }

    private handleRemove(): void {
        this.emit('onRemove', this.#index);
    }

    private handleToggle(): void {
        this.emit('onToggle', this.#index);
    }

    render(): void {
        // Guard: render may be called before handleConnect (e.g., from
        // attributeChangedCallback or property setters before appendChild).
        if (!this.$text) return;

        this.$text.textContent = this.#text;

        if (this.#checked) {
            this.$item.classList.add('completed');
            this.$checkbox.setAttribute('checked', '');
        } else {
            this.$item.classList.remove('completed');
            this.$checkbox.removeAttribute('checked');
        }
    }
}

window.customElements.define('todo-item', TodoItem);
