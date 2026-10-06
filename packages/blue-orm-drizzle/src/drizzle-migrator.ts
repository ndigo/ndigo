/**
 * Versioned schema migrations for Drizzle data sources (AD-30): applies
 * code-composed `Migration[]` in ascending version order, journaled in
 * `_blue_migrations`, applied outside any explicit transaction (see
 * {@link Migration.up} for the `batch()` constraint).
 * * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { InValue } from '@libsql/client';
import { DrizzleDataSource } from './drizzle-data-source';

/**
 * A single versioned schema change. Versions are unique positive integers;
 * the runner applies them in ascending order regardless of input order.
 * `up` runs outside any explicit transaction. SQLite itself supports
 * transactional DDL, but a migration body may use `ctx.batch(...)`, and
 * libSQL runs a batch in its own implicit transaction: with an explicit
 * transaction open, that nested batch fails ("cannot start a transaction
 * within a transaction") and takes the outer transaction down with it.
 * Statements are therefore atomic individually — a single `execute`
 * autocommits, a `batch` is atomic as a group. A failing `up` leaves no
 * journal row, so the migration is retried on the next run; author
 * idempotent DDL (`IF NOT EXISTS` style) or restore from backup when a
 * migration fails partway.
 */
export interface Migration {
    version: number;
    /** Human-readable summary recorded in the journal. */
    description: string;
    /** Applies the change; throw to roll it back. Return value is ignored. */
    up: (context: MigrationContext) => void | Promise<unknown>;
}

/**
 * The SQL surface available to a migration, backed by the data source's
 * libSQL client.
 */
export interface MigrationContext {
    /** Executes a single statement (DDL or DML) with optional positional args. */
    execute(sql: string, args?: unknown[]): Promise<unknown>;
    /** Executes multiple statements in one round trip (schema DDL batches). */
    batch(statements: string[]): Promise<unknown>;
}

export type MigrationState = 'applied' | 'pending';

export interface MigrationStatus {
    version: number;
    description: string;
    /** Whether the journal records this version as applied. */
    state: MigrationState;
    /** ISO-8601 timestamp recorded at apply time; present when `applied`. */
    appliedAt?: string;
}

const JOURNAL_TABLE = '_blue_migrations';

const JOURNAL_DDL = `CREATE TABLE IF NOT EXISTS "${JOURNAL_TABLE}" (
  version INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TEXT NOT NULL
)`;

/**
 * Journaled, forward-only schema migration runner (AD-30).
 *
 * `migrate()` applies every pending migration in ascending version order
 * and journals each application in `_blue_migrations`; `status()` reports
 * applied/pending over a migration list for boot logs and operator tooling.
 * Runs are idempotent: versions already present in the journal are skipped.
 *
 * @example
 * ```ts
 * const migrator = new DrizzleMigrator(dataSource);
 * await migrator.migrate([
 *     { version: 1, description: 'initial schema', up: (ctx) => ctx.batch(createTableStatements([Note])) },
 *     { version: 2, description: 'add title column', up: (ctx) => ctx.execute('ALTER TABLE "notes" ADD COLUMN "title" TEXT') },
 * ]);
 * ```
 */
export class DrizzleMigrator {
    readonly #dataSource: DrizzleDataSource;

    /**
     * @param dataSource - The data source whose connection the migrations
     *   and journal use. Targets local/file/memory SQLite. Do not call
     *   `migrate` from inside an open transaction on the same connection.
     */
    constructor(dataSource: DrizzleDataSource) {
        this.#dataSource = dataSource;
    }

    /**
     * Applies all pending migrations in ascending version order.
     *
     * @param migrations - The full migration history; input order is
     *   irrelevant. Duplicate or invalid versions fail loud before any SQL
     *   runs.
     */
    async migrate(migrations: Migration[]): Promise<void> {
        const ordered = orderedMigrations(migrations);
        await this.#ensureJournal();

        const applied = await this.#appliedVersions();

        for (const migration of ordered) {
            if (applied.has(migration.version)) {
                continue;
            }
            // oxlint-disable-next-line no-await-in-loop -- migrations apply in ascending order and share schema state; parallel application would race.
            await this.#apply(migration);
        }
    }

    /**
     * Reports the applied/pending state of each migration, with the apply
     * timestamp when recorded. Ensures the journal exists.
     */
    async status(migrations: Migration[]): Promise<MigrationStatus[]> {
        const ordered = orderedMigrations(migrations);
        await this.#ensureJournal();

        const rows = await this.#dataSource.client.execute(
            `SELECT version, applied_at FROM "${JOURNAL_TABLE}" ORDER BY version`
        );
        const appliedAtByVersion = new Map<number, string>();
        for (const row of rows.rows as Record<string, unknown>[]) {
            appliedAtByVersion.set(row.version as number, row.applied_at as string);
        }

        return ordered.map((migration) => {
            const appliedAt = appliedAtByVersion.get(migration.version);
            return {
                version: migration.version,
                description: migration.description,
                state: appliedAt === undefined ? 'pending' : 'applied',
                appliedAt,
            };
        });
    }

    async #ensureJournal(): Promise<void> {
        await this.#dataSource.client.execute(JOURNAL_DDL);
    }

    async #appliedVersions(): Promise<Set<number>> {
        const rows = await this.#dataSource.client.execute(`SELECT version FROM "${JOURNAL_TABLE}"`);
        return new Set((rows.rows as Record<string, unknown>[]).map((row) => row.version as number));
    }

    async #apply(migration: Migration): Promise<void> {
        const context: MigrationContext = {
            execute: (sql, args) => this.#dataSource.client.execute(sql, args as InValue[]),
            batch: (statements) => this.#dataSource.client.batch(statements.map((sql) => ({ sql }))),
        };

        await migration.up(context);

        // Migration bodies cannot be wrapped in an explicit transaction: a
        // body using `ctx.batch(...)` would nest libSQL's implicit batch
        // transaction and fail ("cannot start a transaction within a
        // transaction"), which rolls the outer transaction back. Atomicity
        // is per statement (`execute` autocommit) or per batch. The journal
        // insert is therefore standalone (single-statement autocommit) and
        // lands only after `up` returns: a failed migration leaves no
        // journal row and is retried.
        await this.#dataSource.client.execute(
            `INSERT INTO "${JOURNAL_TABLE}" (version, description, applied_at) VALUES (?, ?, ?)`,
            [migration.version, migration.description, new Date().toISOString()] as InValue[]
        );
    }
}

function orderedMigrations(migrations: Migration[]): Migration[] {
    const seen = new Set<number>();

    for (const migration of migrations) {
        if (!Number.isInteger(migration.version) || migration.version <= 0) {
            throw new Error(
                `DrizzleMigrator: migration version must be a positive integer, got ${JSON.stringify(
                    migration.version
                )}`
            );
        }
        if (seen.has(migration.version)) {
            throw new Error(`DrizzleMigrator: duplicate migration version ${migration.version}`);
        }
        seen.add(migration.version);
    }

    return [...migrations].sort((left, right) => left.version - right.version);
}
