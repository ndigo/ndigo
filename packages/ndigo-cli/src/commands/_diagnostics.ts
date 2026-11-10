/**
 * Shared diagnostics routine used by `doctor`, `info`, and the MCP
 * `run_doctor` tool.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MIN_NODE_MAJOR = 24;

/** The collected diagnostics, before any rendering. */
export interface DiagnosticsReport {
    /** One printable row per checked fact. */
    readonly rows: readonly string[];
    /** One message per failed check. */
    readonly failures: readonly string[];
}

interface CaptureResult {
    value: string;
    missing: boolean;
}

function capture(argv: string[], cwd?: string): Promise<CaptureResult> {
    return new Promise<CaptureResult>((resolve) => {
        const child = spawn(argv[0] ?? '', argv.slice(1), { stdio: 'pipe', cwd });
        const chunks: string[] = [];
        const stdout = child.stdout;
        if (stdout !== null) {
            void (async () => {
                for await (const chunk of stdout) chunks.push(String(chunk));
            })().catch(() => undefined);
        }
        let settled = false;
        const settle = (result: CaptureResult): void => {
            if (settled) return;
            settled = true;
            resolve(result);
        };
        child.once('exit', () => settle({ value: chunks.join('').trim().split('\n')[0] ?? '', missing: false }));
        // Node emits 'error' asynchronously when the program cannot be
        // spawned (ENOENT) and does not guarantee a matching 'exit', so the
        // constructor try/catch previously wrapped the one case it could
        // not catch (issue #144): a missing `pnpm` reported a lying healthy
        // row instead of the diagnostic this check exists to print.
        child.once('error', () => settle({ value: '', missing: true }));
    });
}

function cliVersion(): string {
    try {
        const manifest = JSON.parse(
            readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'package.json'), 'utf8')
        ) as { version?: unknown };
        return typeof manifest.version === 'string' ? manifest.version : 'n/a';
    } catch {
        return 'n/a';
    }
}

function workspaceRoot(from: string): string | undefined {
    let current = from;
    for (;;) {
        if (existsSync(join(current, 'pnpm-workspace.yaml'))) return current;
        const parent = dirname(current);
        if (parent === current) return undefined;
        current = parent;
    }
}

/**
 * Collects the environment and workspace diagnostics without printing them.
 *
 * @param cwd - The directory the checks describe (defaults to the process
 *   working directory).
 * @returns The printable rows and any failures.
 */
export async function collectDiagnostics(cwd = process.cwd()): Promise<DiagnosticsReport> {
    const failures: string[] = [];
    const check = (ok: boolean, message: string): void => {
        if (!ok) failures.push(message);
    };
    const rows: string[] = [];
    rows.push(`ndigo ${cliVersion()}`);
    rows.push(`node ${process.version}`);
    const majorMatch = /^v(\d+)\./.exec(process.version);
    const nodeMajor = majorMatch === null ? 0 : Number(majorMatch[1]);
    check(nodeMajor >= MIN_NODE_MAJOR, `node ${process.version} — require >= v${MIN_NODE_MAJOR}`);
    const pnpm = await capture(['pnpm', '--version'], cwd);
    check(!pnpm.missing, 'pnpm is not on PATH — install pnpm (the workspace package manager)');
    rows.push(`pnpm ${pnpm.missing ? 'n/a (not found)' : pnpm.value}`);
    const root = workspaceRoot(cwd);
    check(root !== undefined, 'not inside a Ndigo workspace — no pnpm-workspace.yaml above the cwd');
    rows.push(`workspace ${root ?? 'n/a (not found)'}`);
    const git = await capture(['git', 'rev-parse', '--short', 'HEAD'], cwd);
    check(!git.missing, 'git is not on PATH');
    rows.push(`git ${git.missing ? 'n/a (not found)' : git.value}`);
    rows.push(`cwd ${cwd}`);
    return { rows, failures };
}

/**
 * Prints the diagnostics report and reports whether every check passed.
 *
 * @returns `0` when all checks pass, `1` otherwise.
 */
export async function runDiagnostics(): Promise<number> {
    const { rows, failures } = await collectDiagnostics();
    for (const row of rows) process.stdout.write(`${row}\n`);
    for (const failure of failures) process.stdout.write(`✗ ${failure}\n`);
    return failures.length > 0 ? 1 : 0;
}
