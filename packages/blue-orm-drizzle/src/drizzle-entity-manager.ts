/**
 * @author Jeff Rose
 */

import { Constructable, FrameworkError } from '@blue/core';
import { getEntityMetadata, isEntity } from '@blue/orm';
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

        const colNames: string[] = [];
        const values: unknown[] = [];

        for (const col of meta.columns) {
            const value = record[col.fieldName];
            if (value === undefined && meta.generatedColumns.includes(col.fieldName)) {
                continue;
            }
            colNames.push(`"${col.columnName}"`);
            values.push(typeof value === 'object' && value !== null ? JSON.stringify(value) : value);
        }

        if (colNames.length === 0) return;

        const placeholders = colNames.map(() => '?').join(', ');
        const insertSql = `INSERT INTO "${tableName}" (${colNames.join(', ')}) VALUES (${placeholders})`;

        try {
            const result: any = await this.#client.execute(insertSql, values as any[]);

            // Read back generated primary key for AUTOINCREMENT columns
            if (meta.generatedColumns.includes(meta.primaryColumn)) {
                const pkValue = (entity as Record<string, unknown>)[meta.primaryColumn];
                if (pkValue === undefined && result.lastInsertRowid !== undefined && result.lastInsertRowid !== null) {
                    (entity as Record<string, unknown>)[meta.primaryColumn] = Number(result.lastInsertRowid);
                }
            }
        } catch {
            const setClauses = colNames.map((name) => `${name} = ?`).join(', ');
            const pkColumn = meta.columns.find((c) => c.fieldName === meta.primaryColumn);
            if (pkColumn) {
                const pkValue = record[meta.primaryColumn];
                const updateSql = `UPDATE "${tableName}" SET ${setClauses} WHERE "${pkColumn.columnName}" = ?`;
                await this.#client.execute(updateSql, [...values, pkValue] as any[]);
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
        const result = await this.#client.execute(sql, [id] as any[]);

        if (!result.rows || result.rows.length === 0) return undefined;
        return this.#mapRowToEntity(entityClass, result.rows[0] as Record<string, unknown>);
    }

    async findAll<T extends object>(entityClass: Constructable<T>): Promise<T[]> {
        if (!isEntity(entityClass)) {
            throw new FrameworkError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        const meta = getEntityMetadata(entityClass);
        const result = await this.#client.execute(`SELECT * FROM "${meta.entityName}"`);

        return (result.rows as Record<string, unknown>[]).map((row) =>
            this.#mapRowToEntity(entityClass, row),
        );
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
        await this.#client.execute(sql, [pkValue] as any[]);
    }

    #mapRowToEntity<T extends object>(
        entityClass: Constructable<T>,
        row: Record<string, unknown>,
    ): T {
        const meta = getEntityMetadata(entityClass);
        const entity = new entityClass() as Record<string, unknown>;

        for (const col of meta.columns) {
            entity[col.fieldName] = row[col.columnName];
        }

        return entity as T;
    }
}