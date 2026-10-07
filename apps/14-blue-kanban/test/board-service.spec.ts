/**
 * The board service on its own — the store-level guarantees, with no HTTP and
 * no sockets.
 *
 * The concurrency case is the point of the file: two interleaved updates that
 * both read the same base version must resolve to exactly one winner. It is
 * deterministic by construction (the service serializes writes itself), so
 * there is no sleep, no timer and no retry anywhere in this spec.
 *
 * @module blue-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { beforeEach, describe, expect, test } from 'vitest';
import type { CardRecord } from '../src/board-model';
import { BoardService, DEMO_BOARD } from '../src/board-service';
import type { BoardEvent } from '../src/board-service';

/** Records every event the service publishes. */
function recorder(service: BoardService): { events: Array<{ boardId: string; event: BoardEvent }> } {
    const events: Array<{ boardId: string; event: BoardEvent }> = [];
    service.onEvent((boardId, event) => {
        events.push({ boardId, event });
    });
    return { events };
}

describe('BoardService', () => {
    let service: BoardService;
    let published: Array<{ boardId: string; event: BoardEvent }>;

    beforeEach(() => {
        service = new BoardService();
        published = recorder(service).events;
    });

    test('the seeded board is dense and ordered, and cards start at version 1', () => {
        const board = service.snapshot(DEMO_BOARD.id);
        expect(board).toBeDefined();
        expect(board?.columns.map((column) => column.id)).toEqual(DEMO_BOARD.columns.map((column) => column.id));
        for (const [index, column] of (board?.columns ?? []).entries()) {
            expect(column.position).toBe(index);
            expect(column.cards.map((card) => card.position)).toEqual(column.cards.map((_, cardIndex) => cardIndex));
            expect(column.cards.every((card) => card.version === 1)).toBe(true);
            expect(column.cards.every((card) => card.updatedAt.length > 0)).toBe(true);
        }
    });

    test('an unknown board has no snapshot', () => {
        expect(service.snapshot('nope')).toBeUndefined();
    });

    test('two interleaved updates from the same base version: exactly one wins', async () => {
        const base = service.snapshot(DEMO_BOARD.id)?.columns[0].cards[0] as CardRecord;

        // Both calls start before either resolves — the classic lost-update
        // race, with no await between the version read and the write.
        const outcomes = await Promise.all([
            service.updateCard(base.id, { version: base.version, title: 'first writer' }),
            service.updateCard(base.id, { version: base.version, title: 'second writer' }),
        ]);

        const winners = outcomes.filter((outcome) => outcome.ok);
        const losers = outcomes.filter((outcome) => !outcome.ok);
        expect(winners).toHaveLength(1);
        expect(losers).toHaveLength(1);
        expect(losers[0]?.problem.status).toBe(409);
        expect(losers[0]?.problem.current?.version).toBe(base.version + 1);

        // The winner is the only write, and it advanced the version exactly once.
        const stored = service
            .snapshot(DEMO_BOARD.id)
            ?.columns[0].cards.find((card) => card.id === base.id) as CardRecord;
        expect(stored.version).toBe(base.version + 1);
        expect(stored.title).toBe(winners[0]?.value.title);
        expect(published.filter((entry) => entry.event.event === 'card-updated')).toHaveLength(1);
    });

    test('a write that carries the current version always wins, and bumps by one', async () => {
        const base = service.snapshot(DEMO_BOARD.id)?.columns[0].cards[0] as CardRecord;

        const first = await service.updateCard(base.id, { version: base.version, title: 'one' });
        const second = await service.updateCard(base.id, { version: base.version + 1, title: 'two' });
        const stale = await service.updateCard(base.id, { version: base.version + 1, title: 'three' });

        expect(first.ok && first.value.version).toBe(base.version + 1);
        expect(second.ok && second.value.version).toBe(base.version + 2);
        expect(stale.ok).toBe(false);
        expect(stale.ok ? undefined : stale.problem.status).toBe(409);
        expect(published.map((entry) => entry.event.event)).toEqual(['card-updated', 'card-updated']);
    });

    test('a failed write publishes nothing and leaves the store untouched', async () => {
        const base = service.snapshot(DEMO_BOARD.id)?.columns[0].cards[0] as CardRecord;
        const stale = await service.updateCard(base.id, { version: base.version + 7, title: 'nope' });

        expect(stale.ok).toBe(false);
        expect(published).toHaveLength(0);
        const stored = service
            .snapshot(DEMO_BOARD.id)
            ?.columns[0].cards.find((card) => card.id === base.id) as CardRecord;
        expect(stored).toEqual(base);
    });

    test('a move leaves both columns dense and reports the source column', async () => {
        const board = service.snapshot(DEMO_BOARD.id);
        const from = board?.columns[0];
        const to = board?.columns[1];
        const card = from?.cards[0] as CardRecord;

        const moved = await service.updateCard(card.id, {
            version: card.version,
            columnId: to?.id as string,
            position: 0,
        });

        expect(moved.ok).toBe(true);
        expect(moved.ok ? moved.event.event : '').toBe('card-moved');
        expect(moved.ok ? moved.event.data : null).toMatchObject({ fromColumnId: from?.id });
        expect(published[0]?.boardId).toBe(DEMO_BOARD.id);

        const after = service.snapshot(DEMO_BOARD.id);
        const source = after?.columns.find((column) => column.id === from?.id);
        const target = after?.columns.find((column) => column.id === to?.id);
        expect(source?.cards.map((item) => item.position)).toEqual(source?.cards.map((_, index) => index));
        expect(target?.cards.map((item) => item.position)).toEqual(target?.cards.map((_, index) => index));
        expect(target?.cards[0]?.id).toBe(card.id);
        expect(target?.cards[0]?.version).toBe(card.version + 1);
    });

    test('create appends (or inserts at the requested index) and delete renumbers', async () => {
        const columnId = DEMO_BOARD.columns[0].id;
        const appended = await service.createCardInColumn(columnId, { title: 'appended' });
        const inserted = await service.createCardInColumn(columnId, { title: 'inserted', position: 0 });

        expect(appended.ok && appended.value.position).toBe(2);
        expect(inserted.ok && inserted.value.position).toBe(0);
        expect(appended.ok && appended.value.version).toBe(1);

        const created = inserted.ok ? inserted.value : undefined;
        expect(created).toBeDefined();
        const removed = await service.deleteCard(created?.id as string);
        expect(removed.ok).toBe(true);
        expect(removed.ok ? removed.event.event : '').toBe('card-deleted');

        const after = service.snapshot(DEMO_BOARD.id);
        const column = after?.columns.find((item) => item.id === columnId);
        expect(column?.cards.map((item) => item.title)).toEqual([
            'Draft the release notes',
            'Audit the socket backpressure path',
            'appended',
        ]);
        expect(column?.cards.map((item) => item.position)).toEqual(column?.cards.map((_, index) => index));
        expect(column?.cards.some((item) => item.id === created?.id)).toBe(false);
    });

    test('deleting an unknown card, or writing to an unknown column/board, is a problem outcome', async () => {
        const missing = await service.deleteCard('nope');
        expect(missing.ok ? undefined : missing.problem.status).toBe(404);

        const base = service.snapshot(DEMO_BOARD.id)?.columns[0].cards[0] as CardRecord;
        const badColumn = await service.updateCard(base.id, { version: base.version, columnId: 'nowhere' });
        expect(badColumn.ok ? undefined : badColumn.problem.status).toBe(404);

        const badBoard = await service.createCard('nope', { title: 'x' });
        expect(badBoard.ok ? undefined : badBoard.problem.status).toBe(404);
    });
});
