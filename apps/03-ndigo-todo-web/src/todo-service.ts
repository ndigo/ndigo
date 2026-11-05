/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { signal, effect } from '@ndigo/signals';
import { ApplicationContext, AsApplicationContextAware } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { traced } from '@ndigo/telemetry';
import { getLogger } from '@ndigo/log';
import type { Router } from '@ndigo/router';
import { ROUTER } from './context-tokens';

const logger = getLogger('ndigo-todo-web:todo-service');

export interface TodoItem {
    text: string;
    checked: boolean;
}

export default class TodoService extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;
    #items: import('@ndigo/signals').Signal<TodoItem[]>;
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
            const router = this.applicationContext.getValue<Router | undefined>(ROUTER);
            if (router && typeof router.refresh === 'function') {
                router.refresh();
            }
        });

        this.#onCreated = (text: string) => {
            this.#items.value = [...this.#items.value, { text, checked: false }];
            this.#emitStats();
        };

        this.#onRemoved = (index: number) => {
            const updated = this.#items.value.filter((_, i) => i !== index);
            this.#items.value = updated;
            this.#emitStats();
        };

        this.#onToggled = (index: number) => {
            this.#items.value = this.#items.value.map((item, i) =>
                i === index ? { ...item, checked: !item.checked } : item
            );
            this.#emitStats();
        };

        this.applicationContext.on('user:todo:created', this.#onCreated);
        this.applicationContext.on('user:todo:removed', this.#onRemoved);
        this.applicationContext.on('user:todo:toggled', this.#onToggled);
    }

    /**
     * Emits the todo counts. The shell's relay gateway forwards this event
     * (`todo:stats:updated` → `site:nav:badge:update`), so the relay genuinely
     * carries traffic instead of only registering.
     */
    #emitStats(): void {
        const items = this.#items.value;

        this.applicationContext.emit('todo:stats:updated', {
            active: items.filter((item) => !item.checked).length,
            completed: items.filter((item) => item.checked).length,
            total: items.length,
        });
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
