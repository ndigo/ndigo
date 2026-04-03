/** @author Jeff Rose */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';
import wicketComponentGenerator from '../src/generators/wicket-component/generator';
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

describe('wicket-component generator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
        tree.write('packages/blue-view-wicket/package.json', JSON.stringify({ name: '@blue/view-wicket' }));
    });

    it('should generate panel component by default', async () => {
        await wicketComponentGenerator(tree, { name: 'user-profile' });

        expect(tree.exists('packages/blue-view-wicket/src/user-profile.ts')).toBe(true);
        expect(tree.exists('packages/blue-view-wicket/test/user-profile.spec.ts')).toBe(true);
    });

    it('should extend Panel for panel type', async () => {
        await wicketComponentGenerator(tree, { name: 'user-profile', type: 'panel' });

        const sourceContent = tree.read('packages/blue-view-wicket/src/user-profile.ts', 'utf-8')!;
        expect(sourceContent).toContain('extends Panel');
        expect(sourceContent).toContain("from './panel'");
    });

    it('should extend Page for page type', async () => {
        await wicketComponentGenerator(tree, { name: 'dashboard', type: 'page' });

        const sourceContent = tree.read('packages/blue-view-wicket/src/dashboard.ts', 'utf-8')!;
        expect(sourceContent).toContain('extends Page');
        expect(sourceContent).toContain("from './page'");
    });

    it('should extend WicketComponent for component type', async () => {
        await wicketComponentGenerator(tree, { name: 'badge', type: 'component' });

        const sourceContent = tree.read('packages/blue-view-wicket/src/badge.ts', 'utf-8')!;
        expect(sourceContent).toContain('extends WicketComponent');
        expect(sourceContent).toContain("from './component'");
    });

    it('should extend WicketContainer for container type', async () => {
        await wicketComponentGenerator(tree, { name: 'card-group', type: 'container' });

        const sourceContent = tree.read('packages/blue-view-wicket/src/card-group.ts', 'utf-8')!;
        expect(sourceContent).toContain('extends WicketContainer');
        expect(sourceContent).toContain("from './container'");
    });

    it('should include onInitialize with template for container types', async () => {
        await wicketComponentGenerator(tree, { name: 'settings', type: 'panel' });

        const sourceContent = tree.read('packages/blue-view-wicket/src/settings.ts', 'utf-8')!;
        expect(sourceContent).toContain('onInitialize');
        expect(sourceContent).toContain('this.template');
    });

    it('should NOT include onInitialize for component type', async () => {
        await wicketComponentGenerator(tree, { name: 'badge', type: 'component' });

        const sourceContent = tree.read('packages/blue-view-wicket/src/badge.ts', 'utf-8')!;
        expect(sourceContent).not.toContain('onInitialize');
    });

    it('should include Symbol.toStringTag getter', async () => {
        await wicketComponentGenerator(tree, { name: 'user-profile' });

        const sourceContent = tree.read('packages/blue-view-wicket/src/user-profile.ts', 'utf-8')!;
        expect(sourceContent).toContain('get [Symbol.toStringTag]()');
        expect(sourceContent).toContain("return 'UserProfile'");
    });

    it('should include author header', async () => {
        await wicketComponentGenerator(tree, { name: 'user-profile' });

        const sourceContent = tree.read('packages/blue-view-wicket/src/user-profile.ts', 'utf-8')!;
        expect(sourceContent).toContain('@author Jeff Rose');
    });

    it('should reject when view-wicket package missing', async () => {
        tree.delete('packages/blue-view-wicket/package.json');
        await expect(wicketComponentGenerator(tree, { name: 'foo' })).rejects.toThrow('Package not found');
    });
});
