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
    disconnectedCallback() { }
    _render() {
        console.log('MyTodoApp::_render');
        if (!this.$listContainer)
            return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1hcHAtdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90b2RvLWFwcC12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDeEQsWUFBWSxDQUFDLFNBQVMsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMkJ4QixDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sT0FBTyxTQUFVLFNBQVEsV0FBVztJQUM5QyxLQUFLLENBQUM7SUFFTixNQUFNLENBQUM7SUFDUCxjQUFjLENBQUM7SUFDZixPQUFPLENBQUM7SUFDUixLQUFLLENBQUM7SUFFTjtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IscUVBQXFFO1FBQ3JFLHNEQUFzRDtRQUN0RCxnQkFBZ0I7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNULEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7WUFDM0MsRUFBRSxJQUFJLEVBQUUsNEJBQTRCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtTQUN4RCxDQUFDO0lBQ04sQ0FBQztJQUVELGlCQUFpQjtRQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxPQUFPLENBQUMsQ0FBQztRQUNMLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxVQUFVLENBQUMsQ0FBQztRQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxVQUFVLENBQUMsQ0FBQztRQUNSLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRTtZQUMzQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTztTQUN6QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELG9CQUFvQixLQUFJLENBQUM7SUFFekIsT0FBTztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWM7WUFBRSxPQUFPO1FBQ2pDLGlCQUFpQjtRQUNqQixJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDL0IsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoRCxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsd0JBQXdCO1lBQ3hCLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM3Qix3QkFBd0I7WUFDeEIsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDcEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyJ9