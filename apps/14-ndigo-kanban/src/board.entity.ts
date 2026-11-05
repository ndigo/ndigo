/**
 * The board's persisted model: `Board` → `BoardColumn` → `Card`, three
 * `@ndigo/orm` entities backed by the in-memory data source.
 *
 * Card is the versioned aggregate root of the concurrency story: every
 * accepted write bumps `version` and stamps `updatedAt`, and a client write
 * must name the version it read (`BoardService.updateCard`).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { z } from 'zod';
import { column, entity, primaryColumn } from '@ndigo/orm';

/**
 * A board: the aggregate a client subscribes to and syncs whole.
 *
 * Ids are application-assigned (`crypto.randomUUID` for new cards, stable
 * slugs for the seeded demo board), so no column is `@generatedColumn`.
 */
@entity('kanban_boards')
export class Board {
    /** Stable board identity; also the WebSocket room name it is broadcast on. */
    @primaryColumn()
    id!: string;

    /** Display title. */
    @column({ type: 'varchar', schema: z.string().min(1).max(120) })
    title!: string;
}

/**
 * A column: an ordered list of cards within one board.
 *
 * `position` is dense and zero-based — every write that touches a column
 * renumbers it — so ordering never depends on insert order.
 */
@entity('kanban_columns')
export class BoardColumn {
    /** Stable column identity (the `POST /api/columns/:columnId/cards` key). */
    @primaryColumn()
    id!: string;

    /** Owning board id. */
    @column({ type: 'varchar', schema: z.string().min(1) })
    boardId!: string;

    /** Display title. */
    @column({ type: 'varchar', schema: z.string().min(1).max(120) })
    title!: string;

    /** Zero-based index within the board, dense. */
    @column({ type: 'int', schema: z.number().int().nonnegative() })
    position!: number;
}

/**
 * A card: the unit a client creates, renames, moves and deletes.
 *
 * `version` is the concurrency token — monotonically increasing per card,
 * never reused, starting at `1` on creation.
 */
@entity('kanban_cards')
export class Card {
    /** Stable card identity; also the `PATCH`/`DELETE` key. */
    @primaryColumn()
    id!: string;

    /** Owning board id (denormalized so the board room is known without a join). */
    @column({ type: 'varchar', schema: z.string().min(1) })
    boardId!: string;

    /** Owning column id. */
    @column({ type: 'varchar', schema: z.string().min(1) })
    columnId!: string;

    /** Card text. */
    @column({ type: 'varchar', schema: z.string().min(1).max(200) })
    title!: string;

    /** Zero-based index within its column, dense. */
    @column({ type: 'int', schema: z.number().int().nonnegative() })
    position!: number;

    /** Concurrency token: bumped by every accepted write, `1` on creation. */
    @column({ type: 'int', schema: z.number().int().positive() })
    version!: number;

    /** ISO-8601 stamp of the last accepted write. */
    @column({ type: 'varchar', schema: z.string().min(1) })
    updatedAt!: string;
}
