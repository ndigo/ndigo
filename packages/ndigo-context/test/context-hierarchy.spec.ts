/**
 */
import { describe, expect, test, vi } from 'vitest';
import { StaticContentSource } from '@ndigo/content';
import { GenericApplicationContext } from '../src/context';
import { createFeatureContext, createShellContext, unmountFeatureContext } from '../src/context-hierarchy';
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
});
