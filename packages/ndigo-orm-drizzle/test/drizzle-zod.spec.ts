/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { entity, column, generatedColumn, primaryColumn } from '@ndigo/orm';
import { drizzleTableForEntity, insertSchemaForEntity, selectSchemaForEntity } from '../src/drizzle-zod';

@entity('dz_notes')
class DzNote {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ name: 'title', type: 'varchar' })
    title!: string;

    @column({ name: 'body', type: 'text', nullable: true })
    body!: string | null;

    @column({ name: 'views', type: 'int' })
    views!: number;
}

describe('drizzle-zod bridge (AD-07)', () => {
    test('drizzleTableForEntity builds a Drizzle table from metadata', () => {
        const table = drizzleTableForEntity(DzNote);
        expect((table as unknown as Record<symbol, unknown>)[Symbol.for('drizzle:Name')]).toBe('dz_notes');
        const cols = (table as unknown as Record<symbol, unknown>)[Symbol.for('drizzle:Columns')] as Record<
            string,
            unknown
        >;
        expect(Object.keys(cols).sort()).toEqual(['body', 'id', 'title', 'views']);
    });

    test('insertSchemaForEntity derives a working Zod schema', () => {
        const schema = insertSchemaForEntity(DzNote) as z.ZodObject<Record<string, z.ZodType>>;
        // drizzle-zod coerces SQLite integer PKs to strings and treats the
        // autoincrement id as a required field; non-nullable columns required,
        // nullable ones optional.
        expect(schema.safeParse({ id: '1', title: 'hi', views: 1 }).success).toBe(true);
        expect(schema.safeParse({ title: 'hi', views: 1 }).success).toBe(false); // id required
        expect(schema.safeParse({ id: '1', title: 'hi' }).success).toBe(false); // views required
    });

    test('selectSchemaForEntity derives a Zod schema matching rows', () => {
        const schema = selectSchemaForEntity(DzNote) as z.ZodObject<Record<string, z.ZodType>>;
        // Select shape: id required as string-coerced integer; nullable body
        // is optional.
        expect(schema.safeParse({ id: '1', title: 'hi', body: null, views: 3 }).success).toBe(true);
        expect(schema.safeParse({ id: 1, title: 1, body: null, views: 3 }).success).toBe(false);
    });
});
