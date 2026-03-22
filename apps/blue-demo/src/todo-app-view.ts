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

interface TodoItem {
    text: string;
    checked: boolean;
}

interface TodoModel {
    items?: TodoItem[];
    filter?: 'all' | 'active' | 'completed';
}

interface TodoItemElement extends HTMLElement {
    checked: boolean;
    index: number;
}

export default class MyTodoApp extends HTMLElement {
    #list: TodoItem[];
    #filter: 'all' | 'active' | 'completed';

    $input: any;
    $listContainer: HTMLElement | null = null;
    checked: boolean = false;
    index: number = 0;

    set model(model: TodoModel) {
        if (typeof model?.items !== 'undefined') {
            this.#list = model.items;
        }

        this.#filter = model?.filter ?? 'all';
        this._render();
    }

    constructor() {
        super();
        // Do not use shadow DOM to avoid problems when testing with selenium
        // this._root = this.attachShadow({ 'mode': 'open' });
        // initial state is now passed via model property
        this.#list = [];
        this.#filter = 'all';
    }

    connectedCallback() {
        this.appendChild(templateTodo.content.cloneNode(true));
        this.$input = this.querySelector('todo-input');
        this.$listContainer = this.querySelector('.todo-list');
        this._render();
    }

    disconnectedCallback() {}

    _render() {
        console.log('MyTodoApp::_render');
        if (!this.$listContainer) return;

        const filterLinks = this.querySelectorAll('.filters a');
        filterLinks.forEach((link) => {
            const href = link.getAttribute('href');
            const isSelected =
                (this.#filter === 'all' && href === '#/') ||
                (this.#filter === 'active' && href === '#/active') ||
                (this.#filter === 'completed' && href === '#/completed');
            link.classList.toggle('selected', isSelected);
        });

        const filteredList = this.#list.filter((item) => {
            if (this.#filter === 'active') {
                return item.checked === false;
            }

            if (this.#filter === 'completed') {
                return item.checked === true;
            }

            return true;
        });

        // empty the list
        this.$listContainer.innerHTML = '';
        filteredList.forEach((item) => {
            const index = this.#list.indexOf(item);
            const $item = document.createElement('todo-item') as TodoItemElement;
            $item.setAttribute('text', item.text);
            $item.checked = item.checked;
            $item.index = index;
            this.$listContainer!.appendChild($item);
        });
    }
}

window.customElements.define('todo-app', MyTodoApp);
