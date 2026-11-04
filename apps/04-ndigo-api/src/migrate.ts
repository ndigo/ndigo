/**
 * `ndigo db migrate` demo entry — applies the journaled file migrations under
 * `db/migrations` (AD-30 runner, AD-78 D-1 loader) and prints the journal
 * readback. The data source is the same store the Drizzle routes read
 * (`NDIGO_DB_URL` override respected).
 *
 * @module ndigo-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { DrizzleDataSource, DrizzleMigrator, loadMigrations } from '@ndigo/orm-drizzle';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { MIGRATIONS_DIR } from './db-paths';
import { ensureDbDir, resolveDbUrl } from './drizzle-data-source';

const logger = getLogger('ndigo-api:db');

async function main(): Promise<void> {
    await ensureDbDir();
    const dataSource = new DrizzleDataSource({ url: resolveDbUrl() });
    const migrator = new DrizzleMigrator(dataSource);
    const migrations = await loadMigrations(MIGRATIONS_DIR);

    await migrator.migrate(migrations);

    const rows = await migrator.status(migrations);
    const lines = [
        'version  description             state   applied_at',
        ...rows.map((row) => {
            const appliedAt = row.appliedAt ?? '';
            return `${String(row.version).padEnd(7)}  ${(row.description ?? '').padEnd(24)} ${row.state.padEnd(7)} ${appliedAt}`;
        }),
    ];
    await new Promise<void>((resolve, reject) => {
        process.stdout.write(`${lines.join('\n')}\n`, 'utf8', (error) => (error ? reject(error) : resolve()));
    });
}

main().then(
    () => process.exit(0),
    (err) => {
        logger.error(`db:migrate failed: ${getErrorMessage(err)}`);
        process.exit(1);
    }
);
