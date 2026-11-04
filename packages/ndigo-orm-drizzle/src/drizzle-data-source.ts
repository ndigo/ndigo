/**
 * @module ndigo-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createClient, Client } from '@libsql/client';
import { drizzle as createDrizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { Constructable } from '@ndigo/core';
import { getEntityMetadata, isEntity } from '@ndigo/orm';
import { primaryKeyStorageType, sqliteTypeForColumnType } from './_column-types';
import { TransactionScopedClient } from './_transaction-scoped-client';

export type { LibSQLDatabase } from 'drizzle-orm/libsql';

/**
 * Options for configuring the Drizzle data source.
 */
export interface DrizzleDataSourceOptions {
    url?: string;
    authToken?: string;
}

/**
 * Drizzle-backed data source that maps `@ndigo/orm` entity metadata to SQL tables.
 */
export class DrizzleDataSource {
    readonly #client: Client;
    readonly #db: LibSQLDatabase;
    readonly #url: string;
    #initialized = false;

    constructor(options: DrizzleDataSourceOptions = {}) {
        this.#url = options.url ?? ':memory:';
        // The raw client is pooled (`@libsql/client` 0.18 gives every statement
        // its own connection), so everything built on it — the Drizzle database
        // and every store handed `client` — goes through the scoped wrapper that
        // routes statements into an open transaction.
        this.#client = new TransactionScopedClient(createClient({ url: this.#url, authToken: options.authToken }));
        this.#db = createDrizzle(this.#client);
    }

    get db(): LibSQLDatabase {
        return this.#db;
    }

    get client(): Client {
        return this.#client;
    }

    get url(): string {
        return this.#url;
    }

    get initialized(): boolean {
        return this.#initialized;
    }

    async init(entities: Constructable[]): Promise<void> {
        if (this.#initialized) return;

        // DDL runs sequentially on one connection; parallel table creation can
        // race on shared catalog locks.
        for (const sql of createTableStatements(entities)) {
            // oxlint-disable-next-line no-await-in-loop -- DDL runs sequentially on one connection; parallel table creation can race on shared catalog locks.
            await this.#client.execute(sql);
        }

        this.#initialized = true;
    }
}

/**
 * Generates the `CREATE TABLE IF NOT EXISTS` statements for the given
 * entities' metadata — the single source of truth for metadata → DDL, shared
 * by {@link DrizzleDataSource.init} (fresh-DB auto-init) and baseline
 * migrations (AD-30 D-3).
 *
 * Column storage types follow the shared metadata → SQLite mapping:
 * `int*` → `INTEGER`, `real`/`float`/`double` → `REAL`, `blob` → `BLOB`,
 * everything else → `TEXT`. A primary key derives its storage class from the
 * declared column type; an undeclared generated key stays `INTEGER`
 * (auto-increment) and an undeclared caller-assigned key is `NUMERIC`, so
 * both string and numeric keys round-trip. `AUTOINCREMENT` is only emitted
 * for generated `INTEGER` keys. Non-PK `@generatedColumn` columns are emitted
 * nullable, because `persist()` skips them while undefined (DAT-F3).
 *
 * @param entities - The entity classes declared with `@ndigo/orm` decorators.
 * @returns One statement per entity with declared columns; entities with no
 *   columns contribute nothing.
 */
export function createTableStatements(entities: Constructable[]): string[] {
    const statements: string[] = [];

    for (const entityClass of entities) {
        if (!isEntity(entityClass)) continue;

        const meta = getEntityMetadata(entityClass);
        const tableName = meta.entityName;
        const columns: string[] = [];

        for (const col of meta.columns) {
            const parts: string[] = [`"${col.columnName}"`];
            const isPk = col.fieldName === meta.primaryColumn;
            const isGenerated = meta.generatedColumns.includes(col.fieldName);

            // Primary keys resolve their storage class separately: declared
            // type first, then the generated/caller-assigned defaults.
            const sqlType = isPk ? primaryKeyStorageType(col.type, isGenerated) : sqliteTypeForColumnType(col.type);

            parts.push(sqlType);

            if (isPk) {
                parts.push('PRIMARY KEY');
                if (isGenerated && sqlType === 'INTEGER') {
                    parts.push('AUTOINCREMENT');
                }
            }

            if (col.nullable === true || (!isPk && isGenerated)) {
                // Non-PK `@generatedColumn` columns are nullable: `persist()` skips
                // them while undefined, so NOT NULL would reject the insert
                // (DAT-F3).
                parts.push('NULL');
            } else if (!isPk) {
                parts.push('NOT NULL');
            }

            columns.push(parts.join(' '));
        }

        if (columns.length > 0) {
            statements.push(`CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columns.join(',\n  ')}\n)`);
        }
    }

    return statements;
}
