/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { InValue } from '@libsql/client';
import { Constructable, FrameworkError } from '@ndigo/core';
import { columnTypeFamily, getEntityMetadata, isEntity, runLifecycleHooks, validateEntity } from '@ndigo/orm';
import type { EntityMetadata } from '@ndigo/orm';
import { Page, PageRequest, SortOrder, validatePageRequest } from '@ndigo/orm';
import { DrizzleDataSource } from './drizzle-data-source';

/**
 * Drizzle-backed entity manager: maps `@ndigo/orm` entity metadata onto SQL
 * through the data source's Drizzle database, validating every write against
 * the entity's derived schema and running lifecycle hooks around
 * persist/find/remove.
 */
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

        const pkColumn = meta.columns.find((c) => c.fieldName === meta.primaryColumn);
        const pkValue = pkColumn ? record[pkColumn.fieldName] : undefined;
        // A save is an update when the row already exists, matching the
        // in-memory manager's store.has() check (DAT-F1). Generated keys are
        // unset on first persist, so they are always inserts.
        const exists =
            pkColumn !== undefined &&
            pkValue !== undefined &&
            pkValue !== null &&
            (await this.existsById(entityClass, pkValue));

        // Lifecycle hooks run first (e.g. @prePersist fills createdAt), then
        // validation — matching the in-memory manager's order.
        runLifecycleHooks(entity, exists ? 'preUpdate' : 'prePersist');

        // Validate against the Zod schema derived from @column metadata (AD-07).
        validateEntity(entityClass, entity);

        const colNames: string[] = [];
        const values: unknown[] = [];

        for (const col of meta.columns) {
            const value = record[col.fieldName];
            if (value === undefined && meta.generatedColumns.includes(col.fieldName)) {
                continue;
            }
            colNames.push(`"${col.columnName}"`);
            values.push(encodeColumnValue(col.type, value));
        }

        if (colNames.length === 0) return;

        const placeholders = colNames.map(() => '?').join(', ');
        let insertSql = `INSERT INTO "${tableName}" (${colNames.join(', ')}) VALUES (${placeholders})`;

        // A defined primary key makes the INSERT an upsert: the excluded row's
        // values overwrite the conflicting row (DAT-F8). Conflicts on other
        // unique columns still raise their own error, which is no longer
        // masked by a fallback UPDATE.
        if (pkColumn !== undefined && pkValue !== undefined && pkValue !== null) {
            const setClauses = colNames.map((name) => `${name} = excluded.${name}`).join(', ');
            insertSql += ` ON CONFLICT("${pkColumn.columnName}") DO UPDATE SET ${setClauses}`;
        }

        const result = await this.#client.execute(insertSql, values as InValue[]);

        // Read back generated primary key for AUTOINCREMENT columns
        if (meta.generatedColumns.includes(meta.primaryColumn)) {
            const assigned = record[meta.primaryColumn];
            if (assigned === undefined && result.lastInsertRowid !== undefined && result.lastInsertRowid !== null) {
                record[meta.primaryColumn] = Number(result.lastInsertRowid);
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

    /**
     * Eagerly loads declared relations for a batch of entities of the same
     * class, issuing one query per relation over all distinct join keys rather
     * than one query per entity (DAT-F5). Each entity's relation field is
     * assigned the loaded value, mirroring {@link fetchRelation} semantics.
     *
     * @param entities - Entities of one class; an empty batch is a no-op.
     * @param relationNames - Declared relation field names to load.
     * @throws {FrameworkError} When a relation, its join column, or the
     *   target class is not declared, or for many-to-many relations.
     */
    async fetchRelations(entities: object[], relationNames: string[]): Promise<void> {
        if (entities.length === 0 || relationNames.length === 0) return;

        const entityClass = entities[0].constructor as Constructable<object>;
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        for (const relationName of relationNames) {
            // oxlint-disable-next-line no-await-in-loop -- one batched query per relation, in caller order, so counts stay deterministic.
            await this.#fetchRelationBatch(entities, meta, relationName);
        }
    }

    async #fetchRelationBatch(entities: object[], meta: EntityMetadata, relationName: string): Promise<void> {
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
        const records = entities as Array<Record<string, unknown>>;

        if (relation.joinColumn !== undefined) {
            const fkField = relation.joinColumn;
            this.#assertDeclaredColumn(meta, fkField, relationName);
            const targetPkColumn = targetMeta.columns.find((column) => column.fieldName === targetMeta.primaryColumn);
            const keys = distinctKeys(records, fkField);
            if (keys.size === 0 || targetPkColumn === undefined) {
                for (const record of records) record[relationName] = undefined;
                return;
            }

            const rows = await this.#selectByColumnIn(targetMeta.entityName, targetPkColumn.columnName, [
                ...keys.values(),
            ]);
            const byId = new Map<string, object>();
            for (const row of rows) {
                byId.set(relationKey(row[targetPkColumn.columnName]), this.#mapRowToEntity(targetClass, row));
            }

            for (const record of records) {
                const fk = record[fkField];
                record[relationName] = fk === undefined || fk === null ? undefined : byId.get(relationKey(fk));
            }
            return;
        }

        if (relation.inverseJoinColumn !== undefined) {
            const fkField = relation.inverseJoinColumn;
            this.#assertDeclaredColumn(targetMeta, fkField, relationName);
            const fkColumn = targetMeta.columns.find((column) => column.fieldName === fkField);
            const keys = distinctKeys(records, meta.primaryColumn);
            for (const record of records) record[relationName] = [];
            if (keys.size === 0 || fkColumn === undefined) return;

            const rows = await this.#selectByColumnIn(targetMeta.entityName, fkColumn.columnName, [...keys.values()]);
            const grouped = new Map<string, object[]>();
            for (const row of rows) {
                const key = relationKey(row[fkColumn.columnName]);
                const mapped = this.#mapRowToEntity(targetClass, row);
                const bucket = grouped.get(key);
                if (bucket === undefined) {
                    grouped.set(key, [mapped]);
                } else {
                    bucket.push(mapped);
                }
            }

            for (const record of records) {
                const pk = record[meta.primaryColumn];
                record[relationName] = pk === undefined || pk === null ? [] : (grouped.get(relationKey(pk)) ?? []);
            }
            return;
        }

        throw new FrameworkError(`Relation '${relationName}' declares neither joinColumn nor inverseJoinColumn.`);
    }

    async #selectByColumnIn(table: string, column: string, values: unknown[]): Promise<Array<Record<string, unknown>>> {
        const placeholders = values.map(() => '?').join(', ');
        const result = await this.#client.execute(
            `SELECT * FROM "${table}" WHERE "${column}" IN (${placeholders})`,
            values as InValue[]
        );
        return result.rows as Array<Record<string, unknown>>;
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

        // Match the in-memory manager: @postRemove fires after the delete.
        runLifecycleHooks(entity, 'postRemove');
    }

    /**
     * Returns the number of rows of an entity type, counted in SQL (DA-7)
     * instead of materializing every row.
     *
     * @param entityClass - The entity class to count.
     */
    async count<T extends object>(entityClass: Constructable<T>): Promise<number> {
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        const result = await this.#client.execute(`SELECT COUNT(*) AS total FROM "${meta.entityName}"`);
        return Number((result.rows[0] as Record<string, unknown>).total);
    }

    /**
     * Checks whether a row with the given primary identifier exists using an
     * SQL probe (`SELECT 1 … LIMIT 1`) rather than loading the entity.
     *
     * @param entityClass - The entity class to probe.
     * @param id - The primary identifier value.
     */
    async existsById<T extends object>(entityClass: Constructable<T>, id: unknown): Promise<boolean> {
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        const pkColumn = meta.columns.find((c) => c.fieldName === meta.primaryColumn);
        if (!pkColumn) return false;

        const result = await this.#client.execute(
            `SELECT 1 FROM "${meta.entityName}" WHERE "${pkColumn.columnName}" = ? LIMIT 1`,
            [id] as InValue[]
        );
        return result.rows.length > 0;
    }

    /**
     * Deletes a row by primary identifier in a single `DELETE` statement,
     * reporting whether a row matched.
     *
     * @param entityClass - The entity class to delete from.
     * @param id - The primary identifier value.
     * @returns `true` when a row was deleted, `false` otherwise.
     */
    async deleteById<T extends object>(entityClass: Constructable<T>, id: unknown): Promise<boolean> {
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        const pkColumn = meta.columns.find((c) => c.fieldName === meta.primaryColumn);
        if (!pkColumn) return false;

        const result = await this.#client.execute(
            `DELETE FROM "${meta.entityName}" WHERE "${pkColumn.columnName}" = ?`,
            [id] as InValue[]
        );
        return Number(result.rowsAffected) > 0;
    }

    /**
     * Maps one SQL row to a fresh entity instance, decoding each cell per its
     * declared column type (DA-2) so a load→modify→save cycle sees booleans
     * and json values in the shape the entity's Zod schema validates.
     */
    #mapRowToEntity<T extends object>(entityClass: Constructable<T>, row: Record<string, unknown>): T {
        const meta = getEntityMetadata(entityClass);
        const entity = new entityClass() as Record<string, unknown>;

        for (const col of meta.columns) {
            entity[col.fieldName] = decodeColumnValue(col.type, row[col.columnName]);
        }

        // Every loaded row is a load: fire @postLoad, matching the in-memory
        // manager's find/findAll/fetchRelation behavior (DAT-F1).
        runLifecycleHooks(entity, 'postLoad');

        return entity as T;
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

