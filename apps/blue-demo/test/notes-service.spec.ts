import { describe, expect, test } from 'vitest';
import NotesService from '../src/notes-service';
import type { NoteItem } from '../src/notes-service';

describe('NotesService', () => {
    test('constructor seeds initial items', () => {
        const service = new NotesService([{ id: '1', title: 'A', body: 'a', pinned: false }]);

        expect(service.items).toHaveLength(1);
        expect(service.items[0]?.title).toBe('A');
    });

    test('items is empty by default', () => {
        const service = new NotesService();

        expect(service.items).toHaveLength(0);
    });

    test('addNote creates a note with auto-generated id', () => {
        const service = new NotesService();

        const item = service.addNote('Title', 'Body');

        expect(item).toEqual({
            id: item.id,
            title: 'Title',
            body: 'Body',
            pinned: false,
        });
        expect(item.id).toBeTruthy();
        expect(service.items).toHaveLength(1);
    });

    test('addNote with pinned flag', () => {
        const service = new NotesService();

        const item = service.addNote('Pinned', 'P', true);

        expect(item.pinned).toBe(true);
    });

    test('addNote assigns sequential ids starting after seed data', () => {
        const service = new NotesService([
            { id: '1', title: 'A', body: 'a', pinned: false },
            { id: '2', title: 'B', body: 'b', pinned: true },
        ]);

        const item = service.addNote('New', 'N');

        expect(item.id).toBe('3');
    });

    test('removeNote removes an existing note and returns true', () => {
        const service = new NotesService();
        const item = service.addNote('Title', 'Body');

        const removed = service.removeNote(item.id);

        expect(removed).toBe(true);
        expect(service.items).toHaveLength(0);
    });

    test('removeNote returns false for unknown id', () => {
        const service = new NotesService();

        expect(service.removeNote('nonexistent')).toBe(false);
    });

    test('getNote returns the note by id', () => {
        const service = new NotesService();
        const item = service.addNote('Title', 'Body');

        const found = service.getNote(item.id);

        expect(found).toBe(item);
    });

    test('getNote returns null for unknown id', () => {
        const service = new NotesService();

        expect(service.getNote('nonexistent')).toBeNull();
    });

    test('count returns the number of notes', () => {
        const service = new NotesService();

        service.addNote('One', '1');
        service.addNote('Two', '2');
        service.addNote('Three', '3');

        expect(service.count).toBe(3);

        service.removeNote('2');

        expect(service.count).toBe(2);
    });
});
