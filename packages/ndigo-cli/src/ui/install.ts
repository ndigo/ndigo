/**
 * Plans and applies registry installs: dependency-ordered items, target
 * mapping, conflict checks, `ui.lock.json`, and npm dependency installation.
 */
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, normalize, relative } from 'node:path';
import { usageError } from '../helpers/app-scripts.js';
import { UI_LOCK_FILE, resolveTargetPath } from './config.js';
import type { UiAliases } from './config.js';
import { isRemoteSource, readRegistryFile, resolveItemClosure } from './registry.js';
import type { LoadedRegistry } from './registry-types.js';

/**
 * Package managers the installer can drive.
 */
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

/**
 * One item in an install plan.
 */
export interface InstallPlanItem {
    /** Item name. */
    readonly name: string;
    /** Registry item type. */
    readonly type: string;
}

/**
 * One file in an install plan.
 */
export interface InstallPlanFile {
    /** Item that declared the file. */
    readonly item: string;
    /** Application-relative target path. */
    readonly target: string;
    /** File body. */
    readonly content: string;
    /** SHA-256 of the body, recorded in the lockfile. */
    readonly sha256: string;
}

/**
 * A resolved install plan, before any filesystem changes.
 */
export interface InstallPlan {
    /** Root registry source. */
    readonly source: string;
    /** Items in dependency-first order. */
    readonly items: readonly InstallPlanItem[];
    /** Files to write, sorted by target. */
    readonly files: readonly InstallPlanFile[];
    /** npm dependencies required by the items. */
    readonly dependencies: readonly string[];
}

/**
 * Options for applying an install plan.
 */
export interface InstallOptions {
    /** Application directory. */
    readonly dir: string;
    /** Report actions without writing files, the lockfile, or dependencies. */
    readonly dryRun?: boolean;
    /** Replace files that differ from the registry content. */
    readonly overwrite?: boolean;
    /** Install npm dependencies (default true). */
    readonly install?: boolean;
    /**
     * Where the package manager's stdout/stderr go (default `inherit`).
     * MCP servers must use `stderr`: stdout carries the JSON-RPC protocol.
     */
    readonly dependencyStdio?: 'inherit' | 'stderr';
}

/**
 * Result of applying an install plan.
 */
export interface InstallResult {
    /** Files written (or that would be written in a dry run). */
    readonly written: readonly string[];
    /** Files that already matched the registry content. */
    readonly unchanged: readonly string[];
    /** Npm dependencies required by the installed items. */
    readonly dependencies: readonly string[];
    /** The lockfile path. */
    readonly lockPath: string;
}

/**
 * Lockfile entry for one installed item.
 */
export interface UiLockEntry {
    /** Root registry source. */
    readonly registry: string;
    /** Registry item type. */
    readonly type: string;
    /** Installed files and their content hashes. */
    readonly files: readonly { readonly target: string; readonly sha256: string }[];
    /** Installation timestamp (ISO 8601). */
    readonly installedAt: string;
}

/**
 * Contents of `ui.lock.json`.
 */
export interface UiLockFile {
    /** Lockfile format version. */
    readonly version: 1;
    /** Installed items keyed by name. */
    readonly items: Record<string, UiLockEntry>;
}

/**
 * Resolves the requested items and their registry dependencies, reads every
 * file body, and maps targets to application paths.
 * @param registry - Loaded registry.
 * @param names - Requested item names.
 * @param aliases - Alias table.
 * @returns The install plan.
 */
export async function planInstall(
    registry: LoadedRegistry,
    names: readonly string[],
    aliases: UiAliases
): Promise<InstallPlan> {
    const closure = resolveItemClosure(registry, names);
    const files = new Map<string, InstallPlanFile>();
    const dependencies = new Set<string>();

    for (const item of closure) {
        for (const dependency of item.dependencies ?? []) dependencies.add(dependency);
        for (const file of item.files ?? []) {
            if (file.target === undefined) {
                throw usageError(`item '${item.name}' file '${file.path}' has no target`);
            }
            const target = resolveTargetPath(file.target, aliases);
            const normalizedTarget = normalize(target);
            if (isAbsolute(normalizedTarget) || normalizedTarget.startsWith('..')) {
                throw usageError(`refusing target outside the application: ${target}`);
            }
            // oxlint-disable-next-line no-await-in-loop -- reads stay sequential to bound remote fetches and keep error order deterministic
            const content = await readRegistryFile(item, file);
            const sha256 = createHash('sha256').update(content).digest('hex');
            const existing = files.get(target);
            if (existing !== undefined && existing.content !== content) {
                throw usageError(`two registry files target '${target}' with different content`);
            }
            if (existing === undefined) files.set(target, { item: item.name, target, content, sha256 });
        }
    }

    return {
        source: registry.source,
        items: closure.map((item) => ({ name: item.name, type: item.type })),
        files: [...files.values()].sort((left, right) => left.target.localeCompare(right.target)),
        dependencies: [...dependencies].sort((left, right) => left.localeCompare(right)),
    };
}

