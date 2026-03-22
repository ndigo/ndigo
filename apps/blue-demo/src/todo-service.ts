import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';

interface TodoItem {
    text: string;
    checked: boolean;
}

interface RefreshableRouter {
    refresh(): void;
}

export default class TodoService extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;
    #items: TodoItem[];

    get items(): TodoItem[] {
        return this.#items;
    }

    constructor(initialItems: TodoItem[] = []) {
        super();
        this.#items = initialItems;
    }

    init() {
        this.applicationContext.on('user:todo:created', (text: string) => {
            this.#items.push({ text, checked: false });
            this.#refreshCurrentRoute();
        });

        this.applicationContext.on('user:todo:removed', (index: number) => {
            this.#items.splice(index, 1);
            this.#refreshCurrentRoute();
        });

        this.applicationContext.on('user:todo:toggled', (index: number) => {
            const item = this.#items[index];
            this.#items[index] = {
                ...item,
                checked: !item.checked,
            };
            this.#refreshCurrentRoute();
        });
    }

    #refreshCurrentRoute(): void {
        const router = this.applicationContext.getValue<RefreshableRouter>('router');
        if (router && typeof router.refresh === 'function') {
            router.refresh();
        }
    }
}
