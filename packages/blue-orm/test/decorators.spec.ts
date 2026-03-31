/** @author opencode */

import '@tsmetadata/polyfill';

import { column, entity, generated, primaryColumn } from '../src/decorators';
import { getEntityMetadata, isEntity } from '../src/metadata';

@entity()
class DefaultEntity {
    @column()
    name!: string;
}

@entity('custom_name')
class CustomEntity {
    @column({ name: 'custom' })
    label!: string;
}

@entity()
class NullableEntity {
    @column({ nullable: true })
    description?: string;
}

@entity()
class PrimaryEntity {
    @primaryColumn()
    id!: string;
}

@entity()
class GeneratedEntity {
    @generated()
    @primaryColumn()
    id!: number;
}

@entity()
class PlainColumnsEntity {
    @column()
    first!: string;

    @column()
    second!: string;
}

@entity()
class TestUser {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    @column({ name: 'email_address', nullable: true })
    email?: string;

    constructor(name: string, email?: string) {
        this.id = undefined;
        this.name = name;
        this.email = email;
    }
}

@entity('custom_products')
class TestProduct {
    @primaryColumn()
    sku: string;

    @column()
    title: string;

    constructor(sku: string, title: string) {
        this.sku = sku;
        this.title = title;
    }
}

class PlainClass {
    value!: string;
}

describe('decorators', () => {
    describe('entity', () => {
        it('stores default entity name', () => {
            const metadata = getEntityMetadata(DefaultEntity);
            expect(metadata.entityName).toBe('DefaultEntity');
        });

        it('stores custom entity name', () => {
            const metadata = getEntityMetadata(CustomEntity);
            expect(metadata.entityName).toBe('custom_name');
        });
    });

    describe('column', () => {
        it('stores column with default column name', () => {
            const metadata = getEntityMetadata(DefaultEntity);
            expect(metadata.columns).toEqual([
                {
                    fieldName: 'name',
                    columnName: 'name',
                    nullable: undefined,
                    type: undefined,
                },
            ]);
        });

        it('stores custom column name', () => {
            const metadata = getEntityMetadata(CustomEntity);
            expect(metadata.columns[0]).toMatchObject({
                fieldName: 'label',
                columnName: 'custom',
            });
        });

        it('stores nullable option', () => {
            const metadata = getEntityMetadata(NullableEntity);
            expect(metadata.columns[0]).toMatchObject({
                fieldName: 'description',
                nullable: true,
            });
        });
    });

    describe('primaryColumn', () => {
        it('stores primary column and adds to columns array', () => {
            const metadata = getEntityMetadata(PrimaryEntity);
            expect(metadata.primaryColumn).toBe('id');
            expect(metadata.columns).toEqual([
                {
                    fieldName: 'id',
                    columnName: 'id',
                    nullable: undefined,
                    type: undefined,
                },
            ]);
        });
    });

    describe('generated', () => {
        it('stores generated column', () => {
            const metadata = getEntityMetadata(GeneratedEntity);
            expect(metadata.generatedColumns).toEqual(['id']);
        });
    });

    describe('decorator interactions', () => {
        it('accumulates columns from multiple decorators', () => {
            const metadata = getEntityMetadata(PlainColumnsEntity);
            expect(metadata.columns.map((column) => column.fieldName)).toEqual(['first', 'second']);
        });

        it('handles multiple decorators on the same class correctly', () => {
            const metadata = getEntityMetadata(TestUser);
            expect(metadata.primaryColumn).toBe('id');
            expect(metadata.generatedColumns).toEqual(['id']);
            expect(metadata.columns).toEqual([
                {
                    fieldName: 'id',
                    columnName: 'id',
                    nullable: undefined,
                    type: undefined,
                },
                {
                    fieldName: 'name',
                    columnName: 'name',
                    nullable: undefined,
                    type: undefined,
                },
                {
                    fieldName: 'email',
                    columnName: 'email_address',
                    nullable: true,
                    type: undefined,
                },
            ]);
        });
    });

    describe('metadata helpers', () => {
        it('returns true for entity classes and false for plain classes', () => {
            expect(isEntity(TestProduct)).toBe(true);
            expect(isEntity(PlainClass as unknown as typeof TestProduct)).toBe(false);
        });

        it('returns complete metadata object', () => {
            const metadata = getEntityMetadata(TestProduct);
            expect(metadata).toEqual({
                entityName: 'custom_products',
                columns: [
                    {
                        fieldName: 'sku',
                        columnName: 'sku',
                        nullable: undefined,
                        type: undefined,
                    },
                    {
                        fieldName: 'title',
                        columnName: 'title',
                        nullable: undefined,
                        type: undefined,
                    },
                ],
                primaryColumn: 'sku',
                generatedColumns: [],
            });
        });
    });
});
