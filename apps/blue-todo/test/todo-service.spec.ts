/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { ApplicationContext } from '@blue/context';
import { ROUTER } from '../src/context-tokens';
import TodoService from '../src/todo-service';

describe('TodoService', () => {
    function createMockContext(refresh: Mock) {
        const listeners = new Map<string, Function[]>();
        return {
            listeners,
            context: {
                on: vi.fn((eventName: string, handler: Function) => {
                    const handlers = listeners.get(eventName) ?? [];
                    handlers.push(handler);
                    listeners.set(eventName, handlers);
                    return listeners.get;
                }),
                off: vi.fn((eventName: string, handler: Function) => {
                    const handlers = listeners.get(eventName) ?? [];
                    listeners.set(
                        eventName,
                        handlers.filter((registeredHandler) => registeredHandler !== handler)
                    );
                    return listeners.get;
                }),
                getValue: vi.fn((name: string | { description: string }) => {
                    if (
                        name === ROUTER ||
                        name === 'router' ||
                        (!!name && typeof name !== 'string' && name.description === 'router')
                    ) {
                        return { refresh };
                    }
                    return undefined;
                }),
            } as ApplicationContext,
        };
    }

    test('it should add item on user:todo:created and refresh route', () => {
        const refresh = vi.fn();
        const { listeners, context } = createMockContext(refresh);

        const service = new TodoService([{ text: 'a', checked: false }]);
        service.setApplicationContext(context);
        service.init();

        // Effect fires during init, calling refresh once
        expect(refresh).toHaveBeenCalledTimes(1);

        listeners.get('user:todo:created')?.[0]?.('new item');

        expect(service.items).toEqual([
            { text: 'a', checked: false },
            { text: 'new item', checked: false },
        ]);
        // Effect fires again on signal change
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    test('it should remove item on user:todo:removed and refresh route', () => {
        const refresh = vi.fn();
        const { listeners, context } = createMockContext(refresh);

        const service = new TodoService([
            { text: 'a', checked: false },
            { text: 'b', checked: true },
        ]);
        service.setApplicationContext(context);
        service.init();

        listeners.get('user:todo:removed')?.[0]?.(0);

        expect(service.items).toEqual([{ text: 'b', checked: true }]);
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    test('it should toggle item on user:todo:toggled and refresh route', () => {
        const refresh = vi.fn();
        const { listeners, context } = createMockContext(refresh);

        const service = new TodoService([{ text: 'a', checked: false }]);
        service.setApplicationContext(context);
        service.init();

        listeners.get('user:todo:toggled')?.[0]?.(0);

        expect(service.items).toEqual([{ text: 'a', checked: true }]);
        expect(refresh).toHaveBeenCalledTimes(2);
    });

    test('it should unsubscribe event listeners on destroy', () => {
        const refresh = vi.fn();
        const { listeners, context } = createMockContext(refresh);

        const service = new TodoService([{ text: 'a', checked: false }]);
        service.setApplicationContext(context);
        service.init();

        // Effect fires during init
        expect(refresh).toHaveBeenCalledTimes(1);

        service.destroy();

        expect(service.destroyed).toBe(true);
        expect(context.off).toHaveBeenCalledTimes(3);

        listeners.get('user:todo:created')?.[0]?.('new item');
        listeners.get('user:todo:removed')?.[0]?.(0);
        listeners.get('user:todo:toggled')?.[0]?.(0);

        expect(service.items).toEqual([{ text: 'a', checked: false }]);
        // refresh should not have been called again after destroy
        expect(refresh).toHaveBeenCalledTimes(1);

        service.destroy();
        expect(service.destroyed).toBe(true);
    });
});
