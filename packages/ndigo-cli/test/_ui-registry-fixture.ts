/**
 * Temporary registry and application fixtures for the `ui` command specs.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * A fixture with a root registry, one included chunk, two items, and an app.
 */
export interface RegistryFixture {
    /** Temporary root directory. */
    readonly root: string;
    /** Root registry path. */
    readonly registry: string;
    /** Empty application directory with a package.json. */
    readonly app: string;
    /** Removes the temporary tree. */
    cleanup(): void;
}

/**
 * Creates the fixture tree.
 * @returns Paths and a cleanup function.
 */
export function createRegistryFixture(): RegistryFixture {
    const root = mkdtempSync(join(tmpdir(), 'ndigo-ui-'));
    const app = join(root, 'app');
    mkdirSync(join(root, 'pkg', 'files'), { recursive: true });
    mkdirSync(app, { recursive: true });
    writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'ui-fixture-app', private: true }));
    writeFileSync(join(root, 'registry.json'), JSON.stringify({ name: 'fixture', include: ['pkg/registry.json'] }));
    writeFileSync(
        join(root, 'pkg', 'registry.json'),
        JSON.stringify({
            items: [
                {
                    name: 'lib',
                    type: 'registry:lib',
                    files: [{ path: 'files/base.ts', type: 'registry:lib', target: '@lib/base.ts' }],
                },
                {
                    name: 'dialog',
                    type: 'registry:ui',
                    dependencies: ['@zag-js/dialog@~1.47.0'],
                    registryDependencies: ['lib'],
                    files: [{ path: 'files/dialog.ts', type: 'registry:ui', target: '@ui/dialog.ts' }],
                },
            ],
        })
    );
    writeFileSync(join(root, 'pkg', 'files', 'base.ts'), 'export const base = true;\n');
    writeFileSync(join(root, 'pkg', 'files', 'dialog.ts'), 'export const dialog = true;\n');
    return {
        root,
        registry: join(root, 'registry.json'),
        app,
        cleanup: () => rmSync(root, { recursive: true, force: true }),
    };
}
