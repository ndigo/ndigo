/**
 * Public API of `@ndigo/cli` — the complete CLI command surface: app
 * lifecycle (serve, dev), scaffolding (new, generate, db), release-qc
 * fronts (build, test, lint, format, typecheck), maintenance/DX (clean,
 * config, routes, completion, env, openapi, add, update, logs, info,
 * inspect, doctor). The `ndigo` binary is the primary surface; `runCli`
 * exposes the same dispatcher to embeddings.
 */
import { buildApplication, buildRouteMap, run, text_en, ExitCode } from '@stricli/core';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveCommand } from './commands/serve.js';
import { devCommand } from './commands/dev.js';
import { newCommand } from './commands/new.js';
import { generateCommand } from './commands/generate.js';
import { inspectCommand } from './commands/inspect.js';
import { routesCommand } from './commands/routes.js';
import { mcpCommand } from './commands/mcp.js';
import { doctorCommand } from './commands/doctor.js';
import { infoCommand } from './commands/info.js';
import { buildScriptCommand as buildCmd } from './commands/build.js';
import { testCommand } from './commands/test.js';
import { lintCommand } from './commands/lint.js';
import { formatCommand } from './commands/format.js';
import { typecheckCommand } from './commands/typecheck.js';
import { cleanCommand } from './commands/clean.js';
import { configCommand } from './commands/config.js';
import { completionCommand } from './commands/completion.js';
import { envCommand } from './commands/env.js';
import { addCommand } from './commands/add.js';
import { updateCommand } from './commands/update.js';
import { openapiCommand } from './commands/openapi.js';
import { logsCommand } from './commands/logs.js';
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
import { uiRouteMap } from './commands/ui/index.js';
import { aiRouteMap } from './commands/ai/index.js';
import { commandsCommand } from './commands/commands.js';
import { collectCommandIndex, setCommandIndex } from './commands/_command-registry.js';

/**
 * Builds the Stricli application for `@ndigo/cli`.
 *
 * @returns The application instance.
 *
 * @example
 * ```ts
 * const app = buildCliApp();
 * ```
 */
export function buildCliApp() {
    const dbRouteMap = buildRouteMap({
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
    });

    const rootRouteMap = buildRouteMap({
        routes: {
            serve: serveCommand,
            dev: devCommand,
            new: newCommand,
            generate: generateCommand,
            inspect: inspectCommand,
            routes: routesCommand,
            mcp: mcpCommand,
            commands: commandsCommand,
            doctor: doctorCommand,
            info: infoCommand,
            build: buildCmd,
            test: testCommand,
            lint: lintCommand,
            format: formatCommand,
            typecheck: typecheckCommand,
            clean: cleanCommand,
            config: configCommand,
            completion: completionCommand,
            env: envCommand,
            openapi: openapiCommand,
            add: addCommand,
            update: updateCommand,
            logs: logsCommand,
            ai: aiRouteMap,
            ui: uiRouteMap,
            db: dbRouteMap,
        },
        aliases: { g: 'generate' },
        docs: { brief: 'The Ndigo framework CLI' },
    });

    setCommandIndex(collectCommandIndex(rootRouteMap));

    let version = '0.0.1';
    try {
        // One level up works from BOTH layouts: `lib/index.js` and
        // `src/index.ts` each sit directly inside the package root.
        // `../..` pointed at `packages/package.json` — a file that does not
        // exist — so every read silently fell back to 0.0.1, invisible only
        // while the version *is* 0.0.1 (issue #146, review REV-004).
        const manifest = JSON.parse(
            readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8')
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
        // One default text bundle with the project's error-rendering
        // override (review REV-009, issue #148): a thrown error carrying an
        // `exitCode` is a usage error rendered as its bare message — the
        // Stricli default renders `Command failed,` followed by the whole
        // stack, which looks like a crash for an expected mistake. Genuine
        // faults (no `exitCode`) keep the stack visibly.
        localization: {
            text: {
                ...text_en,
                // REV-009 (issue #148): overriding `formatException` alone
                // would only fill the `${exc}` slot inside Stricli's fixed
                // `Command failed, ` prefix — the whole rendering belongs to
                // this method, so override it. A thrown error carrying an
                // `exitCode` is a usage error: its bare message, no stack.
                // Genuine faults keep the stack visibly.
                exceptionWhileRunningCommand: (exc: unknown, ansiColor: boolean): string => {
                    if (exc instanceof Error && typeof (exc as { exitCode?: number }).exitCode === 'number') {
                        return exc.message;
                    }
                    return text_en.exceptionWhileRunningCommand.call(
                        {
                            formatException: (value: unknown): string =>
                                value instanceof Error ? (value.stack ?? String(value)) : String(value),
                        },
                        exc,
                        ansiColor
                    );
                },
            },
        },
        // The same duck-flag drives the exit code for thrown AND
        // safely-returned errors, replacing the `process.exitCode = 2`
        // side channel the error factory used to set.
        determineExitCode: (exc: unknown): number => {
            const exitCode = (exc as { exitCode?: unknown })?.exitCode;
            return typeof exitCode === 'number' ? exitCode : ExitCode.CommandRunError;
        },
    });
}

/**
 * Runs the CLI dispatcher.
 *
 * @param args - The argv after the binary name (defaults to the process argv).
 * @returns When the process completes (commands set their own exit codes).
 *
 * @example
 * ```ts
 * await runCli(['db', 'status']);
 * ```
 */
export async function runCli(args: string[] = process.argv.slice(2)): Promise<unknown> {
    const app = buildCliApp();
    return run(app, args, { process });
}

// Re-export nothing from @stricli/core for backwards compat; consumers use runCli.