/**
 * Canonical key for matching relation join values in JS the way SQLite
 * compares them with numeric affinity: `1`, `1.0` and `'1'` collapse to `'1'`
 * (a numeric FK stored in a TEXT-affinity column reads back as `'1.0'`),
 * while non-numeric strings (`'note-1'`) stay themselves.
 */
function relationKey(value: unknown): string {
    if (typeof value === 'string') {
        const numeric = Number(value);
        return value.trim() !== '' && !Number.isNaN(numeric) ? String(numeric) : value;
    }
    if (typeof value === 'boolean') return value ? '1' : '0';
    return String(value);
}

/**
 * Collects the distinct, non-null values of `field` across `records`, keyed by
 * {@link relationKey}. Used to batch relation lookups into one `IN (…)` query
 * (DAT-F5) while still matching SQLite's affinity rules in JS.
 */
function distinctKeys(records: Array<Record<string, unknown>>, field: string): Map<string, unknown> {
    const keys = new Map<string, unknown>();
    for (const record of records) {
        const value = record[field];
        if (value === undefined || value === null) continue;
        const key = relationKey(value);
        if (!keys.has(key)) {
            keys.set(key, value);
        }
    }
    return keys;
}

/**
 * Encodes one JS value for binding, mirroring `decodeColumnValue`. `Date`
 * values store as ISO-8601 text (DAT-F4), values of declared `json` columns as
 * JSON text, and everything else passes to the driver unchanged (primitives
 * natively; `Uint8Array`/`ArrayBuffer` as blobs). `undefined` binds as `NULL`.
 *
 * @param type - The declared column type; `undefined` for untyped columns.
 * @param value - The entity field value.
 * @returns The value to bind.
 */
