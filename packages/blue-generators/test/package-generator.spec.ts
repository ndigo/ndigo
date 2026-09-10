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
        // Add a minimal vitest.config.ts so the generator can update it
        tree.write(
            'vitest.config.ts',
            `import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: [
            { find: /^@blue\\/core$/, replacement: resolve(__dirname, './packages/blue-core/src') },
        ],
    },
});`
        );
    });

    it('should generate the package skeleton', async () => {
        await packageGenerator(tree, { name: 'test-pkg' });

        expect(tree.exists('packages/blue-test-pkg/package.json')).toBe(true);
        expect(tree.exists('packages/blue-test-pkg/tsconfig.json')).toBe(true);
        expect(tree.exists('packages/blue-test-pkg/tsconfig.build.json')).toBe(true);
        expect(tree.exists('packages/blue-test-pkg/src/index.ts')).toBe(true);
    });

    it('should set correct package name', async () => {
        await packageGenerator(tree, { name: 'my-feature' });

        const packageJsonContent = tree.read('packages/blue-my-feature/package.json', 'utf-8');
        if (packageJsonContent === null) {
            throw new Error('expected generated package.json to exist');
        }
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.name).toBe('@blue/my-feature');
        expect(packageJson.type).toBe('module');
        expect(packageJson.exports).toBe('./lib/index.js');
        expect(packageJson.sideEffects).toBe(false);
    });

    it('should use custom description when provided', async () => {
        await packageGenerator(tree, { name: 'auth', description: 'Authentication utilities' });

        const packageJsonContent = tree.read('packages/blue-auth/package.json', 'utf-8');
        if (packageJsonContent === null) {
            throw new Error('expected generated package.json to exist');
        }
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.description).toBe('Authentication utilities');
    });

    it('should generate index.ts with module doc, no author header', async () => {
        await packageGenerator(tree, { name: 'test-pkg' });

        const indexContent = tree.read('packages/blue-test-pkg/src/index.ts', 'utf-8');
        if (indexContent === null) {
            throw new Error('expected generated index.ts to exist');
        }
        expect(indexContent).toContain('@module test-pkg');
        expect(indexContent).not.toContain('@author');
    });

    it('should generate correct tsconfig.build.json', async () => {
        await packageGenerator(tree, { name: 'test-pkg' });

        const tsconfigContent = tree.read('packages/blue-test-pkg/tsconfig.build.json', 'utf-8');
        if (tsconfigContent === null) {
            throw new Error('expected generated tsconfig.build.json to exist');
        }
        const tsconfig = JSON.parse(tsconfigContent);
        expect(tsconfig.extends).toBe('../../tsconfig.build.json');
        expect(tsconfig.compilerOptions.composite).toBe(true);
        expect(tsconfig.compilerOptions.outDir).toBe('./lib');
        expect(tsconfig.compilerOptions.rootDir).toBe('./src');
    });

    it('should update vitest.config.ts with new alias', async () => {
        await packageGenerator(tree, { name: 'test-pkg' });

        const vitestConfig = tree.read('vitest.config.ts', 'utf-8');
        if (vitestConfig === null) {
            throw new Error('expected vitest.config.ts to exist');
        }
        expect(vitestConfig).toContain('@blue\\/test\\\\-pkg');
        expect(vitestConfig).toContain('blue-test-pkg/src');
    });

    it('should reject non-kebab-case names', async () => {
        await expect(packageGenerator(tree, { name: 'MyPackage' })).rejects.toThrow('kebab-case');
    });

    it('should reject names starting with numbers', async () => {
        await expect(packageGenerator(tree, { name: '123-bad' })).rejects.toThrow('kebab-case');
    });
});
