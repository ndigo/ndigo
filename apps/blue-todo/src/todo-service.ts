import { signal, effect } from '@blue/signals';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { traced, getLogger } from '@blue/telemetry';
import { ROUTER } from './context-tokens';

const logger = getLogger('blue-todo:todo-service');

interface TodoItem {
    text: string;
    checked: boolean;
}

export default class TodoService extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;
    #items: import("@blue/signals").Signal<TodoItem[]>;
    #onCreated?: (text: string) => void;
    #onRemoved?: (index: number) => void;
    #onToggled?: (index: number) => void;
    #refreshEffect: (() => void) | null = null;
    destroyed: boolean;

    get items(): TodoItem[] {
        return this.#items.value;
    }

    constructor(initialItems: TodoItem[] = []) {
        super();
        this.#items = signal(initialItems);
        this.destroyed = false;
    }

    @traced
    init() {
        logger.info('Initializing todo service');

        // Auto-refresh the route whenever items change
        this.#refreshEffect = effect(() => {
            // Read the signal to subscribe to it
            const _ = this.#items.value;
            const router = this.applicationContext.getValue(ROUTER) as any;
            if (router && typeof router.refresh === 'function') {
                router.refresh();
            }
        });

        this.#onCreated = (text: string) => {
            this.#items.value = [...this.#items.value, { text, checked: false }];
        };

        this.#onRemoved = (index: number) => {
            const updated = this.#items.value.filter((_, i) => i !== index);
            this.#items.value = updated;
        };

        this.#onToggled = (index: number) => {
            this.#items.value = this.#items.value.map((item, i) =>
                i === index ? { ...item, checked: !item.checked } : item
            );
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

        if (this.#refreshEffect) {
            this.#refreshEffect();
            this.#refreshEffect = null;
        }

        this.destroyed = true;
    }
}