function encodeColumnValue(type: string | undefined, value: unknown): unknown {
    if (value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    if (value !== null && typeof value === 'object' && columnTypeFamily(type) === 'json') {
        return JSON.stringify(value);
    }
    return value;
}

/**
 * Decodes one raw SQLite cell to the JS shape declared by `@column({ type })`,
 * mirroring `baseSchemaForType` (`@ndigo/orm`): boolean columns coerce their
 * stored representations (`0`/`1`, `'0'`/`'1'`, `'0.0'`/`'1.0'`, `'true'`/
 * `'false'`) to booleans, json columns parse their text representation back
 * into the stored value, and date-like columns parse ISO text back into a
 * `Date` (DAT-F4). Other declared types pass through unchanged — SQLite
 * already returns ints, reals, and text natively. Type matching is
 * whole-word (DAT-N1), so `point` is not read as `int`.
 *
 * @param type - The declared column type; `undefined` for untyped columns.
 * @param value - The raw cell value.
 * @returns The decoded value; `null`/`undefined` pass through.
 */
function decodeColumnValue(type: string | undefined, value: unknown): unknown {
    if (value === null || value === undefined) return value;

    switch (columnTypeFamily(type)) {
        case 'boolean': {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'number') return value !== 0;
            if (typeof value === 'bigint') return value !== 0n;
            if (typeof value === 'string') {
                if (value === 'true') return true;
                if (value === 'false') return false;
                const numeric = Number(value);
                if (!Number.isNaN(numeric)) return numeric !== 0;
            }
            return value;
        }
        case 'json': {
            if (typeof value !== 'string') return value;
            try {
                return JSON.parse(value) as unknown;
            } catch {
                // Non-JSON text in a json column (legacy rows, raw strings)
                // stays readable instead of failing the whole read.
                return value;
            }
        }
        case 'date': {
            if (typeof value !== 'string') return value;
            const parsed = new Date(value);
            // A non-date string in a date-like column stays readable.
            return Number.isNaN(parsed.getTime()) ? value : parsed;
        }
        default:
            return value;
    }
}
