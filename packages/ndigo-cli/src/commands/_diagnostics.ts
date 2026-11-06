/**
 * Shared diagnostics routine used by `doctor` and `info`.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MIN_NODE_MAJOR = 24;

interface CaptureResult {
    value: string;
    missing: boolean;
}

function capture(argv: string[]): Promise<CaptureResult> {
    return new Promise<CaptureResult>((resolve) => {
        let spawned: ChildProcess | null;
        try {
            spawned = spawn(argv[0] ?? '', argv.slice(1), { stdio: 'pipe' });
        } catch {
            resolve({ value: '', missing: true });
            return;
        }
        if (spawned === null) {
            resolve({ value: '', missing: true });
            return;
        }
        const child = spawned;
        const chunks: string[] = [];
        const stdout = child.stdout;
        if (stdout !== null) {
            void (async () => {
                for await (const chunk of stdout) chunks.push(String(chunk));
            })().catch(() => undefined);
        }
        child.once('exit', () => resolve({ value: chunks.join('').trim().split('\n')[0] ?? '', missing: false }));
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

function workspaceRoot(): string | undefined {
    let current = process.cwd();
    for (;;) {
        if (existsSync(join(current, 'pnpm-workspace.yaml'))) return current;
        const parent = dirname(current);
        if (parent === current) return undefined;
        current = parent;
    }
}

export async function runDiagnostics(): Promise<number> {
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
    const pnpm = await capture(['pnpm', '--version']);
    check(!pnpm.missing, 'pnpm is not on PATH — install pnpm (the workspace package manager)');
    rows.push(`pnpm ${pnpm.missing ? 'n/a (not found)' : pnpm.value}`);
    const root = workspaceRoot();
    check(root !== undefined, 'not inside a Ndigo workspace — no pnpm-workspace.yaml above the cwd');
    rows.push(`workspace ${root ?? 'n/a (not found)'}`);
    const git = await capture(['git', 'rev-parse', '--short', 'HEAD']);
    check(!git.missing, 'git is not on PATH');
    rows.push(`git ${git.missing ? 'n/a (not found)' : git.value}`);
    rows.push(`cwd ${process.cwd()}`);
    for (const row of rows) process.stdout.write(`${row}\n`);
    for (const failure of failures) process.stdout.write(`✗ ${failure}\n`);
    return failures.length > 0 ? 1 : 0;
}
