/**
 * Registry install-lock drift guard.
 *
 * Every committed `ui.lock.json` must describe the files actually installed in
 * the app and the registry sources they came from. Without this, a registry
 * change can be hand-copied into an app while the lock keeps the old hash, and
 * the next `ndigo ui add` silently refuses (or overwrites) the wrong content.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packageRoot } from './_package-root.js';

interface RegistryFile {
    readonly path: string;
    readonly target?: string;
}

interface RegistryItem {
    readonly name: string;
    readonly files?: readonly RegistryFile[];
}

interface Registry {
    readonly include?: readonly string[];
    readonly items?: readonly RegistryItem[];
}

interface LoadedItem extends RegistryItem {
    /** Directory of the registry chunk that declared the item. */
    readonly base: string;
}

interface UiLock {
    readonly items: Record<string, { readonly files: readonly { readonly target: string; readonly sha256: string }[] }>;
}

const PACKAGE_ROOT = packageRoot('registry');
const REPO_ROOT = resolve(PACKAGE_ROOT, '..', '..');
const APPS = ['apps/20-ndigo-ui-lab', 'apps/07-ndigo-island'] as const;

function loadRegistry(path: string): LoadedItem[] {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as Registry;
    const base = dirname(path);
    const items = (parsed.items ?? []).map((item) => ({ ...item, base }));
    const included = (parsed.include ?? []).flatMap((include) => loadRegistry(resolve(base, include)));
    return [...items, ...included];
}

const REGISTRY_ITEMS = loadRegistry(join(REPO_ROOT, 'registry.json'));
const ITEMS = new Map(REGISTRY_ITEMS.map((item) => [item.name, item]));

function sha256(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
}

function registryTargets(item: LoadedItem, aliases: Record<string, string>): Map<string, string> {
    const targets = new Map<string, string>();
    for (const file of item.files ?? []) {
        if (file.target === undefined) continue;
        const match = /^@([a-z]+)\/(.*)$/u.exec(file.target);
        const target = match ? join(aliases[match[1]] ?? `@${match[1]}`, match[2]) : file.target;
        targets.set(target, join(item.base, file.path));
    }
    return targets;
}

for (const app of APPS) {
    const appDir = join(REPO_ROOT, app);
    const lockPath = join(appDir, 'ui.lock.json');
    if (!existsSync(lockPath)) continue;
    const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as UiLock;
    const config = JSON.parse(readFileSync(join(appDir, 'ndigo.ui.json'), 'utf8')) as {
        aliases?: Record<string, string>;
    };
    const aliases = {
        ui: 'src/ui',
        lib: 'src/lib',
        components: 'src/components',
        hooks: 'src/hooks',
        ...config.aliases,
    };

    describe(app, () => {
        for (const [name, entry] of Object.entries(lock.items)) {
            it(`installed ${name} matches the registry and the lock`, () => {
                const item = ITEMS.get(name);
                expect(item, `registry item ${name}`).toBeDefined();
                if (!item) throw new Error(`registry item ${name} is missing`);
                const sources = registryTargets(item, aliases);

                for (const file of entry.files) {
                    const installed = join(appDir, file.target);
                    expect(existsSync(installed), `${file.target} is installed`).toBe(true);
                    const content = readFileSync(installed);
                    expect(sha256(content), `${file.target} lock hash`).toBe(file.sha256);

                    const source = sources.get(file.target);
                    expect(source, `registry target ${file.target}`).toBeDefined();
                    expect(readFileSync(source as string), `${file.target} matches ${name}`).toEqual(content);
                }
            });
        }
    });
}
