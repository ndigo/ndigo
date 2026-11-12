// @vitest-environment node
import { afterEach, describe, expect, test, vi } from 'vitest';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scaffold } from '../src/index';

describe('create-ndigo-app scaffold', () => {
    const created: string[] = [];

    afterEach(() => {
        vi.restoreAllMocks();
        for (const dir of created.splice(0)) {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    function target(name: string): string {
        const dir = join(process.cwd(), `ndigo-scaffold-test-${name}`);
        created.push(dir);
        return dir;
    }

    test('scaffolds a node app with the preset entrypoint and a passing manifest shape', async () => {
        const targetDir = target('node');

        const code = await scaffold([targetDir, '--kind', 'node', '--name', 'scaffoldtest', '--yes']);
        expect(code).toBe(0);

        expect(existsSync(join(targetDir, 'src', 'index.ts'))).toBe(true);
        expect(existsSync(join(targetDir, 'src', 'scaffoldtest-configuration.ts'))).toBe(true);
        expect(existsSync(join(targetDir, 'src', 'scaffoldtest-controller.ts'))).toBe(true);
        expect(existsSync(join(targetDir, 'test', 'scaffoldtest.smoke.spec.ts'))).toBe(true);

        const index = await readFile(join(targetDir, 'src', 'index.ts'), 'utf8');
        expect(index).toContain('createNodeApplication');
        expect(index).toContain('port: 3000');

        const manifest = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8'));
        expect(manifest.private).toBe(true);
        expect(manifest.type).toBe('module');
        expect(manifest.dependencies).toHaveProperty('@ndigo/platform-node');
        expect(manifest.dependencies).not.toHaveProperty('@ndigo/boot');
    });

    test('scaffolds a browser app with the preset entrypoint and bundle guard', async () => {
        const targetDir = target('browser');

        const code = await scaffold([targetDir, '--kind', 'browser', '--name', 'scaffoldtest', '--yes']);
        expect(code).toBe(0);

        expect(existsSync(join(targetDir, 'src', 'index.ts'))).toBe(true);
        expect(existsSync(join(targetDir, 'src', 'scaffoldtest-configuration.ts'))).toBe(true);
        expect(existsSync(join(targetDir, 'test', 'bundle.spec.ts'))).toBe(true);
        expect(existsSync(join(targetDir, 'scripts', 'vite-plugin-lower-decorators.mjs'))).toBe(true);

        const index = await readFile(join(targetDir, 'src', 'index.ts'), 'utf8');
        expect(index).toContain('createWebApplication');
    });

    test('--local rewrites @ndigo/* deps to file: links', async () => {
        const targetDir = target('local');

        const code = await scaffold([targetDir, '--kind', 'node', '--name', 'scaffoldtest', '--yes', '--local']);
        expect(code).toBe(0);

        const manifest = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8'));
        expect(manifest.dependencies['@ndigo/platform-node']).toBe('workspace:*');
    });

    test('writes the AGENTS.md bootstrap by default', async () => {
        const targetDir = target('agents');

        const code = await scaffold([targetDir, '--kind', 'node', '--name', 'scaffoldtest', '--yes']);
        expect(code).toBe(0);

        const agents = readFileSync(join(targetDir, 'AGENTS.md'), 'utf8');
        expect(agents).toContain('ndigo ai:init');
        expect(agents).toContain('ESM only');
    });

    test('--no-agents omits the bootstrap', async () => {
        const targetDir = target('no-agents');

        const code = await scaffold([targetDir, '--kind', 'node', '--name', 'scaffoldtest', '--yes', '--no-agents']);
        expect(code).toBe(0);
        expect(existsSync(join(targetDir, 'AGENTS.md'))).toBe(false);
    });

    test('--agents writes the bootstrap explicitly', async () => {
        const targetDir = target('agents-flag');

        const code = await scaffold([targetDir, '--kind', 'node', '--name', 'scaffoldtest', '--yes', '--agents']);
        expect(code).toBe(0);
        expect(existsSync(join(targetDir, 'AGENTS.md'))).toBe(true);
    });

    test('browser --ui writes the pointer, the token stylesheet, and the dependency', async () => {
        const targetDir = target('ui');

        const code = await scaffold([targetDir, '--kind', 'browser', '--name', 'scaffoldtest', '--yes', '--ui']);
        expect(code).toBe(0);

        const config = JSON.parse(readFileSync(join(targetDir, 'ndigo.ui.json'), 'utf8'));
        expect(config.$schema).toBe('https://ndigo.dev/schema/ndigo.ui.json');
        expect(config.registry).toBe('https://ndigo.dev/r/registry.json');
        expect(config.aliases).toEqual({
            ui: 'src/ui',
            lib: 'src/lib',
            components: 'src/components',
            hooks: 'src/hooks',
        });

        const styles = readFileSync(join(targetDir, 'src', 'styles.css'), 'utf8');
        expect(styles).toContain("@import '@ndigo/ui/tokens.css';");

        const index = readFileSync(join(targetDir, 'src', 'index.ts'), 'utf8');
        expect(index).toContain("import './styles.css';");

        const manifest = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8'));
        expect(manifest.dependencies['@ndigo/ui']).toBe('~0.0.1');
    });

    test('--ui is off by default, and --yes does not imply it', async () => {
        const targetDir = target('no-ui');

        const code = await scaffold([targetDir, '--kind', 'browser', '--name', 'scaffoldtest', '--yes', '--no-ui']);
        expect(code).toBe(0);
        expect(existsSync(join(targetDir, 'ndigo.ui.json'))).toBe(false);
        expect(existsSync(join(targetDir, 'src', 'styles.css'))).toBe(false);

        const index = readFileSync(join(targetDir, 'src', 'index.ts'), 'utf8');
        expect(index).not.toContain("import './styles.css';");

        const manifest = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8'));
        expect(manifest.dependencies).not.toHaveProperty('@ndigo/ui');
    });

    test('--ui implies the browser kind when --kind is absent', async () => {
        const targetDir = target('ui-implied-browser');

        const code = await scaffold([targetDir, '--name', 'scaffoldtest', '--yes', '--ui']);
        expect(code).toBe(0);

        expect(existsSync(join(targetDir, 'vite.config.ts'))).toBe(true);
        expect(existsSync(join(targetDir, 'ndigo.ui.json'))).toBe(true);
    });

    test('--ui on an explicit node kind is a usage error', async () => {
        const targetDir = target('ui-node-error');
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        const code = await scaffold([targetDir, '--kind', 'node', '--name', 'scaffoldtest', '--yes', '--ui']);
        expect(code).toBe(2);
        expect(error.mock.calls.flat().join(' ')).toContain('--ui');
        expect(existsSync(targetDir)).toBe(false);
    });

    test('--ui --local rewrites @ndigo/ui to a workspace link', async () => {
        const targetDir = target('ui-local');

        const code = await scaffold([
            targetDir,
            '--kind',
            'browser',
            '--name',
            'scaffoldtest',
            '--yes',
            '--ui',
            '--local',
        ]);
        expect(code).toBe(0);

        const manifest = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8'));
        expect(manifest.dependencies['@ndigo/ui']).toBe('workspace:*');
    });

    test('next steps name the registry and agent commands when their pointer is missing', async () => {
        const targetDir = target('next-steps');
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        const code = await scaffold([
            targetDir,
            '--kind',
            'browser',
            '--name',
            'scaffoldtest',
            '--yes',
            '--ui',
            '--no-agents',
        ]);
        expect(code).toBe(0);

        const printed = log.mock.calls.flat().join('\n');
        expect(printed).toContain('ndigo ui add button input field');
        expect(printed).toContain('ndigo ai:init');
    });

    test('next steps omit the design-system line without --ui', async () => {
        const targetDir = target('next-steps-no-ui');
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        const code = await scaffold([targetDir, '--kind', 'browser', '--name', 'scaffoldtest', '--yes']);
        expect(code).toBe(0);

        const printed = log.mock.calls.flat().join('\n');
        expect(printed).not.toContain('ndigo ui add');
    });

    test('--ui extends the agent bootstrap with the design-system section', async () => {
        const targetDir = target('ui-agents');

        const code = await scaffold([targetDir, '--kind', 'browser', '--name', 'scaffoldtest', '--yes', '--ui']);
        expect(code).toBe(0);

        const agents = readFileSync(join(targetDir, 'AGENTS.md'), 'utf8');
        expect(agents).toContain('## Design system');
        expect(agents).toContain('ndigo ui add');
    });
});
