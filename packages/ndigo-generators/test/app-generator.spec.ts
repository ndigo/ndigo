/**
 * App-generator spec (AD-85): the skeleton shape for both kinds, the
 * numbering/port allocation and their collision failures, and the
 * manifest properties the app gate (`scripts/check-manifests.mjs` rule 10)
 * depends on.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';
import appGenerator, { type AppKind } from '../src/generators/app/generator';
import * as path from 'node:path';
import * as fs from 'node:fs';

const conditionalBlockPattern = /<% if \(([^)]+)\) { %>([\s\S]*?)<% } %>/g;
// `<%= value %>` and `<%- value %>` (the EJS raw form used for free text).
const interpolationPattern = /<%[-=]\s*([\s\S]+?)\s*%>/g;

function evaluateExpression(expression: string, variables: Record<string, unknown>): string {
    const trimmed = expression.trim();

    if (trimmed.includes('||')) {
        const [left, right] = trimmed.split('||').map((part) => part.trim());
        const leftValue = evaluateExpression(left, variables);
        return leftValue ? leftValue : evaluateExpression(right, variables);
    }

    if (trimmed.includes('+')) {
        return trimmed
            .split('+')
            .map((part) => evaluateExpression(part, variables))
            .join('');
    }

    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        return trimmed.slice(1, -1);
    }

    const value = variables[trimmed];
    return value === undefined ? '' : String(value);
}

function renderTemplate(content: string, variables: Record<string, unknown>): string {
    const withConditionals = content.replace(conditionalBlockPattern, (_match, expression, block) => {
        const key = String(expression).trim();
        return variables[key] ? block : '';
    });

    return withConditionals.replace(interpolationPattern, (_match, expression) => {
        return evaluateExpression(String(expression), variables);
    });
}

function generateFiles(
    tree: Tree,
    sourcePath: string,
    destinationPath: string,
    variables: Record<string, unknown>
): void {
    const entries = fs.readdirSync(sourcePath, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(sourcePath, entry.name);
        const relativePath = path.relative(sourcePath, entryPath);

        if (entry.isDirectory()) {
            generateFiles(tree, entryPath, path.join(destinationPath, entry.name), variables);
            return;
        }

        if (!entry.isFile()) {
            return;
        }

        const fileContents = fs.readFileSync(entryPath, 'utf-8');
        const renderedContents = renderTemplate(fileContents, variables);
        const outputName = relativePath.replace(/\.template$/, '').replace(/__([a-zA-Z0-9_]+)__/g, (_match, key) => {
            const value = variables[key];
            return value === undefined ? key : String(value);
        });
        const outputPath = path.join(destinationPath, outputName);

        tree.write(outputPath, renderedContents);
    });
}

vi.mock('@nx/devkit', () => {
    return {
        formatFiles: vi.fn(async () => undefined),
        generateFiles: vi.fn((tree: Tree, source: string, destination: string, variables: Record<string, unknown>) => {
            generateFiles(tree, source, destination, variables);
        }),
    };
});

function read(tree: Tree, filePath: string): string {
    const content = tree.read(filePath, 'utf-8');
    if (content === null) {
        throw new Error(`expected ${filePath} to exist`);
    }
    return content;
}

describe('app generator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
        // Two sibling apps seeding the ladder: numbers 01/02 and the ports
        // 3000 (vite convention) and 3010 (Node PORT default convention).
        tree.write('apps/01-ndigo-hello/package.json', JSON.stringify({ name: '@ndigo/hello', private: true }));
        tree.write('apps/01-ndigo-hello/vite.config.ts', 'export default { server: { port: 3000 } };\n');
        tree.write(
            'apps/02-ndigo-hello-node/package.json',
            JSON.stringify({ name: '@ndigo/hello-node', private: true })
        );
        tree.write('apps/02-ndigo-hello-node/src/index.ts', "process.env['PORT'] ??= '3010';\n");
    });

    it('scaffolds the node kind at the next free number and port', async () => {
        await appGenerator(tree, { name: 'todo-widget', kind: 'node' });

        const appDir = 'apps/03-ndigo-todo-widget';
        expect(tree.exists(`${appDir}/package.json`)).toBe(true);
        expect(tree.exists(`${appDir}/tsconfig.json`)).toBe(true);
        expect(tree.exists(`${appDir}/tsconfig.build.json`)).toBe(true);
        expect(tree.exists(`${appDir}/src/index.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/src/todo-widget-configuration.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/src/todo-widget-controller.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/test/todo-widget.smoke.spec.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/README.md`)).toBe(true);

        const index = read(tree, `${appDir}/src/index.ts`);
        expect(index).toContain('port: 3020');
        expect(index).toContain('@author Jeff Rose');
        expect(read(tree, `${appDir}/src/todo-widget-configuration.ts`)).toContain('@entry()');
        expect(read(tree, `${appDir}/README.md`)).toContain('apps/03-ndigo-todo-widget');
        expect(read(tree, `${appDir}/README.md`)).toContain('3020');
    });

    it('scaffolds the browser kind with the vite surface and bundle guard', async () => {
        await appGenerator(tree, { name: 'widget', kind: 'browser' });

        const appDir = 'apps/03-ndigo-widget';
        expect(tree.exists(`${appDir}/vite.config.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/vitest.config.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/index.html`)).toBe(true);
        expect(tree.exists(`${appDir}/src/widget-context.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/src/widget-app-view.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/test/widget.smoke.spec.ts`)).toBe(true);
        expect(tree.exists(`${appDir}/test/bundle.spec.ts`)).toBe(true);

        expect(read(tree, `${appDir}/vite.config.ts`)).toContain('port: 3020');
        expect(read(tree, `${appDir}/src/widget-app-view.ts`)).toContain("customElements.define('widget-app'");
        expect(read(tree, `${appDir}/test/widget.smoke.spec.ts`)).toContain("'WIDGET-APP'");
    });

    it('scaffolds into an empty workspace at number 01 and port 3000', async () => {
        const bare = createTreeWithEmptyWorkspace();

        await appGenerator(bare, { name: 'first', kind: 'node' });

        expect(bare.exists('apps/01-ndigo-first/package.json')).toBe(true);
        expect(read(bare, 'apps/01-ndigo-first/src/index.ts')).toContain('port: 3000');
    });

    it('generates a closure-shaped private manifest for the node kind', async () => {
        await appGenerator(tree, { name: 'widget', kind: 'node' });

        const manifest = JSON.parse(read(tree, 'apps/03-ndigo-widget/package.json'));
        expect(manifest.name).toBe('@ndigo/widget');
        expect(manifest.private).toBe(true);
        expect(manifest.type).toBe('module');
        expect(manifest.scripts).toEqual({ start: 'tsx src/index.ts', test: 'vitest run' });
        expect(Object.keys(manifest.dependencies)).toEqual(
            expect.arrayContaining([
                '@ndigo/context',
                '@ndigo/dispatcher',
                '@ndigo/log',
                '@ndigo/platform-node',
                '@ndigo/util',
                '@tsmetadata/polyfill',
            ])
        );
        expect(manifest.devDependencies).toEqual({ '@ndigo/test': '~0.0.1', tsx: 'catalog:' });
        // The app gate's description fallback must clear the 25-char minimum.
        expect(manifest.description.length).toBeGreaterThanOrEqual(25);
        expect(manifest.description).not.toMatch(/^ndigo\s+\w+$/i);
    });

    it('generates the browser manifest with dev/build scripts and dist files', async () => {
        await appGenerator(tree, { name: 'widget', kind: 'browser' });

        const manifest = JSON.parse(read(tree, 'apps/03-ndigo-widget/package.json'));
        expect(manifest.private).toBe(true);
        expect(manifest.files).toEqual(['dist']);
        expect(manifest.scripts.dev).toBe('vite');
        expect(manifest.scripts.test).toBe('vite build && vitest run');
        expect(Object.keys(manifest.dependencies)).toEqual(
            expect.arrayContaining([
                '@ndigo/context',
                '@ndigo/dispatcher',
                '@ndigo/platform-web',
                '@ndigo/router',
                '@ndigo/view-webcomponent',
            ])
        );
    });

    it('uses a custom description in the manifest and README', async () => {
        await appGenerator(tree, { name: 'widget', kind: 'node', description: "Widget's node demo" });

        expect(read(tree, 'apps/03-ndigo-widget/package.json')).toContain("Widget's node demo");
        expect(read(tree, 'apps/03-ndigo-widget/README.md')).toContain("Widget's node demo");
    });

    it('honours explicit number and port', async () => {
        await appGenerator(tree, { name: 'widget', kind: 'browser', number: 7, port: 3999 });

        expect(tree.exists('apps/07-ndigo-widget/vite.config.ts')).toBe(true);
        expect(read(tree, 'apps/07-ndigo-widget/vite.config.ts')).toContain('port: 3999');
    });

    it('rejects an explicit port a sibling app already claims', async () => {
        await expect(appGenerator(tree, { name: 'widget', kind: 'node', port: 3010 })).rejects.toThrow(
            'Port 3010 is already used by apps/02-ndigo-hello-node'
        );
    });

    it('rejects a reading-order number that is already taken', async () => {
        await expect(appGenerator(tree, { name: 'widget', kind: 'node', number: 2 })).rejects.toThrow(
            'Reading-order number 02 is already used by apps/02-ndigo-hello-node'
        );
    });

    it('rejects an app directory that already exists', async () => {
        tree.write('apps/03-ndigo-widget/package.json', '{}');

        await expect(appGenerator(tree, { name: 'widget', kind: 'node', number: 3 })).rejects.toThrow(
            'App already exists: apps/03-ndigo-widget'
        );
    });

    it('rejects non-kebab names and unknown kinds', async () => {
        await expect(appGenerator(tree, { name: 'Widget', kind: 'node' })).rejects.toThrow('kebab-case');
        // Deliberate invalid input — the runtime kind guard is what is under test.
        const invalidKind = 'server' as unknown as AppKind;
        await expect(appGenerator(tree, { name: 'widget', kind: invalidKind })).rejects.toThrow(
            'App kind must be one of browser, node'
        );
    });
});
