/**
 * `blue doctor` — environment and framework self-diagnostics (the
 * `nest info` / `artisan about` precedent, AD-75 D-2): the CLI version,
 * Node and pnpm versions, the workspace root, and the git revision —
 * the canonical starting point for issue reports.
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command } from '@oclif/core';
import { flush } from '@oclif/core';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The framework Node baseline (matches `@oclif/core` v5 and the repo's
 * `engines`): versions below it are reported as a doctor failure.
 */
const MIN_NODE_MAJOR = 22;

/** Captured command output, with spawn failures told apart from empty output. */
interface CaptureResult {
    /** The trimmed first stdout line, or `''` when the command produced none. */
    value: string;
    /** Whether the command could not be spawned (missing binary etc.). */
    missing: boolean;
}

/**
 * Captures a command's first stdout line.
 *
 * @param argv - The command.
 * @returns The trimmed first stdout line; `missing: true` when the binary
 *   is not on PATH (AD75-H2: 'n/a' would silently hide a broken setup).
 */
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
        const child = spawned; // permanently non-null from here
        const chunks: string[] = [];
        const stdout = child.stdout;
        if (stdout !== null) {
            void (async () => {
                for await (const chunk of stdout) {
                    chunks.push(String(chunk));
                }
            })().catch(() => undefined);
        }
        child.once('exit', () => {
            resolve({ value: chunks.join('').trim().split('\n')[0] ?? '', missing: false });
        });
    });
}

/**
 * The CLI's own version, read from the package manifest (mirrors `lib/`
 * and `src/` layout depths, so the same relative path resolves in both).
 *
 * @returns The version string.
 */
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

/**
 * The workspace root: the nearest ancestor directory containing a
 * `pnpm-workspace.yaml` (walking up from the working directory). `pnpm
 * root` cannot be used — it answers the *node_modules* directory, which is
 * useless to a reporter (AD75-H1).
 *
 * @returns The workspace root, or `undefined` when not inside a workspace.
 */
function workspaceRoot(): string | undefined {
    let current = process.cwd();
    for (;;) {
        if (existsSync(join(current, 'pnpm-workspace.yaml'))) {
            return current;
        }
        const parent = dirname(current);
        if (parent === current) {
            return undefined;
        }
        current = parent;
    }
}

/**
 * The environment and framework diagnostics command.
 */
export class DoctorCommand extends Command {
    static summary = 'Prints the framework-environment diagnostics (issue-report starter)';
    static description = `Prints the CLI, Node, and pnpm versions, the workspace root
(by walking up to a pnpm-workspace.yaml), and the git revision
at the working directory — the canonical first attachment for issue
reports (the nest info / artisan about precedent). Exits 1 when a
diagnostic fails (an unsupported Node, a missing pnpm, or no workspace).`;

    async run(): Promise<void> {
        // Real checks, not a version dump (AD75-H1): each row carries a
        // verdict, and the command exits non-zero when any check fails.
        const failures: string[] = [];
        const check = (ok: boolean, message: string): void => {
            if (!ok) {
                failures.push(message);
            }
        };

        const rows: string[] = [];
        rows.push(`blue ${cliVersion()}`);
        rows.push(`node ${process.version}`);

        const majorMatch = /^v(\d+)\./.exec(process.version);
        const nodeMajor = majorMatch === null ? 0 : Number(majorMatch[1]);
        check(nodeMajor >= MIN_NODE_MAJOR, `node ${process.version} — require >= v${MIN_NODE_MAJOR}`);

        const pnpm = await capture(['pnpm', '--version']);
        check(!pnpm.missing, 'pnpm is not on PATH — install pnpm (the workspace package manager)');
        rows.push(`pnpm ${pnpm.missing ? 'n/a (not found)' : pnpm.value}`);

        const root = workspaceRoot();
        check(root !== undefined, 'not inside a BlueJS workspace — no pnpm-workspace.yaml above the cwd');
        rows.push(`workspace ${root ?? 'n/a (not found)'}`);

        const git = await capture(['git', 'rev-parse', '--short', 'HEAD']);
        check(!git.missing, 'git is not on PATH');
        rows.push(`git ${git.missing ? 'n/a (not found)' : git.value}`);
        rows.push(`cwd ${process.cwd()}`);

        for (const row of rows) {
            // oclif's own output seam (`ux.stdout`) — the report is the
            // command's product, not a log record; no raw console use.
            this.log(row);
        }
        for (const failure of failures) {
            this.log(`✗ ${failure}`);
        }
        if (failures.length > 0) {
            process.exitCode = 1;
        }
        await flush();
    }
}
