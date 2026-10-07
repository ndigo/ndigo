/**
 * The kanban wire contract shared by the REST surface, the socket frames and
 * the browser client.
 *
 * Three layers:
 *
 * 1. **Records** — what the service hands out (`CardRecord` is a plain,
 *    detached copy of a `Card` entity, so no caller ever aliases store state).
 * 2. **Request bodies** — zod schemas the controller validates through
 *    `validatedBody` (a violation is the platform's `422` problem document).
 * 3. **Snapshots** — the whole-board shape `GET /api/boards/:id` returns and
 *    the socket replays on join.
 *
 * @module blue-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';
import type { BoardColumn, Card } from './board.entity';

/** A card as it travels on the wire (a copy; never the stored entity). */
export const CardSchema = z.object({
    id: z.string(),
    boardId: z.string(),
    columnId: z.string(),
    title: z.string(),
    position: z.number().int(),
    version: z.number().int(),
    updatedAt: z.string(),
});

/** A column with its cards, ordered by `position`. */
export const ColumnSchema = z.object({
    id: z.string(),
    boardId: z.string(),
    title: z.string(),
    position: z.number().int(),
    cards: z.array(CardSchema),
});

/** A whole board: columns ordered by `position`, each with ordered cards. */
export const BoardSnapshotSchema = z.object({
    id: z.string(),
    title: z.string(),
    columns: z.array(ColumnSchema),
});

/** A card on the wire. */
export type CardRecord = z.infer<typeof CardSchema>;

/** A column (with cards) on the wire. */
export type ColumnRecord = z.infer<typeof ColumnSchema>;

/** A board snapshot on the wire. */
export type BoardSnapshot = z.infer<typeof BoardSnapshotSchema>;

/** Card title bounds, applied on every write. */
export const TITLE_MAX_LENGTH = 200;

/** Body of `POST /api/boards/:id/cards` — title required, column optional. */
export const CreateCardSchema = z.object({
    title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
    columnId: z.string().trim().min(1).max(64).optional(),
    /** Target index within the column; omitted appends at the end. */
    position: z.number().int().nonnegative().optional(),
});

/** Body of `POST /api/columns/:columnId/cards` — the column is in the path. */
export const CreateColumnCardSchema = z.object({
    title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
    /** Target index within the column; omitted appends at the end. */
    position: z.number().int().nonnegative().optional(),
});

/**
 * Body of `PATCH /api/cards/:cardId`.
 *
 * `version` is required (the CAS token); `title`, `columnId` and `position`
 * describe the target state. A patch naming only `version` is a no-op bump —
 * accepted, and the cheapest way to prove the CAS in a test.
 */
export const UpdateCardSchema = z.object({
    version: z.number().int().nonnegative(),
    title: z.string().trim().min(1).max(TITLE_MAX_LENGTH).optional(),
    columnId: z.string().trim().min(1).max(64).optional(),
    position: z.number().int().nonnegative().optional(),
});

/** A create-card request body. */
export type CreateCardInput = z.infer<typeof CreateCardSchema>;

/** A create-card-in-column request body. */
export type CreateColumnCardInput = z.infer<typeof CreateColumnCardSchema>;

/** A card update request body. */
export type UpdateCardInput = z.infer<typeof UpdateCardSchema>;

/**
 * Copies a stored card entity onto the wire.
 *
 * @param card - The stored entity (read-only here).
 * @returns A detached record carrying exactly the documented fields.
 */
export function toCardRecord(card: Card): CardRecord {
    return {
        id: card.id,
        boardId: card.boardId,
        columnId: card.columnId,
        title: card.title,
        position: card.position,
        version: card.version,
        updatedAt: card.updatedAt,
    };
}

/**
 * Copies a stored column entity onto the wire.
 *
 * @param column - The stored entity.
 * @param cards - Its cards, already ordered.
 * @returns A detached record.
 */
export function toColumnRecord(column: BoardColumn, cards: readonly Card[]): ColumnRecord {
    return {
        id: column.id,
        boardId: column.boardId,
        title: column.title,
        position: column.position,
        cards: cards.map(toCardRecord),
    };
}
