export default class TodoItem extends HTMLElement {
    #private;
    $checkbox: any;
    $item: any;
    $removeButton: any;
    $text: any;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: any, oldValue: any, newValue: any): void;
    set index(value: any);
    get index(): any;
    set checked(value: boolean);
    get checked(): boolean;
    _render(): void;
}
//# sourceMappingURL=todo-item-view.d.ts.map