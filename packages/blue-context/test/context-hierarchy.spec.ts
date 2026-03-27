import { describe, expect, test, vi } from 'vitest';
import { StaticContentSource } from '@blue/content';
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
                appName: 'BlueSite',
            },
            contentSource: new StaticContentSource(),
            themeName: 'night',
        });

        expect(context.name).toBe('site-shell');
        expect(context.getValue('appName')).toBe('BlueSite');
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
