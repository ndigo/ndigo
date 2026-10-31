/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { z } from 'zod';
import { entity, primaryColumn, generatedColumn, column, prePersist } from '@blue/orm';

/**
 * Drizzle-backed note entity (SQL persistence demo, M2).
 *
 * Same shape as the in-memory {@link Note} — a Drizzle table is created from
 * this metadata by `DrizzleDataSource.init([...])`.
 */
@entity('drizzle_notes')
export class DrizzleNote {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ name: 'title', type: 'varchar', schema: z.string().min(1) })
    title!: string;

    @column({ name: 'body', type: 'text', nullable: true })
    body!: string;

    @column({ name: 'created_at', type: 'varchar', nullable: true })
    createdAt!: string;

    @prePersist()
    onPrePersist() {
        if (!this.createdAt) {
            this.createdAt = new Date().toISOString();
        }
    }
}
