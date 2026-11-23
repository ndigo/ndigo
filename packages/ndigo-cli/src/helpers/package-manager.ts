/**
 * Package-manager detection and dependency installation for app-local
 * writes (`ndigo ui add`, `ndigo add`). Kept out of either installer so both
 * drive the application's own manager the same way.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Package managers the CLI can drive.
 *
 * @example
 * ```ts
 * type _Alias = PackageManager;
 * ```
 */
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

/**
 * Detects the package manager from the application lockfile.
 *
 * @example
 * ```ts
 * detectPackageManager('/app'); // 'pnpm' when pnpm-lock.yaml exists
 * ```
 *
 * @param dir - Application directory.
 * @returns The package manager (defaults to npm).
 */
export function detectPackageManager(dir: string): PackageManager {
    if (existsSync(join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
    if (existsSync(join(dir, 'yarn.lock'))) return 'yarn';
    if (existsSync(join(dir, 'bun.lock')) || existsSync(join(dir, 'bun.lockb'))) return 'bun';
    if (existsSync(join(dir, 'package-lock.json'))) return 'npm';
    return 'npm';
}

/**
 * Adds packages with the application's package manager.
 *
 * Rejects with the manager's failure; call sites decide the exit-code policy.
 *
 * @example
 * ```ts
 * await addPackages('/app', ['@ndigo/mcp']);
 * ```
 *
 * @param dir - Application directory.
 * @param packages - Package specifiers to add.
 * @param stdio - Where the manager's output goes. MCP servers must pass
 * `stderr` because stdout carries the protocol.
 * @returns When the manager exits zero.
 */
export async function addPackages(
    dir: string,
    packages: readonly string[],
    stdio: 'inherit' | 'stderr' = 'inherit'
): Promise<void> {
    const manager = detectPackageManager(dir);
    const args = manager === 'npm' ? ['install', ...packages] : ['add', ...packages];
    // fd 2 is the parent's stderr: an MCP server's stdout is the protocol channel.
    const child =
        stdio === 'stderr'
            ? spawn(manager, args, { cwd: dir, stdio: ['ignore', 2, 2] })
            : spawn(manager, args, { cwd: dir, stdio: 'inherit' });
    await new Promise<void>((resolvePromise, rejectPromise) => {
        child.once('error', (error) => {
            rejectPromise(new Error(`cannot run ${manager}: ${error.message}`));
        });
        child.once('exit', (code) => {
            if (code === 0) resolvePromise();
            else rejectPromise(new Error(`${manager} ${args[0]} failed (exit ${String(code)})`));
        });
    });
}
