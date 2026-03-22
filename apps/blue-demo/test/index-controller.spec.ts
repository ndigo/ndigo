import { describe, expect, test } from 'vitest';
import { Route } from '@blue/router';
import IndexController from '../src/index-controller';

describe('IndexController', () => {
    const route = { path: '/index' } as Route;
    const todoService = {
        items: [
            { text: 'a', checked: false },
            { text: 'b', checked: true },
        ],
    };

    function createController(): IndexController {
        const controller = new IndexController();
        (controller as any).setApplicationContext({
            getValue: (name: string) => (name === 'todoService' ? todoService : null),
        });
        return controller;
    }

    test('handleIndex returns full model with all filter', () => {
        const controller = createController();
        const mv = controller.handleIndex(route);

        expect((mv.model as any).filter).toBe('all');
        expect((mv.model as any).items).toEqual(todoService.items);
    });

    test('handleAll returns filter-only model', () => {
        const controller = createController();
        const mv = controller.handleAll(route);

        expect((mv.model as any).filter).toBe('all');
        expect((mv.model as any).items).toBeUndefined();
    });

    test('handleActive and handleCompleted return respective filters', () => {
        const controller = createController();

        const active = controller.handleActive(route);
        const completed = controller.handleCompleted(route);

        expect((active.model as any).filter).toBe('active');
        expect((completed.model as any).filter).toBe('completed');
    });
});
