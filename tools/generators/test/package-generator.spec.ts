/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';
import packageGenerator from '../src/generators/package/generator';
import * as path from 'node:path';
import * as fs from 'node:fs';

const conditionalBlockPattern = /<% if \(([^)]+)\) { %>([\s\S]*?)<% } %>/g;
const interpolationPattern = /<%=\s*([\s\S]+?)\s*%>/g;

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

describe('package generator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
        // Add a minimal vitest.aliases.ts so the generator can extend the
        // shared `ndigoAliases` table (HI-6 moved aliases out of vitest.config.ts).
        tree.write(
            'vitest.aliases.ts',
            `import { resolve } from 'node:path';

const repoRoot = resolve('.');

export const ndigoAliases: { find: RegExp; replacement: string }[] = [
    { find: /^@ndigo\\/core$/, replacement: resolve(repoRoot, 'packages/ndigo-core/src') },
];
`
        );
    });

    it('should generate the package skeleton', async () => {
        await packageGenerator(tree, { name: 'test-pkg' });

        expect(tree.exists('packages/ndigo-test-pkg/package.json')).toBe(true);
        expect(tree.exists('packages/ndigo-test-pkg/tsconfig.json')).toBe(true);
        expect(tree.exists('packages/ndigo-test-pkg/tsconfig.build.json')).toBe(true);
        expect(tree.exists('packages/ndigo-test-pkg/src/index.ts')).toBe(true);
    });

    it('should set correct package name', async () => {
        await packageGenerator(tree, { name: 'my-feature' });

        const packageJsonContent = tree.read('packages/ndigo-my-feature/package.json', 'utf-8');
        if (packageJsonContent === null) {
            throw new Error('expected generated package.json to exist');
        }
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.name).toBe('@ndigo/my-feature');
        expect(packageJson.type).toBe('module');
        // Manifest-gate rule 6: `exports["."]` must carry `types` + `default`.
        expect(packageJson.exports).toEqual({
            '.': {
                types: './lib/index.d.ts',
                default: './lib/index.js',
            },
        });
        expect(packageJson.sideEffects).toBe(false);
    });

    it('stays dependency-free by default (no jobs wiring)', async () => {
        await packageGenerator(tree, { name: 'plain-pkg' });

        const packageJsonContent = tree.read('packages/ndigo-plain-pkg/package.json', 'utf-8');
        if (packageJsonContent === null) {
            throw new Error('expected generated package.json to exist');
        }
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.dependencies).toEqual({});
    });

    it('wires @ndigo/jobs when the jobs option is set', async () => {
        await packageGenerator(tree, { name: 'jobber', jobs: true });

        const packageJsonContent = tree.read('packages/ndigo-jobber/package.json', 'utf-8');
        if (packageJsonContent === null) {
            throw new Error('expected generated package.json to exist');
        }
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.dependencies).toEqual({ '@ndigo/jobs': '~0.0.1' });
    });

    it('should generate a manifest that satisfies the docs-standard rules', async () => {
        // Short name on purpose: the description fallback must clear the gate's
        // 25-char minimum, not just avoid the "Ndigo <Name>" placeholder.
        await packageGenerator(tree, { name: 'tiny' });

        const packageJsonContent = tree.read('packages/ndigo-tiny/package.json', 'utf-8');
        if (packageJsonContent === null) {
            throw new Error('expected generated package.json to exist');
        }
        const packageJson = JSON.parse(packageJsonContent);
        // Manifest gate (`scripts/check-manifests.mjs`): non-empty keywords array.
        expect(Array.isArray(packageJson.keywords)).toBe(true);
        expect(packageJson.keywords.length).toBeGreaterThan(0);
        expect(packageJson.keywords).toContain('ndigo');
        // Manifest gate: description >= 25 chars and not `Ndigo <Name>`.
        expect(packageJson.description.length).toBeGreaterThanOrEqual(25);
        expect(packageJson.description).not.toMatch(/^ndigo\s+\w+$/i);
        // Manifest gate: `files` must include api + lib.
        expect(packageJson.files).toEqual(expect.arrayContaining(['api', 'lib']));
    });

    it('should use custom description when provided', async () => {
        await packageGenerator(tree, { name: 'auth', description: 'Authentication utilities' });

        const packageJsonContent = tree.read('packages/ndigo-auth/package.json', 'utf-8');
        if (packageJsonContent === null) {
            throw new Error('expected generated package.json to exist');
        }
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.description).toBe('Authentication utilities');
    });

    it('should generate index.ts with module doc, no author header', async () => {
        await packageGenerator(tree, { name: 'test-pkg' });

        const indexContent = tree.read('packages/ndigo-test-pkg/src/index.ts', 'utf-8');
        if (indexContent === null) {
            throw new Error('expected generated index.ts to exist');
        }
        expect(indexContent).toContain('@author Jeff Rose');
        expect(indexContent).toContain('@since 1.0.0');
        expect(indexContent).toContain('@author Jeff Rose');
        expect(indexContent).not.toContain('TODO');
    });

    it('should generate correct tsconfig.build.json', async () => {
        await packageGenerator(tree, { name: 'test-pkg' });

        const tsconfigContent = tree.read('packages/ndigo-test-pkg/tsconfig.build.json', 'utf-8');
        if (tsconfigContent === null) {
            throw new Error('expected generated tsconfig.build.json to exist');
        }
        const tsconfig = JSON.parse(tsconfigContent);
        expect(tsconfig.extends).toBe('../../tsconfig.build.json');
        expect(tsconfig.compilerOptions.composite).toBe(true);
        expect(tsconfig.compilerOptions.outDir).toBe('./lib');
        expect(tsconfig.compilerOptions.rootDir).toBe('./src');
    });

    it('should update vitest.aliases.ts with new alias', async () => {
        await packageGenerator(tree, { name: 'test-pkg' });

        const aliases = tree.read('vitest.aliases.ts', 'utf-8');
        if (aliases === null) {
            throw new Error('expected vitest.aliases.ts to exist');
        }
        // Regression (TOL-F3): build the emitted `find` regex and assert it
        // actually matches the import specifier. The previous escaping doubled
        // the backslash (`\\-`), so the regex required a literal `\` before
        // `pkg` and never matched `@ndigo/test-pkg`.
        const aliasSources = [...aliases.matchAll(/find:\s*\/(.*?)\/,\s*replacement/g)].map((match) => match[1]);
        const generated = aliasSources.filter((source) => source.includes('test-pkg'));
        expect(generated).toHaveLength(1);
        const [aliasSource] = generated;
        if (aliasSource === undefined) {
            throw new Error(`expected a generated @ndigo/test-pkg alias, got: ${aliasSources.join(', ')}`);
        }
        const aliasPattern = new RegExp(aliasSource);
        expect(aliasPattern.test('@ndigo/test-pkg')).toBe(true);
        // Anchored: the alias must not swallow sibling packages.
        expect(aliasPattern.test('@ndigo/test-pkg-extra')).toBe(false);
        expect(aliases).toContain('ndigo-test-pkg/src');
    });

    it('should reject non-kebab-case names', async () => {
        await expect(packageGenerator(tree, { name: 'MyPackage' })).rejects.toThrow('kebab-case');
    });

    it('should reject names starting with numbers', async () => {
        await expect(packageGenerator(tree, { name: '123-bad' })).rejects.toThrow('kebab-case');
    });
});
