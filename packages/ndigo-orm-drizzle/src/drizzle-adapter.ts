/**
 * `NdigoDatabaseAdapter` implementation over Drizzle/libSQL (AD-96).
 *
 * Wraps the existing `DrizzleMigrator` and the app-supplied migration list /
 * generate callback so `@ndigo/cli` can drive migrations without knowing
 * anything about Drizzle.
 */
import { DrizzleDataSource } from './drizzle-data-source.js';
import { DrizzleMigrator } from './drizzle-migrator.js';
import type { Migration } from './drizzle-migrator.js';
import type { NdigoDatabaseAdapter, MigrationStatus as AdapterMigrationStatus } from '@ndigo/orm';

export interface DrizzleAdapterOptions {
    /** Adapter name used for `--db <name>` selection. */
    name: string;
    /** The data source whose connection the migrations use. */
    dataSource: DrizzleDataSource;
    /** Full migration history (input order irrelevant). */
    migrations: Migration[];
    /** App-owned generator (entities → migration file + schema.json). */
    generate?: () => Promise<void>;
    /** App-owned seed routine. */
    seed?: () => Promise<void>;
    /** App-owned push (schema → DB). */
    push?: () => Promise<void>;
    /** App-owned pull (DB → schema). */
    pull?: () => Promise<void>;
    /** App-owned studio launcher. */
    studio?: () => Promise<void>;
    /** Rollback implementation. */
    rollback?: (count?: number) => Promise<void>;
}

/**
 * Builds a `NdigoDatabaseAdapter` around a Drizzle data source and migrations.
 *
 * @param options - Data source, migrations, name, and app-owned hooks.
 * @returns The database adapter.
 */
export function createDrizzleAdapter(options: DrizzleAdapterOptions): NdigoDatabaseAdapter {
    const migrator = new DrizzleMigrator(options.dataSource);

    return {
        name: options.name,
        engine: 'Drizzle (libSQL)',

        async migrate(): Promise<void> {
            await migrator.migrate(options.migrations);
        },

        async generate(): Promise<void> {
            if (!options.generate) {
                throw new Error('generate is not configured for this adapter');
            }
            await options.generate();
        },

        async status(): Promise<AdapterMigrationStatus[]> {
            const rows = await migrator.status(options.migrations);
            return rows.map((row) => ({
                version: row.version,
                description: row.description,
                applied: row.state === 'applied',
                appliedAt: row.appliedAt ? new Date(row.appliedAt) : undefined,
            }));
        },

        push: options.push,
        pull: options.pull,
        studio: options.studio,
        seed: options.seed,
        rollback: options.rollback,

        async close(): Promise<void> {
            // DataSource owns the client; nothing to close here by default.
        },
    };
}
