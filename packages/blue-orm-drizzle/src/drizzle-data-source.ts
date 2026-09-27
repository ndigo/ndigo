/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createClient, Client } from '@libsql/client';
import { drizzle as createDrizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { Constructable } from '@blue/core';
import { getEntityMetadata, isEntity } from '@blue/orm';

export type { LibSQLDatabase } from 'drizzle-orm/libsql';

/**
 * Options for configuring the Drizzle data source.
 */
export interface DrizzleDataSourceOptions {
    url?: string;
    authToken?: string;
}

/**
 * Drizzle-backed data source that maps `@blue/orm` entity metadata to SQL tables.
 */
export class DrizzleDataSource {
    readonly #client: Client;
    readonly #db: LibSQLDatabase;
    readonly #url: string;
    #initialized = false;

    constructor(options: DrizzleDataSourceOptions = {}) {
        this.#url = options.url ?? ':memory:';
        this.#client = createClient({ url: this.#url, authToken: options.authToken });
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
 * @param entities - The entity classes declared with `@blue/orm` decorators.
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

            const sqlType = isPk ? 'INTEGER' : (col.type ?? 'TEXT').toUpperCase();
            const sqlNormalized = sqlType === 'TEXT' || sqlType === 'STRING' ? 'TEXT' : 'INTEGER';

            parts.push(sqlNormalized);

            if (isPk) {
                parts.push('PRIMARY KEY');
                if (meta.generatedColumns.includes(col.fieldName)) {
                    parts.push('AUTOINCREMENT');
                }
            }

            if (col.nullable === true) {
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
