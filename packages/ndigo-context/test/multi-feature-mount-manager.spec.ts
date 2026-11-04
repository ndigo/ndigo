/**
 * @module ndigo-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test, vi } from 'vitest';
import { GenericApplicationContext } from '../src/context';
import { FeatureContextMountManager } from '../src/feature-context-mount-manager';

describe('FeatureContextMountManager multi-feature simulation', () => {
    test('it should isolate mount and relay churn across todo/account features', () => {
        const shell = new GenericApplicationContext('shell');
        const siteNavListener = vi.fn();

        shell.on('site:nav:badge:update', siteNavListener);

        const manager = new FeatureContextMountManager(shell);

        manager.registerFeature({
            name: 'todo',
            relays: [
                {
                    from: 'todo:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
            unmountPolicy: 'preserve',
        });

        manager.registerFeature({
            name: 'account',
            relays: [
                {
                    from: 'account:stats:updated',
                    to: 'site:nav:badge:update',
                },
            ],
            unmountPolicy: 'close',
        });

        const todoFirstMount = manager.mount('todo');
        const accountFirstMount = manager.mount('account');

        todoFirstMount.context.emit('todo:stats:updated', 1);
        accountFirstMount.context.emit('account:stats:updated', 2);

        expect(siteNavListener).toHaveBeenCalledTimes(2);

        manager.unmount('todo');
        manager.unmount('account');

        expect(todoFirstMount.context.destroyed).toBe(false);
        expect(accountFirstMount.context.destroyed).toBe(true);

        const todoSecondMount = manager.mount('todo');
        const accountSecondMount = manager.mount('account');

        expect(todoSecondMount.context).toBe(todoFirstMount.context);
        expect(accountSecondMount.context).not.toBe(accountFirstMount.context);

        todoSecondMount.context.emit('todo:stats:updated', 3);
        accountSecondMount.context.emit('account:stats:updated', 4);

        expect(siteNavListener).toHaveBeenCalledTimes(4);

        manager.destroy();
        shell.destroy();
    });
});
