import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { traced, getLogger } from '@blue/telemetry';
import { ROUTER } from './context-tokens';

const logger = getLogger('blue-demo:todo-service');

interface TodoItem {
    text: string;
    checked: boolean;
}

export default class TodoService extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;
    #items: TodoItem[];
    #onCreated?: (text: string) => void;
    #onRemoved?: (index: number) => void;
    #onToggled?: (index: number) => void;
    destroyed: boolean;

    get items(): TodoItem[] {
        return this.#items;
    }

    constructor(initialItems: TodoItem[] = []) {
        super();
        this.#items = initialItems;
        this.destroyed = false;
    }

    @traced
    init() {
        logger.info('Initializing todo service');

        this.#onCreated = (text: string) => {
            this.#items.push({ text, checked: false });
            this.#refreshCurrentRoute();
        };

        this.#onRemoved = (index: number) => {
            this.#items.splice(index, 1);
            this.#refreshCurrentRoute();
        };

        this.#onToggled = (index: number) => {
            const item = this.#items[index];
            this.#items[index] = {
                ...item,
                checked: !item.checked,
            };
            this.#refreshCurrentRoute();
        };

        this.applicationContext.on('user:todo:created', this.#onCreated);
        this.applicationContext.on('user:todo:removed', this.#onRemoved);
        this.applicationContext.on('user:todo:toggled', this.#onToggled);
    }

    @traced
    destroy(): void {
        logger.info('Destroying todo service');

        if (this.destroyed) {
            return;
        }

        if (this.#onCreated) {
            this.applicationContext.off('user:todo:created', this.#onCreated);
        }
        if (this.#onRemoved) {
            this.applicationContext.off('user:todo:removed', this.#onRemoved);
        }
        if (this.#onToggled) {
            this.applicationContext.off('user:todo:toggled', this.#onToggled);
        }

        this.destroyed = true;
    }

    #refreshCurrentRoute(): void {
        const router = this.applicationContext.getValue(ROUTER);
        if (router && typeof router.refresh === 'function') {
            router.refresh();
        }
    }
}
