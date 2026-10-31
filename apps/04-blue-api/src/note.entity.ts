/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { z } from 'zod';
import { entity, primaryColumn, generatedColumn, column, prePersist } from '@blue/orm';

@entity('notes')
export class Note {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: z.string().min(1) })
    title!: string;

    @column({ type: 'text', nullable: true })
    body!: string;

    @column({ type: 'varchar', nullable: true })
    createdAt!: string;

    @prePersist()
    onPrePersist() {
        if (!this.createdAt) {
            this.createdAt = new Date().toISOString();
        }
    }
}
