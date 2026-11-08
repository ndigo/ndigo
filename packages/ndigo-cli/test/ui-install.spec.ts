// @vitest-environment node
/**
 * Install-plan and apply specs: target mapping, dry runs, conflicts, lockfile.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveAliases, resolveTargetPath, writeUiConfig } from '../src/ui/config.js';
import { applyInstall, detectPackageManager, planInstall } from '../src/ui/install.js';
import { loadRegistry } from '../src/ui/registry.js';
import { createRegistryFixture } from './_ui-registry-fixture.js';

let cleanup: (() => void) | undefined;

afterEach(() => {
    cleanup?.();
    cleanup = undefined;
});

async function setup() {
    const fixture = createRegistryFixture();
    cleanup = fixture.cleanup;
    const registry = await loadRegistry(fixture.registry);
    return { fixture, registry, aliases: resolveAliases(fixture.app) };
}

describe('install planning', () => {
    it('resolves items, targets, and dependencies', async () => {
        const { registry, aliases } = await setup();

        const plan = await planInstall(registry, ['dialog'], aliases);

        expect(plan.items.map((entry) => entry.name)).toEqual(['lib', 'dialog']);
        expect(plan.files.map((entry) => entry.target)).toEqual(['src/lib/base.ts', 'src/ui/dialog.ts']);
        expect(plan.dependencies).toEqual(['@zag-js/dialog@~1.47.0']);
    });

    it('rejects a target that escapes the application', async () => {
        const { fixture, aliases } = await setup();
        writeFileSync(
            join(fixture.root, 'pkg', 'registry.json'),
            JSON.stringify({
                items: [
                    {
                        name: 'evil',
                        type: 'registry:ui',
                        files: [{ path: 'files/dialog.ts', type: 'registry:ui', target: '@ui/../../../etc/passwd' }],
                    },
                ],
            })
        );
        const registry = await loadRegistry(fixture.registry);

        await expect(planInstall(registry, ['evil'], aliases)).rejects.toThrow(
            /refusing target outside the application/
        );
    });

    it('maps overridden aliases', async () => {
        const { fixture, registry } = await setup();
        writeUiConfig(fixture.app, { aliases: { ui: 'app/ui' } }, false);

        const aliases = resolveAliases(fixture.app);
        const plan = await planInstall(registry, ['dialog'], aliases);

        expect(aliases.ui).toBe('app/ui');
        expect(aliases.lib).toBe('src/lib');
        expect(plan.files.map((entry) => entry.target)).toContain('app/ui/dialog.ts');
        expect(resolveTargetPath('@ui/x.ts', aliases)).toBe('app/ui/x.ts');
        expect(() => resolveTargetPath('@unknown/x.ts', aliases)).toThrow(/unknown registry target/);
    });
});

describe('install application', () => {
    it('reports without writing in a dry run', async () => {
        const { fixture, registry, aliases } = await setup();
        const plan = await planInstall(registry, ['dialog'], aliases);

        const result = await applyInstall(plan, { dir: fixture.app, dryRun: true, install: false });

        expect(result.written).toEqual(['src/lib/base.ts', 'src/ui/dialog.ts']);
        expect(existsSync(join(fixture.app, 'src/lib/base.ts'))).toBe(false);
        expect(existsSync(join(fixture.app, 'ui.lock.json'))).toBe(false);
    });

    it('writes files, lock entries, and is idempotent', async () => {
        const { fixture, registry, aliases } = await setup();
        const plan = await planInstall(registry, ['dialog'], aliases);

        const first = await applyInstall(plan, { dir: fixture.app, install: false });

        expect(first.written).toEqual(['src/lib/base.ts', 'src/ui/dialog.ts']);
        expect(readFileSync(join(fixture.app, 'src/ui/dialog.ts'), 'utf8')).toBe('export const dialog = true;\n');
        const lock = JSON.parse(readFileSync(join(fixture.app, 'ui.lock.json'), 'utf8')) as {
            version: number;
            items: Record<string, { files: { target: string; sha256: string }[] }>;
        };
        expect(lock.version).toBe(1);
        expect(Object.keys(lock.items)).toEqual(['lib', 'dialog']);
        expect(lock.items['dialog']?.files[0]?.target).toBe('src/ui/dialog.ts');

        const second = await applyInstall(plan, { dir: fixture.app, install: false });
        expect(second.written).toEqual([]);
        expect(second.unchanged).toEqual(['src/lib/base.ts', 'src/ui/dialog.ts']);
    });

    it('refuses a conflicting file unless overwrite is set', async () => {
        const { fixture, registry, aliases } = await setup();
        const plan = await planInstall(registry, ['dialog'], aliases);
        await applyInstall(plan, { dir: fixture.app, install: false });
        const target = join(fixture.app, 'src/ui/dialog.ts');
        writeFileSync(target, '// local change\n');

        await expect(applyInstall(plan, { dir: fixture.app, install: false })).rejects.toThrow(
            /refusing to overwrite src\/ui\/dialog.ts/
        );
        const forced = await applyInstall(plan, { dir: fixture.app, install: false, overwrite: true });
        expect(forced.written).toEqual(['src/ui/dialog.ts']);
        expect(readFileSync(target, 'utf8')).toBe('export const dialog = true;\n');
    });
});

describe('configuration and package managers', () => {
    it('writes ndigo.ui.json once and force-overwrites on request', async () => {
        const { fixture } = await setup();

        const path = writeUiConfig(fixture.app, { registry: 'https://example.test/registry.json' }, false);
        expect(existsSync(path)).toBe(true);
        expect(() => writeUiConfig(fixture.app, { registry: 'other' }, false)).toThrow(/already exists/);

        writeUiConfig(fixture.app, { registry: 'other' }, true);
        const parsed = JSON.parse(readFileSync(path, 'utf8')) as { registry: string; aliases: { ui: string } };
        expect(parsed.registry).toBe('other');
        expect(parsed.aliases.ui).toBe('src/ui');
    });

    it('detects the package manager from lockfiles', async () => {
        const { fixture } = await setup();
        expect(detectPackageManager(fixture.app)).toBe('npm');

        writeFileSync(join(fixture.app, 'pnpm-lock.yaml'), '');
        expect(detectPackageManager(fixture.app)).toBe('pnpm');

        writeFileSync(join(fixture.app, 'yarn.lock'), '');
        expect(detectPackageManager(fixture.app)).toBe('pnpm');
    });
});
