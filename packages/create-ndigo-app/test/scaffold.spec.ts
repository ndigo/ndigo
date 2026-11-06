// @vitest-environment node
import { afterEach, describe, expect, test } from 'vitest';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scaffold } from '../src/index';

describe('create-ndigo-app scaffold', () => {
    const created: string[] = [];

    afterEach(() => {
        for (const dir of created.splice(0)) {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    test('scaffolds a node app with the preset entrypoint and a passing manifest shape', async () => {
        const target = join(tmpdir(), 'ndigo-scaffold-test-node');
        created.push(target);

        const code = await scaffold([target, '--kind', 'node', '--name', 'scaffoldtest', '--yes']);
        expect(code).toBe(0);

        expect(existsSync(join(target, 'src', 'index.ts'))).toBe(true);
        expect(existsSync(join(target, 'src', 'scaffoldtest-configuration.ts'))).toBe(true);
        expect(existsSync(join(target, 'src', 'scaffoldtest-controller.ts'))).toBe(true);
        expect(existsSync(join(target, 'test', 'scaffoldtest.smoke.spec.ts'))).toBe(true);

        const index = await readFile(join(target, 'src', 'index.ts'), 'utf8');
        expect(index).toContain('runNodeApplication');
        expect(index).toContain('port: 3000');

        const manifest = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'));
        expect(manifest.private).toBe(true);
        expect(manifest.type).toBe('module');
        expect(manifest.dependencies).toHaveProperty('@ndigo/platform-node');
        expect(manifest.dependencies).not.toHaveProperty('@ndigo/boot');
    });

    test('scaffolds a browser app with the preset entrypoint and bundle guard', async () => {
        const target = join(tmpdir(), 'ndigo-scaffold-test-browser');
        created.push(target);

        const code = await scaffold([target, '--kind', 'browser', '--name', 'scaffoldtest', '--yes']);
        expect(code).toBe(0);

        expect(existsSync(join(target, 'src', 'index.ts'))).toBe(true);
        expect(existsSync(join(target, 'src', 'scaffoldtest-configuration.ts'))).toBe(true);
        expect(existsSync(join(target, 'test', 'bundle.spec.ts'))).toBe(true);
        expect(existsSync(join(target, 'scripts', 'vite-plugin-lower-decorators.mjs'))).toBe(true);

        const index = await readFile(join(target, 'src', 'index.ts'), 'utf8');
        expect(index).toContain('createWebApplication');
    });

    test('--local rewrites @ndigo/* deps to file: links', async () => {
        const target = join(tmpdir(), 'ndigo-scaffold-test-local');
        created.push(target);

        const code = await scaffold([target, '--kind', 'node', '--name', 'scaffoldtest', '--yes', '--local']);
        expect(code).toBe(0);

        const manifest = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'));
        expect(manifest.dependencies['@ndigo/platform-node']).toBe('workspace:*');
    });
});
