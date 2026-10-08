/**
 * `blue db generate` demo entry — renders the next versioned migration from
 * the demo entity metadata and rewrites the committed `db/schema.json`
 * projection (AD-78 D-2/D-5; run by `blue db generate` as the app's
 * `scripts.db:generate`).
 *
 * The snapshot is the common ancestor: the diff is computed against the
 * **committed** projection, so a run at HEAD regenerates byte-identical
 * output (the root freshness gate's premise) and writes a migration file
 * only when the metadata actually moved. Changes the AD-30 predicate cannot
 * express (type/nullability/PK changes) are reported on stderr and the
 * snapshot is still rewritten — the projection tracks the entities, which
 * are the source of truth.
 *
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
    diffProjections,
    nextMigrationVersion,
    projectEntities,
    readSnapshot,
    renderMigrationFile,
    renderSnapshot,
} from '@blue/orm-drizzle';
import type { SchemaSnapshot } from '@blue/orm-drizzle';
import { getLogger } from '@blue/log';
import { getErrorMessage } from '@blue/util';
import { MIGRATIONS_DIR, SNAPSHOT_PATH } from './db-paths';
import { DrizzleNote } from './drizzle-note.entity';

const logger = getLogger('blue-api:db');

/** The demo's entities — the single schema source (AD-78 D-2). */
const ENTITIES = [DrizzleNote];

async function loadSnapshot(): Promise<SchemaSnapshot | null> {
    try {
        return readSnapshot(await readFile(SNAPSHOT_PATH, 'utf8'));
    } catch (error) {
        if ((error as { code?: string }).code === 'ENOENT') {
            return null; // no committed snapshot yet — the first generate is a baseline
        }
        throw error;
    }
}

async function main(): Promise<void> {
    const snapshot = await loadSnapshot();
    const projection = projectEntities(ENTITIES);
    const delta = diffProjections(snapshot, projection);

    await mkdir(MIGRATIONS_DIR, { recursive: true });

    const lines: string[] = [];
    if (delta.statements.length > 0) {
        const version = await nextMigrationVersion(MIGRATIONS_DIR);
        const slug = delta.description
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const target = join(MIGRATIONS_DIR, `${String(version).padStart(4, '0')}-${slug}.ts`);
        await writeFile(target, renderMigrationFile(version, delta.description, delta.statements));
        lines.push(`generated ${target}`);
    } else if (delta.unsupported.length === 0) {
        lines.push('no schema changes');
    }

    for (const note of delta.unsupported) {
        process.stderr.write(`WARNING: ${note}\n`);
    }

    // The projection tracks the entities (byte-identical when unchanged).
    await writeFile(SNAPSHOT_PATH, renderSnapshot(projection));

    await new Promise<void>((resolve, reject) => {
        process.stdout.write(`${lines.join('\n')}\n`, 'utf8', (error) => (error ? reject(error) : resolve()));
    });
}

main().then(
    () => process.exit(0),
    (err) => {
        logger.error(`db:generate failed: ${getErrorMessage(err)}`);
        process.exit(1);
    }
);
