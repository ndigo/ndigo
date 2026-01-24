export default class MyTodoApp extends HTMLElement {
    #private;
    $input: any;
    $listContainer: any;
    checked: any;
    index: any;
    constructor();
    connectedCallback(): void;
    addItem(e: any): void;
    removeItem(e: any): void;
    toggleItem(e: any): void;
    disconnectedCallback(): void;
    _render(): void;
}
//# sourceMappingURL=todo-app-view.d.ts.map