/**
 * The `todos` row — Todo-Backend's five-field resource as an `@ndigo/orm` entity.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { z } from 'zod';
import { column, entity, generatedColumn, primaryColumn } from '@ndigo/orm';

/**
 * One todo row.
 *
 * Column metadata is the single validation source (AD-07): persisting an
 * invalid row — an empty title, a non-numeric order — throws before the value
 * can reach a response. The primary key is untyped on purpose (`z.unknown()`):
 * generated ids are numbers, while the spec's client-supplied-id case admits
 * any JSON scalar, and both spellings must survive validation.
 */
@entity('todos')
export class Todo {
    /** Primary key — generated (`1`, `2`, …) unless the client supplied one. */
    @generatedColumn()
    @primaryColumn()
    id!: number | string;

    /** The only required field in the Todo-Backend grammar. */
    @column({ type: 'varchar', schema: z.string().min(1) })
    title!: string;

    /** Client-owned sort key; the server assigns the next value when absent. */
    @column({ type: 'int' })
    order!: number;

    /** TodoMVC's completion flag — `false` on creation unless the client says otherwise. */
    @column({ type: 'boolean' })
    completed!: boolean;

    /**
     * Client-supplied url override, or `null` for a server-computed url.
     *
     * The wire `url` is always absolute (see `toWireTodo`); nothing is stored
     * for the common case, so the url always matches the host the client
     * actually reached.
     */
    @column({ type: 'varchar', nullable: true })
    url!: string | null;
}
