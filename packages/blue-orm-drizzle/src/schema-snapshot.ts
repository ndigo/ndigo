/**
 * Committed schema snapshot + generation (AD-78 D-2/D-3).
 *
 * `projectEntities` renders entity metadata (with the same predicate
 * `createTableStatements` uses: storage types, PK/generated, nullability)
 * into a normalized, committed projection (`db/schema.json`). `diffProjections`
 * compares a committed projection against the current one and renders the SQL
 * delta for a versioned migration. The predicate is the fidelity ceiling:
 * anything `createTableStatements` cannot express (defaults, uniqueness,
 * indexes, FK DDL from relations) is reported as unsupported rather than
 * silently dropped — growing the metadata later must bump `predicate` so
 * committed snapshots fail the freshness check instead of diverging.
 *
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Constructable } from '@blue/core';
import { getEntityMetadata, isEntity } from '@blue/orm';
import { primaryKeyStorageType, sqliteTypeForColumnType } from './_column-types';

/** The projection format version — bump when the metadata predicate grows. */
export const SNAPSHOT_PREDICATE = 1;

/** SQLite storage classes the metadata → SQL mapping can emit. */
export type SqliteStorageType = 'INTEGER' | 'REAL' | 'NUMERIC' | 'BLOB' | 'TEXT';

/**
 * One column as the DDL predicate models it. `nullable` is the resolved
 * nullability (`createTableStatements` semantics: explicit `nullable: true`
 * or a non-PK generated column, which `persist()` skips while undefined).
 */
export interface ColumnProjection {
    name: string;
    type: SqliteStorageType;
    primaryKey: boolean;
    generated: boolean;
    nullable: boolean;
}

/** One table's projection. */
export interface TableProjection {
    name: string;
    columns: ColumnProjection[];
}

/** The committed, normalized metadata projection (`db/schema.json`). */
export interface SchemaSnapshot {
    predicate: typeof SNAPSHOT_PREDICATE;
    tables: TableProjection[];
}

/** The delta between two projections, as rendered for a migration. */
export interface ProjectionDelta {
    /** SQL statements for the migration body (table creates first, then column changes, then drops). */
    statements: string[];
    /** Human summary used as the migration description, e.g. `create table "notes"; drop column "old" from "notes"`. */
    description: string;
    /** Changes the predicate cannot express (type/nullability/PK changes, added PK columns) — hand-written SQL required. */
    unsupported: string[];
    /**
     * The drop statements among {@link ProjectionDelta.statements} (also
     * listed there) — the destructive subset a generator may want to gate
     * behind explicit operator acknowledgment before emitting (REV-006).
     * Empty when the delta contains no drops.
     */
    drops: string[];
}

/**
 * Projects entity classes into the snapshot shape. Tables with no columns
 * contribute nothing (mirroring `createTableStatements`); column order is
 * the metadata declaration order.
 *
 * @param entities - The entity classes declared with `@blue/orm` decorators.
 * @returns The metadata projection.
 */
export function projectEntities(entities: Constructable[]): SchemaSnapshot {
    const tables: TableProjection[] = [];
    for (const entityClass of entities) {
        if (!isEntity(entityClass)) continue;
        const meta = getEntityMetadata(entityClass);
        const columns: ColumnProjection[] = [];
        for (const col of meta.columns) {
            const isPrimaryKey = col.fieldName === meta.primaryColumn;
            const isGenerated = meta.generatedColumns.includes(col.fieldName);
            const type = isPrimaryKey
                ? primaryKeyStorageType(col.type, isGenerated)
                : sqliteTypeForColumnType(col.type);
            const nullable = col.nullable === true || (!isPrimaryKey && isGenerated);
            columns.push({
                name: col.columnName,
                type,
                primaryKey: isPrimaryKey,
                generated: isGenerated,
                nullable,
            });
        }
        if (columns.length > 0) {
            tables.push({ name: meta.entityName, columns });
        }
    }
    return { predicate: SNAPSHOT_PREDICATE, tables };
}

