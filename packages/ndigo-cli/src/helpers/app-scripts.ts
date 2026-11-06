/**
 * Command-side process helpers: everything `@ndigo/cli` runs is one of the
 * application's declared scripts, executed with the AD-74 supervisor
 * lifecycle. Long-lived commands (`serve`, `dev`) use the full
 * {@link ClusterRunner} (signal relay, straggler kill, exit-code
 * propagation); one-shot commands (`generate`, `db:*`, `inspect`) use a
 * plain spawn with relay because a completing process must not respawn.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve as resolvePath } from 'node:path';
import { runCluster, type ClusterRunResult } from '@ndigo/cluster';

/**
 * The error whose command run terminates with exit code `2` (usage).
 * Rendering and exit behavior are owned by the CLI application config in
 * `index.ts` (exceptionWhileRunningCommand + determineExitCode, issue #148)
 * — creating this error must not touch `process.exitCode` directly.
 */
export function usageError(message: string): Error & { exitCode?: number } {
    const error = new Error(message) as Error & { exitCode?: number };
    error.exitCode = 2;
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
    // An embedded newline can only have entered the script as a
    // continuation line (SEC-005, issue #148): split(/\\s+/) would silently
    // glue the next line onto argv of the first binary, so fail loud.
    if (/[\r\n]/u.test(script)) {
        throw usageError(
            `"${scriptKey}" in ${join(dir, 'package.json')} spans multiple lines — ` +
                'serve runs one declared command per script; split it into separate scripts: ' +
                JSON.stringify(script)
        );
    }
    const argv = script.split(/\s+/).filter((token) => token.length > 0);
    if (argv.length === 0) {
        throw usageError(`"${scriptKey}" in ${join(dir, 'package.json')} resolves to an empty command`);
    }
    if (argv.some((token) => /[|&;<>()$`]/u.test(token))) {
        throw usageError(
            `"${scriptKey}" in ${join(dir, 'package.json')} uses shell operators — ` +
                'serve runs the script without a shell, so keep it a single command ' +
                '(e.g. "tsx src/index.ts", not "build && run"): ' +
                JSON.stringify(script)
        );
    }
    const env: Record<string, string> = {
        // The child gets the invoking environment (config knobs like
        // NDIGO_DB_URL, OTel endpoints, secret keys flow through), with the
        // app's local .bin fronting PATH for argv[0] lookup. Signals still
        // reach the real process — the shell-free property is about no
        // intermediate shell, not a sanitized environment (AD-78 recorded
        // this: `ndigo db migrate` silently dropped NDIGO_DB_URL and friends
        // when the env was stripped to PATH).
        ...process.env,
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
    // `port` is the BASE for the cluster's per-slot PORT derivation
    // (slot 0 = port, slot N = port + N), exactly as the supervisor
    // documents. Passing it as `basePort` (not a flat `env.PORT`) is what
    // lets ClusterRunner's #spawnSlot derive distinct ports per slot; a
    // flat env.PORT would give every slot the same port and they would
    // collide on it.
    return runCluster({
        size: options.cluster ?? 1,
        command: resolved.argv,
        cwd: resolved.cwd,
        env,
        basePort: options.port,
    });
}

/**
 * Spawns `argv` as an interactive subprocess (stdio inherit) and resolves
 * the child's exit code. Signal handlers are installed BEFORE the spawn
 * (AD75-H2: a signal arriving between spawn and registration would
 * otherwise lay the relay bare and orphan the child) and relay
 * SIGINT/SIGTERM into the child. An `'error'` event — which Node emits
 * asynchronously when the program cannot be spawned (ENOENT) and for which
 * `'exit'` is not guaranteed — becomes a deterministic exit 127 with a
 * readable stderr message instead of Node's unhandled `'error'` stack
 * (issue #144, verified live on `ndigo doctor`).
 *
 * @param argv - The command and its arguments (no shell is used).
 * @param options - `cwd` and `env` (omit `env` to inherit the invoking
 *   environment, matching a bare `spawn`).
 * @returns The child's exit code (`128 + signal` when killed, `127` when
 *   the program could not be spawned).
 */
export async function runInteractiveSpawn(
    argv: string[],
    options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<number> {
    let child: ChildProcess | null = null;
    const relay = (signal: NodeJS.Signals): void => {
        child?.kill(signal);
    };
    for (const signal of ['SIGINT', 'SIGTERM'] as NodeJS.Signals[]) {
        process.on(signal, relay);
    }
    try {
        child = spawn(argv[0] ?? '', argv.slice(1), {
            stdio: 'inherit',
            cwd: options.cwd,
            env: options.env,
        });
        return await new Promise<number>((resolve) => {
            child?.once('exit', (code, signal) => {
                // A signal-killed child exits without a code; shell
                // convention encodes it as 128 + signal number.
                resolve(code ?? (signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1));
            });
            child?.once('error', () => {
                process.stderr.write(`'${argv[0] ?? ''}' is not available on PATH — cannot run the command\n`);
                process.exitCode = 127;
                resolve(127);
            });
        });
    } finally {
        // The SAME handler object is registered and removed (signal handlers
        // receive the signal name as their argument, so `relay` doubles as
        // the handler).
        for (const signal of ['SIGINT', 'SIGTERM'] as NodeJS.Signals[]) {
            process.off(signal, relay);
        }
    }
}

/**
 * Runs a one-shot app script (generators, db, inspect) with signal relay
 * and exit-code propagation — deliberately NOT respawned.
 *
 * @param dir - The app directory (absolute).
 * @param scriptKey - The `scripts.<key>` to run.
 * @param hint - The missing-script hint.
 * @returns The child's exit code.
 */
export async function runAppOnce(
    dir: string,
    scriptKey: string,
    hint: string,
    extraArgv: string[] = []
): Promise<number> {
    const resolved = appScriptCommand(dir, scriptKey, hint);
    return runInteractiveSpawn([...resolved.argv, ...extraArgv], { cwd: resolved.cwd, env: resolved.env });
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
    // Signal relay and spawn-failure handling come from runInteractiveSpawn
    // (AD75-H2, issue #144).
    return runInteractiveSpawn(['pnpm', ...extraArgv], { cwd });
}
