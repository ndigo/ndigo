/**
 * Public API of `@ndigo/cli` — the framework CLI (AD-75): serve, dev, new,
 * generate, db, inspect, doctor. The `ndigo` binary is the primary surface;
 * `runCli` exposes the same dispatcher to embeddings.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildApplication, buildRouteMap, run } from '@stricli/core';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveCommand } from './commands/serve.js';
import { devCommand } from './commands/dev.js';
import { newCommand } from './commands/new.js';
import { generateCommand } from './commands/generate.js';
import { inspectCommand } from './commands/inspect.js';
import { doctorCommand } from './commands/doctor.js';
import { dbMigrateCommand } from './commands/db/migrate.js';
import { dbStatusCommand } from './commands/db/status.js';
import { dbGenerateCommand } from './commands/db/generate.js';
import { dbNewCommand } from './commands/db/new.js';
import { dbListCommand } from './commands/db/list.js';
import { dbPushCommand } from './commands/db/push.js';
import { dbPullCommand } from './commands/db/pull.js';
import { dbStudioCommand } from './commands/db/studio.js';
import { dbSeedCommand } from './commands/db/seed.js';
import { dbRollbackCommand } from './commands/db/rollback.js';

/**
 * Builds the Stricli application for `@ndigo/cli`.
 *
 * @returns The application instance.
 */
export function buildCliApp() {
    const dbRouteMap = buildRouteMap(
        {
            routes: {
                migrate: dbMigrateCommand,
                status: dbStatusCommand,
                generate: dbGenerateCommand,
                new: dbNewCommand,
                list: dbListCommand,
                push: dbPushCommand,
                pull: dbPullCommand,
                studio: dbStudioCommand,
                seed: dbSeedCommand,
                rollback: dbRollbackCommand,
            },
            docs: { brief: 'Database migration commands (AD-78)' },
        }
    );

    const rootRouteMap = buildRouteMap(
        {
            routes: {
                serve: serveCommand,
                dev: devCommand,
                new: newCommand,
                generate: generateCommand,
                inspect: inspectCommand,
                doctor: doctorCommand,
                db: dbRouteMap,
            },
            aliases: { g: 'generate' },
            docs: { brief: 'The Ndigo framework CLI' },
        }
    );

    let version = '0.0.1';
    try {
        const manifest = JSON.parse(
            readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json'), 'utf8')
        ) as { version?: unknown };
        if (typeof manifest.version === 'string') {
            version = manifest.version;
        }
    } catch {
        // fall back to default
    }

    return buildApplication(rootRouteMap, {
        name: '@ndigo/cli',
        versionInfo: { currentVersion: `@ndigo/cli/${version}` },
    });
}

/**
 * Runs the CLI dispatcher.
 *
 * @param args - The argv after the binary name (defaults to the process argv).
 * @returns When the process completes (commands set their own exit codes).
 */
export async function runCli(args: string[] = process.argv.slice(2)): Promise<unknown> {
    const app = buildCliApp();
    return run(app, args, { process });
}

// Re-export nothing from @stricli/core for backwards compat; consumers use runCli.