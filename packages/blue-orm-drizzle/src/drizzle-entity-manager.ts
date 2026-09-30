/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { InValue } from '@libsql/client';
import { Constructable, FrameworkError } from '@blue/core';
import { getEntityMetadata, isEntity, validateEntity, LifecycleEvent } from '@blue/orm';
import type { EntityMetadata } from '@blue/orm';
import { Page, PageRequest, SortOrder, validatePageRequest } from '@blue/orm';
import { DrizzleDataSource } from './drizzle-data-source';

export class DrizzleEntityManager {
    readonly #dataSource: DrizzleDataSource;

    constructor(dataSource: DrizzleDataSource) {
        this.#dataSource = dataSource;
    }

    get #client() {
        return this.#dataSource.client;
    }

    async persist<T extends object>(entity: T): Promise<void> {
        const entityClass = entity.constructor as Constructable<T>;
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        const record = entity as Record<string, unknown>;
        const tableName = meta.entityName;

        // Lifecycle hooks run first (e.g. @prePersist fills createdAt), then
        // validation — matching the in-memory manager's order.
        this.#callLifecycleHooks(entity, 'prePersist');

        // Validate against the Zod schema derived from @column metadata (AD-7).
        validateEntity(entityClass, entity);

        const colNames: string[] = [];
        const values: unknown[] = [];

        for (const col of meta.columns) {
            const value = record[col.fieldName];
            if (value === undefined && meta.generatedColumns.includes(col.fieldName)) {
                continue;
            }
            colNames.push(`"${col.columnName}"`);
            // undefined (unset optional column, e.g. an empty FK) binds as NULL.
            values.push(
                value === undefined ? null : typeof value === 'object' && value !== null ? JSON.stringify(value) : value
            );
        }

        if (colNames.length === 0) return;

        const placeholders = colNames.map(() => '?').join(', ');
        const insertSql = `INSERT INTO "${tableName}" (${colNames.join(', ')}) VALUES (${placeholders})`;

        try {
            const result = await this.#client.execute(insertSql, values as InValue[]);

            // Read back generated primary key for AUTOINCREMENT columns
            if (meta.generatedColumns.includes(meta.primaryColumn)) {
                const pkValue = (entity as Record<string, unknown>)[meta.primaryColumn];
                if (pkValue === undefined && result.lastInsertRowid !== undefined && result.lastInsertRowid !== null) {
                    (entity as Record<string, unknown>)[meta.primaryColumn] = Number(result.lastInsertRowid);
                }
            }
        } catch (error) {
            const setClauses = colNames.map((name) => `${name} = ?`).join(', ');
            const pkColumn = meta.columns.find((c) => c.fieldName === meta.primaryColumn);
            const pkValue = pkColumn ? record[pkColumn.fieldName] : undefined;

            // Without a primary key the row cannot exist yet — rethrow the
            // real insert failure instead of masking it with a bogus UPDATE.
            if (!pkColumn || pkValue === undefined || pkValue === null) {
                throw error;
            }

            const updateSql = `UPDATE "${tableName}" SET ${setClauses} WHERE "${pkColumn.columnName}" = ?`;
            const updateResult = await this.#client.execute(updateSql, [...values, pkValue] as InValue[]);

            // A duplicate-primary-key conflict makes the UPDATE match the
            // existing row (rowsAffected = 1) and should be treated as an
            // upsert. Any other INSERT failure (e.g. a UNIQUE violation on a
            // different column held by another row) leaves the UPDATE matching
            // zero rows — rethrow the original error rather than silently
            // discarding the save.
            if (Number(updateResult.rowsAffected) === 0) {
                throw error;
            }
        }
    }

    async find<T extends object>(entityClass: Constructable<T>, id: unknown): Promise<T | undefined> {
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        const pkColumn = meta.columns.find((c) => c.fieldName === meta.primaryColumn);
        if (!pkColumn) return undefined;

        const sql = `SELECT * FROM "${meta.entityName}" WHERE "${pkColumn.columnName}" = ?`;
        const result = await this.#client.execute(sql, [id] as InValue[]);

        if (!result.rows || result.rows.length === 0) return undefined;
        return this.#mapRowToEntity(entityClass, result.rows[0] as Record<string, unknown>);
    }

    async findAll<T extends object>(entityClass: Constructable<T>): Promise<T[]> {
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        const result = await this.#client.execute(`SELECT * FROM "${meta.entityName}"`);

        return (result.rows as Record<string, unknown>[]).map((row) => this.#mapRowToEntity(entityClass, row));
    }

    /**
     * Retrieves one page of entities with SQL-side ordering and slicing.
     * Sort properties must name declared entity fields (validated before any
     * SQL runs); column and direction fragments are allowlisted and quoted,
     * so the request can never inject SQL.
     */
    async findPage<T extends object>(entityClass: Constructable<T>, request: PageRequest): Promise<Page<T>> {
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);

        const columnNameByField = new Map(meta.columns.map((column) => [column.fieldName, column.columnName]));
        validatePageRequest(request, new Set(columnNameByField.keys()));

        const orderBy = orderByClause(meta, request.sort ?? []);

        const offset = (request.page - 1) * request.size;
        const sql =
            `SELECT * FROM "${meta.entityName}"` +
            (orderBy.length > 0 ? ` ORDER BY ${orderBy}` : '') +
            ` LIMIT ${request.size} OFFSET ${offset}`;
        const result = await this.#client.execute(sql);

        const totalResult = await this.#client.execute(`SELECT COUNT(*) AS total FROM "${meta.entityName}"`);
        const total = (totalResult.rows[0] as Record<string, unknown>).total as number;

        return {
            content: (result.rows as Record<string, unknown>[]).map((row) => this.#mapRowToEntity(entityClass, row)),
            page: request.page,
            size: request.size,
            totalElements: total,
            totalPages: Math.ceil(total / request.size),
        };
    }

    /**
     * Finds rows matching equality conditions, with optional ordering and
     * limit — the building block for derived-query repositories. Sort
     * properties must name declared entity fields (validated before any SQL
     * runs); unlike `findPage`, no total counts are computed.
     */
    async findAllWhere<T extends object>(
        entityClass: Constructable<T>,
        conditions: Array<{ columnName: string; value: unknown }>,
        options: { orderBy?: SortOrder[]; limit?: number } = {}
    ): Promise<T[]> {
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        if (options.orderBy !== undefined) {
            const columnNameByField = new Map(meta.columns.map((column) => [column.fieldName, column.columnName]));
            validatePageRequest({ page: 1, size: 1, sort: options.orderBy }, new Set(columnNameByField.keys()));
        }
        // Condition columns are interpolated into SQL — they must be declared
        // entity columns (SEC-3, 2026-09-27 review): the allowlist is the
        // boundary the sort path already uses, and it keeps an arbitrary
        // caller from passing injected identifiers.
        const allowedColumns = new Set(meta.columns.map((column) => column.columnName));
        if (conditions.some((condition) => !allowedColumns.has(condition.columnName))) {
            throw new FrameworkError(
                `findAllWhere: condition column names must be declared entity columns on '${meta.entityName}'`
            );
        }
        if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 0)) {
            throw new FrameworkError('findAllWhere: limit must be a non-negative integer');
        }

        const where =
            conditions.length === 0
                ? ''
                : ` WHERE ${conditions.map((condition) => `"${condition.columnName}" = ?`).join(' AND ')}`;
        const orderBy = orderByClause(meta, options.orderBy ?? []);
        const limit = options.limit === undefined ? '' : ` LIMIT ${options.limit}`;
        const sql =
            `SELECT * FROM "${meta.entityName}"` + where + (orderBy.length > 0 ? ` ORDER BY ${orderBy}` : '') + limit;

        const result = await this.#client.execute(sql, conditions.map((condition) => condition.value) as InValue[]);
        return (result.rows as Record<string, unknown>[]).map((row) => this.#mapRowToEntity(entityClass, row));
    }

    /**
     * Loads one declared relation of an entity: the related entity for the
     * owning side (many-to-one, one-to-one) or the related entities for the
     * inverse side (one-to-many, one-to-one). Does not mutate the entity.
     *
     * @throws {FrameworkError} When the relation, its join column, or the
     *   target class is not declared, or for many-to-many relations
     *   (join-table semantics not implemented).
     */
    async fetchRelation(entity: object, relationName: string): Promise<unknown> {
        const entityClass = entity.constructor as Constructable<object>;
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        const relation = meta.relations.find((candidate) => candidate.fieldName === relationName);

        if (!relation) {
            throw new FrameworkError(`Entity '${meta.entityName}' declares no relation '${relationName}'.`);
        }
        if (relation.kind === 'many-to-many') {
            throw new FrameworkError(
                `Relation '${relationName}' is many-to-many; join-table fetch is not implemented.`
            );
        }

        const targetClass = relation.targetEntity() as unknown as Constructable<object>;
        if (!isEntity(targetClass)) {
            throw new FrameworkError(
                `Relation '${relationName}' target '${targetClass.name}' is not decorated with @entity.`
            );
        }
        const targetMeta = getEntityMetadata(targetClass);
        const record = entity as Record<string, unknown>;

        if (relation.joinColumn !== undefined) {
            const fkField = relation.joinColumn;
            this.#assertDeclaredColumn(meta, fkField, relationName);
            const fk = record[fkField];
            return fk === undefined || fk === null ? undefined : this.find(targetClass, fk);
        }

        if (relation.inverseJoinColumn !== undefined) {
            const fkField = relation.inverseJoinColumn;
            this.#assertDeclaredColumn(targetMeta, fkField, relationName);
            const pk = record[meta.primaryColumn];
            if (pk === undefined || pk === null) {
                return [];
            }

            const targetColumnNameByField = new Map(
                targetMeta.columns.map((column) => [column.fieldName, column.columnName])
            );
            return this.findAllWhere(targetClass, [
                { columnName: targetColumnNameByField.get(fkField) as string, value: pk },
            ]);
        }

        throw new FrameworkError(`Relation '${relationName}' declares neither joinColumn nor inverseJoinColumn.`);
    }

    #assertDeclaredColumn(meta: EntityMetadata, fieldName: string, relationName: string): void {
        const declared = meta.columns.some((column) => column.fieldName === fieldName);
        if (!declared) {
            throw new FrameworkError(
                `Relation '${relationName}' join column '${fieldName}' is not a declared @column of '${meta.entityName}'.`
            );
        }
    }

    async remove<T extends object>(entity: T): Promise<void> {
        const entityClass = entity.constructor as Constructable<T>;
        if (!isEntity(entityClass)) return;

        const meta = getEntityMetadata(entityClass);
        const pkColumn = meta.columns.find((c) => c.fieldName === meta.primaryColumn);
        if (!pkColumn) return;

        const pkValue = (entity as Record<string, unknown>)[meta.primaryColumn];
        if (pkValue === undefined || pkValue === null) return;

        const sql = `DELETE FROM "${meta.entityName}" WHERE "${pkColumn.columnName}" = ?`;
        await this.#client.execute(sql, [pkValue] as InValue[]);
    }

    #mapRowToEntity<T extends object>(entityClass: Constructable<T>, row: Record<string, unknown>): T {
        const meta = getEntityMetadata(entityClass);
        const entity = new entityClass() as Record<string, unknown>;

        for (const col of meta.columns) {
            entity[col.fieldName] = row[col.columnName];
        }

        return entity as T;
    }

    /**
     * Invokes the registered lifecycle hooks for an event (e.g. `@prePersist`),
     * mirroring the in-memory manager's behavior. Runs BEFORE schema
     * validation so hooks can fill defaults (e.g. `createdAt`).
     *
     * @param entity - The entity instance.
     * @param event - The lifecycle event name.
     */
    #callLifecycleHooks<T extends object>(entity: T, event: LifecycleEvent): void {
        const entityClass = entity.constructor as Constructable<T>;
        const metadata = getEntityMetadata(entityClass);
        const hooks = metadata.lifecycleHooks.filter((h) => h.event === event);
        const record = entity as Record<string, (...args: unknown[]) => unknown>;
        for (const hook of hooks) {
            if (typeof record[hook.methodName] === 'function') {
                record[hook.methodName]();
            }
        }
    }
}

/**
 * Builds an `ORDER BY` fragment from validated sort clauses. Callers
 * validate sort properties against the entity's declared columns before
 * calling; column and direction fragments are quoted/allowlisted here, so
 * clauses can never inject SQL.
 */
function orderByClause(meta: EntityMetadata, sort: SortOrder[]): string {
    const columnNameByField = new Map(meta.columns.map((column) => [column.fieldName, column.columnName]));

    return sort
        .map((clause) => {
            const columnName = columnNameByField.get(clause.property) as string;
            const direction = (clause.direction ?? 'asc').toUpperCase();
            return `"${columnName}" ${direction}`;
        })
        .join(', ');
}
