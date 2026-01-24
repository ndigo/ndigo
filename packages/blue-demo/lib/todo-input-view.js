const templateTodoInput = document.createElement('template');
templateTodoInput.innerHTML = `
    <form id="new-todo-form">
        <input type="text" class="new-todo" placeholder="What needs to be done?" autofocus>
    </form>
`;
export default class TodoInput extends HTMLElement {
    $form;
    $input;
    constructor() {
        super();
        // Do not use shadow DOM to avoid problems when testing with selenium
        // this._root = this.attachShadow({ 'mode': 'open' });
    }
    connectedCallback() {
        console.log('TodoInput ADDED TO THE DOM');
        this.appendChild(templateTodoInput.content.cloneNode(true));
        this.$form = this.querySelector('form');
        this.$input = this.querySelector('input');
        this.$form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.$input.value)
                return;
            this.dispatchEvent(new CustomEvent('onSubmit', { detail: this.$input.value }));
            this.$input.value = '';
        });
    }
    disconnectedCallback() {
        console.log('TodoInput REMOVED TO THE DOM');
    }
}
window.customElements.define('todo-input', TodoInput);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1pbnB1dC12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RvZG8taW5wdXQtdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDN0QsaUJBQWlCLENBQUMsU0FBUyxHQUFHOzs7O0NBSTdCLENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxXQUFXO0lBQzlDLEtBQUssQ0FBQztJQUNOLE1BQU0sQ0FBQztJQUVQO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixxRUFBcUU7UUFDckUsc0RBQXNEO0lBQzFELENBQUM7SUFFRCxpQkFBaUI7UUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3hDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDL0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELG9CQUFvQjtRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNKO0FBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDIn0=