/**
 * The board service — the single seam every board read and write goes through.
 *
 * It owns three things the HTTP and socket surfaces never touch directly:
 *
 * 1. **Persistence** — the `@ndigo/orm` in-memory data source and entity
 *    manager (`Board` → `BoardColumn` → `Card`).
 * 2. **Concurrency** — a single-writer mutation queue plus a compare-and-set
 *    on the card's `version`. See {@link BoardService.updateCard}.
 * 3. **Change notification** — {@link BoardService.onEvent} publishes one
 *    event per accepted write; the socket broadcaster subscribes and fans it
 *    out to the board's room.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { ContextToken } from '@ndigo/context';
import { getLogger } from '@ndigo/log';
import { InMemoryDataSource, InMemoryEntityManager, InMemoryTransactionManager } from '@ndigo/orm';
import type { EntityManager } from '@ndigo/orm';
import { Board, BoardColumn, Card } from './board.entity';
import { toCardRecord, toColumnRecord } from './board-model';
import type { BoardSnapshot, CardRecord, CreateCardInput, CreateColumnCardInput, UpdateCardInput } from './board-model';
import type { CardEventName } from './protocol';

const logger = getLogger('ndigo-kanban');

/** One application event, published once per accepted write. */
export interface BoardEvent {
    /** The wire event name. */
    readonly event: CardEventName;
    /** The wire payload (`{ card }`, `{ card, fromColumnId }`, `{ cardId, columnId }`). */
    readonly data: unknown;
    /** Epoch milliseconds the write was accepted. */
    readonly at: number;
}

/** Receives every accepted write for a board. */
export type BoardListener = (boardId: string, event: BoardEvent) => void;

/**
 * An RFC 9457 problem document as the service describes it.
 *
 * The controller turns this into a `ResponseEntity`; the response-entity view
 * writes it as `application/problem+json`.
 */
export interface BoardProblem {
    /** HTTP status code. */
    readonly status: number;
    /** Problem type URI (`urn:ndigo:kanban:<slug>`). */
    readonly type: string;
    /** Short human-readable title. */
    readonly title: string;
    /** Occurrence-specific explanation. */
    readonly detail: string;
    /** The current authoritative card — carried by the stale-version `409`. */
    readonly current?: CardRecord;
}

/** The result of a service mutation: the value plus the event it published, or a problem. */
export type BoardOutcome<T> =
    | { readonly ok: true; readonly value: T; readonly event: BoardEvent }
    | { readonly ok: false; readonly problem: BoardProblem };

/** A board to write at bootstrap time (before the service is shared). */
export interface BoardSeed {
    /** Board id (also the room name suffix). */
    readonly id: string;
    /** Board title. */
    readonly title: string;
    /** Columns in order, each with its initial card titles in order. */
    readonly columns: ReadonlyArray<{
        readonly id: string;
        readonly title: string;
        readonly cards?: readonly string[];
    }>;
}

/** The board the demo shell mounts, seeded at construction. */
export const DEMO_BOARD: BoardSeed = {
    id: 'demo',
    title: 'Ndigo Kanban',
    columns: [
        { id: 'backlog', title: 'Backlog', cards: ['Draft the release notes', 'Audit the socket backpressure path'] },
        { id: 'in-progress', title: 'In progress', cards: ['Version-stamped card writes'] },
        { id: 'done', title: 'Done', cards: ['Seed the demo board'] },
    ],
};

/** Context token for the shared {@link BoardService} bean. */
export const BOARD_SERVICE = new ContextToken<BoardService>('boardService');

/**
 * Boards, columns, cards — with the versioned write path.
 *
 * Every mutating method is `async` and serialized through one queue
 * ({@link BoardService.#mutate}); reads are synchronous and always see a
 * committed state.
 */
export class BoardService {
    readonly #dataSource = new InMemoryDataSource();
    readonly #entities: EntityManager;
    readonly #transactions: InMemoryTransactionManager;
    readonly #listeners = new Set<BoardListener>();

