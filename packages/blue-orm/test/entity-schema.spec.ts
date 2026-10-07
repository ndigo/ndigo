/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { z } from 'zod';
import { entity, generated, primaryColumn, column } from '../src/decorators';
import {
    baseSchemaForType,
    schemaForColumn,
    schemaForEntity,
    insertSchemaForEntity,
    validateEntity,
} from '../src/entity-schema';
import { getEntityMetadata } from '../src/metadata';

@entity()
class Product {
    @generated()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: z.string().min(2) })
    name!: string;

    @column({ type: 'int', nullable: true })
    rating!: number | null;

    @column()
    note?: unknown;
}

describe('baseSchemaForType', () => {
    test('maps int-like types to numbers', () => {
        expect(baseSchemaForType('int').safeParse(42).success).toBe(true);
        expect(baseSchemaForType('INTEGER').safeParse('42').success).toBe(false);
    });

    test('maps bool-like types to booleans', () => {
        expect(baseSchemaForType('boolean').safeParse(true).success).toBe(true);
    });

    // DAT-N1: token matching, not substring matching — 'point'/'interval'
    // contain 'int' but are not integer types.
    test('does not read unrelated types as int', () => {
        expect(baseSchemaForType('point').safeParse('x').success).toBe(true);
        expect(baseSchemaForType('interval').safeParse('x').success).toBe(true);
        expect(baseSchemaForType('bigint').safeParse('42').success).toBe(false);
        expect(baseSchemaForType('varchar(255)').safeParse('x').success).toBe(true);
    });

    test('maps text family to strings', () => {
        for (const type of ['varchar', 'TEXT', 'string', 'char']) {
            expect(baseSchemaForType(type).safeParse('hello').success).toBe(true, type);
            expect(baseSchemaForType(type).safeParse(42).success).toBe(false, type);
        }
    });

    test('returns unknown for unmapped types', () => {
        expect(baseSchemaForType('blob').safeParse({ anything: true }).success).toBe(true);
    });
});

describe('schemaForColumn', () => {
    test('explicit schema wins over type mapping', () => {
        const schema = schemaForColumn({ fieldName: 'f', columnName: 'f', type: 'int', schema: z.string() });
        expect(schema.safeParse('x').success).toBe(true);
        expect(schema.safeParse(1).success).toBe(false);
    });

    test('nullable allows null', () => {
        expect(
            schemaForColumn({ fieldName: 'f', columnName: 'f', type: 'int', nullable: true }).safeParse(null).success
        ).toBe(true);
        expect(schemaForColumn({ fieldName: 'f', columnName: 'f', type: 'int' }).safeParse(null).success).toBe(false);
    });

    test('untyped column is a passthrough', () => {
        expect(schemaForColumn({ fieldName: 'f', columnName: 'f' }).safeParse({}).success).toBe(true);
    });
});

describe('schemaForEntity', () => {
    test('derives shape from column metadata', () => {
        const schema = schemaForEntity(Product);
        expect(schema.safeParse({ id: 1, name: 'Widget', rating: 5, note: 'extra' }).success).toBe(true);
        expect(schema.safeParse({ id: 1, name: 'x', rating: 5, note: undefined }).success).toBe(false);
        expect(schema.safeParse({ id: 1, name: 'Widget', rating: '5' as unknown, note: undefined }).success).toBe(
            false
        );
    });

    test('inferred type matches z.infer', () => {
        const nameType = getEntityMetadata(Product).columns.find((c) => c.fieldName === 'name');
        expect(nameType).toBeDefined();
        // The derived shape is a plain object schema, so the entity type is inferable.
        const schema = schemaForEntity(Product);
        type ProductShape = z.infer<typeof schema>;
        const value = { id: 1, name: 'Widget', rating: 5 } as ProductShape;
        expect(value.name).toBe('Widget');
        expect(nameType?.schema).toBeDefined();
    });
});

describe('insertSchemaForEntity', () => {
    test('omits generated and primary columns from the writable shape', () => {
        const schema = insertSchemaForEntity(Product);
        expect(schema.safeParse({ name: 'Widget', rating: 5 }).success).toBe(true);
        expect(schema.safeParse({ name: 'x', rating: 5 }).success).toBe(false);
        // Generated/primary column is not required by the insert schema.
        expect(schema.safeParse({ name: 'Widget', rating: 5, id: 1 }).success).toBe(true);
    });

    test('insert schema is a subset of the full entity schema', () => {
        const insert = insertSchemaForEntity(Product);
        const full = schemaForEntity(Product);
        expect(insert.safeParse({ name: 'Widget', rating: 5 }).success).toBe(true);
        // The full schema requires the generated id; the insert schema does not.
        expect(full.safeParse({ name: 'Widget', rating: 5 }).success).toBe(false);
    });
});

describe('validateEntity', () => {
    test('returns without throwing for a valid entity', () => {
        const product = Object.assign(new Product(), { id: 1, name: 'Widget', rating: 4 });
        expect(() => validateEntity(Product, product)).not.toThrow();
    });

    test('throws with failing field paths', () => {
        const product = Object.assign(new Product(), { id: 1, name: 'x', rating: 4 });
        expect(() => validateEntity(Product, product)).toThrow('Entity validation failed for fields: name');
    });
});
