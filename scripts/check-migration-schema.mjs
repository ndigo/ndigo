#!/usr/bin/env node
/**
 * Migration-schema freshness gate (AD-78 D-6).
 *
 * Regenerates the reference app's committed schema snapshot through the
 * app's own `db:generate` script and fails on ANY working-tree change under
 * `apps/04-blue-api/db/` — a run at HEAD must be byte-identical (a fresh
 * migration file means the entities moved without a committed migration;
 * a snapshot diff means the last generate was never committed). Mirrors the
 * doc-freshness gate's premise: generated artifacts are committed and
 * regen-checked in CI.
 *
 * Requires the workspace built (the app script imports `@blue/orm-drizzle`
 * from its built `lib/`); CI runs build before checks.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbDir = join(root, 'apps', '04-blue-api', 'db');

// 1. Regenerate: the app script writes only when the metadata actually
//    moved (plus the always-rewritten snapshot, byte-identical when clean).
const generate = spawnSync('pnpm', ['--filter', '@blue/api', 'db:generate'], {
    cwd: root,
    stdio: ['ignore', 'inherit', 'inherit'],
});
if (generate.status !== 0) {
    process.stderr.write('db:schema:check: `db:generate` failed — see output above.\n');
    process.exit(1);
}

// 2. Any file-level change under db/ (staged, unstaged, or untracked) is
//    drift: the committed snapshot or migrations are not in sync with the
//    entities.
const status = spawnSync('git', ['status', '--porcelain', '--', dbDir], {
    cwd: root,
    encoding: 'utf8',
});
if (status.status !== 0) {
    process.stderr.write(`db:schema:check: git status failed: ${status.stderr ?? status.stdout}\n`);
    process.exit(1);
}
const lines = (status.stdout ?? '').split('\n').filter((line) => line.length > 0);
if (lines.length > 0) {
    process.stderr.write(
        'db:schema:check: schema drift under apps/04-blue-api/db/ — ' +
            'run `blue db generate apps/04-blue-api`, review the generated ' +
            'migration, and commit it together with db/schema.json:\n'
    );
    for (const line of lines) {
        process.stderr.write(`  ${line}\n`);
    }
    process.exit(1);
}

process.stdout.write('db:schema:check: snapshot and migrations in sync with entity metadata.\n');
