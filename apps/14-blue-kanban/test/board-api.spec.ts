/**
 * The REST surface through MockHTTP: create/update/delete, the stale-version
 * `409` with the current card in the problem body, version increments, the
 * broadcast events the service emits per write, and the board snapshot shape.
 *
 * Responses are parsed with the app's own wire schemas, so a drift between
 * what the controller returns and what the contract says fails here.
 *
 * @module blue-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { z } from 'zod';
import { bootApp, MockHTTP, type BlueTestApp } from '@blue/test';
import { BoardSnapshotSchema, CardSchema } from '../src/board-model';
import type { BoardSnapshot, CardRecord } from '../src/board-model';
import { BOARD_SERVICE, DEMO_BOARD, type BoardEvent, type BoardService } from '../src/board-service';
import { KanbanConfiguration } from '../src/kanban-configuration';

/** `{ card }` — the create/update envelope. */
const CardEnvelope = z.object({ card: CardSchema });

/** `{ board }` — the snapshot envelope. */
const BoardEnvelope = z.object({ board: BoardSnapshotSchema });

/** An RFC 9457 problem document as the API answers it. */
const ProblemBodySchema = z.object({
    status: z.number(),
    type: z.string().optional(),
    title: z.string().optional(),
    detail: z.string().optional(),
    current: CardSchema.optional(),
});

type ProblemBody = z.infer<typeof ProblemBodySchema>;

/** The demo board's first column (the seed's `backlog`). */
const FIRST_COLUMN = DEMO_BOARD.columns[0].id;

/** The demo board's second column (the seed's `in-progress`). */
const SECOND_COLUMN = DEMO_BOARD.columns[1].id;

