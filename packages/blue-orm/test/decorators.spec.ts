/** @author Jeff Rose */

import '@tsmetadata/polyfill';

import {
    column,
    entity,
    generated,
    primaryColumn,
    oneToMany,
    manyToOne,
    manyToMany,
    oneToOne,
    prePersist,
    postLoad,
    preUpdate,
    postRemove,
    transactional,
} from '../src/decorators';
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
                relations: [],
                lifecycleHooks: [],
            });
        });
    });

    describe('relations', () => {
        @entity()
        class Comment {
            @primaryColumn() id!: number;
            @column() text!: string;
        }

        @entity()
        class Post {
            @primaryColumn() id!: number;
            @oneToMany(() => Comment) comments!: Comment[];
            @manyToOne(() => Post) parent!: Post | null;
        }

        @entity()
        class Tag {}

        @entity()
        class Article {
            @primaryColumn() id!: number;
            @manyToMany(() => Tag) tags!: Tag[];
            @oneToOne(() => Post) featuredPost!: Post | null;
        }

        it('stores one-to-many relation', () => {
            const metadata = getEntityMetadata(Post);
            expect(metadata.relations).toHaveLength(2);

            const relation = metadata.relations.find((r) => r.fieldName === 'comments');
            expect(relation).toBeDefined();
            expect(relation!.kind).toBe('one-to-many');
            expect(relation!.targetEntity()).toBe(Comment);
        });

        it('stores many-to-one relation', () => {
            const metadata = getEntityMetadata(Post);
            expect(metadata.relations).toHaveLength(2);

            const relation = metadata.relations.find((r) => r.fieldName === 'parent');
            expect(relation).toBeDefined();
            expect(relation!.kind).toBe('many-to-one');
            expect(relation!.targetEntity()).toBe(Post);
        });

        it('stores many-to-many relation', () => {
            const metadata = getEntityMetadata(Article);
            expect(metadata.relations).toHaveLength(2);

            const relation = metadata.relations.find((r) => r.fieldName === 'tags');
            expect(relation).toBeDefined();
            expect(relation!.kind).toBe('many-to-many');
            expect(relation!.targetEntity()).toBe(Tag);
        });

        it('stores one-to-one relation', () => {
            const metadata = getEntityMetadata(Article);
            expect(metadata.relations).toHaveLength(2);

            const relation = metadata.relations.find((r) => r.fieldName === 'featuredPost');
            expect(relation).toBeDefined();
            expect(relation!.kind).toBe('one-to-one');
            expect(relation!.targetEntity()).toBe(Post);
        });

        it('handles multiple relations on one entity', () => {
            const metadata = getEntityMetadata(Post);
            expect(metadata.relations).toHaveLength(2);
        });
    });

    describe('lifecycle hooks', () => {
        @entity()
        class Order {
            @primaryColumn() id!: number;

            @prePersist()
            onBeforeSave() {}

            @postLoad()
            onAfterLoad() {}

            @preUpdate()
            onBeforeUpdate() {}

            @postRemove()
            onAfterDelete() {}
        }

        @entity()
        class MultiHookEntity {
            @primaryColumn() id!: number;

            @prePersist()
            validateData() {}

            @prePersist()
            stampTimestamp() {}
        }

        it('stores lifecycle hooks for entity with multiple hooks', () => {
            const metadata = getEntityMetadata(Order);
            expect(metadata.lifecycleHooks).toHaveLength(4);

            const prePersistHook = metadata.lifecycleHooks.find((h) => h.event === 'prePersist');
            expect(prePersistHook).toBeDefined();
            expect(prePersistHook!.methodName).toBe('onBeforeSave');

            const postLoadHook = metadata.lifecycleHooks.find((h) => h.event === 'postLoad');
            expect(postLoadHook).toBeDefined();
            expect(postLoadHook!.methodName).toBe('onAfterLoad');

            const preUpdateHook = metadata.lifecycleHooks.find((h) => h.event === 'preUpdate');
            expect(preUpdateHook).toBeDefined();
            expect(preUpdateHook!.methodName).toBe('onBeforeUpdate');

            const postRemoveHook = metadata.lifecycleHooks.find((h) => h.event === 'postRemove');
            expect(postRemoveHook).toBeDefined();
            expect(postRemoveHook!.methodName).toBe('onAfterDelete');
        });

        it('stores multiple hooks of same event type', () => {
            const metadata = getEntityMetadata(MultiHookEntity);
            expect(metadata.lifecycleHooks).toHaveLength(2);

            const prePersistHooks = metadata.lifecycleHooks.filter((h) => h.event === 'prePersist');
            expect(prePersistHooks).toHaveLength(2);
            expect(prePersistHooks[0].methodName).toBe('validateData');
            expect(prePersistHooks[1].methodName).toBe('stampTimestamp');
        });
    });

    describe('transactional decorator', () => {
        class OrderService {
            @transactional()
            createOrder() {}
        }

        it('marks method as transactional', () => {
            const metadata = OrderService[Symbol.metadata];
            expect(metadata?.['orm:transactional']).toBe(true);
        });
    });
});