/**
 * Applies an install plan: writes files (refusing silent overwrites), updates
 * the lockfile, and installs dependencies unless disabled or dry-run.
 * @param plan - Resolved install plan.
 * @param options - Application directory and behavior flags.
 * @returns The written/unchanged files and dependencies.
 */
export async function applyInstall(plan: InstallPlan, options: InstallOptions): Promise<InstallResult> {
    const { dir, dryRun = false, overwrite = false, install = true, dependencyStdio = 'inherit' } = options;
    const written: string[] = [];
    const unchanged: string[] = [];

    for (const file of plan.files) {
        const absolute = join(dir, file.target);
        const existing = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null;
        if (existing === file.content) {
            unchanged.push(file.target);
            continue;
        }
        if (existing !== null && !overwrite) {
            throw usageError(`refusing to overwrite ${file.target} (use --overwrite)`);
        }
        if (!dryRun) {
            mkdirSync(dirname(absolute), { recursive: true });
            writeFileSync(absolute, file.content);
        }
        written.push(file.target);
    }

    if (!dryRun) {
        writeLockFile(dir, plan);
        if (install && plan.dependencies.length > 0) await installDependencies(dir, plan.dependencies, dependencyStdio);
    }

    return { written, unchanged, dependencies: plan.dependencies, lockPath: join(dir, UI_LOCK_FILE) };
}

/**
 * Detects the package manager from the application lockfile.
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

function writeLockFile(dir: string, plan: InstallPlan): void {
    const path = join(dir, UI_LOCK_FILE);
    const lock = readLockFile(path);
    const installedAt = new Date().toISOString();
    for (const item of plan.items) {
        const itemFiles = plan.files
            .filter((file) => file.item === item.name)
            .map((file) => ({ target: file.target, sha256: file.sha256 }));
        lock.items[item.name] = {
            registry: portableSource(plan.source, dir),
            type: item.type,
            files: itemFiles,
            installedAt,
        };
    }
    writeFileSync(path, `${JSON.stringify(lock, null, 2)}\n`);
}

/** Local sources are stored relative to the app so the lockfile is portable. */
function portableSource(source: string, dir: string): string {
    return isRemoteSource(source) ? source : relative(dir, source);
}

function readLockFile(path: string): UiLockFile {
    if (!existsSync(path)) return { version: 1, items: {} };
    try {
        const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<UiLockFile>;
        if (parsed.version !== 1 || parsed.items === undefined || parsed.items === null) {
            throw new Error('unsupported lockfile');
        }
        return { version: 1, items: parsed.items };
    } catch {
        throw usageError(`invalid lockfile: ${path}`);
    }
}

async function installDependencies(
    dir: string,
    dependencies: readonly string[],
    dependencyStdio: 'inherit' | 'stderr'
): Promise<void> {
    const manager = detectPackageManager(dir);
    const args = manager === 'npm' ? ['install', ...dependencies] : ['add', ...dependencies];
    // fd 2 is the parent's stderr: an MCP server's stdout is the protocol channel.
    const child: ChildProcess =
        dependencyStdio === 'stderr'
            ? spawn(manager, args, { cwd: dir, stdio: ['ignore', 2, 2] })
            : spawn(manager, args, { cwd: dir, stdio: 'inherit' });
    await new Promise<void>((resolvePromise, rejectPromise) => {
        child.once('error', (error) => {
            rejectPromise(usageError(`cannot run ${manager}: ${error.message}`));
        });
        child.once('exit', (code) => {
            if (code === 0) resolvePromise();
            else rejectPromise(usageError(`${manager} ${args[0]} failed (exit ${String(code)})`));
        });
    });
}
