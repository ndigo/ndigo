import { describe, expect, test } from 'vitest';
import { Route } from '@blue/router';
import { WicketView } from '@blue/view-wicket';
import { NOTES_SERVICE } from '../src/context-tokens';
import NotesController from '../src/notes-controller';

describe('NotesController', () => {
    const route = { path: '/' } as Route;
    const notesService = {
        items: [
            { id: '1', title: 'First Note', body: 'Body 1', pinned: false },
            { id: '2', title: 'Second Note', body: 'Body 2', pinned: true },
        ],
    };

    function createController(): NotesController {
        const controller = new NotesController();
        (controller as any).setApplicationContext({
            getValue: (name: string | { description: string }) =>
                name === 'notesService' || (typeof name !== 'string' && name.description === NOTES_SERVICE.description)
                    ? notesService
                    : null,
        });
        return controller;
    }

    test('handleIndex returns ModelAndView with notes model', () => {
        const controller = createController();
        const mv = controller.handleIndex(route);

        expect(mv.model).toEqual({ items: notesService.items, todoRoute: '#/todo/' });
        expect((mv.model as any).todoRoute).toBe('#/todo/');
    });

    test('handleIndex returns a WicketView', () => {
        const controller = createController();
        const mv = controller.handleIndex(route);

        expect(mv.view).toBeInstanceOf(WicketView);
    });

    test('handleIndex includes all items from service', () => {
        const controller = createController();
        const mv = controller.handleIndex(route);

        expect((mv.model as any).items).toHaveLength(2);
        expect((mv.model as any).items[0].title).toBe('First Note');
        expect((mv.model as any).items[1].pinned).toBe(true);
    });
});