/**
 * Renders a table's `CREATE TABLE` statement from its projection — the
 * projection-side mirror of `createTableStatements`, kept byte-identical by
 * the parity spec (`test/schema-snapshot.spec.ts`).
 *
 * @param table - The table projection.
 * @returns The `CREATE TABLE IF NOT EXISTS` statement.
 */
export function renderCreateTable(table: TableProjection): string {
    const columns = table.columns.map((column) => {
        const parts: string[] = [`"${column.name}"`, column.type];
        if (column.primaryKey) {
            parts.push('PRIMARY KEY');
            if (column.generated && column.type === 'INTEGER') {
                parts.push('AUTOINCREMENT');
            }
        }
        if (!column.primaryKey) {
            // createTableStatements leaves the nullability off primary keys.
            parts.push(column.nullable ? 'NULL' : 'NOT NULL');
        }
        return parts.join(' ');
    });
    return `CREATE TABLE IF NOT EXISTS "${table.name}" (\n  ${columns.join(',\n  ')}\n)`;
}

/**
 * Diffs a committed projection against the current one and renders the SQL
 * delta. A `null` `before` (no committed snapshot yet) renders every table
 * as a create. Column additions render `ALTER TABLE … ADD COLUMN` (except
 * added primary-key columns, which need a rebuild); dropped columns and
 * dropped tables render `ALTER TABLE … DROP COLUMN` / `DROP TABLE IF
 * EXISTS` (both also listed in `drops`, the destructive subset a generator
 * may gate behind explicit acknowledgment). Changes the predicate cannot
 * express — type, nullability, primary-key or generated-flag changes — go
 * to `unsupported`, never into the migration silently.
 *
 * @param before - The committed projection, or `null` when none exists.
 * @param after - The current projection (from `projectEntities`).
 * @returns The rendered delta.
 */
export function diffProjections(before: SchemaSnapshot | null, after: SchemaSnapshot): ProjectionDelta {
    const statements: string[] = [];
    const unsupported: string[] = [];
    const drops: string[] = [];
    const summary: string[] = [];

    if (before === null) {
        for (const table of after.tables) {
            statements.push(renderCreateTable(table));
            summary.push(`create table "${table.name}"`);
        }
        return { statements, description: summary.join('; '), unsupported, drops };
    }

    const beforeTables = new Map(before.tables.map((table) => [table.name, table] as const));
    for (const table of after.tables) {
        const prev = beforeTables.get(table.name);
        if (prev === undefined) {
            statements.push(renderCreateTable(table));
            summary.push(`create table "${table.name}"`);
            continue;
        }
        const beforeColumns = new Map(prev.columns.map((column) => [column.name, column] as const));
        for (const column of table.columns) {
            const prevColumn = beforeColumns.get(column.name);
            if (prevColumn === undefined) {
                if (column.primaryKey) {
                    unsupported.push(
                        `added primary-key column "${column.name}" on "${table.name}" requires a table rebuild`
                    );
                } else {
                    statements.push(`ALTER TABLE "${table.name}" ADD COLUMN ${renderColumn(column)}`);
                    summary.push(`add column "${column.name}" to "${table.name}"`);
                }
            } else if (
                prevColumn.type !== column.type ||
                prevColumn.nullable !== column.nullable ||
                prevColumn.primaryKey !== column.primaryKey ||
                prevColumn.generated !== column.generated
            ) {
                unsupported.push(
                    `column "${column.name}" on "${table.name}" changed ` +
                        `(${prevColumn.type}/${prevColumn.nullable}/${prevColumn.primaryKey}/${prevColumn.generated} → ` +
                        `${column.type}/${column.nullable}/${column.primaryKey}/${column.generated}) — hand-write this migration`
                );
            }
        }
        const currentNames = new Set(table.columns.map((column) => column.name));
        for (const prevColumn of prev.columns) {
            if (!currentNames.has(prevColumn.name)) {
                const statement = `ALTER TABLE "${table.name}" DROP COLUMN "${prevColumn.name}"`;
                statements.push(statement);
                drops.push(statement);
                summary.push(`drop column "${prevColumn.name}" from "${table.name}"`);
            }
        }
    }

    const currentTables = new Set(after.tables.map((table) => table.name));
    for (const table of before.tables) {
        if (!currentTables.has(table.name)) {
            const statement = `DROP TABLE IF EXISTS "${table.name}"`;
            statements.push(statement);
            drops.push(statement);
            summary.push(`drop table "${table.name}"`);
        }
    }

    return { statements, description: summary.join('; '), unsupported, drops };
}

