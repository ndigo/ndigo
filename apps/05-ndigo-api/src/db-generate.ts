/**
 * `ndigo db generate` demo entry — renders the next versioned migration from
 * the demo entity metadata and rewrites the committed `db/schema.json`
 * projection (AD-78 D-2/D-5; run by `ndigo db generate` as the app's
 * `scripts.db:generate`).
 *
 * The snapshot is the common ancestor: the diff is computed against the
 * **committed** projection, so a run at HEAD regenerates byte-identical
 * output (the root freshness gate's premise) and writes a migration file
 * only when the metadata actually moved. The gate lives in
 * `db-generate-plan.ts`: a delta with destructive drops or changes the
 * AD-30 predicate cannot express **fails loud** (exit code 1) until the
 * operator acknowledges them with `NDIGO_DB_ACCEPT_DROPS=true` /
 * `NDIGO_DB_ACCEPT_UNSUPPORTED=true` (REV-002/REV-006).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getEnv } from '@ndigo/context';
import { projectEntities, readSnapshot, renderMigrationFile, renderSnapshot } from '@ndigo/orm-drizzle';
import type { SchemaSnapshot } from '@ndigo/orm-drizzle';
import { getLogger } from '@ndigo/log';
import { getErrorMessage } from '@ndigo/util';
import { MIGRATIONS_DIR, SNAPSHOT_PATH } from './db-paths';
import { DrizzleNote } from './drizzle-note.entity';
import { GenerationBlockedError, planGeneration } from './db-generate-plan';

const logger = getLogger('ndigo-api:db');

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

/**
 * The `NDIGO_DB_ACCEPT_*` escape hatches: present-and-not-false (the repo's
 * env-flag convention).
 */
function acceptFlag(name: string): boolean {
    const value = getEnv(name);
    return value !== undefined && value !== '' && value !== '0' && value.toLowerCase() !== 'false';
}

async function main(): Promise<void> {
    const snapshot = await loadSnapshot();
    const projection = projectEntities(ENTITIES);

    let plan: Awaited<ReturnType<typeof planGeneration>>;
    try {
        plan = await planGeneration(snapshot, projection, {
            dir: MIGRATIONS_DIR,
            acceptDrops: acceptFlag('NDIGO_DB_ACCEPT_DROPS'),
            acceptUnsupported: acceptFlag('NDIGO_DB_ACCEPT_UNSUPPORTED'),
        });
    } catch (error) {
        if (error instanceof GenerationBlockedError) {
            for (const note of error.warnings) {
                process.stderr.write(`WARNING: ${note}\n`);
            }
            process.stderr.write(`db:generate blocked: ${getErrorMessage(error)}\n`);
            process.exit(1);
        }
        throw error;
    }

    await mkdir(MIGRATIONS_DIR, { recursive: true });

    const lines: string[] = [];
    if (plan.statements.length > 0) {
        const target = join(MIGRATIONS_DIR, `${String(plan.version).padStart(4, '0')}-${plan.slug}.ts`);
        await writeFile(target, renderMigrationFile(plan.version, plan.description, plan.statements));
        lines.push(`generated ${target}`);
    } else if (plan.warnings.length === 0) {
        lines.push('no schema changes');
    }

    for (const note of plan.warnings) {
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
