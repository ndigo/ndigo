import { describe, expect, test, vi } from 'vitest';
import TodoService from '../src/todo-service';

describe('TodoService', () => {
    test('it should add item on user:todo:created and refresh route', () => {
        const listeners = new Map<string, Function[]>();
        const refresh = vi.fn();
        const context = {
            on: vi.fn((eventName: string, handler: Function) => {
                const handlers = listeners.get(eventName) ?? [];
                handlers.push(handler);
                listeners.set(eventName, handlers);
                return context;
            }),
            off: vi.fn((eventName: string, handler: Function) => {
                const handlers = listeners.get(eventName) ?? [];
                listeners.set(
                    eventName,
                    handlers.filter((registeredHandler) => registeredHandler !== handler)
                );
                return context;
            }),
            getValue: vi.fn((name: string) => {
                if (name === 'router') {
                    return { refresh };
                }
                return undefined;
            }),
        };

        const service = new TodoService([{ text: 'a', checked: false }]);
        (service as any).setApplicationContext(context);
        service.init();

        listeners.get('user:todo:created')?.[0]('new item');

        expect(service.items).toEqual([
            { text: 'a', checked: false },
            { text: 'new item', checked: false },
        ]);
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    test('it should remove item on user:todo:removed and refresh route', () => {
        const listeners = new Map<string, Function[]>();
        const refresh = vi.fn();
        const context = {
            on: vi.fn((eventName: string, handler: Function) => {
                const handlers = listeners.get(eventName) ?? [];
                handlers.push(handler);
                listeners.set(eventName, handlers);
                return context;
            }),
            off: vi.fn((eventName: string, handler: Function) => {
                const handlers = listeners.get(eventName) ?? [];
                listeners.set(
                    eventName,
                    handlers.filter((registeredHandler) => registeredHandler !== handler)
                );
                return context;
            }),
            getValue: vi.fn((name: string) => {
                if (name === 'router') {
                    return { refresh };
                }
                return undefined;
            }),
        };

        const service = new TodoService([
            { text: 'a', checked: false },
            { text: 'b', checked: true },
        ]);
        (service as any).setApplicationContext(context);
        service.init();

        listeners.get('user:todo:removed')?.[0](0);

        expect(service.items).toEqual([{ text: 'b', checked: true }]);
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    test('it should toggle item on user:todo:toggled and refresh route', () => {
        const listeners = new Map<string, Function[]>();
        const refresh = vi.fn();
        const context = {
            on: vi.fn((eventName: string, handler: Function) => {
                const handlers = listeners.get(eventName) ?? [];
                handlers.push(handler);
                listeners.set(eventName, handlers);
                return context;
            }),
            off: vi.fn((eventName: string, handler: Function) => {
                const handlers = listeners.get(eventName) ?? [];
                listeners.set(
                    eventName,
                    handlers.filter((registeredHandler) => registeredHandler !== handler)
                );
                return context;
            }),
            getValue: vi.fn((name: string) => {
                if (name === 'router') {
                    return { refresh };
                }
                return undefined;
            }),
        };

        const service = new TodoService([{ text: 'a', checked: false }]);
        (service as any).setApplicationContext(context);
        service.init();

        listeners.get('user:todo:toggled')?.[0](0);

        expect(service.items).toEqual([{ text: 'a', checked: true }]);
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    test('it should unsubscribe event listeners on destroy', () => {
        const listeners = new Map<string, Function[]>();
        const refresh = vi.fn();
        const context = {
            on: vi.fn((eventName: string, handler: Function) => {
                const handlers = listeners.get(eventName) ?? [];
                handlers.push(handler);
                listeners.set(eventName, handlers);
                return context;
            }),
            off: vi.fn((eventName: string, handler: Function) => {
                const handlers = listeners.get(eventName) ?? [];
                listeners.set(
                    eventName,
                    handlers.filter((registeredHandler) => registeredHandler !== handler)
                );
                return context;
            }),
            getValue: vi.fn((name: string) => {
                if (name === 'router') {
                    return { refresh };
                }
                return undefined;
            }),
        };

        const service = new TodoService([{ text: 'a', checked: false }]);
        (service as any).setApplicationContext(context);
        service.init();

        service.destroy();

        expect(service.destroyed).toBe(true);
        expect(context.off).toHaveBeenCalledTimes(3);

        listeners.get('user:todo:created')?.[0]?.('new item');
        listeners.get('user:todo:removed')?.[0]?.(0);
        listeners.get('user:todo:toggled')?.[0]?.(0);

        expect(service.items).toEqual([{ text: 'a', checked: false }]);
        expect(refresh).not.toHaveBeenCalled();

        service.destroy();
        expect(service.destroyed).toBe(true);
    });
});
