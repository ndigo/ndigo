import '@tsmetadata/polyfill';
import { entity, primaryColumn, generated, column, prePersist } from '@blue/orm';

/**
 * Drizzle-backed note entity (SQL persistence demo, M2).
 *
 * Same shape as the in-memory {@link Note} — a Drizzle table is created from
 * this metadata by `DrizzleDataSource.init([...])`.
 */
@entity('drizzle_notes')
export class DrizzleNote {
    @generated()
    @primaryColumn()
    id!: number;

    @column({ name: 'title', type: 'varchar' })
    title!: string;

    @column({ name: 'body', type: 'text' })
    body!: string;

    @column({ name: 'created_at', type: 'varchar' })
    createdAt!: string;

    @prePersist()
    onPrePersist() {
        if (!this.createdAt) {
            this.createdAt = new Date().toISOString();
        }
    }
}
