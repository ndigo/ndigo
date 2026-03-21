interface TodoItem {
    text: string;
    checked: boolean;
}

export default class TodoService {
    #items: TodoItem[];

    get items(): TodoItem[] {
        return this.#items;
    }

    constructor(initialItems: TodoItem[] = []) {
        this.#items = initialItems;
    }
}
