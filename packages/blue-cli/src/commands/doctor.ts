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
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Captures a command's first stdout line, or `'n/a'` when it fails.
 *
 * @param argv - The command.
 * @returns The trimmed first stdout line, or `'n/a'`.
 */
function capture(argv: string[]): Promise<string> {
    return new Promise<string>((resolve) => {
        try {
            const child = spawn(argv[0] ?? '', argv.slice(1), { stdio: 'pipe' });
            const chunks: string[] = [];
            if (child.stdout !== null) {
                void (async () => {
                    for await (const chunk of child.stdout) {
                        chunks.push(String(chunk));
                    }
                })().catch(() => undefined);
            }
            child.once('exit', () => {
                resolve(chunks.join('').trim().split('\n')[0] ?? '');
            });
        } catch {
            resolve('n/a');
        }
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
 * The environment and framework diagnostics command.
 */
export class DoctorCommand extends Command {
    static summary = 'Prints the framework-environment diagnostics (issue-report starter)';
    static description = `Prints the CLI, Node, and pnpm versions, the workspace root
(detected by walking up to a pnpm-workspace.yaml), and the git revision
at the working directory — the canonical first attachment for issue
reports (the nest info / artisan about precedent).`;

    async run(): Promise<void> {
        const rows: string[] = [];
        rows.push(`blue ${cliVersion()}`);
        rows.push(`node ${process.version}`);
        rows.push(`pnpm ${await capture(['pnpm', '--version'])}`);
        const workspace = await capture(['pnpm', 'root']);
        rows.push(`workspace ${workspace === '' ? 'n/a' : workspace}`);
        rows.push(`git ${await capture(['git', 'rev-parse', '--short', 'HEAD'])}`);
        rows.push(`cwd ${process.cwd()}`);
        for (const row of rows) {
            // oclif's own output seam (`ux.stdout`) — the report is the
            // command's product, not a log record; no raw console use.
            this.log(row);
        }
        await flush();
    }
}