    /**
     * The single-writer gate. Mutations chain onto this promise, so exactly one
     * transaction is ever open — the in-memory transaction manager rejects
     * overlapping runs, and a queue makes overlapping impossible instead of
     * surfacing it as a 500.
     */
    #tail: Promise<unknown> = Promise.resolve();

    /**
     * @param options - `seed` writes a board synchronously at construction
     *   (defaults to {@link DEMO_BOARD}); pass `null` to start empty.
     */
    constructor(options: { seed?: BoardSeed | null } = {}) {
        this.#dataSource.init();
        this.#entities = new InMemoryEntityManager(this.#dataSource);
        this.#transactions = new InMemoryTransactionManager(this.#dataSource);
        const seed = options.seed === undefined ? DEMO_BOARD : options.seed;
        if (seed !== null) {
            this.bootstrap(seed);
        }
    }

    /**
     * Writes a whole board synchronously, bypassing the mutation queue.
     *
     * Only legitimate before the instance is shared — the composition root
     * seeds at construction, when no other caller can hold a reference — so
     * there is no concurrent writer to serialize against, and no listener
     * exists to notify.
     *
     * @param seed - The board to write.
     */
    bootstrap(seed: BoardSeed): void {
        const board = new Board();
        board.id = seed.id;
        board.title = seed.title;
        this.#entities.persist(board);

        seed.columns.forEach((columnSeed, columnIndex) => {
            const column = new BoardColumn();
            column.id = columnSeed.id;
            column.boardId = seed.id;
            column.title = columnSeed.title;
            column.position = columnIndex;
            this.#entities.persist(column);

            (columnSeed.cards ?? []).forEach((title, cardIndex) => {
                const card = new Card();
                card.id = `${columnSeed.id}-${cardIndex + 1}`;
                card.boardId = seed.id;
                card.columnId = columnSeed.id;
                card.title = title;
                card.position = cardIndex;
                card.version = 1;
                card.updatedAt = new Date().toISOString();
                this.#entities.persist(card);
            });
        });
    }

    /**
     * Subscribes to accepted writes.
     *
     * @param listener - Invoked once per committed mutation, in commit order.
     * @returns An unsubscribe function.
     */
    onEvent(listener: BoardListener): () => void {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    }

    /**
     * The authoritative board, columns and cards ordered by `position`.
     *
     * @param boardId - The board id.
     * @returns The snapshot, or `undefined` when no such board exists.
     */
    snapshot(boardId: string): BoardSnapshot | undefined {
        const board = this.#entities.find(Board, boardId);
        if (board === undefined) {
            return undefined;
        }
        const columns = this.#entities
            .findAll(BoardColumn)
            .filter((column) => column.boardId === boardId)
            .sort((left, right) => left.position - right.position);
        return {
            id: board.id,
            title: board.title,
            columns: columns.map((column) => toColumnRecord(column, this.#cardsOf(column.id))),
        };
    }

    /**
     * Creates a card from the board-scoped endpoint.
     *
     * @param boardId - The board to create in.
     * @param input - Title plus an optional target column and index.
     * @returns The created card and the `card-created` event, or a problem.
     */
    async createCard(boardId: string, input: CreateCardInput): Promise<BoardOutcome<CardRecord>> {
        return this.#mutate(() => {
            const board = this.#entities.find(Board, boardId);
            if (board === undefined) {
                return { ok: false, problem: notFoundProblem('board', boardId) };
            }
            const columns = this.#columnsOf(boardId);
            const columnId = input.columnId ?? columns[0]?.id;
            if (columnId === undefined) {
                return {
                    ok: false,
                    problem: {
                        status: 409,
                        type: 'urn:ndigo:kanban:board-has-no-columns',
                        title: 'Conflict',
                        detail: `board '${boardId}' has no columns to hold a card`,
                    },
                };
            }
            const column = columns.find((candidate) => candidate.id === columnId);
            if (column === undefined) {
                return { ok: false, problem: notFoundProblem('column', columnId) };
            }
            return this.#insertCard(boardId, column.id, input.title, input.position);
        });
    }

