/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { StaticContentSource } from '@ndigo/content';
import type { ChildNode, ParentNode } from '@ndigo/core';
import type { ApplicationContext } from '../src/context-interfaces';
import { GenericApplicationContext } from '../src/context';
import {
    createFeatureContext,
    createShellContext,
    findAncestor,
    findDescendants,
    traverseSubtree,
    traverseToRoot,
    unmountFeatureContext,
} from '../src/context-hierarchy';
import { NamespaceRelayValidationStrategy } from '../src/event-gateway';

describe('context hierarchy helpers', () => {
    test('createShellContext creates a named shell with optional configuration', () => {
        const context = createShellContext({
            name: 'site-shell',
            data: {
                appName: 'NdigoSite',
            },
            contentSource: new StaticContentSource(),
            themeName: 'night',
        });

        expect(context.name).toBe('site-shell');
        expect(context.getValue('appName')).toBe('NdigoSite');
        expect(context.themeName).toBe('night');

        context.destroy();
    });

    test('createFeatureContext creates child context without relay gateway', () => {
        const shell = new GenericApplicationContext('shell');
        const result = createFeatureContext(shell, {
            name: 'todo',
            data: {
                featureLabel: 'Todo',
            },
        });

        expect(result.context.parent).toBe(shell);
        expect(shell.hasChild(result.context)).toBe(true);
        expect(result.context.getValue('featureLabel')).toBe('Todo');
        expect(result.gateway).toBeUndefined();

        shell.destroy();
    });

    test('createFeatureContext should support custom context factory', () => {
        const shell = new GenericApplicationContext('shell');
        const existing = new GenericApplicationContext('todo');

        const result = createFeatureContext(shell, {
            name: 'todo',
            createContext: () => existing,
        });

        expect(result.context).toBe(existing);
        expect(existing.parent).toBe(shell);

        shell.destroy();
    });

    test('createFeatureContext creates relay gateway for allowlisted events', () => {
        const shell = new GenericApplicationContext('shell');
        const shellListener = vi.fn();

        shell.on('site:nav:badge:update', shellListener);

        const result = createFeatureContext(shell, {
            name: 'todo',
            relays: [
                {
                    from: 'todo:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
        });

        result.context.emit('todo:stats:updated', 3);

        expect(result.gateway).toBeDefined();
        expect(shellListener).toHaveBeenCalledTimes(1);
        expect(shellListener).toHaveBeenCalledWith(3);

        result.gateway?.destroy();
        shell.destroy();
    });

    test('createFeatureContext should accept gateway options and diagnostics hooks', () => {
        const shell = new GenericApplicationContext('shell');
        const onRelayBlocked = vi.fn();

        const result = createFeatureContext(shell, {
            name: 'todo',
            relays: [
                {
                    from: 'admin:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
            gatewayOptions: {
                diagnosticHandler: {
                    onRelayBlocked,
                },
                validationStrategy: new NamespaceRelayValidationStrategy({
                    featureNamespace: 'todo',
                }),
            },
        });

        expect(result.gateway).toBeDefined();
        expect(result.gateway?.hasBlockedRelays()).toBe(true);
        expect(onRelayBlocked).toHaveBeenCalledTimes(1);

        shell.destroy();
    });

    test('unmountFeatureContext should preserve feature context by default', () => {
        const shell = new GenericApplicationContext('shell');
        const feature = createFeatureContext(shell, {
            name: 'todo',
            relays: [
                {
                    from: 'todo:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
        });

        unmountFeatureContext(feature);

        expect(feature.gateway?.destroyed).toBe(true);
        expect(feature.context.destroyed).toBe(false);

        shell.destroy();
    });

    test('unmountFeatureContext should close feature context when close policy is used', () => {
        const shell = new GenericApplicationContext('shell');
        const feature = createFeatureContext(shell, {
            name: 'todo',
            relays: [
                {
                    from: 'todo:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
        });

        unmountFeatureContext(feature, 'close');

        expect(feature.gateway?.destroyed).toBe(true);
        expect(feature.context.destroyed).toBe(true);

        shell.destroy();
    });

    test('traverseToRoot walks bottom-up including root', () => {
        const root = new GenericApplicationContext('root');
        const child = root.newChild('child');
        const grandchild = child.newChild('grandchild');
        const visited: string[] = [];

        traverseToRoot(grandchild, (node) => visited.push(node.name));

        expect(visited).toEqual(['grandchild', 'child', 'root']);

        root.destroy();
    });

    test('traverseSubtree walks depth-first top-down', () => {
        const root = new GenericApplicationContext('root');
        const featureA = root.newChild('featureA');
        const featureB = root.newChild('featureB');

        featureA.newChild('featureA-nested');

        const visited: string[] = [];

        traverseSubtree(root, (node) => visited.push(node.name));

        expect(visited).toEqual(['root', 'featureA', 'featureA-nested', 'featureB']);

        root.destroy();
    });

    test('traverseToRoot ignores false visitor results and remains inclusive', () => {
        const root = new GenericApplicationContext('root');
        const child = root.newChild('child');
        const grandchild = child.newChild('grandchild');
        const start: ChildNode<ApplicationContext> = grandchild;
        const visited: string[] = [];

        traverseToRoot(grandchild, (node) => {
            visited.push(node.name);
            return false;
        });

        expect(start.parent).toBe(child);
        expect(visited).toEqual(['grandchild', 'child', 'root']);
        root.destroy();
    });

    test('traverseSubtree ignores false visitor results without pruning descendants or siblings', () => {
        const root = new GenericApplicationContext('root');
        const first = root.newChild('first');
        first.newChild('nested');
        root.newChild('second');
        const start: ParentNode<ApplicationContext> = root;
        const visited: string[] = [];

        traverseSubtree(root, (node) => {
            visited.push(node.name);
            return false;
        });

        expect(start.children.map((node) => node.name)).toEqual(['first', 'second']);
        expect(visited).toEqual(['root', 'first', 'nested', 'second']);
        root.destroy();
    });

    test('traverseSubtree visits siblings appended during traversal', () => {
        const root = new GenericApplicationContext('root');
        root.newChild('first');
        const visited: string[] = [];

        traverseSubtree(root, (node) => {
            visited.push(node.name);
            if (node.name === 'first') {
                root.newChild('appended');
            }
        });

        expect(visited).toEqual(['root', 'first', 'appended']);
        root.destroy();
    });

    test('findAncestor excludes self and returns the nearest matching ancestor', () => {
        const root = new GenericApplicationContext('match-root');
        const parent = root.newChild('match-parent');
        const child = parent.newChild('match-child');

        expect(findAncestor(child, (node) => node.name.startsWith('match'))).toBe(parent);
        expect(findAncestor(root, () => true)).toBeUndefined();
        root.destroy();
    });

    test('findDescendants searches through nonmatching ancestors in depth-first order', () => {
        const root = new GenericApplicationContext('match-root');
        const first = root.newChild('first');
        first.newChild('match-nested');
        root.newChild('match-sibling');

        expect(findDescendants(root, (node) => node.name.startsWith('match')).map((node) => node.name)).toEqual([
            'match-nested',
            'match-sibling',
        ]);
        root.destroy();
    });

    test('findAncestor returns first matching ancestor', () => {
        const root = new GenericApplicationContext('root');
        const shell = root.newChild('shell');
        const feature = shell.newChild('todo');

        const found = findAncestor(feature, (node) => node.name === 'root');

        expect(found).toBe(root);

        root.destroy();
    });

    test('findDescendants returns matches and excludes root', () => {
        const root = new GenericApplicationContext('root');

        root.newChild('todo');
        root.newChild('account');
        root.newChild('reports');

        const matched = findDescendants(root, (node) => node.name.startsWith('a') || node.name.startsWith('r'));

        expect(matched.map((node) => node.name)).toEqual(['account', 'reports']);

        root.destroy();
    });
});

describe('context hierarchy helpers — edge cases', () => {
    test('traverseSubtree visits a leaf node with no children', () => {
        const root = new GenericApplicationContext('root');
        const visited: string[] = [];

        traverseSubtree(root, (node) => visited.push(node.name));

        expect(visited).toEqual(['root']);

        root.destroy();
    });

    test('findAncestor returns null when no match is found', () => {
        const root = new GenericApplicationContext('root');
        const child = root.newChild('child');

        const result = findAncestor(child, (node) => node.name === 'nonexistent');

        expect(result).toBeUndefined();

        root.destroy();
    });

    test('findDescendants returns empty array when no children match', () => {
        const root = new GenericApplicationContext('root');
        root.newChild('alpha');
        root.newChild('beta');

        const matched = findDescendants(root, (node) => node.name === 'nonexistent');

        expect(matched).toEqual([]);

        root.destroy();
    });
});
