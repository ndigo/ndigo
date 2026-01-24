const templateTodo = document.createElement('template');
templateTodo.innerHTML = `
    <section class="todoapp">
        <header class="header">
            <h1>todos</h1>
            <todo-input></todo-input>
        </header>
        <section class="main">
            <input id="toggle-all" class="toggle-all" type="checkbox">
            <label for="toggle-all">Mark all as complete</label>
            <ul class="todo-list"></ul>
        </section>
        <footer class="footer">
            <span class="todo-count"></span>
            <ul class="filters">
                <li>
                    <a href="#/" class="selected">All</a>
                </li>
                <li>
                    <a href="#/active">Active</a>
                </li>
                <li>
                    <a href="#/completed">Completed</a>
                </li>
            </ul>
            <button class="clear-completed">Clear completed</button>
        </footer>
    </section>
`;

export default class MyTodoApp extends HTMLElement {
    #list;

    $input;
    $listContainer;
    checked;
    index;

    constructor() {
        super();
        // Do not use shadow DOM to avoid problems when testing with selenium
        // this._root = this.attachShadow({ 'mode': 'open' });
        // initial state
        this.#list = [
            { text: 'my initial todo', checked: false },
            { text: 'Learn about Web Components', checked: true },
        ];
    }

    connectedCallback() {
        this.appendChild(templateTodo.content.cloneNode(true));
        this.$input = this.querySelector('todo-input');
        this.$listContainer = this.querySelector('.todo-list');
        this.$input.addEventListener('onSubmit', this.addItem.bind(this));
        this._render();
    }

    addItem(e) {
        this.#list.push({ text: e.detail, checked: false });
        this._render();
    }

    removeItem(e) {
        this.#list.splice(e.detail, 1);
        this._render();
    }

    toggleItem(e) {
        const item = this.#list[e.detail];
        this.#list[e.detail] = Object.assign({}, item, {
            checked: !item.checked,
        });
        this._render();
    }

    disconnectedCallback() {}

    _render() {
        console.log('MyTodoApp::_render');
        if (!this.$listContainer) return;
        // empty the list
        this.$listContainer.innerHTML = '';
        this.#list.forEach((item, index) => {
            let $item = document.createElement('todo-item');
            $item.setAttribute('text', item.text);
            // @ts-ignore: ¯\_(ツ)_/¯
            $item.checked = item.checked;
            // @ts-ignore: ¯\_(ツ)_/¯
            $item.index = index;
            $item.addEventListener('onRemove', this.removeItem.bind(this));
            $item.addEventListener('onToggle', this.toggleItem.bind(this));
            this.$listContainer.appendChild($item);
        });
    }
}

window.customElements.define('todo-app', MyTodoApp);