/**
 * The `CREATE TABLE` column fragment, mirroring `createTableStatements`.
 * Included columns are never primary keys (those go through
 * {@link diffProjections} as unsupported), so PKs do not appear here.
 *
 * @param column - The column projection.
 * @returns The `"name" TYPE NULL|NOT NULL` fragment.
 */
function renderColumn(column: ColumnProjection): string {
    return `"${column.name}" ${column.type} ${column.nullable ? 'NULL' : 'NOT NULL'}`;
}

/**
 * Renders a versioned migration module (`db/migrations/<NNNN>-<slug>.ts`) —
 * the artifact `blue db generate` commits. Statements and the description
 * are emitted as single-quoted literals when the content contains no single
 * quote (the oxfmt-stable form — the freshness gate regenerates and diffs,
 * so the emitter must survive `oxfmt --check` byte-identically); content
 * with single quotes falls back to JSON double-quoted literals.
 *
 * @param version - The migration version (next after the committed highest).
 * @param description - Human summary (from `diffProjections`).
 * @param statements - The migration body's SQL statements.
 * @returns The migration module source.
 */
export function renderMigrationFile(version: number, description: string, statements: string[]): string {
    const body = statements.map((statement) => `            ${quote(statement)},`).join('\n');
    return (
        '// Generated by `blue db generate` — commit this file; the runner applies it in version order (AD-78).\n' +
        "import type { Migration } from '@blue/orm-drizzle';\n" +
        '\n' +
        'const migration: Migration = {\n' +
        `    version: ${version},\n` +
        `    description: ${quote(description)},\n` +
        '    up: (ctx) =>\n' +
        '        ctx.batch([\n' +
        `${body}\n` +
        '        ]),\n' +
        '};\n' +
        '\n' +
        'export default migration;\n'
    );
}

/**
 * Single-quoted when the content has no single quote (SQL statements quote
 * identifiers with double quotes), else a JSON double-quoted literal.
 * Escaping is JSON's on both forms (`\n`, `\\`, `\"` as needed) — single
 * quotes never span physical lines.
 *
 * @param value - The string to embed.
 * @returns The literal, oxfmt-stable.
 */
function quote(value: string): string {
    const json = JSON.stringify(value);
    if (value.includes("'")) return json;
    return `'${json.slice(1, -1).replace(/\\"/g, '"')}'`;
}

/**
 * Renders the committed snapshot document (`db/schema.json`). Key order is
 * stable so regeneration is byte-identical for the freshness gate.
 *
 * @param snapshot - The projection.
 * @returns The pretty-printed JSON document.
 */
export function renderSnapshot(snapshot: SchemaSnapshot): string {
    return `${JSON.stringify(snapshot, null, 2)}\n`;
}

/**
 * Parses a committed snapshot document, failing loud on an unknown
 * `predicate` (AD-78 D-3: a metadata growth that changes the projection
 * must bump the format, not silently diverge).
 *
 * @param source - The snapshot document from `renderSnapshot`.
 * @returns The parsed snapshot.
 */
export function readSnapshot(source: string): SchemaSnapshot {
    const parsed = JSON.parse(source) as { predicate?: unknown; tables?: unknown };
    if (parsed.predicate !== SNAPSHOT_PREDICATE) {
        throw new Error(
            `readSnapshot: unsupported schema snapshot predicate ${JSON.stringify(parsed.predicate)} — ` +
                `expected ${SNAPSHOT_PREDICATE}; regenerate with the current framework`
        );
    }
    return parsed as SchemaSnapshot;
}
