import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';
import componentGenerator from '../src/generators/component/generator';
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

describe('component generator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
        // Create a minimal target package
        tree.write('packages/ndigo-core/package.json', JSON.stringify({ name: '@ndigo/core' }));
    });

    it('should generate source and test files', async () => {
        await componentGenerator(tree, { name: 'my-service', package: 'core' });

        expect(tree.exists('packages/ndigo-core/src/my-service.ts')).toBe(true);
        expect(tree.exists('packages/ndigo-core/test/my-service.spec.ts')).toBe(true);
    });

    it('should use PascalCase class name', async () => {
        await componentGenerator(tree, { name: 'data-transformer', package: 'core' });

        const sourceContent = tree.read('packages/ndigo-core/src/data-transformer.ts', 'utf-8');
        if (sourceContent === null) {
            throw new Error('expected generated data-transformer.ts to exist');
        }
        expect(sourceContent).toContain('class DataTransformer');
        expect(sourceContent).toContain("return 'DataTransformer'");
    });

    it('should include Symbol.toStringTag getter', async () => {
        await componentGenerator(tree, { name: 'my-service', package: 'core' });

        const sourceContent = tree.read('packages/ndigo-core/src/my-service.ts', 'utf-8');
        if (sourceContent === null) {
            throw new Error('expected generated my-service.ts to exist');
        }
        expect(sourceContent).toContain('get [Symbol.toStringTag]()');
    });

    it('should include a TSDoc description block, no author header', async () => {
        await componentGenerator(tree, { name: 'my-service', package: 'core' });

        const sourceContent = tree.read('packages/ndigo-core/src/my-service.ts', 'utf-8');
        if (sourceContent === null) {
            throw new Error('expected generated my-service.ts to exist');
        }
        expect(sourceContent).not.toContain('@author Jeff Rose');
        expect(sourceContent).not.toContain('@since 1.0.0');
        expect(sourceContent).not.toContain('@author Jeff Rose');
        expect(sourceContent).not.toContain('TODO');
    });

    it('should generate test with correct import', async () => {
        await componentGenerator(tree, { name: 'my-service', package: 'core' });

        const testContent = tree.read('packages/ndigo-core/test/my-service.spec.ts', 'utf-8');
        if (testContent === null) {
            throw new Error('expected generated my-service.spec.ts to exist');
        }
        expect(testContent).toContain("from '@ndigo/core'");
        expect(testContent).toContain('MyService');
    });

    it('should allow custom class name', async () => {
        await componentGenerator(tree, { name: 'util', package: 'core', className: 'CoreUtility' });

        const sourceContent = tree.read('packages/ndigo-core/src/util.ts', 'utf-8');
        if (sourceContent === null) {
            throw new Error('expected generated util.ts to exist');
        }
        expect(sourceContent).toContain('class CoreUtility');
    });

    it('should reject non-existent package', async () => {
        await expect(componentGenerator(tree, { name: 'foo', package: 'nonexistent' })).rejects.toThrow(
            'Package not found'
        );
    });
});
