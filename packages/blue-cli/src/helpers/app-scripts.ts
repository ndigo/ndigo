/**
 * Command-side process helpers: everything `@blue/cli` runs is one of the
 * application's declared scripts, executed with the AD-74 supervisor
 * lifecycle. Long-lived commands (`serve`, `dev`) use the full
 * {@link ClusterRunner} (signal relay, straggler kill, exit-code
 * propagation); one-shot commands (`generate`, `db:*`, `inspect`) use a
 * plain spawn with relay because a completing process must not respawn.
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve as resolvePath } from 'node:path';
import { runCluster, type ClusterRunResult } from '@blue/cluster';

/** An error whose process exit code is `2` (usage), per the oclif contract. */
export function usageError(message: string): Error & { oclif?: { exit: number } } {
    const error = new Error(message) as Error & { oclif?: { exit: number } };
    error.oclif = { exit: 2 };
    return error;
}

/**
 * Reads a directory's `package.json`.
 */
export function readAppManifest(dir: string): Record<string, unknown> | null {
    try {
        return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Record<string, unknown>;
    } catch {
        return null;
    }
}

/**
 * The absolute form of `dir` (defaults to the working directory), failing
 * loud when it is not a directory with a `package.json` (the CLI's app
 * unit of address).
 *
 * @param dir - The directory argument (may be `undefined`/`'.'`).
 * @returns The absolute directory.
 */
export function resolveAppDir(dir: string | undefined): string {
    const target = resolvePath(dir ?? '.');
    if (!existsSync(join(target, 'package.json'))) {
        throw usageError(`'${target}' is not an application directory — it has no package.json`);
    }
    return target;
}

/**
 * Resolves one of the app's declared scripts, failing loud with a hint
 * when absent.
 *
 * @param dir - The app directory (absolute).
 * @param scriptKey - The `scripts.<key>` to run (`start`, `dev`, `inspect`, ...).
 * @param hint - How to add the script (shown in the error).
 * @returns The resolved script and its execution environment.
 */
export function appScriptCommand(
    dir: string,
    scriptKey: string,
    hint: string
): { argv: string[]; cwd: string; env: Record<string, string> } {
    const manifest = readAppManifest(dir);
    const scripts = manifest?.['scripts'] as Record<string, unknown> | undefined;
    const script = scripts?.[scriptKey];
    if (typeof script !== 'string' || script.length === 0) {
        throw usageError(`no "${scriptKey}" script in ${join(dir, 'package.json')} — ${hint}`);
    }
    // Scripts run WITHOUT a shell so OS signals reach the actual
    // application process: both package-manager `run` wrappers (which kill
    // their children without granting a drain) and dash-style `sh` (which
    // forks instead of execs) were verified to swallow SIGTERM on
    // 2026-10-07. The repo's start/dev scripts are single commands; the
    // app's local `.bin` (tsx, vite, …) goes on PATH for argv[0] lookup.
    const argv = script.split(/\s+/).filter((token) => token.length > 0);
    if (argv.length === 0) {
        throw usageError(`"${scriptKey}" in ${join(dir, 'package.json')} resolves to an empty command`);
    }
    if (argv.some((token) => /[|&;<>()]/u.test(token))) {
        throw usageError(
            `"${scriptKey}" in ${join(dir, 'package.json')} uses shell operators — ` +
                'serve runs the script without a shell, so keep it a single command ' +
                '(e.g. "tsx src/index.ts", not "build && run"): ' +
                JSON.stringify(script)
        );
    }
    const env: Record<string, string> = {
        PATH: `${join(dir, 'node_modules', '.bin')}:${process.env.PATH ?? ''}`,
    };
    return { argv, cwd: dir, env };
}

/**
 * Runs a long-lived app script under the AD-74 supervisor.
 *
 * @param dir - The app directory (absolute).
 * @param scriptKey - The `scripts.<key>` to run.
 * @param hint - The missing-script hint (see {@link appScriptCommand}).
 * @param options - `port` (base for `PORT`-derivation), `cluster` slots.
 * @returns The cluster outcome (children signal-relayed, exit-code observed).
 */
export async function runAppSupervised(
    dir: string,
    scriptKey: string,
    hint: string,
    options: { port?: number; cluster?: number } = {}
): Promise<ClusterRunResult> {
    const resolved = appScriptCommand(dir, scriptKey, hint);
    const env = { ...resolved.env };
    if (options.port !== undefined) {
        env.PORT = String(options.port);
    }
    return runCluster({
        size: options.cluster ?? 1,
        command: resolved.argv,
        cwd: resolved.cwd,
        env,
    });
}

/**
 * Runs a one-shot app script (generators, db, inspect) with signal relay
 * and exit-code propagation — deliberately NOT respawned.
 *
 * @param dir - The app directory (absolute).
 * @param scriptKey - The `scripts.<key>` to run.
 * @param hint - The missing-script hint.
 * @param extraArgv - Extra argv appended to the `pnpm run` invocation.
 * @returns The child's exit code.
 */
export async function runAppOnce(dir: string, scriptKey: string, hint: string): Promise<number> {
    const resolved = appScriptCommand(dir, scriptKey, hint);
    const child = spawn(resolved.argv[0] ?? '', resolved.argv.slice(1), {
        cwd: resolved.cwd,
        env: resolved.env,
        stdio: 'inherit',
    });
    const exit = new Promise<number>((resolve) => {
        child.once('exit', resolve);
    });
    // The SAME handler object is registered and removed (signal handlers
    // receive the signal name as their argument, so `relay` doubles as the
    // handler).
    const relay = (signal: NodeJS.Signals): void => {
        child.kill(signal);
    };
    for (const signal of ['SIGINT', 'SIGTERM'] as NodeJS.Signals[]) {
        process.on(signal, relay);
    }
    try {
        return await exit;
    } finally {
        for (const signal of ['SIGINT', 'SIGTERM'] as NodeJS.Signals[]) {
            process.off(signal, relay);
        }
    }
}

/**
 * Runs a raw workspace command (the `pnpm exec nx` bridge) once.
 *
 * @param extraArgv - The argv after `pnpm` (e.g. `['exec', 'nx', 'g', '...']`).
 * @param cwd - Directory the command runs in (workspace resolution
 *   happens there; defaults to the CLI's working directory).
 * @returns The child's exit code.
 */
export async function runWorkspaceOnce(extraArgv: string[], cwd?: string): Promise<number> {
    const child = spawn('pnpm', extraArgv, { stdio: 'inherit', cwd });
    const exit = new Promise<number>((resolve) => {
        child.once('exit', resolve);
    });
    const relay = (signal: NodeJS.Signals): void => {
        child.kill(signal);
    };
    for (const signal of ['SIGINT', 'SIGTERM'] as NodeJS.Signals[]) {
        process.on(signal, relay);
    }
    try {
        return await exit;
    } finally {
        for (const signal of ['SIGINT', 'SIGTERM'] as NodeJS.Signals[]) {
            process.off(signal, relay);
        }
    }
}