    /**
     * Creates a card from the column-scoped endpoint.
     *
     * @param columnId - The column to create in.
     * @param input - Title plus an optional index.
     * @returns The created card and the `card-created` event, or a problem.
     */
    async createCardInColumn(columnId: string, input: CreateColumnCardInput): Promise<BoardOutcome<CardRecord>> {
        return this.#mutate(() => {
            const column = this.#entities.find(BoardColumn, columnId);
            if (column === undefined) {
                return { ok: false, problem: notFoundProblem('column', columnId) };
            }
            return this.#insertCard(column.boardId, column.id, input.title, input.position);
        });
    }

    /**
     * Renames, reorders or moves a card — the compare-and-set write.
     *
     * **Concurrency.** The caller must send the `version` it read. Inside the
     * queue the body is fully synchronous (`version` compare → mutate →
     * `persist`), so no other write can interleave between the compare and the
     * write: two racing updates that both read version *v* are applied one
     * after the other, and the second one compares against *v+1* and loses with
     * a `409` carrying the current card. There is no retry, no last-write-wins
     * fallback, and no sleep anywhere on this path.
     *
     * @param cardId - The card to update.
     * @param patch - The required `version` plus the fields to change.
     * @returns The updated card and its `card-updated`/`card-moved` event, or a problem.
     */
    async updateCard(cardId: string, patch: UpdateCardInput): Promise<BoardOutcome<CardRecord>> {
        return this.#mutate(() => {
            const card = this.#entities.find(Card, cardId);
            if (card === undefined) {
                return { ok: false, problem: notFoundProblem('card', cardId) };
            }
            if (patch.version !== card.version) {
                return {
                    ok: false,
                    problem: {
                        status: 409,
                        type: 'urn:ndigo:kanban:stale-version',
                        title: 'Conflict',
                        detail: `card '${cardId}' was updated concurrently: expected version ${patch.version}, current version ${card.version}`,
                        current: toCardRecord(card),
                    },
                };
            }

            const targetColumnId = patch.columnId ?? card.columnId;
            const targetColumn = this.#entities.find(BoardColumn, targetColumnId);
            if (targetColumn === undefined || targetColumn.boardId !== card.boardId) {
                return { ok: false, problem: notFoundProblem('column', targetColumnId) };
            }
            const fromColumnId = card.columnId;
            const moved = targetColumnId !== fromColumnId;

            if (moved) {
                card.columnId = targetColumnId;
            }
            if (patch.title !== undefined) {
                card.title = patch.title;
            }
            card.version += 1;
            card.updatedAt = new Date().toISOString();
            this.#entities.persist(card);

            // Re-order: a move splices the card into the target column (at
            // `position`, or last), a same-column reorder moves it within; both
            // then renumber the affected columns densely. A rename-only patch
            // leaves the order untouched.
            if (moved || patch.position !== undefined) {
                this.#placeCard(card, patch.position);
            }
            if (moved) {
                this.#renumber(fromColumnId);
            }
            this.#renumber(targetColumnId);

            const record = toCardRecord(card);
            return this.#commit(
                card.boardId,
                record,
                moved ? 'card-moved' : 'card-updated',
                moved ? { card: record, fromColumnId } : { card: record }
            );
        });
    }

    /**
     * Deletes a card.
     *
     * Deletion is deliberately **unversioned**: a card that is gone cannot be
     * repaired by a version check, and the `card-deleted` event is what tells
     * every other client to drop it. Only the versioned `PATCH` path
     * arbitrates concurrent edits.
     *
     * @param cardId - The card to delete.
     * @returns The removed card's identifiers and the `card-deleted` event, or a problem.
     */
    async deleteCard(cardId: string): Promise<BoardOutcome<{ cardId: string; columnId: string }>> {
        return this.#mutate(() => {
            const card = this.#entities.find(Card, cardId);
            if (card === undefined) {
                return { ok: false, problem: notFoundProblem('card', cardId) };
            }
            const columnId = card.columnId;
            const boardId = card.boardId;
            this.#entities.remove(card);
            this.#renumber(columnId);
            return this.#commit<{ cardId: string; columnId: string }>(boardId, { cardId, columnId }, 'card-deleted', {
                cardId,
                columnId,
            });
        });
    }

    /**
     * Runs one mutation inside the transaction manager, serialized by the
     * single-writer queue.
     *
     * @param work - The synchronous mutation body; it returns the outcome the
     *   caller receives, so a problem is a *result*, never a throw (and never
     *   something that would need a rollback).
     * @returns The body's outcome.
     */
    async #mutate<T>(work: () => BoardOutcome<T>): Promise<BoardOutcome<T>> {
        const run = this.#tail.then(() => this.#transactions.run(work));
        // The queue must survive a failed mutation: swallow the rejection on
        // the *tail* only, so the next mutation still runs (the returned
        // promise keeps the rejection for its own caller).
        this.#tail = run.then(
            () => undefined,
            () => undefined
        );
        return run;
    }

    /** The value and its event, published to every listener before returning. */
    #commit<T>(boardId: string, value: T, event: CardEventName, data: unknown): BoardOutcome<T> {
        const wire: BoardEvent = { event, data, at: Date.now() };
        this.#publish(boardId, wire);
        return { ok: true, value, event: wire };
    }

    #insertCard(
        boardId: string,
        columnId: string,
        title: string,
        position: number | undefined
    ): BoardOutcome<CardRecord> {
        const card = new Card();
        card.id = crypto.randomUUID();
        card.boardId = boardId;
        card.columnId = columnId;
        card.title = title;
        card.position = position ?? this.#cardsOf(columnId).length;
        card.version = 1;
        card.updatedAt = new Date().toISOString();
        this.#entities.persist(card);
        this.#placeCard(card, card.position);
        return this.#commit(boardId, toCardRecord(card), 'card-created', { card: toCardRecord(card) });
    }

    /**
     * Splices a card into its current column at `position` (or last when
     * omitted) and renumbers that column densely.
     *
     * @param card - The card to place (already persisted).
     * @param position - Target index, or `undefined` for last.
     */
    #placeCard(card: Card, position: number | undefined): void {
        const target = this.#cardsOf(card.columnId).filter((other) => other.id !== card.id);
        const index = position === undefined ? target.length : Math.min(position, target.length);
        target.splice(index, 0, card);
        target.forEach((other, order) => {
            other.position = order;
        });
    }

    /** Rewrites a column's cards to dense, zero-based positions in order. */
    #renumber(columnId: string): void {
        this.#cardsOf(columnId).forEach((card, index) => {
            if (card.position !== index) {
                card.position = index;
                this.#entities.persist(card);
            }
        });
    }

    /** A column's cards, ordered by position. */
    #cardsOf(columnId: string): Card[] {
        return this.#entities
            .findAll(Card)
            .filter((card) => card.columnId === columnId)
            .sort((left, right) => left.position - right.position);
    }

    /** A board's columns, ordered by position. */
    #columnsOf(boardId: string): BoardColumn[] {
        return this.#entities
            .findAll(BoardColumn)
            .filter((column) => column.boardId === boardId)
            .sort((left, right) => left.position - right.position);
    }

    /** Publishes an event; a listener fault never fails the committed write. */
    #publish(boardId: string, event: BoardEvent): void {
        for (const listener of this.#listeners) {
            try {
                listener(boardId, event);
            } catch (error) {
                logger.warn(`board listener failed for ${event.event}: ${String(error)}`);
            }
        }
    }
}

/** A `404` problem for a missing aggregate (shared with the REST surface). */
export function notFoundProblem(kind: 'board' | 'column' | 'card', id: string): BoardProblem {
    return {
        status: 404,
        type: `urn:ndigo:kanban:${kind}-not-found`,
        title: 'Not Found',
        detail: `no ${kind} '${id}'`,
    };
}
