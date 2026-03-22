const templateTodoItem = document.createElement('template');
templateTodoItem.innerHTML = `
    <li class="item">
        <div class="view">
            <input class="toggle" type="checkbox">
            <label></label>
            <button class="destroy"></button>
        </div>
    </li>
`;

export default class TodoItem extends HTMLElement {
    #checked: boolean;
    #index: number = 0;
    #text: string;

    $checkbox: HTMLInputElement | null = null;
    $item: HTMLElement | null = null;
    $removeButton: HTMLButtonElement | null = null;
    $text: HTMLElement | null = null;

    constructor() {
        super();
        // Do not use shadow DOM to avoid problems when testing with selenium
        // this._root = this.attachShadow({ 'mode': 'open' });
        this.#checked = false;
        this.#text = '';
    }

    connectedCallback() {
        this.appendChild(templateTodoItem.content.cloneNode(true));
        this.$item = this.querySelector('.item');
        this.$removeButton = this.querySelector('.destroy');
        this.$text = this.querySelector('label');
        this.$checkbox = this.querySelector('input');
        this.$removeButton!.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('onRemove', { detail: this.index, bubbles: true }));
        });
        this.$checkbox!.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('onToggle', { detail: this.index, bubbles: true }));
        });
        this._render();
    }

    disconnectedCallback() {}

    static get observedAttributes() {
        return ['text'];
    }
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string) {
        void name;
        void oldValue;
        this.#text = newValue;
    }

    set index(value: number) {
        this.#index = value;
    }

    get index(): number {
        return this.#index;
    }

    set checked(value: boolean) {
        this.#checked = Boolean(value);
    }

    get checked(): boolean {
        return this.hasAttribute('checked');
    }

    _render() {
        if (!this.$item) return;
        this.$text!.textContent = this.#text;
        if (this.#checked) {
            this.$item.classList.add('completed');
            this.$checkbox!.setAttribute('checked', '');
        } else {
            this.$item.classList.remove('completed');
            this.$checkbox!.removeAttribute('checked');
        }
    }
}

window.customElements.define('todo-item', TodoItem);