describe('blue-kanban REST surface', () => {
    let app: BlueTestApp;
    let http: MockHTTP;
    let boards: BoardService;
    let published: Array<{ boardId: string; event: BoardEvent }>;

    beforeAll(() => {
        app = bootApp([KanbanConfiguration]);
        http = new MockHTTP(app);
        boards = app.context.getValue(BOARD_SERVICE);
        published = [];
        boards.onEvent((boardId, event) => {
            published.push({ boardId, event });
        });
    });

    beforeEach(() => {
        published.length = 0;
    });

    afterAll(() => {
        app.close();
    });

    /** Reads the board over the REST surface. */
    async function board(id: string = DEMO_BOARD.id): Promise<BoardSnapshot> {
        const res = await http.get(`/api/boards/${id}`).exec();
        expect(res.response.status).toBe(200);
        return BoardEnvelope.parse(res.json()).board;
    }

    /** Creates a card in a column and returns the created card. */
    async function createIn(columnId: string, title: string): Promise<CardRecord> {
        const res = await http.post(`/api/columns/${columnId}/cards`).body({ title }).exec();
        expect(res.response.status).toBe(201);
        return CardEnvelope.parse(res.json()).card;
    }

    /** Finds a card anywhere in a snapshot. */
    function findCard(snapshot: BoardSnapshot, cardId: string): CardRecord | undefined {
        return snapshot.columns.flatMap((column) => column.cards).find((card) => card.id === cardId);
    }

    test('GET /api/boards/:id returns the full board, ordered and versioned', async () => {
        const snapshot = await board();
        expect(snapshot.id).toBe(DEMO_BOARD.id);
        expect(snapshot.title).toBe(DEMO_BOARD.title);
        expect(snapshot.columns.map((column) => column.id)).toEqual(DEMO_BOARD.columns.map((column) => column.id));
        for (const [index, column] of snapshot.columns.entries()) {
            expect(column.position).toBe(index);
            expect(column.cards.map((card) => card.position)).toEqual(column.cards.map((_, cardIndex) => cardIndex));
            for (const card of column.cards) {
                expect(card.columnId).toBe(column.id);
                expect(card.boardId).toBe(snapshot.id);
                expect(card.version).toBeGreaterThanOrEqual(1);
                expect(Number.isNaN(Date.parse(card.updatedAt))).toBe(false);
            }
        }
    });

    test('GET /api/boards/:id answers a 404 problem for an unknown board', async () => {
        const res = await http.get('/api/boards/nope').exec();
        expect(res.response.status).toBe(404);
        expect(res.response.headers['content-type']).toContain('application/problem+json');
        const problem = ProblemBodySchema.parse(res.json());
        expect(problem.status).toBe(404);
        expect(problem.detail).toContain('nope');
    });

    test('POST /api/columns/:columnId/cards appends a version-1 card and emits card-created', async () => {
        const before = await board();
        const length = before.columns.find((column) => column.id === FIRST_COLUMN)?.cards.length ?? 0;

        const res = await http.post(`/api/columns/${FIRST_COLUMN}/cards`).body({ title: 'Ship the board' }).exec();
        expect(res.response.status).toBe(201);
        const card = CardEnvelope.parse(res.json()).card;
        expect(card.version).toBe(1);
        expect(card.position).toBe(length);
        expect(card.columnId).toBe(FIRST_COLUMN);

        expect(published).toHaveLength(1);
        expect(published[0]?.boardId).toBe(DEMO_BOARD.id);
        expect(published[0]?.event.event).toBe('card-created');
        expect(published[0]?.event.data).toEqual({ card });

        const after = await board();
        expect(findCard(after, card.id)).toEqual(card);
    });

    test('POST /api/boards/:id/cards targets a column, defaulting to the first', async () => {
        const explicit = await http
            .post(`/api/boards/${DEMO_BOARD.id}/cards`)
            .body({ title: 'In progress one', columnId: SECOND_COLUMN })
            .exec();
        expect(explicit.response.status).toBe(201);
        expect(CardEnvelope.parse(explicit.json()).card.columnId).toBe(SECOND_COLUMN);

        const implicit = await http.post(`/api/boards/${DEMO_BOARD.id}/cards`).body({ title: 'Default column' }).exec();
        expect(implicit.response.status).toBe(201);
        expect(CardEnvelope.parse(implicit.json()).card.columnId).toBe(FIRST_COLUMN);
    });

    test('POST answers a 404 problem for an unknown board or column, and 422 for an empty title', async () => {
        const unknownBoard = await http.post('/api/boards/nope/cards').body({ title: 'x' }).exec();
        expect(unknownBoard.response.status).toBe(404);

        const unknownColumn = await http.post('/api/columns/nope/cards').body({ title: 'x' }).exec();
        expect(unknownColumn.response.status).toBe(404);

        const empty = await http.post(`/api/columns/${FIRST_COLUMN}/cards`).body({ title: '   ' }).exec();
        expect(empty.response.status).toBe(422);
        expect(z.object({ errors: z.array(z.unknown()) }).safeParse(empty.json()).success).toBe(true);
        expect(published).toHaveLength(0);
    });

    test('PATCH renames a card, bumps its version, and emits card-updated', async () => {
        const card = await createIn(FIRST_COLUMN, 'Rename me');
        published.length = 0;

        const res = await http.patch(`/api/cards/${card.id}`).body({ version: card.version, title: 'Renamed' }).exec();
        expect(res.response.status).toBe(200);
        const updated = CardEnvelope.parse(res.json()).card;
        expect(updated.id).toBe(card.id);
        expect(updated.title).toBe('Renamed');
        expect(updated.version).toBe(card.version + 1);
        expect(updated.columnId).toBe(card.columnId);
        expect(updated.position).toBe(card.position);
        expect(Number.isNaN(Date.parse(updated.updatedAt))).toBe(false);

        expect(published.map((entry) => entry.event.event)).toEqual(['card-updated']);
        expect(findCard(await board(), card.id)).toEqual(updated);
    });

    test('PATCH with a columnId moves the card and emits card-moved with the source column', async () => {
        const card = await createIn(FIRST_COLUMN, 'Move me');
        published.length = 0;

        const res = await http
            .patch(`/api/cards/${card.id}`)
            .body({ version: card.version, columnId: SECOND_COLUMN, position: 0 })
            .exec();
        expect(res.response.status).toBe(200);
        const moved = CardEnvelope.parse(res.json()).card;
        expect(moved.columnId).toBe(SECOND_COLUMN);
        expect(moved.position).toBe(0);

        expect(published).toHaveLength(1);
        expect(published[0]?.event.event).toBe('card-moved');
        expect(published[0]?.event.data).toEqual({ card: moved, fromColumnId: FIRST_COLUMN });

        const after = await board();
        const source = after.columns.find((column) => column.id === FIRST_COLUMN);
        const target = after.columns.find((column) => column.id === SECOND_COLUMN);
        expect(source?.cards.some((item) => item.id === card.id)).toBe(false);
        expect(target?.cards[0]?.id).toBe(card.id);
        for (const column of [source, target]) {
            expect(column?.cards.map((item) => item.position)).toEqual(column?.cards.map((_, index) => index));
        }
    });

    test('PATCH with a stale version is a 409 problem carrying the current card', async () => {
        const card = await createIn(FIRST_COLUMN, 'Contested');
        const winner = await http.patch(`/api/cards/${card.id}`).body({ version: 1, title: 'Winner' }).exec();
        const won = CardEnvelope.parse(winner.json()).card;
        published.length = 0;

        const stale = await http.patch(`/api/cards/${card.id}`).body({ version: 1, title: 'Loser' }).exec();
        expect(stale.response.status).toBe(409);
        expect(stale.response.headers['content-type']).toContain('application/problem+json');
        const problem: ProblemBody = ProblemBodySchema.parse(stale.json());
        expect(problem.status).toBe(409);
        expect(problem.type).toBe('urn:blue:kanban:stale-version');
        expect(problem.detail).toContain(String(won.version));
        expect(problem.current).toEqual(won);

        // Nothing was written and nothing was published.
        expect(published).toHaveLength(0);
        expect(findCard(await board(), card.id)).toEqual(won);
    });

    test('PATCH requires a version and answers 404 for unknown cards or columns', async () => {
        const noVersion = await http.patch('/api/cards/anything').body({ title: 'x' }).exec();
        expect(noVersion.response.status).toBe(422);

        const missing = await http.patch('/api/cards/nope').body({ version: 1, title: 'x' }).exec();
        expect(missing.response.status).toBe(404);

        const card = await createIn(FIRST_COLUMN, 'Wrong column');
        const unknownColumn = await http
            .patch(`/api/cards/${card.id}`)
            .body({ version: card.version, columnId: 'nowhere' })
            .exec();
        expect(unknownColumn.response.status).toBe(404);
    });

    test('DELETE removes the card, emits card-deleted, and renumbers the column', async () => {
        const card = await createIn(FIRST_COLUMN, 'Delete me');
        published.length = 0;

        const res = await http.delete(`/api/cards/${card.id}`).exec();
        expect(res.response.status).toBe(204);
        expect(published.map((entry) => entry.event.event)).toEqual(['card-deleted']);
        expect(published[0]?.event.data).toEqual({ cardId: card.id, columnId: card.columnId });

        const after = await board();
        expect(findCard(after, card.id)).toBeUndefined();
        const column = after.columns.find((item) => item.id === card.columnId);
        expect(column?.cards.map((item) => item.position)).toEqual(column?.cards.map((_, index) => index));

        const again = await http.delete(`/api/cards/${card.id}`).exec();
        expect(again.response.status).toBe(404);
        expect(ProblemBodySchema.parse(again.json()).status).toBe(404);
    });
});
