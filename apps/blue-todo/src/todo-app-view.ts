import { AbstractWebComponent, TagMapping } from '@blue/view-webcomponent';
import { toAccountShellRoute, toTodoShellRoute } from './shell-composition';
import './shell-nav-view';

const allRoute = `#${toTodoShellRoute('/')}`;
const activeRoute = `#${toTodoShellRoute('/active')}`;
const completedRoute = `#${toTodoShellRoute('/completed')}`;
const accountRoute = `#${toAccountShellRoute('/')}`;

interface TodoItem {
    text: string;
    checked: boolean;
}

interface TodoModel {
    items?: TodoItem[];
    filter?: 'all' | 'active' | 'completed';
}

@TagMapping('todo-app')
export default class MyTodoApp extends AbstractWebComponent {
    #list: TodoItem[] = [];
    #filter: 'all' | 'active' | 'completed' = 'all';

    private $input!: HTMLElement;
    private $listContainer!: HTMLElement;
    private $shellNav!: HTMLElement;

    set model(model: TodoModel) {
        if (typeof model?.items !== 'undefined') {
            this.#list = model.items;
        }
        this.#filter = model?.filter ?? 'all';
        this.requestUpdate();
    }

    handleConnect(): void {
        this.setupStructure();

        this.$input = this.select('todo-input') as HTMLElement;
        this.$listContainer = this.select('.todo-list') as HTMLElement;
        this.$shellNav = this.select('shell-nav') as HTMLElement;

        this.bindEvents({
            'change #toggle-all': 'handleToggleAll',
            'click .clear-completed': 'handleClearCompleted',
        });

        this.render();
    }

    private handleToggleAll(e: Event): void {
        const checkbox = e.target as HTMLInputElement;
        this.emit('onToggleAll', checkbox.checked);
    }

    private handleClearCompleted(): void {
        this.emit('onClearCompleted');
    }

    private setupStructure(): void {
        const section = this.create('section', { className: 'todoapp' });

        const header = this.create('header', { className: 'header' });
        header.appendChild(this.create('h1', { textContent: 'todos' }));
        header.appendChild(this.create('todo-input'));

        const main = this.create('section', { className: 'main' });
        const toggleAll = this.create('input', { id: 'toggle-all', className: 'toggle-all', type: 'checkbox' });
        const toggleLabel = this.create('label', { textContent: 'Mark all as complete' });
        toggleLabel.setAttribute('for', 'toggle-all');
        const list = this.create('ul', { className: 'todo-list' });
        main.append(toggleAll, toggleLabel, list);

        const footer = this.create('footer', { className: 'footer' });
        const count = this.create('span', { className: 'todo-count' });
        const nav = this.create('shell-nav');
        const clearBtn = this.create('button', { className: 'clear-completed', textContent: 'Clear completed' });
        footer.append(count, nav, clearBtn);

        section.append(header, main, footer);
        this.appendChild(section);
    }

    render(): void {
        if (!this.$listContainer) return;

        if (this.$shellNav) {
            (this.$shellNav as any).model = {
                containerClass: 'filters',
                items: [
                    { href: allRoute, label: 'All', selected: this.#filter === 'all' },
                    { href: activeRoute, label: 'Active', selected: this.#filter === 'active' },
                    { href: completedRoute, label: 'Completed', selected: this.#filter === 'completed' },
                    { href: accountRoute, label: 'Account' },
                ],
                mode: 'list',
            };
        }

        const filteredList = this.#list.filter((item) => {
            if (this.#filter === 'active') return !item.checked;
            if (this.#filter === 'completed') return item.checked;
            return true;
        });

        this.$listContainer.innerHTML = '';
        filteredList.forEach((item) => {
            const index = this.#list.indexOf(item);
            const $item = this.create('todo-item') as any;
            $item.setAttribute('text', item.text);
            $item.checked = item.checked;
            $item.index = index;
            this.$listContainer.appendChild($item);
        });
    }
}
