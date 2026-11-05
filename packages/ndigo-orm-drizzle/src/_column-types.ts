/**
 * Internal metadata → SQLite storage-type mapping shared by the DDL emitter
 * (`createTableStatements`) and the Drizzle table builder
 * (`drizzleTableForEntity`), so both paths agree on the type of every column.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { columnTypeFamily } from '@ndigo/orm';

/** SQLite storage classes the metadata → SQL mapping can emit. */
export type SqliteStorageType = 'INTEGER' | 'REAL' | 'NUMERIC' | 'BLOB' | 'TEXT';

/**
 * Maps a declared `@column({ type })` to its SQLite storage type:
 * integer family → `INTEGER`, `real`/`float`/`double` → `REAL`, `blob` →
 * `BLOB`, and everything else (`char`/`text`/`string`/`varchar`, plus boolean,
 * json and untyped columns) → `TEXT`. Classification uses whole-word matching
 * (DAT-N1), so an unrelated type like `point` is not read as `int`.
 *
 * @param type - The declared column type; `undefined` for untyped columns.
 * @returns The SQLite storage type for the column.
 */
export function sqliteTypeForColumnType(type: string | undefined): SqliteStorageType {
    switch (columnTypeFamily(type)) {
        case 'integer':
            return 'INTEGER';
        case 'real':
            return 'REAL';
        case 'blob':
            return 'BLOB';
        default:
            return 'TEXT';
    }
}

/**
 * Resolves the SQLite storage type of a primary key column. A declared type
 * always wins; otherwise a generated key is `INTEGER` (SQLite only
 * auto-increments `INTEGER PRIMARY KEY`, and `persist()` reads
 * `lastInsertRowid` back into generated keys) and a caller-assigned key is
 * `NUMERIC`.
 *
 * `NUMERIC` affinity keeps numeric keys numeric — matching the previous
 * forced-`INTEGER` behavior for client-assigned numeric ids — while
 * non-numeric strings are stored as text instead of failing with
 * `SQLITE_MISMATCH`; a `TEXT` key would instead stringify every numeric id.
 *
 * @param type - The declared column type; `undefined` for untyped keys.
 * @param generated - Whether the key field is marked `@generatedColumn`.
 * @returns The SQLite storage type for the primary key column.
 */
export function primaryKeyStorageType(type: string | undefined, generated: boolean): SqliteStorageType {
    if (type !== undefined) return sqliteTypeForColumnType(type);
    return generated ? 'INTEGER' : 'NUMERIC';
}
